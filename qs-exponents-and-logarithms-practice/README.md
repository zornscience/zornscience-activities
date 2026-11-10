# Exponents and Logarithms Practice

Version: 1.0.0

Generated practice for the Quantitative Skills lesson [Exponents and Logarithms](https://zornscience.org/science/quantitative-skills/advanced-tools/exponents-and-logarithms/). Every set has new numbers. Four skills: exponent rules, scientific notation, logarithms, and pH. A skill gives 8 questions; Mixed review gives 12, three of each. English: `/qs-exponents-and-logarithms-practice/`. Mexican Spanish: `/qs-exponents-and-logarithms-practice/?lang=es`.

## Rules (from the lesson)

- Multiplying powers of ten adds the exponents (10³ × 10⁴ = 10⁷, not 10¹²). Dividing subtracts them, top minus bottom, and the result can be negative (10² ÷ 10⁵ = 10⁻³). A power of a power multiplies them ((10³)² = 10⁶; (10⁻² m)² = 10⁻⁴ m²).
- 10⁰ = 1. A negative exponent means a number between 0 and 1, not a negative number.
- Scientific notation: multiply or divide the coefficients, add or subtract the exponents, then adjust (15 × 10¹⁰ = 1.5 × 10¹¹).
- log asks "10 to what power?" Base 10 only. The log of a power of ten is its exponent, and numbers below 1 have negative logs.
- pH = −log[H⁺] with [H⁺] in M (mol/L). Back again: [H⁺] = 10^(−pH) with 10ˣ (2nd, LOG). Significant figures in [H⁺] = decimal places in the pH, and the reverse; check by bracketing between powers of ten.

The lesson does not teach natural logs or the product and quotient rules for logs, so no question needs them. The LN key appears only in one feedback note, for a student who pressed it by mistake.

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`rm` | Exponent rules | 10ᵃ × 10ᵇ as one power of ten | The exponent, exact
`rd` | Exponent rules | 10ᵃ ÷ 10ᵇ, sometimes with a = b (10⁰ = 1) | The exponent, exact
`rp` | Exponent rules | (10ᵃ)ᵇ, or the area or volume of a square or cube 10ᵃ m on a side | The exponent, exact
`sm` | Scientific notation | Multiply two numbers in scientific notation, or light's distance in a time (the lesson's example) | Scientific notation required; significant figures advised
`sd` | Scientific notation | Divide two numbers in scientific notation (the quiz), or light's travel time over a distance | Scientific notation required; significant figures advised
`sz` | Scientific notation | Which number equals c × 10ⁿ, for n from 0 down to −6 | Choice of four: the number, a negative number, the sign ignored, one place too many
`lp` | Logarithms | log of a power of ten, written as 10ⁿ or as 1,000 or 0.001 | Whole number, exact
`lb` | Logarithms | log of a number such as 4,500 or 0.0045 is between which two whole numbers? | Choice of four, each wrong choice with its reason
`lu` | Logarithms | If log(x) = n, what is x? | 10^n or the number
`ph` | pH | pH from [H⁺] = c × 10⁻ⁿ M (2 or 3 significant figures) | Decimal places scored (`sf:"strict"`, `{decimals:n}`)
`hc` | pH | [H⁺] from a pH with 1 to 3 decimal places | Significant figures scored (`sf:"strict"`, `{sf:n}`); M or mol/L

Logs are irrational, so pH and [H⁺] answers are stored as 17-digit decimal strings (from `Math.log10` and `Math.pow`), and a problem whose value is within 1e-9 of a rounding tie, or whose coefficient would round up to 10, is drawn again. A question's id is its generator key and parameters (`ph|6.3|5` is the quiz's [H⁺] = 6.3 × 10⁻⁵ M), so `bank.rebuild(id)` makes the same question again; the browser tests use it.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js`. Students may type 10^-3, 4.2 x 10^8, 4.2×10^(−8), 4.2e8 or 4.2 × 10⁸, and a unit after the number. For exponent and log questions the answer is a whole number; typing the whole power of ten (10^7 instead of 7) gets its own note.

The pH questions practice the lesson's precision rule, so precision is scored: 4.2 for a pH of 4.20 and 1.995 × 10⁻³ for 2.0 × 10⁻³ M are marked incorrect, with a note. The line under the question names the rule but not the count. Scientific notation answers must be in scientific notation (1.5 × 10¹¹, not 150,000,000,000), and a coefficient left at 10 or more, or below 1, gets the shared note about the first number.

Known mistakes get their own feedback: multiplying exponents that should be added, subtracting bottom minus top, adding when dividing, adding exponents of a power of a power, a sign dropped from a negative exponent, counting digits instead of zeros, positive logs for numbers below 1, a negative number for a negative log, the exponent alone as the pH, pressing LN, 10^(+pH), and taking LOG again instead of 10ˣ.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only: the topic menu, radio buttons, one text field and buttons, so Tab, arrow keys, Enter and Space work as usual; question and results headings take focus, feedback is announced, and the language links and dialogs follow the shared header. Spanish follows the live lesson and the Style Kit: exponente, logaritmo (log), potencia de diez, coeficientes, suma, resta y multiplica los exponentes, potencia de una potencia, exponente cero, exponente negativo, concentración de iones de hidrógeno, tecla LOG, segunda función, lugares decimales, deshaz el log, notación científica, cifras significativas. New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.0: Eleven generators in four skills, scored precision for pH, specific feedback for common mistakes, rules reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
