# Molar Mass Trap Lab checks

Version: 0.1.0

## Browser and model checks

- `node --test tests/unit/molar-mass-trap-lab.test.js tests/unit/static.test.js tests/unit/seo.test.js tests/unit/focus-css.test.js` checks volume, footprint and profile geometry, independent station state, focus styles, and exclusion from the catalog and sitemap.
- `npx playwright test tests/e2e/molar-mass-trap-lab.spec.js` exercises all four samples in a mixed order, rapid input, natural settling while another station is open, time advance, keyboard-only glycerin measurement, pointer drag, zoom and resize, Spanish, Share, print, reduced motion, disabled storage and resets.
- The shared About and lab accessibility suites discover the page. The settled controls were also audited with axe-core in English at laptop width and in Mexican Spanish at 360 px.
- Chromium's 200% browser zoom reduced the 1366 px viewport to 683 CSS px without horizontal scrolling. The ruler's zero matched the left edge of the clear octanol puddle and the right edge read 20 mm. A separate 360 px portrait check kept the same alignment.
- The Spanish print check generated a one-page Letter PDF and confirmed the entered diameters, side-view choices, notes and ZornScience license in the output.

## Low-end emulation

Chromium 154 on Linux, cold cache, 10 Mbps with 40 ms latency and 4× CPU throttling. Three loads and twelve drop activations per viewport. The readiness time includes font load and two animation frames. Response time is measured from a click to the first frame callback showing the dispense control's changed state.

| Metric | 1366 × 768 CSS px at 1.25 DPR | 1366 × 768 display approximation at 125% (1093 × 614 CSS px) |
| --- | ---: | ---: |
| Compressed response bodies, max | 186,637 bytes | 186,637 bytes |
| Usable bench | 609 to 686 ms | 859 to 1,020 ms |
| Drop button response | 9 to 14 ms | 8 to 27 ms |
| App animation callbacks in a one-second idle sample | 0 | 0 |

All measured resources were same-origin. District Lenovo hardware and working shot and mixing animations have their own verification in later milestones.

## Review screenshots

- [English desktop, four settled drops and a glycerin reading](../.github/screenshots/molar-mass-trap-wax-desktop.png)
- [Mexican Spanish at 360 px, with the octanol measurement](../.github/screenshots/molar-mass-trap-wax-es-360.png)

The full classroom walkthrough in the handoff is the release gate for adding the activity to the public catalog.
