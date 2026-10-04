import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Core User Flow - Smoke Test', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should load the homepage and display the correct heading', async () => {
    // Navigate to the root URL
    await homePage.goto();

    // Verify the core state (H1 is visible)
    await homePage.verifyHeadingVisible();
  });
});
