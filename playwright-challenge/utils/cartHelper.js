const { expect } = require('@playwright/test');

const SELECTORS = {
  cartBadge: '.shopping_cart_badge',
  cartLink: '.shopping_cart_link',
  removeButton: 'button:has-text("Remove")',
  inventoryPage: '/inventory.html',
};

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

module.exports = { clearCart };
