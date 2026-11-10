# Validation

Automated browser checks cover preparation volumes, the 32 s reference endpoint, stopwatch pause/resume, cold conditioning and mixed temperature, the 20 s challenge, reset during preparation, mobile overflow, runtime errors, and axe accessibility. Pure model checks cover dilution, monotonic concentration and temperature trends, the exact challenge target, and invalid conditions.

Manual review: inspect desktop and narrow-screen glassware; open/close Instructions with keyboard/Escape; open Share and copy a fresh canonical activity link; use all three concentration presets; compare cold, room, and warm trials; confirm accelerated playback preserves simulated endpoint times. No student data table or entry fields should appear. The share link is read-only.

Timing is illustrative, as disclosed in Instructions and model details. Chemical rate constants are not calibrated to real measurements.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and runs a concentration trial, a temperature trial, a missed and a met 20-second challenge, Instructions and the Share panel (with `?lang=es` in the share link). English text, aria-labels and titles were compared with version 1.0.2 through the same states and are identical apart from the added EN / ES header links.

Version: 1.1.4

- `tests/e2e/labs-a11y.spec.js` (all labs): axe-core in English and Spanish at laptop and phone size, one pass through the Tab order with an accessible name and a visible focus indicator at every stop (compared pixel by pixel), roles, names and states of custom controls, arrow keys on every slider, text alternatives for drawings, and the Instructions dialog from the keyboard. `tests/unit/focus-css.test.js`: no stylesheet removes a focus outline without a named replacement.
