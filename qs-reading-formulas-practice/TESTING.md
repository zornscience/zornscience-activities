# Reading Formulas Practice testing

Version: 1.0.1

## Generators (Node)

`tests/unit/qs-reading-formulas-practice.test.js` runs each of the ten generators on 300 random problems and checks them against values worked in the test from the lesson, without the activity's code: the letters, sentences and formulas are typed again, and changes and products use the decimal-string reference in `tests/support/qs-reference.js`.

- Symbols (`sy`, `sb`): the key is the quantity the lesson names for that letter in that formula; the same letter in the other case is a wrong choice with the "case matters" reason; v<sub>i</sub> has "v times i" as a wrong choice with the name-tag reason; Δ is "final minus initial", with "initial minus final" as a wrong choice.
- Words (`rw`, `ct`): each formula reads as the lesson's sentence, and each sentence picks its formula; the wrong readings name adding or dividing instead of multiplying and the wrong case, subscript or unit; g and R are the constants.
- Change (`dt`, `dv`, `dx`): Δ equals final minus initial by decimal subtraction, to 1 decimal place, at least 1.0 in size; warming and speeding up are positive, cooling and slowing down are negative; a true minus, the unit's Spanish name and no unit are accepted; initial minus final gets "Check the sign." and the final-minus-initial note; the sum gets its own note; the explanation says increased or decreased.
- Substitution (`wg`, `pr`, `dn`): the answer is the decimal product or quotient rounded to the fewest significant figures (2 for W = mg, because g = 9.8 m/s²); scientific notation and spelled-out units are accepted; extra digits are correct with the advice; a wrong unit is not; dividing instead of multiplying and volume over mass are named.
- The lesson's own examples: 22.0 to 85.0 °C is 63.0 °C, 12.0 to 4.0 m/s is −8.0 m/s, x<sub>i</sub> = 3.5 m to x<sub>f</sub> = 11.2 m is 7.7 m, 25.0 to 18.6 °C is −6.4 °C (decreased), and 3.0 kg weighs 29 N.
- Every question (`tests/support/qs-checks.js`): English and Spanish are present, have the same numbers, no en or em dashes, no unfilled placeholders and only sub and sup markup; the activity's own answer is judged correct; a wild guess is not.
- Sets: 8 questions per skill and 12 mixed (three per skill), never repeating, over 50 sets.

## Browser

`tests/e2e/qs-practice.spec.js` plays this activity in English and Spanish (it is listed in `tests/support/qs-activities.js`): a full mixed set with the activity's own answers, feedback and explanations, the results by topic, Try again with new questions, then wrong answers and the review list; keyboard-only play with a visible focus outline; axe-core at 1366 and 320 px in the setup, question, feedback and results states; no sideways scrolling; no English left on the Spanish page; the validated lesson backlink; and no requests outside the site.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices.
