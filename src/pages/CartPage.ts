import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { ROUTES, SELECTORS } from "../constants";
import type { ProductInfo } from "../types";

export class CartPage extends BasePage {
  async goToCart(): Promise<void> {
    await this.navigate(ROUTES.CART);
  }

  async checkMatchesProductOnCart(expected: ProductInfo): Promise<void> {
    await expect(this.page.getByTestId(SELECTORS.sharedItemFields.lbl_inventoryItemName)).toHaveText(expected.name);
    await expect(this.page.getByTestId(SELECTORS.sharedItemFields.lbl_inventoryItemDescription)).toHaveText(expected.description);
    await expect(this.page.getByTestId(SELECTORS.sharedItemFields.lbl_inventoryItemPrice)).toHaveText(expected.price);
  }

  async checkItemAmountOnCartByName(productName: string, expectedAmount: number): Promise<void> {
    const product = this.getProductByName(productName);
    const productQuantity = product.getByTestId(SELECTORS.cart.input_quantityProduct);
    await expect(productQuantity).toHaveText(String(expectedAmount));
  }

  async addProductToCartByName(productName: string): Promise<void> {
    const product = this.getProductByName(productName);
    await product.getByRole("button", { name: SELECTORS.inventory.role_addToCartButton }).click();
  }

  async removeProductFromCartByName(productName: string): Promise<void> {
    const product = this.getProductByName(productName);
    await product.getByRole("button", { name: SELECTORS.inventory.role_removeButton }).click();
  }

  async removeAllProductsFromCart(): Promise<void> {
    const removeButton = this.page.getByRole("button", { name: SELECTORS.inventory.role_removeButton });
    
    while (await removeButton.count() > 0) {
      await removeButton.first().click();
    }
  }

  async checkZeroItemsInCart(): Promise<void> {
    const totalProducts = this.page.getByTestId(SELECTORS.sharedItemFields.div_inventoryItem);
    await expect(totalProducts).toHaveCount(0);
  }

  async checkCheckoutButtonVisible(): Promise<void> {
    await expect(this.page.getByTestId(SELECTORS.cart.btn_checkout)).toBeVisible();
  }

  async clickOnCheckoutButton(): Promise<void> {
    await this.page.getByTestId(SELECTORS.cart.btn_checkout).click();
  }
}
