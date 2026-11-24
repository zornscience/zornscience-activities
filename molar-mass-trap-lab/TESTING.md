# Molar Mass Trap Lab checks

Version: 1.2.2

Version 1.1.0 removed the on-screen notebook, predictions, debrief, notebook files and printout. Students record data on the printed lab worksheet. The shot station's stopwatch is a digital, event-timed display with no manual mode. The same version added the intro screen, the automatic wax settle, tilt-only shot trials with clickable rack tubes, and free choice of liquids in the mixing rack with a fixed 1.0 mL pipette and a 10 s real-time stand. Version 1.2.0 returned 1-octanol to the worksheet's 0.5 mL portion, labeled the intro's molar mass bars, drew mineral oil as a whole molecule with a repeating unit, moved **Start the lab** to the top of the intro, gave the intro its own getting-started instructions, replaced the wax and mixing counters with mini stopwatches, and made the fifth inversion set the tube upright on its own. Version 1.2.1 added a fixed upright height ruler with a dashed guide to the eye-level view, and made the wax and mixing settles redraw every frame. In 1.1.0 and 1.2.0 they redrew once per displayed second, which was 12 and 6 updates per second after the settles were compressed. Version 1.2.2 enlarged the eye-level view 2× with a 0 to 4 mm height ruler, and made each redraw write only changed attributes. A MutationObserver count fell from about 53 to 11 writes per frame during the wax settle and from about 7 to 3 during the shot fall. The checks below describe the current build.

## Browser and model checks

- `node --test tests/unit/molar-mass-trap-lab.test.js tests/unit/static.test.js tests/unit/seo.test.js tests/unit/focus-css.test.js` checks volume, footprint and profile geometry, the 2.5 s settle shown as 30 s, independent station state with no stored student entries, focus styles, and the bilingual directory and search metadata.
- `npx playwright test tests/e2e/molar-mass-trap-lab.spec.js` covers the intro screen, with its four Lewis structures, the labeled molar mass rows and bars in order, mineral oil's repeating unit and caption, the Start button above the cards, the getting-started instructions on the intro and the station instructions on the bench, the Start and Intro buttons and focus, Spanish at 360 px, and axe. It exercises all four samples in a mixed order, rapid input, the automatic settle on the mini stopwatch from 0:00 to 0:30, the fixed height ruler and dashed guide agreeing with the side view, per-frame redraws during the wax and mixing settles, natural settling while another liquid or station is open, a bead above 90°, keyboard-only glycerin measurement, pointer drag, zoom and resize, Spanish, Share, reduced motion, disabled storage, Start fresh, and the station layout. At 1366 × 768 and 1280 × 720, each station's controls sit to the right of its scene and everything fits without scrolling. At 900 px the controls stack below the scene.
- `node --test tests/unit/molar-mass-trap-shot.test.js` compares fast, slow and skipped frames, exact departure and contact instants, the event-timed stopwatch through a pause, tilting again to clear it for a new run, and replay.
- `npx playwright test tests/e2e/molar-mass-trap-shot.spec.js` covers the digital stopwatch with no timing controls, its ready, running, paused and stopped states, water and glycerin replays, the slow-motion cue, short and slow falls, repeated clicks, matching repeat trials, tilting again to clear the stopwatch for the next trial, selecting tubes by clicking the rack, the worksheet prompt, tab visibility and station switching, Spanish keyboard controls, reduced motion, and axe at laptop and phone widths.
- `node --test tests/unit/molar-mass-trap-mixing.test.js` checks that a tube takes any two portions and no more, with 0.5 mL of 1-octanol and 1.0 mL of the others, the settled layers for every pair of different liquids and two same-liquid pairs, density ordering, the four-to-five inversion boundary, the fifth inversion setting the tube upright on its own even after skipped frames, the 60 s clock in 10 s of real time, and cleanup.
- `npx playwright test tests/e2e/molar-mass-trap-mixing.spec.js` checks that no recipe or volume choice appears, the volume on each pipette option, the highlighted 0.5 mL note for 1-octanol, the tube contents label, the eyedropper icon, the density order before inversion, the worksheet's five pairs plus glycerin with 1-octanol and water with water, fill heights at 1.5 and 2.0 mL, band colors, the air surface and internal boundary, the clear band's edge highlights, and the mini stopwatch running from 0:00 to 1:00 after the tube stands up on its own. Clicks at one position every 100 ms stop at five inversions and cannot advance the stand clock until the separate Advance control is used. The suite also checks early descriptions, station and tube changes, both ways to finish settling, emptying a partly filled tube, refilling, and Spanish labels.
- `npx playwright test tests/e2e/molar-mass-trap-release.spec.js` covers all six station orders, the complete interleaved classroom route in both languages with storage disabled, a reload with no leave-page prompt, Spanish accessibility with the restart dialog open, and bilingual directory navigation.
- `npx playwright test tests/e2e/activity-headers.spec.js --grep molar-mass-trap-lab` checks the shared header and canonical English Share link. The lab spec checks the complete Spanish URL.
- The shared About and lab accessibility suites discover the page. They load it on the intro screen, so the station-level axe checks live in the lab's own specs. The clickable rack in the shot station is hidden from assistive technology because the named tube buttons do the same job.
- Chromium's 200% browser zoom reduced the 1366 px viewport to 683 CSS px without horizontal scrolling. The ruler's zero matched the left edge of the clear octanol puddle and the right edge read 20 mm. A separate 360 px portrait check kept the same alignment.

