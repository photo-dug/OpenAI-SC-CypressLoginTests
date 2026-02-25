Cypress.Commands.add('openLoginPage', () => {
  cy.visit(Cypress.env('loginPath'));
});

Cypress.Commands.add('getSelector', (name) => {
  const selectors = Cypress.env('selectors') || {};
  return selectors[name];
});

Cypress.Commands.add('submitLogin', (email, password) => {
  cy.get(cy.getSelector('email')).clear().type(email, { log: false });
  cy.get(cy.getSelector('password')).clear().type(password, { log: false });
  cy.get(cy.getSelector('submit')).click();
});

Cypress.Commands.add('assertLoginError', () => {
  cy.get(cy.getSelector('errorMessage')).should('be.visible');
});

Cypress.Commands.add('assertLoginSuccess', () => {
  cy.get(cy.getSelector('successIndicator')).should('be.visible');
});

Cypress.Commands.add('performEmailVerification', (verificationCode) => {
  if (!verificationCode) {
    cy.log('No verification code supplied; skipping code entry.');
    return;
  }

  cy.get('body').then(($body) => {
    const codeSelector = cy.getSelector('verificationCodeInput');
    if ($body.find(codeSelector).length) {
      cy.get(codeSelector).clear().type(verificationCode, { log: false });
      cy.get(cy.getSelector('verificationSubmit')).click();
    }
  });
});