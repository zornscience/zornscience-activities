# Verification record
Version: 1.0.0
Date: 2026-10-18
Reviewer: Claude (built and tested 1.0.0)

PASS means the check was run on version 1.0.0 as committed and passed. Browser checks use Playwright with Chromium.

| Check | Status | Evidence |
|---|---|---|
| Balanced equations | PASS | `tests/unit/limiting-reactant.test.js`: each molecule has the right atoms, each reaction has the same atoms on both sides, and molecules per mole is the least common multiple of the reactant coefficients. |
| Every starting amount | PASS | All 4 reactions × 11 × 11 amounts (484): moles of reaction, the limiting reactant (or both, or none), the product and the excess against an independent mole calculation; whole, non-negative molecules and the same atoms after every reaction; no reaction possible at the end. |
| Table and numbers | PASS | Before, change and after for the default and for ammonia (thirds as 0.33 and 4.67); whole numbers bare, the minus sign, no −0. |
| Explanations | PASS | Result, ratio and stop text for an excess, a limiting second reactant, the exact ratio, a missing reactant and an empty box; the box description; set and set up text. |
| Predictions | PASS | Right and wrong picks and amounts, no prediction, a typed word, 1% tolerance (4.67, 4.7 and "4.67 mol" for 14/3 mol; not 5). |
| Questions | PASS | One right answer each, feedback for every choice and for blanks; the numbers each question relies on hold in the model. |
| Defaults in the page | PASS | `tests/e2e/limiting-reactant.spec.js`: the menu, equation, amounts, scale note, predictions, status, box description, table, legend and explanation placeholder. |
| React all | PASS | On a fake clock: Reacting, predictions locked, 2 of 6 reactions after 1.1 s with the table to match, then stopped with the result, the announcement (with both predictions checked), limiting and excess tags, the highlighted excess, the stranded description and disabled buttons; Start over keeps and unlocks the predictions. |
| React once and Pause | PASS | One reaction announced and shown in the table and the explanation's progress; Pause announces and starts no new reactions; finishing by React once; wrong predictions explained. |
| Set up | PASS | The + button (predictions cleared, settled announcement), the end of the range (aria-disabled, focus kept), typed values out of range or not whole go back, the reaction menu relabels everything (ammonia at 1/3 mol). |
| Reduced motion | PASS | React once and React all happen at once (ammonia 3 and 7: 4.67 mol NH₃, 0.67 mol N₂ excess). |
| Exact ratio and missing reactant | PASS | H₂ + Cl₂ 4 and 4: both limiting, nothing highlighted, the prediction "both" right; CO 0: no reaction; an empty box. |
| One animation loop | PASS | 24 rapid button presses, then at most 70 animation callbacks in 1 s. |
| Questions in the page | PASS | Blank, wrong and right answers with numbered feedback, check marks and announcements. |
| Printing | PASS | Print media shows the summary line, a 30-line reflection in full, the box and the table, and hides the controls; Print calls the print dialog. |
| Layout | PASS | After a finished reaction and checked answers: no sideways scrolling, every visible button, field, select and radio label at least 44 px, at 320x568, 360x640, 390x664, 768x1024, 1024x768, 1280x617, 1366x657, 1920x960 and 683x329 (1366x657 at 200% zoom). |
| axe-core | PASS | Zero violations (WCAG 2.0 to 2.2 A and AA plus best practices) at 1366x657 before reacting and after a finished reaction with checked answers, and at 390x664. |
| Deep links, back link, embed, network, storage | PASS | All parameters; unknown reactions and bad amounts ignored; the default back link; `?from=` accepted for a zornscience.org page and rejected for 8 other values; `?embed=1` hides the back link and footer; only local files load, each with `?v=1.0.0`; no storage or cookies. |
| Landing page | PASS | The landing page links to the visualizer. |
| Console and CSP | PASS | Every browser test fails on any console error or warning, page error or CSP violation. |
| House rules | PASS | `tests/unit/static.test.js` with the rest of the site. |
| Visual check | PASS | Screenshots at 1366 and 390 px of the default during and after React all, and of ammonia 2 and 5 after it stopped, reviewed by eye: molecules, labels, the stranded ring, the product grid and the table. |

## Not tested
Real screen readers (NVDA, VoiceOver, ChromeVox), Firefox, Safari, Chromebooks and phones (frame rate on slow devices included), printing to paper (print media was emulated), and the live site.
