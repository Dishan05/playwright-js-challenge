const SELECTORS = {
    firstNameInput: "[data-test='firstName']",
  lastNameInput: "[data-test='lastName']",
  postalCodeInput: "[data-test='postalCode']",
  continueBtn: "[data-test='continue']",
};

async function populateCheckoutInformationAndContinue(page, firstName, lastName, postalCode) {
  // Fill in the checkout form fields
  await page.fill(SELECTORS.firstNameInput, firstName);
  await page.fill(SELECTORS.lastNameInput, lastName);
  await page.fill(SELECTORS.postalCodeInput, postalCode);

  // Click the continue button
  await page.click(SELECTORS.continueBtn);
}

module.exports = { populateCheckoutInformationAndContinue };
