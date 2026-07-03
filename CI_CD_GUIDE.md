# CI/CD con self-hosted runner en OCI (guía)

## Tu máquina: ¿es buena para esto?

`VM.Standard.A1.Flex` — 4 OCPU, 24 GB RAM, ARM (Ampere), disco por block storage,
dentro del **Always Free tier** de Oracle (hasta 4 OCPU / 24 GB total en A1, gratis
indefinidamente, no solo durante el trial de $300).

Para correr un GitHub Actions self-hosted runner con Playwright: **es más que suficiente,
y de las mejores opciones gratuitas que existen hoy**. Contras a tener en cuenta:

- Es **ARM64**, no x86. Los binarios de Chromium/Firefox/WebKit de Playwright tienen
  build para ARM, así que funciona, pero:
  - Si tu equipo o el proyecto usan alguna dependencia nativa sin build ARM, falla ahí, no en Playwright.
  - Las imágenes Docker oficiales de Playwright (`mcr.microsoft.com/playwright`) sí tienen
    tag `-arm64` — úsalo explícitamente si containerizas.
- Es tu única máquina — si un job se cuelga o un browser deja proceso zombie, se acumula.
  Con 24GB de RAM tienes margen, pero conviene monitorear.
- Está en la nube pública — el runner necesita salida a internet (para bajar el job de
  GitHub) pero no necesita puertos entrantes abiertos, así que el riesgo de exposición es bajo
  si no tocas el security list/firewall más de lo necesario.

## Paso a paso: convertirla en self-hosted runner

1. **Conéctate por SSH** a la VM (ya deberías tener la key desde que la creaste en OCI).

2. **Instala dependencias base** (Node, git, deps de navegadores):
   ```bash
   sudo apt update && sudo apt install -y curl git build-essential
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
   sudo apt install -y nodejs
   ```

3. **Registra el runner en tu repo/org de GitHub:**
   - En GitHub: `Settings → Actions → Runners → New self-hosted runner` → elige Linux ARM64.
   - Copia los comandos que te da GitHub (son específicos de tu repo, incluyen un token
     temporal) — algo como:
     ```bash
     mkdir actions-runner && cd actions-runner
     curl -o actions-runner-linux-arm64-X.X.X.tar.gz -L <URL-arm64-que-te-da-GitHub>
     tar xzf ./actions-runner-linux-arm64-X.X.X.tar.gz
     ./config.sh --url https://github.com/<tu-usuario>/<tu-repo> --token <TOKEN>
     ```
   - **Importante:** el token expira en minutos, cópialo del panel de GitHub en el momento, no lo guardes en un archivo del repo.

4. **Instala los navegadores de Playwright con sus deps de sistema:**
   ```bash
   npx playwright install --with-deps
   ```
   (`--with-deps` instala las libs de sistema que Chromium/Firefox/WebKit necesitan en Linux —
   sin esto los tests fallan con errores de librerías faltantes, no de Playwright en sí)

5. **Corre el runner como servicio** (para que sobreviva reinicios y no dependa de tu sesión SSH):
   ```bash
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

6. **En el workflow de GitHub Actions**, apunta a tu runner con una label:
   ```yaml
   jobs:
     e2e:
       runs-on: self-hosted   # o una label custom que le pongas al runner
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npx playwright test --project=chromium
         - uses: actions/upload-artifact@v4
           if: always()
           with:
             name: playwright-report
             path: playwright-report/
             retention-days: 7
   ```

## Cómo sacarle el mejor provecho a la máquina

- **Workers en paralelo:** con 4 OCPU / 24GB, puedes correr `--workers=4` sin problema
  para el proyecto saucedemo (tests livianos). Para el proyecto Avianca (browsers pesados,
  3 navegadores) prueba con `--workers=2` o `3` primero y mide memoria con `htop` antes de
  subir — no asumas que más workers siempre es más rápido, si satura RAM empieza a swapear
  y se vuelve más lento.
- **Un solo runner, múltiples repos:** puedes registrar este mismo runner en varios repos
  (o usarlo como *organization runner* si tienes una org) en vez de crear una VM por proyecto.
- **Runs concurrentes:** por defecto un runner ejecuta un job a la vez. Si quieres correr
  jobs de distintos repos en paralelo, registra **más de una instancia** del runner
  (carpetas separadas, cada una con su propio `config.sh`), no multipliques VMs — tu
  hardware ya lo soporta.
- **Cache de dependencias:** usa `actions/setup-node` con `cache: "npm"` y evita reinstalar
  browsers de Playwright en cada run — cachea `~/.cache/ms-playwright` entre jobs con
  `actions/cache` (clave por hash de `package-lock.json` + versión de Playwright).
- **Nightly vs PR:** corre el smoke (chromium, casos críticos) en cada push/PR; deja la
  matriz completa (3 browsers, battery test completo) en un cron nightly — así no bloqueas
  PRs con una corrida larga.
- **Seguridad:** un self-hosted runner conectado a un repo público es un riesgo (PRs de
  terceros pueden ejecutar código en tu máquina). Si el repo es privado y solo tú haces
  push, el riesgo es bajo — pero no lo conectes a un repo público sin restringir
  `pull_request_target` y revisar cada workflow antes de mergear.
- **Monitoreo básico:** agrega una alarma o cron simple que te avise si el disco o RAM
  se llenan (ya tienes "Alarms" en el dashboard de OCI que viste en el screenshot —
  puedes crear una ahí mismo apuntando a la métrica de memoria/disco de esta instance).

## Qué necesito de ti para conectar esto de verdad

No puedo ejecutar comandos en tu VM de OCI ni tocar la configuración de tu repo de GitHub
desde aquí — son acciones en sistemas externos que requieren tus credenciales. Cuando estés
en la VM, puedes correr comandos ahí escribiendo `!` seguido del comando en este chat
(por ejemplo `!ssh usuario@ip-de-tu-vm`) y seguimos el proceso juntos paso a paso si quieres
que te acompañe en vivo.
