# Rearranging Equations Practice

Version: 1.0.0

Generated practice for the Quantitative Skills lesson [Rearranging Equations](https://zornscience.org/science/quantitative-skills/equations/rearranging-equations/). Every set is new. Three skills: solving for one variable, the first step, and rearranging, then calculating. A skill gives 8 questions; Mixed review gives 12, four of each. English: `/qs-rearranging-equations-practice/`. Mexican Spanish: `/qs-rearranging-equations-practice/?lang=es`.

## Ideas (from the lesson)

- Solve for the variable with letters first, then substitute the numbers.
- An equation is a balance: do the same step to both sides, with the opposite operation.
- Undo steps in reverse order: F = 1.8C + 32 becomes C = (F − 32)/1.8.
- A variable in the denominator: multiply both sides by it, then divide (D = m/V gives DV = m, so V = m/D).
- The triangle shortcut works only for three-letter formulas like A = BC, and only to check.

Rearrangements used: t = d/v, v = d/t, a = F/m, m = F/a, m = W/g, m = DV, V = m/D, c = q/(mΔT), m = q/(cΔT), ΔT = q/(mc), n = PV/(RT), V = nRT/P, T = PV/(nR), a = (v<sub>f</sub> − v<sub>i</sub>)/t, t = (v<sub>f</sub> − v<sub>i</sub>)/a, v<sub>i</sub> = v<sub>f</sub> − at, t = (x<sub>f</sub> − x<sub>i</sub>)/v, v = (x<sub>f</sub> − x<sub>i</sub>)/t, x<sub>i</sub> = x<sub>f</sub> − vt, C = (F − 32)/1.8.

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`s1` | Solve | Solve a one-step formula (d = vt, F = ma, W = mg, D = m/V, q = mcΔT, PV = nRT) for one letter, 13 cases | Choice of four rearranged formulas; wrong choices are upside down, multiplied instead of divided, and subtracted
`s2` | Solve | Solve v<sub>f</sub> = v<sub>i</sub> + at, x<sub>f</sub> = x<sub>i</sub> + vt or F = 1.8C + 32, 7 cases | Choice; wrong choices undo the steps in the wrong order, add instead of subtract, or are upside down
`fs` | First step | The first step for any of the 20 cases above | Choice; wrong choices use the wrong operation, the wrong order, or one side only (the balance)
`tr` | First step | Which formula the triangle shortcut can check, or what it is for | Choice
`dn` | Calculate | Mass or volume from a real density (aluminum, copper, iron, lead, mercury, gold, ethanol, silver) | 3 significant figures, g or mL
`sh` | Calculate | c from q, m and ΔT for a metal, or m from q, ΔT and the c of water, aluminum, iron or copper | 3 significant figures, J/(g·°C) or g
`tw` | Calculate | a from a speed change and time, t from two positions and a velocity, or C from a Fahrenheit reading | Fewest significant figures (the difference keeps its decimal places), m/s², s or °C

The heat q is made from a real specific heat and rounded to 3 significant figures like a measurement, so a calculated c is within 1% of a real metal. Answers never need a trailing decimal point and never equal a known mistake after rounding; a generator redraws its numbers otherwise. A question's id is its generator key and parameters (`sh|c|269|12.0|50.0`), so `bank.rebuild(id)` makes the same question again.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js` with exact fractions. The unit is optional (the prompt names it); if typed it must be right, with common spellings accepted (J/(g·°C), J/g°C, m/s^2, seconds, grados Celsius). Significant figures are advice, named in the line under each question. Specific feedback for the lesson's mistakes:

- Upside down (V = D/m, c = mΔT/q, t/(v<sub>f</sub> − v<sub>i</sub>)).
- Multiplying instead of dividing (V = mD).
- The wrong order: v<sub>f</sub> − v<sub>i</sub>/t, F/1.8 − 32, or q/m × ΔT without the parentheses.
- Adding instead of subtracting (F + 32), and using F = 1.8C + 32 forward.

## Equivalent answers

Nothing here compares typed formulas, so there is no string match to loosen. A rearrangement is chosen from four written formulas and the engine compares the chosen position with the key's, not the text; a typed number is judged by value with exact fractions, so 1500, 1.5e3 and 1.50 × 10^3 are one answer. What could still go wrong is a wrong choice that is secretly the same equation as the key (d = vt next to d = tv), which would mark a right answer wrong. `tests/unit/qs-rearranging-equations-equivalence.test.js` reads every choice of all 20 solve cases as algebra (parsed expressions tested at random numbers, `tests/support/equation-equivalence.js`) and checks that only the key is equivalent to the true rearrangement, and that d = v/t, t = v/d, F/1.8 − 32 and the other mistakes are never equivalent to it.

## Not practiced

Free symbolic input is not needed: rearrangements are chosen from four written formulas, then used in the calculations.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only. Spanish follows the live lesson "Despeje de ecuaciones" and the Style Kit: despejar ("despeja m"), reacomodar, dejar sola la variable, sustituir, operación opuesta, en ambos lados, orden inverso, deshacer, balanza, denominador, el atajo del triángulo, dividir entre. New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.0: Seven generators in three skills, the lesson's three mistakes as wrong choices and feedback, advisory significant figures, lesson reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
