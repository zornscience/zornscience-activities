# Ionic Reaction Builder checks

Version: 1.0.1

`node --test tests/unit/ionic-reactions.test.js` checks the independent chemistry anchors, neutral formulas, grouping of polyatomic ions, positive whole-number coefficients, conservation, and reaction-bank coverage.

`npx playwright test tests/e2e/ionic-reactions.spec.js` exercises the first example from independently known answers: product gating, wrong partners and subscripts, both product orders, keyboard placement, HTML drag and drop, live ion counts, smallest-coefficient checks, invalid inputs, next-problem gating and reset. It also checks the large coefficient buttons, their bounds and keyboard operation, axe accessibility, narrow-screen overflow and target sizes, embed behavior, and local-only resource loading.

The environment's external Playwright configuration selects preinstalled Chromium: `npx playwright test --config=/workspace/.zsa-playwright.config.cjs tests/e2e/ionic-reactions.spec.js`. The normal command uses the repository's standard downloaded Chromium when available. No production dependency or build step is added.
