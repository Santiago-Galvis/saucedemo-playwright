import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { SELECTORS, ROUTES, SORT_OPTIONS } from "../constants";

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

  async checkTitleAndLogoOnHeader(): Promise<void> {
    await expect(this.page.getByTestId(SELECTORS.inventory.div_header)).toBeVisible();
    await expect(this.page.getByText(SELECTORS.inventory.lbl_headerTitle)).toBeVisible();
    await expect(this.page.locator(SELECTORS.inventory.btn_hamburgerMenu)).toBeVisible();
    await expect(this.page.getByTestId(SELECTORS.inventory.btn_shoppingCart)).toBeVisible();
  }

  async checkDefaultSortIsNameAscending(): Promise<void> {

    await expect(this.page.getByTestId(SELECTORS.inventory.dropdown_sort)).toHaveValue(SORT_OPTIONS.NAME_ASC);

    const productNames = await this.page.getByTestId(SELECTORS.inventory.lbl_inventoryItemName).allTextContents();
    const sortedNames = [...productNames].sort((a, b) => a.localeCompare(b));

    expect(productNames).toEqual(sortedNames);
  }

  async sortBy(option: string): Promise<void> {
    await this.page.getByTestId(SELECTORS.inventory.dropdown_sort).selectOption(option);
  }

  async checkSortIsNameDescending(): Promise<void> {
    const productNames = await this.page.getByTestId(SELECTORS.inventory.lbl_inventoryItemName).allTextContents();
    const sortedNames = [...productNames].sort((a, b) => b.localeCompare(a));

    expect(productNames).toEqual(sortedNames);
  }

  async checkSortIsPriceAscending(): Promise<void> {
    const prices = await this.getProductPrices();
    const sortedPrices = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sortedPrices);
  }

  private async getProductPrices(): Promise<number[]> {
    const priceTexts = await this.page.getByTestId(SELECTORS.inventory.lbl_inventoryItemPrice).allTextContents();
    return priceTexts.map((price) => Number(price.replace("$", "")));
  }

  async checkSortIsPriceDescending(): Promise<void> {
    const prices = await this.getProductPrices();
    const sortedPrices = [...prices].sort((a, b) => b - a);

    expect(prices).toEqual(sortedPrices);
  }

  async addProductToCartByNameAndCheckRemoveButton(productName: string): Promise<void> {
    const product = this.page
      .getByTestId(SELECTORS.inventory.div_inventoryItem)
      .filter({ has: this.page.getByText(productName, { exact: true }) });

    await product.getByRole("button", { name: SELECTORS.inventory.role_addToCartButton }).click();
    await expect(product.getByRole("button", { name: SELECTORS.inventory.role_removeButton })).toBeVisible();
    await expect(product.getByRole("button", { name: SELECTORS.inventory.role_removeButton })).toHaveCSS("color", "rgb(226, 35, 26)");
    await expect(product.getByRole("button", { name: SELECTORS.inventory.role_removeButton })).toHaveCSS("border", "1px solid rgb(226, 35, 26)");
  }

  async getCartItemCount(expectedCount: number): Promise<void> {
    const itemCount = await this.page.getByTestId(SELECTORS.inventory.btn_shoppingCart).textContent();

    expect(itemCount).toBe(expectedCount.toString)
  }

  
}
