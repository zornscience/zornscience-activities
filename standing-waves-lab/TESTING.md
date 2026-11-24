# Verification

Version: 1.2.0

- `tests/e2e/labs-a11y.spec.js` (all labs): axe-core in English and Spanish at laptop and phone size, one pass through the Tab order with an accessible name and a visible focus indicator at every stop (compared pixel by pixel), roles, names and states of custom controls, arrow keys on every slider, text alternatives for drawings, and the Instructions dialog from the keyboard. `tests/unit/focus-css.test.js`: no stylesheet removes a focus outline without a named replacement.
- `node --test tests/unit/static.test.js`: versions, asset queries, markup and no en or em dashes.
- `npx playwright test tests/e2e/standing-waves-lab.spec.js tests/e2e/activity-headers.spec.js`: harmonics against tension and length, the strobe lock and phase, transverse motion of one string point, node cursor measurements, fine tuning, zero drive, reset, the header, Instructions dialog, Share panel and the phone layout.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes (including the cursors' spoken values) for leftover English, and walks the initial state, the Instructions dialog with both rebuilt steps, the Share panel (share link and email with `?lang=es`), starting the oscillator, tuning harmonic 3 with nodes labeled, the strobe lock with a tracked string point, placing the cursors on adjacent nodes and then off them, detuning, zero drive, all three investigations, the fundamental, stopping the oscillator and reset, with full-sentence templates. English visible text, SVG text, accessible labels and share links were compared with version 1.0.4 through the same states and are identical. The language toggle intentionally adds header controls. The Spanish layout was checked at 320 px, 390 px and 1366 px with no sideways scrolling and a 44 px ES toggle.

## Lab check (1.2.0)

`tests/unit/standing-waves-labcheck.test.js` checks that `lab.js` hands the check the model, the setup and the formatter, and asserts every number in the brief from the lab's own `compute()` and formatter (39.15, 16.05, 52.20, 4.35 Hz; 0.800, 0.400, 1.200, 2.400 m; 31.32, 62.64, 15.66, 52.20 m/s; 18.46, 26.10, 13.05, 6.53 Hz; 22.15, 31.32, 44.29, 15.66 m/s) against the string formulas written out in the test. It also checks the question data (setups on the controls' steps, one right choice that is a slot, unique labels, a feedback message for each wrong choice that never names the right one), all 32 first-try patterns with Show me counts through `codes.checkText`, the STLC registry entry (id 15, ids 1 to 15 unique), Spanish placeholders and the page wiring with unique ids.

`tests/e2e/standing-waves-labcheck.spec.js` covers the closed default and `?check=1` (the lab unchanged, oscillator off), the position above the model note, every setup (controls, oscillator on, 65% drive, readouts; strobe lock, cursors and the investigation untouched) with the readouts equal to the right choice (3 × f₁ by the 3 harmonic button, λ = 2Δx = 0.800 m after Place cursors on adjacent nodes, 31.32 m/s at harmonic 2 and 4, f₁ 18.46 Hz at 400 g, 22.15 m/s on the Heavy cord), every wrong choice, Show me, the code and score only after all five, the teacher checker, Start over, keyboard only, axe in English and Spanish at 1366x657 and 390x664 with embed, and a perfect Spanish run.
