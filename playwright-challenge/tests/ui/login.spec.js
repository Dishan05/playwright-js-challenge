const { test, expect } = require("@playwright/test");
const testData = require("../../data/testData.json");

const LOGIN_PAGE = "/";
const INVENTORY_PAGE = "/inventory.html";

const LOGIN_BUTTON = '[data-test="login-button"]';
const ERROR_MESSAGE = '[data-test="error"]';
const USERNAME_INPUT = '[data-test="username"]';
const PASSWORD_INPUT = '[data-test="password"]';
const ERROR_BUTTON = ".error-button";

test.describe("Functional Login Tests", () => {
  test("should login with standard user", async ({ page }) => {
    await page.goto(LOGIN_PAGE);
    await page.fill(
      USERNAME_INPUT,
      testData.validUsers.standard.username
    );
    await page.fill(
      PASSWORD_INPUT,
      testData.validUsers.standard.password
    );
    await page.click(LOGIN_BUTTON);
    await expect(page).toHaveURL(INVENTORY_PAGE);
  });

  test("should not login with locked user", async ({ page }) => {
    await page.goto(LOGIN_PAGE);
    await page.fill(
      USERNAME_INPUT,
      testData.validUsers.locked.username
    );
    await page.fill(
      PASSWORD_INPUT,
      testData.validUsers.locked.password
    );
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE)).toContainText(
      "Epic sadface: Sorry, this user has been locked out."
    );
    await expect(page).not.toHaveURL(INVENTORY_PAGE);
  });

  test("should allow error message to be dismissed for locked out user", async ({
    page,
  }) => {
    await page.goto(LOGIN_PAGE);
    await page.fill(
      USERNAME_INPUT,
      testData.validUsers.locked.username
    );
    await page.fill(
      PASSWORD_INPUT,
      testData.validUsers.locked.password
    );
    await page.click(LOGIN_BUTTON);

    const error = page.locator(ERROR_MESSAGE);
    await expect(error).toBeVisible();

    await page.click(ERROR_BUTTON);

    await expect(error).not.toBeVisible();
  });

  for (const [key, user] of Object.entries(testData.invalidUsers)) {
    test(`should not login with invalid credentials: ${key}`, async ({
      page,
    }) => {
      await page.goto(LOGIN_PAGE);
      await page.fill(USERNAME_INPUT, user.username);
      await page.fill(PASSWORD_INPUT, user.password);
      await page.click(LOGIN_BUTTON);
      await expect(page).not.toHaveURL(INVENTORY_PAGE);
    });
  }

  for (const [key, user] of Object.entries(testData.invalidUsers)) {
    test(`should show error message and icons for invalid credentials: ${key}`, async ({
      page,
    }) => {
      await page.goto(LOGIN_PAGE);

      await page.fill(USERNAME_INPUT, user.username);
      await page.fill(PASSWORD_INPUT, user.password);
      await page.click(LOGIN_BUTTON);

      const errorMsg = page.locator(ERROR_MESSAGE);
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText(user.error);

      // Verify that red error icons appear next to username and password
      const errorIcons = page.locator(".error_icon");
      await expect(errorIcons).toHaveCount(2);
      await expect(errorIcons.nth(0)).toBeVisible();
      await expect(errorIcons.nth(1)).toBeVisible();

      // Verify error classes are applied to inputs
      await expect(page.locator("#user-name")).toHaveClass(/input_error/);
      await expect(page.locator("#password")).toHaveClass(/input_error/);

      // Click the dismiss icon to close the error
      await page.click(ERROR_BUTTON);
      await expect(errorMsg).not.toBeVisible();

      // Should be gone after dismissal
      await expect(errorIcons).toHaveCount(0);
    });
  }
});

test.describe("Edge Case Login Form Tests", () => {
  test('should handle credentials with leading/trailing whitespace', async ({ page }) => {
  await page.goto(LOGIN_PAGE);
  await page.fill(USERNAME_INPUT, ' standard_user ');
  await page.fill(PASSWORD_INPUT, ' secret_sauce ');
  await page.click(LOGIN_BUTTON);

  await expect(page).not.toHaveURL(INVENTORY_PAGE);
});

test('should fail login if username is in uppercase', async ({ page }) => {
  await page.goto(LOGIN_PAGE);
  await page.fill(USERNAME_INPUT, testData.validUsers.standard.username.toUpperCase());
  await page.fill(PASSWORD_INPUT, testData.validUsers.standard.password);
  await page.click(LOGIN_BUTTON);

  await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
  await expect(page).not.toHaveURL(INVENTORY_PAGE);
});

test('should show consistent errors after multiple failed logins', async ({ page }) => {
  await page.goto(LOGIN_PAGE);
  for (let i = 0; i < 10; i++) {
    await page.fill(USERNAME_INPUT, 'invalid_user');
    await page.fill(PASSWORD_INPUT, 'wrong_password');
    await page.click(LOGIN_BUTTON);

    const error = page.locator(ERROR_MESSAGE);
    await expect(error).toBeVisible();
    await expect(error).toContainText('Username and password do not match');
  }
});
  
  test("should handle overflow input gracefully", async ({ page }) => {
    const longText = "a".repeat(1000);

    await page.goto(LOGIN_PAGE);
    await page.fill(USERNAME_INPUT, longText);
    await page.fill(PASSWORD_INPUT, longText);
    await page.click(LOGIN_BUTTON);

    const error = page.locator(ERROR_MESSAGE);
    await expect(error).toBeVisible();
    await expect(error).toContainText("Username and password do not match");
  });

  test('should allow login via keyboard-only navigation', async ({ page }) => {
  await page.goto(LOGIN_PAGE);
  await page.keyboard.press('Tab');
  await page.keyboard.type(testData.validUsers.standard.username);
  await page.keyboard.press('Tab');
  await page.keyboard.type(testData.validUsers.standard.password);
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(INVENTORY_PAGE);
});

  test('should not be vulnerable to SQL injection', async ({ page }) => {
  await page.goto(LOGIN_PAGE);
  await page.fill(USERNAME_INPUT, "' OR '1'='1");
  await page.fill(PASSWORD_INPUT, 'password');
  await page.click(LOGIN_BUTTON);

  await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
  await expect(page).not.toHaveURL(INVENTORY_PAGE);
});
});
