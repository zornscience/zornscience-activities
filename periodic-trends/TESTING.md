# Verification record
Version: 1.2.0
Date: 2026-10-16
Reviewer: Claude (built and tested 1.0.0; 1.1.0 changes tested as recorded below)

PASS means the check was run on version 1.1.0 as committed and passed. Rows marked (1.0.0) were run by hand on 1.0.0 and not repeated for 1.1.0; every other row is an automated test that ran on 1.1.0 in `npm test`, with the counts updated for the 418 questions. NOT TESTED rows say why. Browser checks use Playwright 1.56 with Chromium over the local test server and run in CI with `npm test`. Expected answers and feedback rules in the tests are worked out from the Periodic Table's data and the lessons' trend rules, not from `trends.js` or the build script.

## Questions and data (`tests/unit/periodic-trends.test.js`)
| Check | Status | Evidence |
|---|---|---|
| Every answer matches the data and the rule | PASS | All 446 possible pairs (main groups, periods 2 to 5, same group or same period, no noble gases for electronegativity) are listed by the test itself. For each, the larger value in the Periodic Table's `data.js` is compared with the rule (radius decreases across and increases down; electronegativity and ionization energy increase across and decrease down). The pairs where they agree and the values differ by more than 2% of the larger one are asked (418), with that answer and relation; none of the others is asked. |
| Every excluded pair listed | PASS | The 28 excluded pairs are pinned in the test (17 against the trend, 3 equal, 8 near ties) and each appears as a row of the README's "Excluded pairs" or "Near ties removed in 1.1.0" table. Asked plus excluded equals 446. |
| Strip values | PASS | Name, atomic number, group, period, radius, electronegativity and ionization energy of all 32 elements equal the Periodic Table's. |
| Generated file | PASS | `data.js` is exactly what `tools/build-data.js` writes. |
| Near ties (1.1.0) | PASS | The unit test works out "within 2%" itself (difference at most 0.02 times the larger value) and finds exactly these 8 asked in 1.0.0 and excluded in 1.1.0: radius Se and Br, In and Sn, In and Sb, I and Xe; electronegativity P and As, S and Se, Ga and In; ionization energy Sr and In. The closest pair still asked is radius Te and I (2.2%). |

## Every wrong pick (`tests/e2e/periodic-trends.spec.js`)
| Check | Status | Evidence |
|---|---|---|
| Routing | PASS | All 418 questions opened with `?q=` and played in the real page: every wrong choice in every step (5 per question, 2,090 in all) shows "↻ Not yet." with the intended rule, stays on the step and is marked tried; then the right answer moves on. The summary names the right element, the trail reads "Same period / Atomic radius decreases / Sodium" style chips, and the Periodic Table link opens the matching heatmap with the answer selected. |
| Rule counts | PASS | Atomic radius: relation 148, neither 148, stays the same 148, radius confused with ionization energy 148, atomic number alone 101, trend applied backwards 47. Electronegativity: relation 118, neither 118, stays the same 118, direction reversed 118, trend applied backwards 84, atomic number alone 34. First ionization energy: relation 152, neither 152, stays the same 152, ionization energy confused with radius 152, trend applied backwards 105, atomic number alone 47. |

