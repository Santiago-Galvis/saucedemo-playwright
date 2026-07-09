# Catálogo de casos a automatizar — saucedemo.com

De básico a complejo, organizado por página/flujo. Los **7 de Login ya están
implementados** en `tests/e2e/login.spec.ts` (ver ranking al final de esa sección).
El resto son *instrucciones para ti* — practica implementándolos en ese orden.

Cada caso incluye el nombre de test sugerido (convención `should [resultado] when [condición]`,
ver CLAUDE.md) para usar directo en `test("...")`.

## 1. Login (LOGIN) — ✅ implementados los primeros 7

- **LOGIN-01** — Login con standard_user / secret_sauce. → Redirige a `/inventory.html`.
  → `test("should redirect to inventory when logging in with valid credentials", ...)`
- **LOGIN-02** — Login con password inválida. → Error de mismatch, se queda en login.
  → `test("should show mismatch error when password is invalid", ...)`
- **LOGIN-03** — Login con username inexistente. → Mismo error de mismatch.
  → `test("should show mismatch error when username does not exist", ...)`
- **LOGIN-04** — Submit con username vacío (ambos campos vacíos, o solo username vacío con password lleno). → Error "Username is required".
  → `test("should validate required fields when submitting incomplete forms", ...)`
- **LOGIN-05** — Submit solo con username (password vacío). → Error "Password is required".
  → `test("should validate required fields when submitting incomplete forms", ...)`
- **LOGIN-06** — Username con espacios en blanco al inicio o al final (ej. `" standard_user "`). → No hace trim, rechazado con error de mismatch.
  → `test("should treat username with leading or trailing whitespace as a mismatch", ...)`
- **LOGIN-07** — Login con locked_out_user. → Error "Sorry, this user has been locked out."
  → `test("should show lockout error for locked_out_user", ...)`
- **LOGIN-08** — El error tiene botón X visible cuando hay un error de login (el click que lo hace desaparecer ya queda cubierto por LOGIN-09).
  → `test("should show a dismiss button when a login error occurs", ...)`
- **LOGIN-09** — Tras un intento fallido, reintentar con credenciales válidas. → Error se limpia y login funciona.
  → `test("should clear the error and log in successfully on retry", ...)`
- **LOGIN-10** — Username sensible a mayúsculas (ej. STANDARD_USER). → Rechazado con error de mismatch.
  → `test("should reject username with different casing", ...)`
- **LOGIN-11** — El campo password enmascara el input. → `type="password"`.
  → `test("should mask the password input", ...)`
- **LOGIN-12** — Submit con Enter en vez de click al botón. → Login exitoso.
  → `test("should log in successfully when submitting with Enter", ...)`
- **LOGIN-13** — Data-driven: los 6 usuarios conocidos intentan login. → 5 exitosos, locked_out_user falla.
  → `test(\`should ${expectSuccess ? "log in" : "show lockout error"} for ${user.username}\`, ...)`
- **LOGIN-14** — Navegar directo a `/inventory.html` sin login. → Redirige a login con error de auth-guard.
  → `test("should redirect to login when accessing inventory without authentication", ...)`
- **LOGIN-15** — Acceso directo a `/cart.html`, `/checkout-step-one.html`, etc. sin login. → Mismo error, redirige a login.
  → `test("should redirect to login when accessing protected pages without authentication", ...)`

### Top 7 implementados primero (ranking y por qué)

1. **LOGIN-01 (login válido)** — la base: define `LoginPage.login()`, el patrón de fixture y el assert de URL. Todo lo demás reutiliza este método.
2. **LOGIN-02 (password inválida)** — introduce el assert de mensaje de error y reutiliza `login()` con datos distintos — primer sabor de parametrización.
3. **LOGIN-07 (locked_out_user)** — mismo método, error distinto — enseña que una acción + distintos asserts es el punto dulce del POM.
4. **LOGIN-04/05 (validaciones de campos vacíos, un solo test)** — ideal para un `for...of` sobre `{username, password, expectedError}` — el patrón de loop que ya usas en el battery test de Avianca.
5. **LOGIN-09 (error se limpia al reintentar)** — test multi-paso: falla, assert de error, reintenta, assert de éxito — enseña secuenciación y `not.toBeVisible()`.
6. **LOGIN-06 (whitespace en username)** — reutiliza `login()`/`expectError()` sin código nuevo en el POM; cubre un edge case de input que el sitio no sanitiza.
7. **LOGIN-08 (botón de dismiss visible)** — solo verifica presencia del botón (`expectDismissButton()`); el click y el "desaparece" ya quedan cubiertos por LOGIN-09, evitando duplicar esa aserción.

## 2. Inventory (INV)

