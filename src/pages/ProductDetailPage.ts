import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { SELECTORS } from "../constants";
import type { ProductInfo } from "../types";

export class ProductDetailPage extends BasePage {
  async checkMatchesProduct(expected: ProductInfo): Promise<void> {
    await expect(this.page.getByTestId(SELECTORS.sharedItemFields.lbl_inventoryItemName)).toHaveText(expected.name);
    await expect(this.page.getByTestId(SELECTORS.sharedItemFields.lbl_inventoryItemDescription)).toHaveText(expected.description);
    await expect(this.page.getByTestId(SELECTORS.sharedItemFields.lbl_inventoryItemPrice)).toHaveText(expected.price);
    await expect(this.page.getByTestId(SELECTORS.productDetail.img_inventoryItem)).toHaveAttribute("src", expected.imageSrc);
  }

  async goToInvalidProductId(invalidId: number | string = 999): Promise<void> {
    const url = new URL(this.page.url());
    url.searchParams.set("id", String(invalidId));
    await this.page.goto(url.toString());
  }

  async checkItemNotFound(): Promise<void> {
    await expect(this.page.getByText("ITEM NOT FOUND")).toBeVisible();
  }

  async checkRedirectionToInventoryDetail(): Promise<void> {
    await this.page.getByTestId(SELECTORS.productDetail.btn_backToProducts).click();
    await expect(this.page).toHaveURL(/\/inventory\.html$/);
  }

  async addToCart(): Promise<void> {
    await this.page.getByRole("button", { name: SELECTORS.inventory.role_addToCartButton }).click();
  }

  async removeFromCart(): Promise<void> {
    await this.page.getByRole("button", { name: SELECTORS.inventory.role_removeButton }).click();
  }

  async clickBackToProducts(): Promise<void> {
    await this.page.getByTestId(SELECTORS.productDetail.btn_backToProducts).click();
  }

  async checkRemoveButtonVisible(): Promise<void> {
    await expect(this.page.getByRole("button", { name: SELECTORS.inventory.role_removeButton })).toBeVisible();
  }
}
