# pH & Buffer Lab validation

Version: 1.0.0

Run from the repository root:

```sh
node --test tests/unit/ph-buffer-lab.test.js
npx playwright test tests/e2e/ph-buffer-lab.spec.js
npx playwright test tests/e2e/activity-headers.spec.js --grep ph-buffer-lab
```

Use the existing repository test tooling and Chromium installation. The site itself has no runtime dependencies.

The chemistry tests cover independent charge and mass-action checks, Kw, very dilute strong and weak solutes, Ba(OH)₂ stoichiometry, the specified water/acetate reference, every buffer family through exhaustion and excess in both directions, mixed additions and dilution, monotonicity, capacity, and challenge judging.

Browser coverage includes the four example URL patterns, unsafe return-link rejection, direct and weak methods, HH numerator and range, nonbuffer explanations, setup transfer, stress reactions and reversal, table rows, CSV, clipboard fallback, challenge feedback, English and Spanish, 1366/390/320 px layouts, tab keyboard navigation, local-only requests, offline interaction, embed chrome, shared dialogs, index listing, and axe WCAG A/AA checks in every mode.

Manual device validation remains useful for real Chromebook keyboards, iOS Safari, Firefox, and screen readers. The particle diagram is schematic, and the numerical ionization readout remains authoritative when a fraction is too small to draw.

## Recorded validation

Chromium checks passed for the activity and shared header, including both languages, mobile layouts, offline operation, and axe accessibility audits. All 22 targeted chemistry, static-contract, and i18n unit checks passed. Desktop and Spanish mobile screenshots were also reviewed.

The broader unit run initially passed 33 of 36 test files. After aligning asset versions and moving temporary tooling outside the published tree, all static-contract checks passed too. The two remaining test files cover existing WordPress plugins and require PHP, which is absent from this environment (`spawnSync php ENOENT`). No shared source files were changed. The full repository browser suite was not run.
