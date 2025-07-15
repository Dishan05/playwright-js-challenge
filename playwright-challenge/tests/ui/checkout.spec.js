const { test, expect } = require("@playwright/test");
const path = require('path');
const testData = require(path.resolve(__dirname, '../../data/testData.json'));
const { login } = require("../../utils/loginHelper.js");
const {
  addFirstItemToCart,
  goToCart,
  proceedToCheckout,
  clearCart,
} = require("../../utils/cartHelper.js");
const {
  populateCheckoutInformationAndContinue,
} = require("../../utils/checkoutHelper.js");

// TODO: Move these out to a page object model
const SELECTORS = {
  inventoryItems: ".inventory_item",
  addToCartButton: "button.btn_inventory",
  cartLink: ".shopping_cart_link",
  checkoutButton: "[data-test='checkout']",
  continueButton: "[data-test='continue']",
  finishButton: "[data-test='finish']",
  firstNameInput: "[data-test='firstName']",
  lastNameInput: "[data-test='lastName']",
  postalCodeInput: "[data-test='postalCode']",
  summaryItem: ".cart_item",
  orderCompleteHeader: ".complete-header",
  errorMessage: "h3[data-test='error']",
  cancelButton: "[data-test='cancel']",
  backHomeButton: "[data-test='back-to-products']",
};

const LOGIN_PAGE = "/";
const INVENTORY_PAGE = "/inventory.html";
const CART_PAGE = "/cart.html";
const CHECKOUT_STEP_ONE = "/checkout-step-one.html";
const CHECKOUT_STEP_TWO = "/checkout-step-two.html";
const CHECKOUT_COMPLETE = "/checkout-complete.html";

const ORDER_COMPLETE_TEXT = "Thank you for your order!";

const validCheckoutInformationUsers = Object.entries(
  testData.checkoutInformation
).filter(([_, value]) => value.shouldSucceed);
const invalidCheckoutInformationUsers = Object.entries(
  testData.checkoutInformation
).filter(([_, value]) => value.expectedError);

for (const userType of [
  "standard_user",
  "performance_glitch_user",
  "error_user",
  "visual_user",
  "problem_user",
]) {
  test.describe(`${userType}: functional checkout tests`, () => {
    test.beforeEach(async ({ page }) => {
      const user = testData.validUsers[userType];
      await page.goto(LOGIN_PAGE);
      await login(page, user.username, user.password);
      await expect(page).toHaveURL(INVENTORY_PAGE);

      await clearCart(page);
      await addFirstItemToCart(page);
      await goToCart(page);
      await proceedToCheckout(page);
    });

    for (const [key, data] of validCheckoutInformationUsers) {
      test(`Given valid checkout information, when checking out, the process completes successfully (${data.firstName} ${data.lastName}, key: ${key})`, async ({
        page,
      }) => {
        await populateCheckoutInformationAndContinue(
          page,
          data.firstName,
          data.lastName,
          data.zip
        );

        await expect(page).toHaveURL(CHECKOUT_STEP_TWO);
        await expect(page.locator(SELECTORS.summaryItem)).toHaveCount(1);

        await page.click(SELECTORS.finishButton);
        await expect(page).toHaveURL(CHECKOUT_COMPLETE);
        await expect(page.locator(SELECTORS.orderCompleteHeader)).toContainText(
          ORDER_COMPLETE_TEXT
        );

        await page.click(SELECTORS.backHomeButton);
        await expect(page).toHaveURL(INVENTORY_PAGE);
      });
    }
    for (const [key, data] of invalidCheckoutInformationUsers) {
      test(`Given invalid checkout information, when checking out, the correct error message is displayed (${data.firstName} ${data.lastName}, key: ${key})`, async ({
        page,
      }) => {
        await populateCheckoutInformationAndContinue(
          page,
          data.firstName,
          data.lastName,
          data.zip
        );
        await expect(page.locator(SELECTORS.errorMessage)).toContainText(
          data.expectedError
        );
      });
    }

    test("Given valid checkout information, when navigating back to cart from step one, then the user is directed to the cart", async ({
      page,
    }) => {
      await page.click(SELECTORS.cancelButton);
      await expect(page).toHaveURL(CART_PAGE);
    });

    test("Given valid checkout information, when navigating back to cart from step two, then the user is directed to the cart", async ({
      page,
    }) => {
      await populateCheckoutInformationAndContinue(
        page,
        testData.checkoutInformation.valid.firstName,
        testData.checkoutInformation.valid.password,
        testData.checkoutInformation.valid.zip
      );
      await page.click(SELECTORS.cancelButton);
      await expect(page).toHaveURL(CART_PAGE);
    });

    test("Given valid checkout information, when navigating back to step one from step two, then the information populated in page one persists", async ({
      page,
    }) => {
      await populateCheckoutInformationAndContinue(
        page,
        testData.checkoutInformation.valid.firstName,
        testData.checkoutInformation.valid.password,
        testData.checkoutInformation.valid.zip
      );
      await expect(page).toHaveURL(CHECKOUT_STEP_TWO);

      await page.goBack();
      await expect(page).toHaveURL(CHECKOUT_STEP_ONE);
      await expect(page.locator(SELECTORS.firstNameInput)).toHaveValue(
        testData.checkoutInformation.valid.firstName
      );
    });
  });
}
