import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { SELECTORS } from "../constants";
import type { ProductInfo } from "../types";

export class ProductDetailPage extends BasePage {
  async checkMatchesProduct(expected: ProductInfo): Promise<void> {
    await expect(this.page.getByTestId(SELECTORS.inventory.lbl_inventoryItemName)).toHaveText(expected.name);
    await expect(this.page.getByTestId(SELECTORS.inventory.lbl_inventoryItemDescription)).toHaveText(expected.description,);
    await expect(this.page.getByTestId(SELECTORS.inventory.lbl_inventoryItemPrice)).toHaveText(expected.price);
    await expect(this.page.getByTestId(SELECTORS.productDetail.img_inventoryItem)).toHaveAttribute("src", expected.imageSrc);
  }
}
