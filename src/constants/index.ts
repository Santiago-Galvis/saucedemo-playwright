/**
 * Constantes del proyecto SauceDemo.
 *
 * REGLA: si un selector o string aparece más de una vez en los tests, vive aquí.
 *
 * NOMENCLATURA de selectores (igual que Avianca, ver CLAUDE.md):
 *   btn_ / input_ / dropdown_ / lbl_ / txt_ / modal_ / msg_ / chk_ / radio_
 *
 * saucedemo.com decora casi todo con `data-test`, así que la mayoría de estos
 * valores son literalmente el valor de ese atributo — se consumen con
 * `page.getByTestId(SELECTORS.login.input_username)` gracias a
 * `testIdAttribute: "data-test"` en playwright.config.ts.
 */

// Sesión guardada por tests/setup/auth.setup.ts (standard_user), reusada por los tests
// que no son de LoginPage para saltarse el login (ver SESSION-01 en TEST_CASES.md).
export const AUTH_FILE = "playwright/.auth/standard_user.json";

export const ROUTES = {
  LOGIN: "/",
  INVENTORY: "/inventory.html",
  CART: "/cart.html",
  CHECKOUT_STEP_ONE: "/checkout-step-one.html",
  CHECKOUT_STEP_TWO: "/checkout-step-two.html",
  CHECKOUT_COMPLETE: "/checkout-complete.html",
} as const;

// Valores del atributo `value` de las <option> del dropdown de sort (product-sort-container).
export const SORT_OPTIONS = {
  NAME_ASC: "az",
  NAME_DESC: "za",
  PRICE_ASC: "lohi",
  PRICE_DESC: "hilo",
} as const;

export const TIMEOUTS = {
  SHORT: 3_000,
  DEFAULT: 15_000,
  LONG: 30_000,
  // performance_glitch_user simula latencia — no subir el timeout global por esto (ver CLAUDE.md)
  GLITCH_USER: 20_000,
} as const;

export const SELECTORS = {
  login: {
    input_username: "username",
    input_password: "password",
    btn_login: "login-button",
    msg_error: "error",
    btn_closeError: "error-button",
  },
  inventory: {
    div_header: "primary-header",
    lbl_headerTitle: "Swag Labs",
    btn_hamburgerMenu: "#react-burger-menu-btn",
    btn_shoppingCart: "shopping-cart-link",
    div_inventoryItem: "inventory-item",
    lbl_inventoryItemName: "inventory-item-name",
    lbl_inventoryItemDescription: "inventory-item-desc",
    lbl_inventoryItemPrice: "inventory-item-price",
    role_addToCartButton: "Add to cart",
    role_removeButton: "Remove",
    dropdown_sort: "product-sort-container",
  },
  global: {
    icon_cartBadge: "shopping-cart-badge",
    btn_cart: "shopping-cart-link",
    btn_menu: "open-menu",
    btn_closeMenu: "close-menu",
    lbl_menuLogout: "logout-sidebar-link",
    lbl_menuAllItems: "inventory-sidebar-link",
    lbl_menuReset: "reset-sidebar-link",
  },
} as const;
