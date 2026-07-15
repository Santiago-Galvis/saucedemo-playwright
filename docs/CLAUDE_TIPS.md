# Claude Code — Tips para trabajar más eficientemente

Una colección de tips prácticos para sacarle el máximo provecho a Claude Code
trabajando en `claude-pw-saucedemo`.

---

## Gestión del contexto y costos

### `/clear` — Reinicia el contexto de la conversación
Cuando la conversación se vuelve muy larga, Claude empieza a consumir más tokens
(cada mensaje incluye todo el historial anterior). Usa `/clear` para empezar fresco.

**Cuándo usarlo:**
- Terminaste un caso de `TEST_CASES.md` (ej. todo INV-0X de sort) y vas a empezar otro bloque
- Sientes que Claude "perdió el hilo" o está siendo inconsistente
- La sesión lleva más de 30-40 mensajes

**Cómo hacerlo bien:** Antes de `/clear`, pídele a Claude que te dé un resumen del
estado actual. Luego en la nueva sesión: "Contexto: [pega el resumen]".

```
# Ejemplo de traspaso eficiente
"Dame un resumen de 5 líneas de qué casos de INV-XX ya implementé antes de que haga /clear"
```

---

## Cómo hacer mejores pedidos (prompting)

### Sé específico con el CONTEXTO y el OBJETIVO
Claude no ve tu pantalla ni sabe qué tienes en mente. Entre más contexto des, mejor resultado.

❌ **Vago:**
> "arregla el test"

✅ **Específico:**
> "El test `inventory.spec.ts` línea 46 falla porque `SELECTORS.inventory.lbl_inventoryItemName` no encuentra el elemento. Revisa si el atributo real en saucedemo usa guion medio o guion bajo."

---

### Pide por etapas, no todo de una vez
Claude es mejor haciendo una cosa bien que diez cosas a medias.

❌ **Sobrecargado:**
> "Implementa todos los casos de INV-01 a INV-15 con CartPage y CheckoutPage completos"

✅ **Por etapas:**
> "Implementa solo INV-03 (sort por name ascendente default) en InventoryPage.ts"

---

### Usa "actúa como [rol]"
Cambia el comportamiento de Claude según lo que necesites:

- `"Actúa como Tech Lead revisando este código"` → crítica y mejoras
- `"Actúa como junior dev, explícame este código paso a paso"` → didáctico
- `"Actúa como QA senior, qué casos de prueba me faltan en Inventory?"` → cobertura

---

### El patrón más poderoso: CONTEXTO + ACCIÓN + RESTRICCIONES

```
CONTEXTO:      "Estoy usando Playwright + TypeScript con POM, saucedemo tiene data-test en casi todo."
ACCIÓN:        "Crea el método para agregar un producto al carrito por nombre."
RESTRICCIONES: "Usa getByTestId como selector por defecto, y .filter() para escoger el producto dentro de la lista."
```

---

## Usar múltiples agentes (avanzado)

Claude Code puede lanzar **subagentes en paralelo** con diferentes modelos:

- **Opus** → tareas de diseño, arquitectura, análisis profundo (más caro, más inteligente)
- **Sonnet** → implementación, explicaciones, iteraciones rápidas (balance perfecto)
- **Haiku** → tareas simples, búsquedas, renombrar variables (más rápido y barato)

**Cuándo pedirlo:**
> "Usa Opus para revisar la arquitectura de CartPage y Sonnet para implementar los cambios en paralelo"

---

## Comandos útiles de Claude Code

| Comando | Para qué sirve |
|---|---|
| `/clear` | Reinicia el contexto (ahorra tokens) |
| `/model` | Cambia el modelo (opus/sonnet/haiku) |
| `/help` | Ver todos los comandos disponibles |
| `! <comando>` | Ejecuta un comando de terminal directamente en el chat |
| `/review` | Hace code review de un PR |
| `/code-review` | Review del diff actual, con opción `--fix` |
| `/verify` | Ejecuta y confirma que un cambio funciona de verdad |
| `/run` | Lanza la app/tests y observa el resultado |

---

## Tips de productividad

### Referencia archivos y líneas específicas
En lugar de copiar-pegar código, di:
> "En `src/pages/InventoryPage.ts` línea 53, cambia..."

Claude puede leer el archivo directamente — de hecho, seleccionar líneas en el editor
y preguntar sobre ellas (como venimos haciendo en este proyecto) es la forma más rápida.

---

### Pide explicaciones mientras trabajas
> "Mientras implementas el sort por precio, explícame por qué `.sort()` necesita un comparador para números"

Aprendes y avanzas al mismo tiempo — es como veníamos trabajando los casos INV-03 a INV-06.

---

### Valida antes de avanzar
Después de cada cambio importante:
> "Antes de continuar, explícame qué acabas de crear y por qué lo estructuraste así"

---

### Corre los tests, no confíes solo en que "debería andar"
Después de implementar algo, pide explícitamente:
> "Corre `tests/e2e/inventory.spec.ts` y confirmá que pasa en los 3 browsers"

**Ojo con el auth setup en este proyecto:** si corrés un test filtrado por archivo
(`--project=chromium` o `-g "nombre"`), el proyecto `setup` no se ejecuta automáticamente
antes (falta `dependencies: ["setup"]` en `playwright.config.ts` — bug conocido, pendiente).
Corré siempre `npx playwright test tests/setup` antes si el storageState pudo haber expirado.

---

## Sobre costos

- **Conversaciones largas** = más tokens = más costo. Usa `/clear` frecuentemente.
- **Opus** cuesta más que Sonnet. Úsalo solo para tareas complejas (arquitectura, debugging difícil).
- **Leer archivos grandes** consume tokens. Sé específico: "lee solo las líneas 1-50 de X".
- **Agentes en paralelo** corren simultáneamente pero cada uno consume tokens por separado.

---

## Filosofía de trabajo con IA

> "La IA no reemplaza al ingeniero, amplifica su capacidad de pensar y ejecutar.
> Tu trabajo es hacer las preguntas correctas, validar el output y entender el porqué."

El ingeniero que mejor use IA no es el que más delega —
es el que mejor sabe qué delegar, cómo pedirlo y cómo validar el resultado.
Ejemplo real de este proyecto: cuando Claude propuso `toHaveCSS("color", "#e2231a")`
asumiendo que Playwright normaliza hex vs rgb, la verificación empírica (correr el test)
mostró que no era así — validar en vez de asumir evitó un test roto en CI.

---

*Proyecto: claude-pw-saucedemo*
