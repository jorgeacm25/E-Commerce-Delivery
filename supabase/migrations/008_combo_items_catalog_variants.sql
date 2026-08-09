-- ============================================================
-- Migración: combos armables con el catálogo nuevo (catalog_product_variants)
-- ============================================================
-- combo_items.variant_id apuntaba solo a `variants` (dominio celulares,
-- 000_base_schema.sql). Si el panel admin nuevo permite crear productos en
-- `catalog_products`/`catalog_product_variants` (007_catalog_admin.sql) pero
-- el armador de combos solo pudiera elegir variantes de celulares, Combos y
-- Productos quedarían desconectados dentro de la misma fase. Se agrega una
-- columna alternativa en vez de migrar/eliminar la columna vieja: no hay
-- datos de producción reales todavía (proyecto sin tráfico, ver
-- docs/PROJECT_STATE.md), así que no hace falta backfill, pero tampoco hay
-- necesidad de rehacer el esquema desde cero.

alter table combo_items
    add column catalog_variant_id uuid references catalog_product_variants(id);

alter table combo_items
    alter column variant_id drop not null;

-- Exactamente una de las dos referencias debe estar presente por fila.
alter table combo_items
    add constraint combo_items_variant_ref_check
        check (num_nonnulls(variant_id, catalog_variant_id) = 1);

create index combo_items_catalog_variant_id_idx on combo_items(catalog_variant_id);
