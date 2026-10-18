# Verification record
Version: 1.0.0
Date: 2026-10-18
Reviewer: Claude (built and tested 1.0.0)

PASS means the check was run on version 1.0.0 as committed and passed. Browser checks use Playwright 1.56 with Chromium.

| Check | Status | Evidence |
|---|---|---|
| Handoff model checks | PASS | `tests/unit/stoichiometry-coach.test.js` ports the handoff's `test-model.mjs`: all 15 reaction and type combinations reach the target unit with the expected value, the correct answer passes, blank and negative answers fail, inverted factors and both distractors are rejected, and the significant figure examples. The handoff's own `node test-model.mjs` also passed on its `dist/` files. |
| Chemistry | PASS | Same file: every equation is balanced atom by atom, the coefficients used match the equation, and every molar mass equals the sum of IUPAC atomic weights (within 0.0006 g/mol). All 135 answers (5 reactions, 3 types, 9 values) are recomputed independently and pass at three significant figures, with no exponent in the shown answer. |
| Factor banks | PASS | Three choices for one-step problems and eight for grams to grams, in the fixed mixed order; no two choices alike; the wrong mole ratio is really wrong for every reaction. |
| Setup checking | PASS | Partial setups, a factor in the wrong place, the first failing step, both distractor messages, an unknown factor, and an empty setup. |
| Answers | PASS | `214`, `214.`, `2.14e2`, `2.14E2`, `2.14 x 10^2`, `2.14×10^2`, `2.14*10^2` accepted; blank, `abc`, `214 g`, `0x10` and `1,200` get the format message; `-214` and `0` the sign message; `214.4` and `215` the rounding message; `230` and `2.14` the recalculate message; `214.0`, `4.8` and `4.800` the significant figure message. Small answers (`0.0102`, `.0102`, `1.02e-2`, `1.02 x 10^-2`). |
| Questions, hints, solution | PASS | Question text for each type, both hints (the second names the next factor), the hint for a wrong setup and for a complete one, the solution steps. |
| Full solve | PASS | `tests/e2e/stoichiometry-coach.spec.js`: the default grams to grams problem with the equation, question, route and molar masses; each factor's spoken description and cancellation; used factors disabled; the full setup disables the bank and focuses the answer box; the answer (recomputed from the page's own masses and equation) is correct; the count rises once, not again on a second check, and again on the next problem. Every reaction and type played in the browser to a correct answer (15 solves). |
| Wrong factors | PASS | Inverted factor, wrong molar mass and wrong mole ratio, each with its message and "Does not fit"; Check my work reports a wrong setup instead of judging the number; Start over clears the setup and answer. |
| Reorder and remove | PASS | Arrows disabled at the ends; moving fixes and breaks the setup; removing re-enables the factor in the bank and brings back the empty slot. |
| Keyboard | PASS | Enter and Space add factors; focus moves to the next enabled bank factor, follows a moved factor (to the other arrow at the end), goes to the Remove button in the same place after a removal, and to the answer box when the setup is full; Enter in the answer box checks; the Tab order after Check my work; mode buttons and selects from the keyboard. Each change is announced in the live region. |
| Modes | PASS | Independent practice hides marks, messages and the hint button until Check my work, then marks the setup; an edit hides them again; switching modes keeps the problem and setup; `?mode=independent`. |
| Answer messages in the page | PASS | Blank, not a number, negative, wrong value and too many significant figures; typing hides the old result; scientific notation and `x 10^` accepted; the rounding message on a grams to moles problem. |
| Hints | PASS | Both hints, focus stays on the button, the hint hides after an edit, hints for the next step, a wrong setup and a complete setup. |
| Worked solution | PASS | Takes focus; heading, steps, the spoken setup, unrounded and final answers; solving afterwards gives the "solution visible" note and no count; a new reaction starts a problem that does count. |
| Settings and deep links | PASS | Changing type or reaction starts a new problem; New problem keeps focus and changes the value; `?type=` and `?reaction=`, with unknown values ignored; a reload starts the count at 0. |
| Layout | PASS | No sideways scrolling and every visible button, select and the answer box at least 44 by 44 px with a full setup and the solution open, at 320x568, 360x640, 390x664, 768x1024, 1280x617, 1366x657, 1920x960 and 683x329 (1366x657 at 200% zoom). |
| axe-core 4.14 | PASS | Zero violations (WCAG 2.0 to 2.2 A and AA plus best practices) at 1366x657 and 390x664 at the start, with a wrong factor, with a hint, after a wrong answer, with the solution, and in independent mode with the tip open. |
| Back link, embed, network, storage | PASS | The default back link is the 3-Step Conversions lesson; `?from=` accepted for a zornscience.org page and rejected for 8 other values; `?embed=1` hides the back link and footer, links target `_top`, and other parameters still apply; only local files load, each with `?v=1.0.0`; no storage or cookies. |
| Landing page | PASS | The landing page links to the activity. |
| Console and CSP | PASS | Every browser test fails on any console error or warning, page error or CSP violation. |
| House rules | PASS | `tests/unit/static.test.js` with the rest of the site (strict IIFE, no innerHTML or inline styles, one CSP, no en or em dashes, versions agree). |

## Not tested
Real screen readers (NVDA, VoiceOver, ChromeVox), Firefox, Safari, Chromebooks and phones, and the live site.
