# Catálogo de casos a automatizar — saucedemo.com

De básico a complejo, organizado por página/flujo. Los **5 de Login ya están
implementados** en `tests/e2e/login.spec.ts` (ver ranking al final de esa sección).
El resto son *instrucciones para ti* — practica implementándolos en ese orden.

## 1. Login (LOGIN) — ✅ implementados los primeros 5

- **LOGIN-01** — Login con standard_user / secret_sauce. → Redirige a `/inventory.html`.
- **LOGIN-02** — Login con password inválida. → Error de mismatch, se queda en login.
- **LOGIN-03** — Login con username inexistente. → Mismo error de mismatch.
- **LOGIN-04** — Submit con ambos campos vacíos. → Error "Username is required".
- **LOGIN-05** — Submit solo con username (password vacío). → Error "Password is required".
- **LOGIN-06** — Submit solo con password (username vacío). → Error "Username is required".
- **LOGIN-07** — Login con locked_out_user. → Error "Sorry, this user has been locked out."
- **LOGIN-08** — El error tiene botón X; al hacer click desaparece. → Error removido del DOM.
- **LOGIN-09** — Tras un intento fallido, reintentar con credenciales válidas. → Error se limpia y login funciona.
- **LOGIN-10** — Username sensible a mayúsculas (ej. STANDARD_USER). → Rechazado con error de mismatch.
- **LOGIN-11** — El campo password enmascara el input. → `type="password"`.
- **LOGIN-12** — Submit con Enter en vez de click al botón. → Login exitoso.
- **LOGIN-13** — Data-driven: los 6 usuarios conocidos intentan login. → 5 exitosos, locked_out_user falla.
- **LOGIN-14** — Navegar directo a `/inventory.html` sin login. → Redirige a login con error de auth-guard.
- **LOGIN-15** — Acceso directo a `/cart.html`, `/checkout-step-one.html`, etc. sin login. → Mismo error, redirige a login.

### Top 5 implementados primero (ranking y por qué)

1. **LOGIN-01 (login válido)** — la base: define `LoginPage.login()`, el patrón de fixture y el assert de URL. Todo lo demás reutiliza este método.
2. **LOGIN-02 (password inválida)** — introduce el assert de mensaje de error y reutiliza `login()` con datos distintos — primer sabor de parametrización.
3. **LOGIN-07 (locked_out_user)** — mismo método, error distinto — enseña que una acción + distintos asserts es el punto dulce del POM.
4. **LOGIN-04/05/06 (validaciones de campos vacíos, un solo test)** — ideal para un `for...of` sobre `{username, password, expectedError}` — el patrón de loop que ya usas en el battery test de Avianca.
5. **LOGIN-09 (error se limpia al reintentar)** — test multi-paso: falla, assert de error, reintenta, assert de éxito — enseña secuenciación y `not.toBeVisible()`.

## 2. Inventory (INV)

- **INV-01** — Tras login, inventory muestra 6 productos con nombre, descripción, precio, imagen y botón Add to cart.
- **INV-02** — Header muestra "Products" y el logo. → Visible.
- **INV-03** — Sort por Name (A-Z), default. → Orden alfabético ascendente.
- **INV-04** — Sort por Name (Z-A). → Orden descendente.
- **INV-05** — Sort por Price (low-high). → Precios ascendentes.
- **INV-06** — Sort por Price (high-low). → Precios descendentes.
- **INV-07** — Agregar un producto al carrito. → Botón cambia a "Remove", badge muestra 1.
- **INV-08** — Agregar varios productos (ej. 3) en loop. → Badge coincide con la cantidad agregada.
- **INV-09** — Quitar un producto desde inventory. → Botón vuelve a "Add to cart", badge decrementa.
- **INV-10** — Quitar el último producto. → El badge desaparece (no muestra 0).
- **INV-11** — Agregar los 6 productos. → Badge muestra 6, todos los botones dicen "Remove".
- **INV-12** — El estado del carrito persiste al cambiar el sort. → Sigue mostrando "Remove" tras reordenar.
- **INV-13** — El estado persiste tras reload. → Badge sin cambios.
- **INV-14** — Todas las imágenes cargan (src válido) para standard_user. → src único y válido por producto.
- **INV-15** — Cada precio coincide con el catálogo esperado (data-driven). → Precios correctos.

