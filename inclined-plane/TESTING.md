# Verification

Version: 1.2.1

- `tests/e2e/labs-a11y.spec.js` (all labs): axe-core in English and Spanish at laptop and phone size, one pass through the Tab order with an accessible name and a visible focus indicator at every stop (compared pixel by pixel), roles, names and states of custom controls, arrow keys on every slider, text alternatives for drawings, and the Instructions dialog from the keyboard. `tests/unit/focus-css.test.js`: no stylesheet removes a focus outline without a named replacement.
- `node --test tests/unit/static.test.js tests/unit/i18n.test.js`: versions, asset queries, markup and language module.
- `npx playwright test tests/e2e/activity-headers.spec.js tests/e2e/a11y.spec.js tests/e2e/layout.spec.js`: header, Instructions dialog, Share panel, accessibility and responsive layout.

## Lab check (1.2.0)

`tests/unit/inclined-plane-labcheck.test.js` checks that `lab.js` exposes its coefficient table, g, the readout formatters and a setup that resets exactly as a slider does, and asserts every number in the brief from that table and those formatters: 9.22, 9.66, 9.81 and 3.36 N; 5.03, 1.68, 6.22 and 4.15 N; 2.45 and 2.76 N, 0.83 and 2.36 m/s²; 3.22, 9.65, 1.07 and 5.63 m/s²; 0.65, 0.55, 0.84 and 1.53, plus the explanation numbers and the first-slip angles (felt 33.1°, wood 24.3°, plastic 14.1°). Each question has exactly one `null` feedback key, unique values and labels, no number in the page source, and a feedback message for every wrong key. The ILC entry matches the question titles, all 32 first-try patterns with every possible Show me count round-trip through the teacher checker, and GLC, ALC, PLC, HLC, CLC and the other existing codes read the same. Every sentence has Mexican Spanish with the same placeholders.

`tests/e2e/inclined-plane-labcheck.spec.js` covers the closed default and `?check=1`, the position above the note, every setup, the arrow and readout each question names (`N 9.22 N`, `fₛ 5.03 N`, `STATIC / AT REST` with `fₛ 2.45 N`, `3.22 m/s²` before and after the mass change while the state reads `KINETIC / SLIDING`, and 33.0° holds while 33.1° slides), Pause cleared by the mass slider after question 4's setup (1.2.1) but kept by the lab on its own and after question 5's setup, every wrong choice's feedback, Show me after two misses, the code and score only after all five (read back in `/check/`), Start over, keyboard only, axe-core, Mexican Spanish, embed mode, and 1366x657 and 390x664 layouts.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and walks the states on a fake clock: at rest, the angle raised past the critical angle until the block slides, the end stop, Pause and Resume, each contact surface with its coefficients and critical angle, the force arrows and gravity components, the physics note, the Instructions dialog and the Share panel (share link and email with `?lang=es`), with full-sentence templates. English visible text, SVG text and accessible labels were compared with version 1.0.1 through the same states and are identical. The language toggle intentionally adds header controls. The Spanish layout was checked at 320 px and 390 px with no sideways scrolling and 44 px language toggles.
