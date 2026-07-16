import { test } from "../../src/fixtures";
import { AUTH_FILE, SORT_OPTIONS } from "../../src/constants";

/**
 * Pendiente: cubrir los casos INV-01 a INV-15 definidos en TEST_CASES.md.
 * Todavía no hay ningún caso de Inventory implementado en este archivo.
 */
test.describe("Inventory", () => {
  test.use({ storageState: AUTH_FILE });

  test("1. should redirect to inventory when logging in with valid credentials", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.checkInventoryDisplayedItems();
  });

  test("2. should show the Products header and logo", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.checkTitleAndLogoOnHeader();
  });

  test("3. should sort products by name ascending by default", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.checkDefaultSortIsNameAscending();
  });

  test("4. should sort products by name descending when selected", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.sortBy(SORT_OPTIONS.NAME_DESC);
    await inventoryPage.checkSortIsNameDescending();
  });

  test("5. should sort products by price ascending when selected", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.sortBy(SORT_OPTIONS.PRICE_ASC);
    await inventoryPage.checkSortIsPriceAscending();
  });

  test("6. should sort products by price descending when selected", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.sortBy(SORT_OPTIONS.PRICE_DESC);
    await inventoryPage.checkSortIsPriceDescending();
  });

  test("7. should add a product to the cart when clicking Add to cart", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addProductToCartByName("Sauce Labs Backpack");
    await inventoryPage.checkRemoveButtonForProduct("Sauce Labs Backpack");
    await inventoryPage.getAndValidateCartItemCount(1);
  });

  test("8. should update the cart badge when adding multiple products", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addAllProductsToCartAndCheckCartBadge();
  });
  
  test("9. should remove a product from the cart when clicking Remove", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addAllProductsToCartAndCheckCartBadge();
    await inventoryPage.removeProductFromCartByName("Sauce Labs Fleece Jacket");
    await inventoryPage.checkAddButtonForProduct("Sauce Labs Fleece Jacket")
    await inventoryPage.getAndValidateCartItemCount(5);
  });

  test("10. should hide the cart badge when removing the last product", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addProductToCartByName("Sauce Labs Backpack");
    await inventoryPage.getAndValidateCartItemCount(1);
    await inventoryPage.removeProductFromCartByName("Sauce Labs Backpack");
    await inventoryPage.getAndValidateCartItemCount(0);
  });

  test("11. should add all 6 products to the cart", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.checkAllProductsShowRemoveButton();
  });

  test("12. should show the Add to cart button for all products after removing them", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addAllProductsToCartAndCheckCartBadge();
    await inventoryPage.sortBy(SORT_OPTIONS.PRICE_DESC);
    await inventoryPage.getAndValidateCartItemCount(6)
  });

  test("13. should preserve cart state after reloading the page", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.addProductToCartByName("Sauce Labs Onesie");
    await inventoryPage.getAndValidateCartItemCount(1);
    await inventoryPage.reload();
    await inventoryPage.getAndValidateCartItemCount(1);
  });

  test("14. should load a valid and unique image for each product", async ({ inventoryPage }) => {
    await inventoryPage.goToInventory();
    await inventoryPage.checkAllProductImagesAreValidAndUnique();
  });

});
