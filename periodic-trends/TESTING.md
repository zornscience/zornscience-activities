# Verification record
Version: 1.0.0
Date: 2026-10-16
Reviewer: Claude (built and tested 1.0.0)

PASS means the check was run on version 1.0.0 as committed and passed. NOT TESTED rows say why. Browser checks use Playwright 1.56 with Chromium over the local test server and run in CI with `npm test`. Expected answers and feedback rules in the tests are worked out from the Periodic Table's data and the lessons' trend rules, not from `trends.js` or the build script.

## Questions and data (`tests/unit/periodic-trends.test.js`)
| Check | Status | Evidence |
|---|---|---|
| Every answer matches the data and the rule | PASS | All 446 possible pairs (main groups, periods 2 to 5, same group or same period, no noble gases for electronegativity) are listed by the test itself. For each, the larger value in the Periodic Table's `data.js` is compared with the rule (radius decreases across and increases down; electronegativity and ionization energy increase across and decrease down). The 426 pairs where they agree are asked, with that answer and relation; none of the others is asked. |
| Every excluded pair listed | PASS | The 20 excluded pairs are pinned in the test (17 against the trend, 3 equal) and each appears as a row of the README's "Excluded pairs" table. Asked plus excluded equals 446. |
| Strip values | PASS | Name, atomic number, group, period, radius, electronegativity and ionization energy of all 32 elements equal the Periodic Table's. |
| Generated file | PASS | `data.js` is exactly what `tools/build-data.js` writes. |

## Every wrong pick (`tests/e2e/periodic-trends.spec.js`)
| Check | Status | Evidence |
|---|---|---|
| Routing | PASS | All 426 questions opened with `?q=` and played in the real page: every wrong choice in every step (5 per question, 2,130 in all) shows "↻ Not yet." with the intended rule, stays on the step and is marked tried; then the right answer moves on. The summary names the right element, the trail reads "Same period / Atomic radius decreases / Sodium" style chips, and the Periodic Table link opens the matching heatmap with the answer selected. |
| Rule counts | PASS | Atomic radius: relation 152, neither 152, stays the same 152, radius confused with ionization energy 152, atomic number alone 105, trend applied backwards 47. Electronegativity: relation 121, neither 121, stays the same 121, direction reversed 121, trend applied backwards 84, atomic number alone 37. First ionization energy: relation 153, neither 153, stays the same 153, ionization energy confused with radius 153, trend applied backwards 106, atomic number alone 47. |

## Flow, rounds and keyboard
| Check | Status | Evidence |
|---|---|---|
| Round rules | PASS | 40 seeded rounds: 9 different questions each, 3 per trend, each trend with a same-group and a same-period pair; progress "Question n of 9"; first-try lines "Same group or period", "Trend direction", "Which element" at 9 / 9 when played right; more than 200 different questions seen. |
| Hints, Show me, trail, review | PASS | Sodium and chlorine (radius) step by step: both hints with groups 1 and 17 highlighted, "Both hints shown" stays focusable, Show me after two wrong picks with "→ Same period" in the trail, exact text of the confusion and atomic-number messages, the summary values (Na 155 pm, Cl 99 pm) and focus on "Question complete". A step wrong twice in a mixed round adds "Review 10 of 10" for the same question and lowers that step's first-try count. |
| Summaries and options | PASS | Single question ends with "Trend practice complete" and the miss under Keep practicing; Practice my misses starts 6 questions; the trend picker and `?trend=ie` start 6 questions of one trend; a bad `?q=` starts a normal round. |
| Keyboard | PASS | Tab reaches the first answer group; arrows, Home and End never submit; Enter and Space choose; focus moves to the next step's first choice, then "Question complete", then the Periodic Table link. |
| Console and CSP | PASS | Every browser test fails on any console error or warning, page error or CSP violation. |

## Layout and accessibility
| Check | Status | Evidence |
|---|---|---|
| Fit | PASS | 360x640, 390x664, 1280x617 and 1366x657, three questions with the longest names and both kinds of step 2 wording, 11 states each (each step, wrong answers, both hints, Show me offered, question complete): the step's buttons, feedback and hint, and the Next button are on screen and the table is in view, without the student scrolling. The question strip is in view whenever a step starts and at "Question complete". |
| No sideways scrolling, 44 px targets | PASS | 320x568, 360x640, 390x664, 683x384, 768x1024, 1280x617, 1366x657 and 1920x960 in every state, and with Practice options open. |
| axe-core 4.14 | PASS | Zero violations at 1366x657 and 390x664 in 9 states each: start, wrong answer, hint, Show me offered, step 3, question complete, round summary, practice options open, embed mode. |
| Embed mode and network | PASS | `?embed=1` hides the back link line and footer, keeps the h1, sets links to `_top`, sends no message at the top level. Only local files with `?v=1.0.0`; no storage or cookies. |
| HTML and CSS validation | PASS | W3C Nu checker (vnu-jar 26.10.12): no errors or warnings for `index.html` and `trends.css` (only the usual info notes about the CSP when reading from disk). |
| Text scans | PASS | No en or em dashes in any file (`tests/unit/static.test.js`); no charges in this activity. |
| Screenshots reviewed | PASS | 390x664 and 1366x657 viewed by Claude. Fixes made from them: "No change" instead of "Stays about the same" so the three choices fit on phones, shorter step 2 question, shorter confusion and atomic-number messages and step 2 hint so feedback plus hint fit at 360x640 with the table in view. |
| Real screen readers, Firefox, Safari, school devices | NOT TESTED | Not available here. |
| Live URL, WordPress callout | NOT TESTED | After merging: https://activities.zornscience.org/periodic-trends/ |
