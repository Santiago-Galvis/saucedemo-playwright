import { test as setup } from "@playwright/test";
import { LoginPage } from "../../src/pages";
import { PASSWORD } from "../../src/data/users";
import { AUTH_FILE } from "../../src/constants";

setup("authenticate as standard_user", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("standard_user", PASSWORD);
  await loginPage.expectLoggedIn();
  await page.context().storageState({ path: AUTH_FILE });
});
