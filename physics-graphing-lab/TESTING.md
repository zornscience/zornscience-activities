# Verification record
Version: 1.1.0
Date: 2026-10-18
Reviewer: Claude (built and tested 1.0.0)

PASS means the check was run on version 1.0.0 as committed and passed. Browser checks use Playwright 1.56 with Chromium.

| Check | Status | Evidence |
|---|---|---|
| Handoff physics checks | PASS | `tests/unit/physics-graphing-lab.test.js`: Turn around reverses at 5 s with v = 0; Slow to a stop is at rest at 10 s (not counted as a reversal inside the run); Stay at rest stays at 5 m; and at every slider setting (9 positions, 21 velocities, 21 accelerations) the graph bounds hold every value from 0 to 10 s, include 0 and are at least 2 units tall. |
| Model | PASS | Position and velocity recomputed by stepping in 1 ms steps (not from the model's formulas) agree within 1e-9 at 0, 1.7, 5 and 10 s across the slider settings. |
| Scenarios | PASS | Each of the six is on the slider steps and does what its description says (steady, from rest, at rest at 10 s, reverses inside the run, moving left and speeding up, at rest). |
| Scales | PASS | At every slider setting and graph: 3 to 7 ticks, steps of 1, 2 or 5 times a power of ten, 0 among them, every model value inside. Values on the edges keep the scale; a larger typed value stretches it; values past the limits are listed off the scale and the scale stops near the limit; the limits are twice what the sliders can reach. |
| Comparison | PASS | Exact values "closely follow"; values shifted by 12% of the span are "approaching"; 50% are "far"; three points get "covers only part"; one point or none get "add a sketch". |
| Text and CSV | PASS | Insight for reversal, rest, steady motion and no reversal; the spoken descriptions; −0.00 never shown; the CSV has 101 rows every 0.1 s, plain minus signs, values equal to stepping within 6e-5 and no -0.0000. |
| Defaults and scenarios in the page | PASS | `tests/e2e/physics-graphing-lab.spec.js`: the default Cruise readouts, graph descriptions, insight and track description; all six scenarios with their announcement, slider outputs, readouts at 0, 5 and 10 s against the kinematic equations written in the test, graph descriptions and insight; the cart at rest at 7.50 m at 5 s and moving left at 7 s in Turn around. |
| Sliders | PASS | Arrow keys change the value and its spoken value, select "Custom settings" and update the insight; choosing "Custom settings" keeps the values; choosing the scenario again restores it and resets time. |
| One animation loop | PASS | With 12 Play and Pause presses in one task (no frame between them) each frame runs exactly one animation callback; the handoff build ran 7 in the same check. With a fake clock: 2 s of running gives 2 s, 12 quick presses then 1 s gives 1 s, a paused run stays paused, the run ends at exactly 10.00 s with Replay and an announcement, Replay restarts from 0, the scrubber pauses, Reset returns to 0 and stays there, and a setting change stops the run. |
| Predictions | PASS | Predict mode hides the model on every graph and in the insight; the cart can still run; a mouse stroke across the Position graph; typed velocities with points and circles; emptying a box removes its point; a drawn stroke empties the typed boxes it crosses and keeps the others; touch pointer events draw; `touch-action` is none only while drawing is possible. |
| Reveal, clear, changes after reveal | PASS | Reveal shows all three models and the three feedback lines (far, close, add a sketch), moves focus to the feedback, announces it, disables Reveal and the boxes and stops drawing. Clear predictions hides the model and empties and enables every box. A new scenario after a reveal starts a fresh prediction; Explore shows the model and hides the prediction tools. |
| Values off the scale | PASS | A typed 12 m/s stretches the velocity scale to −5 to 15 with a note; 500 and −1000 m/s are listed as off the scale with two edge markers; every mark stays inside the plot; after the reveal the model line is inside the plot and the feedback still compares; Clear returns the scale. |
| CSV export | PASS | The downloaded file equals the model's CSV for Speed up to the left (ending 10.0, -25.0000, -6.0000, -0.5000) and for custom settings; the download is announced. |
| Printing | PASS | Print media: the summary line, all 40 lines of a long reflection laid out in full, the feedback and the three graphs side by side; the text area and controls hidden. Print lab calls the print dialog. |
| Layout | PASS | With a revealed prediction including a value off the scale and the keyboard boxes open: no sideways scrolling, every visible button, select, slider, box and summary at least 44 by 44 px, track labels at least 12 px tall and not overlapping, graph ticks at least 9 px, at 320x568, 360x640, 390x664, 768x1024, 1024x768, 1280x617, 1366x657, 1920x960 and 683x329 (1366x657 at 200% zoom). |
| axe-core 4.14 | PASS | Zero violations (WCAG 2.0 to 2.2 A and AA plus best practices) at 1366x657 and 390x664 in Explore, scrubbed, predicting with the keyboard boxes open and a value off the scale, revealed with a reflection, and in print media. |
| Deep links, back link, embed, network, storage | PASS | `?scenario=` and `?mode=predict`, unknown values ignored; the default back link is the Velocity-Time Graphs lesson; `?from=` accepted for a zornscience.org page and rejected for 8 other values; `?embed=1` hides the back link and footer, links target `_top`, other parameters still apply; only local files load, each with `?v=1.0.0`; no storage or cookies; a reload starts fresh. |
| Landing page | PASS | The landing page links to the lab. |
| Console and CSP | PASS | Every browser test fails on any console error or warning, page error or CSP violation (the CSV download included). |
| House rules | PASS | `tests/unit/static.test.js` with the rest of the site (strict IIFE, no innerHTML or inline styles, one CSP, no en or em dashes, versions agree). |
| Visual check | PASS | Screenshots at 1366 and 390 px in Explore and Predict reviewed by eye: graphs, track, readouts and the off-scale note. |

## Spanish verification
`tests/e2e/i18n.spec.js` opens the lab with `?lang=es` and checks the page text and accessible attributes (including slider values) for leftover English in every state: each scenario, custom settings, a run on a fake clock with Pause and Replay, the time slider, Predict and compare with a sketch drawn by pointer and values typed off the scale, Reveal and compare with its feedback, Clear predictions, the instructions and share dialogs (share link with `?lang=es`), the CSV header and the print summary with a reflection. English text, spoken descriptions, the CSV and share links were compared with version 1.0.1 through the same states and are identical. The Spanish layout was checked at 320 and 390 px with no sideways scrolling and a 44 px language toggle.

## Not tested
Real screen readers (NVDA, VoiceOver, ChromeVox), Firefox, Safari, real touch screens (touch was simulated with pointer events), Chromebooks and phones, printing to paper (print media was emulated), and the live site.
