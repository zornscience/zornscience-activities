# Substituting with Units Practice

Version: 1.0.1

Generated practice for the Quantitative Skills lesson [Substituting with Units](https://zornscience.org/science/quantitative-skills/equations/substituting-with-units/). Every set has new numbers. Four skills: units in a substitution, choosing the setup, answers with units, and converting before substituting. A skill gives 8 questions; Mixed review gives 12, three of each. English: `/qs-substituting-with-units-practice/`. Mexican Spanish: `/qs-substituting-with-units-practice/?lang=es`.

## Ideas (from the lesson)

- Substitute each value with its unit; units multiply, divide and cancel like letters: (12 m/s)(4.0 s) = 48 m.
- Named units: N = kg·m/s², J = N·m = kg·m²/s².
- Convert to kg, m and s before substituting: 425 g × (1 kg / 1000 g), 85 cm × (1 m / 100 cm).
- Predict the answer's unit, then check: t = d/v gives s (right); t = v/d gives 1/s (a wrong setup).
- Gas laws use kelvin: K = °C + 273, with R = 0.0821 L·atm/(mol·K).

Formulas used: D = m/V, d = vt, v = d/t, F = ma, W = Fd, KE = ½mv² (EC in Spanish), P = nRT/V.

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`ul` | Units | The unit left by a substitution with numbers: d = vt, v = d/t, F = ma, W = Fd, D = m/V, m = DV, KE = ½mv², P = nRT/V | Choice; wrong choices forget to cancel, flip, multiply instead of divide, or miss a square
`nu` | Units | Named units (kg·m/s², N·m, kg·m²/s², N, J) and the kelvin step before PV = nRT | Choice
`cf` | Units | The factor that changes grams to kilograms or centimeters to meters | Choice; wrong choices are upside down or use 100 for 1000 (or 1000 for 100)
`st` | Setup | Which setup gives a speed, time, force, work, kinetic energy or pressure in its unit | Choice; wrong choices skip the conversion (or keep °C), are upside down, or multiply instead of divide
`pu` | Setup | A student's setup (t = d/v or v/d, v = d/t or t/d, D = m/V or V/m): its unit, and whether it is right | Choice of the unit and the verdict
`qu` | Answers | v = d/t or D = m/V | Number and unit typed, fewest significant figures
`pd` | Answers | d = vt, F = ma (kg) or W = Fd (m) | Number and unit typed, fewest significant figures
`fc` | Convert | F = ma or KE = ½mv² with the mass in grams | Number and unit (N or J) typed, 3 significant figures
`wk` | Convert | W = Fd with the distance in centimeters | Number and J typed, 3 significant figures
`gp` | Convert | P = nRT/V with the temperature in °C | Number and atm typed, 3 significant figures

A question's id is its generator key and parameters (`fc|F|455|3.20`), so `bank.rebuild(id)` makes the same question again. Answers never need a trailing decimal point and never equal a known mistake after rounding; a generator redraws its numbers otherwise.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js` with exact fractions. The unit is part of the skill, so on the calculation questions it is required: a number with no unit is not scored and gets "Type the unit after the number." A wrong unit is marked incorrect with "Check the unit. This answer is in N." Named and base units both count: N, newton, newtons or kg·m/s²; J, joule, joules, N·m or kg·m²/s²; m/s, meters per second or metros por segundo; atm, atmospheres or atmósferas. Significant figures are advice, named in the line under each question. Specific feedback:

- Skipping the gram to kilogram conversion (1.46 × 10³ N instead of 1.46 N), or the centimeter to meter one (1020 J instead of 10.2 J).
- Using 1000 cm per meter (1.02 J).
- Using °C instead of kelvin in P = nRT/V (0.103 atm instead of 1.22 atm), or not dividing by V.
- Forgetting to square v or the ½ in KE = ½mv².
- An upside-down or multiplied setup for v = d/t and D = m/V.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only. Spanish follows the live lesson "Sustitución con unidades" and the Style Kit: sustituir, unidad, se cancelan, convierte antes de sustituir, predice la unidad, planteamiento, fuerza neta, trabajo, presión, rapidez (promedio), newton, joule, kelvin, energía cinética (EC). New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.1: Patch bump for the shared practice engine (`shared/zsa-practice.js`), which gained an opt-in typed-equation question type used only by Rearranging Equations Practice. This page does not load the equation reader and its questions, scoring and text are unchanged.

1.0.0: Ten generators in four skills, required units with named-unit equivalents, advisory significant figures, specific feedback for skipped conversions and °C, lesson reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
