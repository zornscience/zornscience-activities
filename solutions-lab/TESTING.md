# Solutions Lab testing

Version: 1.0.3

## Automated checks

Run from the repository root:

```sh
node --test tests/unit/solutions-lab.test.js
npm run test:unit
npx playwright test tests/e2e/solutions-lab.spec.js
npm run test:browser
```

The site has no build step. Playwright starts the existing static test server.
Use installed Chromium if the environment has no Playwright-managed browser.
The development environment's config `/workspace/.zsa-playwright.config.cjs`
selects `/usr/bin/chromium` with two workers. This config and the local PHP runtime
are outside the repository and are not activity dependencies.

The 11 model tests cover:

- All class atomic masses and all five molar mass sums.
- 14.61 g NaCl / 250.0 mL = 1.000 M.
- 5.06 g KNO₃ / 100.0 mL = 0.500 M (three significant figures).
- 6.24 g CuSO₄·5H₂O / 250.0 mL = 0.100 M (three significant figures).
- One mol NaCl plus 1.00 L water has volume >1.00 L and M <1.00.
- 25.0 mL of 4.00 M to 200. mL = 0.500 M, with conserved moles.
- Two 10.0 mL to 100. mL dilutions: 0.200 M, then 0.0200 M.
- Flask, mass, stock, pipet and cylinder significant figures, including rounding across a power of ten.
- All 66 supplied solubility values, interpolation and endpoints.
- The ±1 g saturated boundary and values immediately outside it.
- Ordinary KNO₃ cooling from 70 °C to 30 °C: 54 g crystals, 46 g dissolved.
- Heating, gentle cooling, fixed-temperature undissolved solid and seeding.
- NH₃ loss, no gas crystals, cumulative escaped mass and no spontaneous reabsorption.
- Parameter defaults, invalid settings, exact HTTPS lesson hostname and credentials rejection.
- Fixed and randomized challenges, including a connected serial-stock chain.
- Very dilute serial stocks and high-concentration stocks from the ideal preparation model.

The 14 browser tests cover:

- Locked preparation steps, typed mass, completed readouts and the make challenge.
- Overfilling locks both addition and mixing until Start over.
- Stock transfer, serial dilution, table rows and the serial challenge.
- Gentle cooling, seed crystallization, NH₃ controls and CSV bytes.
- The water misconception demonstration, strong electrolytes and sucrose.
- Spanish title, language settings retained with a fresh experiment, and safe return links.
- Keyboard tab arrows and End, Share dialog, clean Spanish share URL and embed chrome.
- Instrumented dictionary coverage and zero external experiment requests.
- All four modes in both languages at 360 px, reduced motion, no horizontal page overflow,
  no JavaScript errors and zero axe-core WCAG 2 A/AA and 2.1 AA violations.

The repository's static checks cover strict isolated scripts, matching versions,
CSP, no inline scripts/styles, no storage or network APIs, no HTML injection,
allowed link origins, and no en or em dashes.

## Manual review and screenshots

Full-page screenshots are captured for make, dilute, solubility and challenge,
in English and Spanish, at 1366 px. Review includes:

- Shared branding, instructions, Share and license footer.
- A blue mixed 6.24 g pentahydrate solution in a 250.0 mL flask.
- The single etched neck line and the bottom of the zoomed meniscus at the line.
- CuSO₄ dilution with matching particle counts and lighter blue color.
- A 100 g KNO₃ point at 30 °C, with 54 g crystals and a saturated solution.
- All seven challenge cards and Spanish terminology.

Further classroom checks:

1. Prepare 1.46 g NaCl in 250.0 mL. Its displayed attained concentration is 0.0999 M,
   within 1% of the 0.100 M challenge target.
2. Prepare 1.25 g pentahydrate in 100.0 mL. Its attained concentration is 0.0501 M,
   within 1% of the 0.0500 M target. Do not force rounded balance masses to produce
   the target exactly.
