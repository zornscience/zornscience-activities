# Percents Practice

Version: 1.0.0

Generated practice for the Quantitative Skills lesson [Percents](https://zornscience.org/science/quantitative-skills/ratios-and-percents/percents/). Every set has new numbers. Four skills: percents and decimals, percent of a whole, percent composition, and percent yield. A skill gives 8 questions; Mixed review gives 12, three of each. English: `/qs-percents-practice/`. Mexican Spanish: `/qs-percents-practice/?lang=es`.

## Rules (from the lesson)

- Percent means per hundred: 35% = 35/100 = 0.35. A percent becomes a decimal by moving the decimal point 2 places left (4.5% = 0.045); a decimal becomes a percent by moving it 2 places right.
- percent = part ÷ whole × 100. The whole always goes on the bottom.
- part = (percent ÷ 100) × whole. The part keeps the whole's units.
- Percent composition = mass of the element ÷ mass of the compound × 100; all the percents add up to about 100%. Atomic masses are the lesson's (H = 1.01, C = 12.01, N = 14.01, O = 16.00); any others are given in the question.
- Percent yield = actual yield ÷ theoretical yield × 100.

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`cd` | Percents and decimals | A percent (35%, 4.5%, 0.5%, 235%) with no zeros at the end of a whole number | The decimal
`cp` | Percents and decimals | A decimal (0.35, 0.045, 2.35) | The percent
`wp` | Percent of a whole | Water in a soil sample, zinc in a brass key, ethanol in a solution | The percent, below 100%
`wa` | Percent of a whole | Salt in seawater, nitrogen in fertilizer, oxygen in air, acetic acid in vinegar; the question names the unit | The part, in the whole's unit (g, kg, L or mL)
`ws` | Percent of a whole | Counts (seeds that sprouted, students absent, trials that worked) | Choice: part ÷ whole × 100; the whole on top, no × 100 and the other part are the wrong choices
`ca` | Percent composition | One element in one of 26 formulas, with the atomic masses in the prompt | The percent to 2 decimal places, as the lesson writes it (72.71%)
`cm` | Percent composition | A sample's mass and one element's mass, or the masses of both elements (add them for the compound's mass); close to the compound's real composition | The percent; the explanation gives the other element's share so the two add to 100%
`yp` | Percent yield | A theoretical yield and a smaller actual yield | The percent yield
`ys` | Percent yield | The same numbers | Choice: actual ÷ theoretical × 100; the values switched, no × 100 and the percent lost are the wrong choices

A question's id is its generator key and parameters (`wa|sea|3.5|2400|g`), so `bank.rebuild(id)` makes the same question again; the browser tests use it. Answers never need a trailing decimal point: a generator redraws when standard notation could not show the answer's significant figures.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js` with exact fractions, so ties round half up. A percent may be typed as 35, 35%, 35 percent or 35 por ciento. A decimal answer takes no % sign. Amounts take the unit after the number (optional, since the question names it; a wrong unit is marked wrong).

Significant figures (and decimal places for composition from atomic masses) are advice here: the line under each question says how to round, and the right value rounded differently is marked correct, with a note.

Specific feedback for the lesson's warnings:

- Part and whole switched (a part over 100%, a percent yield over 100%, the compound's mass on top).
- Forgetting × 100 or ÷ 100, and moving the decimal point 1 place or the wrong way.
- Dividing by the percent instead of multiplying, a subscript left out of a molar mass, and dividing by the other element instead of the whole compound.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only: the topic menu, radio buttons, one text field and buttons, so Tab, arrow keys, Enter and Space work as usual; question and results headings take focus, feedback is announced, and the language links and dialogs follow the shared header. Spanish follows the live lesson (Porcentajes) and the Style Kit glossary: porcentaje, composición porcentual, rendimiento porcentual, teórico, real, masa molar, total (the whole), parte. New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.0: Nine generators in four skills, advisory significant figures, specific feedback for common mistakes, rules reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
