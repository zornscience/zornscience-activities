# Verification

Version: 1.0.0

- `node --test tests/unit/equilibrium-thermo.test.js`: chemistry conservation, shift directions and calorimetry calculations.
- `npx playwright test tests/e2e/equilibrium-thermo.spec.js`: independent URLs, lab controls and results, branded headers, Instructions keyboard behavior, correct share links, CSV data, old URL navigation, mobile width and JavaScript errors.
