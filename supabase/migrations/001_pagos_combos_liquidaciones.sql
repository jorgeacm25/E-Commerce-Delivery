-- ============================================================
-- Migración: Pagos verificados, combos, tasa de cambio y liquidaciones
-- ============================================================

-- 1. TASA DE CAMBIO -------------------------------------------------
create table exchange_rates (
    id uuid primary key default gen_random_uuid(),
    valor_cup_por_usd numeric not null check (valor_cup_por_usd > 0),
    vigente_desde timestamptz not null default now(),
    creado_por uuid references auth.users(id)
);

-- Solo la más reciente es la "activa" -> se resuelve por vigente_desde desc limit 1
create index idx_exchange_rates_vigente on exchange_rates (vigente_desde desc);

-- 2. CUENTAS DE COBRO (Zelle / PayPal rotativas) ---------------------
create table payment_accounts (
    id uuid primary key default gen_random_uuid(),
    tipo text not null check (tipo in ('zelle', 'paypal')),
    titular text not null,
    referencia text not null, -- email o teléfono según el tipo
    activa boolean not null default true,
    prioridad int not null default 0,
    created_at timestamptz not null default now()
);

create index idx_payment_accounts_activa on payment_accounts (activa, prioridad);

-- 3. AMPLIAR ORDERS: separar estado logístico de estado de pago -----
alter table orders
    add column payment_status text not null default 'pending'
        check (payment_status in ('pending', 'proof_uploaded', 'confirmed', 'rejected')),
    add column currency text not null default 'USD' check (currency in ('USD', 'CUP')),
    add column total_cup numeric,
    add column exchange_rate_id uuid references exchange_rates(id);

-- Renombramos el uso conceptual: orders.status pasa a ser el estado logístico
-- (pending -> preparing -> shipped -> delivered -> cancelled), se mantiene el mismo campo
-- para no romper el código existente de updateOrderStatus / getAllOrders.

-- 4. COMPROBANTES DE PAGO --------------------------------------------
create table payment_proofs (
    id uuid primary key default gen_random_uuid(),
    order_id bigint not null references orders(id) on delete cascade,
    payment_account_id uuid references payment_accounts(id),
    imagen_url text not null,
    estado text not null default 'pendiente'
        check (estado in ('pendiente', 'confirmado', 'rechazado')),
    operador_id uuid references auth.users(id),
    nota_operador text,
    created_at timestamptz not null default now(),
    reviewed_at timestamptz
);

create index idx_payment_proofs_order on payment_proofs (order_id);
create index idx_payment_proofs_estado on payment_proofs (estado);

-- 5. COMBOS ------------------------------------------------------------
create table combos (
    id uuid primary key default gen_random_uuid(),
    nombre text not null,
    slug text not null unique,
    descripcion text,
    precio_combo_usd numeric not null check (precio_combo_usd >= 0),
    activo boolean not null default true,
    created_at timestamptz not null default now()
);

create table combo_items (
    id uuid primary key default gen_random_uuid(),
    combo_id uuid not null references combos(id) on delete cascade,
    variant_id uuid not null references variants(id),
    cantidad int not null default 1 check (cantidad > 0)
);

create index idx_combo_items_combo on combo_items (combo_id);

-- 6. REPARTO / LIQUIDACIONES --------------------------------------------
create table delivery_roles (
    id uuid primary key default gen_random_uuid(),
    nombre text not null unique, -- ej: 'mensajero', 'vendedor', 'dueño'
    porcentaje numeric not null check (porcentaje >= 0 and porcentaje <= 100),
    activo boolean not null default true
);

create table liquidations (
    id uuid primary key default gen_random_uuid(),
    order_id bigint not null references orders(id) on delete cascade,
    delivery_role_id uuid not null references delivery_roles(id),
    monto_calculado numeric not null,
    pagado boolean not null default false,
    periodo date not null default current_date,
    created_at timestamptz not null default now()
);

create index idx_liquidations_periodo on liquidations (periodo);
create index idx_liquidations_role on liquidations (delivery_role_id);

-- ============================================================
-- RLS (Row Level Security) - se activa por defecto en Supabase
-- ============================================================
alter table exchange_rates enable row level security;
alter table payment_accounts enable row level security;
alter table payment_proofs enable row level security;
alter table combos enable row level security;
alter table combo_items enable row level security;
alter table delivery_roles enable row level security;
alter table liquidations enable row level security;

-- Lectura pública de combos activos y cuentas activas (necesario para el checkout)
create policy "combos_select_publico" on combos
    for select using (activo = true);

create policy "combo_items_select_publico" on combo_items
    for select using (true);

create policy "payment_accounts_select_publico" on payment_accounts
    for select using (activa = true);

create policy "exchange_rates_select_publico" on exchange_rates
    for select using (true);

-- El resto (payment_proofs, liquidations, delivery_roles, escritura en combos/cuentas)
-- se restringe a usuarios con rol 'admin' en user_roles.
-- Nota: ajustar el nombre exacto del rol si en tu tabla user_roles usas otro valor.

create policy "admin_full_access_payment_proofs" on payment_proofs
    for all using (
        exists (
            select 1 from user_roles
            where user_roles.user_id = auth.uid()
            and user_roles.role = 'admin'
        )
    );

create policy "admin_full_access_liquidations" on liquidations
    for all using (
        exists (
            select 1 from user_roles
            where user_roles.user_id = auth.uid()
            and user_roles.role = 'admin'
        )
    );

create policy "admin_full_access_delivery_roles" on delivery_roles
    for all using (
        exists (
            select 1 from user_roles
            where user_roles.user_id = auth.uid()
            and user_roles.role = 'admin'
        )
    );

create policy "admin_write_payment_accounts" on payment_accounts
    for insert with check (
        exists (
            select 1 from user_roles
            where user_roles.user_id = auth.uid()
            and user_roles.role = 'admin'
        )
    );

create policy "admin_update_payment_accounts" on payment_accounts
    for update using (
        exists (
            select 1 from user_roles
            where user_roles.user_id = auth.uid()
            and user_roles.role = 'admin'
        )
    );

create policy "admin_write_combos" on combos
    for insert with check (
        exists (
            select 1 from user_roles
            where user_roles.user_id = auth.uid()
            and user_roles.role = 'admin'
        )
    );

create policy "admin_update_combos" on combos
    for update using (
        exists (
            select 1 from user_roles
            where user_roles.user_id = auth.uid()
            and user_roles.role = 'admin'
        )
    );

create policy "admin_write_exchange_rates" on exchange_rates
    for insert with check (
        exists (
            select 1 from user_roles
            where user_roles.user_id = auth.uid()
            and user_roles.role = 'admin'
        )
    );

-- Los clientes autenticados pueden insertar su propio comprobante (subida desde checkout)
create policy "cliente_insert_payment_proof" on payment_proofs
    for insert with check (auth.uid() is not null);
