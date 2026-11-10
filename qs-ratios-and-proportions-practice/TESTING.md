# Ratios and Proportions Practice testing

Version: 1.0.0

## Generators (Node)

`tests/unit/qs-ratios-and-proportions-practice.test.js` runs each of the eight generators on 300 random problems and checks them against `tests/support/qs-reference.js` and `tests/support/qs-reference-ratios-percents.js`, written from the lesson without the activity's code. The reference simplifies ratios with BigInt division, works proportions by long division with digit rounding, and parses each equation from the prompt and checks that it balances before using its coefficients.

- Writing ratios (`rc`, `ru`): the prompt shows the counts or amounts and names the order in English and Spanish; the key is the simplest ratio in that order (after changing units, from unit factors typed again in the test); the reverse order, the unsimplified ratio, the part to the total and the ratio with unmatched units are each a choice with its own reason; exactly one choice is simplest and in order.
- Proportions (`pm`, `pc`, `pr`): x = q · c ÷ p from the reference, rounded to the fewest significant figures of the measured values (a map scale is exact); standard notation shows the figures; scientific notation, the unit's name and no unit are accepted; a wrong unit is not; one more figure is correct with a note (advice only); the units in the wrong spots and forgetting to divide get their notes; the explanation shows the cross-multiplication.
- Mole ratios (`mr`, `mp`, `mn`): every equation balances; the key is the coefficients in the order asked; moles come from the parsed coefficients; mol, moles, mol NH3, moles of NH3 and mol de NH3 are accepted; an upside-down ratio and 1 : 1 get their notes; `mp` always goes from a reactant to a product and `mn` always asks for a reactant.
- The lesson's examples and quiz: 6 red and 9 blue (blue to red 3 : 2), 30 cm : 1.5 m (1 : 5), 50 cm : 2 m (1 : 4), 2 cm = 15 km and 8.4 cm (63 km), 12 g in 250 mL and 75 mL (3.6 g), 24 km in 32 min and 52 min (39 km), 4.0 N and 3.0 cm for 4.5 cm (6.0 N), 4.5 mol H₂ to NH₃ (3.0 mol), 6.0 mol Fe to O₂ (4.5 mol), 2 H₂ + O₂ (2 : 1).
- Every question (`tests/support/qs-checks.js`): English and Spanish are present, have the same numbers, no en or em dashes, no unfilled placeholders and only sub and sup markup; the activity's own answer is judged correct; a wild guess is not.
- Sets: 8 questions per skill and 12 mixed (four per skill), never repeating, over 50 sets.

## Browser

`tests/e2e/qs-practice.spec.js` plays this activity in English and Spanish: a full mixed set with the activity's own answers, feedback and explanations, the results by topic, Try again with new questions, then wrong answers and the review list. It also checks keyboard-only play (Tab, arrow keys, Enter and Space, with a visible focus outline), axe-core at 1366 and 320 px in the setup, question, feedback and results states, no sideways scrolling, no English left on the Spanish page, the validated lesson backlink, and no requests outside the site.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices. The live lesson pages could not be opened from the build environment, so the lesson wording was taken from the brief.