## Classroom walkthrough

The complete browser route starts on the intro, opens the bench, prepares water and 1-octanol in Spanish tube 3, measures water on wax paper during settling, and reads the layers after one simulated minute. Both water trials read less than 0.5 s on the event-timed stopwatch. They switch to English, time the other three liquids, measure the other three puddles, prepare, read and dispose of the worksheet's other four pairs, empty tube 3, and use Start fresh. The test blocks browser storage and uses the Playwright clock to move through the same elapsed-time model as the bench. Each of the six station orders keeps the wax reading, the settled tube and the last shot reading.

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

### Classroom candidate, 1.0.1

Each viewport had three cold loads, five inversions of tube 3 and one glycerin event run. Readiness includes opening the mixing station.

| Metric | 1366 × 768 CSS px at 1 DPR | 125% display approximation (1093 × 614 CSS px at 1.25 DPR) |
| --- | ---: | ---: |
| Compressed response bodies, max | 218,669 bytes | 218,669 bytes |
| Usable bench | 770 to 1,042 ms | 741 to 916 ms |
| Inversion button response | 7 to 11 ms | 7 to 10 ms |
| Upright shot button response | 9 ms | 12 ms |
| Inversion animation rate | 60 fps | 60 fps |
| Glycerin animation rate | 59.9 fps | 60 fps |
| Glycerin event time | 6.40 s | 6.40 s |
| App animation callbacks in a one-second idle sample | 0 | 0 |

All measured resources were same-origin. The background-tab case uses Playwright's simulated visibility event. Versions 1.1.0 to 1.2.2 have not been re-measured under the throttled network profile above. For 1.2.1, a headless Chromium run at 1× and 6× CPU throttling counted visible changes per second: the drop fall, inversion, wax settle and mixing settle all changed about 60 times per second, and the glycerin shot about 47 times per second. Headless runs do not measure GPU drawing, so district Lenovo testing remains pending.

## Review screenshots

These screenshots predate version 1.1.0 and still show the notebook column.

- [English desktop, four settled drops and a glycerin reading](../.github/screenshots/molar-mass-trap-wax-desktop.png)
- [Mexican Spanish at 360 px, with the octanol measurement](../.github/screenshots/molar-mass-trap-wax-es-360.png)
- [English desktop shot station](../.github/screenshots/molar-mass-trap-shot-desktop.png)
- [Mexican Spanish shot station at 360 px](../.github/screenshots/molar-mass-trap-shot-es-360.png)
- [English desktop, five settled mixtures](../.github/screenshots/molar-mass-trap-mixing-desktop.png)
- [Mexican Spanish mixing rack at 360 px](../.github/screenshots/molar-mass-trap-mixing-es-360.png)
- [English release candidate](../.github/screenshots/molar-mass-trap-release-desktop.png)
- [Mexican Spanish release candidate at 360 px](../.github/screenshots/molar-mass-trap-release-es-360.png)
