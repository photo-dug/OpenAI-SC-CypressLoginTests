const xssPayload = '<script>alert("xss")</script>';
const sqlInjectionPayload = "' OR '1'='1";

const knownGoodUser = {
  email: Cypress.env('validEmail') || 'dougross@me.com',
  password: Cypress.env('validPassword') || 'Gn^8hbr3w',
  verificationCode: Cypress.env('verificationCode') || ''
};

describe('Login page security and robustness suite', () => {
  beforeEach(() => {
    cy.setupAuthFailureIntercept();
    cy.openLoginPage();
  });

  it('rejects empty email and empty password', () => {
    cy.clickSubmit();
    cy.assertLoginError();
  });

  it('rejects malformed emails', () => {
    const invalidEmails = ['plainaddress', '@domain.com', 'user@', 'user@domain', 'user@@domain.com'];

    invalidEmails.forEach((email) => {
      cy.openLoginPage();
      cy.submitLogin(email, 'SomePassword123!');
      cy.assertLoginError({ expectApiFailure: true });
    });
  });

  it('blocks common injection payloads in credentials', () => {
    cy.submitLogin(xssPayload, xssPayload);
    cy.assertLoginError({ expectApiFailure: true });

    cy.openLoginPage();
    cy.submitLogin(sqlInjectionPayload, sqlInjectionPayload);
    cy.assertLoginError({ expectApiFailure: true });
  });

  it('handles large password values without crashing the UI', () => {
    const hugePassword = `Aa1!${'X'.repeat(2000)}`;
    cy.submitLogin('load-test@example.com', hugePassword);
    cy.assertLoginError({ expectApiFailure: true });
    cy.getBySelectorName('submit').filter(':visible').first().should('not.be.disabled');
  });

  it('logs in with known-good credentials', () => {
    cy.submitLogin(knownGoodUser.email, knownGoodUser.password);
    cy.performEmailVerification(knownGoodUser.verificationCode);
    cy.assertLoginSuccess();
  });

  it('Logout and verify redirected to login', () => {
    cy.submitLogin(knownGoodUser.email, knownGoodUser.password);
    cy.performEmailVerification(knownGoodUser.verificationCode);
    cy.assertLoginSuccess();

    cy.get('a[href="/login"], .logout-nav a[href="/login"]', { timeout: 10000 })
      .filter(':visible')
      .first()
      .then(($a) => {
        if ($a.length) {
          cy.wrap($a).scrollIntoView().click({ force: true });
        } else {
          cy.clearCookies();
          cy.openLoginPage();
        }
      });

    cy.url({ timeout: 60000 }).should('match', /\/login(?:[/?#]|$)/);
    cy.get('input[type="email"], input[name="email"], input[placeholder*="mail"]', { timeout: 10000 }).should('exist');
    cy.get('input[type="password"], input[name="password"]', { timeout: 10000 }).should('exist');
  });
});
