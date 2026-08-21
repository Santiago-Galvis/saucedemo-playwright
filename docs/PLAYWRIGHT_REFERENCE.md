# Playwright Reference — APIs y comportamiento

Documentación de referencia de las APIs de Playwright más usadas en `claude-pw-saucedemo`.
Fuente: experiencia real construyendo `InventoryPage` + docs oficiales.

---

## Selectores

### Jerarquía en este proyecto (ver también `CLAUDE.md`)
```
1. getByTestId()      — saucedemo tiene data-test en casi todo, úsalo por defecto
2. getByRole()        — cuando el data-test varía por item (ej. botón add-to-cart por producto)
3. getByText()        — texto estático sin rol útil (ej. el logo "Swag Labs")
4. CSS semántico       — último recurso, casi nunca necesario en este sitio
```

### `.filter()` sobre locators — escoger un item dentro de una lista

Útil para encontrar un elemento específico dentro de un grupo repetido (ej. un
producto puntual dentro de todos los `inventory-item`), en vez de iterar con `.all()`
o depender de índice.

```typescript
this.page
  .getByTestId(SELECTORS.inventory.div_inventoryItem)
  .filter({ has: this.page.getByText(productName, { exact: true }) });
```

Opciones (combinables entre sí):
- **`has`**: `Locator` — el elemento debe contener un descendiente que matchee ese
  locator. Permite exact match si el locator interno lo pide (`getByText(x, { exact: true })`).
- **`hasNot`**: `Locator` — inverso de `has`.
- **`hasText`**: `string | RegExp` — el elemento (o un descendiente) debe contener ese
  texto. Match por substring/regex, no exacto por defecto — más simple que `has` +
  `getByText` cuando no importa el exact match.
- **`hasNotText`**: `string | RegExp` — inverso de `hasText`.
- **`visible`**: `boolean` — filtra por si el elemento está visible o no.

