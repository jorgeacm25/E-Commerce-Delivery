-- ============================================================
-- Migración: perfiles de usuario (Supabase Auth)
-- ============================================================
-- Tabla profiles: 1 fila por usuario de auth.users, creada automáticamente
-- al registrarse (trigger handle_new_user). Consolida los datos mínimos de
-- perfil (nombre, teléfono, rol, estado) que hoy usan las páginas nuevas de
-- autenticación (src/pages/public/LoginPage|RegisterPage|...). No reemplaza
-- ni borra las tablas legacy `customers`/`user_roles` (dominio "celulares",
-- ver docs/PROJECT_STATE.md): conviven hasta que se decida una migración de
-- datos explícita.

create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null default '',
    phone text,
    role text not null default 'customer'
        check (role in ('customer', 'admin', 'operador', 'mensajero')),
    status text not null default 'active'
        check (status in ('active', 'suspended')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- Función auxiliar: ¿el usuario autenticado actual es admin?
-- ============================================================
-- security definer + search_path fijo para poder leer profiles sin quedar
-- sujeta a las propias políticas de RLS que definimos abajo (si no, las
-- políticas de admin caerían en referencia circular consigo mismas).
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1 from profiles where id = auth.uid() and role = 'admin'
    );
$$;

-- ============================================================
-- Trigger: crear el perfil automáticamente al registrarse
-- ============================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, full_name, phone)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'full_name', ''),
        new.raw_user_meta_data ->> 'phone'
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ============================================================
-- Trigger: updated_at + proteger columnas privilegiadas (role/status)
-- ============================================================
-- Un usuario normal puede modificar su propio full_name/phone, pero no
-- puede auto-otorgarse rol admin ni cambiar su propio estado. Solo un admin
-- (validado con is_admin(), no con el valor que venga en la fila nueva)
-- puede cambiar esas dos columnas.
create function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        new.role := old.role;
        new.status := old.status;
    end if;

    new.updated_at := now();
    return new;
end;
$$;

create trigger profiles_protect_privileged_columns
    before update on profiles
    for each row execute function public.protect_profile_privileged_columns();

-- ============================================================
-- RLS
-- ============================================================
alter table profiles enable row level security;

-- Cada usuario lee y actualiza únicamente su propia fila.
create policy "profiles_select_own" on profiles
    for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
    for update using (auth.uid() = id)
    with check (auth.uid() = id);

-- Los administradores pueden consultar (solo lectura) cualquier perfil.
create policy "profiles_select_admin" on profiles
    for select using (public.is_admin());
