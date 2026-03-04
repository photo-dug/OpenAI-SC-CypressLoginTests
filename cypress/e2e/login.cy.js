const xssPayload = '<script>alert("xss")</script>';
const sqlInjectionPayload = "' OR '1'='1";

const validUser = {
  email: Cypress.env('validEmail') || 'replace-me@example.com',
  password: Cypress.env('validPassword') || 'replace-me-password',
  verificationCode: Cypress.env('verificationCode') || ''
};

const emailAliases = Array.from({ length: 5 }, (_, i) => `dougrosss+sc${16 + i}@mac.com`);

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

  it('rejects too-short and too-long password attempts', () => {
    const shortPassword = 'A1!';
    const longPassword = 'A'.repeat(512) + '1!';

    cy.submitLogin('valid@example.com', shortPassword);
    cy.assertLoginError({ expectApiFailure: true });

    cy.openLoginPage();
    cy.submitLogin('valid@example.com', longPassword);
    cy.assertLoginError({ expectApiFailure: true });
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

  it('logs in with valid credentials and completes optional email verification', () => {
    cy.submitLogin(validUser.email, validUser.password);
    cy.performEmailVerification(validUser.verificationCode);
    cy.assertLoginSuccess();
  });

  it('runs alias-based login coverage for mac.com verification accounts', () => {
    emailAliases.forEach((alias) => {
      cy.openLoginPage();
      cy.submitLogin(alias, validUser.password);
      cy.assertLoginError({ expectApiFailure: true });
    });
  });
});
