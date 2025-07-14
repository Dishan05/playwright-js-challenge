const { test, expect } = require("@playwright/test");
const testData = require("../../data/testData.json");
const { login } = require("../../utils/loginHelper.js");
const { clearCart } = require("../../utils/cartHelper.js");

const loginPage = "/";

const SELECTORS = {
  inventoryItems: ".inventory_item",
  itemImage: ".inventory_item_img img",
  itemName: ".inventory_item_name",
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
      await page.goto(loginPage);
      await login(page, user.username, user.password);
      await clearCart(page);
    });

    test(`(${userType}) loads all 6 inventory items with visible core elements`, async ({
      page,
    }) => {
      const items = page.locator(SELECTORS.inventoryItems);
      await expect(items).toHaveCount(6);

      for (let i = 0; i < (await items.count()); i++) {
        const item = items.nth(i);
        const image = item.locator(SELECTORS.itemImage);

        await expect(image).toBeVisible();

        const src = await image.getAttribute("src");
        expect(src).not.toContain("sl-404");

        await expect(item.locator(SELECTORS.itemName)).toBeVisible();
        await expect(item.locator(SELECTORS.itemPrice)).toBeVisible();
        await expect(item.locator(SELECTORS.addToCartBtn)).toBeVisible();
      }
    });

    test(`(${userType}) add all items to cart and verify badge updates, then remove all`, async ({
      page,
    }) => {
      const addButtons = page.locator(SELECTORS.addToCartBtn);
      for (let i = 0; i < 6; i++) {
        await addButtons.nth(i).click();
      }
      const badge = page.locator(SELECTORS.cartBadge);
      await expect(badge).toHaveText("6");

      for (let i = 0; i < 6; i++) {
        await addButtons.nth(i).click();
      }
      await expect(badge).toBeHidden();
    });

    test("each product navigates to detail page with matching name", async ({
      page,
    }) => {
      const items = page.locator(SELECTORS.inventoryItems);
      const count = await items.count();

      for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        const nameLocator = item.locator(SELECTORS.itemName);
        const name = (await nameLocator.textContent()).trim();

        const linkLocator = await item.locator("a").first();
        if ((await linkLocator.count()) > 0) {
          await linkLocator.click();
        } else {
          await nameLocator.click();
        }
        await expect(page).toHaveURL(/\/inventory-item\.html\?id=\d+/);

        const detailName = (
          await page.locator(".inventory_details_name").textContent()
        ).trim();
        expect(detailName).toBe(name);

        await page.goBack();
        await expect(page.locator(SELECTORS.inventoryItems)).toHaveCount(count);
      }
    });

    test("sort dropdown functions correctly", async ({ page }) => {
      const getItemNames = async () =>
        (await page.locator(SELECTORS.itemName).allTextContents()).map((name) =>
          name.trim()
        );

      const getItemPrices = async () =>
        (await page.locator(SELECTORS.itemPrice).allTextContents()).map(
          (price) => parseFloat(price.replace("$", ""))
        );

      await page.selectOption(SELECTORS.sortDropdown, "az");
      let names = await getItemNames();
      expect(names).toEqual([...names].sort());

      await page.selectOption(SELECTORS.sortDropdown, "za");
      names = await getItemNames();
      expect(names).toEqual([...names].sort().reverse());

      await page.selectOption(SELECTORS.sortDropdown, "lohi");
      let prices = await getItemPrices();
      expect(prices).toEqual([...prices].sort((a, b) => a - b));

      await page.selectOption(SELECTORS.sortDropdown, "hilo");
      prices = await getItemPrices();
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    test("cart badge persists after navigation and refresh", async ({
      page,
    }) => {
      //Add an item to the cart
      await page.locator(SELECTORS.addToCartBtn).first().click();
      await expect(page.locator(SELECTORS.cartBadge)).toHaveText("1");

      await page.locator(SELECTORS.cartLink).click();
      await expect(page).toHaveURL(/cart/);

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
