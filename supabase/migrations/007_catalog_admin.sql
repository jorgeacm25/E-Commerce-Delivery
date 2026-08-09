-- ============================================================
-- Migración: catálogo real del dominio comida (categorías/productos/variantes)
-- ============================================================
-- Hasta hoy la tienda pública sirve un catálogo 100% simulado
-- (src/services/catalog.service.ts + src/data/catalog.mock.ts) y la única
-- tabla real de productos en Supabase es del dominio legacy "celulares"
-- (products/variants, brand/color/storage, sin categorías) — ver
-- docs/PROJECT_STATE.md riesgo 12. Decisión explícita del usuario: crear
-- tablas nuevas para el dominio de alimentos, nombradas `catalog_*` para no
-- chocar con `products`/`variants` legacy, con forma espejada a
-- CatalogProduct/CatalogCategory (src/interfaces/catalog.interface.ts) para
-- que una fase futura pueda reconectar la tienda pública a datos reales.
-- Esta migración solo alimenta el panel admin nuevo; la tienda pública
-- sigue en mock hasta esa fase futura (fuera de alcance aquí).

create table catalog_categories (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    name text not null,
    image_url text,
    description text,
    display_order int not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger catalog_categories_set_updated_at
    before update on catalog_categories
    for each row execute function public.set_updated_at();

create table catalog_products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references catalog_categories(id),
    slug text not null unique,
    name text not null,
    description text not null default '',
    images text[] not null default '{}',
    unit text not null default 'unidad',
    weight_or_unit_label text not null default '',
    price_usd numeric not null check (price_usd >= 0),
    -- Costo/margen: solo para uso interno del admin, nunca deben mostrarse
    -- al cliente. Ver caveat de exposición por RLS más abajo.
    cost_cup numeric check (cost_cup is null or cost_cup >= 0),
    margin_usd numeric check (margin_usd is null or margin_usd >= 0),
    pricing_mode text not null default 'fixed'
        check (pricing_mode in ('fixed', 'auto')),
    stock int not null default 0 check (stock >= 0),
    -- Sin FK: no existe todavía una tabla real de zonas de entrega (solo
    -- mock en src/data/home.mock.ts) — mismo precedente que
    -- favorites.product_id en 005_customer_account.sql.
    delivery_zone_ids text[] not null default '{}',
    popularity_score numeric not null default 0,
    -- Archivar, no hay hard-delete en v1 (evita romper combos/pedidos que
    -- referencien el producto).
    is_active boolean not null default true,
    created_by uuid references profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index catalog_products_category_id_idx on catalog_products(category_id);
create index catalog_products_is_active_idx on catalog_products(is_active);

create trigger catalog_products_set_updated_at
    before update on catalog_products
    for each row execute function public.set_updated_at();

create table catalog_product_variants (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references catalog_products(id) on delete cascade,
    -- Reemplazo genérico de color/storage (celulares): "Paquete 5 lb", "Caja x12"...
    label text not null,
    price_usd numeric not null check (price_usd >= 0),
    stock int not null default 0 check (stock >= 0),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index catalog_product_variants_product_id_idx on catalog_product_variants(product_id);

create trigger catalog_product_variants_set_updated_at
    before update on catalog_product_variants
    for each row execute function public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table catalog_categories enable row level security;
alter table catalog_products enable row level security;
alter table catalog_product_variants enable row level security;

-- Lectura pública: solo filas activas (catálogo sin login, cuando se
-- reconecte la tienda pública a estas tablas en una fase futura).
create policy "catalog_categories_select_publico" on catalog_categories
    for select using (is_active = true);

create policy "catalog_products_select_publico" on catalog_products
    for select using (is_active = true);

create policy "catalog_product_variants_select_publico" on catalog_product_variants
    for select using (is_active = true);

-- Staff (admin u operador): lee todo (incluye inactivos) y escribe.
create policy "catalog_categories_staff_all" on catalog_categories
    for all using (public.is_staff()) with check (public.is_staff());

create policy "catalog_products_staff_all" on catalog_products
    for all using (public.is_staff()) with check (public.is_staff());

create policy "catalog_product_variants_staff_all" on catalog_product_variants
    for all using (public.is_staff()) with check (public.is_staff());

-- ============================================================
-- Caveat documentado (no se resuelve en esta migración)
-- ============================================================
-- RLS es a nivel de fila, no de columna: la policy pública de lectura de
-- una fila activa también expone cost_cup/margin_usd/pricing_mode si el
-- cliente hace select('*'). Hoy esto no es explotable (la tienda pública
-- sigue en mock, ningún código público consulta catalog_products todavía).
-- Cuando se reconecte el catálogo público a estas tablas, reemplazar el
-- acceso público por una vista `catalog_products_public` que exponga solo
-- columnas seguras para cliente (sin cost_cup/margin_usd/pricing_mode/
-- created_by), en vez de confiar en que el código público nunca pida '*'.
