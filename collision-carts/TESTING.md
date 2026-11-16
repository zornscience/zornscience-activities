# Verification

Version: 1.2.0

- `tests/e2e/labs-a11y.spec.js` (all labs): axe-core in English and Spanish at laptop and phone size, one pass through the Tab order with an accessible name and a visible focus indicator at every stop (compared pixel by pixel), roles, names and states of custom controls, arrow keys on every slider, text alternatives for drawings, and the Instructions dialog from the keyboard. `tests/unit/focus-css.test.js`: no stylesheet removes a focus outline without a named replacement.
- `node --test tests/unit/collision-carts.test.js tests/unit/static.test.js`: 2,000 random collisions, exact event timing, versions, asset queries and markup.
- `npx playwright test tests/e2e/collision-carts.spec.js tests/e2e/activity-headers.spec.js`: the carts, vectors, readouts, presets, the end-stop pause and reset, the header, Instructions dialog and Share panel.

## Lab check (1.2.0)

`tests/unit/collision-carts-labcheck.test.js` checks that `lab.js` exposes `fmt` and the setup through `zsa-cc:request-lab`, and asserts every number in the brief from `collide()` and the readout formatter: 0.80, 0.40, 0.00 and 1.60 m/s; 0.08, 0.16, 0.04 and 0.00 J; 0.48, 0.00, 0.80 and -0.48 m/s; 0.00, 0.40, 0.80 and 0.32 kg·m/s; 0.47, 0.20, 0.70 and 0.87 m/s, plus the explanation numbers. Each question has exactly one `null` feedback key, unique values and labels, and a feedback message for every wrong key. The CLC entry matches the question titles, all 32 first-try patterns with every possible Show me count round-trip through the teacher checker, and GLC, ALC, PLC, HLC and the other existing codes read the same. Every sentence has Mexican Spanish with the same placeholders.

`tests/e2e/collision-carts-labcheck.spec.js` covers the closed default and `?check=1`, the position above the model note, every setup followed by Launch (or Step +0.02 s) and the readouts after the collision (Cart B 0.80 m/s; kinetic energy 0.08 J; Cart A 0.48 m/s and Cart B 1.28 m/s; total momentum 0.00 kg·m/s; Cart A 0.47 m/s), every wrong choice's feedback, Show me after two misses, the code and score only after all five (read back in `/check/`), Start over, keyboard only, axe-core, Mexican Spanish, embed mode, and 1366x657 and 390x664 layouts.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and walks the initial setup, the Instructions dialog, the Share panel (share link and email with `?lang=es`), stepping through an elastic collision with momentum vectors, the inelastic heavy-light preset, the end-stop pause, reset, a launch and pause on a fake clock, and the physics note, with full-sentence templates. English visible text, SVG text, accessible labels and share links were compared with version 1.0.3 through the same states and are identical. The language toggle intentionally adds header controls. The Spanish layout was checked at 320 px, 390 px and 1366 px with no sideways scrolling, menu options that fit, and cart labels inside their plates.
