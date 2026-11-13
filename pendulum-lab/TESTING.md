# Verification

Version: 1.3.0

- `tests/e2e/labs-a11y.spec.js` (all labs): axe-core in English and Spanish at laptop and phone size, one pass through the Tab order with an accessible name and a visible focus indicator at every stop (compared pixel by pixel), roles, names and states of custom controls, arrow keys on every slider, text alternatives for drawings, and the Instructions dialog from the keyboard. `tests/unit/focus-css.test.js`: no stylesheet removes a focus outline without a named replacement.
- `tests/e2e/pendulum-lab.spec.js`: periods on Earth, the Moon and in zero gravity, mass and length changes, energy conservation, the three controlled comparisons, cycle counting, paused stepping, dragging and the mobile settings disclosure.
- `node --test tests/unit/static.test.js tests/unit/i18n.test.js`: versions, asset queries, markup and language module.
- `npx playwright test tests/e2e/activity-headers.spec.js tests/e2e/a11y.spec.js tests/e2e/layout.spec.js`: header, Instructions dialog, Share panel, accessibility and responsive layout.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and tests the three comparisons with their predictions and results, releasing, pausing, stepping and resetting on a fake clock, the energy cues, cycle progress, zero gravity and a zero release angle, the mobile settings toggle, the Instructions dialog and the Share panel (share link with `?lang=es` and the email subject and body), with full sentence templates. English visible text, SVG text and accessible labels were compared with version 1.1.1 through the same states and are identical. The language toggle intentionally adds header controls. The Spanish layout was checked at 320 px and 390 px with no sideways scrolling.

## Lab check (1.3.0)

`tests/unit/pendulum-labcheck.test.js` checks that `lab.js` takes its model from `physics.js` and its readouts through `fixed3`, `fixed1` and `clock`, and asserts every number in the brief: 2.378, 1.189, 4.756 and 0.595 s; 1.808 s, 0.047 and 0.189 J, 3.616 and 0.904 s; 3.495, 1.420, 8.600 and 0.577 s; 2.198 and 2.307 s, a 0.109 s difference, 5.0% and 50%; and after 10 Steps from rest at +40°, 0.50 s, -1.2°, 2.032 m/s, PE 0.001 J, KE 0.619 J, total 0.620 J, plus 4.202 and 3.678 m/s and the explanation's 0.234, 0.211 m and 2.03 m/s. Each question has exactly one null feedback key, unique values and labels, and a feedback message for every wrong key. The PLC entry matches the question titles, all 32 first-try patterns with every possible Show me count round-trip through `codes.checkText`, the pinned GAS code and the ALC example still read the same, and every lab check sentence has Spanish with the same placeholders.

`tests/e2e/pendulum-labcheck.spec.js` covers the closed default and `?check=1`, the position above the model note, every setup (a comparison cleared, real time, a swing in progress reset) followed by the student's own slider or Gravity change and the readout the question asks about, 10 presses of Step (clock 0.50 s, angle -1.2°, speed 2.032 m/s, PE 0.001 J, KE 0.619 J, Total 0.620 J), the phone settings panel opened by setup, every wrong feedback message, wrong then right, Show me after two misses, the code only after all five, the code and score in the teacher checker, Start over, keyboard only with visible focus, axe at 1366x657 and 390x664 in English and Spanish with `embed=1`, 44 px choices and no sideways scrolling, and a perfect Spanish run followed by five Show me answers.
