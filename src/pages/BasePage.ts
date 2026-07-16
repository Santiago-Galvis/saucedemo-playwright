import { type Page, type Locator, expect } from "@playwright/test";
import { TIMEOUTS } from "../constants";

/**
 * BasePage — utilidades transversales heredadas por todos los Page Objects.
 *
 * Arranca deliberadamente pequeño (solo lo que usa LoginPage). Se va llenando
 * página por página como en el proyecto Avianca — ver CLAUDE.md para el
 * catálogo completo de métodos que probablemente termines necesitando
 * (clickRandomFrom, interceptLastResponse, getCssSpecificStyle, etc.).
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string): Promise<void> {
    await this.page.goto(path, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUTS.LONG,
    });
  }

  protected getFirst(selector: string): Locator {
    return this.page.locator(selector).first();
  }

  async clickFirst(selector: string): Promise<void> {
    await this.getFirst(selector).click();
  }

  async waitForVisible(locator: Locator, timeout: number = TIMEOUTS.DEFAULT): Promise<void> {
    await locator.waitFor({ state: "visible", timeout });
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async getCookie(name: string): Promise<string | null> {
    const cookies = await this.page.context().cookies();
    return cookies.find((c) => c.name === name)?.value ?? null;
  }

  /** Assertion bloqueante reutilizable: falla si el locator con ese texto no aparece. */
  async expectVisibleText(locator: Locator, text: string): Promise<void> {
    await expect(locator, `Se esperaba el texto "${text}"`).toHaveText(text);
  }

  /** Assertion bloqueante reutilizable: falla si el atributo del locator no tiene el valor esperado. */
  async expectAttribute(locator: Locator, attribute: string, expected: string): Promise<void> {
    const actual = await locator.getAttribute(attribute);
    await expect(locator, `Se esperaba atributo "${attribute}"="${expected}" pero era "${actual}"`).toHaveAttribute(
      attribute,
      expected,
    );
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }
}
