import { test } from "../../src/fixtures";
import { AUTH_FILE } from "../../src/constants";

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
});
