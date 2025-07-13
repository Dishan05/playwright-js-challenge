const usernameInput = '[data-test="username"]';
const passwordInput = '[data-test="password"]';
const loginButton = '[data-test="login-button"]';

async function login(page, username, password) {
  await page.fill(usernameInput, username);
  await page.fill(passwordInput, password);
  await page.click(loginButton);
}

module.exports = { login };