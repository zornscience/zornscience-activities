# Scientific Notation Practice

Version: 1.0.0

Generated practice for the Quantitative Skills lesson [Scientific Notation](https://zornscience.org/science/quantitative-skills/numbers/scientific-notation/). Every set has new numbers. Three skills: writing numbers in scientific notation, writing them back in standard notation, and reading scientific notation. A skill gives 8 questions; Mixed review gives 12, four of each. English: `/qs-scientific-notation-practice/`. Mexican Spanish: `/qs-scientific-notation-practice/?lang=es`.

## Rules (from the lesson)

- The first number (coefficient) is at least 1 and less than 10 (3.2 works, 32 and 10.0 do not). The base is always 10.
- The exponent is how many places the decimal point moved: positive for numbers bigger than 1 (45,000 = 4.5 × 10⁴), negative for numbers less than 1 (0.0062 = 6.2 × 10⁻³).
- Back to standard notation, a positive exponent moves the point right and a negative one moves it left; empty places are filled with zeros.
- The coefficient keeps the number's own digits: 300,000,000 is 3 × 10⁸ and 2,600,000 is 2.6 × 10⁶, as in the lesson.

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`sb` | To scientific notation | A number bigger than 1: 1 to 4 significant digits then zeros (150,000,000,000), or with a decimal part (207.5) | Scientific notation, required
`ss` | To scientific notation | A number less than 1 (0.0000075) | Scientific notation, required
`pb` | To standard notation | A positive exponent, coefficient ending in a nonzero digit so the zeros only hold places | Standard notation, required
`ps` | To standard notation | A negative exponent | Standard notation, required
`rf` | Reading | Multiple choice: which of four equal values (3.8 × 10⁵, 38 × 10⁴, 0.38 × 10⁶, 380 × 10³) is correct scientific notation | Choice, with the reason for each wrong one
`rm` | Reading | Multiple choice: what the exponent says (bigger or less than 1, which way and how many places), with "negative number" and "multiply by the exponent" as distractors | Choice

## Checking answers

Judged by `M.judge` (`../shared/zsa-practice-model.js`). Scientific notation may be typed as 4.5 x 10^4, 4.5×10^(4), 4.5*10**4, 4.5 × 10⁴ or 4.5e4; standard notation as 45000 or 45,000. Where the question asks for scientific notation, standard notation is marked incorrect with a note, and so is a coefficient of 10 or more or less than 1 (the value is still right, and the note says so). Where it asks for standard notation, a power of 10 is marked incorrect. Notes name the mistakes the lesson warns about:

- The wrong sign on the exponent.
- An exponent one off from the places moved.
- Moving the point the wrong way, or one place too far, going back to standard notation.

Significant figures are advice here: the coefficient should keep the number's digits, and extra or missing digits get a note. A unit after the number is optional; if typed, it must match.

## Interface and Spanish

Runs on the shared question-set engine with the generated-bank options (`../shared/README.md`). Native controls only, so Tab, arrow keys, Enter and Space work as usual. Spanish follows the live lesson and the Style Kit: notación científica, notación estándar, exponente positivo / negativo, punto decimal, dígito distinto de cero, "llena los lugares vacíos con ceros". New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.0: Six generators in three skills, required notation with specific feedback, rules reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
