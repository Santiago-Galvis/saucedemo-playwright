import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { SELECTORS } from "../constants";
import type { ProductInfo } from "../types";

export class CartPage extends BasePage {
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
}
