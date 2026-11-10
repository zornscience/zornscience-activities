# Vectors Practice testing

Version: 1.0.0

## Generators (Node)

`tests/unit/qs-vectors-practice.test.js` runs each of the ten generators on 300 random problems and checks them against an independent calculation from the question's parameters: decimal-string sums and differences from `tests/support/qs-reference.js` for vectors in a line, and Math with digit-by-digit 2-figure rounding from `tests/support/qs-reference-trig.js` for perpendicular vectors and components. Units, direction words (English and Spanish) and formulas are typed again in the test, never taken from the activity.

- Scalars and vectors (`sv`, `sa`): every choice has the same number, and only the key has (or lacks) a direction; the arrow's key is squares × scale with the direction, and "forgot the scale" and "no direction" are choices, with the Spanish direction words.
- Same and opposite directions (`ca`, `cn`): both magnitudes have the same decimal places; the key or the answer equals the reference sum or difference, with the larger vector's direction; tug of war is always opposite and pushing always the same way; spelled-out units are accepted, a wrong unit is not; the other operation gets its own note.
- Perpendicular vectors (`pm`, `pd`, `pw`): one vector along east or west and one along north or south, shown in both languages; the magnitude equals √(A² + B²), tie-safe and below 100, accepted with more digits, scientific notation and unit names; A + B and A² + B² get their own notes; the angle equals tan⁻¹(north-south over east-west), 11° to 88° and not 45°, accepted as 37°, 37 degrees, 37 grados and 37º, with the upside-down ratio and the angle in radians named; the compass choices include the upside-down ratio, the wrong side and radian mode.
- Components (`kh`, `kv`, `ke`): the value equals R cos θ or R sin θ, switched when θ is from the vertical (or from north), shorter than the vector, never at 45°; switched sine and cosine and radian mode get their own notes; the explanation and the expression choices use sen in Spanish.
- Every question (`tests/support/qs-checks.js`): English and Spanish are present, have the same numbers, no en or em dashes, no unfilled placeholders and only sub and sup markup; the activity's own answer is judged correct; a wild guess is not.
- Sets: 8 questions per skill and 12 mixed (three per skill), never repeating, over 50 sets.

During development the same checks also ran on 3,000 problems per generator with five other seeds, and a scan of every generator's Spanish found no words left in English.

## Browser

`tests/e2e/qs-practice.spec.js` (through `tests/support/qs-activities.js`) plays this activity in English and Spanish: a full mixed set with the activity's own answers, feedback and explanations, the results by topic, Try again with new questions, then wrong answers and the review list. It also checks keyboard-only play (Tab, arrow keys, Enter and Space, with a visible focus outline), axe-core at 1366 and 320 px in the setup, question, feedback and results states, no sideways scrolling, no English left on the Spanish page, the validated lesson backlink, no requests outside the site, and the directory card in both languages.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices.
