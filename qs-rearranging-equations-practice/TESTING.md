# Rearranging Equations Practice testing

Version: 1.0.0

## Generators (Node)

`tests/unit/qs-rearranging-equations-practice.test.js` runs each of the seven generators on 300 random problems and checks them against answers worked in the test from the lesson, without the activity's code: every rearrangement and first step is typed again by hand, and values use the decimal-string reference in `tests/support/qs-reference.js` (exact products and long division).

- Solve (`s1`, `s2`): the key is the hand-worked rearrangement for each of the 20 cases; the upside-down result and the wrong order of steps are wrong choices with their reasons; the prompt reads "Solve … for …" and "Despeja … en …".
- First step (`fs`, `tr`): the key is the hand-worked first step (divide both sides, multiply both sides by V for D = m/V, subtract first for two-step formulas); the balance reason is always a wrong choice; two-step formulas carry the reverse-order reason; the triangle key has three quantities and no plus sign, and no wrong choice does.
- Calculate (`dn`, `sh`, `tw`): the answer equals the reference product or quotient rounded to the fewest significant figures, with the difference of two speeds or positions kept to 1 decimal place first; a calculated specific heat is within 1% of a real metal; scientific notation and spelled-out units are accepted; upside-down, multiplied, wrong-order and forward-formula answers are named.
- The lesson's own examples: 13.6 g/mL × 5.00 mL = 68.0 g, 45.0 g of aluminum is 16.7 mL, 269 J / [(50.0 g)(12.0 °C)] = 0.448 J/(g·°C), 2090 J of water warming 10.0 °C is 50.0 g, (25.0 − 5.0)/4.0 = 5.0 m/s², and 98.6 °F is 37.0 °C.
- Every question (`tests/support/qs-checks.js`): both languages present with the same numbers, no dashes, no stray markup or placeholders, the own answer correct and a wild guess not.
- Sets: 8 questions per skill and 12 mixed (four per skill), never repeating, over 50 sets.

## Browser

`tests/e2e/qs-practice.spec.js` plays this activity in English and Spanish (listed in `tests/support/qs-activities.js`): full mixed sets with the own answers and with wrong answers, the results and review, keyboard-only play with a visible focus outline, axe-core at 1366 and 320 px in every state, no sideways scrolling, no English left on the Spanish page, the lesson backlink and no outside requests.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices.
