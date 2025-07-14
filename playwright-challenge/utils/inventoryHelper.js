const SELECTORS = {
  inventoryItems: ".inventory_item",
  itemName: ".inventory_item_name",
  itemPrice: ".inventory_item_price",
  sortDropdown: ".product_sort_container",
};

async function getInventoryItemNameAtIndex(page, index) {
  const item = page.locator(SELECTORS.inventoryItems).nth(index);
  const name = await item.locator(SELECTORS.itemName).textContent();
  return name.trim();
}

async function clickInventoryItem(item, itemNameSelector = SELECTORS.itemName) {
  const linkLocator = item.locator("a").first();
  const hasLink = await linkLocator.count() > 0;

  if (hasLink) {
    await linkLocator.click();
  } else {
    await item.locator(itemNameSelector).click();
  }
}

async function getItemNames(page) {
  const names = await page.locator(SELECTORS.itemName).allTextContents();
  return names.map((name) => name.trim());
}

async function getItemPrices(page) {
  const prices = await page.locator(SELECTORS.itemPrice).allTextContents();
  return prices.map((price) => parseFloat(price.replace("$", "")));
}

async function selectSortOption(page, optionValue) {
  await page.selectOption(SELECTORS.sortDropdown, optionValue);
}

module.exports = {
  getInventoryItemNameAtIndex,
  clickInventoryItem,
  getItemNames,
  getItemPrices,
  selectSortOption
};