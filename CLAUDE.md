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

Útil cuando necesitás encontrar un elemento específico dentro de un grupo repetido
(ej. un producto puntual dentro de todos los `inventory-item`), en vez de iterar con
`.all()` o depender de índice. Opciones (combinables entre sí):

- **`has`**: `Locator` — el elemento debe contener un descendiente que matchee ese locator.
  Permite exact match si el locator interno lo pide (ej. `getByText(x, { exact: true })`).
- **`hasNot`**: `Locator` — inverso de `has`.
- **`hasText`**: `string | RegExp` — el elemento (o un descendiente) debe contener ese texto.
  Match por substring/regex, no exacto por defecto — más simple que `has` + `getByText`
  cuando no importa el exact match.
- **`hasNotText`**: `string | RegExp` — inverso de `hasText`.
- **`visible`**: `boolean` — filtra por si el elemento está visible o no.

Ejemplo real en `InventoryPage.addProductToCartByName()`:
```typescript
this.page
  .getByTestId(SELECTORS.inventory.div_inventoryItem)
  .filter({ has: this.page.getByText(productName, { exact: true }) });
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

### `.length` vs `.count()`

- **`.length`** — propiedad síncrona de un array ya resuelto (ej. tras `await locator.all()`).
  No vuelve a consultar el DOM; úsalo si ya tenés el array porque vas a iterar cada elemento.
- **`.count()`** — método async de `Locator` que consulta el DOM en el momento de la llamada,
  sin necesitar `.all()` antes. Preferilo cuando solo necesitás el número, sin iterar.

### Cuándo resolver `.all()` — en la declaración vs. en el loop

No es una cuestión de timing (la diferencia real de milisegundos es irrelevante): es de
flexibilidad de la variable.

```typescript
// Opción A — allProducts queda como Locator (lazy), resuelto recién en el for
const allProducts = this.page.getByTestId(SELECTORS.inventory.div_inventoryItem);
for (const product of await allProducts.all()) { ... }

// Opción B — allProducts se resuelve a Locator[] ya en la declaración
const allProducts = await this.page.getByTestId(SELECTORS.inventory.div_inventoryItem).all();
```

Usá la **Opción A** si en la misma función necesitás otras operaciones de `Locator` sobre
el mismo grupo antes o después del loop (ej. `await expect(allProducts).toHaveCount(6)`,
como en `checkInventoryDisplayedItems`) — perderías esa variable si ya la resolviste a array.

Usá la **Opción B** si el único uso es iterar (ej. `addAllProductsToCartAndCheckCartBadge`) —
más simple, sin necesidad de mantener el `Locator` original.

## Estructuras de datos en JS/TS — Array, Tuple, Set, Map

### Array — lista ordenada, permite duplicados

Todos estos métodos **mutan el array original in-place** (no crean uno nuevo) — ninguno
"reemplaza", cada uno inserta o elimina en un extremo (o en una posición con `splice`):

```typescript
const names: string[] = ["Backpack", "Bike Light"];

names.push("Onesie");
// inserta "Onesie" al final → names queda: ["Backpack", "Bike Light", "Onesie"]
// retorna el nuevo length del array (3), no el elemento insertado

const removed = names.pop();
// elimina el último elemento → names queda: ["Backpack", "Bike Light"]
// retorna el elemento eliminado → removed = "Onesie"

names.unshift("Fleece");
// inserta "Fleece" al inicio → names queda: ["Fleece", "Backpack", "Bike Light"]

const removedFirst = names.shift();
// elimina el primer elemento → names queda: ["Backpack", "Bike Light"]
// retorna el elemento eliminado → removedFirst = "Fleece"

names.splice(1, 1);
// elimina 1 elemento a partir del índice 1 (remove por posición)
// si names era ["Backpack", "Bike Light"], queda: ["Backpack"]

