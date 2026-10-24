# Chemical Bonding Lab checks

Version: 1.0.0

Run `npx playwright test tests/e2e/chemical-bonding-lab.spec.js` and `node --test tests/unit/static.test.js`.

The browser checks exercise all four unknowns through solid conductivity, water measurement/preparation/stirring/probing/rinsing, cyclohexane preparation and five-minute endpoints, and malleability. They verify hot plate heating through 300 °C, the hot-boat interlock, cooling and disposal, timer cancellation on station changes, valid SVG rendering, no student answer fields, Instructions/Share dialogs, Escape focus return, and layout at widths 390, 768, and 1366 px.

Visual QA: inspect the watch glass/light, beaker, balance, graduated cylinder, conductivity tester, foil boat/hot plate/tongs, test tube/stirrer, mortar/pestle, and scoopula. Check labels and controls at mobile and desktop sizes. Check the sharing fallback if clipboard access is unavailable. Confirm no sample identity or bonding classification is shown to students.
