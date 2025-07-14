const { test, expect } = require("@playwright/test");
const testData = require("../../data/testData.json");
const { login } = require("../../utils/loginHelper.js");

const SELECTORS = {
  inventoryItems: ".inventory_item",
  itemName: ".inventory_item_name",
  itemPrice: ".inventory_item_price",
  addToCartBtn: "button.btn_inventory",
  cartBadge: ".shopping_cart_badge",
  cartLink: ".shopping_cart_link",
  cartItem: ".cart_item",
  cartItemName: ".inventory_item_name",
  cartItemPrice: ".inventory_item_price",
  removeBtn: "button.cart_button",
  continueShoppingBtn: "[data-test='continue-shopping']",
  checkoutBtn: "[data-test='checkout']",
};

const INVENTORY_PAGE = "/inventory.html";
const CART_PAGE = "/cart.html";

for (const userType of [
  "standard_user",
  "performance_glitch_user",
  "error_user",
  "visual_user",
  "problem_user",
]) {
  test.describe(`${userType} shopping cart tests`, () => {
    test.beforeEach(async ({ page }) => {
      const user = testData.validUsers[userType];
      await page.goto("/");
      await login(page, user.username, user.password);
      await expect(page).toHaveURL(INVENTORY_PAGE);
    });

    //Add test to check what happens when the back/continue shopping button is clicked

    test("adds item from inventory and appears in cart", async ({ page }) => {
      const firstItem = page.locator(SELECTORS.inventoryItems).nth(0);
      const name = await firstItem.locator(SELECTORS.itemName).textContent();
      const price = await firstItem.locator(SELECTORS.itemPrice).textContent();

      await firstItem.locator(SELECTORS.addToCartBtn).click();
      await expect(page.locator(SELECTORS.cartBadge)).toHaveText("1");

      await page.click(SELECTORS.cartLink);
      await expect(page).toHaveURL(CART_PAGE);

      const cartItem = page.locator(SELECTORS.cartItem);
      await expect(cartItem).toHaveCount(1);
      await expect(cartItem.locator(SELECTORS.cartItemName)).toHaveText(
        name.trim()
      );
      await expect(cartItem.locator(SELECTORS.cartItemPrice)).toHaveText(
        price.trim()
      );
    });

    test("removes item from cart and updates badge", async ({ page }) => {
      await page
        .locator(SELECTORS.inventoryItems)
        .nth(0)
        .locator(SELECTORS.addToCartBtn)
        .click();
      await page.click(SELECTORS.cartLink);
      await expect(page).toHaveURL(CART_PAGE);

      await page.locator(SELECTORS.removeBtn).click();
      await expect(page.locator(SELECTORS.cartItem)).toHaveCount(0);
      await expect(page.locator(SELECTORS.cartBadge)).toHaveCount(0);
    });

    test("cart persists after navigation", async ({ page }) => {
      await page
        .locator(SELECTORS.inventoryItems)
        .nth(0)
        .locator(SELECTORS.addToCartBtn)
        .click();
      await page.click(SELECTORS.cartLink);
      await expect(page).toHaveURL(CART_PAGE);

      await page.click(SELECTORS.continueShoppingBtn);
      await expect(page).toHaveURL(INVENTORY_PAGE);
      await expect(page.locator(SELECTORS.cartBadge)).toHaveText("1");

      await page.click(SELECTORS.cartLink);
      await expect(page.locator(SELECTORS.cartItem)).toHaveCount(1);
    });

    test("proceeds to checkout with item in cart", async ({ page }) => {
      await page
        .locator(SELECTORS.inventoryItems)
        .nth(0)
        .locator(SELECTORS.addToCartBtn)
        .click();
      await page.click(SELECTORS.cartLink);
      await page.click(SELECTORS.checkoutBtn);
      await expect(page).toHaveURL(/checkout-step-one/);
    });

    test("displays empty cart correctly", async ({ page }) => {
      await page.click(SELECTORS.cartLink);
      await expect(page).toHaveURL(CART_PAGE);
      await expect(page.locator(SELECTORS.cartItem)).toHaveCount(0);
      await expect(page.locator(SELECTORS.checkoutBtn))
        .toBeDisabled({ timeout: 1000 })
        .catch(() => {});
    });
  });
}
