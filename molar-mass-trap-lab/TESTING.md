# Molar Mass Trap Lab checks

Version: 1.0.0

## Browser and model checks

- `node --test tests/unit/molar-mass-trap-lab.test.js tests/unit/static.test.js tests/unit/seo.test.js tests/unit/focus-css.test.js` checks volume, footprint and profile geometry, independent station state, focus styles, and the bilingual directory and search metadata.
- `npx playwright test tests/e2e/molar-mass-trap-lab.spec.js` exercises all four samples in a mixed order, rapid input, natural settling while another liquid or station is open, time advance, a bead above 90°, keyboard-only glycerin measurement, pointer drag, zoom and resize, Spanish, Share, print, reduced motion, disabled storage and resets.
- `node --test tests/unit/molar-mass-trap-shot.test.js` compares fast, slow and skipped frames, exact departure and contact instants, manual click times, pauses, replay and averages of censored readings.
- `npx playwright test tests/e2e/molar-mass-trap-shot.spec.js` covers water and glycerin replays, the slow-motion cue and preservation of manual measurements, short and slow falls, repeated clicks, the magnet, readings saved by the magnet or a reset, manual retries, tab visibility and station switching, censored readings, Spanish keyboard controls, reduced motion, print, and axe at laptop and phone widths.
- `node --test tests/unit/molar-mass-trap-mixing.test.js` checks aliquot validation, independence, settled band volumes and ordering, the four-to-five inversion boundary, the 60 s clock, and cleanup.
- `npx playwright test tests/e2e/molar-mass-trap-mixing.spec.js` checks the density order before inversion, all five settled mixtures, fill heights, band colors, the air surface and internal boundary, and the clear band's edge highlights. Clicks at one position every 100 ms stop at five inversions or upright placement until a separate control is used. The suite also checks early descriptions, station and tube changes, both ways to finish settling, and refilling without losing notebook entries.
- `node --test tests/unit/molar-mass-trap-notebook.test.js` checks notebook recovery, recomputation of saved shot summaries, rejection of unrelated files, and the debrief self-check.
- `npx playwright test tests/e2e/molar-mass-trap-release.spec.js` covers all six station orders, the complete interleaved classroom route, bilingual directory navigation, and Spanish accessibility with the predictions open and the file dialog active.
- `npx playwright test tests/e2e/activity-headers.spec.js --grep molar-mass-trap-lab` checks the shared header and canonical English Share link. The lab spec checks the complete Spanish URL.
- The shared About and lab accessibility suites discover the page. The settled controls were also audited with axe-core in English at laptop width and in Mexican Spanish at 360 px.
- Chromium's 200% browser zoom reduced the 1366 px viewport to 683 CSS px without horizontal scrolling. The ruler's zero matched the left edge of the clear octanol puddle and the right edge read 20 mm. A separate 360 px portrait check kept the same alignment.
- The shot bench fit the same 200% browser zoom. A Spanish 360 px touch run recorded two `<0.5` results and replayed water in manual mode with departure and contact cues.
- The four-row shot table showed the wax notebook on the same station and distinguished instrument-timed entries. A 6.31 s and 6.52 s pair displayed 6.42 s and accepted a student response of 6.4 s.
- A Spanish keyboard-only run at 360 px prepared tube 3 with reduced motion. The close-up and dispensing controls fit on screen together, and focus passed from the upright button to the timer and from time advance to Read layers. A separate touch run let tube 3 settle while wax and shot data were collected, then recorded the result and disposed of the mixture. Axe found no violations on the rack at laptop and Spanish phone widths. Chromium's 200% browser zoom check also fit the working rack.
- The Spanish print check fits all three tables in worksheet order on one Letter page with a diameter, a side-view choice, two below-threshold times and their mean, the five liquid pairs, the tube 3 observations, and the ZornScience license.

## Classroom walkthrough

Before the directory changes, the complete browser route started with Spanish tube 3, measured water on wax paper during settling, and recorded the layers after one simulated minute. The student recorded a manual `<0.5` s water reading and a 0.27 s instrument reading, switched to English, finished the other samples, revised the tube 3 layer count, disposed of all five mixtures and completed the debrief. The test blocks browser storage and uses the Playwright clock to move through the same elapsed-time model as the bench.

