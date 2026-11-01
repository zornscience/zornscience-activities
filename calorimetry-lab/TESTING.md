# Verification

Version: 1.3.0

- `node --test tests/unit/equilibrium-thermo.test.js`: conservation, positivity, ongoing equal equilibrium rates, cold-metal energy transfer, equal-temperature behavior and limiting reactants.
- `npx playwright test tests/e2e/equilibrium-thermo.spec.js`: free exploration, independent activities without cross-links or intro banners, headers/help/sharing, pause/step controls, calculations and sign feedback, comparison trials, equal-temperature case, input validation, CSV and mobile layout.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and runs both experiments through feedback, the worked solution, the comparison table, the instructions dialog and the share panel. English page text, SVG markup, accessible labels and CSV output were compared with version 1.2.1 through the same states and are identical. The language toggle intentionally adds header controls.
