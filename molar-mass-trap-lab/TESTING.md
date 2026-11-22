# Molar Mass Trap Lab checks

Version: 0.2.1

## Browser and model checks

- `node --test tests/unit/molar-mass-trap-lab.test.js tests/unit/static.test.js tests/unit/seo.test.js tests/unit/focus-css.test.js` checks volume, footprint and profile geometry, independent station state, focus styles, and exclusion from the catalog and sitemap.
- `npx playwright test tests/e2e/molar-mass-trap-lab.spec.js` exercises all four samples in a mixed order, rapid input, natural settling while another liquid or station is open, time advance, a bead above 90°, keyboard-only glycerin measurement, pointer drag, zoom and resize, Spanish, Share, print, reduced motion, disabled storage and resets.
- `node --test tests/unit/molar-mass-trap-shot.test.js` compares fast, slow and skipped frames, exact departure and contact instants, manual click times, pauses, replay and averages of censored readings.
- `npx playwright test tests/e2e/molar-mass-trap-shot.spec.js` covers water and glycerin replays, a manual replay that leaves out the interval, short and slow falls, repeated clicks, the magnet, readings saved by the magnet or a reset, manual retries, tab visibility and station switching, censored readings, Spanish keyboard controls, reduced motion, print, and axe at laptop and phone widths.
- `npx playwright test tests/e2e/activity-headers.spec.js --grep molar-mass-trap-lab` checks the shared header and canonical English Share link. The lab spec checks the complete Spanish URL.
- The shared About and lab accessibility suites discover the page. The settled controls were also audited with axe-core in English at laptop width and in Mexican Spanish at 360 px.
- Chromium's 200% browser zoom reduced the 1366 px viewport to 683 CSS px without horizontal scrolling. The ruler's zero matched the left edge of the clear octanol puddle and the right edge read 20 mm. A separate 360 px portrait check kept the same alignment.
- The shot bench fit the same 200% browser zoom. A Spanish 360 px touch run recorded two `<0.5` results and replayed water in manual mode with departure and contact cues.
- The four-row shot table showed the wax notebook on the same station and distinguished instrument-timed entries. A 6.31 s and 6.52 s pair displayed 6.42 s and accepted a student response of 6.4 s.
- The Spanish print check confirmed both tables in worksheet order on one Letter page, including the entered diameter, side-view choice, below-threshold mean and ZornScience license.

## Low-end emulation

Chromium 154 on Linux, cold cache, 10 Mbps with 40 ms latency and 4× CPU throttling. Each viewport had three loads, three tilt clicks and one full glycerin event run. The readiness time includes font load and two animation frames. Tilt response is measured from the click to the first frame callback showing the control's changed state. Animation rate counts unique frame timestamps during upright rotation and the fall.

| Metric | 1366 × 768 CSS px at 1.25 DPR | 1366 × 768 display approximation at 125% (1093 × 614 CSS px) |
| --- | ---: | ---: |
| Compressed response bodies, max | 199,338 bytes | 177,711 bytes |
| Usable bench | 616 to 688 ms | 580 to 620 ms |
| Tilt button response | 10 to 12 ms | 11 to 12 ms |
| Glycerin animation rate | 60 fps | 60 fps |
| Glycerin event time | 6.40 s | 6.40 s |
| App animation callbacks in a one-second idle sample | 0 | 0 |

All measured resources were same-origin. The background-tab case uses Playwright's simulated visibility event. District Lenovo testing remains pending.

## Review screenshots

- [English desktop, four settled drops and a glycerin reading](../.github/screenshots/molar-mass-trap-wax-desktop.png)
- [Mexican Spanish at 360 px, with the octanol measurement](../.github/screenshots/molar-mass-trap-wax-es-360.png)
- [English desktop, instrument-timed and manual entries, and both notebook tables](../.github/screenshots/molar-mass-trap-shot-desktop.png)
- [Mexican Spanish at 360 px, manual water replay and two below-threshold trials](../.github/screenshots/molar-mass-trap-shot-es-360.png)

The full classroom walkthrough in the handoff is the release gate for adding the activity to the public catalog.
