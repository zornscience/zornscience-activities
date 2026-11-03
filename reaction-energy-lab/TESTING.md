# Reaction Energy Lab verification

Version: 1.0.0

## Commands

From the repository root:

```sh
node --test tests/unit/reaction-energy-lab.test.js
npx playwright test tests/e2e/reaction-energy-lab.spec.js
npm run test:unit
npm run test:browser
```

The repo's existing PHP tests require a PHP CLI in PATH. Browser tests require Playwright Chromium or a local configuration selecting an installed Chromium. The activity itself needs neither PHP nor Node.

The e2e spec writes fourteen full-page screenshots, one per mode per language, to `test-results/reaction-energy-screenshots/`. Set `ZSA_RE_SCREENSHOTS` to change the destination. The suite also checks each mode at 360 px, with reduced motion, using axe WCAG 2 A/AA and WCAG 2.1 AA rules. It checks external requests, CSP violations and page errors.

## Automated coverage

- All supplied diagram, heating, stoichiometry, bond, formation, Hess and KOH examples, including all six Hess sets and independently rounded water constants.
- The peak-for-ΔH, missing stoichiometric coefficient, three N-H bonds, missing Hess multiplier and missing reversed-sign mistakes.
- Catalyst invariance, phase endpoints, heat conservation and positive/negative reverse paths.
- Coefficient and formation-sum checks, ethanol's missing formation enthalpy, Hess cancellation and target matching.
- Blank and malicious answer rejection; scientific notation parsing without evaluation; safe lesson URLs and invalid parameter fallbacks.
- Keyboard tab navigation, accessible charts and tables, native bond selectors, Hess reversal and multipliers, live feedback, mobile layout, language restart and preserved URL settings.
- Shared dialog focus restoration, fresh Share URLs, embed behavior, clipboard fallback and downloaded CSV content.

## Manual review

1. Open each lesson preset in README.md, in English and with `lang=es`. Verify the course wording and units.
2. Change all three PE values, toggle Catalyst, and verify that both arrows begin at the reactant line. Check read and sketch answers.
3. Start each process. Only KOH assigns numerical thermometer temperatures.
4. Run heating and cooling. Compare A to E with the complete-curve table. At a plateau, temperature and particle speed stay fixed while spacing changes. With reduced motion, the particles remain visible without animation.
5. Use phase selectors for melting, freezing, boiling and condensation at their exact endpoint temperatures. Reset playback and jump with the time slider.
6. Check both reactant and product masses in stoichiometry. In bonds, count each molecule's bonds before applying the coefficient.
7. Compare H₂O(l) and H₂O(g) formation values. Solve ethanol without treating its missing value as zero.
8. Solve each Hess set using only the keyboard. Confirm canceled species, final stoichiometry and energy sign.
9. Copy data with clipboard denied, then download CSV. Open the file in a spreadsheet and check units and full precision.
10. Verify no storage or application network calls appear, and that the interface remains usable at 360 px.

The build report records the executed checks and any environment or pre-existing suite failures. Rounding differences are fully documented in README.md.
