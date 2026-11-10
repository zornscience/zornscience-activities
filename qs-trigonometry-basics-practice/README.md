# Trigonometry Basics Practice

Version: 1.0.1

Generated practice for the Quantitative Skills lesson [Trigonometry Basics](https://zornscience.org/science/quantitative-skills/advanced-tools/trigonometry-basics/). Every set has new numbers. Four skills: naming the sides, SOH CAH TOA, finding a side and finding an angle. A skill gives 8 questions; Mixed review gives 12, three of each. English: `/qs-trigonometry-basics-practice/`. Mexican Spanish: `/qs-trigonometry-basics-practice/?lang=es`.

## Rules (from the lesson)

- In a right triangle the hypotenuse is across from the 90° angle. It is the longest side, and it never changes.
- Opposite and adjacent are named from θ: mark θ first. The opposite side is across from θ, the adjacent side is the leg next to θ. Change the angle and they swap.
- SOH CAH TOA: sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent.
- Finding a side: label the known and wanted sides, pick the ratio that uses both, solve (multiply when the wanted side is on top, divide when it is on the bottom). A leg is shorter than the hypotenuse.
- Finding an angle: sin⁻¹, cos⁻¹ or tan⁻¹ (2nd, then the key). The −1 means undo, not 1 over.
- Degree mode only: sin(30) gives 0.5; −0.988 means radian mode.

Lengths and ratios round to 2 significant figures and angles to the nearest degree, as in the lesson's worked examples. Spanish writes sine as sen θ and sen⁻¹; calculator keys stay SIN, COS and TAN; SOH CAH TOA keeps its English expansion, marked `lang="en"`.

## The triangle

Questions that name sides by letter show one static, accessible SVG right triangle (`data-zsa-practice-visual="triangle"`, flag `triangle:true`): θ at the bottom left, the right angle at the bottom right, side a vertical (opposite θ), side b along the bottom (adjacent to θ), side c slanted (the hypotenuse), and a dashed mark for the other acute angle at the top. It has a bilingual title and description that give positions, not names, so they do not answer the naming questions, and a "Not to scale." caption, since the lengths in the prompts change. It adds no focusable element. Sizes and strokes are in `diagrams.css`, scoped to `.zsa-qtb`.

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`sn` | Naming | The triangle with three lengths (a scaled Pythagorean triple): which side is the hypotenuse, opposite θ, adjacent to θ, or opposite or adjacent to the other acute angle | Choice; wrong choices are the other sides and a misconception (it depends on θ, the longest side, both sides that touch θ, only θ has an opposite side)
`sc` | Naming | A ladder, ramp, tree or kite with θ at the ground, the same five questions in words | Choice
`sr` | SOH CAH TOA | The triangle with three lengths: which ratio equals sin θ, cos θ or tan θ | Choice; the other two ratios and the upside-down one
`rv` | SOH CAH TOA | The triangle with three lengths: the value of sin θ, cos θ or tan θ | 2 significant figures (advice); traps: upside-down ratio, the other two ratios
`fs` | Finding a side | The triangle with θ and one side: any of the six known and wanted pairs | 2 significant figures with the unit optional; traps: wrong function, multiply instead of divide (or the reverse), radian mode
`fc` | Finding a side | Ramp height, ramp run from its rise (divide by tan), ramp length, ladder height, base and length, tree height, kite height | Same as `fs`, in meters
`fm` | Finding a side | A student's negative length from one of those problems: what went wrong | Choice: radian mode; the wrong function and the other operation each show the value they give, and "a length can be negative" is answered
`fa` | Finding an angle | The triangle with two sides (opposite and hypotenuse, adjacent and hypotenuse, or both legs) | Nearest degree, 11° to 88° and never 45°; traps: the other acute angle (upside-down ratio or wrong inverse), tan⁻¹ with the hypotenuse, sin⁻¹ without it, radian mode
`fx` | Finding an angle | Ladder against a wall, ramp, roof, tree, kite | Same as `fa`
`ak` | Finding an angle | The triangle with two sides: which expression gives θ | Choice: f⁻¹(x/y); 1/f(x/y) (the −1 is not 1 over), f(x/y), and the upside-down ratio or the wrong inverse

A question's id is its generator key and parameters (`fs|ca|35|10.0|m`), so `bank.rebuild(id)` makes the same question again; the browser tests use it.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js`. Answers from trigonometry are stored as 17-digit decimal strings. A value within 1e-9 (relative) of a rounding tie is drawn again, and so is a value whose third significant figure rounds to a 5 (18.4977 is 18.5 to three figures), so a student who keeps three figures and one who rounds once never get different answers. An answer that would need zeros at the end to count (40, 120) is never drawn; side answers stay below 100. Ratios are exact fractions of the given lengths.

Rounding is advice here, not the skill: a right value with extra digits (5.736 for 5.7) is correct, with a note to round to 2 significant figures. The unit is optional; if typed it must be right: m, meters, metros; cm, centimeters, centímetros; for angles °, º, deg, degrees, grados. A ratio has no unit. Mistakes the lesson warns about get their own note: radian mode, the upside-down ratio, the wrong function, multiplying when you should divide (and the reverse, with the reminder that a leg is shorter than the hypotenuse), and the other acute angle. A mistake that rounds to the right answer, or lies within 1e-9 of a rounding tie, is left out.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only: the topic menu, radio buttons, one text field and buttons; the triangle is not focusable. Spanish follows the Style Kit and the live Spanish lesson: triángulo rectángulo, ángulo recto, hipotenusa, lado opuesto, lado adyacente, cateto, seno, coseno, tangente, función trigonométrica inversa, modo de grados, radianes. New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.1: Patch bump for the shared practice engine (`shared/zsa-practice.js`), which gained an opt-in typed-equation question type used only by Rearranging Equations Practice. This page does not load the equation reader and its questions, scoring and text are unchanged.

1.0.0: Ten generators in four skills, the labeled triangle, advisory rounding with traps for radian mode, the upside-down ratio and the wrong function, rules reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
