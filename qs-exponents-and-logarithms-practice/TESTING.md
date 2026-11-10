# Exponents and Logarithms Practice testing

Version: 1.0.1

## Generators (Node)

`tests/unit/qs-exponents-and-logarithms-practice.test.js` runs each of the eleven generators on 300 random problems and checks them against an independent calculation, without the activity's code: integer arithmetic for the exponent rules, `tests/support/qs-reference.js` (decimal strings, long division, digit rounding) for scientific notation, and JavaScript's `Math.log10`, `Math.pow`, `toFixed` and `toExponential` by a different route than the activity for logs and pH (−log10 of the whole concentration rather than the exponent minus the log of the coefficient).

- Exponent rules (`rm`, `rd`, `rp`): the exponent is a + b, a − b or a × b; the prompt shows the powers with a true minus sign; a true minus sign is accepted when typed; the whole power of ten (10^7 for 7) gets the "only the exponent" note; multiplied exponents, bottom minus top and added exponents for a power of a power get their notes; area and volume questions end in m² and m³.
- Scientific notation (`sm`, `sd`): the answer equals the reference rounded to the fewer significant figures of the two coefficients; it always needs a power of ten; the same value in standard notation is marked incorrect with the scientific notation note; an unadjusted coefficient (15.2 × 10⁷) gets the first-number note; multiplied exponents, and added exponents when dividing, get their notes; meters and seconds are accepted for light.
- What a negative exponent means (`sz`): the key is the number between 0 and 1 written digit by digit, a negative number is always a distractor, and no distractor equals the key.
- Logarithms (`lp`, `lb`, `lu`): log of a power of ten is its exponent; numbers show commas from 10,000; a positive answer for a number below 1 gets the "negative logs" note; the bracket is the floor of log10; 10^n, 1 x 10^n and the standard number are accepted for x, and the negative number, the flipped sign and the log itself are not.
- pH (`ph`, `hc`): the answer equals the independent value with as many decimal places as [H⁺] has significant figures (and the reverse); no problem is within 1e-7 of a rounding tie; the instruction names the rule and no count; one place too few or a calculator's longer reading is marked incorrect; the exponent alone, the sign dropped and 10^(+pH) get their notes; M, mol/L and molar are accepted, and the unit is optional.
- The lesson's examples and quiz: 10⁵ × 10³ = 10⁸, 10³ × 10⁴ is not 10¹², 10² ÷ 10⁵ = 10⁻³, (10³)² = 10⁶, (10⁻² m)², light in 5.0 × 10² s is 1.5 × 10¹¹ m, (8.4 × 10⁶)/(2.0 × 10⁻²) = 4.2 × 10⁸, log(0.001) = −3, 3.2 × 10⁻⁴ M is pH 3.49, 6.3 × 10⁻⁵ M is pH 4.20 and 4.2 is wrong, pH 4.30 is 5.0 × 10⁻⁵ M, pH 2.70 is 2.0 × 10⁻³ M and 1.995 × 10⁻³ is wrong.
- Every question (`tests/support/qs-checks.js`): English and Spanish are present, have the same numbers, no en or em dashes, no unfilled placeholders and only sub and sup markup; the activity's own answer is judged correct; a wild guess is not. The Spanish text of every question, choice, reason and note has no common English words.
- Sets: 8 questions per skill and 12 mixed (three per skill), never repeating, over 50 sets.

## Browser

`tests/e2e/qs-practice.spec.js` plays this activity in English and Spanish: a full mixed set with the activity's own answers, feedback and explanations, the results by topic, Try again with new questions, then wrong answers and the review list. It also checks keyboard-only play (Tab, arrow keys, Enter and Space, with a visible focus outline), axe-core at 1366 and 320 px in the setup, question, feedback and results states, no sideways scrolling, no English left on the Spanish page, the validated lesson backlink, and no requests outside the site.

## Not automated

Real screen readers (NVDA, VoiceOver), Firefox, Safari and school devices.
