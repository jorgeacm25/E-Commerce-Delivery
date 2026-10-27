-- El bucket 'product-images' nunca se creó en el proyecto real, aunque
-- src/services/adminProducts.service.ts (uploadProductImages) siempre
-- asumió que existía (supabase.storage.from('product-images').upload/
-- getPublicUrl) — cualquier subida de imagen de producto fallaba contra un
-- bucket inexistente. Se crea público (el código usa getPublicUrl, no URLs
-- firmadas) y, como el cliente de Supabase de esta app corre siempre como
-- `anon` (login 100% .NET, ver docs/PROJECT_STATE.md), se agregan políticas
-- para `anon` en insert/select/delete — mismo patrón que
-- 009_payment_proofs_storage_anon.sql: Supabase Storage como blob puro, la
-- autorización real vive en el backend .NET + rutas admin.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "anon_sube_imagen_producto"
on storage.objects for insert
to anon
with check (bucket_id = 'product-images');

create policy "anon_lee_imagen_producto"
on storage.objects for select
to anon
using (bucket_id = 'product-images');

create policy "anon_borra_imagen_producto"
on storage.objects for delete
to anon
using (bucket_id = 'product-images');
