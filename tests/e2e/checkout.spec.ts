import { test } from "../../src/fixtures";
import { AUTH_FILE } from "../../src/constants";
import { buildCheckoutInfo } from "../../src/data/checkout";

test.describe("Checkout", () => {
  test.use({ storageState: AUTH_FILE });

  test("1. should navigate to step two when submitting valid checkout information", async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addAllProductsToCartAndCheckCartBadge();
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.clickOnCheckoutButton();
    await checkoutPage.checkForRedirection(/checkout-step-one\.html/);
    await checkoutPage.fillCheckoutStepOneForm(buildCheckoutInfo());
    await checkoutPage.clickOnContinueButton();
    await checkoutPage.checkForRedirection(/checkout-step-two\.html/);
  });

  test("2. should show first name required error when all fields are empty", async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addProductToCartByName("Sauce Labs Backpack");
    await inventoryPage.addProductToCartByName("Sauce Labs Bike Light");
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.clickOnCheckoutButton();
    await checkoutPage.checkForRedirection(/checkout-step-one\.html/);
    await checkoutPage.clickOnContinueButton();
    await checkoutPage.checkErrorMessageForAllEmptyFields();
    await checkoutPage.checkSpecificErrorMessage("Error: First Name is required");
    await checkoutPage.checkForRedirection(/checkout-step-one\.html/);
  });

  test("3. should show last name required error when last name is missing", async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addProductToCartByName("Test.allTheThings() T-Shirt (Red)");
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.clickOnCheckoutButton();
    await checkoutPage.fillFirstName("Pedrooo");
    await checkoutPage.clickOnContinueButton();
    await checkoutPage.checkSpecificErrorMessage("Error: Last Name is required");
    await checkoutPage.checkForRedirection(/checkout-step-one\.html/);
  });  

  test("4. should show postal code required error when postal code is missing", async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addProductToCartByName("Test.allTheThings() T-Shirt (Red)");
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.clickOnCheckoutButton();
    await checkoutPage.fillFirstName("Pedrooo");
    await checkoutPage.fillLastName();
    await checkoutPage.clickOnContinueButton();
    await checkoutPage.checkSpecificErrorMessage("Error: Postal Code is required");
    await checkoutPage.checkForRedirection(/checkout-step-one\.html/);
  }); 

  test("5. should dismiss the checkout error when clicking the close button", async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addProductToCartByName("Sauce Labs Bike Light");
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.clickOnCheckoutButton();
    await checkoutPage.clickOnContinueButton();
    await checkoutPage.clickOnDismissErrorButton();
    await checkoutPage.checkErrorMessageIsNotVisible();
    
  });

  test("6. should return to the cart when clicking Cancel", async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addAllProductsToCartAndCheckCartBadge();
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.clickOnCheckoutButton();
    await checkoutPage.clickCancelButton();
    await cartPage.checkForRedirection(/cart\.html/);
    await cartPage.getAndValidateCartItemCount(6);
  });

  test("7. should accept randomly generated checkout information", async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addAllProductsToCartAndCheckCartBadge();
    await inventoryPage.clickOnShoppingCartIcon();
    await cartPage.clickOnCheckoutButton();
    await checkoutPage.fillCheckoutStepOneForm(buildCheckoutInfo());
    await checkoutPage.clickOnContinueButton();
    await checkoutPage.checkForRedirection(/checkout-step-two\.html/);
  });
});