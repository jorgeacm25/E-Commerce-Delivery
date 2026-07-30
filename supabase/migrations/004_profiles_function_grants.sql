-- ============================================================
-- Endurecer permisos de las funciones de soporte de `profiles`
-- ============================================================
-- Postgres otorga EXECUTE a PUBLIC por defecto al crear una función, lo que
-- expone handle_new_user() y protect_profile_privileged_columns() como
-- endpoints RPC llamables por anon/authenticated (detectado por el linter
-- de seguridad de Supabase). Ambas son funciones de trigger (retornan
-- `trigger`, referencian NEW/OLD): revocar EXECUTE no afecta que sigan
-- disparándose como triggers (el motor de triggers no pasa por el chequeo
-- de privilegio de EXECUTE), solo impide invocarlas directamente vía
-- `/rest/v1/rpc/...`.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_privileged_columns() from public, anon, authenticated;

-- is_admin() sí debe seguir siendo ejecutable por anon/authenticated: las
-- políticas de RLS de `profiles` la invocan en nombre de quien hace la
-- consulta. Sin este permiso, cualquier SELECT sobre profiles fallaría con
-- un error de privilegio en vez de evaluar la política.
grant execute on function public.is_admin() to anon, authenticated;
