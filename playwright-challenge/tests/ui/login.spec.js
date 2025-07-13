const {test, expect} = require('@playwright/test')
const testData = require('../../data/testData.json')

const LOGIN_BUTTON = '[data-test="login-button"]';

test.describe('SauceDemo Functional Login Tests', () => {
    test('should login with standard user', async ({page}) => {
        await page.goto('/');
        await page.fill('[data-test="username"]', testData.validUsers.standard.username);
        await page.fill('[data-test="password"]', testData.validUsers.standard.password);
        await page.click(LOGIN_BUTTON);
        await expect(page).toHaveURL(/inventory/);
    });

    test('should not login with locked user', async ({page}) => {
        await page.goto('/');
        await page.fill('[data-test="username"]', testData.validUsers.locked.username);
        await page.fill('[data-test="password"]', testData.validUsers.locked.password);
        await page.click(LOGIN_BUTTON);
        await expect(page.locator('.error-message-container')).toContainText('Epic sadface: Sorry, this user has been locked out.');
        await expect(page).not.toHaveURL(/inventory/);
    });

    test('should allow error message to be dismissed for locked out user', async ({ page }) => {
        await page.goto('https://www.saucedemo.com');
        await page.fill('[data-test="username"]', testData.validUsers.locked.username);
        await page.fill('[data-test="password"]', testData.validUsers.locked.password);
        await page.click(LOGIN_BUTTON);

        const error = page.locator('[data-test="error"]');
        await expect(error).toBeVisible();

        await page.click('.error-button');

        await expect(error).not.toBeVisible();
    });


    test('should not login with invalid credentials', async ({page}) => {
        await page.goto('/');
        await page.fill('[data-test="username"]', testData.invalidUsers.wrongCredentials.username);
        await page.fill('[data-test="password"]', testData.invalidUsers.wrongCredentials.password);
        await page.click(LOGIN_BUTTON);
        await expect(page).not.toHaveURL(/inventory/);
    });

    test('should display error icons and clickable message with invalid credentials', async ({page}) => {
        await page.goto('/');
        await page.fill('[data-test="username"]', testData.invalidUsers.blankCredentials.username);
        await page.fill('[data-test="password"]', 'invalid_password');
        await page.click(LOGIN_BUTTON);
        await expect(page.locator('.error-message-container')).toContainText('Epic sadface: Username and password do not match any user in this service');
        await expect(page).not.toHaveURL(/inventory/);
    });
});