# Proyecto: claude-pw-saucedemo

## Idioma

Todas las respuestas de Claude en este proyecto deben ser en español.

## Contexto general

Proyecto de **práctica** con Playwright + TypeScript contra `https://www.saucedemo.com/`.
Plantilla derivada de un proyecto real de automation (Avianca booking) — conserva las
convenciones que probaron funcionar ahí, adaptadas a un sitio mucho más simple.

Diferencia clave vs. Avianca: saucedemo decora casi todo con `data-test="..."`, así que
aquí **sí hay** buenos test-ids. Se usa `getByTestId()` en vez de XPath/CSS como selector
por defecto (`testIdAttribute: "data-test"` en `playwright.config.ts`).

## Cómo se reparte la documentación de este proyecto

`CLAUDE.md` se carga automáticamente en **cada** sesión — es el único de estos archivos
con ese comportamiento. Por eso debe mantenerse **conciso**: solo convenciones,
decisiones del proyecto y contexto que siempre hace falta tener a mano. Si una sección
crece hasta volverse referencia de API o runbook de infraestructura, se mueve a un doc
específico y acá queda solo un puntero de 1-2 líneas — salvo que el contenido en sí sea
tan central al día a día (ej. reglas de `types`/`data`/`constants`, convenciones de
nombres) que amerite quedarse igual de extenso; en ese caso está bien que así sea.

El resto de los `.md` (`docs/*.md`, `TEST_CASES.md`, `CI_CD_GUIDE.md`) **no se cargan
solos** — solo se leen si el usuario los referencia o si hace falta para la tarea en
curso. Reparto:

- **`docs/PLAYWRIGHT_REFERENCE.md`** — documentación de **estudio/repaso** para el
  usuario: toda la API de Playwright/TS que se use en el proyecto (matchers de
  `expect` y sus variantes, `.filter()`, `selectOption`, `.sort()`, conversión de tipos,
  estructuras de datos JS/TS, etc.). **Actualizar proactivamente** cada vez que se
  explica o usa una API nueva o una variante no documentada aún — no esperar a que el
  usuario lo pida, este doc es su material de repaso.
- **`docs/CI_CD.md`** — estado actual de infraestructura/pipeline (fuente de verdad).
- **`docs/CLAUDE_TIPS.md`** / **`docs/COMMANDS.md`** — tips de uso de Claude Code y
  comandos del proyecto. **Actualizar cuando surja un tip o comando nuevo útil durante
  la sesión** (ej. un flag de CLI que se usó, una forma más eficiente de pedir algo) —
  mismo criterio que `PLAYWRIGHT_REFERENCE.md`: no esperar a que se pida explícito.
- **`TEST_CASES.md`** — catálogo de casos a automatizar.

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

### `.filter()` sobre locators — para escoger un item dentro de una lista

Convención del proyecto: usar `.filter()` en vez de iterar con `.all()` o depender de
índice cuando necesitás un elemento puntual dentro de un grupo repetido (ver
`InventoryPage.getProductByName()`). Detalle completo de las opciones (`has`, `hasNot`,
`hasText`, `hasNotText`, `visible`) → `docs/PLAYWRIGHT_REFERENCE.md`.

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

> **Referencia de API detallada (`.length` vs `.count()`, cuándo resolver `.all()`,
> Array/Tuple/Set/Map, `expect`/matchers) → ver `docs/PLAYWRIGHT_REFERENCE.md`.**
> `CLAUDE.md` se queda con convenciones y decisiones del proyecto; el detalle de API
> vive en la referencia para no duplicar contenido.

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

### Web-first assertions (auto-retry)

Regla rápida: matchers sobre `Locator`/`Page`/`Response` reintentan hasta
`expect.timeout` (5s default); matchers sobre un valor ya resuelto (`toEqual`, `toBe`,
`toContain`) son síncronos, sin retry. Por eso en `BasePage.expectAttribute()` no hace
falta leer el atributo a mano antes del `expect` — `toHaveAttribute` ya reintenta solo.
Catálogo completo de matchers, variantes y ejemplos → `docs/PLAYWRIGHT_REFERENCE.md`.

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

## CI/CD — self-hosted runner en OCI (implementado)

Repo público `Santiago-Galvis/saucedemo-playwright`, runner self-hosted en una VM de
Oracle Cloud, workflow `.github/workflows/e2e.yml` corre los 3 browsers en cada push/PR
a `main` y publica un dashboard en GitHub Pages.

Detalle completo del estado actual (VM, runner, workflow, pendientes) →
**`docs/CI_CD.md`** (fuente de verdad). `CI_CD_GUIDE.md` en la raíz es la guía paso a
paso original, con algunos detalles desactualizados respecto a `docs/CI_CD.md`.
