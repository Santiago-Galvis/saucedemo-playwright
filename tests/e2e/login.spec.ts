import { test } from "../../src/fixtures";
import { PASSWORD, USERS } from "../../src/data/users";

/**
 * Cubre los 5 casos definidos como prioritarios en TEST_CASES.md
 * (LOGIN-01, LOGIN-02, LOGIN-07, LOGIN-04/05/06, LOGIN-09).
 */
test.describe("Login", () => {
  test("1. should redirect to inventory when logging in with valid credentials", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login("standard_user", PASSWORD);
    await loginPage.expectLoggedIn();
  });

  test("2. should show mismatch error when password is invalid", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login("standard_user", "wrong_password");
    await loginPage.expectError("Epic sadface: Username and password do not match any user in this service");
  });

  test("7. should show lockout error for locked_out_user", async ({ loginPage }) => {
    const lockedUser = USERS.find((u) => u.username === "locked_out_user");
    if (!lockedUser?.expectedError) throw new Error("locked_out_user fixture data is missing expectedError");

    await loginPage.goto();
    await loginPage.login(lockedUser.username, PASSWORD);
    await loginPage.expectError(`Epic sadface: ${lockedUser.expectedError}`);
  });

  test("4. should validate required fields when submitting incomplete forms", async ({ loginPage }) => {
    const cases = [
      {
        username: "",
        password: "",
        expectedError: "Epic sadface: Username is required",
      },
      {
        username: "standard_user",
        password: "",
        expectedError: "Epic sadface: Password is required",
      },
      {
        username: "",
        password: PASSWORD,
        expectedError: "Epic sadface: Username is required",
      },
    ];

    for (const { username, password, expectedError } of cases) {
      await loginPage.goto();
      await loginPage.login(username, password);
      await loginPage.expectError(expectedError);
    }
  });

  test("5. should clear the error and log in successfully on retry", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login("standard_user", "wrong_password");
    await loginPage.expectError("Epic sadface: Username and password do not match any user in this service");

    await loginPage.dismissError();
    await loginPage.expectNoError();

    await loginPage.login("standard_user", PASSWORD);
    await loginPage.expectLoggedIn();
  });

  test("6. should treat username with leading or trailing whitespace as a mismatch", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(" standard_user ", PASSWORD);
    await loginPage.expectError("Epic sadface: Username and password do not match any user in this service");
  });

  test("8. should show a dismiss button when a login error occurs", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login("invalid_user", PASSWORD);
    await loginPage.expectDismissButton();
  });

  test("9. should clear the error and log in successfully on retry", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login("Como", PASSWORD);
    await loginPage.expectError("Epic sadface: Username and password do not match any user in this service");
    await loginPage.expectDismissButton(true);
    await loginPage.expectNoError();

    await loginPage.login("standard_user", PASSWORD);
    await loginPage.expectLoggedIn();
  });

  test("10. should reject username with different casing", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login("standard_user".toUpperCase(), PASSWORD);
    await loginPage.expectError("Epic sadface: Username and password do not match any user in this service");
  });

  test("11. should mask the password input", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.fillCredentials("standard_user", PASSWORD);
    await loginPage.expectPasswordMasked();
  });

  test("12. should log in successfully when submitting with Enter", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.fillCredentials("standard_user", PASSWORD);
    await loginPage.submitWithEnter();
    await loginPage.expectLoggedIn();
  });
  
});
