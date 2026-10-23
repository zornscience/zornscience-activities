# Ionic Reaction Builder checks

Version: 3.2.0

`node --test tests/unit/ionic-reactions.test.js` verifies all 40 independently pinned reaction equations, elemental counts, smallest coefficients, ionic and elemental species, product-order permutations, invalid coefficients and round sampling. It checks all 15 nonempty combinations of the four allowed reaction types, unique questions and fair distribution, and the polyatomic-ion restrictions for each family. Chemistry checks require ionic compounds, valid ion charges, conserved polyatomic anions in single replacement, and a coefficient change in every equation. They also check product-subscript variety and reduced nitrate repetition.

The audited bank has 10 reactions per family. Product ion ratios require subscripts in 6 synthesis, 6 single replacement and 8 double replacement problems; 33 of 40 problems need product subscripts when elemental products are included. Nitrate appears in 3 reactions, alongside eight other polyatomic-ion types. Each of the 40 balances requires at least one coefficient greater than 1.

`npx playwright test tests/e2e/ionic-reactions.spec.js` verifies the pre-start checkbox screen, empty-selection error, selected-only practice, unique randomized rounds and retained selections. It exercises the reactants-arrow-products layout and bank placement, large subscript arrows, neutral atoms and ions, drag/drop and keyboard placement, reversed product order, live atom and ion counts, coefficient controls, invalid inputs, skipping, missed-problem summaries and replay. Sharing, accessibility, mobile overflow and target sizes, embed behavior, and local-only loading are also checked.

The environment's external Playwright configuration selects preinstalled Chromium: `npx playwright test --config=/workspace/.zsa-playwright.config.cjs tests/e2e/ionic-reactions.spec.js`. Firefox is not installed in this environment. The controls use ordinary HTML buttons and retain number-input keyboard support. The normal repository configuration uses its pinned Chromium when installed.

The stage-transition checks verify that balancing replaces prediction in the same document slot, focus moves to its heading, and Next, Skip, and replay restore prediction. Balance controls use vertically stacked 48 px arrows. The "Balanced?" column shows only a green check for equal counts and an empty cell otherwise, including invalid coefficients.

Bank relevance checks independently verify that every offered block uses current reactant elements, each polyatomic block occurs in a reactant, and no unrelated distractor options remain. Neutral atom blocks are used only for elemental products. The browser suite checks the worked copper(II) phosphate instructions example, preserved problem state, dismissal and focus return, larger equation typography, stronger coefficient borders, centered product heading, and icon-labelled sharing without LinkedIn. It also checks the simplified header and "Balance the equation" heading without step labels.

The static checks keep the site CSP and prohibit injection, globals, inline styles/scripts, storage and network requests. Only the two explicit user-initiated social-share URL templates in `share.js` are added to the outside-link check.