## 3. Product Detail (PDP)

- **PDP-01** — Click en nombre del producto. → Detalle muestra mismo nombre/descripción/precio/imagen.
- **PDP-02** — Click en imagen del producto. → Navega al mismo detalle.
- **PDP-03** — Add to cart desde el detalle. → Badge incrementa, botón cambia a Remove.
- **PDP-04** — Remove desde el detalle (item previamente agregado). → Badge decrementa.
- **PDP-05** — Botón "Back to products". → Vuelve a inventory, carrito intacto.
- **PDP-06** — Datos del detalle coinciden con los de la card de inventory. → Valores idénticos.
- **PDP-07** — URL de detalle con id inválido (ej. `?id=999`). → "ITEM NOT FOUND", sin crash.
- **PDP-08** — Agregar desde inventory, abrir detalle. → Detalle muestra "Remove" (estado sincronizado).

## 4. Cart (CART)

- **CART-01** — Abrir carrito desde el ícono. → `/cart.html`, items con nombre/precio/qty 1 correctos.
- **CART-02** — Carrito vacío. → Lista vacía, botón Checkout sigue presente.
- **CART-03** — Quitar un item. → Desaparece, badge decrementa.
- **CART-04** — Quitar todos los items. → Lista vacía, badge desaparece.
- **CART-05** — Botón "Continue Shopping". → Vuelve a inventory, carrito intacto.
- **CART-06** — Botón "Checkout" con items. → Navega a checkout-step-one.
- **CART-07** — Nombre del item en carrito linkea al detalle del producto. → Producto correcto.
- **CART-08** — Varios items muestran count y qty=1 cada uno. → Coincide con lo agregado.
- **CART-09** — El contenido persiste tras reload (logueado). → Mismos items.

## 5. Checkout Step One (CHK1)

- **CHK1-01** — Llenar first name, last name, postal code; Continue. → Navega a step two.
- **CHK1-02** — Continue con todo vacío. → Error "First Name is required".
- **CHK1-03** — Continue solo con first name. → Error "Last Name is required".
- **CHK1-04** — First + last name sin postal code. → Error "Postal Code is required".
- **CHK1-05** — Error dismissable con X. → Error removido.
- **CHK1-06** — Botón Cancel. → Vuelve al carrito, items intactos.
- **CHK1-07** — Datos random (faker) son aceptados. → Avanza a step two.

## 6. Checkout Step Two — Overview (CHK2)

- **CHK2-01** — Overview lista exactamente los items del carrito con nombre/precio correctos.
- **CHK2-02** — Item total = suma de precios de los items.
- **CHK2-03** — Tax = 8% del item total (redondeado a 2 decimales).
- **CHK2-04** — Total = item total + tax.
- **CHK2-05** — Info de pago (SauceCard) y envío (Free Pony Express) se muestran.
- **CHK2-06** — Botón Cancel. → Vuelve a inventory, carrito preservado.
- **CHK2-07** — Botón Finish. → Navega a checkout-complete.

## 7. Checkout Complete (CHK3)

- **CHK3-01** — Confirmación muestra "Thank you for your order!" y check verde.
- **CHK3-02** — El badge del carrito se limpia tras finalizar.
- **CHK3-03** — Botón "Back Home". → Vuelve a inventory, botones reseteados a "Add to cart".
- **CHK-10** — Checkout con carrito vacío end-to-end. → El sitio lo permite (bug conocido) — documentar/assertar el comportamiento actual, totales en $0.00.
- **CHK-11** — E2E completo feliz: login → agregar 2 items → verificar carrito → checkout con datos → verificar totales → finish → back home.

## 8. Transversal: menú, sesión, estado (MENU / SESSION)

