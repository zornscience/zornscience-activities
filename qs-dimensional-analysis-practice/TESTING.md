# Dimensional Analysis Practice testing

Version: 1.0.1

## Generators (Node)

`tests/unit/qs-dimensional-analysis-practice.test.js` runs each of the nine generators on 300 random problems and checks them against `tests/support/qs-reference-units.js`. The test types every problem's total multiplier again from the exact equalities, squared and cubed by hand (m³ to L is × 1,000,000 ÷ 1000), converts on decimal strings and reads every written setup with its own unit algebra, without the activity's code.

- Chains, rates and powers (`ct`, `cl`, `sp`, `fd`, `sq`, `cu`, `dc`): the answer is the reference rounded to the measurement's figures; it is in scientific notation exactly when the lesson's rule says so (below 0.001, above 99,999, or zeros at the end that would be unclear); scientific and standard notation, ^3 and names in both languages are accepted, and the starting unit is not; calculator digits count, with a note; the explanation's setup cancels to the goal unit with the reference amount; chains show the path, rates say which unit goes on top, powers state the squared or cubed equality.
- Known mistakes: a step left out of a chain ("follow the path to the end"), one part of a rate left out, a squared or cubed factor whose number was not squared or cubed, a single power factor upside down, and the whole chain upside down are all incorrect, most with their own notes.
- Units of the result (`ur`, `uk`): the key unit is typed again for each kind of expression and agrees with the unit algebra of the shown expression, and no wrong choice does; the key two-factor setup cancels to the goal with the reference amount, and the three flipped setups do not cancel.
- The lesson's worked examples and quiz answers (1.5 h, 90.0 km/h, 0.355 L, 8.02 d, 343 m/s, 2.70 g/cm³, 2.50 d, 15.0 m/s, 0.75 m³, m ÷ m/s) come out as the lesson gives them, and 3600 min for 2.50 d gets the trailing-zeros note.
- Every question (`tests/support/qs-checks.js`): English and Spanish are present, have the same numbers, no en or em dashes, no unfilled placeholders and only sub and sup markup; the activity's own answer is judged correct; a wild guess is not.
- Sets: 8 questions per skill and 12 mixed (three per skill), never repeating, over 50 sets.

## Browser

`tests/e2e/qs-practice.spec.js` plays this activity in English and Spanish: a full mixed set with the activity's own answers, feedback and explanations, the results by topic, Try again with new questions, then wrong answers and the review list. It also checks keyboard-only play with a visible focus outline, axe-core at 1366 and 320 px in every state, no sideways scrolling, no English left on the Spanish page, the validated lesson backlink, and no requests outside the site.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices.