const idx = names.indexOf("Bike Light");
if (idx !== -1) names.splice(idx, 1); // remove por valor (no hay .remove() nativo en Array)

names.includes("Backpack");   // true/false — no muta, solo consulta
names.length;                 // tamaño actual — propiedad, no método
```

Particularidad: acepta duplicados y mantiene orden de inserción. Es la estructura por
defecto para casi todo en este proyecto (ej. `productNames`, `imageSrcs`).

### Tuple — array de tamaño y tipos fijos (solo existe a nivel de tipo en TS)

```typescript
const point: [number, number] = [10, 20];
const userEntry: [string, boolean] = ["standard_user", true];
```

En runtime es un array común de JS (no hay diferencia de comportamiento) — la tupla es
una anotación de **TypeScript** que fija cantidad y tipo por posición, TS marca error si
hacés `point.push(30)` sin declarar esa posición extra en el tipo. Útil cuando el orden y
la cantidad de valores importan (ej. un par `[label, value]`), no lo usamos aún en este
proyecto pero puede aparecer al tipar retornos con múltiples valores.

### Set — solo valores únicos, sin índices

```typescript
const uniqueSrcs = new Set(imageSrcs); // constructor recibe cualquier iterable (array, etc.)

uniqueSrcs.add("nueva-img.jpg");   // agrega (ignora si ya existe, sin error)
uniqueSrcs.delete("nueva-img.jpg"); // remove por valor directo
uniqueSrcs.has("a.jpg");           // true/false — más rápido que Array.includes en sets grandes
uniqueSrcs.size;                   // cantidad de elementos (no `.length`, eso es de Array)
[...uniqueSrcs];                   // convertir de vuelta a array si hace falta iterar con índice
```

Particularidad clave: al construirlo con `new Set(array)`, cualquier duplicado del array
de origen se colapsa automáticamente — por eso `new Set(imageSrcs).size !== imageSrcs.length`
es la forma idiomática de detectar duplicados (ver `checkAllProductImagesAreValidAndUnique`).
No tiene orden por índice ni `.push()`/`.pop()` — sus métodos son `.add()` / `.delete()` / `.has()`.

### Map — pares clave-valor, cualquier tipo como clave

```typescript
const pricesByName = new Map<string, number>();

