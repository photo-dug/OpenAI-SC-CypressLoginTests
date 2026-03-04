const DEFAULT_EMAIL_INPUTS = [
  'input[type="email"]',
  'input[name="email"]',
  'input[placeholder*="mail"]',
  'input[id*="email"]',
  '.username-container input'
].join(', ');

const DEFAULT_PASSWORD_INPUTS = [
  'input[type="password"]',
  'input[name="password"]',
  'input[placeholder*="password"]',
  'input[id*="password"]'
].join(', ');

const DEFAULT_SUBMIT_INPUTS = [
  'button[type="submit"]',
  '.login-btn-container button[type="button"]',
  '.login-btn-container button',
  '[role="button"]',
  'input[type="submit"]'
].join(', ');

const DEFAULT_VERIFY_SUBMIT_INPUTS = [
  'button[data-testid="verify-submit"]',
  'button[type="submit"]',
  '[role="button"]'
].join(', ');

const selectorFromConfig = (name, fallbackSelector) => {
  const selectors = Cypress.env('selectors') || {};
  const selector = selectors[name];
  return typeof selector === 'string' && selector.trim() ? selector : fallbackSelector;
};

Cypress.Commands.add('openLoginPage', () => {
  const loginUrl = Cypress.env('loginUrl');
  const loginPath = Cypress.env('loginPath') || '/login';
  const emailSelector = selectorFromConfig('email', DEFAULT_EMAIL_INPUTS);

  cy.visit(loginUrl || loginPath, { failOnStatusCode: false });

  cy.get('body', { timeout: 30000 }).then(($body) => {
    if (!$body.find(emailSelector).length) {
      cy.reload();
    }
  });
});

Cypress.Commands.add('getBySelectorName', (name) => {
  const fallbackMap = {
    email: DEFAULT_EMAIL_INPUTS,
    password: DEFAULT_PASSWORD_INPUTS,
    submit: DEFAULT_SUBMIT_INPUTS,
    verificationSubmit: DEFAULT_VERIFY_SUBMIT_INPUTS
  };

  return cy.get(selectorFromConfig(name, fallbackMap[name]), { timeout: 60000 });
});

Cypress.Commands.add('clickSubmit', () => {
  const submitSelector = selectorFromConfig('submit', DEFAULT_SUBMIT_INPUTS);

  cy.get('body').then(($body) => {
    const visibleMatches = $body.find(submitSelector).filter(':visible');

    if (visibleMatches.length) {
      cy.wrap(visibleMatches[0]).scrollIntoView().click({ force: true });
      return;
    }

    cy.contains('button, [role="button"], input[type="submit"]', /sign\s*in|log\s*in|continue/i, {
      timeout: 60000
    })
      .filter(':visible')
      .first()
      .scrollIntoView()
      .click({ force: true });
  });
});

Cypress.Commands.add('setupAuthFailureIntercept', () => {
  if (!Cypress.env('assertAuthFailureApi')) {
    return;
  }

  const route = Cypress.env('authFailureRoute') || '**/auth/**';
  cy.intercept('POST', route).as('authFailure');
});

Cypress.Commands.add('assertAuthFailureResponse', () => {
  if (!Cypress.env('assertAuthFailureApi')) {
    return;
  }

  const bodyRegex = new RegExp(
    Cypress.env('authFailureBodyRegex') ||
    'Authentication failed|Email or password incorrect|Invalid email address and/or password',
    'i'
  );

  cy.wait('@authFailure', { timeout: 20000 }).then((interception) => {
    const status = interception?.response?.statusCode;
    expect(status, 'auth failure status code').to.be.oneOf([400, 401, 403]);

    const responseBody = JSON.stringify(interception?.response?.body || '');
    expect(responseBody, 'auth failure body text').to.match(bodyRegex);
  });
});

Cypress.Commands.add('submitLogin', (email, password) => {
  cy.getBySelectorName('email').filter(':visible').first().clear().type(email, { delay: 40, log: false });
  cy.getBySelectorName('password').filter(':visible').first().clear().type(password, { log: false });
  cy.clickSubmit();
});

Cypress.Commands.add('assertLoginError', (options = {}) => {
  const { expectApiFailure = false } = options;

  if (expectApiFailure) {
    cy.assertAuthFailureResponse();
  }

  const selector = selectorFromConfig(
    'errorMessage',
    '[data-testid="login-error"], .error, .alert-danger, [role="alert"], .toast, .Toastify__toast, .Toastify__toast-body'
  );
  const configuredText = Cypress.env('loginErrorText') ||
    'Invalid email address and/or password|Authentication failed|Email or password incorrect';
  const textMatcher = new RegExp(configuredText, 'i');

  cy.get('body', { timeout: 15000 }).then(($body) => {
    const hasVisibleErrorNode = $body.find(selector).filter(':visible').length > 0;

    if (hasVisibleErrorNode) {
      cy.get(selector).filter(':visible').first().should('be.visible');
      return;
    }

    cy.contains(textMatcher, { timeout: 15000 }).should('be.visible');
  });
});

Cypress.Commands.add('assertLoginSuccess', () => {
  const selector = selectorFromConfig('successIndicator', '[data-testid="dashboard"], [data-testid="account-home"]');
  cy.get(selector).should('be.visible');
});

Cypress.Commands.add('performEmailVerification', (verificationCode) => {
  if (!verificationCode) {
    cy.log('No verification code supplied; skipping code entry.');
    return;
  }

  const verificationInput = selectorFromConfig(
    'verificationCodeInput',
    'input[name="verificationCode"], input[autocomplete="one-time-code"]'
  );

  cy.get('body').then(($body) => {
    if ($body.find(verificationInput).length) {
      cy.get(verificationInput).filter(':visible').first().clear().type(verificationCode, { log: false });
      cy.getBySelectorName('verificationSubmit').filter(':visible').first().click({ force: true });
    }
  });
});
