# Rearranging Equations Practice

Version: 1.1.0

Generated practice for the Quantitative Skills lesson [Rearranging Equations](https://zornscience.org/science/quantitative-skills/equations/rearranging-equations/). Every set is new. Three skills: solving for one variable, the first step, and rearranging, then calculating. A skill gives 8 questions (Solve mixes multiple choice and typed equations); Mixed review gives 12, four of each. English: `/qs-rearranging-equations-practice/`. Mexican Spanish: `/qs-rearranging-equations-practice/?lang=es`.

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
`ty` | Solve | The same 20 cases as `s1` and `s2`, asked as a typed equation (`t = d/v`); the three wrong choices of the multiple-choice twin are the known mistakes, with the same feedback | Typed equation, read as algebra
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

## Typed equations

Some Solve questions (`ty`) ask the student to type the rearranged equation. What is typed is read as algebra by `../shared/zsa-formula.js`, never compared as text: both sides are evaluated with exact fractions at 14 fixed sets of numbers, so the order of factors, `×`, `*`, `·`, `÷`, `/`, `1/v × d`, spaces and which side the letter is on do not matter.

| Typed for "Solve d = vt for t" | Result |
|---|---|
| `t = d/v`, `t = d ÷ v`, `t = 1/v × d`, `d/v = t`, `t = 2d/(2v)` | Correct |
| `t = v/d` | Incorrect: "This is upside down" (the lesson's mistake, same feedback as the multiple-choice twin) |
| `t = dv`, `t = d - v` | Incorrect: general note ("same step to both sides") |
| `c = q/mΔT` where `c = q/(mΔT)` is the key | Incorrect: note asking for parentheses (letters after `/` multiply on top, left to right) |
| `d = vt`, `t = d/v + t` | Not scored: "Get t alone on one side of the equals sign..." |
| `t = d/w`, `T = d/v` | Not scored: names the unknown letter and lists the letters to use |
| `t = d/v^2`, `t = d,v`, `t = d/v²` | Not scored: names the character it cannot read |
| `t`, `t = d = v`, `t = (d/v`, empty | Not scored: one message for each |

Not scored means nothing counts and the question stays open, so a typing slip is not a wrong answer. The hint under the question lists the letters and how to type them: a subscript is `vf` or `v_f`, and Δ is `ΔT`, `dT` or `deltaT`. Case matters (P and p are different letters). A lowercase `x` between two things also multiplies. Spanish messages are in `data.js` (`copy.es`) and the notes in `zsa-formula.js`.

Multiple-choice questions compare the chosen position with the key's, never the text; a typed number (the Calculate skill) is judged by value with exact fractions, so 1500, 1.5e3 and 1.50 × 10^3 are one answer. `tests/unit/qs-rearranging-equations-equivalence.test.js` also checks that no wrong multiple-choice option is secretly the same equation as the key.

## Not practiced

Rearrangements are chosen from four written formulas or typed as an equation (Solve), then used in the calculations. Typed equations with exponents (`v^2`) are not read; no formula practiced here needs one.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only. Spanish follows the live lesson "Despeje de ecuaciones" and the Style Kit: despejar ("despeja m"), reacomodar, dejar sola la variable, sustituir, operación opuesta, en ambos lados, orden inverso, deshacer, balanza, denominador, el atajo del triángulo, dividir entre. New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.1.0: Typed equations. A new generator `ty` asks the same 20 Solve cases as a typed equation, read as algebra with exact fractions by the new `shared/zsa-formula.js` (so `d = tv` is as right as `d = vt`, and `d = v/t` stays wrong), with the lesson's mistakes as feedback, messages for unreadable answers that do not count as an attempt, and English and Mexican Spanish text. The engine (`shared/zsa-practice.js`) shows the typed-equation block only on pages that load the reader; the other practice pages are unchanged.

1.0.0: Seven generators in three skills, the lesson's three mistakes as wrong choices and feedback, advisory significant figures, lesson reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
