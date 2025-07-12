const {test, expect} = require('@playwright/test')

test.describe('SauceDemo Login', () => {
    test('should login with standard user', async ({page}) => {
        await page.goto('/');
        await page.fill('[data-test="username"]', 'standard_user');
        await page.fill('[data-test="password"]', 'secret_sauce');
        await page.click('[data-test="login-button"]');
        await expect(page).toHaveURL(/inventory/);
    });
});