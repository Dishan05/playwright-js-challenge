const { test, expect } = require("@playwright/test");
const testData = require("../../data/testData.json");

const LOGIN_BUTTON = '[data-test="login-button"]';

test.describe("SauceDemo Functional Login Tests", () => {
  test("should login with standard user", async ({ page }) => {
    await page.goto("/");
    await page.fill(
      '[data-test="username"]',
      testData.validUsers.standard.username
    );
    await page.fill(
      '[data-test="password"]',
      testData.validUsers.standard.password
    );
    await page.click(LOGIN_BUTTON);
    await expect(page).toHaveURL(/inventory/);
  });

  test("should not login with locked user", async ({ page }) => {
    await page.goto("/");
    await page.fill(
      '[data-test="username"]',
      testData.validUsers.locked.username
    );
    await page.fill(
      '[data-test="password"]',
      testData.validUsers.locked.password
    );
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(".error-message-container")).toContainText(
      "Epic sadface: Sorry, this user has been locked out."
    );
    await expect(page).not.toHaveURL(/inventory/);
  });

  test("should allow error message to be dismissed for locked out user", async ({
    page,
  }) => {
    await page.goto("/");
    await page.fill(
      '[data-test="username"]',
      testData.validUsers.locked.username
    );
    await page.fill(
      '[data-test="password"]',
      testData.validUsers.locked.password
    );
    await page.click(LOGIN_BUTTON);

    const error = page.locator('[data-test="error"]');
    await expect(error).toBeVisible();

    await page.click(".error-button");

    await expect(error).not.toBeVisible();
  });

  for (const [key, user] of Object.entries(testData.invalidUsers)) {
    test(`should not login with invalid credentials: ${key}`, async ({
      page,
    }) => {
      await page.goto("/");
      await page.fill('[data-test="username"]', user.username);
      await page.fill('[data-test="password"]', user.password);
      await page.click(LOGIN_BUTTON);
      await expect(page).not.toHaveURL(/inventory/);
    });
  }

  for (const [key, user] of Object.entries(testData.invalidUsers)) {
    test(`should show error message and icons for invalid credentials: ${key}`, async ({
      page,
    }) => {
      await page.goto("/");

      await page.fill('[data-test="username"]', user.username);
      await page.fill('[data-test="password"]', user.password);
      await page.click(LOGIN_BUTTON);

      const errorMsg = page.locator('[data-test="error"]');
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
      await page.click(".error-button");
      await expect(errorMsg).not.toBeVisible();

      // Should be gone after dismissal
      await expect(errorIcons).toHaveCount(0);
    });
  }
});
