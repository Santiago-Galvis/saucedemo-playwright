import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { SELECTORS, ROUTES } from "../constants";

export class InventoryPage extends BasePage {
  async goToInventory(): Promise<void> {
    await this.navigate(ROUTES.INVENTORY);
  }

  async checkInventoryDisplayedItems(): Promise<void> {
    const allProducts = this.page.getByTestId(SELECTORS.inventory.div_inventoryItem);
    await expect(allProducts).toHaveCount(6);

    for (const product of await allProducts.all()) {
      await expect(product.getByTestId(SELECTORS.inventory.lbl_inventoryItemName)).toBeVisible();
      await expect(product.getByTestId(SELECTORS.inventory.lbl_inventoryItemDescription)).toBeVisible();
      await expect(product.getByTestId(SELECTORS.inventory.lbl_inventoryItemPrice)).toBeVisible();
      await expect(product.getByRole("button", { name: SELECTORS.inventory.role_addToCartButton }),).toBeVisible();
      await expect(product.getByRole("img")).toHaveAttribute("src", /.+/);
    }
  }
}
