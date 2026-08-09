-- ============================================================
-- Corrección: políticas admin de 000/001 seguían revisando `user_roles`
-- ============================================================
-- Hallazgo (fase de panel admin, ver docs/PROJECT_STATE.md): el flujo de
-- registro conectado hoy (`src/services/auth.service.ts`, usado por
-- `/registrarse`) solo crea una fila en `profiles` (trigger
-- `handle_new_user`, 003_profiles.sql). Nunca escribe en `user_roles` — esa
-- tabla solo la poblaba el flujo legacy desconectado
-- (`src/actions/auth.ts`, sin ruta que lo use). Resultado: las políticas
-- "admin_full_*"/"admin_write_*" definidas en 000_base_schema.sql y
-- 001_pagos_combos_liquidaciones.sql, que revisan `user_roles`, nunca se
-- cumplen para un usuario real con `profiles.role = 'admin'` u
-- `'operador'`. Sin esta migración, el panel admin nuevo (`/admin`) no
-- podría leer ni escribir pedidos/combos/comprobantes de pago aunque la UI
-- esté bien construida.
--
-- Se introduce `is_staff()` (admin u operador) como la función de
-- autorización de estas tablas, siguiendo el mismo patrón `security
-- definer` que `is_admin()` (003_profiles.sql). `is_admin()` se mantiene
-- para lo que debe seguir siendo admin-only.
--
-- No se toca `liquidations`/`delivery_roles` (Fase E/F, fuera de alcance)
-- ni las políticas admin legacy de `products`/`variants`/`customers`/
-- `addresses` (dominio celulares, no usado por el panel nuevo).

-- ============================================================
-- Función auxiliar: ¿el usuario autenticado actual es staff (admin u operador)?
-- ============================================================
create function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1 from profiles
        where id = auth.uid() and role in ('admin', 'operador')
    );
$$;

revoke execute on function public.is_staff() from public;
grant execute on function public.is_staff() to anon, authenticated;

-- ============================================================
-- orders / order_items
-- ============================================================
drop policy if exists "admin_full_orders" on orders;
create policy "admin_full_orders" on orders
    for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "admin_full_order_items" on order_items;
create policy "admin_full_order_items" on order_items
    for all using (public.is_staff()) with check (public.is_staff());

-- ============================================================
-- combos / combo_items
-- ============================================================
-- Antes: solo insert/update con check a user_roles, sin select "ver todos"
-- (getAllCombosAdmin necesita ver combos inactivos) ni delete (deleteCombo
-- fallaría). Se reemplaza por una sola policy "for all" con is_staff(),
-- que cubre select/insert/update/delete.
drop policy if exists "admin_write_combos" on combos;
drop policy if exists "admin_update_combos" on combos;
create policy "admin_full_combos" on combos
    for all using (public.is_staff()) with check (public.is_staff());

-- combo_items nunca tuvo policy de escritura (gap real, no solo tabla
-- equivocada): solo existía "combo_items_select_publico" (select true).
create policy "admin_write_combo_items" on combo_items
    for insert with check (public.is_staff());
create policy "admin_update_combo_items" on combo_items
    for update using (public.is_staff()) with check (public.is_staff());
create policy "admin_delete_combo_items" on combo_items
    for delete using (public.is_staff());

-- ============================================================
-- payment_proofs / payment_accounts
-- ============================================================
drop policy if exists "admin_full_access_payment_proofs" on payment_proofs;
create policy "admin_full_access_payment_proofs" on payment_proofs
    for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "admin_write_payment_accounts" on payment_accounts;
create policy "admin_write_payment_accounts" on payment_accounts
    for insert with check (public.is_staff());

drop policy if exists "admin_update_payment_accounts" on payment_accounts;
create policy "admin_update_payment_accounts" on payment_accounts
    for update using (public.is_staff()) with check (public.is_staff());

-- ============================================================
-- exchange_rates
-- ============================================================
-- Confirmado con el usuario: admin y operador pueden actualizar la tasa de
-- cambio vigente (no solo admin).
drop policy if exists "admin_write_exchange_rates" on exchange_rates;
create policy "admin_write_exchange_rates" on exchange_rates
    for insert with check (public.is_staff());
