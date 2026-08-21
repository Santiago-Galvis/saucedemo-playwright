import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { ROUTES, SELECTORS } from "../constants";
import { CheckoutInfo } from "../types/index";

export class CheckoutPage extends BasePage {
  async goToCheckoutOne(): Promise<void> {
    await this.navigate(ROUTES.CHECKOUT_STEP_ONE);
  }

  async goToCheckoutTwo(): Promise<void> {
    await this.navigate(ROUTES.CHECKOUT_STEP_TWO);
  }

  async goToCheckoutComplete(): Promise<void> {
    await this.navigate(ROUTES.CHECKOUT_COMPLETE);
  } 

  async fillFirstName(firstName?: string): Promise<void> {
    await this.page.getByTestId(SELECTORS.checkoutsStepOne.input_firstName).fill(firstName??"Santiago");
  }

  async fillLastName(lastName?: string): Promise<void> {
    await this.page.getByTestId(SELECTORS.checkoutsStepOne.input_lastName).fill(lastName??"Galvis");
  }

  async fillPostalCode(postalCode?: string): Promise<void> {
    await this.page.getByTestId(SELECTORS.checkoutsStepOne.input_postalCode).fill(postalCode??"12345");
  }

  async fillCheckoutStepOneForm({ firstName, lastName, postalCode }: CheckoutInfo): Promise<void> {
    await this.page.getByTestId(SELECTORS.checkoutsStepOne.input_firstName).fill(firstName);
    await this.page.getByTestId(SELECTORS.checkoutsStepOne.input_lastName).fill(lastName);
    await this.page.getByTestId(SELECTORS.checkoutsStepOne.input_postalCode).fill(postalCode);
  }

  async clickOnContinueButton(): Promise<void> {
    await this.page.getByTestId(SELECTORS.checkoutsStepOne.btn_continue).click();
  }

  async checkSpecificErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.page.getByTestId(SELECTORS.checkoutsStepOne.msg_error)).toHaveText(expectedMessage);
  }

  async checkErrorMessageForAllEmptyFields(): Promise<void> {
    await this.expectCSS(this.page.getByTestId(SELECTORS.checkoutsStepOne.input_firstName), "border-bottom-color", "rgb(226, 35, 26)");
    await this.expectCSS(this.page.getByTestId(SELECTORS.checkoutsStepOne.input_lastName), "border-bottom-color", "rgb(226, 35, 26)");
    await this.expectCSS(this.page.getByTestId(SELECTORS.checkoutsStepOne.input_postalCode), "border-bottom-color", "rgb(226, 35, 26)");
  }
  
  async clickOnDismissErrorButton(): Promise<void> {
    await this.page.getByTestId(SELECTORS.checkoutsStepOne.btn_dismissErrorButton).click();
  }

  async checkErrorMessageIsNotVisible(): Promise<void> {

    await expect(this.page.getByTestId(SELECTORS.checkoutsStepOne.btn_dismissErrorButton)).toBeHidden();
    await this.expectCSS(this.page.getByTestId(SELECTORS.checkoutsStepOne.input_firstName), "border-bottom", "1px solid rgb(237, 237, 237)");
    await this.expectCSS(this.page.getByTestId(SELECTORS.checkoutsStepOne.input_lastName), "border-bottom", "1px solid rgb(237, 237, 237)");
    await this.expectCSS(this.page.getByTestId(SELECTORS.checkoutsStepOne.input_postalCode), "border-bottom", "1px solid rgb(237, 237, 237)");
  }

  async clickCancelButton(): Promise<void> {
    await this.page.getByTestId(SELECTORS.checkoutsStepOne.btn_cancel).click();
  }
}