The complete English and Mexican Spanish samples print on two Letter pages. The first contains the predictions, four diameters and profiles, eight shot readings with four mean or bound summaries, and five mixture observations. The second contains the debrief and ZornScience license. The downloaded notebook reopened after reload with its evidence and checked summaries. An unrelated JSON file left the active notebook intact, and Start fresh cleared the session. At Chromium's 200% zoom the bench, notebook and debrief fit within 683 CSS px.

## Low-end emulation

Chromium 154 on Linux, cold cache, 10 Mbps with 40 ms latency and 4× CPU throttling. Readiness includes font load and two animation frames. Button response is measured from the click to the first frame callback showing the changed state. Animation rate counts unique frame timestamps.

### Shot station, 0.2.1

Each viewport had three loads, three tilt clicks and one full glycerin event run. The animation sample covers upright rotation and the fall.

| Metric | 1366 × 768 CSS px at 1.25 DPR | 1366 × 768 display approximation at 125% (1093 × 614 CSS px) |
| --- | ---: | ---: |
| Compressed response bodies, max | 199,338 bytes | 177,711 bytes |
| Usable bench | 616 to 688 ms | 580 to 620 ms |
| Tilt button response | 10 to 12 ms | 11 to 12 ms |
| Glycerin animation rate | 60 fps | 60 fps |
| Glycerin event time | 6.40 s | 6.40 s |
| App animation callbacks in a one-second idle sample | 0 | 0 |

### Mixing rack, 0.3.1

Each viewport had three cold loads and five inversions of tube 3. Readiness includes selecting the mixing station. The 125% display case uses the equivalent CSS viewport and device pixel ratio.

| Metric | 1366 × 768 CSS px at 1 DPR | 125% display approximation (1093 × 614 CSS px at 1.25 DPR) |
| --- | ---: | ---: |
| Compressed response bodies, max | 210,165 bytes | 210,165 bytes |
| Usable rack | 679 to 706 ms | 676 to 696 ms |
| Inversion button response | 9 to 11 ms | 8 to 11 ms |
| Inversion animation rate | 60 fps | 58.6 to 60 fps |
| App animation callbacks in a one-second idle sample | 0 | 0 |

### Classroom candidate, 1.0.0

Each viewport had three cold loads, five inversions of tube 3 and one glycerin event run. Readiness includes opening the mixing station.

| Metric | 1366 × 768 CSS px at 1 DPR | 125% display approximation (1093 × 614 CSS px at 1.25 DPR) |
| --- | ---: | ---: |
| Compressed response bodies, max | 217,503 bytes | 217,503 bytes |
| Usable bench | 816 to 926 ms | 722 to 789 ms |
| Inversion button response | 6 to 10 ms | 8 to 11 ms |
| Upright shot button response | 11 ms | 9 ms |
| Inversion animation rate | 60 fps | 60 fps |
| Glycerin animation rate | 59.9 fps | 60 fps |
| Glycerin event time | 6.40 s | 6.40 s |
| App animation callbacks in a one-second idle sample | 0 | 0 |

All measured resources were same-origin. The background-tab case uses Playwright's simulated visibility event. District Lenovo testing remains pending.

## Review screenshots

- [English desktop, four settled drops and a glycerin reading](../.github/screenshots/molar-mass-trap-wax-desktop.png)
- [Mexican Spanish at 360 px, with the octanol measurement](../.github/screenshots/molar-mass-trap-wax-es-360.png)
- [English desktop, instrument-timed and manual entries, and both notebook tables](../.github/screenshots/molar-mass-trap-shot-desktop.png)
- [Mexican Spanish at 360 px, manual water replay and two below-threshold trials](../.github/screenshots/molar-mass-trap-shot-es-360.png)
- [English desktop, five settled mixtures and editable layer observations](../.github/screenshots/molar-mass-trap-mixing-desktop.png)
- [Mexican Spanish at 360 px, tube 3 and observations retained from wax paper](../.github/screenshots/molar-mass-trap-mixing-es-360.png)
- [English release candidate with a complete mixing notebook and debrief](../.github/screenshots/molar-mass-trap-release-desktop.png)
- [Mexican Spanish debrief at 360 px with evidence from two tests](../.github/screenshots/molar-mass-trap-release-es-360.png)

The classroom walkthrough and print check passed before the directory entry and search metadata were added to the release candidate.
