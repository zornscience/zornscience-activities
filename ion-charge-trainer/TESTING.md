# Verification record
Version: 1.3.1
Date: 2026-10-15
Reviewer: Claude (integration review of ChatGPT's 1.0.0 package, then the 1.1.0 to 1.3.1 updates)

## 1.3.1 results (shared engine)
| Check | Status | Evidence |
|---|---|---|
| Behavior unchanged | PASS | `npm run parity` against 1.3.0 (origin/main): 21 scenarios, 6,687 compared states and 4,744 full-page screenshot pairs across both activities. The scenarios cover full seeded rounds with five answering styles at 1366x657, 390x664, 768x1024 and 320x568, Practice my misses, Practice options, embed mode, every item from the picker (19 elements) and step 4 turned off. The DOM, form state, focus, live region, scroll position, every element's box and computed style, and the screenshots matched in every state. Rounds, review fillers and answer order are also identical under the same random sequence. |
| Automated suite | PASS | `npm test`: 16 unit tests and 51 browser tests, the same suite that passed on 1.3.0 before the change (root TESTING.md). It covers science against an independent reference, every answer combination (541 plus 190), round rules (200 seeded rounds), the review queue against a model, keyboard and focus, axe-core 4.14 in 9 states at two sizes, layout fit, tap targets, embed mode, network and CSP. |
| axe-core | PASS (one known finding) | Zero violations in every audited state at 1366x657 and 390x664. The one exception is the known best-practice finding `page-has-heading-one` in embed mode (the header, h1 included, is hidden as chrome). It predates 1.3.1 and is recorded in README Known limitations. |
| Real screen readers, Firefox, Safari, school devices | NOT TESTED | Same as before. |

## 1.3.0 results (tap to check)
| Check | Status | Evidence |
|---|---|---|
| No Check button; tapping an answer checks it | PASS | Chlorine answered through all four steps by clicks only at eight screen sizes. |
| Arrow keys never submit | PASS | Five ArrowRight presses in step 1 moved focus only; no feedback, same step. |
| Wrong pick marked and locked | PASS | Marked with ✗, aria-disabled, named "(tried, not correct)"; pressing it again adds no attempt. |
| Two-part partial answer | PASS | Right direction with wrong count: direction stays picked, the wrong count is marked, the next count pick checks again. |
| Step 4 both parts wrong | PASS | Both messages shown together; both parts cleared and marked. |
| Keyboard-only round | PASS | 10 elements plus 1 review with Show me, hints, partial and full wrong answers; focus visible at every choice. |
| Fit, overflow, targets, axe, console, CSP, network | PASS | Same results as 1.2.0 (laptops largest bottom edge 450 px; 360x640 and 390x664 phones fit; zero axe violations in six states). |
| Answer routing and science | PASS | 541 plus 190 combinations unchanged; 19 elements match the reference. General wrong-answer text no longer repeats "Not yet". |
| Real screen readers, Firefox, Safari, school devices | NOT TESTED | Same as before. |

## 1.2.0 results (compact layout)
| Check | Status | Evidence |
|---|---|---|
| Fits without scrolling | PASS | All four steps and the summary keep the Check or Next button on screen with the table in view at 360x640, 390x664, 768x1024, 1280x617, 1366x657 and 1920x960 (largest bottom edge 450 px on laptops, 640 px on a 360x640 phone). |
| Very small phone | PARTIAL | At 320x568, steps 2 and 4 need about 100 to 160 px of scrolling. Nothing is cut off and there is no sideways scrolling. |
| 200% zoom | PASS for reflow | 683x384: no sideways scrolling; vertical scrolling is expected at this zoom. |
| Current element always highlighted | PASS | One cell marked in every state, read as "(this element)". Step 1 hint highlights the group column, read as "(hint)", and clears when the step ends. |
| Keyboard round | PASS | 10 elements plus 1 review with wrong answers, both hints, Show me and a step 4 mistake. Focus moves to each new step's first choice, to the summary heading, then to Next. Practice options opens with Enter. |
| Hint and feedback stay visible | PASS | On a 390x664 phone, the second hint's bottom edge lands at the screen edge after the automatic scroll. |
| Answer routing and science | PASS | 541 step 1 to 3 and 190 step 4 combinations unchanged; all 19 elements still match the reference. |
| axe, console, CSP, network, targets, validation | PASS | Zero axe violations in seven states, no console errors or CSP violations, local files only, no target under 44 px at 320 or 1366 px, Nu checker clean. |
| Embed mode | PASS | Host page does not scroll on load; resize messages arrive. Automatic scrolling is turned off in embed mode. |
| Real screen readers, Firefox, Safari, school devices | NOT TESTED | Same as before. |

## 1.1.0 results (step 4 and setting)
| Check | Status | Evidence |
|---|---|---|
| Existing content unchanged | PASS | Every 1.0.1 string and value compared field by field; 1.1.0 only adds step 4 fields. |
| Step 4 science | PASS | Correct noble gas comes from the electron count already checked against the `mendeleev` reference. Trap gas is the metal's own-period gas or the nonmetal's previous-period gas. |
| Step 4 routing | PASS | All 190 name and noble-gas combinations match an independent expectation (95 naming-rule, 34 trap-gas, 118 count messages). |
| Steps 1 to 3 routing | PASS | All 541 combinations still match. |
| Keyboard round with step 4 | PASS | 10 elements plus 1 review, including a wrong step 4 answer corrected by keyboard. Focus moves to the first name choice, then Tab reaches the noble-gas group. |
| Setting off | PASS | With step 4 cleared, a new round shows "Step 1 of 3" and the summary lists three steps. |
| Layout, targets, axe, console, CSP, network | PASS | Same suite as below, rerun on 1.1.0: no overflow at 320 to 1920 px or 200% zoom, no target under 44 px, zero axe violations in six states including a step 4 wrong answer, no console errors, no CSP violations, local files only. |
| HTML and CSS validation | PASS | Nu checker, no errors. |
| Real screen readers, Firefox, Safari, school devices | NOT TESTED | Same as 1.0.1. |

The sections below record the 1.0.1 review and still apply.

PASS means the check was run on version 1.0.1 and passed. NOT TESTED means it could not be run in Claude's workspace. Browser checks used Chromium 141 (Playwright) over a local web server. Version 1.0.0 was run through the same suite first; what it found is listed under "Fixed in 1.0.1".

## Files and code
| Check | Status | Evidence |
|---|---|---|
| Folder structure and file names | PASS | Matches the handoff tree, plus `shared/fonts/InterVariable.woff2` and `Inter-OFL.txt`. |
| Version consistent | PASS | 1.0.1 in README, meta tag, and all five asset query strings. |
| HTML standards validation | PASS | W3C Nu HTML Checker (vnu 24.10.17): no errors, no warnings. |
| CSS validation | PASS | Nu checker CSS mode: no errors in either stylesheet. |
| JavaScript syntax | PASS | `node --check` on all three files. |
| Browser console | PASS | No errors or warnings across all test runs. |
| CSP violations | PASS | Zero `securitypolicyviolation` events through a full round. |
| Network requests | PASS | Only the page, two stylesheets, three scripts, and the local font. No outside requests. |
| Globals, storage, cookies, forbidden APIs | PASS | Static scan: no `innerHTML`, inline styles, storage, cookies, `fetch`, XHR, or window assignments. |
| Size | PASS | Activity folder about 90 KB. Shared font about 100 KB. |
| No em dashes, Unicode minus for charges | PASS | Whole-package scan. |

## Science and logic
| Check | Status | Evidence |
|---|---|---|
| Independent reference comparison | PASS | All 19 elements checked against the `mendeleev` periodic table database: name, Z, group, period, valence, direction, electrons moved, charge, final electron count, noble gas, ion name, spoken label. Each charge is a listed oxidation state. |
| Text matches data | PASS | Summary arithmetic, step 3 hint, group hint, and shorter-path hint numbers checked for every element. |
| Reference periodic table | PASS | All 42 cells in the right group and period. |
| Misconception routing | PASS | All 541 answer choices across 19 elements match an independently written expectation. O:2, P:3, and Ba:6 route to the combined message. |
| Feedback after real clicks | PASS | Keyboard run showed period, sign, and number feedback and the reveal text on screen and in the live region. |
| Full round, hints, Show me, review repeat, summary, picker | PASS | Keyboard-only round of 10 plus 1 review item. Missed element came back as "Review 11 of 11". Summary counts and review list correct. Picker starts "Chosen element 1 of 1". |

## Layout and accessibility
| Check | Status | Evidence |
|---|---|---|
| 320, 360, 390, 768, 1366 x 768, 1920 widths | PASS | No horizontal scrolling at any width, periodic table open. Screenshots reviewed. |
| 200% zoom | PASS | 683 CSS px viewport (1366 at 200%): no horizontal scrolling. |
| 44 x 44 tap targets | PASS | Every visible button, choice label, select, and link measured at 320 and 1366. |
| Keyboard-only round | PASS | Tab, arrows, Space, and Enter only, including wrong answers, both hints, and Show me. |
| Visible focus | PASS | All 36 focus stops checked: outline at least 2px on the control or its visible label. |
| Focus management | PASS | New element heading, next step's first choice, summary heading, round summary heading. Focus kept on the Hint button after the last hint. |
| Automated accessibility audit | PASS | axe-core 4.10 (WCAG 2.2 AA plus best practices): zero violations in five states (start, wrong answer, hint with table, element summary, round summary). |
| Ion spoken text | PASS | Accessibility tree exposes only "nitride ion, 3 minus charge" style text. Visual symbol hidden. |
| Contrast in rendered states | PASS | axe color-contrast rule in all five states. Selected and focus colors 6.7:1 on white. |
| Reduced motion | PASS | Rule present. The activity has no transitions or animations to disable. |
| Real screen readers (NVDA, VoiceOver, ChromeVox) | NOT TESTED | Not available in the workspace. The live region and accessibility tree were checked instead. |
| Firefox and Safari | NOT TESTED | Only Chromium is available. Uses standard features only. |

## Integration
| Check | Status | Evidence |
|---|---|---|
| Standalone header, back link, footer | PASS | Back link points to the Predicting Charge lesson URL. |
| Embed mode at top level | PASS | `?embed=1` hides header and footer. Links target `_top`. No message sent. |
| Embed mode inside a zornscience.org page | PASS | Simulated host page: resize messages arrive only from the activity origin to https://zornscience.org, the frame grows when the table opens, and the host page does not scroll on load. |
| Inter font | PASS | Loaded from `shared/fonts/` at every width. |
| Live URL, WordPress callout, school devices | NOT TESTED | After hosting is set up. |

## Fixed in 1.0.1
- On first load, focus jumped to the element heading. That skipped the title and instructions for screen readers, and in embed mode it scrolled the host page down to the activity (1,036 px in the test).
- After the second hint, the Hint button became disabled and keyboard focus fell to the page body.
- Finished steps kept their Check and Hint buttons, which looked active.
- "Answer shown" used the green success style even though the student had not answered correctly.
- "has 1 valence electrons" (9 strings) and "a anion" (9 strings).
- Lithium's long-path feedback stated the answer on the first wrong try.
- Table rows were labeled "Row" instead of "Period", and the caption was "Group (column)". The current element was marked in the table before any hint.
- Footer text and link were misaligned. The body had an 8px default margin.
