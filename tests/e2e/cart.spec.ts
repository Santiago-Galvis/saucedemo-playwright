import { test } from "../../src/fixtures";
import { AUTH_FILE } from "../../src/constants";

test.describe("Cart", () => {
  test.use({ storageState: AUTH_FILE });

  test("1. should navigate to the cart and show added items", async ({ inventoryPage, cartPage,}) => {
    await inventoryPage.goToInventory();
    const expectedProduct = await inventoryPage.getProductInfo("Sauce Labs Bike Light");

    await inventoryPage.addProductToCartByName("Sauce Labs Bike Light");
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.checkMatchesProductOnCart(expectedProduct);
    await cartPage.checkItemAmountOnCartByName("Sauce Labs Bike Light", 1);
  });

  test("2. should show an empty cart with the Checkout button still visible", async ({ inventoryPage, cartPage,}) => {
    await cartPage.goToCart();
    await cartPage.checkZeroItemsInCart();
    await cartPage.checkCheckoutButtonVisible();
  });

  

});