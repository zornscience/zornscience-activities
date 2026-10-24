# Verification

- `node --test tests/unit/equilibrium-thermo.test.js`: checks equilibrium mass conservation, Qc/Kc agreement across temperature and volume limits, shift direction, heat conservation, and neutralization limiting reagent / sign.
- `npx playwright test tests/e2e/equilibrium-thermo.spec.js`: checks disturbances, pause/reset, both calorimetry runs, mobile width, and JavaScript errors.
- Manual: keyboard controls, embedded mode, graph jumps after a volume change, CSV and print, invalid number inputs, changing conditions during a calorimetry run.

Version: 1.0.0