## Flow, rounds and keyboard
| Check | Status | Evidence |
|---|---|---|
| Round rules | PASS | 40 seeded rounds: 9 different questions each, 3 per trend, each trend with a same-group and a same-period pair; progress "Question n of 9"; first-try lines "Same group or period", "Trend direction", "Which element" at 9 / 9 when played right; more than 200 different questions seen. |
| Hints, Show me, trail, review | PASS | Sodium and chlorine (radius) step by step: both hints with groups 1 and 17 highlighted, "Both hints shown" stays focusable, Show me after two wrong picks with "→ Same period" in the trail, exact text of the confusion and atomic-number messages, the summary values (Na 155 pm, Cl 99 pm) and focus on "Question complete". A step wrong twice in a mixed round adds "Review 10 of 10" for the same question and lowers that step's first-try count. |
| Summaries and options | PASS | Single question ends with "Trend practice complete" and the miss under Keep practicing; Practice my misses starts 6 questions; the trend picker and `?trend=ie` start 6 questions of one trend; a bad `?q=` starts a normal round. |
| Keyboard | PASS | Tab reaches the first answer group; arrows, Home and End never submit; Enter and Space choose; focus moves to the next step's first choice, then "Question complete", then the Periodic Table link. |
| Completion code (1.1.0) | PASS | `tests/e2e/periodic-trends.spec.js`: a seeded full mixed round with both hints, two wrong picks then Show me, and one more wrong pick ends with a code box under "Round complete": `PTR-` and 13 characters, read one character at a time, "Round complete. Completion code ready." announced, focus on the heading, Copy code first (44 px, reached with Tab, copies the code). The code is exactly what `zsa-codes.js` gives for 9 items, 8, 8 and 9 first tries, 1 Show me and 2 hints on today's date. Pasted into `/check/`: Valid, Periodic Trends Practice, 1.1, today, 9 items, the same three first-try lines, 1 and 2. No code for the trend picker, `?trend=en`, `?q=` or Practice my misses; Practice again after a trend round gives one. |
| `?from=` (1.1.0) | PASS | Default link: the Periodic Trends (Periods) lesson. An https zornscience.org URL is used; with `?trend=ie&embed=1` the link is still set (hidden, `target=_top`) and the round is 6 ionization energy questions; with `?q=` too. Rejected (default kept, `?trend=` still works): another host, http, a look-alike host, www, another host with the URL in the query, a user name, a port, `javascript:`, a protocol-relative URL, a path and a non-URL. |
| Console and CSP | PASS | Every browser test fails on any console error or warning, page error or CSP violation. |

## Layout and accessibility
| Check | Status | Evidence |
|---|---|---|
| Fit | PASS | 360x640, 390x664, 1280x617 and 1366x657, three questions with the longest names and both kinds of step 2 wording, 11 states each (each step, wrong answers, both hints, Show me offered, question complete): the step's buttons, feedback and hint, and the Next button are on screen and the table is in view, without the student scrolling. The question strip is in view whenever a step starts and at "Question complete". |
| No sideways scrolling, 44 px targets | PASS | 320x568, 360x640, 390x664, 683x384, 768x1024, 1280x617, 1366x657 and 1920x960 in every state, and with Practice options open. |
| axe-core 4.14 | PASS | Zero violations at 1366x657 and 390x664 in 9 states each: start, wrong answer, hint, Show me offered, step 3, question complete, round summary (now with the completion code), practice options open, embed mode. Also on the summary with a code in the completion code test at both sizes, and on `/check/` with a PTR result. |
| Embed mode and network | PASS | `?embed=1` hides the back link line and footer, keeps the h1, sets links to `_top`, sends no message at the top level. Only local files with `?v=1.1.0`; no storage or cookies. |
| HTML and CSS validation (1.0.0) | PASS | W3C Nu checker (vnu-jar 26.10.12): no errors or warnings for `index.html` and `trends.css` (only the usual info notes about the CSP when reading from disk). |
| Text scans | PASS | No en or em dashes in any file (`tests/unit/static.test.js`); no charges in this activity. |
| Screenshots reviewed (1.0.0) | PASS | 390x664 and 1366x657 viewed by Claude. Fixes made from them: "No change" instead of "Stays about the same" so the three choices fit on phones, shorter step 2 question, shorter confusion and atomic-number messages and step 2 hint so feedback plus hint fit at 360x640 with the table in view. |
| Real screen readers, Firefox, Safari, school devices | NOT TESTED | Not available here. |
| Live URL, WordPress callout | NOT TESTED | After merging: https://activities.zornscience.org/periodic-trends/ |

## Spanish verification

`tests/unit/i18n.test.js` and `tests/e2e/i18n.spec.js` cover the shared module and Spanish interface, including dynamic views, hints, feedback, the progress line, accessible text and generated share links. The language toggle intentionally adds header controls. English questions, wording and completion codes are unchanged; the code version is now 1.2.
