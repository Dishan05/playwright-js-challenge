const SELECTORS = {
  usernameInput: '[data-test="username"]',
  passwordInput: '[data-test="password"]',
  loginButton: '[data-test="login-button"]'
};

async function login(page, username, password) {
  await page.fill(SELECTORS.usernameInput, username);
  await page.fill(SELECTORS.passwordInput, password);
  await page.click(SELECTORS.loginButton);
}

module.exports = { login };