- **MENU-01** — El menú hamburguesa muestra All Items, About, Logout, Reset App State.
- **MENU-02** — Botón X cierra el menú.
- **MENU-03** — "All Items" desde detalle/carrito. → Vuelve a inventory.
- **MENU-04** — "About" apunta a `https://saucelabs.com/` (assert de href).
- **MENU-05** — Logout. → Vuelve a login, cookie de sesión limpiada.
- **MENU-06** — Tras logout, navegar directo a `/inventory.html`. → Error de auth-guard.
- **MENU-07** — Reset App State con items en el carrito. → Badge se limpia.
- **MENU-08** — Bug conocido: tras Reset App State los botones pueden seguir en "Remove" hasta reload. → Documentar, no fallar el test.
- **SESSION-01** — Reusar `storageState` (login una vez en un setup project). → Los tests arrancan ya autenticados en inventory.
- **SESSION-02** — Dos contextos en paralelo tienen carritos independientes. → Sin cruce de datos.

## 9. Usuarios especiales (USER)

- **USER-01** — locked_out_user no puede loguearse (duplicado de LOGIN-07, incluir en la matriz de usuarios).
- **USER-02** — problem_user: todas las imágenes de producto son la misma imagen rota. → Assert de srcs idénticos.
- **USER-03** — problem_user: el dropdown de sort no hace nada. → Orden sin cambios tras seleccionar Z-A.
- **USER-04** — problem_user: algunos Add to cart no funcionan / last name se refleja en first name en checkout. → Documentar vía annotations.
- **USER-05** — performance_glitch_user: login exitoso pero lento. → Inventory carga dentro de un timeout extendido; medir y anotar duración.
- **USER-06** — performance_glitch_user: E2E feliz completo con timeouts generosos.
- **USER-07** — error_user: los botones Remove en el carrito fallan. → Item no se quita, capturar como bug conocido.
- **USER-08** — error_user: Finish (o postal code) del checkout falla/bloquea. → Documentar.
- **USER-09** — visual_user: el flujo funcional completo funciona igual que standard_user.
- **USER-10** — visual_user: comparación visual (`toHaveScreenshot`) vs. baseline de standard_user. → Diffs detectados.
- **USER-11** — Matriz data-driven: flujo smoke (login → agregar item → check badge) para todos los usuarios no bloqueados, parametrizado en loop.

## Tips para automatizar el resto

- **Usa los atributos `data-test`.** Saucedemo decora casi todo (`[data-test="username"]`, `[data-test="inventory-item-name"]`...). Prefiérelos sobre clases/XPath — es el contrato estable del sitio. Ya está configurado `testIdAttribute: "data-test"`, así que usa `getByTestId()`.
- **Data-driven los 6 usuarios.** `src/data/users.ts` ya tiene `USERS` — genera tests en un loop `for...of` en collection time, igual que el battery test de Avianca.
- **Login una vez, reusa `storageState`.** Un setup project que loguea a standard_user y guarda el storageState hace que los tests no-Login arranquen directo en inventory — gran ahorro de tiempo. Los tests de usuarios especiales sí necesitan loguearse explícitamente.
- **Estrategia de espera:** el sitio es una SPA simple — los asserts web-first (`toBeVisible`, `toHaveText`) bastan, sin waits manuales. Solo `performance_glitch_user` necesita timeout más largo — pásalo por assertion puntual, no subas el timeout global.
- **Bugs conocidos como annotations, no como failures.** Para los quirks de problem_user/error_user, sigue la convención del proyecto: assert del comportamiento *real* documentado + `test.info().annotations` (`type: "warning"`), o `test.fail()` si quieres que el runner espere el fallo.
- **Calcula los totales, no los hardcodees.** Para CHK2 (tax/total), suma los precios mostrados en runtime y compara contra subtotal/tax(8%)/total — resiliente si cambia el catálogo.
- **No uses "Reset App State" dentro de otros tests.** Cada test de Playwright ya tiene contexto aislado, así que el carrito nace limpio; usa Reset App State solo cuando lo estés testeando directamente (es buggy, ver MENU-08).
- **CI:** solo chromium + `--workers=4` para smoke en PR (login + un E2E); matriz completa de 3 browsers en nightly; sube el reporte HTML y traces `on-first-retry`. Los tests de visual_user (screenshots) mantenlos en un solo browser/OS para no romper baselines.
