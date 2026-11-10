# Metric Prefixes Practice testing

Version: 1.0.0

## Generators (Node)

`tests/unit/qs-metric-prefixes-practice.test.js` runs each of the nine generators on 300 random problems and checks them against `tests/support/qs-reference-units.js`, which types the lesson's prefix ladder again and moves the decimal point on decimal strings (with `tests/support/qs-reference.js`), without the activity's code.

- Meanings (`pw`, `pp`, `sy`): the key is the ladder's power of ten, prefix or symbol; every wrong choice is another prefix and says what it means; mega always asks against milli and milli against mega, with the capital M note; the measurement shows in both languages.
- Ladder (`pl`, `dr`, `eq`): the places are the difference of the exponents; "5 places" and "5 lugares" are accepted; counting rungs and three places per rung get their own notes; the key moves right exactly when the new unit is smaller; the equal measurement is the reference value and the others are not.
- Converting (`dn`, `up`, `sc`): the answer is the reference shift with the measurement's significant figures; down means a bigger number and up a smaller one, at most 6 places; far conversions are at least 6 places and shown in scientific notation; scientific and standard notation, u or µ for μ, l for L and spelled-out names are accepted; M for m is the wrong unit; the wrong direction, one place per rung and M for m as a number get their notes; one more figure is right with a note; trailing zeros are explained.
- The lesson's worked examples and quiz answers (1.5 km, 325 mg, 25.0 mL, 532 nm, 0.075 mm, 0.68 L, 4,500 μg, 0.15 nm, kilo to centi) come out as the lesson gives them.
- Every question (`tests/support/qs-checks.js`): English and Spanish are present, have the same numbers, no en or em dashes, no unfilled placeholders and only sub and sup markup; the activity's own answer is judged correct; a wild guess is not.
- Sets: 8 questions per skill and 12 mixed (four per skill), never repeating, over 50 sets.

## Browser

`tests/e2e/qs-practice.spec.js` plays this activity in English and Spanish: a full mixed set with the activity's own answers, feedback and explanations, the results by topic, Try again with new questions, then wrong answers and the review list. It also checks keyboard-only play with a visible focus outline, axe-core at 1366 and 320 px in every state, no sideways scrolling, no English left on the Spanish page, the validated lesson backlink, and no requests outside the site.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices.
