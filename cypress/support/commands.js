const resolveSelector = (name) => {
  const selectors = Cypress.env('selectors') || {};
  const selector = selectors[name];

  if (!selector || typeof selector !== 'string') {
    throw new Error(
      `Missing selector mapping for "${name}". Update cypress.config.js -> env.selectors.${name}`
    );
  }

  return selector;
};

Cypress.Commands.add('openLoginPage', () => {
  cy.visit(Cypress.env('loginPath'));
});

Cypress.Commands.add('getBySelectorName', (name) => {
  return cy.get(resolveSelector(name));
});

Cypress.Commands.add('submitLogin', (email, password) => {
  cy.getBySelectorName('email').clear().type(email, { log: false });
  cy.getBySelectorName('password').clear().type(password, { log: false });
  cy.getBySelectorName('submit').click();
});

Cypress.Commands.add('assertLoginError', () => {
  cy.getBySelectorName('errorMessage').should('be.visible');
});

Cypress.Commands.add('assertLoginSuccess', () => {
  cy.getBySelectorName('successIndicator').should('be.visible');
});

Cypress.Commands.add('performEmailVerification', (verificationCode) => {
  if (!verificationCode) {
    cy.log('No verification code supplied; skipping code entry.');
    return;
  }

  const verificationInput = resolveSelector('verificationCodeInput');

  cy.get('body').then(($body) => {
    if ($body.find(verificationInput).length) {
      cy.get(verificationInput).clear().type(verificationCode, { log: false });
      cy.getBySelectorName('verificationSubmit').click();
    }
  });
});