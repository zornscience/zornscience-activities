# Stoichiometry Coach
Version: 1.0.1

Practice for stoichiometry with dimensional analysis. Students read a problem, build a conversion setup from a bank of conversion factors (some with errors), watch the units cancel, then calculate and check a three significant figure answer. Guided practice gives feedback after each step; independent practice waits until the student checks.

## Assumptions and departures
- Ported from the Stoichiometry Coach handoff (a standalone HTML, CSS and ES module build). The features, reactions, molar masses, factor bank, feedback, hints, worked solution and solved count rules are kept. The page was rebuilt on the house conventions: plain JavaScript in strict IIFEs, classic deferred scripts, no globals, every element built with `createElement` and `textContent` (no `innerHTML`), the shared Content Security Policy, the shared tokens and Inter font from `shared/zsa-base.css` (the handoff's Google Fonts and its own colors are gone), embed mode, and no storage, cookies or outside requests. Nothing in `shared/` changed.
- Not an engine activity, and no completion code: the handoff has a session solved count, not a round. A code could be added later by registering the activity in `shared/zsa-codes.js`.
- Changes from the handoff, all found in review or browser testing:
  - Keyboard focus is kept after every change. Adding a factor moves focus to the next factor still in the bank, or to the answer box once the setup is full. Moving a factor keeps focus on its arrow (or the other arrow at the end of the setup). Removing one moves focus to the Remove button in the same place. The handoff redrew the setup and bank, so focus fell back to the page.
  - One polite live region announces each change ("Added 1 mol N₂ per 28.014 g N₂. Your setup has 1 of 3 factors.", plus the guided feedback), the result of Check my work, hints and new problems. Each factor in the setup has a spoken description ("Factor 1: 1 mol N₂ per 28.014 g N₂. Fits: g N₂ cancels."), so unit cancellation is not shown by the strike-through alone; good and bad factors also get a ✓ or ✗ and a solid or dashed border, not only a color.
  - The wrong mole ratio feedback said the numbers came from subscripts, but the distractor's numbers are not subscripts. It now says "Check the numbers in the mole ratio. They come from the coefficients in the balanced equation, not from the subscripts in a formula."
  - Answers: `1.20 x 10^2`, `1.20×10^2` and `1.20*10^2` are accepted as well as `1.20e2`. Input that is not a number (such as `0x10`, which JavaScript's `Number` reads as 16, or `214 g`) now gets "Enter a number, such as 4.80 or 1.20e2..." instead of a misleading significant figure message. A blank box and a negative or zero answer get their own messages.
  - Check my work with an empty setup says to build the setup first.
  - The worked solution takes focus when it opens, so screen readers read it.
  - On narrow screens the molar masses and tips move below the work, so the problem comes right after the settings.
- Built and browser-tested in Chromium by Claude. Real screen readers, Firefox, Safari and school devices remain untested. See TESTING.md.

## Purpose
Lessons that link here: Chemistry Unit 6 (Stoichiometry) 3-Step Conversions, Mole Ratios and 1-Step Conversions, and AP Chemistry 4.5 Stoichiometry.

## Installation and local use
From the repository root run `npm run serve` (or `python3 -m http.server 8000`) and open `http://localhost:8000/stoichiometry-coach/`. No build step or dependencies. Keep `shared/` beside `stoichiometry-coach/`.

Live URL after merging: https://activities.zornscience.org/stoichiometry-coach/

Embed mode (`?embed=1`) hides the back link line and the footer and sends `{type: "zsa:resize", activity: "stoichiometry-coach", height}` to `https://zornscience.org` when framed.

## Links and deep links
| Parameter | Effect |
|---|---|
| `?type=gg` | Problem type: `gm` (grams to moles), `mm` (moles to moles) or `gg` (grams to grams, the default). |
| `?reaction=h2o` | Reaction: `h2o`, `nh3`, `kclo3`, `caco3` or `al2o3`. |
| `?mode=independent` | Opens in independent practice. |
| `?from=<url>` | Sets "Back to the lesson". Accepted only for `https://zornscience.org/` pages (no other host, http, port or user name), as in the Gas Laws and KMT Lab. The default is https://zornscience.org/science/chemistry/unit-6-stoichiometry/3-step-conversions/ |
| `?embed=1` | Embed mode. |

Unknown values are ignored. Parameters combine, for example `?type=mm&reaction=nh3&from=...`.

## Lesson callouts
Heading: **Practice with the Stoichiometry Coach**

Text: Build the conversion factors yourself, watch the units cancel, and check your answer to three significant figures.

Button: **Open the Stoichiometry Coach**

Suggested links (add `&from=` with the lesson's own URL):
- Chemistry, 3-Step Conversions: https://activities.zornscience.org/stoichiometry-coach/?type=gg
- Chemistry, Mole Ratios: https://activities.zornscience.org/stoichiometry-coach/?type=mm
- Chemistry, 1-Step Conversions: https://activities.zornscience.org/stoichiometry-coach/?type=gm
- AP Chemistry, 4.5 Stoichiometry: https://activities.zornscience.org/stoichiometry-coach/?type=gg&mode=independent

## How it works
- **Problem types.** Grams to moles (one factor: the molar mass), moles to moles (one factor: the mole ratio) and grams to grams (three factors: molar mass, mole ratio, molar mass).
- **Reactions.** Five balanced equations, each with one reactant and one product used in the problems:

| Reaction | From | To | Coefficients | Molar masses (g/mol) |
|---|---|---|---|---|
| 2 H₂ + O₂ → 2 H₂O | H₂ | H₂O | 2 : 2 | 2.016, 18.015 |
| N₂ + 3 H₂ → 2 NH₃ | N₂ | NH₃ | 1 : 2 | 28.014, 17.031 |
| 2 KClO₃ → 2 KCl + 3 O₂ | KClO₃ | O₂ | 2 : 3 | 122.548, 31.998 |
| CaCO₃ → CaO + CO₂ | CaCO₃ | CO₂ | 1 : 1 | 100.086, 44.009 |
| 4 Al + 3 O₂ → 2 Al₂O₃ | Al | Al₂O₃ | 4 : 2 | 26.982, 101.961 |

- **Starting values.** One of 1.25, 2.40, 3.60, 4.50, 6.25, 8.40, 12.5, 15.0 or 24.0 (g or mol), each with three significant figures. New problem and Next problem pick a different value from the one on screen. Every answer is between 0.0102 and 214 and is shown without an exponent.
- **Factor bank.** Grams to grams shows eight factors: the three correct ones, each one upside down, the product's molar mass under the reactant's grams (units cancel, number wrong), and a wrong mole ratio (coefficient + 1 over coefficient + 2). One-step problems show their correct factor, its inverse and the matching distractor. The order is fixed and mixes right and wrong factors. A factor already in the setup, and every factor once the setup is full, is disabled.
- **The setup.** Factors are added in order, moved left or right with the arrows, or removed with ×. Start over clears the setup and the answer. The setup is checked from the start: each factor's denominator must be the unit the student has (the substance must match too), and the two distractors are caught even though their units cancel. Checking stops at the first factor that does not fit.
- **Guided practice.** After each change: the cancelled units are struck through, factors that fit get a ✓ and those that do not a ✗, and a message explains the next step or the error. Need a hint? gives the next step; a second hint on the same problem also names the next factor.
- **Independent practice.** No marks, messages or hint button until Check my work; then the setup is marked as in guided practice. Any change to the setup hides those marks again. Switching modes keeps the problem, the setup and the answer.
- **Answers.** Entered as a number, with or without scientific notation (`1.20e2`, `1.20E-2`, `1.20 x 10^2`, `1.20×10^-2`). The answer must equal the exact result rounded to three significant figures, and have three significant figures as typed (trailing zeros in a whole number without a decimal point do not count, so `120` has 2 and `120.` has 3). A value within 0.5% that is not rounded to three figures gets the rounding message; a farther value gets the recalculate message.
- **Worked solution.** The full setup, the steps in words, the unrounded and the final answer. A problem solved after the solution was shown does not count.
- **Solved count.** One per problem, the first time Check my work finds it correct, unless the worked solution was shown first. It lives in the page only: a reload starts at 0. Changing the problem type or reaction starts a new problem.

## Scientific assumptions
Complete reaction, the other reactants in excess, and the supplied molar masses. No limiting reactants or percent yield. Balanced coefficients are exact. Molar masses are IUPAC standard atomic weights (H 1.008, C 12.011, N 14.007, O 15.999, Al 26.982, Cl 35.453, K 39.098, Ca 40.078) summed and rounded to three decimal places; the page tells students to use them so periodic table rounding does not change the third figure. Feedback checks the one shortest conversion path.

## Decisions for the teacher to confirm
- **Cl = 35.453** for KClO₃ (122.548 g/mol), as in the handoff. The current IUPAC abridged value, 35.45, gives 122.545. The three significant figure answers agree for every problem except one: 15.0 g KClO₃ to grams of O₂ is 5.87 g with 122.548 and 5.88 g with 122.545. A student who uses 122.545 there gets the "close, round to three significant figures" message, and the page says to use the supplied molar masses. Changing it is one number in `model.js` (and the unit test that rebuilds it from atomic weights).
- **Wrong mole ratio distractor**: coefficient + 1 over coefficient + 2 (for example 3 mol H₂O / 4 mol H₂). It is not a subscript ratio, and the feedback says where the numbers should come from.
- **No completion code** for now.

## Files
| File | What it holds |
|---|---|
| `index.html` | Page shell: settings, reference, the three work panels and the live region. |
| `model.js` | Reactions, molar masses, problems, factors, the unit check, answer parsing, significant figures and every feedback message. No page code. |
| `coach.js` | The page: rendering the setup and bank, focus, modes, checking, hints, solution, solved count, deep links. |
| `coach.css` | Layout and components, prefixed `zsa-sc-`. |

## Keyboard and screen readers
- Every control is a native button, select or text box. Mode buttons use `aria-pressed`. The bank is a labeled group; each factor button is named by the factor in words, then "Add factor" or "In your setup".
- The setup is a labeled list. Its fractions are hidden from screen readers and replaced by a spoken description of each factor and whether it fits. Arrow and × buttons are named "Move factor 2 left", "Remove factor 2" and so on.
- Enter in the answer box checks the work. Focus never jumps away on a change (see Assumptions).

## Layout
- 900 px and wider: settings and reference in a 280 px column, the work beside them.
- Narrower: one column, settings first, then the problem, setup and answer, then the molar masses and tips.
- No sideways scrolling from 320 px, and every button, select and the answer box is at least 44 px.

## Changelog
- 1.0.0: first version in the repository, ported from the handoff build with the changes above.
