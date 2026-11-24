# Verification
Version: 1.2.0

- `tests/e2e/labs-a11y.spec.js` (all labs): axe-core in English and Spanish at laptop and phone size, one pass through the Tab order with an accessible name and a visible focus indicator at every stop (compared pixel by pixel), roles, names and states of custom controls, arrow keys on every slider, text alternatives for drawings, and the Instructions dialog from the keyboard. `tests/unit/focus-css.test.js`: no stylesheet removes a focus outline without a named replacement.
- Unit tests check Snell’s law against a known air/glass result, optical reversibility, matched indices, normal incidence, Fresnel reflectance, the critical angle, total internal reflection, parallel slab exits, and finite paths across the available index and incidence ranges.
- Browser tests exercise geometry changes, materials, custom indices, the exact critical-angle preset, power and reset, keyboard aiming, laser dragging, protractor snapping and visibility, normal visibility, Instructions/Escape/focus return, Share URL, and 390/320 px page fit.
- An axe scan checks for serious and critical accessibility issues.
- Manual visual review checks the optical breadboard, machined laser housing, transparent block and degree markings. SVG scales to the available width and pointer positions use SVG coordinate transforms.

Version 1.1 adds browser checks for investigation presets, withheld numerical answers (including the SVG accessible description), live Snell’s-law substitution, fixed-angle material comparisons, below/above-critical transitions, reset, entry-point zoom, and bench-before-settings mobile order. Existing physics and accessibility checks remain in place.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes (including the laser's `aria-valuetext`) for leftover English, and walks both blocks, every material, a custom index, the critical angle and the just below and just above steps, total internal reflection, matching indices, laser off, hidden measurements, zoom, snapping, all three investigations, the Instructions dialog and the Share panel (share link and email with `?lang=es`). It also checks no sideways scrolling at 320 and 390 px. English visible text, SVG text, accessible labels and share links were compared with version 1.0.1 through 21 states and are identical; the only change is the bilingual noscript message. The language toggle intentionally adds header controls.

## Lab check (1.2.0)

`tests/unit/snells-labcheck.test.js` checks that `lab.js` hands the check its formatter, the readout's no-ray text and a setup that matches the investigation buttons, and asserts every number in the brief from `interfaceRay` and the formatter (28.1°, 45.0°, 61.9°, 30.0°; 15.4°, 25.4°, 16.5°, 40.0°; 45.0°, 28.1°; 41.8°, 48.6°, 48.2°, 33.7°; No transmitted ray, 62.7°, 90.0°, 41.8°) against Snell's law written out in the test. It also checks the question data (setups on the menus, one right choice that is a slot, unique labels, a feedback message for each wrong choice that never names the right one), all 32 first-try patterns with Show me counts through `codes.checkText`, the SLC registry entry (id 14, ids 1 to 14 unique, `STLC` free), Spanish placeholders and the page wiring with unique ids.

`tests/e2e/snells-labcheck.spec.js` covers the closed default and `?check=1`, the position above the physics note, every setup (geometry, menus, angle, laser on, Show measurements, protractor snapped, investigation prompt untouched) with the readouts equal to the right choice (28.1°, 15.4°, 45.0°, Critical angle 41.8°, No transmitted ray), every wrong choice, Show me, the code and score only after all five, the teacher checker, Start over, keyboard only, axe in English and Spanish at 1366x657 and 390x664 with embed, and a perfect Spanish run.
