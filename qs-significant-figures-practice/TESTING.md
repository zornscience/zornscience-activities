# Significant Figures Practice testing

Version: 1.0.0

## Generators (Node)

`tests/unit/qs-significant-figures-practice.test.js` runs each of the eleven generators on 300 random problems and checks them against `tests/support/qs-reference.js`, written from the lesson rules without the activity's code. The reference counts significant figures from the written number, rounds half up digit by digit on strings, does decimal arithmetic on scaled integers and divides by long division.

- Counting (`cd`, `cw`, `cs`, `cc`): the count equals the reference; the prompt shows the number as students see it (with commas from 10,000); the right reason appears in the explanation; "3 sig figs" and "3 cifras significativas" are accepted; one more is wrong; exactly one choice has the asked count.
- Rounding (`rs`, `rl`, `rh`): the answer equals the reference in standard notation, or in scientific notation when the zeros at the end must count; scientific notation is always accepted; one figure too many is marked incorrect; a plain whole number that hides its figures gets the trailing-zeros note; a value cut off instead of rounded up gets the "5 or more" note; `rh` always drops a 4 or a 5.
- Multiplying and dividing (`mu`, `dv`): the answer keeps the fewest figures of the two measurements and shows them in standard notation; scientific notation with the unit is accepted; a wrong unit, one figure too many and the unrounded product are not.
- Adding and subtracting (`ad`, `sb`): the answer keeps the fewest decimal places; the terms always differ in decimal places; the difference is positive; an extra decimal place and the unrounded sum are not accepted.
- Every question (`tests/support/qs-checks.js`): English and Spanish are present, have the same numbers, no en or em dashes, no unfilled placeholders and only sub and sup markup; the activity's own answer is judged correct; a wild guess is not.
- Sets: 8 questions per skill and 12 mixed (three per skill), never repeating, over 50 sets.

The shared reader and judge have their own tests in `tests/unit/practice-engine.test.js` (5,000 rounding comparisons including exact ties, 3,000 quotients, every accepted input form, units, notation, traps and the half-up tie 9.5 to 10).

## Browser

`tests/e2e/qs-practice.spec.js` plays this activity in English and Spanish: a full mixed set with the activity's own answers, feedback and explanations, the results by topic, Try again with new questions, then wrong answers and the review list. It also checks keyboard-only play (Tab, arrow keys, Enter and Space, with a visible focus outline), axe-core at 1366 and 320 px in the setup, question, feedback and results states, no sideways scrolling, no English left on the Spanish page, typed forms end to end (scientific notation, units, the comma and power messages), the validated lesson backlink, and no requests outside the site.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices.
