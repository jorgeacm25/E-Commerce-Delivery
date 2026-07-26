-- ============================================================
-- Esquema base (equivalente al repo de referencia Ecommerce-CelularesBaratos)
-- ============================================================

create extension if not exists pgcrypto;

-- CUSTOMERS -----------------------------------------------------------
create table customers (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    full_name text not null,
    email text not null,
    phone text,
    created_at timestamptz not null default now()
);

create unique index idx_customers_user_id on customers (user_id);

-- ADDRESSES -------------------------------------------------------------
create table addresses (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references customers(id) on delete cascade,
    address_line1 text not null,
    address_line2 text,
    city text not null,
    state text not null,
    postal_code text,
    country text not null default 'Cuba',
    created_at timestamptz not null default now()
);

create index idx_addresses_customer on addresses (customer_id);

-- PRODUCTS --------------------------------------------------------------
create table products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    brand text not null,
    slug text not null unique,
    features text[] not null default '{}',
    description jsonb not null default '{}',
    images text[] not null default '{}',
    created_at timestamptz not null default now()
);

-- VARIANTS ----------------------------------------------------------------
create table variants (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references products(id) on delete cascade,
    color text not null,
    color_name text not null,
    storage text not null,
    price numeric not null check (price >= 0),
    stock int not null default 0 check (stock >= 0)
);

create index idx_variants_product on variants (product_id);

-- ORDERS --------------------------------------------------------------------
create table orders (
    id bigint generated always as identity primary key,
    customer_id uuid not null references customers(id),
    address_id uuid not null references addresses(id),
    status text not null default 'Pending',
    total_amount numeric not null check (total_amount >= 0),
    created_at timestamptz not null default now()
);

create index idx_orders_customer on orders (customer_id);

-- ORDER_ITEMS -----------------------------------------------------------------
create table order_items (
    id uuid primary key default gen_random_uuid(),
    order_id bigint not null references orders(id) on delete cascade,
    variant_id uuid not null references variants(id),
    quantity int not null check (quantity > 0),
    price numeric not null check (price >= 0),
    created_at timestamptz not null default now()
);

create index idx_order_items_order on order_items (order_id);

-- USER_ROLES ------------------------------------------------------------------
create table user_roles (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users(id) on delete cascade,
    role text not null check (role in ('admin', 'customer', 'operador', 'mensajero'))
);

create unique index idx_user_roles_user on user_roles (user_id);

-- ============================================================
-- RLS
-- ============================================================
alter table customers enable row level security;
alter table addresses enable row level security;
alter table products enable row level security;
alter table variants enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table user_roles enable row level security;

-- Productos y variantes: lectura pública (catálogo sin login)
create policy "products_select_publico" on products for select using (true);
create policy "variants_select_publico" on variants for select using (true);

-- Customers: cada usuario ve/gestiona solo su propio registro
create policy "customers_select_own" on customers
    for select using (auth.uid() = user_id);
create policy "customers_insert_own" on customers
    for insert with check (auth.uid() = user_id);
create policy "customers_update_own" on customers
    for update using (auth.uid() = user_id);

-- Addresses: solo el dueño (via customers) puede ver/gestionar
create policy "addresses_select_own" on addresses
    for select using (
        exists (select 1 from customers where customers.id = addresses.customer_id and customers.user_id = auth.uid())
    );
create policy "addresses_insert_own" on addresses
    for insert with check (
        exists (select 1 from customers where customers.id = addresses.customer_id and customers.user_id = auth.uid())
    );

-- Orders: el cliente ve solo las suyas
create policy "orders_select_own" on orders
    for select using (
        exists (select 1 from customers where customers.id = orders.customer_id and customers.user_id = auth.uid())
    );
create policy "orders_insert_own" on orders
    for insert with check (
        exists (select 1 from customers where customers.id = orders.customer_id and customers.user_id = auth.uid())
    );

-- Order items: visibles si la orden es del cliente
create policy "order_items_select_own" on order_items
    for select using (
        exists (
            select 1 from orders
            join customers on customers.id = orders.customer_id
            where orders.id = order_items.order_id and customers.user_id = auth.uid()
        )
    );
create policy "order_items_insert_own" on order_items
    for insert with check (
        exists (
            select 1 from orders
            join customers on customers.id = orders.customer_id
            where orders.id = order_items.order_id and customers.user_id = auth.uid()
        )
    );

-- User_roles: cada quien ve su propio rol
create policy "user_roles_select_own" on user_roles
    for select using (auth.uid() = user_id);

-- Admin: acceso total a todo (orders, products, variants, order_items, addresses, customers)
create policy "admin_full_orders" on orders
    for all using (
        exists (select 1 from user_roles where user_roles.user_id = auth.uid() and user_roles.role = 'admin')
    );
create policy "admin_full_order_items" on order_items
    for all using (
        exists (select 1 from user_roles where user_roles.user_id = auth.uid() and user_roles.role = 'admin')
    );
create policy "admin_full_products" on products
    for all using (
        exists (select 1 from user_roles where user_roles.user_id = auth.uid() and user_roles.role = 'admin')
    );
create policy "admin_full_variants" on variants
    for all using (
        exists (select 1 from user_roles where user_roles.user_id = auth.uid() and user_roles.role = 'admin')
    );
create policy "admin_full_customers" on customers
    for all using (
        exists (select 1 from user_roles where user_roles.user_id = auth.uid() and user_roles.role = 'admin')
    );
create policy "admin_full_addresses" on addresses
    for all using (
        exists (select 1 from user_roles where user_roles.user_id = auth.uid() and user_roles.role = 'admin')
    );