`has: getByText(x, { exact: true })` vs `hasText: x` dan resultados distintos: el
primero exige match exacto, el segundo hace substring por default. Preferir exact match
cuando nombres de productos podrían ser substring uno del otro (ej. "Sauce Labs Bike
Light" vs un futuro "Sauce Labs Bike Light Pro").

---

## Accessible name vs atributo HTML `name`

**No confundir** estas dos cosas, aunque se llamen parecido:

- **Atributo HTML `name="..."`** — solo relevante para submits de formulario
  (`<input>`, `<select>`). En un `<button>` normal **no afecta nada** de accesibilidad.
- **Accessible name** — lo que usa `getByRole(role, { name })`. Para un `<button>` sin
  `aria-label`, se calcula del **contenido de texto visible**.

Ejemplo real de saucedemo:
```html
<button data-test="remove-sauce-labs-backpack" id="remove-sauce-labs-backpack"
        name="remove-sauce-labs-backpack">Remove</button>
```
El accessible name es `"Remove"` (el texto entre tags), **no** el string del atributo
`name`. `getByRole("button", { name: "Remove" })` matchea por eso, y es el mismo texto
para todos los productos (a diferencia del `data-test`, que sí varía por producto).

Para inspeccionar el accessible name real sin adivinar:
- Playwright Inspector → ícono `</>` ("Assert snapshot") en vez del picker de locator
  (ese prioriza `data-test` y no muestra accesibilidad)
- Chrome DevTools → pestaña "Accessibility" del panel de elementos

Para *afirmar* el accessible name de un locator ya resuelto (en vez de usarlo como
criterio de búsqueda):
```typescript
await expect(locator).toHaveAccessibleName("Remove");
```

---

## `selectOption()` — dropdowns `<select>`

```typescript
await locator.selectOption("value");                 // por value del <option> (default si es string)
await locator.selectOption({ value: "za" });          // explícito, igual al anterior
await locator.selectOption({ label: "Name (Z to A)" }); // por texto visible
await locator.selectOption({ index: 1 });             // por índice
await locator.selectOption(["az", "lohi"]);           // <select multiple>
```

En este proyecto usamos `value` (`SORT_OPTIONS.NAME_ASC` = `"az"`, etc.) porque es más
estable que el label — el copy visible puede cambiar, el `value` interno no.

---

## `.sort()` — comparadores

`.sort()` sin comparador ordena **como strings** — incluso arrays de números
(`[10, 2, 1].sort()` → `[1, 10, 2]`, mal). Siempre pasar comparador para números/fechas.

```typescript
// Números ascendente / descendente
[5, 1, 3].sort((a, b) => a - b);   // [1, 3, 5]
[5, 1, 3].sort((a, b) => b - a);   // [5, 3, 1]

// Strings ascendente / descendente ("humano", no por code unit)
["b", "a"].sort((a, b) => a.localeCompare(b));
["b", "a"].sort((a, b) => b.localeCompare(a));
```

Los nombres `a`/`b` son arbitrarios (no reservados) — importa solo el orden posicional:
negativo → `a` antes que `b`; positivo → después; cero → empatan. `a + b` **no** sirve
como comparador (no codifica ninguna relación de orden, deja el array básicamente sin
ordenar).

`[...array].sort(...)` copia el array antes de ordenar (`.sort()` muta in-place) —
importante si necesitás conservar el original para comparar contra la copia ordenada.

---

## Destructuring de parámetros (objeto → variables sueltas)

Cuando una función recibe un objeto tipado, se puede "desempacar" directo en la firma
en vez de recibirlo con un nombre y acceder a sus props con `.` dentro del cuerpo.

```typescript
// Con destructuring — cada prop queda disponible como variable suelta
async fillCheckoutStepOneForm({ firstName, lastName, postalCode }: CheckoutInfo): Promise<void> {
  await this.page.getByTestId("firstName").fill(firstName);
  await this.page.getByTestId("lastName").fill(lastName);
  await this.page.getByTestId("postalCode").fill(postalCode);
}

// Equivalente sin destructuring
async fillCheckoutStepOneForm(info: CheckoutInfo): Promise<void> {
  await this.page.getByTestId("firstName").fill(info.firstName);
  await this.page.getByTestId("lastName").fill(info.lastName);
  await this.page.getByTestId("postalCode").fill(info.postalCode);
}
```

El `: CheckoutInfo` sigue tipando el objeto completo — el destructuring es pura sintaxis
para no repetir `info.` en cada línea, no cambia el tipo del parámetro ni cómo se llama
la función (`fillCheckoutStepOneForm(buildCheckoutInfo())` sigue pasando el objeto entero).

Otras variantes útiles del mismo patrón:
```typescript
// Renombrar al desempacar (útil si el nombre de la prop choca con algo del scope)
function foo({ firstName: nombre }: CheckoutInfo) { ... }

// Default si la prop puede venir undefined (con Partial<T> o prop opcional)
function foo({ postalCode = "00000" }: Partial<CheckoutInfo>) { ... }

// Destructuring anidado (objeto dentro de objeto)
function foo({ address: { city } }: { address: { city: string } }) { ... }
```

Ejemplo real: `CheckoutPage.fillCheckoutStepOneForm()` (`src/pages/CheckoutPage.ts`) +
`buildCheckoutInfo()` (`src/data/checkout.ts`, genera `CheckoutInfo` con faker o con
overrides puntuales).

---

## Conversión de tipos en TS/JS

No existe `.toNumber()` como método — la conversión es con funciones globales:

```typescript
// a number
Number("29.99")        // 29.99
Number("$29.99")       // NaN — no ignora el símbolo, hay que limpiar el string antes
parseFloat("29.99px")  // 29.99  (parsea hasta donde puede)
parseInt("29px", 10)   // 29     (entero, pasar siempre el radix 10)

// a string
String(29.99)          // "29.99"
(29.99).toString()     // "29.99"

// a boolean
Boolean("")            // false
Boolean("hola")        // true
!!"hola"               // true (idiom común)
```

Ejemplo real (`InventoryPage.getProductPrices()`): `allTextContents()` da
`["$29.99", ...]`, hay que `.replace("$", "")` **antes** de `Number(...)` porque el
símbolo de moneda al inicio rompe tanto `Number()` como `parseFloat()`.

---

## `expect` — assertions

### Cuándo usar `await`

| Qué le paso a `expect` | `await` | Por qué |
|---|---|---|
| `locator` (elemento del DOM) | ✅ siempre | Playwright hace polling hasta que se cumple o vence el timeout |
| `string`, `number`, `boolean`, `null` | ❌ nunca | La assertion es síncrona — el valor ya está en memoria |

```typescript
// ✅ Con Locator — Playwright re-evalúa el DOM (web-first, con retry)
await expect(product.getByRole("button", { name: "Remove" })).toBeVisible();

// ✅ Con valor ya resuelto — síncrono, sin await
const names = await locator.allTextContents();
expect(names).toEqual(sortedNames);
```

Los que vamos a usar en este proyecto — todos web-first (reintentan hasta
`expect.timeout`, 5s por default, no sobreescrito en `playwright.config.ts`):

`toBeVisible` / `toBeHidden`, `toBeEnabled` / `toBeDisabled`, `toBeChecked`, `toBeEditable`,
`toBeFocused`, `toHaveAttribute`, `toHaveClass`, `toHaveCSS`, `toHaveCount`,
`toHaveText` / `toContainText`, `toHaveValue` / `toHaveValues`, `toHaveURL` (sobre `Page`),
`toHaveTitle` (sobre `Page`).

`toEqual`, `toBe`, `toContain` sobre un valor ya extraído — síncronos, sin retry (ver
tabla de arriba).

---

### Atributo HTML vs propiedad CSS computada — no confundir

Son dos cosas distintas del DOM, con APIs distintas:

| | Atributo HTML | CSS computado |
|---|---|---|
| Ejemplos | `class`, `id`, `data-test`, `src`, `name` | `color`, `border-bottom-color`, `background-color` |
| Cómo se lee | `getAttribute("attr")` | `getComputedStyle(el).getPropertyValue("prop")` |
| Matcher web-first | `toHaveAttribute` | `toHaveCSS` |
| Helper en `BasePage` | `expectAttribute()` | `expectCSS()` |

`getAttribute("border-bottom-color")` devuelve `null` — ese string no es un atributo
HTML, aunque el elemento sí tenga ese borde renderizado en pantalla (via stylesheet,
clase, herencia, etc.). Usar `expectCSS()` para estilos, `expectAttribute()` solo para
lo que está escrito literalmente en el markup. Útil para USER-10 (`visual_user`,
comparar estilos rotos — ver `TEST_CASES.md`).

```typescript
// ❌ getAttribute no resuelve CSS
await basePage.expectAttribute(locator, "border-bottom-color", "rgb(226, 35, 26)"); // siempre null

// ✅ CSS computado
await basePage.expectCSS(locator, "border-bottom-color", "rgb(226, 35, 26)");
```

---

### `toHaveCSS` — ⚠️ hex vs rgb

**No asumas que Playwright normaliza colores.** Verificado empíricamente en este
proyecto (Playwright 1.61.1): `toHaveCSS("color", "#e2231a")` **falla** contra el valor
real del navegador, que siempre es `rgb(...)`:

```typescript
// ❌ Falla — el navegador nunca devuelve el color en formato hex
await expect(locator).toHaveCSS("color", "#e2231a");

// ✅ Correcto — usar el formato que devuelve getComputedStyle
await expect(locator).toHaveCSS("color", "rgb(226, 35, 26)");
```

Para descubrir el valor real antes de escribir la assertion (debug rápido, sacar
después — ver `COMMANDS.md`):
```typescript
console.log(await locator.evaluate((el) => getComputedStyle(el).color));
```

También ojo con `toHaveCSS("border", ...)`: el shorthand `border` en `getComputedStyle`
solo se resuelve de forma confiable en Chrome cuando los 4 lados son iguales — no es
garantía cross-browser. Si falla sin motivo aparente en firefox/webkit, usar
`border-color` en vez de `border`.

---

### Matchers más usados

#### Texto
```typescript
await expect(locator).toHaveText("exacto");           // texto completo, exact match
await expect(locator).toHaveText(/regex/);             // match por regex
await expect(locator).toHaveText(["a", "b"]);          // sobre una lista de locators, uno por elemento
await expect(locator).toContainText("parcial");        // substring, no exact
expect(string).toBe("exacto");         // valor ya resuelto (ej. tras textContent()) — sin await, ===
expect(string).toContain("parcial");   // valor ya resuelto — substring
```
`toHaveText` vs `toContainText`: mismo criterio exact/substring que `has`/`hasText` en
`.filter()` — usar `toHaveText` cuando el copy completo es estable y conocido, `toContainText`
cuando solo te importa una parte (ej. un mensaje con datos dinámicos alrededor).

#### Negación — `.not`
Cualquier matcher admite `.not` antes para invertir la condición, sigue siendo web-first
(reintenta hasta que la condición negada se cumpla):
```typescript
await expect(locator).not.toBeVisible();
await expect(locator).not.toHaveText("texto viejo");
await expect(locator).not.toHaveClass(/disabled/);
```

#### Atributos y accesibilidad
```typescript
await expect(locator).toHaveAttribute("src", /.+/);   // existe y no está vacío
await expect(locator).toHaveAttribute("src", "exact.jpg"); // valor exacto del atributo
await expect(locator).toHaveValue("az");              // valor de un <select>/<input>
await expect(locator).toHaveValues(["az", "lohi"]);   // <select multiple>
await expect(locator).toHaveAccessibleName("Remove");
await expect(locator).toHaveClass(/active/);          // por substring/regex sobre className
await expect(locator).toHaveCount(6);
```

#### Estado del elemento
```typescript
await expect(locator).toBeVisible();   // renderizado y con tamaño > 0 (no visibility:hidden/display:none)
await expect(locator).toBeHidden();    // inverso — o no existe en el DOM, o está oculto
await expect(locator).toBeEnabled();   // no tiene el atributo disabled
await expect(locator).toBeDisabled();
await expect(locator).toBeChecked();   // checkbox/radio
await expect(locator).toBeEditable();  // no readonly, no disabled
await expect(locator).toBeFocused();
```

#### Valores ya resueltos (sin `await` en el `expect`, salvo que la extracción del dato sí lo tenga)
```typescript
expect(valor).toBe(esperado);          // igualdad estricta (===) — primitivos
expect(valor).toEqual([...]);          // igualdad profunda (arrays/objetos anidados)
expect(valor).not.toEqual([...]);      // negación también aplica acá
expect(numero).toBeGreaterThan(0);
expect(numero).toBeLessThanOrEqual(10);
expect(array).toHaveLength(6);         // length de un array ya resuelto (no confundir con toHaveCount, que es de Locator)
```
`toBe` vs `toEqual`: `toBe` es `===` (referencia/valor primitivo) — falla comparando dos
arrays u objetos distintos aunque tengan el mismo contenido. `toEqual` compara estructura
recursivamente — es la que necesitás para arrays/objetos (ej. `expect(productNames).toEqual(sortedNames)`).

---

### Mensaje de error personalizado

```typescript
await expect(locator, "El botón Add to cart no está visible").toBeVisible();
```

---

### Elementos opcionales — patrón del proyecto

```typescript
if ((await locator.count()) === 0) {
  test.info().annotations.push({ type: "warning", description: "Comportamiento conocido de error_user" });
  return;
}
await expect(locator).toBeVisible();
```

> `locator()` nunca retorna `null` — siempre un objeto. La única forma de verificar
> existencia es `count()` o `isVisible()`. Usar `test.info().annotations` (no marcar el
> test como fallido) para documentar bugs conocidos de usuarios especiales
> (`problem_user`, `error_user`) — ver `CLAUDE.md`.

---

*Proyecto: claude-pw-saucedemo*
