# CI/CD — estado actual (self-hosted runner en OCI)

> Este documento es la **fuente de verdad del estado actual** del pipeline.
> `CI_CD_GUIDE.md` (raíz del repo) es la guía paso a paso original — algunos detalles
> ahí (ej. `npx playwright install --with-deps` dentro del workflow) quedaron
> desactualizados respecto a lo implementado acá.

Repo en GitHub: `Santiago-Galvis/saucedemo-playwright` — **público** (necesario para
GitHub Pages gratis; el repo no tiene colaboradores ni acepta PRs externos, y
"Run workflows from fork pull requests" está desmarcado, así que un fork no puede
disparar el runner).

## VM

Oracle Cloud, `VM.Standard.A1.Flex`, Ubuntu 20.04 ARM64, usuario `ubuntu`,
región `sa-bogota-1`. IP pública asignada como *ephemeral* (se pierde si la instancia
se detiene, hay que reasignarla). Oracle recortó el Always Free tier de A1 a 2 OCPU/12GB
(desde 4/24) sin aviso oficial en junio 2026 — la instancia del usuario se dejó en 4
OCPU/24GB sin bajarla; pendiente confirmar en Billing si eso genera costo o riesgo de
apagado. Revisar `Billing & Cost Management → Cost Analysis` si hay dudas.

## Runner

Registrado en `~/actions-runner`, corre como servicio systemd
(`sudo ./svc.sh install && start`), status se ve en Settings → Actions → Runners.
Browsers de Playwright **preinstalados manualmente en la VM** (no en el workflow) via
`npm ci && npx playwright install --with-deps`, corrido dentro del checkout real:
`~/actions-runner/_work/saucedemo-playwright/saucedemo-playwright/`. Si se actualiza
`@playwright/test` en `package.json`, hay que repetir ese install a mano — el workflow
no lo hace automático (se sacó ese paso para bajar el tiempo de CI de ~3min).
WebKit da warning de "frozen browser" por ser Ubuntu 20.04 — no rompe nada, pero
eventualmente convendría actualizar el OS de la VM.

## Workflow

`.github/workflows/e2e.yml`, corre los 3 browsers en cada push/PR a `main`.
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
