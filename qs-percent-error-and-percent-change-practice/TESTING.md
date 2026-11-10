# Percent Error and Percent Change Practice testing

Version: 1.0.1

## Generators (Node)

`tests/unit/qs-percent-error-and-percent-change-practice.test.js` runs each of the seven generators on 300 random problems and checks them against `tests/support/qs-reference.js` and `tests/support/qs-reference-ratios-percents.js`, written from the lesson without the activity's code. The reference subtracts on scaled integers keeping the decimal places, counts the difference's significant figures, and divides by long division with digit rounding. Accepted values are typed again in the test.

- Percent error (`ec`, `es`): the accepted value matches the test's table and the prompt shows both values with their unit in both languages; both have the same decimal places and differ by at most 12%; the answer is |measured − accepted| ÷ accepted × 100, rounded to the fewest significant figures of the difference and the accepted value, and the instruction names that number; 4.1, 4.1%, 4.1 percent and 4.1 por ciento are accepted; the measured value on the bottom, skipping the subtraction and no × 100 get their notes; a negative answer gets "Check the sign." and the absolute value note.
- Percent change (`ci`, `cd`): (new − original) ÷ original × 100 with the same rounding rule; an increase is positive and accepted with or without +; a decrease is negative, accepted with a hyphen or a true minus, and marked wrong without its sign, with its note; an increase typed negative, the new value on the bottom and skipping the subtraction get their notes.
- Setups and signs (`sb`, `sm`, `sd`): the key setup puts the accepted or original value on the bottom; each wrong setup has its reason; the setup without absolute value bars is the negative one; the meaning of a sign names the direction and a percent of the original, with 100 ± v in the reason; the sign comes from new minus original, worked by the reference.
- The lesson's examples and quiz: 98.6 against 100.0 °C (1.4%), 48.0 and 52.0 against 50.0 g (4.0%), 9.62 against 9.81 m/s² (1.9%), 20.0 to 27.0 cm (+35%), 80.0 to 60.0 g (−25.0%), 2.40 to 2.18 L (−9.2%), 1.60 to 4.30 m/s (+169%), 1.50 to 1.86 L (+24%), 2.00 to 1.64 s (−18%), and 2.81 against 2.70 g/cm³ (4.1%, with 3.9%, −4.1% and 104% each named).
- Every question (`tests/support/qs-checks.js`): English and Spanish are present, have the same numbers, no en or em dashes, no unfilled placeholders and only sub and sup markup; the activity's own answer is judged correct; a wild guess is not.
- Sets: 8 questions per skill and 12 mixed (four per skill), never repeating, over 50 sets.

## Browser

`tests/e2e/qs-practice.spec.js` plays this activity in English and Spanish: a full mixed set with the activity's own answers (increases typed with +), feedback and explanations, the results by topic, Try again with new questions, then wrong answers and the review list. It also checks keyboard-only play (Tab, arrow keys, Enter and Space, with a visible focus outline), axe-core at 1366 and 320 px in the setup, question, feedback and results states, no sideways scrolling, no English left on the Spanish page, the validated lesson backlink, and no requests outside the site.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices. The live lesson pages could not be opened from the build environment, so the lesson wording was taken from the brief.
