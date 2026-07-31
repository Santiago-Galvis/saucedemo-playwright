import { test } from "../../src/fixtures";
import { AUTH_FILE } from "../../src/constants";

test.describe("Product Detail", () => {
  test.use({ storageState: AUTH_FILE });

  test("1. should navigate to product detail when clicking the product name", async ({ inventoryPage, productDetailPage,}) => {
    await inventoryPage.goToInventory();
    const expectedProduct = await inventoryPage.getProductInfo("Sauce Labs Backpack");

    await inventoryPage.clickProductName("Sauce Labs Backpack");
    await productDetailPage.checkMatchesProduct(expectedProduct);
  });
});