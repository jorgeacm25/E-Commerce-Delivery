# Estado del proyecto

> Última actualización: 2026-07-30, tras conectar autenticación real con
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
- Registro/login de clientes vía Supabase Auth, con alta automática de fila
  en `user_roles` (rol `customer`).
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

## Qué falta (Fases B-I del roadmap nuevo, aún sin implementar)

Panel admin único (sin login por vendedor/trabajador): acceso + dashboard
de resumen (Fase B), reconexión/ampliación de productos-combos-pedidos
(Fase B), almacén con histórico de movimientos (Fase C), clientes con
deuda CUP/USD (Fase D), vendedores y comisiones (Fase E), trabajadores/
repartidores (Fase F), remesas (Fase G), contabilidad (Fase H),
configuración — tasa de cambio (ya real) + datos de contacto (Fase I).
Todas mock-first por decisión del usuario, salvo lo que ya está en
Supabase (tasa de cambio). Deuda técnica heredada (RPC transaccional de
stock, auditoría real de inventario, idempotencia de pagos, procesador de
pago real, CI, Docker) reordenada al final del roadmap, no bloquea estas
fases. Detalle y orden en [ROADMAP.md](ROADMAP.md).

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

Los riesgos 1, 2, 4, 5, 6, 7 y 9 no se tocaron en la fase de sistema de
diseño y navegación (no era de lógica de negocio). Quedan como entrada de la
Fase 1 en [ROADMAP.md](ROADMAP.md). *Actualización de la fase de carrito:*
el riesgo 5 se atendió parcialmente (ver arriba); los riesgos 1, 2, 4, 6, 7
y 9 siguen sin tocarse.

## Cómo actualizar este documento

Al cerrar una fase del roadmap: mover sus entregables de "Qué falta" a "Qué
funciona hoy", tachar o cerrar los riesgos resueltos, añadir los riesgos
nuevos que se hayan descubierto, y actualizar la fecha del encabezado.
