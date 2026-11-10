# Reading Formulas Practice

Version: 1.0.1

Generated practice for the Quantitative Skills lesson [Reading Formulas](https://zornscience.org/science/quantitative-skills/equations/reading-formulas/). Every set is new. Four skills: symbols and subscripts, formulas in words, change (final minus initial), and one-step substitution. A skill gives 8 questions; Mixed review gives 12, three of each. English: `/qs-reading-formulas-practice/`. Mexican Spanish: `/qs-reading-formulas-practice/?lang=es`.

## Ideas (from the lesson)

- Each letter stands for a measured quantity, and a formula reads aloud as a sentence: d = vt is "distance equals velocity times time".
- Letters side by side mean multiply (ma = m × a, PV = P × V); the × is left out so it is not confused with x.
- A constant has the same value in every problem and comes from a reference sheet: g = 9.8 m/s², and R in PV = nRT.
- Subscripts i and f are name tags: v<sub>i</sub> is the initial velocity, not v × i.
- Δ means "change in" and is always final minus initial; a negative Δ means the quantity decreased.
- Case matters: m is mass and M is molar mass; v is velocity and V is volume.

Formulas used: d = vt, F = ma, W = mg, D = m/V, v<sub>f</sub> = v<sub>i</sub> + at, PV = nRT.

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`sy` | Symbols | What a letter stands for in one of the six formulas (19 letter and formula pairs) | Choice; wrong choices are the same letter in the other case, a look-alike the lesson warns about (F as final, W as work, g as grams, a as area) and the other letters of the formula
`sb` | Symbols | What v<sub>i</sub>, x<sub>f</sub>, T<sub>i</sub> or Δv means | Choice; wrong choices are the other tag, "v times i", the change, initial minus final, and adding
`rw` | Words | Read a formula aloud, or pick the formula a sentence describes | Choice; wrong choices add instead of multiply, divide with no fraction bar, or use the wrong case or subscript
`ct` | Words | Which letter is the constant in W = mg or PV = nRT, what g is, where R comes from | Choice
`dt` | Change | ΔT for water warming, tea cooling, or T<sub>i</sub> and T<sub>f</sub> | Signed value, 1 decimal place, °C
`dv` | Change | Δv for a car speeding up, a bike slowing down, or v<sub>i</sub> and v<sub>f</sub> | Signed value, 1 decimal place, m/s
`dx` | Change | Δx from x<sub>i</sub> and x<sub>f</sub>, either sign | Signed value, 1 decimal place, m
`wg` | Substitution | W = mg with g = 9.8 m/s² for a backpack, a box or a dog | 2 significant figures, N
`pr` | Substitution | d = vt for a car, or F = ma for a cart | Fewest significant figures, m or N
`dn` | Substitution | D = m/V for a sample | Fewest significant figures, g/mL

A question's id is its generator key and parameters (`dv|d|12.0|4.0`), so `bank.rebuild(id)` makes the same question again; the browser tests use it. The calculation answers never need a trailing decimal point: a generator redraws its numbers when the rounded answer could not show its figures in standard notation, or when a known mistake would round to the right answer.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js` with exact fractions. Students may type a true minus or a hyphen, scientific notation, and a unit after the number (optional, since the prompt names it; if typed it must be right: N, newtons or kg·m/s² for a force). Significant figures are advice here: a correct value with extra digits is marked correct with "Correct value; check significant figures." The line under each question names the rounding (1 decimal place for a change, the significant figures for a substitution).

Specific feedback for the lesson's mistakes:

- Initial minus final: "Check the sign." and "Δ is final minus initial."
- Adding the two values for a change: "Δ means change in, so subtract."
- Dividing instead of multiplying, or adding, in W = mg, d = vt and F = ma.
- Dividing volume by mass, or multiplying, in D = m/V.

## Not practiced

Reading a formula aloud is practiced as choosing the right sentence, not as speaking or typing one. Italic variables are shown as plain letters with sub tags, as in the rest of the site.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only, so Tab, arrow keys, Enter and Space work as usual. Spanish follows the live lesson "Lectura de fórmulas" and the Style Kit: fórmula, variable, constante, subíndice (etiquetas con nombre), inicial / final, cambio en, final menos inicial, multiplicación implícita, mayúsculas y minúsculas, masa, masa molar, volumen, velocidad, peso, "por" for times and "entre" for divided by. New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.1: Patch bump for the shared practice engine (`shared/zsa-practice.js`), which gained an opt-in typed-equation question type used only by Rearranging Equations Practice. This page does not load the equation reader and its questions, scoring and text are unchanged.

1.0.0: Ten generators in four skills, Δ with its sign, advisory significant figures, specific feedback for common mistakes, lesson reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
