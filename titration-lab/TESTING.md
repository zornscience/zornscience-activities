# Verification record
Version: 1.0.0
Date: 2026-10-18
Reviewer: Claude (built and tested 1.0.0)

PASS means the check was run on version 1.0.0 as committed and passed. Browser checks use Playwright with Chromium.

| Check | Status | Evidence |
|---|---|---|
| pH against textbook calculations | PASS | `tests/unit/titration-lab.test.js`: strong acid and base (pH 1.00 at the start, excess H⁺ at 10 and 24 mL, 7.00 at equivalence, excess OH⁻ at 30 mL; NaOH analyte); acetic acid with NaOH (√(Ka·C) start 2.87, Henderson-Hasselbalch at 10 and 12.5 mL, 4.74 at half-equivalence, conjugate base hydrolysis 8.72 at equivalence, excess OH⁻); HOCl half-equivalence 7.52; ammonia with HCl (11.13 by the Kb shortcut, 9.26 at half-equivalence, 5.28 at equivalence, excess H⁺). Each written out in the test, not from the model. |
| Charge balance and direction | PASS | For every titration the setup can make (378), at 61 volumes from 0 to twice equivalence: the charge balance recomputed in the test holds, the pH is between −1 and 15, and it rises for an acid analyte and falls for a base. |
| Key points and indicator verdicts | PASS | Equivalence and half-equivalence values; phenolphthalein good and methyl orange about 22 mL early for acetic acid; methyl red good and phenolphthalein poor for ammonia; three indicators good for HCl and NaOH; "already past" and "never finishes" cases. |
| Colors, checks, text and CSV | PASS | Indicator fractions and names at the ends and middle of each range; the questions for strong, weak and unknown analytes, tolerances, blanks and hints; net ionic equations; insight text; the spoken description; formatting and the CSV. |
| Defaults and drops in the page | PASS | `tests/e2e/titration-lab.spec.js`: default setup, titrant options, reaction, readouts equal to the model, apparatus and graph descriptions; three drops give 0.15 mL, the model's pH, the announcement and four logged readings. |
| Stopcock, fake clock, one loop | PASS | A slow stream for 2 s gives 0.90 to 1.00 mL; closed stays put; 12 quick open and close clicks in one task then 1 s gives 2 mL and at most 70 animation callbacks; drop by drop through the color change announces it, and the readouts and color match the model; Start over empties the flask and stays empty. |
| Empty burette and refill | PASS | A fast stream stops at 50.00 mL with the stopcock closed, the status and the announcement; drops and opening are refused; Refill sets the reading to 0.00 mL, keeps the total, and the axis grows to 100 mL. |
| Setup changes and unknowns | PASS | The indicator change keeps the data; a new analyte changes the titrant list, reaction, readouts and question, and starts over; key points follow a new volume and concentration and are hidden by a new setup; an unknown concentration (seeded) is in range, its equivalence volume matches, three right answers are accepted, Start over keeps the sample. |
| Endpoint, answers, key points | PASS | Endpoint refused before any titrant; blank, wrong and right answers with hints; the endpoint line; key point markers, list, indicator verdict, insight, graph description and announcement; the toggle hides them. |
| CSV and printing | PASS | The downloaded file equals the model's CSV of the logged readings; print media shows the setup line, a 30-line reflection in full and the graph, and hides the controls; Print lab calls the print dialog. |
| Layout | PASS | Partway through an ammonia titration with an endpoint, checked answers and key points shown: no sideways scrolling, every visible button, select and box at least 44 by 44 px, graph and burette labels at least 9 px, key point labels inside the graph, at 320x568, 360x640, 390x664, 768x1024, 1024x768, 1280x617, 1366x657, 1920x960 and 683x329 (1366x657 at 200% zoom). Repeated 5 times without a failure. |
| axe-core | PASS | Zero violations (WCAG 2.0 to 2.2 A and AA plus best practices) at 1366x657 and 390x664 at the start, analyzed with feedback and key points, and in print media. |
| Deep links, back link, embed, network, storage | PASS | All setup parameters; unsuitable titrants and unknown values ignored; the default back link; `?from=` accepted for a zornscience.org page and rejected for 8 other values; `?embed=1` hides the back link and footer, links target `_top`; only local files load, each with `?v=1.0.0`; no storage or cookies; a reload starts fresh. |
| Landing page | PASS | The landing page links to the simulator. |
| Console and CSP | PASS | Every browser test fails on any console error or warning, page error or CSP violation. |
| House rules | PASS | `tests/unit/static.test.js` with the rest of the site. |
| Visual check | PASS | Screenshots at 1366 and 390 px after a titration past equivalence with key points shown, reviewed by eye: apparatus, flask color, curve, labels and the analysis. |

## Not tested
Real screen readers (NVDA, VoiceOver, ChromeVox), Firefox, Safari, Chromebooks and phones, printing to paper (print media was emulated), and the live site. The chemistry was checked against standard textbook calculations, not against measured titration data.
