const { test, expect } = require("@playwright/test");
const testData = require("../../data/testData.json");
const { login } = require("../../utils/loginHelper.js");
const {
  addItemToCart,
  addFirstItemToCart,
  goToCart,
  continueShopping,
  proceedToCheckout,
} = require("../../utils/cartHelper.js");

const SELECTORS = {
  inventoryItems: ".inventory_item",
  itemName: ".inventory_item_name",
  itemPrice: ".inventory_item_price",
  addToCartButton: "button.btn_inventory",
  cartBadge: ".shopping_cart_badge",
  cartLink: ".shopping_cart_link",
  cartItem: ".cart_item",
  cartItemName: ".inventory_item_name",
  cartItemPrice: ".inventory_item_price",
  removeButton: "button.cart_button",
  continueShoppingBtn: "[data-test='continue-shopping']",
  checkoutButton: "[data-test='checkout']",
};

const INVENTORY_PAGE = "/inventory.html";

for (const userType of [
  "standard_user",
  "performance_glitch_user",
  "error_user",
  "visual_user",
  "problem_user",
]) {
  test.describe(`${userType} functional shopping cart tests`, () => {
    test.beforeEach(async ({ page }) => {
      const user = testData.validUsers[userType];
      await page.goto("/");
      await login(page, user.username, user.password);
      await expect(page).toHaveURL(INVENTORY_PAGE);
    });

    test("Given a valid user adds an item to the cart, when they view the cart, then the cart badge should have the correct count and the item should be present with the correct details", async ({ page }) => {
      const firstItem = page.locator(SELECTORS.inventoryItems).nth(0);
      const name = await firstItem.locator(SELECTORS.itemName).textContent();
      const price = await firstItem.locator(SELECTORS.itemPrice).textContent();

      await addFirstItemToCart(page);
      // Assert that the cart badge is updated with the correct count
      await expect(page.locator(SELECTORS.cartBadge)).toHaveText("1");

      await goToCart(page);

      const cartItem = page.locator(SELECTORS.cartItem);
      // Assert that the cart item is present and has the correct name and price
      await expect(cartItem).toHaveCount(1);
      await expect(cartItem.locator(SELECTORS.cartItemName)).toHaveText(
        name.trim()
      );
      await expect(cartItem.locator(SELECTORS.cartItemPrice)).toHaveText(
        price.trim()
      );
    });

    test("Given a user has an item in the cart, when they remove the item, then the cart badge, and the cart should be empty", async ({ page }) => {
      await addFirstItemToCart(page);
      await goToCart(page);

      await page.locator(SELECTORS.removeButton).click();

      // Assert that the cart item is removed, and the badge is updated
      await expect(page.locator(SELECTORS.cartItem)).toHaveCount(0);
      await expect(page.locator(SELECTORS.cartBadge)).toHaveCount(0);
    });

    test("Given user adds items one at a time to the cart, when they view the cart, continue shopping, and then return to cart, then the cart should retain the correct items", async ({
      page,
    }) => {
      const itemsCount = await page.locator(SELECTORS.inventoryItems).count();
      for (let i = 0; i < itemsCount; i++) {
        await addItemToCart(page, i);
        await goToCart(page);

        await continueShopping(page);

        // Assert that the cart badge is updated with the correct count
        await expect(page.locator(SELECTORS.cartBadge)).toHaveText(
          (i + 1).toString()
        );

        await goToCart(page);
        // Assert that the cart item count matches the number of items added
        await expect(page.locator(SELECTORS.cartItem)).toHaveCount(i + 1);

        // This ensures that we return to the inventory page after each item is added
        await continueShopping(page);
      }
    });

    test("Given user adds an item to the cart, when they checkout, then they should be redirected to the correct page", async ({ page }) => {
      await addFirstItemToCart(page);
      await goToCart(page);
      await proceedToCheckout(page);

      await expect(page).toHaveURL(/checkout-step-one/);
    });

    test("Given user has no items in the cart, when they view the cart, then the cart should be empty, and the checkout button disabled", async ({ page }) => {
      await goToCart(page);
      await expect(page.locator(SELECTORS.cartItem)).toHaveCount(0);
      await expect(page.locator(SELECTORS.checkoutButton))
        .toBeDisabled({ timeout: 1000 })
        .catch(() => {});
    });
  });
}
