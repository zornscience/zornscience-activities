# Reaction Builder checks

Version: 3.0.1

`node --test tests/unit/ionic-reactions.test.js` verifies all 40 independently pinned reaction equations, elemental counts, smallest coefficients, neutral species and polyatomic formulas, product-order permutations, invalid coefficients, and round sampling. It checks all 15 nonempty combinations of the four allowed reaction types, unique questions and fair distribution, and the polyatomic-ion restrictions for each family.

`npx playwright test tests/e2e/ionic-reactions.spec.js` verifies the pre-start checkbox screen, empty-selection error, selected-only practice, unique randomized rounds and retained selections. It exercises the reactants-arrow-products layout and bank placement, large subscript arrows, neutral atoms and ions, drag/drop and keyboard placement, reversed product order, live atom and ion counts, coefficient controls, invalid inputs, skipping, missed-problem summaries and replay. Sharing, accessibility, mobile overflow and target sizes, embed behavior, and local-only loading are also checked.

The environment's external Playwright configuration selects preinstalled Chromium: `npx playwright test --config=/workspace/.zsa-playwright.config.cjs tests/e2e/ionic-reactions.spec.js`. Firefox is not installed in this environment. The controls use ordinary HTML buttons and retain number-input keyboard support. The normal repository configuration uses its pinned Chromium when installed.

The stage-transition checks verify that balancing replaces prediction in the same document slot, focus moves to its heading, and Next, Skip, and replay restore prediction. Balance controls use vertically stacked 48 px arrows. The "Balanced?" column shows only a green check for equal counts and an empty cell otherwise, including invalid coefficients.

The static checks keep the site CSP and prohibit injection, globals, inline styles/scripts, storage and network requests. Only the three explicit user-initiated social-share URL templates in `share.js` are added to the outside-link check.
