import { SauceUser } from "../types/index";

/**
 * Usuarios de prueba de saucedemo.com — todos comparten la misma password.
 * Se itera en tests data-driven (ver LOGIN-13 en TEST_CASES.md).
 */
export const PASSWORD = "secret_sauce";

export interface UserCase {
  username: SauceUser;
  canLogin: boolean;
  expectedError?: string;
}

export const USERS: UserCase[] = [
  { username: "standard_user", canLogin: true },
  { username: "locked_out_user", canLogin: false, expectedError: "Sorry, this user has been locked out." },
  { username: "problem_user", canLogin: true },
  { username: "performance_glitch_user", canLogin: true },
  { username: "error_user", canLogin: true },
  { username: "visual_user", canLogin: true },
];
