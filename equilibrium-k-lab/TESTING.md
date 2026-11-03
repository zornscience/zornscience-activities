# Equilibrium Constant Lab testing

Version: 1.0.1

## Automated checks

Run from the repository root:

```sh
node tests/unit/equilibrium-k-lab.test.js
npx playwright test tests/e2e/equilibrium-k-lab.spec.js
npm run test:unit
npm run test:browser
```

The new unit file contains ten tests covering all requested lesson values, exact extent bounds, nonnegative compositions, stoichiometric conservation, equal equilibrium rates, omitted solids, temperature direction, strict 5% acceptance, reaction cancellation, common-ion source counts and Ksp mass action. The CaF₂ common-ion rounding difference is explicitly documented in README.md and tested against the exact root.

Seven browser tests cover the five modes, URL initialization and fallback, safe return links, language restart, shared dialogs and focus return, embed chrome, numeric guided rows, requested hints, molarity warnings, K-rule cancellation, common-ion comparisons, clipboard fallback and CSV. Both languages run offline after assets load. Every mode has axe-core WCAG 2 A/AA and 2.1 AA checks, a page-width check at 1366 px and 360 px, and keyboard tab checks. Screenshots are regenerated under `equilibrium-k-lab/screenshots/`.

This environment has system Chromium at `/usr/bin/chromium` rather than Playwright's downloaded browser. Browser verification uses a temporary configuration derived from `playwright.config.js`, with only `launchOptions.executablePath` and `--no-sandbox` added. The temporary configuration is removed before delivery. The repository's configuration and shared files are unchanged.

Initial delivery verification (1.0.0):

- `npm run test:unit`: 247 passed, 0 failed, including the existing WordPress tests with a temporary PHP CLI plus PDO/SQLite, ctype and iconv under `/tmp`.
- New chemistry file: 10 tests passed, covering every supplied lesson value.
- New e2e spec: 7 passed on the final code.
- Repository static checks: 6 passed, covering strict IIFEs, CSP, local resources, forbidden APIs, versions and absence of en/em dash characters.
- Full browser run: 524 passed and 10 failed out of 534. The two new-lab accessibility failures were corrected and pass in the final spec. Seven existing failures passed on serial retry. The unchanged gas-lab FPS check remains below its strict threshold: 29.5 FPS on retry versus >30 FPS under 4x CPU throttling.
- Reduced-motion probe: media query true, with all 81 data rows present immediately after Run.
- `git diff --check`: passed. No shared files or repository configuration changed.

See [REPORT.md](REPORT.md) for the complete delivery report, failure details, file list, numerical differences and terminology.

## Style Kit follow-up verification (1.0.1)

Reviewed the supplied Style Kit v1.8, sections 1, 4, 5, 6 and 7. Corrected Spanish rate terminology and noun-phrase headings. Localized validated lesson return URLs, the from parameter, course-specific fallbacks and the home link. Added three glossary entries and refreshed every screenshot.

- Chemistry unit file: 10 passed.
- Repository static checks: 6 passed.
- Activity browser spec: 7 passed, including English/Spanish accessibility checks at desktop and 360 px.
- Browser coverage now asserts velocidad de reacción, the noun-phrase Explore K heading, Spanish source URLs, no duplicate /es prefix, preserved lesson queries/fragments, English switching, course-specific fallbacks and continued rejection of lookalike hostnames.
- `git diff --check`: passed.
- Shared files and repository configuration are unchanged. Full-suite results above are from the initial delivery; the focused checks cover this follow-up.

## Manual review

1. Open all README lesson presets. Check AP Kc/Kp and ICE wording, then `course=chem` plain K and the R row.
2. Explore HI from 0.200 M H₂ and I₂. Run to equilibrium and inspect the curves, equal rates and Data table. Compare the final 0.0444 M, 0.0444 M and 0.311 M values.
3. Select A ⇌ B and particles. At K = 4 and total 1.0 mol, verify 2 A and 8 B. In K magnitude, test both endpoints and confirm tiny products remain at K = 1e-4. For X₂ + Y₂ ⇌ 2XY, inspect the stoichiometric particle counts.
4. In Q vs K, predict before revealing. Add and remove different species, halve and double volume, and run after each stress. After a run, confirm the next stress starts from the displayed mixture. Heat and cool N₂O₄: only K changes instantly. SO₃ states its exothermic direction but has no numeric temperature control.
5. Complete a guided table. Wrong rows stay open; correct rows unlock only the next row. Hints remain hidden until requested. Run both the NO shortcut and failing N₂O₄ shortcut. Confirm 0.32% and 22.36%, strict less than 5%, and exact answers.
6. Choose a moles problem and deliberately enter moles as molarity. Confirm the warning. Then divide by volume and complete the table. The direct PCl₅ quotient flags 0.00889 if used for K.
7. Reverse K = 0.0600, halve coefficients for K = 250, and combine reaction steps. Verify cancellation and both the target and combined K checks.
8. Compare AgCl and Ag₂CrO₄, and compare pure water with the supplied NaCl, NaI and calcium nitrate common-ion solutions. Test a nonmatching source. The ideal model leaves solubility unchanged for a source with no common ion.
9. Use Tab, Shift+Tab, arrow keys, Home and End throughout. Check visible focus, scrollable-table focus, live readouts and dialog Escape behavior. Try 360 px and a Chromebook viewport.
10. Repeat in Mexican Spanish. Switch language after a run or row entry: the URL settings remain and the activity starts fresh. Check graph alternatives, export headers and chemistry vocabulary.
11. Enable reduced motion. Run should render the endpoint without an animated progression. Disable reduced motion to watch Q relax to K.
12. Inspect browser requests after loading and while manipulating the lab. All runtime assets are local, with no application requests, tracking or persistent browser data.

## Screenshots

| Mode | English | Mexican Spanish |
| --- | --- | --- |
| Explore K | [English](screenshots/explore-en.png) | [Español](screenshots/explore-es.png) |
| Q vs K | [English](screenshots/qk-en.png) | [Español](screenshots/qk-es.png) |
| ICE/RICE | [English](screenshots/ice-en.png) | [Español](screenshots/ice-es.png) |
| K Rules | [English](screenshots/rules-en.png) | [Español](screenshots/rules-es.png) |
| Ksp and Common Ion | [English](screenshots/ksp-en.png) | [Español](screenshots/ksp-es.png) |
