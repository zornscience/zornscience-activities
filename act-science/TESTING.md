# Verification record
Version: 0.1.0
Date: 2026-10-16
Reviewer: Claude (built and tested 0.1.0)

PASS means the check was run on version 0.1.0 as committed and passed. Browser checks use Playwright 1.56 with Chromium.

| Check | Status | Evidence |
|---|---|---|
| Question bank shape | PASS | `tests/unit/act-science.test.js`: six skill tags with tips; every passage has a known type and status, 5 to 7 questions; every question has a known skill, difficulty 1 to 3, exactly 4 different choices, a valid answer index and an explanation that names no letter; only sub, sup, em and strong markup, balanced, with no HTML entities; table rows match their headers; chart series match the x values and fit the axis. The reviewed bank has every passage type. |
| Scoring config | PASS | Same file: 41 conversion entries from 1 to 36 that never go down, ranks for 9 to 36 that never go down, average 19.6, benchmark 23, and the refresh comment. |
| One passage | PASS | `tests/e2e/act-science.spec.js`: all correct gives N / N, 100%, "How this compares", no estimate, "Keep it sharp" and every review item marked Correct. |
| Mixed practice | PASS | One passage of each type; numbering runs 1 to 17 across passages; every choice is read as its letter and text, A to D on odd and F to J on even numbers; answers stay selected after Previous passage. Three blanks give the on-page alert, Keep working closes it, Score it anyway scores. All wrong gives 0 / 17 and "1 to 6"; all right gives "31 to 36", the 100th percentile and the benchmark line. Review tags count Missed and Blank. |
| Keyboard | PASS | Nothing focused on load; Tab and Enter start a set; focus lands on the passage heading; arrow keys choose an answer. |
| axe-core 4.14 | PASS | Zero violations (WCAG 2.0 to 2.2 A and AA plus best practices) on the start screen, all three passages, the blank warning and the score report, in light and dark mode, at 1366x657 and 390x664. |
| No sideways scrolling | PASS | Start screen, each passage and the score report at 320, 360, 400, 768, 1280 and 1920 px wide, and 683x329 (1366x657 at 200% zoom). |
| Network, storage, embed | PASS | Only local files load, including the bundled font; no storage or cookies after starting a set; `?embed=1` hides the home link, keeps the trademark footer, and links target `_top`. |
| Console and CSP | PASS | Every browser test fails on any console error or warning, page error or CSP violation. |
| House rules | PASS | `tests/unit/static.test.js` with the rest of the site (strict IIFE, no innerHTML or inline styles, one CSP, no en or em dashes, versions agree). |

## Not tested
Real screen readers, Firefox, Safari, Edge, Chromebooks and phones. Charts are small at phone width (the magnifier comes in milestone 3).
