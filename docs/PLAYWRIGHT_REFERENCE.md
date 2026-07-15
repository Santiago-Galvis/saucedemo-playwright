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

```typescript
this.page
  .getByTestId(SELECTORS.inventory.div_inventoryItem)
  .filter({ has: this.page.getByText(productName, { exact: true }) });
```

Opciones (combinables):
- **`has`**: `Locator` — debe contener un descendiente que matchee ese locator. Permite
  exact match (`getByText(x, { exact: true })`).
- **`hasNot`**: inverso de `has`.
- **`hasText`**: `string | RegExp` — más simple que `has` + `getByText` cuando solo
  importa el texto (substring, no exacto por defecto).
- **`hasNotText`**: inverso de `hasText`.
- **`visible`**: `boolean`.

`has: getByText(x, { exact: true })` vs `hasText: x` dan el mismo resultado con
`exact: false`/default — la diferencia real es exact vs substring, no el método en sí.
Preferir exact match cuando nombres de productos podrían ser substring uno del otro
(ej. "Sauce Labs Bike Light" vs un futuro "Sauce Labs Bike Light Pro").

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
await expect(locator).toHaveText("exacto");
await expect(locator).toContainText("parcial");
expect(string).toContain("parcial");   // sin await, sobre valor ya resuelto
```

#### Atributos y accesibilidad
```typescript
await expect(locator).toHaveAttribute("src", /.+/);   // existe y no está vacío
await expect(locator).toHaveValue("az");              // valor de un <select>/<input>
await expect(locator).toHaveAccessibleName("Remove");
await expect(locator).toHaveCount(6);
```

#### Valores ya resueltos (sin `await` en el expect)
```typescript
expect(valor).toBe(esperado);          // igualdad estricta (===)
expect(valor).toEqual([...]);          // igualdad profunda (arrays/objetos)
expect(numero).toBeGreaterThan(0);
```

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
