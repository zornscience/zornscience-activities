# Free Energy Lab testing

Version: 1.1.0

## Lab bench verification (1.1.0)

Six browser tests in `tests/e2e/free-energy-lab.spec.js` cover the bench:

- The phase chamber's state text, slider value text and text alternative at 200, 273, 330, 373 and 450 K; the entropy meter rises at every step; the molecules fill the chamber as a gas and sit in rows as a solid; the chamber keeps its temperature when the process changes.
- With motion: nothing moves at load, molecules move after a temperature change, and Pause motion stops them (aria-pressed, Play motion).
- The ΔG vs T graph labels both zones (AP and Chemistry wording), shows only T at the marker, and the marker moves to 1500 K and sits above the zero line for the Haber reaction.
- ΔG° and K: for N₂O₄ the mixture stays hidden until K = 6.9 is checked, then shows 35 of 40 particles as B; for acetic acid the mixture shows and ΔG° waits for the check.
- An extreme ΔG° (−2000 kJ, where K overflows to Infinity in JavaScript, and +2000 kJ, where it underflows to 0) still gives a full or empty mixture with "fewer than 1 of 40", never NaN.
- Mexican Spanish text and text alternatives, with no English left on the bench.

The existing tests still check that no answer appears before its Check, and that the K panel has no circle before the K check and one after. `tests/e2e/labs-a11y.spec.js` passes for this lab in both languages. axe-core was also run by hand on Entropy Explorer, ΔG and Temperature and ΔG° and K at 1280x800 and 390x664 in English and Spanish (Chemistry and AP): no violations, and no sideways scrolling from 320 to 1920 px. Screenshots were checked by hand at 1280x800 and 390x664 in both languages at 200, 273, 298 and 450 K, before and after the K check, and for ΔG given and K given.

## Automated checks

From the repository root:

```sh
npm run test:unit
npx playwright test tests/e2e/free-energy-lab.spec.js
npm run test:browser
npm run parity -- --base HEAD --quick
```

The browser suite needs Chromium installed through Playwright or an equivalent configured system executable. The existing WordPress unit tests require PHP with SQLite, DOM, mbstring, ctype and iconv. These are development tools only; the activity has no runtime dependencies.

`tests/unit/free-energy-lab.test.js` verifies the lesson entropy sums, unknown entropy, AP and Chemistry values, Gibbs conversion and its common mistake, formation calculation, crossover temperatures, all four sign patterns, both K directions, dissolving, coupling and intermediates, every entropy prediction, kinetic interventions, safe arithmetic, scientific notation, round ticks, lesson URL validation and invalid physical inputs.

`tests/e2e/free-energy-lab.spec.js` covers the actual prediction, sum, unknown, Gibbs, formation, classification, K, salt and coupling workflows. It checks keyboard tab navigation, both dialogs through shared controls, safe return links, language reload/reset, exports and clipboard fallback, embed behavior, invalid parameters, custom values, the formation preset and offline operation. English and Mexican Spanish run axe checks, including contrast, at 360 px in all six modes. The screenshot checks capture every mode at desktop width. The production CSP remains enabled; axe loads as a local test asset.

Version 1.0.1 adds tests generated from all eight README lesson presets in both languages. Each checks the initial panel, Data table and live region for answer leakage and records browser exceptions and console errors. Separate regressions cover wrong-Check solution help, independent formation and chain checks, changing problem data, exact coupling values, supplied/calculated precision, blank dimensionless units, HTML/SVG reaction-mole subscripts and Copy data matching the displayed table. Screenshots are saved with the Playwright test results.

## Review checklist

- `tests/e2e/labs-a11y.spec.js` (all labs): axe-core in English and Spanish at laptop and phone size, one pass through the Tab order with an accessible name and a visible focus indicator at every stop (compared pixel by pixel), roles, names and states of custom controls, arrow keys on every slider, text alternatives for drawings, and the Instructions dialog from the keyboard. `tests/unit/focus-css.test.js`: no stylesheet removes a focus outline without a named replacement.
- Compare the provided lesson presets with the README.
- Use both languages and `course=chem`. Check the ΔG notation, vocabulary and units.
- Enter `5.9 × 10⁴` for AP Haber at 298 K and verify the J-to-kJ warning.
- Enter coefficient-weighted sums for combustion and solve the NO₂ unknown.
- Compare CaCO₃ crossover temperatures in both courses. Set zero or opposite-sign inputs and compare the no-positive-crossover message.
- Test catalyst, heat, light and Reset. Read the note that ΔG is held at its reference value in the kinetic comparison.
- Compare the standalone −32.9 kJ K example with the unrounded Haber ΔH/ΔS chain; the small difference is intentional and documented.
- Couple iron and mercury reactions using only the keyboard. Inspect the canceled species and net equation.
- Compare table, Copy data and CSV values. Calculated display rows follow the lesson precision without trailing-zero padding; reference values keep their supplied precision. CSV has up to fifteen, and calculations retain their original values.
- Inspect every plot's text alternative, round ticks, line-style legend and accessible data.
- Use 360 px and reduced motion. Check focus visibility and Escape/focus return in dialogs.

## Version 1.0.1 results

- Focused Playwright suite: 38 passed, including all eight README lesson presets in EN and ES with zero browser exceptions or console errors.
- Mobile accessibility: all twelve mode/language cases passed axe, including contrast, at 360 px.
- Preservation checks: `chem.js` is byte-for-byte unchanged, every existing Spanish dictionary entry is preserved, all asset versions agree at 1.0.1, and no lab source or documentation contains an em dash.
- Complete repository unit/browser results and GitHub checks are recorded on the follow-up PR.

## Version 1.0.0 results

- Final model tests: 12 passed.
- Final focused browser tests: 20 passed. All twelve language/mode cases passed axe, including contrast, at 360 px and produced desktop screenshots.
- Expanded Spanish shared-shell regression check: passed. Final targeted entropy-flow/export and DS/K screenshot checks also passed.
- Final repository static checks: 6 passed; whitespace/diff checks clean.
- Full unit run: 275 of 276 passed; enabling the missing iconv extension in the temporary PHP runtime resolved the remaining existing test, with both ACT History tests passing on retry. The final model/static rerun passed.
- Quick parity against starting HEAD 40dbd91: 5 scenarios, 984 compared states, 936 screenshot pairs, no differences.
- Full browser verification covered 575 cases across the original run and a targeted resume after the environment reconnected: 557 passed, 17 failed in unchanged existing activities, and one additional existing Lewis AP routing test stalled beyond its 400-second limit and was stopped. The resumed run recorded 24 passes and that stopped worker. No Free Energy Lab test failed in the final checks.

A temporary configuration outside the repository selected the installed system Chromium. PHP and the needed extensions were extracted into temporary tooling outside the repository. Shared files and package dependencies are unchanged.

The existing browser failures and the stopped Lewis AP routing test are listed in [REPORT.md](REPORT.md). No shared files or other activities were changed to address those existing checks.

The original broad-run results above use base `40dbd91`. Before the PR, the branch was updated to `ada7f0c` to include Reaction Energy Lab and its glossary entries, and focused validation on that base passed: 23 browser/accessibility tests, 18 model/static tests, and the English/Spanish catalog link checks.
