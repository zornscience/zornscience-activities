# Ratios and Proportions Practice

Version: 1.0.1

Generated practice for the Quantitative Skills lesson [Ratios and Proportions](https://zornscience.org/science/quantitative-skills/ratios-and-percents/ratios-and-proportions/). Every set has new numbers. Three skills: writing and simplifying ratios, solving proportions, and mole ratios. A skill gives 8 questions; Mixed review gives 12, four of each. English: `/qs-ratios-and-proportions-practice/`. Mexican Spanish: `/qs-ratios-and-proportions-practice/?lang=es`.

## Rules (from the lesson)

- A ratio is written 3 : 2 (a spaced colon), 3 to 2, or 3/2. Order matters: the first quantity named goes first.
- Simplify by dividing both numbers by the same factor (12 : 8 = 3 : 2). Change to the same units first (50 cm : 2 m = 50 cm : 200 cm = 1 : 4).
- In a balanced equation, the coefficients give the mole ratio (2 H₂ + O₂ → 2 H₂O gives H₂ : O₂ = 2 : 1). A formula with no number in front has a coefficient of 1.
- A proportion is two equal ratios. Keep the same units in the same spots, use x for the unknown, cross-multiply, then divide (120 km / 2 h = x km / 5 h, so 2 · x = 600 and x = 300 km).

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`rc` | Writing ratios | Two counts (marbles, pea plants, glassware) with a common factor, asked in either order | Choice: the ratio in simplest form in the order asked; the reverse order, the unsimplified ratio and the part to the total are the wrong choices, each with its reason
`ru` | Writing ratios | Two amounts in different units (cm and m, g and kg, mL and L, min and h), asked in either order | Choice: the simplified ratio after changing units; the reverse order, the ratio with the units not matched and the unsimplified ratio are the wrong choices
`pm` | Proportions | A map scale (2 cm = 15 km) and a distance on the map or on the ground | The other distance; the scale is exact, so the measured distance sets the significant figures
`pc` | Proportions | Grams of salt, sugar or baking soda in a volume of solution; find the grams in another volume, or the volume that holds a mass | Grams or milliliters
`pr` | Proportions | A train's distance and time, or a spring's force and stretch; find either one for a new value | Kilometers, minutes, newtons or centimeters
`mr` | Mole ratios | One of 18 balanced equations: the mole ratio of one substance to another (coefficients that differ and share no factor) | Choice: the coefficients in order; the reverse order, a third substance's coefficient and 1 : 1 are the wrong choices
`mp` | Mole ratios | Moles of a product formed from moles of a reactant | Moles, by a proportion with the coefficients
`mn` | Mole ratios | Moles of a reactant that react with another reactant, or that are needed to make a product | Moles

A question's id is its generator key and parameters (`pm|f|2|15|8.4`), so `bank.rebuild(id)` makes the same question again; the browser tests use it. Calculation answers never need a trailing decimal point: a generator redraws when standard notation could not show the answer's significant figures.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js` with exact fractions, so ties round half up as the lessons teach. Students may type 63, 63 km, 63 kilometers, 6.3 x 10^1 or 6.3e1. Mole answers accept mol, moles, mol NH3, moles of NH3 and mol de NH3 (with plain or subscript digits).

Significant figures are advice here: the line under each question says how many to keep (the fewest in the measured values; a map scale is exact). The right value with a different number of figures is marked correct, with a note. The unit is optional; if typed, it must be the right one.

Specific feedback for the lesson's warnings:

- Proportions: the units in the wrong spots (an upside-down ratio) and forgetting to divide after cross-multiplying.
- Mole ratios: the ratio upside down, and using 1 : 1 instead of the coefficients.
- Ratio choices: the reverse order, not simplified, units not matched, the part compared to the total, and another substance's coefficient each have their own reason.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only: the topic menu, radio buttons, one text field and buttons, so Tab, arrow keys, Enter and Space work as usual; question and results headings take focus, feedback is announced, and the language links and dialogs follow the shared header. Spanish follows the Style Kit glossary: relación for ratio and relación molar for mole ratio (the live Spanish lesson says razón; its title, Razones y proporciones, is kept where the lesson is named), proporción, multiplicar en cruz, incógnita, coeficiente, ecuación balanceada. New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.1: Patch bump for the shared practice engine (`shared/zsa-practice.js`), which gained an opt-in typed-equation question type used only by Rearranging Equations Practice. This page does not load the equation reader and its questions, scoring and text are unchanged.

1.0.0: Eight generators in three skills, advisory significant figures, specific feedback for common mistakes, rules reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
