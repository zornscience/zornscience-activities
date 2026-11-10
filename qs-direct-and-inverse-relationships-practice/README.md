# Direct and Inverse Relationships Practice

Version: 1.0.0

Generated practice for the Quantitative Skills lesson [Direct and Inverse Relationships](https://zornscience.org/science/quantitative-skills/graphs-and-change/direct-and-inverse-relationships/). Every set has new numbers. Four skills: identifying relationships, changing x, finding the constant, and predictions. A skill gives 8 questions; Mixed review gives 12, three of each. English: `/qs-direct-and-inverse-relationships-practice/`. Mexican Spanish: `/qs-direct-and-inverse-relationships-practice/?lang=es`.

## Rules (from the lesson)

- Direct: a straight line through the origin. Double x and y doubles; triple x and y triples. Ratio test: y ÷ x is the same in every row, and that value is the constant (aluminum, 2.7 g/cm³).
- Inverse: a curve that drops steeply, flattens out and never touches the axes. Double x and y halves. Product test: x × y is the same in every row (Boyle's law, PV = 400 kPa·L).
- Linear but not direct: a straight line that misses the origin (a beaker plus water starts at 50 g).
- Squared: a curve that bends upward. Double x and y is multiplied by 4; triple x and y is multiplied by 9 (kinetic energy and speed, distance fallen and time).
- Test by doubling x.

The lesson does not cover inverse-square relationships, so no question or distractor uses one. Graph shapes are described in words, as on the lesson page; there are no drawings.

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`ct` | Identifying | A data table as (x, y) pairs, plain or in a context (metal samples, a gas at constant pressure or temperature, a cart, a trip, kinetic energy, a falling ball, a beaker of water, a spring) | Choice of four: direct, inverse, squared, linear but not direct; each wrong choice says why, with the table's numbers
`cg` | Identifying | Which graph shape shows a kind, or which kind a described graph shows | Choice of four, with the shape each wrong choice would have
`sm` | Changing x | y is directly or inversely proportional to x, or depends on x squared; x is doubled, tripled or multiplied by 4 | Choice in words ("one third as large"), with the quiz's distractors: the wrong relationship, adding or subtracting the factor, squaring or doubling it
`sn` | Changing x | Two rows where x is multiplied by 2, 3 or 4: by what number is y multiplied? | Whole number or decimal (4, 9, 0.5, 0.25), exact
`kr` | Constant | A direct table: find the constant (y ÷ x) | Number with unit (g/cm³, L/K, m/s); significant figures advised
`kp` | Constant | An inverse table: find the constant (x × y) | Number with unit (kPa·L, km), exact
`pd` | Predictions | Mass of a liquid, Charles's law, a cart at constant speed, a spring | Value with unit; significant figures advised
`pi` | Predictions | Boyle's law, travel time at a new speed | Value with unit, through x × y = constant
`ps` | Predictions | Kinetic energy at a new speed, distance fallen after a new time | Value with unit, the factor squared

Tables always have rows that are exact multiples of the first x (a, 2a, 3a, sometimes 4a, or 2a, 3a, 4a as in the lesson's Charles's law table), so the doubling test always works and the ratio or product is exactly the same in every row. A question's id is its generator key and parameters (`ct|plain|inverse|2|123|60|` is the quiz table (2, 30), (4, 15), (6, 10)), so `bank.rebuild(id)` makes the same question again; the browser tests use it.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js` with exact fractions. Students may type 0.0050, 5.0 x 10^-3 or 5.0e-3, with a unit after the number or without one. A unit is optional, but a typed unit is checked: kPa/L for a product or cm³/g for a ratio is marked incorrect with a note naming the right unit. Significant figures are advice here: the line under each calculation says how many to keep, and a correct value with more or fewer figures is still correct, with a note.

Known mistakes get their own feedback:

- Dividing x ÷ y instead of y ÷ x, or using the product test on a direct table (and the ratio on an inverse one).
- Dividing by the factor for a direct relationship, multiplying for an inverse one, or forgetting to square the factor (and doubling it instead of squaring).
- In the doubling test: dividing the old value by the new one, or subtracting instead of dividing.

Prediction rounding follows the given measurements; whole kelvin, kPa and km/h settings (300 K, 150 kPa, 60 km/h) are treated as exact, so the measured y value sets the figures, as in the lesson's worked example (6.0 L at 50 kPa gives 2.0 L at 150 kPa).

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only: the topic menu, radio buttons, one text field and buttons, so Tab, arrow keys, Enter and Space work as usual; question and results headings take focus, feedback is announced, and the language links and dialogs follow the shared header. Spanish follows the live lesson and the Style Kit: relación directa, relación inversa, directamente proporcional, inversamente proporcional, pasa por el origen, se duplica, se triplica, se reduce a la mitad, se reduce a la tercera parte, se multiplica por 4, prueba del producto, constante, lineal, cuadrática, ley de Boyle, gráfica, tabla de datos, rapidez, energía cinética. The lesson's "prueba de la razón" is not used, because the glossary keeps "relación" for ratio and the same word names the relationship; Spanish text says "y ÷ x" instead. New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.0: Nine generators in four skills, tables in plain and science contexts, specific feedback for common mistakes, reference of the lesson's tests, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
