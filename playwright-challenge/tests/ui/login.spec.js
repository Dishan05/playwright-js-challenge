const { test, expect } = require("@playwright/test");
const { login } = require("../../utils/loginHelper.js");
const testData = require("../../data/testData.json");

const loginPage = "/";
const inventoryPage = "/inventory.html";

const errorMessage = '[data-test="error"]';
const errorButton = ".error-button";
const errorIcon = ".error_icon";

test.describe("Functional Login Tests", () => {
  test("should login with standard user", async ({ page }) => {
    await page.goto(loginPage);
    await login(page, testData.validUsers.standard_user.username, testData.validUsers.standard_user.password);
    await expect(page).toHaveURL(inventoryPage);
  });

  test("should not login with locked user", async ({ page }) => {
    await page.goto(loginPage);
    await login(page, testData.validUsers.locked_out_user.username, testData.validUsers.locked_out_user.password);
    await expect(page.locator(errorMessage)).toContainText(
      "Epic sadface: Sorry, this user has been locked out."
    );
    await expect(page).not.toHaveURL(inventoryPage);
  });

  test("should allow error message to be dismissed for locked out user", async ({
    page,
  }) => {
    await page.goto(loginPage);
    await login(page, testData.validUsers.locked_out_user.username, testData.validUsers.locked_out_user.password);

    const error = page.locator(errorMessage);
    await expect(error).toBeVisible();

    await page.click(errorButton);

    await expect(error).not.toBeVisible();
  });

  for (const [key, user] of Object.entries(testData.invalidUsers)) {
    test(`should not login, and should show error message and icons for invalid credentials: ${key}`, async ({
      page,
    }) => {
      await page.goto(loginPage);

      await login(page, user.username, user.password);

      const errorMsg = page.locator(errorMessage);
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText(user.error);

      // Verify that the user has not been redirected to the inventory page
      await expect(page).not.toHaveURL(inventoryPage);

      // Verify that red error icons appear next to username and password
      const errorIcons = page.locator(errorIcon);
      await expect(errorIcons).toHaveCount(2);
      await expect(errorIcons.nth(0)).toBeVisible();
      await expect(errorIcons.nth(1)).toBeVisible();

      // Verify error classes are applied to inputs
      await expect(page.locator("#user-name")).toHaveClass(/input_error/);
      await expect(page.locator("#password")).toHaveClass(/input_error/);

      // Click the dismiss icon to close the error
      await page.click(errorButton);
      await expect(errorMsg).not.toBeVisible();

      // Should be gone after dismissal
      await expect(errorIcons).toHaveCount(0);
    });
  }
});

test.describe("Edge Case Login Form Tests", () => {
  test('should handle credentials with leading/trailing whitespace', async ({ page }) => {
  await page.goto(loginPage);
  await login(page, ' standard_user ', ' secret_sauce ');
  await expect(page).not.toHaveURL(inventoryPage);
});

test('should fail login if username is in uppercase', async ({ page }) => {
  await page.goto(loginPage);
  await login(page, testData.validUsers.standard_user.username.toUpperCase(), testData.validUsers.standard_user.password);
  await expect(page.locator(errorMessage)).toBeVisible();
  await expect(page).not.toHaveURL(inventoryPage);
});

test('should show consistent errors after multiple failed logins', async ({ page }) => {
  await page.goto(loginPage);
  for (let i = 0; i < 10; i++) {
    await login(page, 'invalid_user', 'wrong_password');

    const error = page.locator(errorMessage);
    await expect(error).toBeVisible();
    await expect(error).toContainText('Username and password do not match');
  }
});
  
  test("should handle overflow input gracefully", async ({ page }) => {
    const longText = "a".repeat(1000);

    await page.goto(loginPage);
    await login(page, longText, longText);

    const error = page.locator(errorMessage);
    await expect(error).toBeVisible();
    await expect(error).toContainText("Username and password do not match");
  });

  test('should allow login via keyboard-only navigation', async ({ page }) => {
  await page.goto(loginPage);
  await page.keyboard.press('Tab');
  await page.keyboard.type(testData.validUsers.standard_user.username);
  await page.keyboard.press('Tab');
  await page.keyboard.type(testData.validUsers.standard_user.password);
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(inventoryPage);
});

  test('should not be vulnerable to SQL injection', async ({ page }) => {
  await page.goto(loginPage);
  await login(page, "' OR '1'='1", 'password');

  await expect(page.locator(errorMessage)).toBeVisible();
  await expect(page).not.toHaveURL(inventoryPage);
});
});
