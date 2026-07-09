import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { SELECTORS, ROUTES } from "../constants";

export class LoginPage extends BasePage {
  async goto(): Promise<void> {
    await this.navigate(ROUTES.LOGIN);
  }

  async gotoWithoutLogin(route: string): Promise<void> {
    await this.navigate(route);
  }

  async fillCredentials(username: string, password: string): Promise<void> {
    await this.page.getByTestId(SELECTORS.login.input_username).fill(username);
    await this.page.getByTestId(SELECTORS.login.input_password).fill(password);
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillCredentials(username, password);
    await this.page.getByTestId(SELECTORS.login.btn_login).click();
  }

  async submitWithEnter(): Promise<void> {
    await this.page.getByTestId(SELECTORS.login.input_password).press("Enter");
  }

  async expectLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(ROUTES.INVENTORY));
  }

  async expectError(message: string): Promise<void> {
    await expect(this.page.getByTestId(SELECTORS.login.msg_error), `Error esperado: "${message}"`).toHaveText(message);
  }

  async expectDismissButton(dismiss?: boolean): Promise<void> {
    await expect(
      this.page.getByTestId(SELECTORS.login.btn_closeError),
      "Botón de cerrar error debería estar visible",
    ).toBeVisible();

    if (dismiss) {
      await this.dismissError();
    }
  }
  async dismissError(): Promise<void> {
    await this.page.getByTestId(SELECTORS.login.btn_closeError).click();
  }

  async expectNoError(): Promise<void> {
    await expect(this.page.getByTestId(SELECTORS.login.msg_error)).not.toBeVisible();
  }

  async expectPasswordMasked(): Promise<void> {
    await this.expectAttribute(this.page.getByTestId(SELECTORS.login.input_password), "type", "password");
  }
}
