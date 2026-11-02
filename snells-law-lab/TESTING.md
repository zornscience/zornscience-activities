# Verification
Version: 1.1.0

- Unit tests check Snell’s law against a known air/glass result, optical reversibility, matched indices, normal incidence, Fresnel reflectance, the critical angle, total internal reflection, parallel slab exits, and finite paths across the available index and incidence ranges.
- Browser tests exercise geometry changes, materials, custom indices, the exact critical-angle preset, power and reset, keyboard aiming, laser dragging, protractor snapping and visibility, normal visibility, Instructions/Escape/focus return, Share URL, and 390/320 px page fit.
- An axe scan checks for serious and critical accessibility issues.
- Manual visual review checks the optical breadboard, machined laser housing, transparent block and degree markings. SVG scales to the available width and pointer positions use SVG coordinate transforms.

Version 1.1 adds browser checks for investigation presets, withheld numerical answers (including the SVG accessible description), live Snell’s-law substitution, fixed-angle material comparisons, below/above-critical transitions, reset, entry-point zoom, and bench-before-settings mobile order. Existing physics and accessibility checks remain in place.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes (including the laser's `aria-valuetext`) for leftover English, and walks both blocks, every material, a custom index, the critical angle and the just below and just above steps, total internal reflection, matching indices, laser off, hidden measurements, zoom, snapping, all three investigations, the Instructions dialog and the Share panel (share link and email with `?lang=es`). It also checks no sideways scrolling at 320 and 390 px. English visible text, SVG text, accessible labels and share links were compared with version 1.0.1 through 21 states and are identical; the only change is the bilingual noscript message. The language toggle intentionally adds header controls.
