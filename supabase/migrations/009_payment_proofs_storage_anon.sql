-- El bucket 'payment-proofs' quedó con políticas que exigen role
-- `authenticated` + la tabla legacy `user_roles` (ver 'admin_ve_todos_comprobantes',
-- 'cliente_sube_comprobante', 'cliente_ve_su_comprobante'). Desde que el login
-- se movió 100% al backend .NET (ver docs/PROJECT_STATE.md, actualización
-- 2026-08-04), el cliente de Supabase de esta app nunca vuelve a autenticarse
-- contra Supabase Auth — siempre corre como `anon` — así que esas políticas
-- dejaron sin efecto tanto la subida como la lectura de comprobantes: ni un
-- cliente ni un operador podían usarlas.
--
-- Este proyecto ya usa Supabase Storage como blob storage puro para
-- 'product-images' (ver src/services/adminProducts.service.ts): la
-- autorización real vive en el backend .NET (JWT + rutas admin) y en las
-- reglas de UI (RequireAuth), no en Supabase RLS. Se alinea 'payment-proofs'
-- al mismo patrón: anon puede subir y leer objetos de este bucket
-- específico; el bucket sigue siendo privado (no listable/público por URL
-- directa), así que igual hace falta pedir una signed URL para ver una
-- imagen.
drop policy if exists "admin_ve_todos_comprobantes" on storage.objects;
drop policy if exists "cliente_sube_comprobante" on storage.objects;
drop policy if exists "cliente_ve_su_comprobante" on storage.objects;

create policy "anon_sube_comprobante"
on storage.objects for insert
to anon
with check (bucket_id = 'payment-proofs');

create policy "anon_lee_comprobante"
on storage.objects for select
to anon
using (bucket_id = 'payment-proofs');
