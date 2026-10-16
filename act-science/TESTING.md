# Verification record
Version: 0.2.0
Date: 2026-10-16
Reviewer: Claude (built and tested 0.2.0)

PASS means the check was run on version 0.2.0 as committed and passed. Browser checks use Playwright 1.56 with Chromium.

| Check | Status | Evidence |
|---|---|---|
| Question bank shape | PASS | `tests/unit/act-science.test.js`: six skill tags with tips; every passage has a known type and status, 5 to 7 questions; every question has a known skill, difficulty 1 to 3, exactly 4 different choices, a valid answer index and an explanation that names no letter; only sub, sup, em and strong markup, balanced, with no HTML entities; table rows match their headers; chart series match the x values and fit the axis. The reviewed bank has every passage type. |
| Scoring config | PASS | Same file: 41 conversion entries from 1 to 36 that never go down, ranks for 9 to 36 that never go down, average 19.6, benchmark 23, and the refresh comment. |
| One passage | PASS | `tests/e2e/act-science.spec.js`: directions, then a count-up clock; Previous is disabled on question 1; every question is played with Next and each choice is read as its letter and text (A to D odd, F to J even); Next becomes Review on the last question; the review counts; no blank reminder when all are answered; the score report shows N / N, 100%, "How this compares" and no estimate; the bottom bar is gone. |
| Mixed practice | PASS | One passage of each type; numbering runs across passages; the navigator opens a question in a later passage, and Previous crosses back into the earlier passage with its answer still selected; a flag shows in the navigator's name ("Question 2, answered, flagged") and on the question after leaving it; the review screen counts answered, not answered and flagged, and its Flagged list opens the question; unflagging updates the review; No, keep working cancels; Return to questions goes back. All wrong gives 0 / 17 and "1 to 6"; all right gives "31 to 36" and the 100th percentile. With blanks, the review lists them and the end confirmation reminds about guessing, and the report tags them Blank. |
| Timer | PASS | With `page.clock`: mixed practice starts at 17:00; Hide timer shows "Timer hidden" and Show timer brings it back; no notice 2 seconds before 5:00 left, the alert one second after, OK dismisses it, and it never repeats; with the Directions dialog open, the section ends at 0:00, the dialog closes, the report says time is up and shows "Time 17:00". One passage counts up to 30:05 without ending or warning. |
| Directions dialog | PASS | Opens from the top bar with focus on Close; Escape and Close both return focus to Directions. |
| Keyboard | PASS | Nothing focused on load; Tab and Enter choose a mode; Back, then Start the section; focus lands on "Question 1 of 17"; arrow keys choose an answer; Next keeps focus; Shift+Tab from Next reaches the current number (one Tab stop, `aria-current`); arrow keys, End and Home move within the navigator; Enter opens the question with focus on its heading; exactly one number is in the Tab order. |
| axe-core 4.14 | PASS | Zero violations (WCAG 2.0 to 2.2 A and AA plus best practices) on the start screen, the directions, a flagged and answered question, the 5-minute notice, the Directions dialog, the review screen with the end confirmation, and the score report, in light and dark mode, at 1366x657 and 390x664. |
| Layout | PASS | No sideways scrolling on the start screen, directions, first and last question, review and score report at 320, 360, 400, 768, 1280, 1366 and 1920 px wide, and 683x329 (1366x657 at 200% zoom). Every bottom bar button is at least 44 by 44 px and the bar sits at the bottom of the viewport. From 1280 px the passage pane scrolls on its own. |
| Network, storage, embed | PASS | Only local files load, including the bundled font; no storage or cookies after starting a set; `?embed=1` hides the home link, keeps the trademark footer, and links target `_top`. |
| Console and CSP | PASS | Every browser test fails on any console error or warning, page error or CSP violation. |
| House rules | PASS | `tests/unit/static.test.js` with the rest of the site (strict IIFE, no innerHTML or inline styles, one CSP, no en or em dashes, versions agree). |

## Not tested
Real screen readers, Firefox, Safari, Edge, Chromebooks and phones. Charts are small at phone width (the magnifier comes in milestone 3).
