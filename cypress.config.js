const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://devportal.soundcredit.com',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    env: {
      loginPath: '/login',
      loginUrl: 'https://devportal.soundcredit.com/login',
      signupPath: '/signup',
      signupUrl: 'https://devportal.soundcredit.com/sign-up',
      useUiLoginNav: false,
      homePath: '/',
      loginEntrySelector: '',
      loginEntryText: 'Sign In',
      basicAuthUser: 'soundways',
      basicAuthPass: 'soundcredit-test',
      loginErrorText: 'Invalid email address and/or password|Authentication failed|Email or password incorrect',
      authFailureRoute: '**/auth/**',
      assertAuthFailureApi: false,
      authFailureBodyRegex: 'Authentication failed|Email or password incorrect|Invalid email address and/or password',
      selectors: {
        email: 'input[type="email"], input[name="email"], input[placeholder*="mail"], input[id*="email"], .username-container input',
        password: 'input[type="password"], input[name="password"], input[placeholder*="password"], input[id*="password"]',
        submit: 'button[type="submit"], .login-btn-container button[type="button"], .login-btn-container button, [role="button"], input[type="submit"]',
        errorMessage: '[data-testid="login-error"], .error, .alert-danger, [role="alert"], .toast, .Toastify__toast, .Toastify__toast-body',
        successIndicator: '[data-testid="dashboard"], [data-testid="account-home"]',
        verificationCodeInput: 'input[name="verificationCode"], input[autocomplete="one-time-code"]',
        verificationSubmit: 'button[data-testid="verify-submit"], button[type="submit"]'
      }
    }
  }
});
