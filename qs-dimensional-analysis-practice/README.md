# Dimensional Analysis Practice

Version: 1.0.0

Generated practice for the Quantitative Skills lesson [Dimensional Analysis](https://zornscience.org/science/quantitative-skills/units/dimensional-analysis/). Every set has new numbers. Four skills: chains of factors, rates and densities, squared and cubed units, and units of the result. A skill gives 8 questions; Mixed review gives 12, three of each. English: `/qs-dimensional-analysis-practice/`. Mexican Spanish: `/qs-dimensional-analysis-practice/?lang=es`.

## Rules (from the lesson)

- Map the path first: the starting unit and the goal, one factor per step. Chain the factors so each unit cancels (1.5 h × (60 min / 1 h) × (60 s / 1 min) = 5400 s).
- Rates: convert one unit at a time. Hours on the bottom of km/h go on top of their factor (90.0 km/h × (1000 m / 1 km) × (1 h / 3600 s) = 25.0 m/s).
- Squared and cubed units: square or cube the whole factor, numbers and units, written (100 cm / 1 m)³. 1 m² = 10,000 cm², 1 m³ = 1,000,000 cm³, and 1 cm³ = 1 mL exactly (0.355 L = 355 cm³).
- Let the units check the setup: m/s × s gives m; dividing instead gives m/s², so that setup is wrong.
- Every factor is exact, so answers keep the measurement's significant figures, in scientific notation when zeros at the end would be unclear (2.50 d = 3.60 × 10³ min; 2.70 g/cm³ = 2.70 × 10³ kg/m³).

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`ct` | Chains | Time: d, h, min and s, two or three steps (8.02 d to s) | Number, unit optional
`cl` | Chains | Length (km, m, cm, mm), mass (kg, g, mg) and volume (L, mL, cm³), two steps | Number, unit optional
`sp` | Rates and densities | Speeds: km/h, m/s, m/min, cm/s | Number, unit optional
`fd` | Rates and densities | Flow rates (L/min, mL/s, L/h, g/min, kg/h) and densities (g/mL, kg/L, mg/mL, g/L) | Number, unit optional
`sq` | Squared and cubed | m² and cm², km² and m² | Number, unit optional
`cu` | Squared and cubed | m³, cm³, mm³ and m³ to L | Number, unit optional
`dc` | Squared and cubed | g/cm³ and kg/m³ (a cubed factor on the bottom) | Number, unit optional
`ur` | Units of the result | What unit a setup gives: m/s × s, m ÷ m/s, m/s ÷ s, g/mL × mL, g ÷ g/mL, g ÷ cm³, L/min × min | Choice: the right unit and three slips (divided instead of multiplied, a unit that did not cancel)
`uk` | Units of the result | Which two-factor setup converts the measurement | Choice: the right chain, either factor flipped, both flipped

Measurements have 2 to 4 significant figures in realistic ranges (20 to 150 km/h, 0.6 to 13.6 g/mL), in standard notation, or in scientific notation when a whole number would need zeros that do not count (4.32 × 10⁵ s). Answers are in standard notation when it shows the significant figures plainly (5400 s, 25.0 m/s, 750 L) and in scientific notation otherwise: below 0.001, above 99,999, or when zeros at the end would be unclear (3.60 × 10³ min, 1.23 × 10³ km/h). Both forms are accepted. A question's id is its generator key, problem and measurement (`ct|d>s|8.02`), so `bank.rebuild(id)` makes the same question again; the browser tests use it.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js` with exact fractions. The unit is optional because the prompt names the goal; if typed, it must be the right one: m³, m^3 and m3 are alike, and names in English or Spanish are accepted (cubic centimeters, kilómetros por hora). Significant figures are advice, with a note, and plain whole numbers whose zeros cannot show the figures get the scientific notation note. Specific feedback:

- One factor upside down: which unit goes on the bottom, or on top when it was on the bottom of a rate.
- A step left out: follow the path to the end; for a rate or density, convert both parts.
- A squared or cubed factor whose number was not squared or cubed (100 for cm³ per m³), and a factor squared instead of cubed.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only, so Tab, arrow keys, Enter and Space work as usual. Spanish follows the live lesson and the Style Kit: análisis dimensional, traza el camino, encadena factores, unidades al cuadrado y al cubo, eleva al cubo el factor, centímetro cúbico, meta, razón de cambio, planteamiento, densidad. New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.0: Nine generators in four skills, advisory significant figures with scientific notation where zeros would be unclear, specific feedback for flipped factors, missing steps and powers, method reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
