# Verification record
Version: 1.0.0
Date: 2026-10-18
Reviewer: Claude (built and tested 1.0.0)

PASS means the check was run on version 1.0.0 as committed and passed. Browser checks use Playwright with Chromium.

| Check | Status | Evidence |
|---|---|---|
| Motion | PASS | `tests/unit/projectile-lab.test.js`: x, y, vx and vy against stepping the velocity in 0.5 ms steps at four launches; vx the same at every time; a = (0, −9.8); exact components at 0° and 90°. |
| Textbook results | PASS | Ground to ground at 17 angles and 8 speeds: time of flight 2v sin θ/g, range v² sin 2θ/g, highest point, top at half the flight, landing vy = −launch vy, landing angle; 30° and 60° give the same range; a horizontal launch takes √(2h/g). Over 3,135 slider settings: the ball is above ground in the air, lands at y = 0, has vy = 0 at the top and is never above the highest point. |
| Scenarios | PASS | Each on its sliders and matching its description (the ledge lands faster down than it went up, ground to ground flips vy, the cliff starts with vy = 0, steep and low). |
| Snapshots | PASS | Evenly spaced from 0, at most 12 and the landing, ending at the landing, over every setting. |
| Scene fit | PASS | Over 3,135 settings at 300x300, 358x300, 900x520 and 1100x520: the ball, every arrow and room for labels inside the scene, room for distance labels, and the fastest moment with the longest arrow. |
| Text and data | PASS | Ticks, number formatting, phases, directions, insight lines, spoken scene and graph descriptions, the five questions (one right answer, feedback for each choice and a blank) and the CSV. |
| Defaults in the page | PASS | `tests/e2e/projectile-lab.spec.js`: scenario, slider values and spoken values, launch components, every readout against the model, toggles, scene and graph descriptions, insight, hidden results, three arrows on the ball. |
| Vector toggles | PASS | Turning arrows on and off changes the arrows drawn and the spoken scene; snapshots at 2 s give 5 faded balls with their arrows. |
| Fake clock, pause, one loop | PASS | About 1 s of fake time gives about 1 s of flight with readouts that match the model; Pause stops time; 11 quick clicks then 0.4 s gives 0.4 s of flight and at most 30 animation callbacks. |
| Slow motion, pause at the top, landing | PASS | Slow motion runs at a quarter speed; Pause at the top stops at exactly vy = 0 with readouts, insight, the slider's spoken value and an announcement; Resume lands with the announcement, results, insight and Launch again; without the pause the top is announced in flight; Reset. |
| Time slider | PASS | Arrow keys and End by keyboard, readouts and spoken values; a flat vx line and a full vy line on the graph. |
| Scenarios and sliders | PASS | All five scenarios (outputs, announcement, graph description, readouts); a slider change shows Custom settings and starts over; along the ground, Launch is disabled with a message until the height is raised. |
| Questions | PASS | Blank, wrong and right answers with numbered feedback, check marks and announcements. |
| CSV and printing | PASS | The downloaded file equals the model's CSV; print media shows the launch line with results, a 30-line reflection in full and the scene, and hides the controls; Print lab calls the print dialog. |
| Layout | PASS | Landed with every arrow and checked answers: no sideways scrolling, every visible button, select, slider and checkbox or radio label at least 44 px, scene text at least 10 px, at 320x568, 360x640, 390x664, 768x1024, 1024x768, 1280x617, 1366x657, 1920x960 and 683x329 (1366x657 at 200% zoom). |
| axe-core | PASS | Zero violations (WCAG 2.0 to 2.2 A and AA plus best practices) at 1366x657 and 390x664: default, landed with every arrow and checked answers, and print. |
| Deep links, back link, embed, network, storage | PASS | All parameters; off-slider, unknown and malformed values ignored; the default back link; `?from=` accepted for a zornscience.org page and rejected for 8 other values; `?embed=1` hides the back link and footer; only local files load, each with `?v=1.0.0`; no storage or cookies. |
| Landing page | PASS | The landing page links to the lab. |
| Console and CSP | PASS | Every browser test fails on any console error or warning, page error or CSP violation. |
| House rules | PASS | `tests/unit/static.test.js` with the rest of the site. |
| Visual check | PASS | Screenshots at 1366 and 390 px of the ledge, cliff and ground scenarios with every arrow and snapshots, reviewed by eye. |

## Not tested
Real screen readers (NVDA, VoiceOver, ChromeVox), Firefox, Safari, Chromebooks and phones, printing to paper (print media was emulated), and the live site.
