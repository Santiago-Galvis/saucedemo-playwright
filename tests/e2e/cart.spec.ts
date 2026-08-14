import { test } from "../../src/fixtures";
import { AUTH_FILE } from "../../src/constants";

test.describe("Cart", () => {
  test.use({ storageState: AUTH_FILE });

  test("1. should navigate to the cart and show added items", async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goToInventory();
    const expectedProduct = await inventoryPage.getProductInfo("Sauce Labs Bike Light");

    await inventoryPage.addProductToCartByName("Sauce Labs Bike Light");
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.checkMatchesProductOnCart(expectedProduct);
    await cartPage.checkItemAmountOnCartByName("Sauce Labs Bike Light", 1);
  });

  test("2. should show an empty cart with the Checkout button still visible", async ({ cartPage }) => {
    await cartPage.goToCart();
    await cartPage.checkZeroItemsInCart();
    await cartPage.checkCheckoutButtonVisible();
  });

  test("3. when an item is removed from the cart, badge decrement", async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addAllProductsToCartAndCheckCartBadge();
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.removeProductFromCartByName("Sauce Labs Bike Light");
    await cartPage.getAndValidateCartItemCount(5);
  });

  test("4. should clear the cart when removing all items", async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addAllProductsToCartAndCheckCartBadge();
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.removeAllProductsFromCart();
    await cartPage.checkZeroItemsInCart();
    await cartPage.getAndValidateCartItemCount(0);
  });

  test("5. should return to inventory when clicking Continue Shopping)", async ({ inventoryPage, cartPage }) => {    
    await inventoryPage.goToInventory();
    await inventoryPage.addProductToCartByName("Sauce Labs Bike Light");
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.clickContinueShoppingButton();
    await cartPage.checkForRedirection(/inventory\.html/);
  });

  test("6. should navigate to checkout step one when clicking Checkout", async ({ inventoryPage, cartPage }) => {     
    await inventoryPage.goToInventory();
    await inventoryPage.addProductToCartByName("Test.allTheThings() T-Shirt (Red)");
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.clickCheckoutButton();
    await cartPage.checkForRedirection(/checkout-step-one\.html/);
  });

  test("7. should navigate to the product detail when clicking an item name in the cart", async ({ inventoryPage, cartPage, productDetailPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addProductToCartByName("Sauce Labs Backpack");
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.clickProductName("Sauce Labs Backpack");
    await productDetailPage.checkForRedirection(/inventory-item\.html/);
  });

  test("8. should show quantity 1 for each added item in the cart", async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addAllProductsToCartAndCheckCartBadge();
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.validateQtyOneForAllProductsInCart();
  });

});