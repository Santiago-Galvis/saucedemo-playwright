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

  test("2. should navigate to product detail when clicking the product image", async ({ inventoryPage, productDetailPage,}) => {
    await inventoryPage.goToInventory();
    await inventoryPage.clickProductName("Sauce Labs Fleece Jacket");
    await productDetailPage.checkForRedirection(/inventory-item/);
  });

  test("3. should add the product to the cart from the detail page", async ({ inventoryPage, productDetailPage,}) => {
    await inventoryPage.goToInventory();
    await inventoryPage.clickProductImage("Sauce Labs Bolt T-Shirt");
    await productDetailPage.checkForRedirection(/inventory-item/);
    await productDetailPage.addToCart();
    await productDetailPage.checkRemoveButtonVisible();
    await inventoryPage.getAndValidateCartItemCount(1);
  });

  test("4. should remove the product from the cart from the detail page", async ({ inventoryPage, productDetailPage,}) => {
    await inventoryPage.goToInventory();
    await inventoryPage.clickProductImage("Sauce Labs Onesie");
    await productDetailPage.checkForRedirection(/inventory-item/);
    await productDetailPage.addToCart();
    await productDetailPage.removeFromCart();
    await inventoryPage.getAndValidateCartItemCount(0);
  });

  test("5. should return to inventory when clicking Back to products", async ({ inventoryPage, productDetailPage,}) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addProductToCartByName("Sauce Labs Fleece Jacket")
    await inventoryPage.clickProductName("Test.allTheThings() T-Shirt (Red)");
    await productDetailPage.addToCart();
    await productDetailPage.clickBackToProducts();
    await productDetailPage.checkForRedirection(/inventory\.html/);
    await inventoryPage.getAndValidateCartItemCount(2);
  });

  test("7. should show ITEM NOT FOUND for an invalid product id", async ({ inventoryPage, productDetailPage,}) => {
    await inventoryPage.goToInventory();
    await inventoryPage.clickProductName("Sauce Labs Backpack");
    await productDetailPage.checkForRedirection(/inventory-item/);
    await productDetailPage.goToInvalidProductId();
    await productDetailPage.checkItemNotFound();
  });

  test("8. should sync cart state when opening detail after adding from inventory", async ({ inventoryPage, productDetailPage,}) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addProductToCartByName("Sauce Labs Backpack");
    await inventoryPage.clickProductName("Sauce Labs Backpack");
    await productDetailPage.checkForRedirection(/inventory-item/);
    await productDetailPage.checkRemoveButtonVisible();
    await inventoryPage.getAndValidateCartItemCount(1);
  });

});