# Verification

Version: 1.0.1

Run `node tests/unit/equipotential.test.js` from the repository root. Tests independently verify Coulomb magnitude, inverse-distance potential, inverse-square field, dipole symmetry, negative potential gradient, empty space, and singularity detection.

Browser checks at 1366 px and 390 px: Instructions dialog opens and Escape closes it; Share exposes the canonical activity URL; probe keyboard movement produces 17.98 V at 5 cm from +0.10 nC; charge keyboard and pointer movement update voltage; Delete removes a charge; all presets, overlays, contour spacing and reset work; twelve-charge maximum is enforced. Check for runtime errors and horizontal overflow. Audit WCAG A/AA using axe-core. No data-entry or introduction band should appear.
