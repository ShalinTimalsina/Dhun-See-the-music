import { Page, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async getHeading() {
    return this.page.locator('h1', { hasText: 'Music Platform' });
  }

  async verifyHeadingVisible() {
    const heading = await this.getHeading();
    await expect(heading).toBeVisible();
  }
}
