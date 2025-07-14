const { expect } = require("@playwright/test");

const SELECTORS = {
  cartBadge: ".shopping_cart_badge",
  cartLink: ".shopping_cart_link",
  removeButton: 'button:has-text("Remove")',
  inventoryPage: "/inventory.html",
  inventoryItems: ".inventory_item",
  addToCartBtn: 'button:has-text("Add to cart")',
  checkoutBtn: '[data-test="checkout"]',
};

const CART_PAGE = "/cart.html";
const CHECKOUT_STEP_ONE = "/checkout-step-one.html";

async function clearCart(page) {
  const cartBadge = page.locator(SELECTORS.cartBadge);
  if (await cartBadge.isVisible()) {
    await page.locator(SELECTORS.cartLink).click();

    const removeButtons = page.locator(SELECTORS.removeButton);
    const count = await removeButtons.count();
    for (let i = 0; i < count; i++) {
      await removeButtons.nth(i).click();
    }

    await page.goto(SELECTORS.inventoryPage);

    await expect(page.locator(SELECTORS.cartBadge)).not.toBeVisible();
  }
}

async function addFirstItemToCart(page) {
  // Ensure you're on the inventory page
  await expect(page).toHaveURL(SELECTORS.inventoryPage);

  // Add first item to cart
  const firstItem = page.locator(SELECTORS.inventoryItems).nth(0);
  await firstItem.locator(SELECTORS.addToCartBtn).click();
}

async function goToCart(page) {
  // Click on the cart link, and ensure that you're redrected to the cart page
  await page.click(SELECTORS.cartLink);
  await expect(page).toHaveURL(CART_PAGE);
}

async function proceedToCheckout(page) {
  // Click on the checkout button, and ensure that you're redirected to the checkout step one page
  await page.click(SELECTORS.checkoutBtn);
  await expect(page).toHaveURL(CHECKOUT_STEP_ONE);
}

module.exports = {
  clearCart,
  addFirstItemToCart,
  goToCart,
  proceedToCheckout
};