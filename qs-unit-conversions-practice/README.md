# Unit Conversions Practice

Version: 1.0.1

Generated practice for the Quantitative Skills lesson [Unit Conversions](https://zornscience.org/science/quantitative-skills/units/unit-conversions/). Every set has new numbers. Three skills: conversion factors, setting up and converting, and exact factors and significant figures. A skill gives 8 questions; Mixed review gives 12, four of each. English: `/qs-unit-conversions-practice/`. Mexican Spanish: `/qs-unit-conversions-practice/?lang=es`.

## Rules (from the lesson)

- One conversion factor per problem. A factor is an equality written as a fraction; each equality gives two factors, and each equals 1, so the amount does not change.
- Factor-label setup: the new unit on top and the starting unit on the bottom, then cross out the units that cancel (3 ft × (12 in / 1 ft) = 36 in). If nothing cancels (s²/min), flip the factor (150 s × (1 min / 60 s) = 2.5 min).
- Defined equalities are exact: unlimited significant figures, so they never limit the answer. The answer keeps the measurement's significant figures (4.25 h is 255 min; 2.75 h is 165 min, not 200 min).
- Exact equalities used: 1 min = 60 s, 1 h = 60 min, 1 d = 24 h, 1 yd = 3 ft, 1 ft = 12 in, 1 in = 2.54 cm. Factors are written inline in parentheses: (60 s / 1 min).

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`fe` | Conversion factors | Which factor converts the measurement | Choice: the right factor, flipped, numbers swapped (it cancels but says 1 s = 60 min), both
`fl` | Conversion factors | A setup with the factor upside down: what went wrong | Choice: the units come out as s²/min, so flip the factor
`f1` | Conversion factors | Why the converted amount is the same amount | Choice: the factor equals 1
`st` | Setting up and converting | Which setup converts the measurement, written like 5.0 ft × (12 in / 1 ft) | Choice: right, flipped, numbers swapped, divided by the factor
`cm` | Setting up and converting | To a smaller unit (multiply by the factor) | Number, unit optional; significant figures as advice
`cd` | Setting up and converting | To a larger unit (divide) | Number, unit optional; significant figures as advice
`es` | Exact factors and significant figures | A conversion where the factor's numbers have fewer figures than the measurement | Number; significant figures scored
`em` | Exact factors and significant figures | A calculator result: which rounding is right | Choice: rounded to 1 figure (the 1 in 1 h), to the factor's figures, every digit, one more or one less
`ew` | Exact factors and significant figures | Which number limits the significant figures | Choice: only the measurement

Measurements have 2 to 4 significant figures (3 or 4 in the exact-factor skill, so a factor-limited answer is always different), in realistic ranges (0.5 to 90 min, 20 to 900 s, 2 to 200 cm). A generator redraws when standard notation could not show the answer clearly: its significant figures must show, and rounding must not leave zeros that only hold places (258 s to 2 figures is never asked). The first skill uses time, yards and feet only: the generic browser check for English left on the Spanish page reads the inch symbol "in" as an English word, and the first skill is the one it plays. Inches appear in the other two skills; in the reference, the symbol carries `lang="en"`.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js` with exact fractions (2.54 divides exactly). The unit is optional because the prompt names the new unit; if typed, it must be the right one: symbols (s, min, h, d, yd, ft, in, cm) or names in English or Spanish (seconds, segundos, pulgadas). Specific feedback:

- The factor upside down: put the new unit on top and the starting unit on the bottom.
- Rounded as if the factor limited the answer (to 1 figure, or to 2 for 12 and 24, or 3 for 2.54): the equality is exact, so keep the measurement's figures. The lesson's quiz answer 200 min for 2.75 h gets this note.

Significant figures are advice while converting (the right value with more figures counts, with a note) and are scored in Exact factors and significant figures, where choosing them is the skill; that skill's instruction line does not give the count away.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only, so Tab, arrow keys, Enter and Space work as usual. Spanish follows the live lesson and the Style Kit: factor de conversión, igualdad, unidad nueva arriba y unidad inicial abajo, tacha las unidades que se cancelan, voltea el factor, factores exactos, planteamiento, pulgadas and pies (symbols stay in and ft). New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.1: Patch bump for the shared practice engine (`shared/zsa-practice.js`), which gained an opt-in typed-equation question type used only by Rearranging Equations Practice. This page does not load the equation reader and its questions, scoring and text are unchanged.

1.0.0: Nine generators in three skills, advisory and scored significant figures, specific feedback for an upside-down factor and a factor that limits significant figures, method and equalities reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
