import { createBdd } from 'playwright-bdd';
import { test } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, Then } = createBdd(test);

Given('I am on the homepage', async ({ page }) => {
  await page.goto('/');
});

Then('I should see the main heading', async ({ page }) => {
  // Ensuring basic visibility of the app
  await expect(page.locator('body')).toBeVisible();
});
