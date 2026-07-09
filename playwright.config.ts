import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

/**
 * Playwright Config — fuente de verdad para todos los tests.
 * Proyecto de práctica sobre saucedemo.com, plantilla derivada del proyecto Avianca (booking).
 * Diferencia clave: saucedemo tiene `data-test="..."` en casi todo, por eso `testIdAttribute` + `getByTestId()`.
 */
export default defineConfig({
  testDir: "./tests", // carpeta donde viven los tests
  timeout: 120_000, // timeout máximo por test
  fullyParallel: true, // corre tests en paralelo
  forbidOnly: !!process.env.CI, // en CI, falla el build si hay .only
  retries: process.env.CI ? 2 : 0, // reintentos automáticos en CI
  workers: process.env.CI ? 4 : 16, // CI: coincide 1:1 con los 4 OCPU de la VM self-hosted (ver CLAUDE.md); local: 1
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }], // reporte visual
    ["list"], // output en consola
  ],

  use: {
    baseURL: process.env.BASE_URL ?? "https://www.saucedemo.com/",
    testIdAttribute: "data-test", // habilita getByTestId() contra data-test
    screenshot: "only-on-failure", // captura screenshot solo si el test falla
    video: "retain-on-failure", // graba video, lo borra si el test pasa
    trace: "on-first-retry", // captura trace en el primer reintento
  },

  // projects: cada entrada es un "browser profile" corrido en paralelo
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  outputDir: "test-results/", // carpeta de artefactos (screenshots, videos, traces)
});
