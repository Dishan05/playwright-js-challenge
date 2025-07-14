const { test, expect } = require("@playwright/test");
const { login } = require("../../utils/loginHelper.js");
const testData = require("../../data/testData.json");

const loginPage = "/";
const inventoryPage = "/inventory.html";

const SELECTORS = {
  errorMessage: '[data-test="error"]',
  errorButton: ".error-button",
  errorIcon: ".error_icon",
  usernameInput: "#user-name",
  passwordInput: "#password"
};

test.describe("Functional Login Tests", () => {
  test("Given standard user credentials, when user logs in, user is redirected to inventory page", async ({ page }) => {
    await page.goto(loginPage);
    await login(page, testData.validUsers.standard_user.username, testData.validUsers.standard_user.password);
    
    // Assert that the user is redirected to the inventory page
    await expect(page).toHaveURL(inventoryPage);
  });

  test("Given locked user credentials, after logging in, user sees and can dismiss error message", async ({
    page,
  }) => {
    await page.goto(loginPage);
    await login(page, testData.lockedUsers.locked_out_user.username, testData.lockedUsers.locked_out_user.password);

    // Assert that the error message is correctly displayed, and the user is not redirected to the inventory page
    const error = page.locator(SELECTORS.errorMessage);
    await expect(page.locator(SELECTORS.errorMessage)).toContainText(testData.lockedUsers.locked_out_user.error);
    await expect(error).toBeVisible();
    await expect(page).not.toHaveURL(inventoryPage);

    // Assert that the error button is clickable, and dismissed the error
    await page.click(SELECTORS.errorButton);
    await expect(error).not.toBeVisible();
  });

  for (const [key, user] of Object.entries(testData.invalidUsers)) {
    test(`Given invalid users, when login is clicked, login should be unsuccessful, and should show error message and icons for invalid credentials: ${key}`, async ({
      page,
    }) => {
      await page.goto(loginPage);

      await login(page, user.username, user.password);

      const errorMsg = page.locator(SELECTORS.errorMessage);

      // Assert that the correct error message is displayed
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText(user.error);

      // Assert that the user has not been redirected to the inventory page
      await expect(page).not.toHaveURL(inventoryPage);

      // Assert that red error icons appear next to username and password
      const errorIcons = page.locator(SELECTORS.errorIcon);
      await expect(errorIcons).toHaveCount(2);
      await expect(errorIcons.nth(0)).toBeVisible();
      await expect(errorIcons.nth(1)).toBeVisible();

      // Verify error classes are applied to inputs
      await expect(page.locator(SELECTORS.usernameInput)).toHaveClass(/input_error/);
      await expect(page.locator(SELECTORS.passwordInput)).toHaveClass(/input_error/);

      // Click the dismiss icon to close the error
      await page.click(SELECTORS.errorButton);
      await expect(errorMsg).not.toBeVisible();

      // Should be gone after dismissal
      await expect(errorIcons).toHaveCount(0);
    });
  }
});

test.describe("Edge Case Login Form Tests", () => {
  test('Given credentials with leading/trailing whitespace, when logging in, then the login should be unsuccessful', async ({ page }) => {
  await page.goto(loginPage);
  await login(page, ` ${testData.validUsers.standard_user.username} `, ` ${testData.validUsers.standard_user.password} `);
  await expect(page).not.toHaveURL(inventoryPage);
});

test('Given username is in uppercase, when logging in, then the login should be unsuccessful', async ({ page }) => {
  await page.goto(loginPage);
  await login(page, testData.validUsers.standard_user.username.toUpperCase(), testData.validUsers.standard_user.password);
  await expect(page.locator(SELECTORS.errorMessage)).toBeVisible();
  await expect(page).not.toHaveURL(inventoryPage);
});

test('Given multiple failed logins, when login is clicked, then consistent errors should be shown.', async ({ page }) => {
  await page.goto(loginPage);
  for (let i = 0; i < 10; i++) {
    await login(page, testData.invalidUsers.wrongCredentials.username, testData.invalidUsers.wrongCredentials.username);

    const error = page.locator(SELECTORS.errorMessage);
    await expect(error).toBeVisible();
    await expect(error).toContainText(testData.invalidUsers.wrongCredentials.error);
  }
});

  test("Given an extremely large username, and password, when logging in, then no overflow errors should occur", async ({ page }) => {
    const longText = "a".repeat(1000);

    await page.goto(loginPage);
    await login(page, longText, longText);

    const error = page.locator(SELECTORS.errorMessage);
    await expect(error).toBeVisible();
    await expect(error).toContainText(testData.invalidUsers.wrongCredentials.error);
  });

  test('Given accessibility considerations, the login page should allow login via keyboard-only navigation', async ({ page }) => {
  await page.goto(loginPage);

  await page.locator(SELECTORS.usernameInput).focus();
  await page.keyboard.type(testData.validUsers.standard_user.username);

  await page.keyboard.press('Tab');
  await page.keyboard.type(testData.validUsers.standard_user.password);

  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(inventoryPage);
});

  test('Given security considerations, the login page should not be vulnerable to SQL injection', async ({ page }) => {
  await page.goto(loginPage);
  await login(page, "' OR '1'='1", 'password');

  await expect(page.locator(SELECTORS.errorMessage)).toBeVisible();
  await expect(page).not.toHaveURL(inventoryPage);
});
});
