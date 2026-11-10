# Trigonometry Basics Practice testing

Version: 1.0.0

## Generators (Node)

`tests/unit/qs-trigonometry-basics-practice.test.js` runs each of the ten generators on 300 random problems and checks them against an independent calculation from the question's parameters: Math in the test file, with the side letters, ratios, formulas and mistakes typed again there, and 2-figure rounding done digit by digit by `tests/support/qs-reference-trig.js` (on top of `tests/support/qs-reference.js`), never by the activity's code.

- Naming (`sn`, `sc`): the lengths form a right triangle with c the longest; the key is the side the lesson names (c for the hypotenuse, a opposite θ, b adjacent, and swapped for the other acute angle); the context names are typed again for each scene; the prompt shows the lengths in both languages.
- SOH CAH TOA (`sr`, `rv`): the key ratio is a/c, b/c or a/b and the upside-down ratio is a choice; the value equals the long-division quotient rounded to 2 figures, with no tie; three figures and a longer calculator value are accepted; the upside-down ratio and the other two ratios get their own notes; a unit is not accepted.
- Finding a side (`fs`, `fc`): the answer equals the reference (multiply or divide by sin, cos or tan of θ), is tie-safe, shows 2 significant figures and stays below 100; legs are shorter than the hypotenuse; plain, with the unit, without a space, with more digits, in scientific notation and with spelled-out names (meters, metros, centimeters, centímetros) are accepted, a wrong unit is not; the wrong function, the other operation and the radian-mode value are marked incorrect with their own notes; each situation's angle stays in its realistic range.
- Radian mode (`fm`): the student's value is the radian-mode result, negative, shown with a true minus; the key is radian mode; the explanation gives the degree-mode answer.
- Finding an angle (`fa`, `fx`, `ak`): the angle equals sin⁻¹, cos⁻¹ or tan⁻¹ of the given sides, 11° to 88° and not 45°; 37, 37°, 37º, 37 degrees, 37 grados, 37 deg and three decimals are accepted, 37 m is not; the other acute angle (90° minus θ), tan⁻¹ with the hypotenuse, sin⁻¹ without it and the angle in radians each get their own note; the expression choices include 1/f(x/y) and f(x/y), with sen⁻¹ in Spanish.
- Every question (`tests/support/qs-checks.js`): English and Spanish are present, have the same numbers, no en or em dashes, no unfilled placeholders and only sub and sup markup; the activity's own answer is judged correct; a wild guess is not.
- Sets: 8 questions per skill and 12 mixed (three per skill), never repeating, over 50 sets.

During development the same checks also ran on 3,000 problems per generator with five other seeds, and a scan of every generator's Spanish found no words left in English.

## Browser

`tests/e2e/qs-practice.spec.js` (through `tests/support/qs-activities.js`) plays this activity in English and Spanish: a full mixed set with the activity's own answers, feedback and explanations, the results by topic, Try again with new questions, then wrong answers and the review list. It also checks keyboard-only play (Tab, arrow keys, Enter and Space, with a visible focus outline, so the triangle adds no tab stop), axe-core at 1366 and 320 px in the setup, question (with the triangle shown), feedback and results states, no sideways scrolling, no English left on the Spanish page (including the triangle's title and description), the validated lesson backlink, no requests outside the site, and the directory card in both languages.

## Not automated

Real screen readers (NVDA, VoiceOver) reading the triangle's description, Firefox, Safari and school devices.
