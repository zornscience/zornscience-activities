# Verification

Version: 1.2.1

- `node --test tests/unit/equilibrium-thermo.test.js`: conservation, positivity, ongoing equal equilibrium rates, cold-metal energy transfer, equal-temperature behavior and limiting reactants.
- `npx playwright test tests/e2e/equilibrium-thermo.spec.js`: free exploration, independent activities without cross-links or intro banners, headers/help/sharing, pause/step controls, calculations and sign feedback, comparison trials, equal-temperature case, input validation, CSV and mobile layout.
