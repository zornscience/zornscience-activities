# Validation

Version: 1.3.0

Three Chromium tests cover equilibrium extension and the 50 g hanger, spring-constant reveal, ideal oscillation period, synchronized pause and 20 ms stepping, settling, keyboard displacement, modal focus restoration, share URL, and mobile overflow. All pass using the installed system Chromium. Additional desktop and 390 px mobile screenshot checks, reset and mass controls passed without JavaScript errors.

The broader local unit suite reports existing Collision Carts strict-IIFE and version-documentation issues, and PHP tests require a PHP executable absent from this environment. Shared assets were not changed.

## 1.1.0 validation

Seven targeted Chromium tests pass: equilibrium and unit conversion, ideal motion and synchronized pause/step, keyboard/modal/share/mobile overflow, force-extension graph and prompts, measured period with mass and amplitude comparisons, hanger dragging without a jump, damping and zero-displacement release. Physics checks measure 0.628 s for 0.20 kg / 20 N/m and 0.889 s for 0.40 kg / 20 N/m; reducing amplitude to 2 cm preserves the period. Desktop and 390 px layout checks report no browser errors. System Chromium is selected using a checkout-local test configuration; the committed tests use the repository's normal runner.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and goes through the Instructions dialog, the Share panel (share link and email with `?lang=es`), mass and spring changes, the spring constant reveal, the force arrows and sentences, Pull & release with the motion graph and a measured period on a fake clock, Pause, Step 0.02 s and slow motion, the zero-displacement release, the keyboard on the hanger, every investigation prompt and Reset lab. English page text, SVG text and accessible labels were compared with version 1.1.0 through the same states and are identical. The language toggle intentionally adds header controls. The Spanish layout was checked at 320 px and 390 px with no sideways scrolling.

- `tests/e2e/labs-a11y.spec.js` (all labs): axe-core in English and Spanish at laptop and phone size, one pass through the Tab order with an accessible name and a visible focus indicator at every stop (compared pixel by pixel), roles, names and states of custom controls, arrow keys on every slider, text alternatives for drawings, and the Instructions dialog from the keyboard. `tests/unit/focus-css.test.js`: no stylesheet removes a focus outline without a named replacement.

## Lab check (1.3.0)

`tests/unit/hookes-labcheck.test.js` checks that `lab.js` shows the extension through `fixed2` and the measured period and forces through `fixed3`, and asserts every number in the brief: 6.54, 19.62, 58.86 and 9.81 cm; 14.71, 7.36, 29.43 and 3.68 cm; 1.257, 0.628, 2.513 and 0.314 s; 0.574, 1.147, 0.287 and 0.811 s; 0.600, 2.562 and 1.962 N, plus the explanation weights 1.962, 1.472 and 2.943 N. Each question has exactly one null feedback key, unique values and labels, and a feedback message for every wrong key. The HLC entry matches the question titles, all 32 first-try patterns with every possible Show me count round-trip through `codes.checkText`, the pinned GAS code and the ALC and PLC examples still read the same, and every lab check sentence has Spanish with the same placeholders.

`tests/e2e/hookes-labcheck.spec.js` covers the closed default and `?check=1`, the position above the model note, every setup (spring, masses, release displacement, damping, 1× time speed, Show forces off, Show spring constant unchecked and hidden, a run in progress stopped) followed by the student's own change and the readout the question asks about, question 3 released at 1× until the measured period reads 0.628 s and then 1.257 s, question 4 measured at 2.0 cm and 4.0 cm (0.574 s both times), question 5 with the hanger focused and ArrowDown pressed 6 times (3.00 cm and "Net force: 0.600 N up."), every wrong feedback message, wrong then right, Show me after two misses, the code only after all five, the code and score in the teacher checker, Start over, keyboard only with visible focus, axe at 1366x657 and 390x664 in English and Spanish with `embed=1`, 44 px choices and no sideways scrolling, and a perfect Spanish run followed by five Show me answers.
