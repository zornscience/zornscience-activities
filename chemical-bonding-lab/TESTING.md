# Chemical Bonding Lab checks

Version: 1.1.0

Run `npx playwright test tests/e2e/chemical-bonding-lab.spec.js` and `node --test tests/unit/static.test.js`.

The browser checks exercise all four unknowns through solid conductivity, water measurement/preparation/stirring/probing/rinsing, cyclohexane preparation and five-minute endpoints, and malleability. They verify hot plate heating through 300 °C, the hot-boat interlock, cooling and disposal, timer cancellation on station changes, valid SVG rendering, no student answer fields, Instructions/Share dialogs, Escape focus return, and layout at widths 390, 768, and 1366 px.

Visual QA: inspect the watch glass/light, beaker, balance, graduated cylinder, conductivity tester, foil boat/hot plate/tongs, test tube/stirrer, mortar/pestle, and scoopula. Check labels and controls at mobile and desktop sizes. Check the sharing fallback if clipboard access is unavailable. Confirm no sample identity or bonding classification is shown to students.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and runs every station through its observations, the foil boat heating and cooling, the instructions dialog and the share dialog with the `?lang=es` link. English page text, SVG markup, accessible labels and the share link were compared with version 1.0.1 through the same states and are identical. The language toggle intentionally adds header controls. Spanish layout was checked at 320, 390 and 1366 px.