- **INV-01** — Tras login, inventory muestra 6 productos con nombre, descripción, precio, imagen y botón Add to cart.
  → `test("should display 6 products with name, description, price and image", ...)`
- **INV-02** — Header muestra "Products" y el logo. → Visible.
  → `test("should show the Products header and logo", ...)`
- **INV-03** — Sort por Name (A-Z), default. → Orden alfabético ascendente.
  → `test("should sort products by name ascending by default", ...)`
- **INV-04** — Sort por Name (Z-A). → Orden descendente.
  → `test("should sort products by name descending when selected", ...)`
- **INV-05** — Sort por Price (low-high). → Precios ascendentes.
  → `test("should sort products by price ascending when selected", ...)`
- **INV-06** — Sort por Price (high-low). → Precios descendentes.
  → `test("should sort products by price descending when selected", ...)`
- **INV-07** — Agregar un producto al carrito. → Botón cambia a "Remove", badge muestra 1.
  → `test("should add a product to the cart when clicking Add to cart", ...)`
- **INV-08** — Agregar varios productos (ej. 3) en loop. → Badge coincide con la cantidad agregada.
  → `test("should update the cart badge when adding multiple products", ...)`
- **INV-09** — Quitar un producto desde inventory. → Botón vuelve a "Add to cart", badge decrementa.
  → `test("should remove a product from the cart when clicking Remove", ...)`
- **INV-10** — Quitar el último producto. → El badge desaparece (no muestra 0).
  → `test("should hide the cart badge when removing the last product", ...)`
- **INV-11** — Agregar los 6 productos. → Badge muestra 6, todos los botones dicen "Remove".
  → `test("should add all 6 products to the cart", ...)`
- **INV-12** — El estado del carrito persiste al cambiar el sort. → Sigue mostrando "Remove" tras reordenar.
  → `test("should preserve cart state when changing sort order", ...)`
- **INV-13** — El estado persiste tras reload. → Badge sin cambios.
  → `test("should preserve cart state after reloading the page", ...)`
- **INV-14** — Todas las imágenes cargan (src válido) para standard_user. → src único y válido por producto.
  → `test("should load a valid and unique image for each product", ...)`
- **INV-15** — Cada precio coincide con el catálogo esperado (data-driven). → Precios correctos.
  → `test("should show the expected price for each product", ...)`

## 3. Product Detail (PDP)

- **PDP-01** — Click en nombre del producto. → Detalle muestra mismo nombre/descripción/precio/imagen.
  → `test("should navigate to product detail when clicking the product name", ...)`
- **PDP-02** — Click en imagen del producto. → Navega al mismo detalle.
  → `test("should navigate to product detail when clicking the product image", ...)`
- **PDP-03** — Add to cart desde el detalle. → Badge incrementa, botón cambia a Remove.
  → `test("should add the product to the cart from the detail page", ...)`
- **PDP-04** — Remove desde el detalle (item previamente agregado). → Badge decrementa.
  → `test("should remove the product from the cart from the detail page", ...)`
- **PDP-05** — Botón "Back to products". → Vuelve a inventory, carrito intacto.
  → `test("should return to inventory when clicking Back to products", ...)`
- **PDP-06** — Datos del detalle coinciden con los de la card de inventory. → Valores idénticos.
  → `test("should show the same product data as the inventory card", ...)`
- **PDP-07** — URL de detalle con id inválido (ej. `?id=999`). → "ITEM NOT FOUND", sin crash.
  → `test("should show ITEM NOT FOUND for an invalid product id", ...)`
- **PDP-08** — Agregar desde inventory, abrir detalle. → Detalle muestra "Remove" (estado sincronizado).
  → `test("should sync cart state when opening detail after adding from inventory", ...)`

## 4. Cart (CART)

- **CART-01** — Abrir carrito desde el ícono. → `/cart.html`, items con nombre/precio/qty 1 correctos.
  → `test("should navigate to the cart and show added items", ...)`
- **CART-02** — Carrito vacío. → Lista vacía, botón Checkout sigue presente.
  → `test("should show an empty cart with the Checkout button still visible", ...)`
- **CART-03** — Quitar un item. → Desaparece, badge decrementa.
  → `test("should remove an item from the cart", ...)`
- **CART-04** — Quitar todos los items. → Lista vacía, badge desaparece.
  → `test("should clear the cart when removing all items", ...)`
- **CART-05** — Botón "Continue Shopping". → Vuelve a inventory, carrito intacto.
  → `test("should return to inventory when clicking Continue Shopping", ...)`
- **CART-06** — Botón "Checkout" con items. → Navega a checkout-step-one.
  → `test("should navigate to checkout step one when clicking Checkout", ...)`
