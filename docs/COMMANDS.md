# Comandos del proyecto

## Correr tests

| Comando | Qué hace |
|---|---|
| `npm test` | Todos los tests en los 3 browsers (chromium, firefox, webkit) |
| `npm run test:chromium` | Solo Chromium (más rápido para desarrollo) |
| `npm run test:headed` | Abre el browser y puedes ver qué hace |
| `npm run test:ui` | Interfaz gráfica — la más útil día a día |
| `npm run test:debug` | Paso a paso con Playwright Inspector |

## Ver resultados

| Comando | Qué hace |
|---|---|
| `npm run test:report` | Abre el reporte HTML del último run |

## Calidad de código

| Comando | Qué hace |
|---|---|
| `npm run lint` | Revisa errores de código (ESLint) |
| `npm run format` | Formatea el código automáticamente (Prettier) |

## Correr un archivo específico

```bash
npx playwright test tests/e2e/inventory.spec.ts
npx playwright test tests/e2e/inventory.spec.ts --project=chromium
npx playwright test tests/e2e/inventory.spec.ts --project=chromium --headed
npx playwright test tests/e2e/inventory.spec.ts --project=chromium --debug
```

## Correr un test específico por nombre

```bash
npx playwright test -g "should sort products by name ascending"
```

## ⚠️ Auth / storageState en este proyecto

`inventory.spec.ts` (y cualquier spec que no sea de login) reusa la sesión guardada en
`playwright/.auth/standard_user.json` vía `test.use({ storageState: AUTH_FILE })`.

Esa sesión la genera el proyecto `setup` (`tests/setup/auth.setup.ts`). **Si corrés un
test filtrado por archivo o por nombre, `setup` NO se ejecuta automáticamente antes**
(falta `dependencies: ["setup"]` en `playwright.config.ts` — bug conocido, pendiente de
resolver). Si el storageState expiró vas a ver el error "You can only access
'/inventory.html' when you are logged in".

Solución mientras tanto — corré `setup` primero:
```bash
npx playwright test tests/setup
npx playwright test tests/e2e/inventory.spec.ts --project=chromium
```

O simplemente `npm test` sin filtros, que sí corre `setup` junto con el resto.

## Flujo de trabajo recomendado

```
1. Escribir el test
2. npx playwright test tests/setup   → asegurar sesión válida
3. npm run test:ui                   → ver si pasa visualmente
4. Si falla → npm run test:debug     → modo paso a paso
5. Corregir
6. npm run test:chromium             → verificar que todo sigue verde
7. npm test                          → confirmar en los 3 browsers antes de commitear
```

## Dónde ver artefactos cuando falla un test

```
test-results/         → screenshots y videos del momento del fallo
playwright-report/    → reporte HTML completo (abrir con npm run test:report)
```

---

## Debugging

### Nivel 1 — Ver el browser en vivo
```bash
npm run test:headed
```
Playwright abre el browser y ejecuta las acciones visualmente.
Útil para entender qué está haciendo el test sin pausarlo.

---

### Nivel 2 — UI Mode (recomendado para el día a día)
```bash
npm run test:ui
```
Abre una interfaz gráfica donde puedes:
- Ver todos los tests y su estado (✅ / ❌)
- Hacer click en un test para correrlo individualmente
- Ver el **trace**: cronología visual de cada acción con screenshots
- Ver errores de consola y de red

---

### Nivel 3 — Playwright Inspector (paso a paso)
```bash
npm run test:debug
```
Pausa la ejecución al inicio. Desde la ventana del Inspector puedes:
- ⏩ Avanzar acción por acción
- 🔍 Hacer hover sobre elementos para ver sus locators (incluye el modo "Assert snapshot"
  con el ícono `</>`, útil para ver el **accessible name** real de un elemento — más
  confiable que asumir que el atributo `name` del HTML es lo que usa `getByRole`)
- 📋 Ver el log completo de acciones ejecutadas

También puedes pausar desde el código agregando esta línea en el test:
```typescript
await page.pause(); // pausa aquí y abre el Inspector
```
> Nunca commitear `page.pause()` — ESLint lo marcará como error.

---

### Nivel 4 — Trace Viewer (post-mortem)
Cuando un test falla en CI o quieres analizar un fallo después de que ocurrió:
```bash
npx playwright show-trace test-results/<nombre-del-test>/trace.zip
```
Muestra una línea de tiempo con:
- Screenshot de cada acción
- Request de red en ese momento
- Errores de consola

El trace se activa automáticamente en el primer reintento (`trace: "on-first-retry"` en
`playwright.config.ts`).

---

### Tip: correr un solo test mientras debugeas
```bash
npx playwright test -g "nombre del test" --project=chromium --headed
```
Así no corres todos los tests cada vez, solo el que estás arreglando — pero recordá el
tema de `setup` de más arriba si el storageState pudo haber expirado.

---

### Tip: debug rápido de un valor sin dejar `console.log` commiteado

Para ver qué devuelve un `getComputedStyle`, un `textContent`, etc. antes de escribir
la assertion final, `console.log` funciona directo en la salida de terminal al correr
`playwright test` (no hace falta `--debug`):

```typescript
console.log(await locator.evaluate((el) => getComputedStyle(el).color));
```

Pero el proyecto bloquea `console.log` en tests commiteados (ESLint) — es solo para
depurar en el momento, hay que sacarlo antes de terminar.

---

## Skills de Claude Code

Las skills son comandos especiales que activan modos de trabajo específicos en Claude.
Se invocan escribiendo `/nombre` directamente en el chat con Claude.

| Skill | Cuándo usarla |
|---|---|
| `/run` | Quieres que Claude lance los tests y observe qué pasa |
| `/verify` | Agregaste un selector o cambio y quieres confirmar que funciona |
| `/code-review` | Quieres que Claude revise el código buscando bugs y mejoras |
| `/code-review --fix` | Igual que el anterior pero aplica las correcciones automáticamente |
| `/security-review` | Quieres revisar vulnerabilidades en el código |
| `/simplify` | Quieres que Claude simplifique o limpie código que escribiste |
| `/schedule` | Quieres programar que Claude corra algo automáticamente |

### Ejemplo de uso

En vez de escribir:
> "Revisa si el código que escribí tiene errores"

Escribes directamente:
```
/code-review
```

Claude entiende el contexto del proyecto y hace la revisión sin más explicaciones.
