# Direct and Inverse Relationships Practice testing

Version: 1.0.0

## Generators (Node)

`tests/unit/qs-direct-and-inverse-relationships-practice.test.js` runs each of the nine generators on 300 random problems and checks them against an independent calculation: each table is rebuilt from the question's parameters with `tests/support/qs-reference.js` (decimal strings and long division, not the activity's code), and the kind of relationship, the constant, the factor and the prediction are worked out again from the lesson's rules.

- Identifying (`ct`, `cg`): the table is classified by the lesson's tests (y ÷ x the same in every row, x × y the same, doubling x multiplies y by 4, equal steps that miss the origin), exactly one test passes, the key is that kind, every row's numbers appear in both languages, every table doubles x somewhere, and each context has the kind it should (Boyle's law is inverse, the beaker is linear). Graph shapes match the re-typed list from the lesson; all 13 shape questions come up.
- Changing x (`sm`, `sn`): the key says the factor the lesson gives (one third as large for inverse when x triples, multiplied by 9 for squared); the quiz's choices (triples, decreases by 3, multiplied by 9) are reproduced; the doubling test's factor equals y₂ ÷ y₁ computed again; dividing the wrong way and subtracting are marked incorrect with their notes.
- Constant (`kr`, `kp`): the constant is the same in every rebuilt row and equals the answer; the unit is optional, other spellings are accepted (g/cm^3, L K^-1, meters per second, kPa L, kilómetros), and a flipped unit (cm³/g, kPa/L) is marked incorrect with the unit note; the wrong test and the inverted ratio get their notes.
- Predictions (`pd`, `pi`, `ps`): the answer equals the reference rounded to the figures of the given measurements and shows them in standard notation; scientific notation with the unit is accepted, a wrong unit is not, an extra figure is accepted with a note (advice); treating the relationship as the wrong kind, or forgetting to square, is marked incorrect with its note.
- The lesson's worked examples and quiz: V/T = 0.0050 L/K, PV = 300 kPa·L and 2.0 L at 150 kPa, the falling-ball table 4.9, 19.6, 44.1 m, (2, 30), (4, 15), (6, 10) is inverse with xy = 60, 75.0 mL has 60.0 g, 6.0 m/s gives 45 J.
- Every question (`tests/support/qs-checks.js`): English and Spanish are present, have the same numbers, no en or em dashes, no unfilled placeholders and only sub and sup markup; the activity's own answer is judged correct; a wild guess is not. The Spanish text of every question, choice, reason and note has no common English words, and no "a el" or "de el".
- Sets: 8 questions per skill and 12 mixed (three per skill), never repeating, over 50 sets.

## Browser

`tests/e2e/qs-practice.spec.js` plays this activity in English and Spanish: a full mixed set with the activity's own answers, feedback and explanations, the results by topic, Try again with new questions, then wrong answers and the review list. It also checks keyboard-only play (Tab, arrow keys, Enter and Space, with a visible focus outline), axe-core at 1366 and 320 px in the setup, question, feedback and results states, no sideways scrolling, no English left on the Spanish page, the validated lesson backlink, and no requests outside the site.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices.
