import { test as base } from "@playwright/test";
import { InventoryPage, LoginPage, ProductDetailPage, CartPage} from "../pages";

/**
 * Custom Fixtures — cada página ya instanciada y lista para usar en los tests.
 *
 *   test("mi test", async ({ loginPage }) => { ... })
 *
 * Añade una entrada aquí por cada Page Object nuevo que crees.
 */
type PageFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});

export { expect } from "@playwright/test";
