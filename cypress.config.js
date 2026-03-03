const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://example.com',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    env: {
      loginPath: '/login',
      selectors: {
        email: 'input[type="email"]',
        password: 'input[type="password"]',
        submit: 'button[type="submit"], .login-btn-container button[type="button"], .login-btn-container button',
        errorMessage: '[data-testid="login-error"], .error, .alert-danger',
        successIndicator: '[data-testid="dashboard"], [data-testid="account-home"]',
        verificationCodeInput: 'input[name="verificationCode"], input[autocomplete="one-time-code"]',
        verificationSubmit: 'button[data-testid="verify-submit"], button[type="submit"]'
      }
    }
  }
});
