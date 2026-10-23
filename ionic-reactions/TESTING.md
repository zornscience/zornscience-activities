# Reaction Builder checks

Version: 2.0.0

`node --test tests/unit/ionic-reactions.test.js` verifies all 35 independently pinned reaction equations, elemental counts, smallest coefficients, neutral species and polyatomic formulas, product-order permutations, invalid coefficients, and round sampling. One hundred seeded rounds must contain ten distinct problems, two per reaction type, with varied first problems.

`npx playwright test tests/e2e/ionic-reactions.spec.js` exercises independent known answers through a complete mixed round. It verifies neutral atoms and ions, drag/drop and keyboard placement, subscripts, reversed product order, live atom counts, optional whole-ion counts, 48 px coefficient controls, invalid inputs, skipping in both stages, unique-per-problem missed counts, summary review, and replay. Share checks cover canonical and encoded links, clipboard fallback, native sharing, dismissal and focus. Accessibility, small-screen target sizes and overflow, embed behavior, and local-only loading are included.

The environment's external Playwright configuration selects preinstalled Chromium: `npx playwright test --config=/workspace/.zsa-playwright.config.cjs tests/e2e/ionic-reactions.spec.js`. Firefox is not installed in this environment. The controls use ordinary HTML buttons and retain number-input keyboard support. The normal repository configuration uses its pinned Chromium when installed.

The static checks keep the site CSP and prohibit injection, globals, inline styles/scripts, storage and network requests. Only the three explicit user-initiated social-share URL templates in `share.js` are added to the outside-link check.
