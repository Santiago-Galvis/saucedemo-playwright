# Proyecto: claude-pw-saucedemo

## Contexto general

Proyecto de **práctica** con Playwright + TypeScript contra `https://www.saucedemo.com/`.
Plantilla derivada de un proyecto real de automation (Avianca booking) — conserva las
convenciones que probaron funcionar ahí, adaptadas a un sitio mucho más simple.

Diferencia clave vs. Avianca: saucedemo decora casi todo con `data-test="..."`, así que
aquí **sí hay** buenos test-ids. Se usa `getByTestId()` en vez de XPath/CSS como selector
por defecto (`testIdAttribute: "data-test"` en `playwright.config.ts`).

## Stack técnico

- Playwright + TypeScript, patrón POM (igual estructura que el proyecto Avianca)
- `src/pages/` — Page Objects (heredan `BasePage`)
- `src/fixtures/index.ts` — páginas instanciadas para los tests
- `src/data/` — datos de prueba (usuarios, nunca hardcodear en tests)
- `src/constants/index.ts` — selectores agrupados por página
- `src/types/index.ts` — interfaces TypeScript del dominio

### ¿Qué va en `types` vs `data` vs `constants`?

Misma regla que Avianca:
- Solo tipa (nunca en `for`/`if`/`includes`) → `types` (ej. `SortOption`)
- Se itera o valida en runtime → `data` (ej. `USERS`, `PASSWORD`)
- Ligado a selectores de la app → `constants` (ej. `SELECTORS.login.*`)

## Selectores

### Jerarquía (igual que Avianca, pero aquí sí llegamos al top)
```
1. getByTestId() — saucedemo tiene data-test en casi todo, úsalo por defecto
2. getByRole() / getByLabel()
3. getByPlaceholder()
4. CSS semántico — último recurso, casi nunca necesario en este sitio
```

### Nomenclatura: `prefix_camelCase` (heredada de Avianca)
```
btn_      → clickeables        input_    → campos de texto
dropdown_ → listas/combobox    lbl_      → texto estático
msg_      → mensajes error     icon_     → íconos con assertion
chk_      → checkboxes         modal_    → contenedores modal
```

## Convenciones de Page Objects

- Métodos = acciones de usuario: `login()` ✅ — `fillUsernameInput()` ❌
- Tests en inglés: `should [resultado] when [condición]`
- Sin `page.pause()` commiteado (ESLint lo bloquea)
- Sin `console.log` en tests

## BasePage — qué hay y qué falta a propósito

`BasePage.ts` arranca mínimo (`navigate`, `getFirst`/`clickFirst`, `waitForVisible`,
`isVisible`, `getCookie`, `expectVisibleText`) porque solo existe `LoginPage` por ahora.
A medida que construyas InventoryPage/CartPage/CheckoutPage vas a necesitar (patrones
que sí sirvieron en Avianca — impleméntalos ahí cuando aparezca el caso real, no antes):

- **`clickRandomFrom(selector)`** — útil para "agregar un producto random al carrito"
- **`dispatchRandomClick(selector)`** — solo si algún botón no responde a click normal
  (en Avianca esto pasaba con Angular + overlays; en saucedemo, React simple, probablemente
  no lo necesites — no lo agregues preventivamente)
- **`interceptLastResponse(urlPattern, action)`** — saucedemo no tiene backend real
  (todo es JS en memoria), así que este método probablemente **no aplica** aquí
- **`getCssSpecificStyle(locator, properties)`** — útil si automatizas USER-10 (visual_user,
  comparar estilos/posiciones rotas)
- **`count() === 0` para elementos opcionales** — mismo motivo que Avianca: `locator()`
  nunca es null, `count()` nunca lanza error

## Convenciones de assertions

Idénticas a Avianca — usar siempre la API idiomática de Playwright, nunca `if + throw`:

```typescript
// ✅ Assertion bloqueante (invariante que siempre debe cumplirse)
await expect(locator, "mensaje").toHaveText("...");

// ✅ Comportamiento conocido pero "raro" de un usuario especial (problem_user, error_user)
// no bloquea el test, pero queda visible en el reporte
if (actualBehavior !== expectedBehavior) {
  test.info().annotations.push({ type: "warning", description: "..." });
}
```

Regla general: `expect` para el flujo feliz (standard_user); `test.info().annotations`
para documentar bugs conocidos de los usuarios especiales — no marques el test como
fallido por un bug que el sitio tiene a propósito, documéntalo.

## Decisiones técnicas del proyecto

- **`testIdAttribute: "data-test"`** — evita escribir `[data-test="x"]` a mano en cada
  selector; `page.getByTestId("x")` ya lo resuelve
- **Sin `global.setup.ts`** — a diferencia de Avianca no hay POS/idioma que configurar;
  si más adelante usas `storageState` para saltarte el login en tests que no son de
  LoginPage, ahí sí vale la pena un setup project (ver TIPS en TEST_CASES.md)
- **Password única `secret_sauce`** — se guarda en `src/data/users.ts` como constante
  `PASSWORD`, nunca hardcodeada en un test
- **Usuarios especiales como datos, no como casos hardcodeados** — `USERS` en
  `src/data/users.ts` permite iterar con `for...of` en vez de repetir un test por usuario
  (ver LOGIN-13 y USER-11 en TEST_CASES.md)
- **Timeout de `performance_glitch_user` no sube el timeout global** — pasar timeout
  explícito solo en esa assertion (`TIMEOUTS.GLITCH_USER`), igual que Avianca solo subía
  a `TIMEOUTS.LONG` en pasos puntuales, no en todo el config

## Forma de proponer soluciones

Misma regla que Avianca: explicar **por qué** se propone así, indicar la **mejor
práctica** aunque difiera de lo pedido, y dar **opciones con trade-offs** cuando aplique.
No complacer si algo es subóptimo.

## Estado del flujo

| Página | Estado | Notas |
|---|---|---|
| LoginPage | ✅ | 5 tests base — ver `tests/e2e/login.spec.ts` |
| InventoryPage | ⏳ Pendiente | El usuario la construye practicando — ver TEST_CASES.md |
| ProductDetailPage | ⏳ Pendiente | — |
| CartPage | ⏳ Pendiente | — |
| CheckoutPage (steps 1/2/complete) | ⏳ Pendiente | — |

Ver `TEST_CASES.md` para el catálogo completo de casos a automatizar, de básico a complejo.
