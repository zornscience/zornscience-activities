# Percents Practice testing

Version: 1.0.1

## Generators (Node)

`tests/unit/qs-percents-practice.test.js` runs each of the nine generators on 300 random problems and checks them against `tests/support/qs-reference.js` and `tests/support/qs-reference-ratios-percents.js`, written from the lesson without the activity's code. The reference moves decimal points on scaled integers, works percents by long division with digit rounding, and finds molar masses from atomic masses typed again in the reference.

- Percents and decimals (`cd`, `cp`): the answer is the number with its decimal point moved 2 places, with the same significant figures; 35, 35%, 35 percent and 35 por ciento are accepted for a percent; a % sign on a decimal is not; forgetting to move the point, moving it 1 place and moving it the wrong way each get their note.
- Percent of a whole (`wp`, `wa`, `ws`): part ÷ whole × 100 below 100%, and (percent ÷ 100) × whole in the whole's unit, rounded to the fewest significant figures; the prompt names the unit in both languages; unit names are accepted and a different unit is not; the whole on top, no × 100, forgetting ÷ 100 and dividing by the decimal get their notes; the setup choices are the four the lesson warns about, and the shown percent ends.
- Percent composition (`ca`, `cm`): the prompt lists each element's atomic mass; the answer comes from the reference's molar mass, to 2 decimal places for atomic masses; every compound's percents add up to about 100%; three decimal places are correct with a note; a missing subscript, no × 100, the compound's mass on top and dividing by the other element get their notes; measured samples are within 1% of the real composition.
- Percent yield (`yp`, `ys`): actual ÷ theoretical × 100 with a smaller actual yield; the values switched (over 100%) and no × 100 get their notes; the setup choices.
- The lesson's examples and quiz: 35% and 4.5% as decimals, 8.0 g of 25.0 g (32%), 3.5% of 2400 g (84 g), 12% of 3.20 kg (0.38 kg), O in CO₂ (72.71%), C in CH₄ (74.83%), 30.6 g of 36.0 g (85.0%), 42.0 g of 50.0 g (84.0%, and 119 named as switched), 7 of 28 absent.
- Every question (`tests/support/qs-checks.js`): English and Spanish are present, have the same numbers, no en or em dashes, no unfilled placeholders and only sub and sup markup; the activity's own answer is judged correct; a wild guess is not.
- Sets: 8 questions per skill and 12 mixed (three per skill), never repeating, over 50 sets.

## Browser

`tests/e2e/qs-practice.spec.js` plays this activity in English and Spanish: a full mixed set with the activity's own answers, feedback and explanations, the results by topic, Try again with new questions, then wrong answers and the review list. It also checks keyboard-only play (Tab, arrow keys, Enter and Space, with a visible focus outline), axe-core at 1366 and 320 px in the setup, question, feedback and results states, no sideways scrolling, no English left on the Spanish page, the validated lesson backlink, and no requests outside the site.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices. The live lesson pages could not be opened from the build environment, so the lesson wording was taken from the brief.
