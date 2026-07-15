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
});
