# Substituting with Units Practice testing

Version: 1.0.0

## Generators (Node)

`tests/unit/qs-substituting-with-units-practice.test.js` runs each of the ten generators on 300 random problems and checks them against answers worked in the test, without the activity's code. `tests/support/qs-reference-equations.js` works units as maps of base-unit exponents (N and J expanded to kg, m and s) and moves decimal points on digit strings; values use the decimal-string reference in `tests/support/qs-reference.js`.

- Units (`ul`, `nu`, `cf`): the key's unit equals the unit the substitution leaves, worked out from the exponents of its factors, and no wrong choice does; named units match their base units; the kelvin step adds 273; the conversion factor keeps every significant figure (85.0 cm is 0.850 m).
- Setup (`st`, `pu`): the key converts first, with the converted value worked on the digits, and the unconverted (or °C) setup is always a wrong choice with its reason; a student's setup is right exactly when its worked-out unit is the unit the quantity needs.
- Answers and conversions (`qu`, `pd`, `fc`, `wk`, `gp`): the answer equals the reference value rounded to the fewest significant figures, with grams, centimeters and °C converted first; named and base units and spelled-out names are accepted; a wrong unit gets "Check the unit."; a bare number asks for the unit and is not scored; skipping a conversion, 1000 cm per meter, °C for kelvin, a missing square or a missing ½ each get their own note.
- The lesson's own examples: 455 g at 3.20 m/s² is 1.46 N (1.46 × 10³ N is named), 625 g at 2.40 m/s² is 1.50 N, a 145 g ball at 40.0 m/s has 116 J, 12.0 N over 85.0 cm is 10.2 J (1.02 J and 1020 J are named), 0.500 mol in 10.0 L at 25.0 °C is 1.22 atm (0.103 atm is named), 60.0 m in 7.50 s is 8.00 m/s, 24.0 g in 8.00 mL is 3.00 g/mL, (12 m/s)(4.0 s) = 48 m and 2.0 kg × 3.0 m/s² = 6.0 N.
- Every question (`tests/support/qs-checks.js`): both languages present with the same numbers, no dashes, no stray markup or placeholders, the own answer correct and a wild guess not. On questions with a required unit, the shared checks run on a copy with the unit optional (their wild guess has no unit), and the test checks the required unit itself: a bare number is not scored, and a wild guess with the unit is incorrect.
- Sets: 8 questions per skill and 12 mixed (three per skill), never repeating, over 50 sets.

## Browser

`tests/e2e/qs-practice.spec.js` plays this activity in English and Spanish (listed in `tests/support/qs-activities.js`): keyboard-only play with a visible focus outline, axe-core at 1366 and 320 px in every state, no sideways scrolling, no English left on the Spanish page, the lesson backlink and no outside requests all pass. The two full mixed-set tests type a bare wild guess (987654321) for every wrong answer; on this page the unit is required, so the engine asks for the unit instead of scoring it, and those two tests stop there. With the wrong answer typed as "987654321 N" (the unit added when `check.unit` is "required"), both pass.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices.
