import { test as base } from "@playwright/test";
import { LoginPage } from "../pages";

/**
 * Custom Fixtures — cada página ya instanciada y lista para usar en los tests.
 *
 *   test("mi test", async ({ loginPage }) => { ... })
 *
 * Añade una entrada aquí por cada Page Object nuevo que crees.
 */
type PageFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect } from "@playwright/test";