3. For each flask, dissolve, use three big squirts, then 20 single drops. One more
   drop ruins the solution; no action can restore it except Start over.
4. In Dilute, choose 2.00 M NaCl, 10.00 mL pipet and 100.0 mL flask. Mix, use as new
   stock, and repeat. Check 0.200 M and 0.0200 M, then download both rows.
5. Try the 10 mL cylinder at 5.1 mL and confirm its 0.1 mL precision limits M₂.
6. At 70 °C dissolve 100 g KNO₃. Cool normally to 30 °C. Reset and repeat with
   gentle cooling, then seed. Compare Solution state, the dissolved graph point and the data table.
7. Switch to NH₃, add gas, then warm. Confirm bubbles and cumulative gas escape;
   cooling does not restore escaped gas and seeding remains disabled.
8. Open the curve reference table. Confirm all curves can be read without interpreting
   the SVG. Test keyboard scrolling of wide tables at 360 px.
9. Open Instructions and Share, close with Escape, and confirm focus returns to the
   opening button. Switch language and confirm a fresh experiment with settings retained.
10. Disable Clipboard API permission and verify the selectable data-copy fallback.

## Model boundaries

Read `README.md` for the illustrative water-volume displacement, schematic
wash-bottle portions, ideal volume bookkeeping, absence of phase limits in Make
and Dilute, qualitative colors and bulb brightness, dissolved-amount solution state,
and simplified crystal nucleation. All requested numeric constants are unchanged.

## Recorded validation

- Model tests: 11 passed.
- Dedicated browser tests: 14 passed, including each of the eight mode/language
  combinations at 360 px and translation/request auditing.
- Complete repository unit suite: 239 passed, including the existing PHP checks.
- Repository static checks: passed.
- Quick parity against the starting `HEAD`: 5 scenarios, 984 compared states,
  936 screenshot pairs, no differences. The explicit base is used because the
  checkout already includes unrelated work beyond its older local `origin/main`.
- Eight English/Spanish mode screenshots captured and visually reviewed.
- Full repository browser run: 529 passed; one existing exhaustive Lewis-builder
  AP routing test (group 2) exceeded its 400-second limit. Its isolated retry is
  recorded below. No shared files or Lewis-builder files were changed.
- Isolated retry of the existing Lewis-builder AP routing group 2: passed in
  2.0 minutes with one browser worker. The initial failure was a timeout;
  its chemistry and feedback assertions passed on retry.

## Version 1.0.1 regression coverage

- Gentle cooling of 100 g KNO₃ from 70 °C to 30 °C without solid retains 100 g
  dissolved and is supersaturated. Seeding leaves 46 g dissolved, 54 g crystals,
  and a saturated solution.
- Adding 1 g solid to that supersaturated solution leaves 46 g dissolved and
  55 g crystals immediately.
- Normal cooling to 50 °C followed by gentle cooling to 30 °C leaves 46 g
  dissolved and 54 g crystals. Heating still redissolves the crystals.
- Live Solution state, its sole table column, and the solid graph point use the
  dissolved amount. The caption is "Solution state uses the dissolved amount."
- Abstract classification challenges keep the original ±1 g point rule.
- The 250 g graph scale labels 0, 50, 100, 150, 200, 250 with 10 g gridlines.
- Dilution mole readouts use M₂ significant figures, with unrounded CSV values.

The validation totals above describe the original 1.0.0 baseline.

Version 1.0.1 validation: 13 model tests, 16 dedicated browser tests and all six
repository static checks passed. Browser checks include the dissolved graph point,
unified table/readout state, 50 g labels, displayed mole precision and unrounded
CSV values, plus accessibility and translation coverage in both languages.

## Version 1.0.2 dilution table precision

The serial-dilution browser regression checks that both table mole columns match the readouts and display 0.00200, while the downloaded CSV contains 0.0019999999999999996. All 13 model tests, 16 activity browser tests and six repository static checks pass.
