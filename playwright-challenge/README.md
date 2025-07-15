# Playwright JS Challenge

This project demonstrates API and UI test automation using [Playwright](https://playwright.dev/) and JavaScript. It is designed to showcase professional test coverage, clean structure, dynamic and static data handling, and practical techniques for test automation interviews or real-world projects.

## 🚀 Project Overview

The project includes:  
- ✅ UI tests for [SauceDemo](https://www.saucedemo.com/)  
- 🔁 API tests for [Restful Booker API](https://restful-booker.herokuapp.com/)  
- 🧪 Positive and negative test cases  
- 🗂️ Dynamic and static test data strategies  
- 🔐 Authenticated and unauthenticated scenarios  
- 🛠 Utility helpers for reusable API actions  

---

## 🛠 Setup Instructions

> 📦 Requires **Node.js v18+** and **npm** installed.

### 1. Clone the Repository

```bash
git clone https://github.com/Dishan05/playwright-js-challenge.git
cd playwright-js-challenge
```

### 2. Install Dependencies
- Navigate to Node.js and download the latest stable version runtime for your operating system. [Install Node.js](https://nodejs.org/en)

- Navigate to your playwright-challenge path, and run the command below to install the required packages.
```bash
npm install
```
- To confirm installation, run the following command in the same directory to confirm the versions that have been installed (You may need to run as administrator)
```bash
node -v
npm -v
```
- Install playwright browsers
```bash
npx playwright install
```
- (Optional) - Install VS Code if you don't already have your preferred IDE installed, and wish to debug/inspect the tests.
## ▶️ Running Tests
> Ensure that you are in the correct playwright-challenge path before executing the commands below.
Run all tests
```bash
npx playwright test
```
Run a specific test file
```bash
npx playwright test tests/api/booking-api.spec.js
```
Run tests with HTML report generation
```bash
npx playwright test --reporter=html
```
Open the HTML report
```bash
npx playwright show-report
```
## Project Structure
```graphql
playwright-js-challenge/
├── tests/
│   ├── api/                  # API test cases (Booking API)
│   └── ui/                   # UI test cases (e.g., SauceDemo)
│
├── utils/                    # Reusable helper functions for API setup, auth, etc.
│   └── apiHelper.js
│
├── data/                     # Static test data (JSON)
│   └── testData_api.json
│
├── .gitignore
├── package.json              # NPM config and test scripts
├── playwright.config.js      # Playwright test configuration
└── README.md                 # This file
```
##  🧪 Test Highlights
### ✅ API Tests
- Create, retrieve, update, delete bookings
- Test booking with all permutations of query parameters
- Validate negative scenarios with invalid data
- Authenticated and unauthenticated flows

### UI Tests
- Login flow with multiple user roles
- Inventory validations and bug detections
- Cart interaction and item verifications
- Checkout flow validation

### 📣 Notes
- The data/testData_api.json file stores all configurable test data for API tests.
- The data/testData.json file stores all configurable test data for UI tests.
- The utils/Helpers.js manages context creation, authentication, and reusable API calls, as well as provides utilities for the various UI pages/components.
- All API and UI tests use Playwright Test’s built-in assertions and context isolation.

### 📬 Contact
Created by **Dishan Samsunder** — feel free to connect or fork this repo if you'd like to build on it!