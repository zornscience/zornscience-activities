# Scientific Notation Practice testing

Version: 1.0.1

## Generators (Node)

`tests/unit/qs-scientific-notation-practice.test.js` runs each of the six generators on 300 random problems and checks them against an independent calculation that moves the decimal point in digit strings, without the activity's code.

- To scientific notation (`sb`, `ss`): the answer equals the reference coefficient and exponent and keeps the number's significant figures; E notation, × 10^( ) and **10** forms are accepted; standard notation, a coefficient of 10 or more, the wrong exponent sign and an exponent one off are marked incorrect with the right note.
- To standard notation (`pb`, `ps`): the answer equals the reference and shows the coefficient's digits; comma thousands are accepted; scientific notation, moving the point the wrong way and one place too far are marked incorrect with the right note.
- Reading (`rf`, `rm`): all four choices have the same value and only the key is in correct form; the key names the right size, direction and number of places.
- Every question passes `tests/support/qs-checks.js` (English and Spanish, same numbers, no dashes, only sub and sup, its own answer accepted).
- Sets: 8 per skill and 12 mixed (four per skill), never repeating, over 50 sets.

## Browser

`tests/e2e/qs-practice.spec.js` covers this activity as it does every Quantitative Skills page: full mixed sets in English and Spanish with their own answers, Try again, review, keyboard only with a visible focus ring, axe-core at 1366 and 320 px in every state, no English left in Spanish, the lesson backlink and no outside requests.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices.
