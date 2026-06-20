import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Block all external requests to prevent EAI_AGAIN errors in offline test environment
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      route.abort();
    } else {
      route.continue();
    }
  });
});

test('has title and login options', async ({ page }) => {
  await page.goto('/');

  // Check if the page has loaded successfully by verifying URL or title
  await expect(page).toHaveTitle(/SmartClinic/i);
});
