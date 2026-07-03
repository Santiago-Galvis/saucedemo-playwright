/**
 * Tipos centrales del proyecto SauceDemo.
 *
 * Solo va aquí lo que se usa exclusivamente para tipar (nunca en un for/if/includes).
 * Si necesitas iterarlo o indexarlo en runtime, va en `data`.
 */

/** Los 6 usuarios de prueba que ofrece saucedemo.com */
export type SauceUser =
  | "standard_user"
  | "locked_out_user"
  | "problem_user"
  | "performance_glitch_user"
  | "error_user"
  | "visual_user";

/** Criterios de orden del dropdown de inventario */
export type SortOption = "az" | "za" | "lohi" | "hilo";

/** Datos de checkout step one */
export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}
