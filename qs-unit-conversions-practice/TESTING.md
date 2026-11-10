# Unit Conversions Practice testing

Version: 1.0.1

## Generators (Node)

`tests/unit/qs-unit-conversions-practice.test.js` runs each of the nine generators on 300 random problems and checks them against `tests/support/qs-reference-units.js`, which types the exact equalities again, converts on decimal strings (long division for 2.54 and 60) and reads every written setup with its own unit algebra, without the activity's code.

- Conversion factors (`fe`, `fl`, `f1`): the key factor, used in a setup, gives the new unit and the reference amount, and no wrong factor does; the upside-down setup gives a squared unit (s²/min); the stated result equals the reference; the first skill never uses inches, and its Spanish text never contains "in".
- Setting up and converting (`st`, `cm`, `cd`): the key setup cancels to the new unit with the right amount and the three wrong setups do not (one divides by the factor); the answer is the reference rounded to the measurement's figures and shows them in standard notation; scientific notation and English and Spanish unit names are accepted and the starting unit is not; the upside-down factor and the factor-limited rounding get their notes; calculator digits count, with a note.
- Exact factors (`es`, `em`, `ew`): calculator digits are incorrect here, with "Round to n significant figures"; every factor-limited rounding gets the exact-equality note; the instruction has no count; the key rounding is the reference and no wrong choice is the same value with the same figures; only the measurement limits significant figures.
- The lesson's worked examples and quiz answers (3.25 min, 6.00 in, 38.1 cm, 4.25 h, 2.75 h with 200 as the trap, 19.0 cm, 245 s, 150 s, the 5.0 ft setup) come out as the lesson gives them.
- Every question (`tests/support/qs-checks.js`): English and Spanish are present, have the same numbers, no en or em dashes, no unfilled placeholders and only sub and sup markup; the activity's own answer is judged correct; a wild guess is not.
- Sets: 8 questions per skill and 12 mixed (four per skill), never repeating, over 50 sets.

## Browser

`tests/e2e/qs-practice.spec.js` plays this activity in English and Spanish: a full mixed set with the activity's own answers, feedback and explanations, the results by topic, Try again with new questions, then wrong answers and the review list. It also checks keyboard-only play with a visible focus outline, axe-core at 1366 and 320 px in every state, no sideways scrolling, no English left on the Spanish page, the validated lesson backlink, and no requests outside the site.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices.
