const existingAccount = {
  email: 'dougross@me.com',
  password: 'Gn^8hbr3w'
};

const newAccountPassword = 'test1234';
const signupAliases = Array.from({ length: 5 }, (_, i) => `dougross+sc${15 + i}@me.com`);

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const goToSignup = () => {
  cy.openSignupPage();
  cy.url({ timeout: 20000 }).should('include', 'signup');
};

const fillPrimaryEmail = (email) => {
  cy.get('input[type="email"], input[name*="email"], input[placeholder*="mail"]', { timeout: 20000 })
    .filter(':visible')
    .first()
    .clear()
    .type(email, { log: false });
};

const fillPrimaryPassword = (password) => {
  cy.get('input[type="password"], input[name*="password"]', { timeout: 20000 })
    .filter(':visible')
    .first()
    .clear()
    .type(password, { log: false });
};

const enterIdentityStepNegativeCases = () => {
  cy.contains(/enter your legal name/i).should('be.visible');

  const legalInput = 'input[placeholder*="John Doe"], input[name*="legal"], input[aria-label*="legal"]';
  const creditedInput = 'input[placeholder*="Credited Name"], input[name*="credited"], input[aria-label*="credited"]';

  cy.get(legalInput).filter(':visible').first().clear();
  cy.get(creditedInput).filter(':visible').first().clear();
  cy.clickNext();

  cy.get(legalInput).filter(':visible').first().clear().type('@@@###$$$');
  cy.get(creditedInput).filter(':visible').first().clear().type('   ');
  cy.clickNext();

  const longText = 'A'.repeat(300);
  cy.get(legalInput).filter(':visible').first().clear().type(longText);
  cy.get(creditedInput).filter(':visible').first().clear().type(longText);
  cy.clickNext();

  cy.get(legalInput).filter(':visible').first().clear().type('John Automation tester');
  cy.get(creditedInput).filter(':visible').first().clear().type('Dougie Fresh');
  cy.clickNext();
};

const enterAgeStepNegativeThenPositive = () => {
  cy.contains(/nice to meet you!/i).should('be.visible');

  const dateInput = 'input[placeholder*="mm"], input[name*="birth"], input[aria-label*="birth"], input[type="text"]';

  ['13-40-2020', 'abcd', '01/01/2015', '01/01/1890'].forEach((value) => {
    cy.get(dateInput).filter(':visible').first().clear().type(value);
    cy.clickNext();
  });

  cy.get(dateInput).filter(':visible').first().clear().type('01/01/2000');

  cy.get('select').filter(':visible').first().then(($select) => {
    const options = [...$select.find('option')]
      .map((opt) => (opt.textContent || '').trim())
      .filter((text) => text && !/country|select/i.test(text));

    const chosenCountry = randomChoice(options);
    cy.wrap($select).select(chosenCountry, { force: true });
    cy.log(`Chosen country: ${chosenCountry}`);
  });

  cy.clickNext();
};

const enterPasswordStepNegativeThenPositive = () => {
  cy.contains(/choose a password/i).should('be.visible');

  const pwdInputs = 'input[type="password"]';

  const runPasswordAttempt = (pwd) => {
    cy.get(pwdInputs).filter(':visible').eq(0).clear().type(pwd, { log: false });
    cy.get(pwdInputs).filter(':visible').eq(1).clear().type(pwd, { log: false });
    cy.clickNext();
  };

  runPasswordAttempt('x'.repeat(300));
  runPasswordAttempt('<script>alert(1)</script>');
  runPasswordAttempt("' OR '1'='1");

  runPasswordAttempt(newAccountPassword);
};

const verifyRoleSelectionAndFinish = () => {
  cy.contains(/what is your primary role/i).should('be.visible');

  cy.get('button[aria-label*="back" i], .back, [data-testid*="back"]')
    .filter(':visible')
    .first()
    .click({ force: true });

  cy.contains(/choose a password/i).should('be.visible');
  cy.get('input[type="password"]').filter(':visible').eq(0).clear().type(newAccountPassword, { log: false });
  cy.get('input[type="password"]').filter(':visible').eq(1).clear().type(newAccountPassword, { log: false });
  cy.clickNext();

  const expectedRoles = [
    'Producer', 'Songwriter', 'Engineer', 'Artist',
    'Label/Publisher', 'Podcaster', 'Content Creator', 'Other'
  ];

  expectedRoles.forEach((role) => {
    cy.contains('button, [role="button"], label, div', new RegExp(`^\\s*${role}\\s*$`, 'i')).should('be.visible');
  });

  const chosenRole = randomChoice(expectedRoles);
  cy.contains('button, [role="button"], label, div', new RegExp(`^\\s*${chosenRole}\\s*$`, 'i'))
    .first()
    .click({ force: true });

  cy.log(`Chosen role: ${chosenRole}`);
  cy.clickNext();
  cy.contains(/let'?s create your first project/i, { timeout: 30000 }).should('be.visible');
};

describe('SoundCredit signup and login/logout coverage', () => {
  it('creates 5 accounts with multi-step negative and positive checks', () => {
    signupAliases.forEach((emailAlias) => {
      goToSignup();
      fillPrimaryEmail(emailAlias);
      fillPrimaryPassword(newAccountPassword);
      cy.clickNext();

      cy.performEmailVerification(Cypress.env('verificationCode'));
      cy.clickNext();

      enterIdentityStepNegativeCases();
      enterAgeStepNegativeThenPositive();
      enterPasswordStepNegativeThenPositive();
      verifyRoleSelectionAndFinish();
    });
  });

  it('logs in and logs out with the provided existing account', () => {
    cy.setupAuthFailureIntercept();
    cy.openLoginPage();
    cy.submitLogin(existingAccount.email, existingAccount.password);
    cy.assertLoginSuccess();
    cy.logoutIfPossible();
    cy.url({ timeout: 20000 }).should('include', '/login');
  });
});