- **CART-07** — Nombre del item en carrito linkea al detalle del producto. → Producto correcto.
  → `test("should navigate to the product detail when clicking an item name in the cart", ...)`
- **CART-08** — Varios items muestran count y qty=1 cada uno. → Coincide con lo agregado.
  → `test("should show quantity 1 for each added item in the cart", ...)`
- **CART-09** — El contenido persiste tras reload (logueado). → Mismos items.
  → `test("should preserve cart contents after reloading while logged in", ...)`

## 5. Checkout Step One (CHK1)

- **CHK1-01** — Llenar first name, last name, postal code; Continue. → Navega a step two.
  → `test("should navigate to step two when submitting valid checkout information", ...)`
- **CHK1-02** — Continue con todo vacío. → Error "First Name is required".
  → `test("should show first name required error when all fields are empty", ...)`
- **CHK1-03** — Continue solo con first name. → Error "Last Name is required".
  → `test("should show last name required error when last name is missing", ...)`
- **CHK1-04** — First + last name sin postal code. → Error "Postal Code is required".
  → `test("should show postal code required error when postal code is missing", ...)`
- **CHK1-05** — Error dismissable con X. → Error removido.
  → `test("should dismiss the checkout error when clicking the close button", ...)`
- **CHK1-06** — Botón Cancel. → Vuelve al carrito, items intactos.
  → `test("should return to the cart when clicking Cancel", ...)`
- **CHK1-07** — Datos random (faker) son aceptados. → Avanza a step two.
  → `test("should accept randomly generated checkout information", ...)`

## 6. Checkout Step Two — Overview (CHK2)

- **CHK2-01** — Overview lista exactamente los items del carrito con nombre/precio correctos.
  → `test("should list the exact cart items with correct name and price", ...)`
- **CHK2-02** — Item total = suma de precios de los items.
  → `test("should calculate item total as the sum of item prices", ...)`
- **CHK2-03** — Tax = 8% del item total (redondeado a 2 decimales).
  → `test("should calculate tax as 8% of the item total", ...)`
- **CHK2-04** — Total = item total + tax.
  → `test("should calculate total as item total plus tax", ...)`
- **CHK2-05** — Info de pago (SauceCard) y envío (Free Pony Express) se muestran.
  → `test("should show payment and shipping information", ...)`
- **CHK2-06** — Botón Cancel. → Vuelve a inventory, carrito preservado.
  → `test("should return to inventory when clicking Cancel on the overview", ...)`
- **CHK2-07** — Botón Finish. → Navega a checkout-complete.
  → `test("should navigate to checkout complete when clicking Finish", ...)`

## 7. Checkout Complete (CHK3)

- **CHK3-01** — Confirmación muestra "Thank you for your order!" y check verde.
  → `test("should show the order confirmation message and green check", ...)`
- **CHK3-02** — El badge del carrito se limpia tras finalizar.
  → `test("should clear the cart badge after completing the order", ...)`
- **CHK3-03** — Botón "Back Home". → Vuelve a inventory, botones reseteados a "Add to cart".
  → `test("should reset cart buttons when returning home after checkout", ...)`
- **CHK-10** — Checkout con carrito vacío end-to-end. → El sitio lo permite (bug conocido) — documentar/assertar el comportamiento actual, totales en $0.00.
  → `test("should allow checkout with an empty cart showing $0.00 totals", ...)`
- **CHK-11** — E2E completo feliz: login → agregar 2 items → verificar carrito → checkout con datos → verificar totales → finish → back home.
  → `test("should complete the full happy path checkout flow", ...)`

## 8. Transversal: menú, sesión, estado (MENU / SESSION)

- **MENU-01** — El menú hamburguesa muestra All Items, About, Logout, Reset App State.
  → `test("should show all menu options in the hamburger menu", ...)`
- **MENU-02** — Botón X cierra el menú.
  → `test("should close the menu when clicking the close button", ...)`
- **MENU-03** — "All Items" desde detalle/carrito. → Vuelve a inventory.
  → `test("should return to inventory when clicking All Items", ...)`
- **MENU-04** — "About" apunta a `https://saucelabs.com/` (assert de href).
  → `test("should link About to saucelabs.com", ...)`
- **MENU-05** — Logout. → Vuelve a login, cookie de sesión limpiada.
  → `test("should log out and clear the session cookie", ...)`
- **MENU-06** — Tras logout, navegar directo a `/inventory.html`. → Error de auth-guard.
  → `test("should redirect to login when accessing inventory after logout", ...)`
- **MENU-07** — Reset App State con items en el carrito. → Badge se limpia.
  → `test("should clear the cart badge when resetting app state", ...)`
- **MENU-08** — Bug conocido: tras Reset App State los botones pueden seguir en "Remove" hasta reload. → Documentar, no fallar el test.
  → `test("should document that Add to cart buttons may stay as Remove after resetting app state", ...)`
