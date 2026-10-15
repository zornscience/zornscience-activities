# Verification record
Version: 1.0.0
Date: 2026-10-15
Reviewer: Claude (built and tested 1.0.0)

PASS means the check was run on version 1.0.0 as committed and passed. PARTIAL and NOT TESTED are explained in the row. Browser checks used Playwright 1.56 with the preinstalled Chromium over a local web server (`python3 -m http.server`). The test scripts were written for this review and are not part of the package, matching the Ion Charge Trainer.

## Science and logic
| Check | Status | Evidence |
|---|---|---|
| Independent science check | PASS | A separate script, written from the task statement without reusing any activity code, lists the 18 ions, finds each formula from the least common multiple of the two charges (gcd based), and builds the names and the three wrong names by its own rules. It then parses the explicit table in `data.js` line by line. All 80 compounds match on name, formula, parts, subscripts, unreduced criss-cross, prefix name, element name and reversed name, plus ion charges, groups and element names: 1,201 comparisons, 0 mismatches. Every stored formula has total charge 0 and subscripts in lowest terms. Exactly 10 are reduced from the criss-cross: MgO, MgS, CaO, CaS, SrO, SrS, BaO, BaS, AlN, AlP. |
| Every answer combination | PASS | 2,480 combinations (80 compounds: 9 charge pairs in each direction, 9 subscript pairs, 4 names) clicked in the real page and compared with an independently written expectation: right or wrong, which feedback rule (checked by its wording and, for subscripts, the exact charge sum such as "(+2) + (−1) = +1, not 0" or the ratio "2 : 2 is the same ratio as 1 : 1"), which parts were cleared and which stayed picked. 0 failures. Counts: 320 correct, 300 subscript-as-charge (170 with the missing-subscript note), 60 not reduced, 50 one of each, 50 swapped, 480 other sums, 80 each of prefix, no -ide and reversed, the rest group messages. The group rule appears exactly once when both charges are wrong. |
| Round composition | PASS | 500 rounds played in the page: every round had 10 different compounds, 6 name to formula and 4 formula to name, at least 3 with equal charges, at least 2 with Al, and at least 2 reducing compounds asked name to formula. 192 different direction orders. All 160 compound and direction pairs appeared. |
| Locking and partial answers | PASS | A wrong pick is marked ✗, aria-disabled, read as "(tried, not correct)", and pressing it again adds no attempt. Right metal charge with wrong nonmetal charge: the metal stays picked and only the nonmetal clears. Show me appears after the second wrong attempt. |
| Live formula building | PASS | After picking 2 aluminum ions the box shows "Al2O?" with "2(+3) + ?(−2)"; after a wrong pair it keeps the tried formula and its sum, such as "Ca2O2" with "2(+2) + 2(−2) = 0", until the next pick. |
| Charges above group columns | PASS | Shown only after the charges step (for Al2O3: 3+ over group 13 and 2− over group 16), read as "ion charge 3+". The reserved line keeps the table height fixed. |
| Review, summary, Practice my misses, picker | PASS | A compound revealed with Show me came back as "Review 11 of 11". First-try counts per step type were correct and the missed compound was listed under Keep practicing. Practice my misses started 10 compounds, all with the same pair of charges as the miss, the miss included. Choose a compound started "Chosen compound 1 of 1" in the chosen direction. |
| Rendered text | PASS | Every hint, explanation, summary, live announcement and table text for all 80 compounds in both directions (1,120 texts): no hyphen-minus used as a charge, no en or em dashes, no formula written with a subscript of 1. |

## Layout
| Check | Status | Evidence |
|---|---|---|
| Fit targets | PASS | 25 states each (first load; for Sr3P2 and Al2O3 and CaO name to formula and Ba3P2 formula to name: step 1, wrong answer, hint, step 2, wrong answer, compound complete). At 360x640, 390x664, 1280x617 and 1366x657 (also 768x1024 and 1920x960) every state keeps the step's buttons, the feedback or hint, and the Next button on screen with the compound strip and table in view, without the student scrolling. Laptops: lowest button edge 410 px. 360x640: 598 px. 390x664: 616 px. |
| Very small phone | PARTIAL | 320x568 is not a target. Step 2 needs up to about 110 px of scrolling; after feedback the automatic scroll keeps the feedback in view but the compound and table move above the screen. No sideways scrolling. |
| No horizontal scroll | PASS | 320, 360, 390, 768, 1280, 1366 and 1920 widths in all states, and 200% zoom (683x328 and 640x308, the laptop targets at 200%) in 8 states each. |
| Tap targets | PASS | No visible button, link, select or summary under 44x44 px in any state at any measured size. At 360 px the paired charge buttons are 44.7 px wide (a 43.7 px result in an earlier build was fixed). |
| Screenshots reviewed | PASS | 390x664 and 1366x657 viewed in every state. Fixes made from them: Inter's tailed l and serifed I (Al read as AI), one-line compound strip at 360 px, shorter step 1 explanations, redundant "= 0" in the summary sentence, picker button width on phones. |

