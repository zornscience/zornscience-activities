# Reaction Energy Lab verification

Version: 1.0.4

## Commands

From the repository root:

```sh
node --test tests/unit/reaction-energy-lab.test.js
npx playwright test tests/e2e/reaction-energy-lab.spec.js
npm run test:unit
npm run test:browser
```

The repo's existing PHP tests require a PHP CLI in PATH. Browser tests require Playwright Chromium or a local configuration selecting an installed Chromium. The activity itself needs neither PHP nor Node.

The e2e spec writes fourteen full-page screenshots, one per mode per language, to `test-results/reaction-energy-screenshots/`. Set `ZSA_RE_SCREENSHOTS` to change the destination. The suite also checks each mode at 360 px, with reduced motion, using axe WCAG 2 A/AA and WCAG 2.1 AA rules. It checks external requests, CSP violations and page errors. All 15 README presets run in both languages with console-error checks. Fresh-load DOM checks cover every bond, process and formation reaction, plus the heating challenge, before and after commitment.

## Automated coverage

- `tests/e2e/labs-a11y.spec.js` (all labs): axe-core in English and Spanish at laptop and phone size, one pass through the Tab order with an accessible name and a visible focus indicator at every stop (compared pixel by pixel), roles, names and states of custom controls, arrow keys on every slider, text alternatives for drawings, and the Instructions dialog from the keyboard. `tests/unit/focus-css.test.js`: no stylesheet removes a focus outline without a named replacement.
- All supplied diagram, heating, stoichiometry, bond, formation, Hess and KOH examples, including all six Hess sets and independently rounded water constants.
- The peak-for-ΔH, missing stoichiometric coefficient, three N-H bonds, missing Hess multiplier and missing reversed-sign mistakes.
- Catalyst invariance, phase endpoints, heat conservation and positive/negative reverse paths.
- Coefficient and formation-sum checks, ethanol's missing formation enthalpy, Hess cancellation and target matching.
- Blank and malicious answer rejection; scientific notation parsing without evaluation; safe lesson URLs and invalid parameter fallbacks.
- Keyboard tab navigation, accessible charts and tables, native bond selectors, Hess reversal and multipliers, live feedback, mobile layout, language restart and preserved URL settings.
- Shared dialog focus restoration, fresh Share URLs, embed behavior, clipboard fallback and downloaded CSV content.

## Executed checks for 1.0.1

- Full unit suite: 286 passed, using a workspace-local PHP CLI with SQLite, ctype and iconv for the existing WordPress tests.
- Full browser suite with installed Chromium: 589 passed; the existing exhaustive Lewis builder AP feedback-routing group 2 exceeded its 400-second limit. That single case passed when rerun in a fresh worker (2.4 minutes), without source changes.
- Focused Reaction Energy Lab suite: all 15 tests passed, including fresh-load answer guards, student-entry mirroring, prediction feedback, process cancellation, Unicode signs, consistent segment units, subscripts, mobile chart bounds, offline operation and accessibility.
- All 15 README presets passed in English and Spanish with zero browser console errors. The final complete-curve accessible-title check also passed for every preset in both languages.
- Model comparison against the original revision confirmed every exported chemistry constant and reaction preset was unchanged. Only the equation formatter changed in chem.js.

## Manual review

1. Open each lesson preset in README.md, in English and with `lang=es`. Verify the course wording and units.
2. Change all three PE values, toggle Catalyst, and verify that both arrows begin at the reactant line. Check read and sketch answers.
3. Choose a prediction, then start each process. Verify that classification and thermometer changes appear only at completion, with prediction feedback. Only KOH assigns numerical thermometer temperatures.
4. Run heating and cooling. Compare A to E with the complete 1.00 g curve graph; Check reveals phase and endpoint columns in the sample Data table. At a plateau, temperature and particle speed stay fixed while spacing changes. With reduced motion, the particles remain visible without animation.
5. Use phase selectors for melting, freezing, boiling and condensation at their exact endpoint temperatures. Reset playback and jump with the time slider.
6. Check both reactant and product masses in stoichiometry. In bonds, count each molecule's bonds before applying the coefficient.
7. Compare H₂O(l) and H₂O(g) formation values. Solve ethanol without treating its missing value as zero.
8. Solve each Hess set using only the keyboard. Confirm canceled species, final stoichiometry and energy sign.
9. Copy data with clipboard denied, then download CSV. Open the file in a spreadsheet and check units and full precision.
10. Verify no storage or application network calls appear, and that the interface remains usable at 360 px.

The build report records the executed checks and any environment or pre-existing suite failures. Rounding differences are fully documented in README.md.
