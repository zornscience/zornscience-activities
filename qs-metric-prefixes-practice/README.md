# Metric Prefixes Practice

Version: 1.0.1

Generated practice for the Quantitative Skills lesson [Metric Prefixes](https://zornscience.org/science/quantitative-skills/units/metric-prefixes/). Every set has new numbers. Three skills: prefix meanings, the prefix ladder, and converting. A skill gives 8 questions; Mixed review gives 12, four of each. English: `/qs-metric-prefixes-practice/`. Mexican Spanish: `/qs-metric-prefixes-practice/?lang=es`.

## Rules (from the lesson)

- Six prefixes and the base unit, top to bottom: mega (M) 10⁶, kilo (k) 10³, the base unit (m, g or L) 10⁰, centi (c) 10⁻², milli (m) 10⁻³, micro (μ, the Greek letter mu) 10⁻⁶, nano (n) 10⁻⁹. No deci, deka, hecto, giga or pico.
- Capital M is mega; lowercase m is milli.
- The prefix ladder: the number of places between two rungs is the difference of their exponents (gaps of 3, 3, 2, 1, 3 and 3 places).
- Down the ladder to a smaller unit, the decimal point moves right: smaller unit, bigger number (1.5 km = 1500 m). Up the ladder it moves left (325 mg = 0.325 g).
- Zeros at the end stay, so a conversion keeps the measurement's significant figures (25.0 mL = 0.0250 L). Very small or large results use scientific notation (532 nm = 5.32 × 10⁻⁷ m).

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`pw` | Meanings | "In 4.5 mg, what power of ten does the prefix stand for?" | Choice; the M or m look-alike is always a wrong choice
`pp` | Meanings | "Which prefix means 10⁻⁶?" | Choice of prefix name and symbol
`sy` | Meanings | "How do you write 37 nanograms with a symbol?" (case matters: mg, Mg) | Choice
`pl` | Ladder | Places to move the decimal point between two rungs, with a measurement | Exact whole number ("5", "5 places", "5 lugares")
`dr` | Ladder | Which way and how far the point moves | Choice: right count and side against the wrong side and the wrong count
`eq` | Ladder | Which measurement equals the one given | Choice: the same mistakes as numbers
`dn` | Converting | To a smaller unit, at most 6 places, answer in standard notation | Number, unit optional
`up` | Converting | To a larger unit, at most 6 places, answer in standard notation | Number, unit optional
`sc` | Converting | At least 6 places (nm to m, Mg to mg), answer in scientific notation | Number, unit optional

The wrong count on the ladder is one place per rung, or three places for every rung when that happens to equal the rung count (centi and milli are 1 place apart). Converting answers keep the measurement's significant figures; a generator redraws when standard notation could not show them (1.50 km is never asked in m). A question's id is its generator key and parameters (`dn|0.075|m|u|m`: 0.075 mm to μm; `b` is the base unit and `u` is micro), so `bank.rebuild(id)` makes the same question again; the browser tests use it.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js` with exact fractions. Students may type standard or scientific notation (5.32e-7, 5.32 x 10^-7, 5.32 × 10⁻⁷) and a unit after the number. Unit symbols keep their case, so mm and Mm differ; μ, the micro sign µ and u are accepted for micro, and l for L. Spelled-out names are accepted in English and Spanish, with or without accents (kilometers, kilómetros, kilometros).

Moving the decimal point is the skill, so significant figures are advice: the right value with more or fewer figures counts, with a note (0.025 L for 0.0250 L says the zero at the end counts). Specific feedback:

- Moving the point the wrong way: going down the ladder makes the number bigger, going up makes it smaller.
- Counting rungs instead of places, or three places for every rung: the exponents differ by the right number.
- Reading capital M as milli or lowercase m as mega.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only, so Tab, arrow keys, Enter and Space work as usual. Spanish follows the live lesson and the Style Kit: prefijo métrico, unidad base, potencia de diez, escalera de prefijos, peldaño, mueve el punto decimal, lugares; mili (not milli), kilómetros, micrómetros, nanómetros. New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.1: Patch bump for the shared practice engine (`shared/zsa-practice.js`), which gained an opt-in typed-equation question type used only by Rearranging Equations Practice. This page does not load the equation reader and its questions, scoring and text are unchanged.

1.0.0: Nine generators in three skills, advisory significant figures, specific feedback for the wrong direction, the wrong count and M for m, ladder reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
