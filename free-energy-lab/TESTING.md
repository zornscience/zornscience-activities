# Free Energy Lab testing

Version: 1.0.0

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

## Review checklist

- Compare the provided lesson presets with the README.
- Use both languages and `course=chem`. Check the ΔG notation, vocabulary and units.
- Enter `5.9 × 10⁴` for AP Haber at 298 K and verify the J-to-kJ warning.
- Enter coefficient-weighted sums for combustion and solve the NO₂ unknown.
- Compare CaCO₃ crossover temperatures in both courses. Set zero or opposite-sign inputs and compare the no-positive-crossover message.
- Test catalyst, heat, light and Reset. Read the note that ΔG is held at its reference value in the kinetic comparison.
- Compare the standalone −32.9 kJ K example with the unrounded Haber ΔH/ΔS chain; the small difference is intentional and documented.
- Couple iron and mercury reactions using only the keyboard. Inspect the canceled species and net equation.
- Compare table, Copy data and CSV values. Calculated display rows have four significant figures; reference values keep their supplied precision. CSV has up to fifteen, and calculations retain their original values.
- Inspect every plot's text alternative, round ticks, line-style legend and accessible data.
- Use 360 px and reduced motion. Check focus visibility and Escape/focus return in dialogs.

## Results

- Final model tests: 12 passed.
- Final focused browser tests: 20 passed. All twelve language/mode cases passed axe, including contrast, at 360 px and produced desktop screenshots.
- Expanded Spanish shared-shell regression check: passed. Final targeted entropy-flow/export and DS/K screenshot checks also passed.
- Final repository static checks: 6 passed; whitespace/diff checks clean.
- Full unit run: 275 of 276 passed; enabling the missing iconv extension in the temporary PHP runtime resolved the remaining existing test, with both ACT History tests passing on retry. The final model/static rerun passed.
- Quick parity against starting HEAD 40dbd91: 5 scenarios, 984 compared states, 936 screenshot pairs, no differences.
- Full browser verification covered all 575 current cases across the original run and a targeted resume after the environment reconnected: 557 passed, 17 failed in unchanged existing activities, and one additional existing Lewis AP routing test stalled beyond its 400-second limit and was stopped. The resumed run recorded 24 passes and that stopped worker. No Free Energy Lab test failed in the final checks.

A temporary configuration outside the repository selected the installed system Chromium. PHP and the needed extensions were extracted into temporary tooling outside the repository. Shared files and package dependencies are unchanged.

The existing browser failures and the stopped Lewis AP routing test are listed in [REPORT.md](REPORT.md). No shared files or other activities were changed to address those existing checks.
