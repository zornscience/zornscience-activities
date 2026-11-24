# pH & Buffer Lab validation

Version: 1.1.0

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

## Lab bench verification (1.1.0)

Four browser tests in `tests/e2e/ph-buffer-lab.spec.js` cover the bench:

- Explorer: 0.10 M HCl is red with 28 H₃O⁺ and no OH⁻ drawn, 0.010 M HCl draws 24 and changes color, 0.010 M NaOH is violet with 24 OH⁻ and 1 M NaOH draws 32, 0.0010 M NH₃ is blue, and the 1 × 10⁻⁷ M HCl case is green; the text alternative and status name the color and pH.
- With motion: the ions are still at load, drift after a change, and Pause motion stops them (aria-pressed, Play motion).
- Stress Test: 1.0 mL of HCl falls as 20 drops into both beakers; mid-animation the water marker is between pH 7.00 and 3.00 and it ends at 3.00 with the orange indicator and matching text; the buffer marker moves less than a fifth as far; the data table gains one row.
- Reduced motion and Mexican Spanish: 2 drops of NaOH, the final state at once, translated text and no English on the bench.

`tests/e2e/labs-a11y.spec.js` passes for this lab in both languages. axe-core was also run by hand on the Explorer and the Stress Test at 1280x800 and 390x664 in English and Spanish: no violations, and no sideways scrolling from 320 to 1920 px. Screenshots were checked by hand at both sizes and in both languages, during and after additions of 0.1, 1.0 and 5.0 mL.

## Recorded validation

Chromium checks passed for the activity and shared header, including both languages, mobile layouts, offline operation, and axe accessibility audits. All 22 targeted chemistry, static-contract, and i18n unit checks passed. Desktop and Spanish mobile screenshots were also reviewed.

The broader unit run initially passed 33 of 36 test files. After aligning asset versions and moving temporary tooling outside the published tree, all static-contract checks passed too. The two remaining test files cover existing WordPress plugins and require PHP, which is absent from this environment (`spawnSync php ENOENT`). No shared source files were changed. The full repository browser suite was not run.

- `tests/e2e/labs-a11y.spec.js` (all labs): axe-core in English and Spanish at laptop and phone size, one pass through the Tab order with an accessible name and a visible focus indicator at every stop (compared pixel by pixel), roles, names and states of custom controls, arrow keys on every slider, text alternatives for drawings, and the Instructions dialog from the keyboard. `tests/unit/focus-css.test.js`: no stylesheet removes a focus outline without a named replacement.
