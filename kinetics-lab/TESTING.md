# Verification record
Version: 1.1.0
Date: 2026-10-18
Reviewer: Claude (built and tested 1.0.0)

PASS means the check was run on version 1.0.0 as committed and passed. Browser checks use Playwright with Chromium.

| Check | Status | Evidence |
|---|---|---|
| Collision theory values | PASS | `tests/unit/kinetics-lab.test.js`: RT, e^(−Ea/RT) (4.0% at 8 kJ/mol and 300 K), the catalyst halving Ea, collision energy units, the 150 units/s rms speed at 300 K, particle counts. |
| Starting a run | PASS | At three settings: the right counts of A and B, no overlaps, every disk in the box, kinetic temperature exactly T, zero net momentum, the first log entry; the same seed repeats a run exactly. |
| Energy and walls | PASS | 20 s at 1.00 M and 400 K: the temperature stays 400 K, every disk stays in the box, more than 1000 collisions and no reactions with a huge barrier. |
| Collision energies | PASS | 60 s at 1.00 M at 300 K and 500 K (over 5000 collisions each): the share at or above 2, 4, 6 and 8 kJ/mol within 15% of e^(−Ea/RT), and the binned mean within 6% of the exponential's. |
| Successful collisions | PASS | The success rate within 20% of e^(−Ea/RT) at 300 K with and without the catalyst, at 500 K and at 200 K (4 seeds each). |
| Rate law | PASS | Over the first second (24 seeds): doubling both concentrations gives 3 to 5.5 times the successful collisions (about 4 expected); 500 K against 300 K and the catalyst within 30% of collision theory's ratios. |
| Changes during a run | PASS | Changes before the start set the starting conditions without marks; speeds scale by √(T ratio); marks of the same kind within 1 s merge; no change, no mark; the run's text notes changes. |
| Log, end and rates | PASS | Entries every 0.25 s with A + C constant; with no barrier every collision reacts and the run ends with half of A noted; a slow run stops at 10 minutes; rates count only the last 5 s; events match the counts. |
| Questions, text and CSV | PASS | One right answer per question, feedback for right, wrong and blank answers; number and percent formatting; settings, box, graph and energy text; the CSV. |
| Defaults in the page | PASS | `tests/e2e/kinetics-lab.spec.js`: slider values, outputs and spoken values, the catalyst toggle, running status, readouts, the box, graph, energy profile and collision energy descriptions, four questions. |
| Fake clock, pause, one loop | PASS | 3 s of fake time gives 2.8 to 3.1 s in the sim; Pause stops time and announces a summary whose numbers match the readouts, the energy sentence, the graph and box descriptions; Play resumes; 12 quick Play and Pause clicks then 1 s gives 1 s and at most 70 animation callbacks. |
| Sliders, catalyst, marks | PASS | Temperature by arrow keys to 400 K (value, spoken value, energy sentence, settled announcement, graph mark); Ea by Home to 2.0 (mark, profile); the catalyst adds and removes the lower path and the old Ea line, announces the new share and marks the graph. |
| New runs and comparisons | PASS | A new concentration (after the value settles) starts run 2 with 100 A and B and keeps run 1 on the graph and in the list; at most 3 earlier runs; Clear earlier runs empties them and moves focus to New run. |
| End of a run | PASS | At 600 K, 0.10 M and Ea 2.0, all of A reacts; the status, announcement and half-life; Play starts a new run and keeps the old one. |
| Questions in the page | PASS | Blank, wrong and right answers with numbered feedback, check marks and announcements. |
| CSV and printing | PASS | The downloaded file's header, first rows and length; print media shows the conditions line, a 30-line reflection in full, the box and the graph, and hides the controls; Print lab calls the print dialog. |
| Reduced motion | PASS | Starts paused with a note, time stays at 0, Play runs it. |
| Layout | PASS | Running with the catalyst, an earlier run and checked answers: no sideways scrolling, every visible button, slider, box and radio label at least 44 px, at 320x568, 360x640, 390x664, 768x1024, 1024x768, 1280x617, 1366x657, 1920x960 and 683x329 (1366x657 at 200% zoom). |
| axe-core | PASS | Zero violations (WCAG 2.0 to 2.2 A and AA plus best practices) at 1366x657 running and after a comparison and checked answers, and at 390x664. |
| Deep links, back link, embed, network, storage | PASS | All parameters; off-slider and unknown values ignored; the default back link; `?from=` accepted for a zornscience.org page and rejected for 8 other values; `?embed=1` hides the back link and footer; only local files load, each with `?v=1.0.0`; no storage or cookies. |
| Landing page | PASS | The landing page links to the sandbox. |
| Console and CSP | PASS | Every browser test fails on any console error or warning, page error or CSP violation. |
| Repeatability | PASS | The browser tests ran 3 times in a row without a failure. |
| House rules | PASS | `tests/unit/static.test.js` with the rest of the site. |
| Visual check | PASS | Screenshots at 1366 and 390 px while running with the catalyst and an earlier run, reviewed by eye: particles, bursts, graph, marks, energy charts and labels. |

## Spanish verification

`tests/e2e/i18n.spec.js` opens the sandbox with `?lang=es`, checks text and accessible attributes for leftover English, and exercises running, pausing, a new run with an earlier run kept, the catalyst, the questions with blank, wrong and right answers, the instructions and the share panel (the share link carries `?lang=es`), with full-sentence templates. The unit tests still pass on the English model text, and the English page text was compared with version 1.0.1 through the same states and is identical apart from the EN / ES header links, which the language toggle intentionally adds.

## Not tested
Real screen readers (NVDA, VoiceOver, ChromeVox), Firefox, Safari, Chromebooks and phones (frame rate on slow devices included), printing to paper (print media was emulated), and the live site. The model was checked against collision theory, not against measured rate data.