## Accessibility and keyboard
| Check | Status | Evidence |
|---|---|---|
| Keyboard-only round | PASS | Tab, Shift+Tab, arrows, Home, Enter and Space only: 10 compounds plus 1 review, with wrong picks in both directions, both hints, Show me, a wrong subscript or name, then Practice my misses, Practice options opened with Enter, and a compound and direction chosen with the selects. |
| Arrows never submit | PASS | 75 arrow and Home presses; the answer state (step, feedback, tried and picked buttons, live region) was identical before and after every press. |
| Focus | PASS | 82 focus stops: every one had a visible outline of at least 2 px. No focus move on first load. New compound focuses its heading, a finished step focuses the next step's first choice, the last step focuses "Compound complete", the end focuses "Round complete". Hint keeps focus after the last hint (aria-disabled). |
| axe-core 4.14 | PASS | WCAG 2.0, 2.1 and 2.2 A and AA plus best practices: 0 violations in 10 states at both 1366x657 and 390x664 (start, wrong charges, hint with highlighted columns, partial build with column charges, wrong subscripts, compound complete, name shown after two wrong, round summary, options open, embed mode). |
| Spoken formulas | PASS | Visible formulas are aria-hidden; the hidden text reads "Mg 3 N 2" in the formula-to-name heading (no name before the name step), "Al 2 O 3, aluminum oxide" in the answer trail, and charge sums as "2 times plus 3, plus 3 times minus 2, equals 0". Live region announcements use the spoken versions. |
| Reduced motion | PASS | Shared rule present. The activity has no animations or transitions, and its scrolling is instant. |
| Real screen readers (NVDA, VoiceOver, ChromeVox) | NOT TESTED | Not available in the workspace. The accessibility tree text and the live region were checked instead. |
| Firefox, Safari, school devices | NOT TESTED | Only Chromium is available. Standard features only. |

## Files, security and integration
| Check | Status | Evidence |
|---|---|---|
| HTML validation | PASS | W3C Nu checker (vnu-jar 26.10.12): no errors and no warnings for `ionic-formula-builder/index.html` and the root `index.html`. The checker refuses local hosts, so it read the files from disk; it then adds info-level notes that the CSP blocks the stylesheets and scripts, because `'self'` cannot match a `file:` URL. The existing root page gets the same notes. Over http the browser loads everything with zero CSP violations (below). |
| CSS validation | PASS | Nu checker CSS mode: no messages for `builder.css`. |
| JavaScript syntax | PASS | `node --check` on builder.js, data.js and tools/build-data.js. |
| Console | PASS | No errors or warnings in any test run. |
| CSP | PASS | Same CSP meta tag as the Ion Charge Trainer. Zero `securitypolicyviolation` events through the keyboard round. No inline scripts, inline styles or style attributes. |
| Network | PASS | Only the page, two stylesheets, three scripts and the local font, all with version query strings. No outside requests. |
| Static scan | PASS | No innerHTML, storage, cookies, fetch, XHR, eval or window globals. Only outside URLs are the lesson and license links. No em dashes or en dashes in any file, and no hyphen-minus used as a negative charge. |
| Embed mode in a host page | PASS | Simulated https://zornscience.org page framing https://activities.zornscience.org (both served from the local files): the host page does not scroll on load, `zsa:resize` messages arrive with activity "ionic-formula-builder", the frame grows when Practice options opens, the back link line and footer are hidden, links target `_top`, and the h1 stays as a visually hidden heading. |
| Embed mode at top level | PASS | `?embed=1`: chrome hidden, links target `_top`, no message sent. |
| Version consistent | PASS | 1.0.0 in README, meta tag and all five asset query strings. |
| Size | PASS | Activity folder about 95 KB including docs and the build script. |
| Root landing page card | PASS | Same markup as the Ion Charge Trainer card; validated with the root page. |
| Live URL, WordPress callout | NOT TESTED | After merging and publishing: https://activities.zornscience.org/ionic-formula-builder/ |
