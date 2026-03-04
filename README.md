# Cypress Login Robustness Suite

This repository contains a reusable Cypress suite for login testing, including:

- input boundary testing (empty, malformed, short, long)
- payload safety testing (XSS and SQL injection-style payloads)
- large password handling checks
- valid credential login flow with optional email verification code entry
- account alias coverage for `dougrosss+sc16@mac.com` through `dougrosss+sc20@mac.com`

---

## Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm 9+

Check your versions:

```bash
node -v
npm -v
```

---

## 1) Install dependencies

From the project root:

```bash
npm install
```

If `npm install` fails with `403 Forbidden`, it usually means your npm registry/proxy is restricted.

### Quick npm registry checks

```bash
npm config get registry
npm ping
```

Expected registry:

```text
https://registry.npmjs.org/
```

If needed, reset it:

```bash
npm config set registry https://registry.npmjs.org/
```

If you are behind a corporate proxy, verify your proxy settings:

```bash
npm config get proxy
npm config get https-proxy
```

---

## 2) Configure the target login page

Edit `cypress.config.js` and set:

- `baseUrl` to your real website
- `env.loginPath` to your login route (for example `/login`)
- `env.loginUrl` for direct login page navigation (recommended for Sound Credit: `https://portal.soundcredit.com/login`)
- `env.signupUrl` for direct signup navigation (`https://portal.soundcredit.com/signup`)
- optional UI-navigation mode (`env.useUiLoginNav`) if you need to click a home-page Sign In button first
- `env.selectors` to match your actual DOM selectors

Example keys already included:

- `email`
- `password`
- `submit`
- `errorMessage`
- `successIndicator`
- `verificationCodeInput`
- `verificationSubmit`

---


### Sound Credit recommended login navigation

Use direct login URL to avoid brittle home-page click flows:

```js
// cypress.config.js
loginUrl: 'https://portal.soundcredit.com/login',
useUiLoginNav: false,
```

If you need to mimic the UI path instead, set:

```js
useUiLoginNav: true,
homePath: '/',
loginEntrySelector: '.login-btn-container button',
// or loginEntryText: 'Sign In'
```

## 3) Provide credentials and OTP securely

Use environment variables in the terminal (never hardcode credentials in test files).

### macOS/Linux example

```bash
CYPRESS_validEmail='your-user@example.com' \
CYPRESS_validPassword='your-strong-password' \
CYPRESS_verificationCode='123456' \
npm run cy:run:login
```

> For real email verification flows, connect your inbox/mail API and pass the received OTP via `CYPRESS_verificationCode`.

---

## 4) Run tests from the command line (headless)

### Run all Cypress specs

```bash
npm run cy:run
```

### Run only the login suite

```bash
npm run cy:run:login
```

### Run only the signup + onboarding suite

```bash
npm run cy:run:signup
```

### Run with browser selection

```bash
npx cypress run --browser chrome --spec cypress/e2e/login.cy.js
```

---

## 5) Run tests in the Cypress App (interactive GUI)

Start the Cypress App:

```bash
npm run cy:open
```

Then in the app:

1. Choose **E2E Testing**.
2. Pick your browser (Chrome/Edge/Electron).
3. Click `cypress/e2e/login.cy.js`.
4. Watch tests run interactively and inspect selector failures in real time.

If you need env vars while using the app, launch it from the same terminal session where vars are exported:

```bash
export CYPRESS_validEmail='your-user@example.com'
export CYPRESS_validPassword='your-strong-password'
export CYPRESS_verificationCode='123456'
npm run cy:open
```

---

## 6) GitHub workflow tips

1. Create a GitHub repository and push this project.
2. Add secrets in GitHub Actions (`CYPRESS_validEmail`, `CYPRESS_validPassword`, etc.).
3. Never commit real passwords, OTP codes, or recovery tokens.
4. Keep `node_modules/`, videos, and screenshots out of git (already covered by `.gitignore`).

---

## 7) Troubleshooting:

If you see:

```text
fatal: not a git repository (or any of the parent directories): .git
error: '--3way' outside a repository
```

it means the command was run outside your project folder (or in a folder that is not initialized as git).

### Fix

1. Go to the project folder that contains `.git`:

```bash
cd /path/to/OpenAI-SC-CypressLoginTests
```

2. Verify git context:

```bash
git rev-parse --is-inside-work-tree
```

Expected output:

```text
true
```

3. If this is a fresh local folder and you have not initialized git yet:

```bash
git init
git add .
git commit -m "Initial commit"
```

4. If you intended to work from GitHub, clone first, then `cd` into the cloned repo:

```bash
git clone <your-repo-url>
cd OpenAI-SC-CypressLoginTests
```

After that, rerun your Cypress commands from this repo root.


### Why your exact command fails

Your command starts with:

```bash
(cd "$(git rev-parse --show-toplevel)" && git apply --3way ...)
```

If you are **not already inside a git repo**, this part fails first:

```bash
git rev-parse --show-toplevel
```

So `cd` receives an empty/invalid path and `git apply --3way` runs outside a repository.

### Copy/paste-safe alternatives

Option A (recommended): go to repo root first, then apply:

```bash
cd /path/to/OpenAI-SC-CypressLoginTests
git rev-parse --is-inside-work-tree
git apply --3way < your.patch
```

Option B: one-liner with a guard (only runs if inside a repo):

```bash
git rev-parse --is-inside-work-tree >/dev/null 2>&1   && (cd "$(git rev-parse --show-toplevel)" && git apply --3way < your.patch)   || echo "Not inside a git repository. cd into your repo first."
```

If your patch is intended to create a new file, you can also use:

```bash
git apply --index < your.patch
```

Then verify:

```bash
git status
```

---


## 8) Troubleshooting: `cy.click() failed because it requires a DOM element`

If Cypress points to code like:

```js
cy.get(cy.getSelector('submit')).click()
```

you are likely running an older version of this suite. The current suite uses:

```js
cy.getBySelectorName('submit').click()
```

### Fix

1. Pull latest changes from GitHub.
2. Ensure `cypress/support/commands.js` contains `Cypress.Commands.add('getBySelectorName', ...)`.
3. Ensure `cypress/e2e/login.cy.js` uses `cy.getBySelectorName(...)` (not `cy.get(cy.getSelector(...))`).
4. Restart the Cypress app after pulling changes.