pricesByName.set("Backpack", 29.99);  // agrega o actualiza (push/update es el mismo método)
pricesByName.get("Backpack");          // 29.99, o undefined si no existe
pricesByName.delete("Backpack");       // remove por clave
pricesByName.has("Backpack");          // true/false
pricesByName.size;                     // cantidad de pares
for (const [name, price] of pricesByName) { ... } // iterar pares
```

Particularidad: a diferencia de un objeto plano `{}`, las claves pueden ser de cualquier
tipo (no solo string), mantiene orden de inserción, y `.size` es una propiedad (no método,
a diferencia de `.has()`/`.get()`). No lo usamos todavía en este proyecto, pero sería la
opción natural si necesitáramos, por ejemplo, mapear nombre de producto → precio para
validar sin recorrer el array cada vez.

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

No todos los matchers de `expect` reintentan: los que reciben un `Locator`/`Page`/`Response`
sí (hacen polling hasta el timeout de `expect.timeout`, 5s por default de Playwright — no
está sobreescrito en `playwright.config.ts`); los que operan sobre un valor plano ya resuelto
(`toEqual`, `toBe`, `toContain`) son síncronos, sin retry. Pista rápida: si hacés
`await expect(locator).toX()` sobre el locator directo (no sobre un valor ya extraído con
`await locator.algo()`), es web-first.

Los que vamos a usar en este proyecto:
`toBeVisible` / `toBeHidden`, `toBeEnabled` / `toBeDisabled`, `toBeChecked`, `toBeEditable`,
`toBeFocused`, `toHaveAttribute`, `toHaveClass`, `toHaveCSS`, `toHaveCount`,
`toHaveText` / `toContainText`, `toHaveValue` / `toHaveValues`, `toHaveURL` (sobre `Page`),
`toHaveTitle` (sobre `Page`).

Por eso en `BasePage.expectAttribute()` no hace falta leer el atributo a mano antes del
`expect` para "asegurar" el valor — `toHaveAttribute` ya reintenta solo.

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

Repo en GitHub: `Santiago-Galvis/saucedemo-playwright` — **público** (necesario para
GitHub Pages gratis; el repo no tiene colaboradores ni acepta PRs externos, y
"Run workflows from fork pull requests" está desmarcado, así que un fork no puede
disparar el runner).

**VM**: Oracle Cloud, `VM.Standard.A1.Flex`, Ubuntu 20.04 ARM64, usuario `ubuntu`,
región `sa-bogota-1`. IP pública asignada como *ephemeral* (se pierde si la instancia
se detiene, hay que reasignarla). Oracle recortó el Always Free tier de A1 a 2 OCPU/12GB
(desde 4/24) sin aviso oficial en junio 2026 — la instancia del usuario se dejó en 4
OCPU/24GB sin bajarla; pendiente confirmar en Billing si eso genera costo o riesgo de
apagado. Revisar `Billing & Cost Management → Cost Analysis` si hay dudas.

**Runner**: registrado en `~/actions-runner`, corre como servicio systemd
(`sudo ./svc.sh install && start`), status se ve en Settings → Actions → Runners.
Browsers de Playwright **preinstalados manualmente en la VM** (no en el workflow) via
`npm ci && npx playwright install --with-deps`, corrido dentro del checkout real:
`~/actions-runner/_work/saucedemo-playwright/saucedemo-playwright/`. Si se actualiza
`@playwright/test` en `package.json`, hay que repetir ese install a mano — el workflow
no lo hace automático (se sacó ese paso para bajar el tiempo de CI de ~3min).
WebKit da warning de "frozen browser" por ser Ubuntu 20.04 — no rompe nada, pero
eventualmente convendría actualizar el OS de la VM.

**Workflow**: `.github/workflows/e2e.yml`, corre los 3 browsers en cada push/PR a `main`.
Genera un dashboard HTML con las últimas 5 corridas, publicado en GitHub Pages
(`https://santiago-galvis.github.io/saucedemo-playwright/`):
- El histórico real vive en `/home/ubuntu/pages-history/` en la VM (persiste entre
  runs, fuera del workspace que `actions/checkout` limpia). Cada run se copia a
  `pages-history/runs/<run_number>-<timestamp>/`, se poda todo lo que exceda 5 carpetas
  (`MAX_RUNS` en el workflow), y se regenera `pages-history/index.html` como dashboard.
- El pass/fail de cada run se guarda en un archivo sidecar `.status` (con el
  `steps.test.outcome` del job) — **no** se puede detectar grepeando el reporte HTML de
  Playwright porque los datos de test vienen en un blob codificado que solo decodifica
  el JS del browser, no texto plano.
- El job seguía marcándose "success" aunque los tests fallaran (por el
  `continue-on-error: true` necesario para que el archivado/deploy corra siempre) — se
  agregó un paso final que hace `exit 1` si `steps.test.outcome == 'failure'`.
- Pages Source en Settings está en "GitHub Actions" (no "Deploy from a branch").
- Pendiente/a evaluar: si se automatizan más sitios además de saucedemo con el mismo
  runner, conviene contenedores Docker por job (imagen `mcr.microsoft.com/playwright`)
  para aislar dependencias, y una herramienta de reporting centralizada en vez de
  replicar esta lógica de rotación por proyecto.

Ver `CI_CD_GUIDE.md` para la guía paso a paso original (algunos detalles ahí, como
`npx playwright install --with-deps` dentro del workflow, quedaron desactualizados
respecto a lo realmente implementado — esta sección es la fuente de verdad actual).