- **SESSION-01** — Reusar `storageState` (login una vez en un setup project). → Los tests arrancan ya autenticados en inventory.
  → (no es un test individual — setup project, ver `global.setup.ts` sugerido en Decisiones técnicas)
- **SESSION-02** — Dos contextos en paralelo tienen carritos independientes. → Sin cruce de datos.
  → `test("should keep independent carts across parallel browser contexts", ...)`

## 9. Usuarios especiales (USER)

- **USER-01** — locked_out_user no puede loguearse (duplicado de LOGIN-07, incluir en la matriz de usuarios).
  → cubierto por el data-driven de LOGIN-13, no necesita test propio.
- **USER-02** — problem_user: todas las imágenes de producto son la misma imagen rota. → Assert de srcs idénticos.
  → `test("should show the same broken image for all products for problem_user", ...)`
- **USER-03** — problem_user: el dropdown de sort no hace nada. → Orden sin cambios tras seleccionar Z-A.
  → `test("should keep default sort order for problem_user regardless of sort selection", ...)`
- **USER-04** — problem_user: algunos Add to cart no funcionan / last name se refleja en first name en checkout. → Documentar vía annotations.
  → `test("should document known Add to cart and checkout field bugs for problem_user", ...)`
- **USER-05** — performance_glitch_user: login exitoso pero lento. → Inventory carga dentro de un timeout extendido; medir y anotar duración.
  → `test("should log in successfully for performance_glitch_user within an extended timeout", ...)`
- **USER-06** — performance_glitch_user: E2E feliz completo con timeouts generosos.
  → `test("should complete the full checkout flow for performance_glitch_user", ...)`
- **USER-07** — error_user: los botones Remove en el carrito fallan. → Item no se quita, capturar como bug conocido.
  → `test("should document that Remove buttons fail in the cart for error_user", ...)`
- **USER-08** — error_user: Finish (o postal code) del checkout falla/bloquea. → Documentar.
  → `test("should document that checkout completion fails for error_user", ...)`
- **USER-09** — visual_user: el flujo funcional completo funciona igual que standard_user.
  → `test("should complete the full checkout flow for visual_user", ...)`
- **USER-10** — visual_user: comparación visual (`toHaveScreenshot`) vs. baseline de standard_user. → Diffs detectados.
  → `test("should detect visual differences for visual_user against the standard_user baseline", ...)`
- **USER-11** — Matriz data-driven: flujo smoke (login → agregar item → check badge) para todos los usuarios no bloqueados, parametrizado en loop.
  → `test(\`should complete a smoke flow for ${user.username}\`, ...)`

## Tips para automatizar el resto

- **Usa los atributos `data-test`.** Saucedemo decora casi todo (`[data-test="username"]`, `[data-test="inventory-item-name"]`...). Prefiérelos sobre clases/XPath — es el contrato estable del sitio. Ya está configurado `testIdAttribute: "data-test"`, así que usa `getByTestId()`.
- **Data-driven los 6 usuarios.** `src/data/users.ts` ya tiene `USERS` — genera tests en un loop `for...of` en collection time, igual que el battery test de Avianca.
- **Login una vez, reusa `storageState`.** Un setup project que loguea a standard_user y guarda el storageState hace que los tests no-Login arranquen directo en inventory — gran ahorro de tiempo. Los tests de usuarios especiales sí necesitan loguearse explícitamente.
- **Estrategia de espera:** el sitio es una SPA simple — los asserts web-first (`toBeVisible`, `toHaveText`) bastan, sin waits manuales. Solo `performance_glitch_user` necesita timeout más largo — pásalo por assertion puntual, no subas el timeout global.
- **Bugs conocidos como annotations, no como failures.** Para los quirks de problem_user/error_user, sigue la convención del proyecto: assert del comportamiento *real* documentado + `test.info().annotations` (`type: "warning"`), o `test.fail()` si quieres que el runner espere el fallo.
- **Calcula los totales, no los hardcodees.** Para CHK2 (tax/total), suma los precios mostrados en runtime y compara contra subtotal/tax(8%)/total — resiliente si cambia el catálogo.
- **No uses "Reset App State" dentro de otros tests.** Cada test de Playwright ya tiene contexto aislado, así que el carrito nace limpio; usa Reset App State solo cuando lo estés testeando directamente (es buggy, ver MENU-08).
- **CI:** solo chromium + `--workers=4` para smoke en PR (login + un E2E); matriz completa de 3 browsers en nightly; sube el reporte HTML y traces `on-first-retry`. Los tests de visual_user (screenshots) mantenlos en un solo browser/OS para no romper baselines.
