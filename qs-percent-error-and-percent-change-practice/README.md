# Percent Error and Percent Change Practice

Version: 1.0.1

Generated practice for the Quantitative Skills lesson [Percent Error and Percent Change](https://zornscience.org/science/quantitative-skills/ratios-and-percents/percent-error-and-percent-change/). Every set has new numbers. Three skills: percent error, percent change, and setups and signs. A skill gives 8 questions; Mixed review gives 12, four of each. English: `/qs-percent-error-and-percent-change-practice/`. Mexican Spanish: `/qs-percent-error-and-percent-change-practice/?lang=es`.

## Rules (from the lesson)

- Percent error = |measured − accepted| ÷ accepted × 100. The accepted value (the true value scientists agree on) always goes on the bottom. The absolute value makes it positive; it is never negative.
- Percent change = (new − original) ÷ original × 100. Always new minus original, with the original on the bottom. Keep the sign: positive is an increase (written +35%), negative is a decrease (−25.0%).
- Significant figures follow the difference, as every example in the lesson does: the subtraction keeps the fewest decimal places, then the division keeps the fewest significant figures (98.6 °C against 100.0 °C is 1.4%; 1.60 to 4.30 m/s is 168.75%, or +169%). The lesson does not state this rule, so each question names the number of significant figures and they are scored as advice.

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`ec` | Percent error | A measured physical constant: the boiling point of water, g, the density of aluminum or copper, the speed of sound, the specific heat of water | The percent error, within 12%
`es` | Percent error | A lab standard or a molar mass: a balance and a standard mass, a standard rod, the molar mass of carbon dioxide or butane | The percent error
`ci` | Percent change | An increase in a plant's height, a gas's volume, a cart's speed, a pendulum's period, a sample's mass, a spring's length or a solution's concentration | A positive percent change, typed with or without +
`cd` | Percent change | A decrease in the same quantities | A negative percent change; without the − it is wrong
`sb` | Setups and signs | Percent error or percent change numbers | Choice: the right setup; the wrong value on the bottom, no subtraction or the wrong order, and a missing or extra absolute value are the wrong choices
`sm` | Setups and signs | A percent change such as −12% for a mass, volume or length | Choice: what it means (down by 12% of the original); the wrong direction, 12 g, and "the new value is 12% of the original" are the wrong choices
`sd` | Setups and signs | An original and a new value | Choice: the sign and the direction; the opposite sign, the opposite direction and "needs an accepted value" are the wrong choices

Both values in a question have the same decimal places, as one instrument reads them, and the difference always shows at least two significant figures. A question's id is its generator key and parameters (`ec|boil|98.6|100.0`), so `bank.rebuild(id)` makes the same question again; the browser tests use it.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js` with exact fractions, so ties round half up. A percent may be typed as 4.1, 4.1%, 4.1 percent or 4.1 por ciento; an increase as 35 or +35; a decrease as -25.0 or −25.0. A decrease typed without its negative sign is marked wrong.

Significant figures are advice: the line under each question says how many to keep, and the right value with a different number of figures is marked correct, with a note.

Specific feedback for the lesson's warnings:

- Percent error: the measured value on the bottom, skipping the subtraction (104%), forgetting × 100, and a negative sign.
- Percent change: the new value on the bottom, the subtraction in the wrong order or the sign dropped, skipping the subtraction, and forgetting × 100.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only: the topic menu, radio buttons, one text field and buttons, so Tab, arrow keys, Enter and Space work as usual; question and results headings take focus, feedback is announced, and the language links and dialogs follow the shared header. Spanish follows the Style Kit glossary: porcentaje de error for percent error (the live lesson says error porcentual; its title, Error porcentual y cambio porcentual, is kept where the lesson is named), cambio porcentual, valor aceptado, valor medido, valor absoluto, nuevo, original, aumento, disminución. New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.1: Patch bump for the shared practice engine (`shared/zsa-practice.js`), which gained an opt-in typed-equation question type used only by Rearranging Equations Practice. This page does not load the equation reader and its questions, scoring and text are unchanged.

1.0.0: Seven generators in three skills, advisory significant figures that follow the difference, a scored sign for percent change, specific feedback for common mistakes, rules reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
