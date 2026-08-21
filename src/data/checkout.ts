import { faker } from "@faker-js/faker";
import { CheckoutInfo } from "../types/index";

/**
 * Genera datos de checkout step one. Sin overrides, todo es random (faker);
 * con overrides, solo se pisan los campos indicados.
 */
export function buildCheckoutInfo(overrides?: Partial<CheckoutInfo>): CheckoutInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode(),
    ...overrides,
  };
}
