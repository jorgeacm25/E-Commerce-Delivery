-- ============================================================
-- Migración: área privada del cliente (destinatarios, direcciones,
-- favoritos, casos de soporte)
-- ============================================================
-- 4 tablas nuevas, todas ligadas a `profiles` (no a las tablas legacy
-- `customers`/`addresses` del dominio "celulares", ver docs/PROJECT_STATE.md
-- y docs/ARCHITECTURE.md). RLS: cada cliente solo lee/escribe sus propias
-- filas (auth.uid() = profile_id); los admins pueden leer cualquiera
-- (solo lectura, mismo patrón que profiles_select_admin en
-- 003_profiles.sql), como preparación para el futuro panel admin.
--
-- Nota: `favorites.product_id` referencia un slug del catálogo simulado
-- (src/services/catalog.service.ts), no una fila real de una tabla
-- `products` del dominio de comida (esa tabla no existe todavía) — la fila
-- de favorito en sí queda 100% protegida por RLS, solo el producto
-- referenciado es mock, igual que el resto del catálogo público hoy.

-- ============================================================
-- Función compartida: bump de updated_at
-- ============================================================
create function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

-- ============================================================
-- Direcciones del cliente
-- ============================================================
create table customer_addresses (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references profiles(id) on delete cascade,
    label text,
    province text not null,
    municipality text not null,
    address_line text not null,
    reference_notes text,
    is_default boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index customer_addresses_profile_id_idx on customer_addresses(profile_id);

create trigger customer_addresses_set_updated_at
    before update on customer_addresses
    for each row execute function public.set_updated_at();

alter table customer_addresses enable row level security;

create policy "customer_addresses_select_own" on customer_addresses
    for select using (auth.uid() = profile_id);

create policy "customer_addresses_insert_own" on customer_addresses
    for insert with check (auth.uid() = profile_id);

create policy "customer_addresses_update_own" on customer_addresses
    for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "customer_addresses_delete_own" on customer_addresses
    for delete using (auth.uid() = profile_id);

create policy "customer_addresses_select_admin" on customer_addresses
    for select using (public.is_admin());

-- ============================================================
-- Destinatarios del cliente (en Cuba)
-- ============================================================
create table customer_recipients (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references profiles(id) on delete cascade,
    full_name text not null,
    phone text not null,
    national_id text,
    province text not null,
    municipality text not null,
    address_line text not null,
    notes text,
    is_default boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index customer_recipients_profile_id_idx on customer_recipients(profile_id);

create trigger customer_recipients_set_updated_at
    before update on customer_recipients
    for each row execute function public.set_updated_at();

alter table customer_recipients enable row level security;

create policy "customer_recipients_select_own" on customer_recipients
    for select using (auth.uid() = profile_id);

create policy "customer_recipients_insert_own" on customer_recipients
    for insert with check (auth.uid() = profile_id);

create policy "customer_recipients_update_own" on customer_recipients
    for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "customer_recipients_delete_own" on customer_recipients
    for delete using (auth.uid() = profile_id);

create policy "customer_recipients_select_admin" on customer_recipients
    for select using (public.is_admin());

-- ============================================================
-- Favoritos
-- ============================================================
create table favorites (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references profiles(id) on delete cascade,
    product_id text not null,
    created_at timestamptz not null default now(),
    unique (profile_id, product_id)
);

create index favorites_profile_id_idx on favorites(profile_id);

alter table favorites enable row level security;

create policy "favorites_select_own" on favorites
    for select using (auth.uid() = profile_id);

create policy "favorites_insert_own" on favorites
    for insert with check (auth.uid() = profile_id);

create policy "favorites_delete_own" on favorites
    for delete using (auth.uid() = profile_id);

create policy "favorites_select_admin" on favorites
    for select using (public.is_admin());

-- ============================================================
-- Casos de soporte
-- ============================================================
create table support_cases (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references profiles(id) on delete cascade,
    category text not null
        check (category in ('pedido', 'pago', 'entrega', 'producto', 'otro')),
    subject text not null,
    message text not null,
    order_reference text,
    status text not null default 'abierto'
        check (status in ('abierto', 'en_proceso', 'resuelto', 'cerrado')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index support_cases_profile_id_idx on support_cases(profile_id);

-- El cliente puede crear/leer sus casos, pero no cambiar su propio estado
-- (solo un admin, vía is_admin()) — mismo patrón que
-- protect_profile_privileged_columns en 003_profiles.sql.
create function public.protect_support_case_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        new.status := old.status;
    end if;

    new.updated_at := now();
    return new;
end;
$$;

create trigger support_cases_protect_status
    before update on support_cases
    for each row execute function public.protect_support_case_status();

alter table support_cases enable row level security;

create policy "support_cases_select_own" on support_cases
    for select using (auth.uid() = profile_id);

create policy "support_cases_insert_own" on support_cases
    for insert with check (auth.uid() = profile_id);

create policy "support_cases_update_own" on support_cases
    for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "support_cases_select_admin" on support_cases
    for select using (public.is_admin());

-- ============================================================
-- Endurecer permisos de las funciones de trigger nuevas (mismo motivo que
-- 004_profiles_function_grants.sql: Postgres otorga EXECUTE a PUBLIC por
-- defecto, lo que las expondría como endpoints RPC).
-- ============================================================
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.protect_support_case_status() from public, anon, authenticated;
