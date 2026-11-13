# Validation - v1.1.0

Passed Chromium checks at 1440 px and 390 px: no page errors, missing assets or horizontal mobile overflow; instructions dialog open/Escape; share URL; swap, equal masses and total-preserving transfer; slow motion; pause/resume and reset; correct travel-limit stop with arrows/readouts cleared; four Physics catalog cards including the new activity. Desktop and mobile screenshots reviewed. Physics checked over the full 50-500 g mass grid against both Newton equations: T−m1g=m1a and m2g−T=m2a, plus equal masses and the 200/300 g example (a=1.962 m/s²). No shared activity code changed.

Repeat manually: release each mass imbalance in both directions, run equal masses, enable/disable vectors, pause then resume, switch masses mid-run, reset after a travel limit, and use all controls by keyboard. Verify massless string stays tangent to the rotating pulley and the hangers clear the pulley and bench.

Version: 1.2.0

Version 1.0.2: verified the intro block is removed, header instructions/share controls are retained, and asset versions agree. The workspace uses a 24 px gap below the header; simulation behavior is unchanged.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and covers the initial state and the spoken apparatus description, the instructions dialog (including the step built around the Release button), the share panel (share link with `?lang=es`, email subject and body), release, pause, resume and the travel limit with force arrows, reset, equal masses, transfer, swap, slow motion and the model note, with no sideways scrolling at 320 and 390 px. English visible text, SVG text, accessible labels and share links were compared with version 1.0.3 through the same states and are identical apart from frame-timed clock and speed readings. The language toggle intentionally adds header controls.

- `tests/e2e/labs-a11y.spec.js` (all labs): axe-core in English and Spanish at laptop and phone size, one pass through the Tab order with an accessible name and a visible focus indicator at every stop (compared pixel by pixel), roles, names and states of custom controls, arrow keys on every slider, text alternatives for drawings, and the Instructions dialog from the keyboard. `tests/unit/focus-css.test.js`: no stylesheet removes a focus outline without a named replacement.

## Lab check (1.2.0)

`tests/unit/atwood-labcheck.test.js` reads the formatters from `lab.js` and asserts every number in the brief from `physics.js`: 4.905, 2.453, 9.810 and 1.226 m/s² (with 0.981 and 1.962 N in the explanation); 1.509, 2.803, 0.981 and 2.616; 2.140, 3.924, 1.472 and 2.453 N, with weights 1.47 and 3.92 N; 0.000, 1.472, 0.000, 2.943 and 9.810; 0.45, 0.32, 0.10 and 0.64 s, with a = 5.886 m/s². Each question has exactly one null feedback key, unique values and labels, and a feedback message for every wrong key. The ALC entry matches the question titles, all 32 first-try patterns with every possible Show me count round-trip through `codes.checkText`, a GLC code and the pinned GAS code still read the same, and every lab check sentence has Spanish with the same placeholders.

`tests/e2e/atwood-labcheck.spec.js` covers the closed default and `?check=1`, the position after the bench card, every setup (start masses, real time, arrows, a run in progress reset) followed by the student's own change and the readout the question asks about, every wrong feedback message, wrong then right, Show me after two misses, the code only after all five, the code and score in the teacher checker, Start over, keyboard only with visible focus, axe at 1366x657 and 390x664 in English and Spanish with `embed=1`, 44 px choices and no sideways scrolling, and a perfect Spanish run followed by five Show me answers. For question 5 it releases at 1× and asserts the clock reads 0.45 s and the state reads the travel limit.
