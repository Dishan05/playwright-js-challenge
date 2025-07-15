const { test, expect } = require("@playwright/test");
const path = require('path');
const testData = require(path.resolve(__dirname, '../../data/testdata.json'));
const { login } = require("../../utils/loginHelper.js");
const {
  clearCart,
  addAllItemsToCart,
  removeAllItemsFromCart,
  addFirstItemToCart,
  goToCart,
} = require("../../utils/cartHelper.js");
const {
  getInventoryItemNameAtIndex,
  clickInventoryItem,
  selectSortOption,
  getItemNames,
  getItemPrices,
} = require("../../utils/inventoryHelper.js");

const LOGIN_PAGE = "/";

const IMAGE_ATTRIBUTE = "src";

// TODO: Move these out to a page object model
const SELECTORS = {
  inventoryItems: ".inventory_item",
  itemImage: ".inventory_item_img img",
  itemName: ".inventory_item_name",
  inventoryDetailsName: ".inventory_details_name",
  itemPrice: ".inventory_item_price",
  addToCartBtn: "button.btn_inventory",
  cartBadge: ".shopping_cart_badge",
  sortDropdown: ".product_sort_container",
  cartLink: ".shopping_cart_link",
  backButton: "button.back_button",
};

for (const userType of [
  "standard_user",
  "performance_glitch_user",
  "error_user",
  "visual_user",
  "problem_user",
]) {
  test.describe(`${userType} inventory tests`, () => {
    test.beforeEach(async ({ page }) => {
      const user = testData.validUsers[userType];
      await page.goto(LOGIN_PAGE);
      await login(page, user.username, user.password);
      await clearCart(page);
    });

    test(`(Given ${userType} logs in, when they navigate to the inventory page, they should see all 6 items)`, async ({
      page,
    }) => {
      const items = page.locator(SELECTORS.inventoryItems);

      // Assert that there are 6 items on the inventory page
      await expect(items).toHaveCount(
        testData.inventoryItems.expectedNumberofInventoryItems
      );

      for (let i = 0; i < (await items.count()); i++) {
        const item = items.nth(i);
        const image = item.locator(SELECTORS.itemImage);

        await expect(image).toBeVisible();

        const src = await image.getAttribute(IMAGE_ATTRIBUTE);
        const matchFound = testData.inventoryItems.expectedImageSrcs.some(
          (expected) => src.toLowerCase().includes(expected.toLowerCase())
        );

        // Assert that the image source matches one of the expected sources
        expect(matchFound).toBeTruthy();

        await expect(item.locator(SELECTORS.itemName)).toBeVisible();
        await expect(item.locator(SELECTORS.itemPrice)).toBeVisible();
        await expect(item.locator(SELECTORS.addToCartBtn)).toBeVisible();
      }
    });

    test(`(Given ${userType} logs in, when they add all items to cart, and then remove all items, they should see the cart badge update correctly)`, async ({
      page,
    }) => {
      const badge = page.locator(SELECTORS.cartBadge);

      await addAllItemsToCart(page);
      await expect(badge).toHaveText(
        testData.inventoryItems.expectedNumberofInventoryItems.toString()
      );

      await removeAllItemsFromCart(page);
      await expect(badge).toBeHidden();
    });

    test(`(Given ${userType} logs in, when they click on each product, then they should be navigated to the detail page with the correct item information)`, async ({
      page,
    }) => {
      const items = page.locator(SELECTORS.inventoryItems);
      const count = await items.count();

      for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        const expectedName = await getInventoryItemNameAtIndex(page, i);

        await clickInventoryItem(item);
        await expect(page).toHaveURL(/\/inventory-item\.html\?id=\d+/);

        const detailName = (
          await page.locator(SELECTORS.inventoryDetailsName).textContent()
        ).trim();
        expect(detailName).toBe(expectedName);

        await page.goBack();
        await expect(page.locator(SELECTORS.inventoryItems)).toHaveCount(count);
      }
    });

    test(`(Given ${userType} logs in, when they sort the items by a specific filter, then the items should be sorted correctly)`, async ({ page }) => {
      await selectSortOption(
        page,
        testData.inventoryItems.sortOptions.alphabetical
      );
      let names = await getItemNames(page);
      expect(names).toEqual([...names].sort());

      await selectSortOption(
        page,
        testData.inventoryItems.sortOptions.reverseAlphabetical
      );
      names = await getItemNames(page);
      expect(names).toEqual([...names].sort().reverse());

      await selectSortOption(
        page,
        testData.inventoryItems.sortOptions.priceLowToHigh
      );
      let prices = await getItemPrices(page);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));

      await selectSortOption(
        page,
        testData.inventoryItems.sortOptions.priceHighToLow
      );
      prices = await getItemPrices(page);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    test(`(Given ${userType} adds an item to the cart, when they go back, or refresh, then the cart badge should remain accurate)`, async ({
      page,
    }) => {
      await addFirstItemToCart(page);
      await expect(page.locator(SELECTORS.cartBadge)).toHaveText("1");

      await goToCart(page);

      await page.goBack();
      await expect(page.locator(SELECTORS.cartBadge)).toHaveText("1");

      await page.reload();
      await expect(page.locator(SELECTORS.cartBadge)).toHaveText("1");
    });

    test(`${userType}: inventory load time validation`, async ({ page }) => {
      const start = Date.now();
      await page.goto(INVENTORY_PAGE);
      await page
        .locator(SELECTORS.inventoryItems)
        .first()
        .waitFor({ timeout: 10000 });
      const duration = Date.now() - start;

      expect(duration).toBeLessThanOrEqual(3000);
    });

    test("visual regression: take screenshot of inventory page", async ({
      page,
    }) => {
      await page.screenshot({
        path: `screenshots/${userType}-inventory.png`,
        fullPage: true,
      });
    });
  });
}
