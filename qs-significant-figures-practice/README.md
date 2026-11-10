# Significant Figures Practice

Version: 1.0.1

Generated practice for the Quantitative Skills lesson [Significant Figures](https://zornscience.org/science/quantitative-skills/numbers/significant-figures/). Every set has new numbers. Four skills: counting significant figures, rounding, multiplying and dividing, and adding and subtracting. A skill gives 8 questions; Mixed review gives 12, three of each. English: `/qs-significant-figures-practice/`. Mexican Spanish: `/qs-significant-figures-practice/?lang=es`.

## Rules (from the lesson)

- Nonzero digits always count. Zeros between nonzero digits always count. Leading zeros never count.
- Zeros at the end count only when there is a decimal point (2.50 has 3, 2500 has 2). Scientific notation shows zeros that count (2.500 × 10³ has 4); only the coefficient's digits count.
- Rounding: if the first digit you drop is 5 or more, round the last kept digit up (half up, with no special case for an exact 5). Zeros hold the places (3,867 to 2 figures is 3,900).
- Multiplying and dividing keep the fewest significant figures. Adding and subtracting keep the fewest decimal places.

The lesson does not teach a trailing decimal point (1500.) or an overbar, so questions never need them. A typed 1500. is still read as 4 significant figures.

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`cd` | Counting | A measurement with a decimal point: leading, captive and trailing zeros | Exact count
`cw` | Counting | A whole number, often with captive and trailing zeros (85,710 mL) | Exact count
`cs` | Counting | Scientific notation, coefficient 1 to less than 10 | Exact count
`cc` | Counting | Multiple choice: which of four measurements has exactly n figures (four different counts) | Choice, with a reason for every wrong choice
`rs` | Rounding | A number below 1 to 1 to 3 figures | Rounded value
`rl` | Rounding | A number of 3 to 6 whole digits to fewer figures, keeping place-holding zeros | Rounded value; scientific notation when zeros at the end must count (3,996 to 3 figures is 4.00 × 10³)
`rh` | Rounding | The first dropped digit is 5 (twice as often) or 4 | Rounded value
`mu` | Multiplying | Area, distance from speed and time, or mass from density and volume | Fewest significant figures
`dv` | Dividing | Density or average speed, built from a realistic rate | Fewest significant figures
`ad` | Adding | Two or three masses, volumes or lengths with different decimal places | Fewest decimal places
`sb` | Subtracting | Water in a beaker, a temperature rise, or a cut board | Fewest decimal places

Calculation answers never need a trailing decimal point: a generator redraws its numbers when the rounded answer could not show its figures in standard notation. A question's id is its generator key and parameters (`rs|0.04532|2`), so `bank.rebuild(id)` makes the same question again; the browser tests use it.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js` with exact fractions (no floating point ties: 1.15 × 3.0 is exactly 3.45 and rounds to 3.5). Students may type 0.0250, 2.50 x 10^-2, 2.50×10^(−2), 2.50e-2 or 2.50 × 10⁻², with comma thousands (45,000), and a unit after the number with or without a space. A decimal comma (2,5) and a power of ten without its exponent (3 x 10 4) get their own message and are not scored.

Significant figures are the skill, so they are scored: the right value with the wrong number of figures is marked incorrect, with a note saying what to change. Specific feedback:

- More figures than allowed: "Round to n significant figures."
- Fewer: "Your answer is rounded too far."
- A whole number whose zeros cannot count (1500 for three figures): it names the scientific notation to write.
- A dropped trailing zero (2.5 for 2.50): a zero at the end after the decimal point counts.
- Rounding the wrong way, counting leading zeros, dropping place-holding zeros, using decimal places for a product, or significant figures for a sum: each has its own note.

The unit is optional on calculations; if typed, it must be the right one (g/cm³, g/cm^3 and g/cm3 all match).

Counting answers are whole numbers, and "3 sig figs" or "3 cifras significativas" is accepted.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only: the topic menu, radio buttons, one text field and buttons, so Tab, arrow keys, Enter and Space work as usual; question and results headings take focus, feedback is announced, and the language links and dialogs follow the shared header. Spanish follows the Style Kit: cifras significativas (never abbreviated), redondear, punto decimal, lugares decimales, ceros al inicio, ceros al final, notación científica. New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.1: Patch bump for the shared practice engine (`shared/zsa-practice.js`), which gained an opt-in typed-equation question type used only by Rearranging Equations Practice. This page does not load the equation reader and its questions, scoring and text are unchanged.

1.0.0: Eleven generators in four skills, scored significant figures, specific feedback for common mistakes, rules reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
