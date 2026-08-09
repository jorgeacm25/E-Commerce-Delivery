# Estado del proyecto

> Última actualización: 2026-08-09 (más reciente, misma sesión que las
> entradas de abajo). A pedido explícito del usuario ("arregla la 5"), se
> corrigió el bug de foco reportado en la entrada anterior:
> `Modal.tsx` (`src/components/ui/Modal.tsx`) reenfocaba el panel del
> diálogo en su `useEffect` cada vez que `onClose` cambiaba de referencia
> (estaba en el array de dependencias) — en modales con estado controlado
> por `useState` (re-renderizan en cada tecla, como
> `RegisterProductOutModal.tsx`), eso recreaba `onClose` en cada tecla y
> le robaba el foco al input a mitad de escritura. Arreglo: `onClose` se
> guarda en un `ref` que se actualiza en un efecto aparte sin
> dependencias; el efecto que reenfoca/adjunta el listener de Escape ahora
> solo depende de `isOpen` y lee `onCloseRef.current()`, así nunca queda
> con una versión vieja de `onClose` ni se re-dispara por re-renders del
> contenido. Es un fix en el componente compartido, así que cubre
> cualquier modal futuro con estado controlado, no solo el de Almacén.
> `src/pages/admin/almacen/__tests__/AdminWarehousePage.test.tsx` se
> actualizó para escribir con `user.type` (tecla por tecla) en vez del
> `fireEvent.change` que se había usado como workaround — con el bug
> presente esta prueba habría fallado. Verificado también a mano en el
> navegador: `/admin/almacen` → "Registrar salida" → campo "Motivo" acepta
> `"merma por vencimiento"` completo. `npm run lint`, `npx tsc -b` y
> `npx vitest run` (49 archivos, 243 pruebas) en verde.
>
> Actualización anterior: 2026-08-09. Cerró el último gap documentado de Fase I
> (Configuración): **"Datos de contacto" (WhatsApp) pasó de hardcoded en
> el código a un dato real, editable desde el panel, respaldado por el
> backend .NET.**
> - **Backend** (`Almacen-Delivery-Home_Api_new`, repo separado): entidad
>   nueva `AgencyContactEntity` (`WhatsappPhone`, `VigenteDesde`,
>   `CreadoPorAdminId`), espejando exactamente el patrón ya usado por
>   `ExchangeRateEntity` (cada actualización crea una fila nueva "vigente",
>   no se edita una existente — conserva histórico). `POST /api/agencyContact`
>   (staff), `GET /api/agencyContact/active` (público, 404 si nadie configuró
>   nada todavía). Migración `20260809193050_AddAgencyContact` aplicada.
>   **Al investigar el repo del backend se encontró que tenía ~119 archivos
>   sin commitear** (todo el soporte real de Vendedores/Comisiones,
>   Trabajadores, Remesas, Gastos, Provincias/Municipios, descuento en
>   catálogo y reset de contraseña admin/staff — el backend real detrás de
>   las Fases C-I que esta misma sesión había verificado en el navegador
>   más temprano, más el reset de password de admin/staff que usa
>   `AdminSettingsPage`) — se commiteó todo junto en un solo commit
>   (`AppDbContext`/el snapshot de EF mezclan ese trabajo previo con el de
>   `AgencyContact` de forma no separable limpiamente), mismo criterio que
>   el checkpoint del frontend más abajo.
> - **Frontend**: `src/services/agencyContact.service.ts` +
>   `src/hooks/agencyContact/{useActiveAgencyContact,useUpdateAgencyContact}.ts`
>   (mismo patrón que `useActiveExchangeRate`/`useUpdateExchangeRate`, 404 →
>   `null`). `AdminSettingsPage.tsx`: la sección "Datos de contacto" pasa de
>   un `Input` deshabilitado + alerta "fase futura" a un formulario real
>   (mismo layout que la tasa de cambio). `PublicLayout.tsx` y
>   `ContactSupportSection.tsx` (antes hardcodeaban `DEFAULT_WHATSAPP_PHONE`)
>   ahora usan el valor real vía `useActiveAgencyContact`, con
>   `DEFAULT_WHATSAPP_PHONE` como fallback mientras carga o si nadie
>   configuró nada todavía (no rompe el sitio público en una instalación
>   nueva). Verificado en el navegador: `/admin/configuracion` actualiza el
>   WhatsApp real vía API, y el botón flotante de WhatsApp del sitio
>   público (`wa.me/...`) refleja el número nuevo tras la actualización.
> - **Encontrado de paso, no arreglado (fuera de alcance, delegado a una
>   tarea aparte)**: `RegisterProductOutModal.tsx` (`/admin/almacen`,
>   "Registrar salida") usa estado local controlado en vez de RHF; combinado
>   con el `useEffect([isOpen, onClose])` de `Modal.tsx` que reenfoca el
>   panel en cada render, esto le roba el foco al input en cada tecla — solo
>   entra el primer carácter de cada campo. Es el único modal afectado hoy
>   (el resto usa RHF, no controlado, así que no re-renderiza en cada tecla),
>   pero el bug vive en el componente compartido `Modal`.
> - Se encontró y corrigió también `vitest.config.ts`: no excluía
>   `.claude/worktrees/**` (usado por sesiones/agentes en paralelo), así que
>   Vitest recorría esas copias del repo y duplicaba cada prueba.
> `npm run lint`, `npx tsc -b`, `npm run build` y `npx vitest run` (49
> archivos, 243 pruebas) en verde.
>
> Actualización anterior: 2026-08-09. Sesión de "completar
> módulos incompletos": el working tree traía ~189 archivos sin commitear
> de sesiones anteriores nunca cerradas — el resto de la migración de auth
> a Supabase Auth (borrado de código muerto) y prácticamente todas las
> Fases C-I del roadmap (Almacén, Clientes, Vendedores, Trabajadores,
> Remesas, Contabilidad, Configuración, más Rendimiento/Zonas de entrega/
> Cuentas de pago fuera del roadmap original), ya con backend .NET real y
> `npm run lint`/`build`/`vitest` en verde, pero sin commitear ni
> documentar. Se hizo en 3 pasos:
> 1. **Checkpoint de git**: 2 commits — limpieza del código muerto de la
>    era Supabase Auth (`src/actions/auth.ts`, hooks/layouts/páginas
>    legacy) y el build-out completo de Fases C-I. `.claude/` se agregó a
>    `.gitignore` (config local del agente, no pertenece al repo).
> 2. **Auditoría de completitud** (agente Explore) sobre los módulos de
>    Fases C-I: casi todos ya estaban completos y conectados al backend
>    real (no mock); solo 3 huecos funcionales genuinos, los tres con el
>    endpoint de backend ya construido (`PUT`/`DELETE` en
>    `CustomerController`/`ExpenseController`/`AdminController`/
>    `UserController`), así que cerrarlos fue trabajo de frontend puro:
>    - **Clientes** (`AdminCustomersPage`): editar (nombre/teléfono/
>      contraseña) y eliminar, antes solo listaba.
>    - **Contabilidad** (`AdminAccountingPage`): editar/eliminar gastos —
>      solo aplica a movimientos `type === 'gasto'` (ventas/comisiones/
>      remesas son vistas derivadas de otras entidades, no editables).
>      `LedgerEntry` ganó `sourceId`/`amountCup`/`category` para poder
>      editar sin perder datos que la vista agregada no mostraba.
>    - **Configuración → Administradores y staff**: restablecer
>      contraseña y eliminar cuenta — el backend solo permite reset de
>      password en el Update de Admin/User (no renombrar), así que esa es
>      la única edición real posible. Una cuenta no puede
>      editarse/eliminarse a sí misma desde esta tabla (guarda comparando
>      `account.id` contra `profile.id` de `useAuth()`).
>    Fuera de alcance, ya diferido explícitamente en el propio código (no
>    es un hueco accidental): el bloque "Datos de contacto" (WhatsApp) de
>    Configuración, que necesita tabla nueva en el backend
>    (`AdminSettingsPage.tsx`, alerta visible en la UI), y "Actividad
>    reciente" del dashboard, que sigue en `adminDashboard.mock.ts` por
>    falta de un endpoint de auditoría.
> 3. **Cobertura de pruebas**: los 3 flujos nuevos de arriba se verificaron
>    manualmente en el navegador contra el backend .NET real corriendo en
>    local (editar/eliminar un cliente real, editar/eliminar un gasto
>    real, resetear la contraseña de una cuenta de staff real — confirmado
>    además con un login directo a la API con la contraseña nueva). Se
>    agregaron pruebas de Vitest a los módulos de Fase C-I que no tenían
>    (Almacén, Vendedores, Trabajadores, Remesas, Rendimiento, Zonas de
>    entrega, Cuentas de pago, Clientes, Contabilidad, Configuración),
>    siguiendo el mismo patrón que `adminCategories.service.test.ts`/
>    `AdminCategoriesPage.test.tsx`.
> `npm run lint`, `npm run build` y `npx vitest run` en verde en cada paso.
>
> Actualización anterior: 2026-08-08. Segunda fase del mismo
> programa (ver actualización anterior): "Descuento en catálogo" — precio
> original + precio rebajado en productos y combos, real (no cosmético: el
> carrito cobra el precio con descuento).
> - Backend: campo `DiscountPriceUsd` (decimal? nullable) agregado a
>   `ProductEntity` y `ComboEntity`, expuesto en `POST`/`PUT`/`GET`
>   `/api/product` y `/api/combo`. Validación server-side (`Create`/`Update`
>   de ambos): si se manda, debe ser > 0 y < `SalePriceUsd`, si no
>   `InvalidDiscountPriceError` (400). Migración
>   `20260806023017_AddDiscountPriceToProductAndCombo` — nombre de archivo
>   con timestamp anterior a cuando se aplicó realmente (el reloj del
>   sistema no había avanzado al 06/08 al generar el nombre), no afecta el
>   orden de aplicación real.
> - Frontend admin: `PricingModeFields.tsx` (form de producto) y
>   `AdminComboFormModal.tsx` ganan un switch "Aplicar descuento" + input
>   condicional, con la misma regla de validación en Zod
>   (`adminProductValidators.ts`/`adminComboValidators.ts`). Las tablas de
>   `/admin/productos` y `/admin/combos` muestran el precio con el mismo
>   tratamiento visual (tachado + rebajado).
> - Frontend público: `CurrencyDisplay.tsx` gana un prop `discountedUsd`
>   opcional (precio tachado al lado del rebajado); usado en `ProductCard`
>   (+ badge "Oferta"), `ProductListRow`, `ProductPage` y las tablas admin.
>   `buildCartItem` (`helpers/catalog.ts`) cobra `discountPriceUsd` cuando
>   existe — el descuento afecta el total real del carrito, no solo la
>   vista del catálogo.
> Verificado en el navegador: descuento aplicado a un producto real desde
> `/admin/productos/:id/editar` (validación de precio, guardado, reflejado
> en `/catalogo` y en la ficha del producto con badge "Oferta" y precio
> tachado) y a un combo real desde `/admin/combos` (mismo resultado en
> `/combos`); agregado al carrito y confirmado que cobra el precio con
> descuento, no el original. `npm run lint`, `npm run build` y
> `npx vitest run` (155/155) en verde. Pendientes del mismo pedido:
> marca/apariencia editable, permisos por rol, dashboard configurable.
>
> Actualización anterior: 2026-08-06. Primera fase de un programa más grande a
> pedido del usuario (descuentos, personalización del panel, control
> financiero, zonas de entrega — ver conversación): "Zonas de entrega". El
> backend .NET (Almacen-Delivery-Home_Api_new) no tenía ningún concepto de
> provincia/municipio/tarifa de envío — se agregó real (no simulado):
> - Backend: entidades `ProvinceEntity`/`MunicipalityEntity` (Domain), DTOs +
>   AutoMapper profiles (Application), `GET /api/province`,
>   `GET /api/municipality` (públicos), `PUT /api/municipality` (staff,
>   solo edita `deliveryFeeUsd` — nombre/provincia son geografía fija, no
>   editable). Migración `20260806023017_AddProvinceAndMunicipality`
>   aplicada. Seed en `DbSeeder.cs`: Pinar del Río (11 municipios), Artemisa
>   (11) y La Habana (15) — 37 en total, todos a $5.00 de tarifa inicial.
> - Frontend: `src/services/adminDeliveryZones.service.ts`,
>   `src/hooks/adminDeliveryZones/*`, página nueva
>   `/admin/zonas-entrega` (`AdminDeliveryZonesPage.tsx`) — tabla de los 37
>   municipios con filtro por provincia/búsqueda y tarifa editable en línea
>   por fila (`MunicipalityFeeCell.tsx`).
> - Fuera de esta fase (no se tocó): el checkout público sigue simulado en
>   localStorage (`SimulatedOrder`/`checkoutSimulation.service.ts`), no crea
>   pedidos reales todavía — conectar la tarifa por municipio ahí es un paso
>   aparte, pendiente para cuando el checkout se conecte al backend real.
> Verificado en el navegador: editar la tarifa de un municipio real desde
> `/admin/zonas-entrega` y confirmar el cambio vía API (luego revertido).
> `npm run lint`, `npm run build` y `npx vitest run` (155/155) en verde.
> Pendientes del mismo pedido, todavía no empezados: descuento en catálogo
> (precio original + rebajado), marca/apariencia editable, permisos por rol,
> dashboard configurable.
>
> Actualización anterior: 2026-08-05, tras conectar el panel
> admin de Combos al backend .NET real (api/combo) — hasta ahora escribía a
> tablas de Supabase (`combos`/`combo_items`/`catalog_products`) ya
> abandonadas, completamente desconectadas del catálogo público. Cambios:
> `src/services/adminCombos.service.ts` (nuevo, reemplaza a
> `src/actions/combo.ts` para el admin — ese archivo queda solo con
> `getActiveCombos`, todavía usada por la página pública legacy sin
> enrutar), `src/hooks/adminCombos/*` (nuevo), UI reconstruida como modal
> crear/editar (`AdminComboFormModal.tsx`, antes un formulario siempre
> visible) con selector de productos reales del almacén en vez de variantes
> del catálogo viejo. El modelo real de combo no tiene slug, descripción ni
> activo/inactivo — se quitaron esos campos. `getCombos()` en
> `catalog.service.ts` (usada por `/combos` y por la ficha de combo en
> `/producto/:id`, que antes 404aba porque solo buscaba en la lista de
> productos) ahora también lee `api/combo` real, resolviendo la imagen del
> combo del primer producto incluido que tenga foto (el backend no guarda
> imagen propia de combo). Se eliminó `src/data/catalog.mock.ts` (quedó sin
> uso) y los archivos de `src/components/dashboard/combos/*` +
> `src/pages/dashboard/DashboardCombosPage.tsx` que dependían de las APIs
> viejas de combos y no estaban enrutados. Dos detalles reales del backend
> encontrados al verificar en el navegador (no documentados en Swagger):
> `useFieldArray` de RHF pisa en silencio cualquier campo `id` propio de los
> datos (se usó `productId` en el formulario) y `DELETE /api/combo/{id}`
> exige un body `{adminId, userId}` aunque el id ya vaya en la URL (a
> diferencia de `DELETE /user/{id}`, que no lleva body). Verificado en el
> navegador: crear, editar (cambiar precio) y eliminar un combo real desde
> `/admin/combos`, y que se reflejara correctamente en `/combos` y en su
> propia ficha `/producto/:id`. `npm run lint`, `npm run build` y
> `npx vitest run` (155/155) en verde.
>
> Actualización anterior: 2026-08-05. Tres cambios relacionados: (1) se creó la
> primera cuenta Admin raíz real vía API (`jorgeacm`, usando el seed
> `admin`/`Admin123!` de `DbSeeder.cs` del backend para el bootstrap) y se
> agregó un formulario en `/admin/configuracion` (`AdminSettingsPage.tsx`,
> `src/components/admin/accounts/AdminAccountFormModal.tsx`,
> `src/services/adminAccounts.service.ts`) para crear más cuentas Admin/Staff
> desde el panel — visible solo si `profile.accountType === 'admin'`. (2) Se
> reconectó el catálogo público (`/catalogo`, `/categoria/:slug`,
> `/producto/:slug`, "Productos populares" del home) al backend .NET real
> (`GET /api/product`, `GET /api/category`) en vez de los mocks de
> `src/data/catalog.mock.ts`/`home.mock.ts` — era la causa de que subir una
> foto de producto en el admin no se reflejara en la tienda pública: el
> catálogo público simplemente no leía esa fuente de datos. El modelo de
> producto real no tiene slug/descripción/variantes; se usa el `id` del
> producto como slug de URL, descripción vacía y `variants: []`. Los combos
> (`/combos`) siguen simulados — el backend no tiene imagen por combo
> todavía ni el admin tiene ese módulo conectado. Se agregó invalidación de
> `['catalog']`/`['home','popularProducts']` en `useManageProducts` para que
> los cambios se vean sin esperar el staleTime por defecto. Se reescribieron
> `src/services/__tests__/catalog.service.test.ts`,
> `CatalogPage.test.tsx`, `ProductPage.test.tsx` (mockeando `apiFetch` en vez
> de depender del mock viejo) y se agregó un mock mínimo en
> `HomePage.test.tsx`. (3) Se corrigió `.env.example` (faltaba
> `VITE_API_BASE_URL`, tenía una clave real de Supabase en vez de
> placeholder). Verificado en el navegador: catálogo, ficha de producto y
> home muestran los 4 productos reales sembrados por el backend; edité un
> producto real vía API con una imagen nueva y confirmé que se veía en
> `/producto/:id` (después revertido, era solo para la prueba).
> `npm run lint`, `npm run build` y `npx vitest run` (155/155) en verde.
>
> Actualización anterior: 2026-08-04, tras terminar el login/inicio de sesión
> de clientes y de staff/admin que había quedado a medio migrar en el commit
> `5190b61` (reemplazo de Supabase Auth por el backend .NET real). Cambios:
> (1) `getStaffProfile` (`src/api/auth.ts`) ahora sí resuelve
> `Profile.accountType` probando `GET /user/{id}` y, si no existe ahí,
> cayendo a `GET /api/admin/{id}` — antes nunca lo fijaba, lo que impedía
> resolver el perfil de cuentas Admin raíz (negaba acceso a `/admin` con un
> JWT válido) y hacía que `actorIdsFromProfile` siempre mandara
> `{adminId: null, userId: null}` en toda mutación atribuida a staff
> (productos, almacén, tipo de cambio, etc.). (2) `staffSignIn` ya no
> descarta el error de `/user/login` sin condición al caer a
> `/api/admin/login`. (3) Login de staff/admin separado en su propia ruta
> `/admin/iniciar-sesion` (`src/pages/admin/AdminLoginPage.tsx`), en vez de
> que `/iniciar-sesion` adivinara cliente vs. staff según de dónde vino la
> redirección — `RequireAuth` ahora acepta un prop `loginPath` por layout.
> (4) Manejo centralizado de sesión expirada: cualquier 401 de una request
> autenticada (`src/api/client.ts`) cierra la sesión, limpia el perfil en
> caché y avisa con un toast, en vez de fallar en silencio hasta que
> expirara el JWT completo (60 min, sin refresh token). (5) Se eliminó el
> código muerto de la era Supabase relacionado a auth que ya no importaba
> nadie: `src/pages/{LoginPage,RegisterPage,CheckoutPage,ThankyouPage}.tsx`,
> `src/layouts/{DashboardLayout,ClientLayout,RootLayout}.tsx`,
> `src/components/shared/Navbar.tsx`, `src/actions/auth.ts`,
> `src/hooks/auth/{useLogin,useRegister,useUser,useCustomer}.ts` y el
> cliente HTTP duplicado sin uso `src/lib/almacenApiClient.ts`, con la
> limpieza correspondiente en los barrels (`src/hooks/index.ts`,
> `src/actions/index.ts`, `src/pages/index.ts`). (6) `.env.example`: se
> agregó `VITE_API_BASE_URL` (faltaba, rompía el login en silencio para
> cualquiera que clonara el repo) y se reemplazó la clave real de Supabase
> por un placeholder (violaba la regla de CLAUDE.md de nunca commitear
> claves reales ahí). No se tocó `src/services/{profile,address,recipient,
> favorite,support}.service.ts` (siguen en Supabase) ni
> `src/supabase/{client,supabase}.ts` — son parte del área de cuenta del
> cliente, no del login, y quedan fuera de esta fase.
>
> Actualización anterior: 2026-07-31, tras aplicar al proyecto Supabase real
> ("Deliverys Home" — `wkycfjvqotukprizfhga`) las migraciones `006`-`008`
> que quedaron redactadas durante la construcción del panel admin — Fase B
> (`/admin`: dashboard, pedidos, verificación de pagos, productos,
> categorías, combos). A petición explícita del usuario ("agrega todas las
> tablas para integrar el backend al frontend") se aplicaron en orden:
> `006_fix_legacy_admin_rls` (función `is_staff()`, corrige las políticas
> RLS de `orders`/`combos`/`combo_items`/`payment_proofs`/
> `payment_accounts`/`exchange_rates` que revisaban `user_roles` en vez de
> `profiles.role`), `007_catalog_admin` (tablas nuevas `catalog_categories`,
> `catalog_products`, `catalog_product_variants`, con RLS: lectura pública
> solo de filas activas, escritura solo `is_staff()`) y
> `008_combo_items_catalog_variants` (`combo_items.catalog_variant_id`,
> constraint `combo_items_variant_ref_check`). Verificado tras aplicar:
> `list_tables` confirma las 3 tablas nuevas con RLS activo,
> `get_advisors(security)` no reporta warnings nuevos (solo el ya aceptado
> de `is_admin()`/`is_staff()` ejecutables por `anon`/`authenticated`,
> necesario porque las políticas RLS los invocan en nombre de quien
> consulta), y `generate_typescript_types` coincide con el tipado ya escrito
> a mano en `src/supabase/supabase.ts` (no requirió cambios). Categorías/
> Productos/Combos del panel admin ya tienen tablas reales que consultar, y
> un admin/operador real ahora sí pasa las políticas RLS de
> Pedidos/Combos/Pagos. **Pendiente para dar la Fase B por completada** (ver
> regla de CLAUDE.md, no empezar Fase C sin validar la anterior): el usuario
> todavía no probó el flujo completo con datos reales en el navegador
> (crear categoría → producto → combo → ver pedido) con una sesión
> `admin`/`operador` real. Suite de Vitest: 149/149 en verde
> (`npx vitest run`), `npm run lint` y `npm run build` también en verde,
> confirmados de nuevo después de aplicar las migraciones (no se tocó
> código, solo esquema).
>
> Actualización anterior: 2026-07-30, tras construir el área privada del
> cliente (`/mi-cuenta/*`). Ver la sección "Área privada del cliente"
> más abajo. Se adelantó esta fase respecto al roadmap vigente (que
> priorizaba la Fase B, panel admin) por instrucción explícita del
> usuario; `ROADMAP.md` queda actualizado para reflejar el nuevo orden.
> Suite completa de Vitest: 119/119 en verde (`npx vitest run`),
> `npm run lint` y `npm run build` también en verde. Actualizar este
> archivo al final de cada fase (ver [../CLAUDE.md](../CLAUDE.md)).
>
> Actualización anterior (misma fecha): tras conectar autenticación real con
> Supabase Auth a las páginas públicas (`/iniciar-sesion`, `/registrarse`,
> `/recuperar-contrasena`, nueva `/restablecer-contrasena`). Ver la sección
> "Autenticación real (Supabase Auth)" más abajo. Suite completa de Vitest:
> 115/115 en verde (`npx vitest run`), `npm run lint` y `npm run build`
> también en verde. Actualizar este archivo al final de cada fase (ver
> [../CLAUDE.md](../CLAUDE.md)).
>
> Actualización anterior (misma fecha): tras la Fase A del roadmap nuevo
> (ver [ROADMAP.md](ROADMAP.md)): la tienda pública ahora muestra precios
> **solo en USD** (decisión de negocio) y el catálogo mock se amplió con
> la categoría "Dulces" y un 5to combo. Ver la sección "Moneda: tienda
> pública en USD" más abajo. Además se auditó el wizard de `/checkout`
> (ya construido en una sesión anterior, sin commitear) contra el spec de
> negocio del checkout paso a paso: cumplía prácticamente todo el
> checklist pedido; solo se corrigieron queries rotas en
> `src/pages/public/__tests__/CheckoutPage.test.tsx` (usaban texto exacto
> de label sin contar el `*` que añaden `Input`/`Select`/`Textarea` en
> campos `required`, ver sección "Checkout por pasos" más abajo).

## Snapshot de git al momento de la inspección

- Rama: `main`, sincronizada con `origin/main`.
- Gestor de paquetes: npm (`package-lock.json` presente, `node_modules`
  instalado). Node local: v24.16.0 / npm 12.0.2.
- Últimos 5 commits:
  1. `ab4dab2` Agregar .env.example con la conexión a Supabase (Deliverys Home)
  2. `661c364` Añadir combo al carrito (precio prorrateado entre variantes)
  3. `743701e` Combos, tasa de cambio y precio dual USD/CUP
  4. `6759cd3` Checkout con subida de comprobante + panel admin de verificación de pagos
  5. `1f61a25` Proyecto base adaptado: esquema Supabase (pagos, combos, liquidaciones) + módulo de pagos

### Cambios sin commitear (encontrados al empezar, no tocados)

- `src/layouts/ClientLayout.tsx`: se dejó de desestructurar `session` de
  `useUser()` (ya no se usaba), probablemente para satisfacer
  `noUnusedLocals`.
- `src/supabase/client.ts`: se añadió un cliente Supabase "offline" simulado
  (`offlineSupabase`) que se usa automáticamente cuando faltan
  `VITE_PROJECT_URL_SUPABASE`/`VITE_SUPABASE_API_KEY`, para que la app no
  crashee en desarrollo sin variables de entorno configuradas.
- Ambos cambios son trabajo en progreso del usuario/sesión anterior. **No
  se modificaron ni se descartaron.** Antes de continuar sobre estos
  archivos, confirmar con el usuario si ya están listos para commitear.
- Archivos sin trackear: `tsconfig.app.tsbuildinfo`, `tsconfig.node.tsbuildinfo`
  (artefactos de build de TypeScript; no deberían commitearse — ver Riesgos).

## Qué funciona hoy

### Lógica de negocio (verificada leyendo el código; corresponde a la app "celulares" anterior a esta fase)

- Catálogo público de productos + variantes (color/almacenamiento/precio).
- Combos con precio propio y prorrateo al añadir al carrito.
- Registro/login de clientes (`/iniciar-sesion`) y de staff/admin
  (`/admin/iniciar-sesion`, ruta separada) contra JWT del backend .NET
  (`src/api/auth.ts`), sin Supabase Auth. Sesión sin refresh token (60 min);
  un 401 en cualquier request autenticada cierra la sesión automáticamente.
- Checkout: dirección + resumen de carrito + creación de pedido + descuento
  de stock.
- Subida de comprobante de pago (Supabase Storage, bucket privado) y cola de
  verificación manual en el dashboard (confirmar/rechazar).
- Tasa de cambio USD→CUP administrable, precio dual mostrado al cliente.
- Dashboard admin: CRUD de productos (con editor Tiptap e imágenes), listado
  y detalle de pedidos, gestión de combos.
- **Importante:** esta lógica hoy vive en páginas/rutas que ya **no están
  enlazadas desde el router** (ver "Router y navegación" abajo). El código
  sigue intacto en el repo (no se borró nada), a la espera de una fase
  posterior que la reconecte a la nueva estructura de URLs.

### Sistema de diseño (`src/components/ui/`)

- 31 componentes reutilizables (Button, Input, Modal, DataTable, ProductCard,
  etc.), tipados, accesibles (roles/aria, foco visible, estados
  hover/focus/disabled/loading/error) y basados en una paleta cálida
  (terracota/verde) definida en `tailwind.config.js`.
- Ruta temporal `/ui-preview` para revisar todos los componentes y sus
  variantes.
- Pruebas con Vitest + Testing Library para Button, Input, Modal,
  QuantitySelector y ConfirmDialog (`src/components/ui/__tests__/`).

### Página de inicio (`src/pages/public/HomePage.tsx`)

- Contenido completo (no placeholder): hero con propuesta de valor y CTAs
  ("Comprar ahora" → `/catalogo`, "Rastrear pedido" → `/rastrear-pedido`),
  categorías destacadas, combos familiares, productos populares, "Cómo
  funciona", zonas de entrega, beneficios, garantías, testimonios simulados,
  preguntas frecuentes, llamada a la acción final y contacto/soporte.
- Dado que estos contenidos (categorías con conteo, combos, productos
  populares, pasos, zonas, beneficios, garantías, testimonios, FAQs) no
  tienen todavía una tabla propia en Supabase, se sirven desde un servicio
  simulado nuevo (`src/services/home.service.ts`, con latencia artificial)
  respaldado por datos en `src/data/home.mock.ts` — nunca arrays inline en
  los componentes.
- Cada sección se consume con un hook dedicado de TanStack Query en
  `src/hooks/home/*` (`useFeaturedCategories`, `useFamilyCombos`,
  `usePopularProductsHome`, `useHowItWorksSteps`, `useDeliveryZones`,
  `useHomeBenefits`, `useHomeGuarantees`, `useTestimonials`, `useHomeFaqs`) y
  maneja explícitamente loading (skeletons), error (con reintento) y estado
  vacío mediante el componente compartido `src/components/home/SectionState.tsx`.
- El texto deja explícito que comprador y destinatario pueden ser personas
  distintas, que el comprador puede estar fuera de Cuba, que el pedido se
  puede rastrear y que la disponibilidad depende del stock y de la zona.
- Prueba de humo en `src/pages/public/__tests__/HomePage.test.tsx`
  (Vitest + Testing Library) que verifica el hero, los CTAs y que las
  secciones con datos async pasan de loading a contenido.

### Catálogo público (`/catalogo`, `/categoria/:slug`, `/producto/:slug`, `/combos`)

- Contenido completo (ya no placeholder), sobre un modelo de datos nuevo
  para el dominio de alimentos: `src/interfaces/catalog.interface.ts`
  (`CatalogProduct`, `CatalogCategory`, etc.). A diferencia del resto de
  `src/interfaces/`, aquí los tipos se infieren de schemas de Zod
  (`z.infer`), porque el servicio valida en runtime cada respuesta —
  excepción documentada en el propio archivo, ya que el resto del catálogo
  simulado (`home.service.ts`) no valida con Zod.
- `src/services/catalog.service.ts` (patrón de `home.service.ts`: datos en
  memoria + latencia simulada) con `getCatalogCategories`,
  `getCatalogProducts` (búsqueda por texto, filtro de categoría/
  disponibilidad/precio, orden por relevancia/precio/popularidad,
  paginación), `getCatalogProductBySlug`, `getRelatedProducts`, `getCombos`.
  Datos mock en `src/data/catalog.mock.ts` (~24 productos en las 6
  categorías de `placeholderCategories`, con combos y variantes).
- Hooks en `src/hooks/catalog/*` con el mismo patrón que `src/hooks/home/*`.
- `src/components/catalog/ProductCatalog.tsx`: motor de exploración
  compartido por Catálogo, Categoría y Resultados de búsqueda (que reutiliza
  `/catalogo?buscar=...`, sin ruta nueva). Cuadrícula/lista, búsqueda,
  filtros (categoría, disponibilidad, precio) en sidebar de escritorio o
  `Drawer` en móvil, orden, paginación — todo sincronizado con la URL
  (`buscar`, `categoria`, `disponibilidad`, `precioMin`, `precioMax`,
  `orden`, `pagina`, `vista`). Loading/error/empty vía `SectionState`.
- `src/pages/public/ProductPage.tsx`: galería, variantes (`VariantSelector`),
  contenido del combo (`ComboContents`, si aplica), zonas de entrega
  (`ProductDeliveryZones`, reutiliza `useDeliveryZones` de `home`), selector
  de cantidad, agregar al carrito y productos relacionados
  (`RelatedProducts`).
- `src/pages/public/CombosPage.tsx`: grilla simple de productos con
  `isCombo: true` (sin filtros, el set es pequeño).
- **Carrito generalizado:** `ICartItem` (`src/components/shared/CartItem.tsx`)
  ya no tiene `color`/`storage` (específicos de celulares); ahora tiene
  `variantLabel: string` genérico. Se actualizaron todos los consumidores
  existentes para que seguir compilando: `cart.store.ts` (`addCombo`),
  `components/checkout/ItemsCheckout.tsx`, `pages/CellPhonePage.tsx` y
  `components/products/CardProduct.tsx` (estos tres últimos son código
  legacy de celulares, no enlazado desde el router — ver más abajo).
- Pruebas: `src/services/__tests__/catalog.service.test.ts` (búsqueda,
  filtros, orden, paginación), `src/pages/public/__tests__/CatalogPage.test.tsx`
  (búsqueda/filtros + sincronización con la URL),
  `src/pages/public/__tests__/ProductPage.test.tsx` (variantes, cantidad,
  agregar al carrito).
- `src/pages/public/PlaceholderPage.tsx` se eliminó: ya no lo usaba ninguna
  página (las 4 páginas que lo usaban ahora tienen contenido real).

### Moneda: tienda pública en USD únicamente (Fase A del roadmap)

- Decisión de negocio explícita: la tienda pública muestra precios **solo
  en USD**. La conversión a CUP sigue existiendo internamente (tabla
  `exchange_rates` en Supabase, `getActiveExchangeRate`/
  `createExchangeRate` en `src/actions/payment.ts`,
  `useActiveExchangeRate`) para uso futuro del panel admin (cálculo
  automático de precio de venta a partir del costo en CUP + margen, Fase B
  del roadmap) — no se tocó esa infraestructura, solo se dejó de
  exponerla al cliente.
- `src/components/ui/CurrencyDisplay.tsx` se simplificó: ya no acepta
  `showCup` ni consulta la tasa de cambio, solo formatea el USD.
- Se eliminaron `src/components/layout/CurrencySelector.tsx` y
  `src/store/currency.store.ts` (el toggle USD/CUP del header estaba
  desconectado de la lógica real de precios — verificado por grep antes de
  borrar — y ya no tenía sentido con precio único en USD).
- Copys que mencionaban CUP al cliente se reescribieron:
  `src/pages/public/FaqPage.tsx` (respuesta sobre moneda),
  `src/data/home.mock.ts` (beneficio "Precios claros en USD"),
  `src/constants/checkout.ts` (método de pago `cash_on_delivery`, ya no
  ancla un monto en CUP visible en la app).
- `src/components/shared/DualPrice.tsx` y
  `src/components/dashboard/combos/ExchangeRateWidget.tsx` (código legacy,
  no enlazado desde el router actual) se dejaron intactos, fuera de
  alcance de esta fase.

### Catálogo mock ampliado (Fase A del roadmap)

- `src/data/catalog.mock.ts` pasó de 6 a 7 categorías: se agregó "Dulces"
  (`dulces`, 4 productos: dulce de leche, galletas surtidas, caramelos
  surtidos, mermelada de fresa) a `placeholderCategories`
  (`src/constants/navigation.ts`) y a `categoryProductCounts`.
- Se agregó un 5to combo, `combo-dulce-merienda` (café, galletas, dulce de
  leche, jugo natural), a la categoría `combos-familiares`.
- El catálogo mock queda en 29 productos (24 + 4 de Dulces + 1 combo
  nuevo) sobre 7 categorías — supera el mínimo de ~20 productos / 5 combos
  pedido en el spec de negocio.

### Carrito y estado global (`src/store/cart.store.ts`, `/carrito`)

- El store de Zustand (`useCartStore`) se extendió sin romper a los
  consumidores existentes (`totalItemsInCart`/`totalAmount` se conservan):
  ahora maneja además `coupon`, `deliveryCost`, `hasHydrated` y los totales
  desglosados `subtotal`/`discount`/`total`.
- Nuevas acciones: `setDeliveryCost`, `applyCoupon`/`removeCoupon`,
  `setHasHydrated`. `addItem`/`updateQuantity` ahora aceptan un
  `availableStock` opcional y devuelven un resultado tipado
  (`{ ok: true }` o `{ ok: false, reason: 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK', availableStock }`)
  en vez de `void`, para que la UI pueda mostrar el motivo del rechazo. El
  stock en sí **no** se guarda en el store (solo se recibe como parámetro en
  el momento de la mutación), para no duplicar datos que ya vive en
  TanStack Query (`useCatalogProduct`).
- `ProductPage.tsx` ya pasa el stock de la variante seleccionada a
  `addItem` y muestra un toast de error si se rechaza; las líneas de
  `/carrito` sí validan stock si se les pasa (`CartLineItem`), pero hoy no
  hay una fuente de stock en vivo por línea dentro del carrito (no existe
  todavía un hook "stock por variantId"), así que la validación ahí queda
  preparada pero sin conectar a datos reales — pendiente cuando exista ese
  hook.
- Cupones: catálogo simulado en `src/data/coupons.mock.ts` (no hay tabla
  `coupons` en Supabase) con validación pura en `src/helpers/coupon.ts`
  (`findCoupon`, `calculateDiscount`), mismo patrón que
  `catalog.service.ts`/`home.service.ts`. Tipos en
  `src/interfaces/cart.interface.ts` (`CartCoupon`, `CouponDefinition`,
  `CartTotals`).
- Dinero: se agregó `decimal.js` como dependencia directa (antes solo
  transitiva) y se usa en `recalculate`/`calculateDiscount` para sumar
  `price * quantity` y aplicar descuentos sin arrastrar el error de punto
  flotante de `number` de JS — atiende el riesgo 5 (ver más abajo) para el
  cálculo de totales del carrito específicamente, no para el resto de la
  app (`OrderInput`, `PaymentProofWithOrder`, etc. siguen con `number`).
- Precios provisionales: `ICartItem.price` es una copia del precio del
  catálogo simulado al momento de agregar al carrito; `subtotal`/`discount`/
  `total` son una estimación del cliente. Queda documentado en
  `cart.store.ts` que el recálculo definitivo (y la validación de que el
  precio no cambió) debe ocurrir en el servidor al confirmar el checkout,
  igual que ya se exige para el stock en `createOrder`. No se implementó
  ninguna llamada real a Supabase para esto (fuera de alcance de esta
  fase); solo se dejaron los totales desglosados para que un futuro
  recálculo del servidor pueda sustituir cualquiera de las partes.
- Persistencia: `persist` de Zustand ahora usa `partialize` (solo
  `items`/`coupon`/`deliveryCost`, los totales se recalculan al hidratar) y
  un `merge` que sanea el estado leído de localStorage (valida forma de
  cada línea y del cupón; descarta lo que no cuadre en vez de romper) para
  tolerar un `localStorage` corrupto o editado a mano. `hasHydrated` se
  expone para que `/carrito` muestre un esqueleto de carga en vez de un
  "carrito vacío" falso mientras se hidrata.
- `/carrito` (`src/pages/public/CartPage.tsx`) ya tiene contenido completo:
  líneas de producto (`src/components/cart/CartLineItem.tsx`, con cantidad
  y eliminar), formulario de cupón (`CouponForm.tsx`), resumen de totales
  con "vaciar carrito" confirmado por diálogo (`CartSummary.tsx`, reutiliza
  `ConfirmDialog`). El costo de entrega no tiene UI propia en esta página
  (se muestra "se calcula en el checkout" mientras sea `0`): `setDeliveryCost`
  queda listo para que lo use el checkout real cuando se conecte.
- Pruebas: `src/store/__tests__/cart.store.test.ts` (agregar, fusionar
  líneas duplicadas, combos, validación de stock, cantidad, eliminar,
  vaciar, cupones válidos/inexistentes/vencidos/con mínimo no alcanzado,
  costo de entrega, precisión decimal, persistencia y saneo de datos
  corruptos) y `src/pages/public/__tests__/CartPage.test.tsx` (vacío,
  hidratación, listado, cantidad, eliminar, cupón válido/ inválido, vaciar
  carrito). Verificado además manualmente en el navegador (agregar desde
  `/producto/arroz-5lb`, aplicar `BIENVENIDA10`, vaciar carrito).

### Checkout por pasos (`/checkout`)

Wizard multi-paso completo sobre un único `useForm` de React Hook Form +
`zodResolver` (`src/lib/checkoutValidators.ts`), con 9 pasos separados en
componentes propios bajo `src/components/checkout/steps/*`: comprador
(`BuyerStep`), destinatario (`RecipientStep`), dirección en Cuba
(`AddressStep`), provincia/municipio (`LocationStep`, sobre
`useDeliveryZones`), referencias y teléfono alternativo (`ReferencesStep`),
modalidad de entrega (`DeliveryModalityStep`, fija `deliveryCost` en el
carrito), instrucciones especiales (`InstructionsStep`), revisión con
resumen editable por bloque + checkbox de consentimiento de políticas
(`ReviewStep`), y pago simulado sin captura de tarjeta (`PaymentStep`).

- Validación por paso: `handleNext` llama a `trigger()` solo con la sección
  del schema del paso actual (`STEP_SCHEMA_KEY`); el envío final revalida
  el `checkoutFormSchema` completo.
- Conservación temporal del formulario: `sessionStorage` (`dh-checkout-draft`,
  no `localStorage` — es un borrador de la sesión de compra, no algo que
  deba sobrevivir entre visitas).
- Resumen lateral del pedido: `CheckoutOrderSummary.tsx`, visible en los 9
  pasos.
- Botones "Anterior"/"Siguiente" (el último paso cambia el texto a
  "Confirmar y pagar"), diseño mobile-first (el `CheckoutStepper` colapsa a
  "Paso X de N" con barra de progreso en móvil, lista completa en
  escritorio).
- Prevención de doble envío + estado de procesamiento: guarda
  `isSubmitting` + `Button isLoading` (se deshabilita solo mientras
  procesa).
- Manejo de errores: `submitError` + `Alert` sin perder los datos ya
  capturados (permite reintentar).
- Pedido simulado 100% client-side (`src/services/checkoutSimulation.service.ts`,
  sin llamada a Supabase — ver nota en el propio archivo sobre reemplazarlo
  por `createOrder` cuando se conecte al backend real): genera un número
  `DH-XXXXXX`, falla al azar ~12% de las veces para poder probar el manejo
  de errores, guarda el pedido en `localStorage` (`dh-simulated-orders`).
  `/pedido-confirmado/:orderNumber` y `/rastrear-pedido` (rastreo simulado
  por número de pedido, `computeTrackingStage`) leen de ahí.
- Nunca se captura número de tarjeta real, ni siquiera en el método de pago
  "Tarjeta" (queda como verificación manual, igual que el resto del flujo
  de pagos manual ya existente en el proyecto).
- Pruebas: `src/lib/__tests__/checkoutValidators.test.ts` (cada schema de
  paso, válido/inválido, más el `checkoutFormSchema` completo) y
  `src/pages/public/__tests__/CheckoutPage.test.tsx` (carrito vacío,
  validación bloquea el avance, flujo principal completo hasta la
  confirmación, error simulado + reintento, doble envío bloqueado). Al
  auditar este checkout ya construido se encontraron 3 pruebas rotas en
  `CheckoutPage.test.tsx` por usar texto exacto de label sin contar el `*`
  que `Input`/`Select`/`Textarea` añaden a los campos `required` (ej.
  `getByLabelText('Teléfono')` no encontraba `"Teléfono*"`) — se corrigieron
  a regex ancladas al inicio (`/^teléfono\*?$/i`). Suite completa:
  97/97 en verde (`npx vitest run`).

### Router y navegación pública (`src/router/`, `src/layouts/`, `src/components/layout/`)

- Rutas públicas nuevas, en español, con lazy loading + `Suspense`/skeleton
  por ruta: `/`, `/catalogo`, `/categoria/:slug`, `/producto/:slug`,
  `/combos`, `/carrito`, `/checkout`, `/pedido-confirmado/:orderNumber`,
  `/rastrear-pedido`, `/iniciar-sesion`, `/registrarse`,
  `/recuperar-contrasena`, `/mi-cuenta/*`, `/contacto`,
  `/preguntas-frecuentes`, `/politicas/*`, `/admin/*`, `/ui-preview` y un
  catch-all 404.
- `/`, `/catalogo`, `/categoria/:slug`, `/producto/:slug` y `/combos` ya
  tienen contenido real (sobre datos simulados, ver secciones arriba). El
  resto de páginas nuevas sigue con **contenido provisional** (decisión
  explícita del usuario): son el esqueleto de navegación, no la lógica de
  negocio real. `/iniciar-sesion`, `/registrarse`, `/recuperar-contrasena` y
  `/contacto` sí tienen formularios visuales, pero no llaman a Supabase
  todavía.
- `PublicLayout` (Header responsive + menú móvil + selector de moneda +
  buscador + carrito con contador + footer + botón de WhatsApp),
  `CustomerLayout` y `AdminLayout` (ambos protegidos por `RequireAuth`,
  basado en `useUser`/Supabase session).
- `RequireAuth` (`src/router/RequireAuth.tsx`) exige sesión activa para
  `/mi-cuenta/*` y `/admin/*`. **No** distingue todavía rol cliente vs.
  admin (no hay hook de rol dedicado) — la barrera real sigue siendo RLS en
  Supabase, tal como exige la regla de seguridad permanente.
- El router anterior (rutas `/celulares`, `/login`, `/registro`, `/account`,
  `/dashboard`) fue reemplazado por completo, por decisión explícita del
  usuario. Los archivos viejos (`RootLayout.tsx`, `ClientLayout.tsx`,
  `DashboardLayout.tsx`, páginas en `src/pages/*.tsx` y `src/pages/dashboard/`,
  `Navbar`/`NavbarMobile`/`Footer`/`Sheet`/`Search`/`Cart` en
  `src/components/shared/`) **no se borraron**: quedan en el repo, sin
  referenciar desde el router, a la espera de la fase de reconexión de
  lógica.

### Autenticación real (Supabase Auth)

- Nueva tabla `profiles` (`supabase/migrations/003_profiles.sql`, aplicada
  al proyecto real "Deliverys Home" — `wkycfjvqotukprizfhga` — vía MCP de
  Supabase, con confirmación explícita del usuario), 1 fila por usuario de
  `auth.users` (`id`, `full_name`, `phone`, `role`, `status`, `created_at`,
  `updated_at`), creada automáticamente al registrarse (trigger
  `on_auth_user_created` + `handle_new_user`, `security definer`). Se
  numeró `003` (no `002`) porque el proyecto remoto ya tenía aplicada
  `002_storage_payment_proofs` (bucket de comprobantes de pago) que no
  existe como archivo en `supabase/migrations/` — deuda de documentación
  preexistente, no introducida en esta fase; pendiente traerla al repo si
  se quiere el historial de migraciones completo en control de versiones.
  **No** reemplaza las tablas legacy `customers`/`user_roles` del dominio
  "celulares" (siguen intactas, ver "Router y navegación" más abajo);
  conviven hasta que se decida una migración de datos explícita.
- RLS: cada usuario lee/actualiza únicamente su propia fila
  (`profiles_select_own`/`profiles_update_own`); los admins pueden **leer**
  cualquier perfil (`profiles_select_admin`, vía función `is_admin()`
  `security definer` para evitar recursión de RLS sobre la propia tabla).
  Un trigger (`protect_profile_privileged_columns`) impide que un usuario no
  admin modifique su propio `role`/`status` aunque el cliente envíe otro
  valor. Verificado en remoto con `pg_policies` tras aplicar la migración.
  `supabase/migrations/004_profiles_function_grants.sql` (también aplicada)
  revoca `EXECUTE` público sobre las dos funciones de trigger
  (`handle_new_user`, `protect_profile_privileged_columns`) que el linter de
  seguridad de Supabase marcaba como invocables por `anon`/`authenticated`
  vía `/rest/v1/rpc/...` (no rompe los triggers: el motor de triggers no
  pasa por el chequeo de `EXECUTE`). `is_admin()` se deja ejecutable a
  propósito (la usan las políticas de RLS en nombre de quien consulta); el
  advisor sigue marcándola como advertencia, revisado y aceptado porque es
  de solo lectura y no expone datos de terceros.
- `src/services/auth.service.ts`: `signUp`, `signIn`, `signOut`,
  `requestPasswordReset` (`resetPasswordForEmail`), `updatePassword`
  (`updateUser`), `getCurrentSession`, `refreshSession`, `getProfile`.
  Errores de Supabase traducidos al español en `src/helpers/authError.ts`
  (mapa de mensajes conocidos + fallback genérico, nunca se expone el
  mensaje crudo de Supabase).
- `src/context/AuthContext.tsx` (`AuthProvider`, envuelve `RouterProvider`
  en `src/main.tsx`) + `src/hooks/auth/useAuth.ts`: sesión, usuario y perfil
  sincronizados vía `onAuthStateChange` (cubre renovación/persistencia de
  sesión, que además ya resuelve el SDK de Supabase por defecto
  —`persistSession`/`autoRefreshToken`—) y `getProfile` con TanStack Query
  (`queryKey: ['profile', userId]`, invalidada en `signOut`).
- `RequireAuth`, `AccountLink`, `MobileMenu`, `CustomerLayout`, `AdminLayout`
  migrados del hook legacy `useUser` (solo consultaba `getSession` una vez,
  sin escuchar cambios de sesión) al nuevo `useAuth`. El hook legacy
  (`useUser`/`useLogin`/`useRegister`/`useCustomer`, `src/actions/auth.ts`,
  sobre `customers`/`user_roles`) se dejó intacto: lo siguen usando páginas
  no enrutadas (`src/pages/LoginPage.tsx`, `RegisterPage.tsx`,
  `src/layouts/ClientLayout.tsx`, etc.), fuera de alcance de esta fase.
- Páginas conectadas (mocks eliminados): `src/pages/public/LoginPage.tsx`,
  `RegisterPage.tsx`, `ForgotPasswordPage.tsx` (RHF + Zod,
  `src/lib/authValidators.ts`, manejo de error con `Alert`, redirección
  post-login a `location.state.from` o `/`). Registro maneja el caso de
  confirmación de correo pendiente (`needsEmailConfirmation`, cuando
  Supabase no devuelve sesión tras `signUp`) mostrando un aviso en vez de
  navegar como si hubiera iniciado sesión.
- Página nueva `src/pages/public/ResetPasswordPage.tsx`
  (`/restablecer-contrasena`, agregada a `lazyPages.ts`/`router/index.tsx`):
  destino del enlace de recuperación; si no hay sesión de recuperación
  activa (enlace vencido/inválido) muestra un aviso con link para pedir uno
  nuevo en vez de un formulario roto.
- Pruebas nuevas: `src/context/__tests__/AuthContext.test.tsx`,
  `src/router/__tests__/RequireAuth.test.tsx`,
  `src/pages/public/__tests__/{LoginPage,RegisterPage,ForgotPasswordPage,ResetPasswordPage}.test.tsx`
  (mocks de `useAuth`/`services/auth.service`, sin pegar a Supabase real).

### Área privada del cliente (`/mi-cuenta/*`)

Las 8 rutas pedidas (`/mi-cuenta`, `pedidos`, `pedidos/:id`,
`destinatarios`, `direcciones`, `favoritos`, `perfil`, `seguridad`,
`soporte`) están construidas y enrutadas en `CustomerLayout`/
`router/index.tsx`; logout ya existía.

- **Migración `supabase/migrations/005_customer_account.sql`** (aplicada al
  proyecto real "Deliverys Home" vía MCP): 4 tablas nuevas
  (`customer_addresses`, `customer_recipients`, `favorites`,
  `support_cases`), todas `profile_id references profiles(id)`, con RLS
  owner-only (select/insert/update/delete donde `auth.uid() = profile_id`)
  + policy de solo lectura para admins (`is_admin()`, reutilizando la
  función de `003_profiles.sql`), mismo patrón que `profiles`. Función
  compartida `set_updated_at()` + trigger `protect_support_case_status()`
  (el cliente crea/lee casos pero no puede cambiar su propio `status`,
  igual que `protect_profile_privileged_columns` protege `role`/`status`
  en `profiles`). `get_advisors` tras aplicar: sin warnings nuevos (solo
  los ya aceptados de `is_admin()`). `src/supabase/supabase.ts` extendido
  a mano con las 4 tablas nuevas.
- **Perfil** (`/mi-cuenta/perfil`): no necesitó tabla nueva, reutiliza
  `profiles`/`profiles_update_own`. `src/services/profile.service.ts` +
  `useUpdateProfile` (invalida `['profile', userId]`, la misma key que usa
  `AuthContext`).
- **Destinatarios y direcciones**: `src/services/{recipient,address}.service.ts`
  + hooks `use{Recipients,Addresses}`/`useManage{Recipients,Addresses}`
  (CRUD completo con `invalidateQueries`). Páginas
  `Customer{Recipients,Addresses}Page.tsx`: tarjetas + `Modal` con
  formulario (RHF + Zod, `src/lib/accountValidators.ts`), provincia/
  municipio reutilizando `useDeliveryZones` (mismo servicio que
  `LocationStep` del checkout), `ConfirmDialog` para eliminar, badge de
  "predeterminado".
- **Favoritos**: tabla `favorites` guarda `product_id` = slug del catálogo
  simulado (no existe tabla `products` real para el dominio de comida
  todavía, ver riesgo 12) — la fila de favorito sí es 100% real/RLS, solo
  el producto referenciado sigue siendo mock. `useToggleFavorite` +
  `FavoriteButton` (`src/components/product/FavoriteButton.tsx`, visible
  solo con sesión activa) integrado en `/producto/:slug`.
  `CustomerFavoritesPage.tsx` resuelve cada favorito vía
  `getCatalogProductBySlug` con `useQueries`.
- **Soporte**: `support_cases` (crear + listar, sin edición — el estado
  solo lo cambia un admin vía RLS/trigger). `CustomerSupportPage.tsx`:
  formulario de creación + lista de casos propios con badge de estado.
- **Pedidos** (`/mi-cuenta/pedidos`, `/mi-cuenta/pedidos/:orderNumber`):
  **sigue sin tabla `orders` real para el dominio de comida** (la única
  `orders` en Supabase es del dominio legacy "celulares", ligada a
  `customers`, no a `profiles`) — conectar el checkout a un pedido real
  es trabajo mayor (tabla nueva + RLS + decremento de stock) que no
  entraba en este pedido y ya está rastreado como deuda técnica en
  `ROADMAP.md`. Se etiquetó cada pedido simulado
  (`src/services/checkoutSimulation.service.ts`) con el `userId` de la
  sesión activa al confirmar el checkout (`SimulatedOrder.userId`,
  opcional — los pedidos de invitado quedan sin dueño); nueva función
  `getSimulatedOrdersByUserId` + hook `useCustomerOrders`.
  `CustomerOrderDetailPage.tsx` verifica que `order.userId` coincida con
  el usuario autenticado antes de mostrar el pedido (no confía en que el
  número de la URL sea del usuario correcto) y agrega "Repetir pedido"
  (reconstruye las líneas guardadas en el pedido y las agrega al carrito
  vía `useCartStore().addItem`).
- Pruebas nuevas: `src/services/__tests__/checkoutSimulation.service.test.ts`
  (etiquetado por `userId`, filtro/orden de `getSimulatedOrdersByUserId`).
  `CheckoutPage.test.tsx`/`ProductPage.test.tsx` se actualizaron para
  mockear `useAuth` (ahora se usa en ambas páginas) siguiendo el mismo
  patrón que `LoginPage.test.tsx` (`vi.importActual` + override de
  `useAuth`, para no perder el resto de hooks reales del barril).
- **Verificado manualmente**: `npm run lint`, `npm run build` y
  `npx vitest run` (119/119) en verde. La verificación visual completa del
  flujo de registro en el navegador quedó bloqueada por el rate limit de
  envío de correo de Supabase Auth del proyecto (`email rate limit
  exceeded`, no relacionado con este código) tras varios intentos de
  registro con distintos correos de prueba; se confirmó igualmente, con
  una llamada directa a `supabase.auth.signUp()` desde la consola del
  navegador, que la app sí habla con el Supabase real (no con el cliente
  offline simulado) y que los errores de Auth se propagan correctamente
  a la UI. Pendiente: recorrer las 8 páginas ya con una sesión real una
  vez pase el rate limit.

### Panel admin — Fase B (`/admin`, construida, pendiente de validación)

El prompt original pedía un panel genérico masivo (9 roles, ~20 módulos
incl. Compras/Proveedores/Nómina/Auditoría, inventario completo). Se acordó
con el usuario un híbrido: la infraestructura de shell de ese spec, pero
poblada solo con los módulos que sí están en `ROADMAP.md` Fase B (Dashboard,
Pedidos, Productos, Categorías, Combos). Los módulos de fases posteriores
(Almacén, Clientes, Vendedores, Trabajadores, Remesas, Contabilidad,
Configuración) aparecen en el sidebar como "Próximamente" pero no tienen
página propia — usan el catch-all `AdminSectionPlaceholderPage`.

- **Roles**: no se creó un sistema nuevo. Se reutiliza `profiles.role`
  (`'customer' | 'admin' | 'operador' | 'mensajero'`, ya existente).
  `/admin` se abre a `admin` y `operador` (`src/lib/roleGuards.ts`,
  `ADMIN_ACCESS_ROLES`). `RequireAuth` (`src/router/RequireAuth.tsx`) gana
  un prop opcional `allowedRoles`.
- **Hallazgo real durante la construcción (no pedido, pero bloqueante)**:
  el registro conectado hoy solo crea fila en `profiles`; las políticas RLS
  de `orders`/`combos`/`combo_items`/`payment_proofs`/`payment_accounts`/
  `exchange_rates` seguían revisando la tabla vieja `user_roles` (nunca
  poblada por ese flujo). Sin corregirlo, un admin/operador real no podría
  leer ni escribir pedidos/combos/pagos desde el panel nuevo. Confirmado
  con el usuario: se redactó `supabase/migrations/006_fix_legacy_admin_rls.sql`
  (nueva función `is_staff()`, admin u operador, reemplaza los checks a
  `user_roles`). También se detectó que `combo_items` nunca tuvo policy de
  escritura (gap real, no solo tabla equivocada) — corregido en la misma
  migración.
- **Esquema de productos**: la tienda pública sigue en catálogo simulado
  (riesgo 12, sin tocar en esta fase). Se creó
  `supabase/migrations/007_catalog_admin.sql` con tablas nuevas de dominio
  comida (`catalog_categories`, `catalog_products`, `catalog_product_variants`),
  espejando la forma de `CatalogProduct`/`CatalogCategory`, para que el
  admin nuevo tenga datos reales propios sin tocar el esquema legacy
  "celulares" (`products`/`variants`, sin categorías). Reconectar la tienda
  pública a estas tablas queda para una fase aparte.
  - **Caveat de seguridad documentado, no resuelto todavía**: RLS es a
    nivel de fila, no de columna. La policy pública de `catalog_products`
    (filas `is_active = true`) también expondría `cost_cup`/`margin_usd`/
    `pricing_mode` (campos admin-only) si algún código público hiciera
    `select('*')`. No es explotable hoy (nada público consulta esta tabla
    todavía), pero hay que resolverlo con una vista `catalog_products_public`
    antes de reconectar la tienda pública a este esquema.
  - Todo producto necesita al menos una variante/presentación
    (`catalog_product_variants`, decisión de diseño): así el armador de
    combos (que solo referencia variantes, no productos directamente)
    siempre tiene qué ofrecer.
- **Combos**: `supabase/migrations/008_combo_items_catalog_variants.sql`
  agrega `combo_items.catalog_variant_id` (referencia al catálogo nuevo) sin
  quitar `variant_id` (legacy) — exactamente una de las dos debe estar
  presente por fila (`combo_items_variant_ref_check`). `src/actions/combo.ts`
  se actualizó para operar sobre el catálogo nuevo.
- **Precio automático**: fórmula confirmada con el usuario —
  `precio_usd = (costo_cup / tasa_vigente) + margen_usd` (margen como monto
  fijo en USD, no porcentaje). Implementada en
  `src/components/admin/products/PricingModeFields.tsx` con `decimal.js`
  (regla de dinero del proyecto). Al construir la prueba de este componente
  se encontró y corrigió un bug real: `react-hook-form` expone el valor
  crudo del input (`''`) antes de que Zod lo coerza a `number`, lo que
  hacía que `decimal.js` reventara con un input vacío mientras el usuario
  todavía escribía — se agregó un guard (`toFiniteNumber`) antes de calcular.
- **Tasa de cambio**: confirmado con el usuario que `admin` y `operador`
  (no solo `admin`) pueden actualizarla (`is_staff()` en la policy de
  escritura de `exchange_rates`).
- **Pedidos**: se detectó que el hook legacy `useOrderAdmin` llama a
  `getOrderById` (alcance de **cliente**, filtra por el propio
  `customer_id`), no a `getOrderByIdAdmin` — un bug preexistente que habría
  hecho que ningún admin real viera el detalle de un pedido ajeno. La
  página nueva (`AdminOrderDetailPage`) usa un hook nuevo
  (`useAdminOrderDetail`) sobre `getOrderByIdAdmin` en su lugar;
  `useOrderAdmin`/`DashboardOrderPage` (legacy, sin enlazar) se dejaron
  intactos. `getAllOrders`/`useAllOrders` ganaron paginación/filtro/
  búsqueda sin romper al consumidor legacy (`data` se sigue exponiendo como
  array). Cambiar a `Delivered`/`Cancelled` pide confirmación
  (`ConfirmDialog`) por ser acciones sensibles.
- **Dashboard**: stats reales (pedidos de hoy, ventas del mes con
  `decimal.js`, ticket promedio, tasa de cambio vigente, vía
  `getOrdersSummary` nuevo en `src/actions/order.ts`) + stats simuladas
  explícitamente marcadas "Próximamente" (stock bajo, próximos a vencer,
  entregas pendientes, comisiones pendientes, pagos pendientes, gastos —
  `src/services/adminDashboard.service.ts`, mismo patrón que
  `home.service.ts`, placeholders de las Fases C-I).
- **Pruebas nuevas**: `roleGuards.test.ts`, `RequireAuth.test.tsx`
  (extendido con casos de `allowedRoles`), `adminCategories.service.test.ts`,
  `adminProducts.service.test.ts`, `adminDashboard.service.test.ts`
  (primer precedente de mock del cliente Supabase con query-builder
  encadenable en este repo), `AdminCategoriesPage.test.tsx` (crear/eliminar
  con confirmación), `AdminProductFormPage.test.tsx` (modo de precio
  automático — encontró el bug de `decimal.js` arriba — y bloqueo de envío
  sin imágenes). No se escribieron pruebas dedicadas para
  Pedidos/Combos/Dashboard/Categorías-lista (páginas más simples,
  cubiertas indirectamente por las pruebas de servicio) — deuda menor,
  igual que ya ocurre con `CustomerAddressesPage`.
- **Migraciones aplicadas (2026-07-31)**: `006`, `007` y `008` se aplicaron
  al proyecto Supabase real vía MCP, a petición explícita del usuario. Las
  3 tablas nuevas (`catalog_categories`, `catalog_products`,
  `catalog_product_variants`) existen con RLS activo, y `is_staff()` ya
  cubre las políticas de `orders`/`combos`/`combo_items`/`payment_proofs`/
  `payment_accounts`/`exchange_rates`. `src/supabase/supabase.ts` (extendido
  a mano antes de aplicar, mismo precedente que `005_customer_account.sql`)
  coincide con `generate_typescript_types` del proyecto real — no requirió
  cambios. Verificado manualmente antes de esta fecha: `/admin` y todas sus
  rutas hijas redirigen correctamente a `/iniciar-sesion` sin sesión (sin
  errores de consola). **Pendiente**: nadie probó todavía el flujo completo
  con datos reales (crear categoría → producto → combo → ver pedido) con
  una sesión `admin`/`operador` real — requiere que el usuario cree ese
  usuario y lo pruebe en el navegador antes de dar la Fase B por validada.

## Qué falta

Las Fases C-I del roadmap nuevo (Almacén, Clientes, Vendedores/comisiones,
Trabajadores, Remesas, Contabilidad, Configuración) ya están construidas
y conectadas al backend .NET real — no mock, no roadmap original con datos
simulados como se había planificado (ver "Última actualización" arriba
para el detalle de qué se cerró en la sesión del 2026-08-09, incluyendo
Configuración → "Datos de contacto" que quedaba pendiente). **Pendiente
de validación explícita del usuario en el navegador con una sesión
`admin`/`operador` real** — igual que quedó pendiente para la Fase B
original, esta ronda de trabajo se verificó manualmente por el agente
(editar/eliminar cliente, editar/eliminar gasto, resetear contraseña de
staff, actualizar el WhatsApp de contacto real, todo contra el backend
real), pero no por el usuario. Sigue sin tocarse, deferido explícitamente:
- Dashboard → "Actividad reciente": sigue en `adminDashboard.mock.ts`, no
  hay endpoint de auditoría en el backend todavía.

Deuda técnica heredada (RPC transaccional de stock, auditoría real de
inventario, idempotencia de pagos, procesador de pago real, CI, Docker)
reordenada al final del roadmap, no bloquea estas fases. Detalle y orden
en [ROADMAP.md](ROADMAP.md).

## Riesgos y deuda técnica detectados

1. **Sobreventa por condición de carrera en el stock** — `createOrder`
   (`src/actions/order.ts`) lee el stock, valida, y más tarde vuelve a leer
   y actualizar en pasos separados, sin transacción. Dos compras
   concurrentes de la última unidad pueden ambas tener éxito. *Severidad:
   media-alta si hay tráfico concurrente real.*
2. **Sin auditoría de inventario** — el stock se sobreescribe directamente
   (`update variants set stock = ...`) sin dejar rastro de quién/cuándo/por
   qué cambió. Incumple la regla permanente de inventario auditable en
   cuanto se formalice ese módulo.
3. **Dashboard sin guarda de rol en el cliente** — `DashboardLayout`
   (`src/layouts/DashboardLayout.tsx`) renderiza el panel completo sin
   verificar `user_roles`. *Actualización:* este archivo ya no está
   enlazado desde el router (reemplazado por `AdminLayout`, que sí exige
   sesión vía `RequireAuth`). El riesgo queda latente solo si se reconecta
   `DashboardLayout` sin añadirle guarda. `AdminLayout` tampoco distingue
   rol admin vs. cliente todavía, solo sesión activa; RLS sigue siendo la
   barrera real de datos.
4. **Pagos no idempotentes** — `uploadPaymentProof`, `confirmPaymentProof`,
   `rejectPaymentProof` (`src/actions/payment.ts`) no usan clave de
   idempotencia; un doble clic o reintento de red puede duplicar efectos.
5. **Dinero como `number` de JS en TypeScript** — la base de datos usa
   `numeric` correctamente, pero las interfaces TS (`OrderInput`,
   `PaymentProofWithOrder`, `Combo`, etc.) y los helpers
   (`convertUsdToCup`) operan con `number`. Válido para mostrar un total
   simple; riesgoso si se empiezan a acumular comisiones/liquidaciones sin
   una librería decimal. *Actualización:* `cart.store.ts` ya suma
   `price * quantity` y calcula descuentos con `decimal.js` (ver "Carrito y
   estado global" arriba); el resto de la app (pedidos, pagos,
   liquidaciones) sigue con `number` sin decimal.js.
6. **`.env.example` contiene credenciales reales** de un proyecto Supabase
   (URL del proyecto + clave `anon`), en vez de placeholders. La clave
   `anon` está diseñada para exponerse en cliente y protegida por RLS, pero
   commitear el proyecto real (no un ejemplo) en `.env.example` no es buena
   práctica y contradice la regla de "no guardar secretos/config real en el
   repo" en espíritu. `.env` (con las credenciales activas en uso local) sí
   está correctamente ignorado por git.
7. **Artefactos de build trackeables** — `tsconfig.app.tsbuildinfo` y
   `tsconfig.node.tsbuildinfo` aparecen como no trackeados pero no están en
   `.gitignore`; alguien podría commitearlos por error.
8. ~~**Sin infraestructura de pruebas ni CI**~~ — **Resuelto parcialmente:**
   se agregó Vitest + React Testing Library (`vitest.config.ts`,
   `src/setupTests.ts`) con pruebas para 5 componentes del sistema de
   diseño. Sigue sin haber Playwright ni workflows de CI (GitHub Actions).
9. **Naming heredado del dominio "celulares"** — nombres de tabla/carpeta
   (`CellPhonesPage`, bucket `product-images`, etc.) reflejan el origen del
   proyecto (tienda de celulares) y no el dominio actual (alimentos/combos
   para Cuba). No es un bug, pero puede confundir a futuros desarrolladores;
   evaluar si conviene renombrar antes de que crezca más el código.
10. ~~**4 errores preexistentes de lint/build**~~ — **Resuelto.**
    `src/supabase/client.ts` tipaba `then()` del cliente offline simulado
    con `any`; ahora usa genéricos (`TResult1`/`TResult2`) sobre un tipo
    `OfflineQueryResult`. `ProductInput.images` se tipó correctamente como
    `(File | string)[]` (ya que `updateProduct` siempre mezcló imágenes
    nuevas y URLs existentes en tiempo de ejecución); `createProduct` ahora
    valida con `instanceof File` antes de subir, y `FormProduct.tsx` castea
    `Json | null` a `JSONContent` con un fallback de documento vacío en vez
    de dejar pasar `null`. `npm run lint`, `npm run build` y `npm run test`
    quedan en verde.

11. **Contenido de la página de inicio es simulado** — categorías
    destacadas, combos, productos populares, zonas de entrega, testimonios y
    FAQs de `HomePage` vienen de `src/services/home.service.ts` (datos
    fijos en memoria, no de Supabase). Los combos/productos "populares" no
    corresponden todavía a filas reales de `combos`/`products`; los enlaces
    de sus tarjetas llevan a `/combos` y `/catalogo` en general (no a un
    slug real) hasta que exista ese modelo de datos o se decida reutilizar
    `useActiveCombos`/`useHomeProducts` (que sí pegan a Supabase, pero sobre
    el esquema heredado de "celulares"). Reemplazar cuando se defina el
    modelo de datos de categorías/combos para el dominio de alimentos.
12. **Contenido del catálogo público es simulado** — igual que el riesgo
    11 para `HomePage`, `src/services/catalog.service.ts` sirve datos fijos
    en memoria (`src/data/catalog.mock.ts`), no filas reales de Supabase.
    El catálogo legacy real (`src/actions/product.ts`,
    `src/hooks/products/*`, sobre el esquema heredado de "celulares") sigue
    sin usarse desde el router público. Reemplazar `catalog.service.ts` por
    llamadas reales cuando exista una tabla `products`/`categories` para el
    dominio de alimentos — probablemente ese sea el punto en que se decida
    si esa migración reutiliza o reemplaza el esquema legacy.
13. **Puerto de desarrollo cambiado en `.claude/launch.json`** — el puerto
    3000 configurado en `vite.config.ts` está reservado por el sistema
    operativo en este entorno Windows y no se puede enlazar. Se ajustó
    `.claude/launch.json` (no trackeado en git) para lanzar `npm run dev --
    --port 5183` solo con fines de verificación visual en este entorno;
    `vite.config.ts` (sí trackeado) se dejó sin tocar. Si el puerto 3000
    tampoco está disponible en otra máquina, aplicar el mismo ajuste local.
14. **`/mi-cuenta/pedidos` sigue sobre el checkout simulado** — no hay
    tabla `orders` real para el dominio de comida (ver riesgo 12); los
    pedidos viven en `localStorage`, etiquetados con `userId` solo si
    había sesión activa al confirmar el checkout. Un pedido hecho como
    invitado (sin sesión) nunca aparecerá en `/mi-cuenta/pedidos` de
    nadie, y los pedidos no sobreviven a un cambio de navegador/dispositivo
    ni a borrar el `localStorage`. Se resuelve junto con el riesgo 12
    cuando exista una tabla `orders` real ligada a `profiles`.
15. **Favoritos referencian productos mock** — `favorites.product_id`
    guarda el slug del catálogo simulado (`catalog.service.ts`), no una
    fila real de `products`; si ese slug cambia o el producto se elimina
    del mock, el favorito queda "huérfano" (se resuelve mostrando nada
    para ese favorito, no un error). Mismo origen que el riesgo 12.
16. ~~**Migraciones 006-008 (panel admin, Fase B) redactadas pero no
    aplicadas**~~ — **Resuelto 2026-07-31.** Las 3 migraciones se aplicaron
    al proyecto Supabase real vía MCP. Categorías/Productos/Combos del
    admin nuevo ya tienen tabla real que consultar.
17. ~~**RLS de `orders`/`combos`/`combo_items`/`payment_proofs`/
    `payment_accounts`/`exchange_rates` revisa `user_roles`**~~ —
    **Resuelto 2026-07-31.** `is_staff()` (`006_fix_legacy_admin_rls.sql`)
    ya está aplicada; un admin/operador real (vía `profiles.role`) ahora
    pasa esas políticas.
18. **RLS de `catalog_products` no protege `cost_cup`/`margin_usd`/
    `pricing_mode` a nivel de columna** — la policy pública (`is_active =
    true`) expondría esos campos admin-only si algún código público
    hiciera `select('*')` sobre esa tabla. No explotable hoy (la tienda
    pública sigue en catálogo mock, nada público consulta
    `catalog_products` todavía); resolver con una vista
    `catalog_products_public` antes de reconectar la tienda pública a este
    esquema (ver riesgo 12).
19. **Bug preexistente en el hook legacy `useOrderAdmin`** — llama a
    `getOrderById` (alcance de cliente, filtra por el `customer_id` del
    usuario autenticado) en vez de `getOrderByIdAdmin`. `DashboardOrderPage`
    (legacy, sin enlazar) sigue usándolo tal cual; el panel admin nuevo
    (`AdminOrderDetailPage`) usa `useAdminOrderDetail`/`getOrderByIdAdmin`
    en su lugar. No se corrigió el hook legacy (fuera de alcance, página
    no enlazada).

Los riesgos 1, 2, 4, 5, 6, 7 y 9 no se tocaron en la fase de sistema de
diseño y navegación (no era de lógica de negocio). Quedan como entrada de la
Fase 1 en [ROADMAP.md](ROADMAP.md). *Actualización de la fase de carrito:*
el riesgo 5 se atendió parcialmente (ver arriba); los riesgos 1, 2, 4, 6, 7
y 9 siguen sin tocarse. *Actualización de la fase de panel admin:* ninguno
de los riesgos 1-15 se tocó (fuera de alcance de esta fase); se agregaron
los riesgos 16-19.

## Cómo actualizar este documento

Al cerrar una fase del roadmap: mover sus entregables de "Qué falta" a "Qué
funciona hoy", tachar o cerrar los riesgos resueltos, añadir los riesgos
nuevos que se hayan descubierto, y actualizar la fecha del encabezado.
