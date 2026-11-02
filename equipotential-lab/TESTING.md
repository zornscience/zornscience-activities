# Verification

Version: 1.2.0

Run `node tests/unit/equipotential.test.js` from the repository root. Tests independently verify Coulomb magnitude, inverse-distance potential, inverse-square field, dipole symmetry, negative potential gradient, empty space, and singularity detection.

Browser checks at 1366 px and 390 px: Instructions dialog opens and Escape closes it; Share exposes the canonical activity URL; probe keyboard movement produces 17.98 V at 5 cm from +0.10 nC; charge keyboard and pointer movement update voltage; Delete removes a charge; all presets, overlays, contour spacing and reset work; twelve-charge maximum is enforced. Check for runtime errors and horizontal overflow. Audit WCAG A/AA using axe-core. No data-entry or introduction band should appear.

Learning checks for 1.1.0: `node tests/unit/equipotential-learning.test.js` verifies like-charge cancellation and equal-radius potential with perpendicular field. `tests/e2e/equipotential-learning.spec.js` checks all four exploration setups, reveal behavior, numerical midpoint readings, custom-edit guidance dismissal, phone control ordering and probe-contour controls. Six combined browser tests pass at desktop/phone sizes; axe WCAG A/AA reports no findings in the revealed equipotential exploration. Existing static checks and four Coulomb model tests also pass.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es` and checks text and accessible attributes for leftover English: the title, the language toggle, the instructions (including the rebuilt opening sentence), the share panel and its `?lang=es` link and email, the probe moved by keyboard and by pointer, the readouts and spoken labels near and away from a charge, adding, removing and limiting charges, every configuration, all four explorations before and after Reveal & explain, and Reset lab. English visible text, accessible labels and share links were compared with version 1.1.0 through the same states and are identical. The language toggle intentionally adds header controls. The Spanish layout was checked at 320 px and 390 px with no sideways scrolling and a 44 px ES toggle.
