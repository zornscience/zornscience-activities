# Vectors Practice

Version: 1.0.0

Generated practice for the Quantitative Skills lesson [Vectors](https://zornscience.org/science/quantitative-skills/advanced-tools/vectors/). Every set has new numbers. Four skills: scalars and vectors, same and opposite directions, perpendicular vectors, and components. A skill gives 8 questions; Mixed review gives 12, three of each. English: `/qs-vectors-practice/`. Mexican Spanish: `/qs-vectors-practice/?lang=es`.

## Rules (from the lesson)

- A scalar has a size only; a vector has a magnitude and a direction. Speed is a scalar, velocity a vector; distance a scalar, displacement a vector.
- An arrow's length shows the magnitude with a scale (1 square = 10 N), and it points from its tail to its tip.
- Tip to tail: the resultant runs from the first tail to the last tip, in any order. Same direction: add. Opposite directions: subtract, and the resultant takes the larger one's direction.
- Perpendicular vectors: R = √(A² + B²), with the direction from tan⁻¹ stated in compass form (53° north of east).
- Components: R<sub>x</sub> = R cos θ and R<sub>y</sub> = R sin θ with θ from the horizontal; from the vertical, sin and cos switch.

Directions are compass words (east, west, north, south, upward, downward) or "above the horizontal", as in the lesson: no angles counterclockwise from +x, no signed or quadrant components. Spanish writes components as R sen θ and directions as al norte del este, hacia arriba.

## Generators

Key | Skill | Problem | Answer
--- | --- | --- | ---
`sv` | Scalars and vectors | Which of four quantities with the same number is a vector (or the one scalar among three vectors): 15 N upward, 15 m/s east against 15 kg, 15 s, 15 m/s (a speed), 15 km (a distance), 15 °C, 15 J, 15 mL | Choice, with the reason for each wrong one
`sa` | Scalars and vectors | An arrow n squares long with its tip pointing a given way, and a scale (1 square = 10 N) | Choice: n × scale with the direction; n without the scale, n + scale, and the magnitude without a direction
`ca` | Same and opposite directions | Two forces on a box, a walk, or a boat on a river, in the same or opposite directions | Choice: the resultant with its direction; the other operation, the other direction, no direction
`cn` | Same and opposite directions | Tug of war, two students pushing, a dog, a hiker, a boat on a river | Exact magnitude (unit optional); trap: the other operation
`pm` | Perpendicular vectors | A walk, a boat crossing a current, two ropes, a runner; east or west then north or south, in either order | 2 significant figures; traps: A + B and A² + B² without the root
`pd` | Perpendicular vectors | The same situations: how many degrees north or south of east or west | Nearest degree, 11° to 88° and never 45°; traps: the upside-down ratio (90° minus the angle) and radian mode
`pw` | Perpendicular vectors | The same situations: the direction in compass words | Choice: 37° south of east; the upside-down ratio, the wrong side (north instead of south) and the angle in radians
`kh` | Components | A ball kicked above the horizontal, a rope pulling a wagon, a hike at an angle north of east: one component | 2 significant figures; traps: sine and cosine switched, radian mode
`kv` | Components | A rope at an angle from the vertical, a ball thrown from the vertical, a hike east of north | 2 significant figures; traps: sine and cosine not switched, radian mode
`ke` | Components | Either kind: which expression gives the component | Choice: (15 m/s)(sin 35°); the other function, dividing, tangent

A question's id is its generator key and parameters (`pd|boat|4.0|east|3.0|south|xy`), so `bank.rebuild(id)` makes the same question again; the browser tests use it.

## Checking answers

Answers are judged by `M.judge` in `../shared/zsa-practice-model.js`. Sums along a line are exact (both magnitudes have the same decimal places), so a whole-number answer is checked exactly and a one-decimal answer to its decimal place. Answers from trigonometry are stored as 17-digit decimal strings; a value within 1e-9 (relative) of a rounding tie is drawn again, and so is a value whose third significant figure rounds to a 5, so a student who keeps three figures and one who rounds once never get different answers. An answer that would need zeros at the end to count is never drawn, and 2-figure answers stay below 100. The A + B and A² + B² traps are exact.

Rounding is advice, not the skill: extra digits are correct, with a note. The unit is optional; if typed it must be right: N, newtons; m, meters, metros; km, kilometers, kilómetros; m/s, meters per second, metros por segundo; for angles °, º, deg, degrees, grados. The prompt names the reference direction for angles ("how many degrees north of east"), so a number is enough.

## Interface and Spanish

Runs on the shared question-set engine (`../shared/zsa-practice.js`) with the generated-bank options described in `../shared/README.md`. Native controls only: the topic menu, radio buttons, one text field and buttons. There is no drawing input; arrows are described in words. Spanish follows the Style Kit and the live Spanish lesson: vector, escalar, magnitud, dirección, resultante, de punta a cola, cola, punta, desplazamiento, velocidad, rapidez, fuerza neta, perpendiculares, teorema de Pitágoras, componente horizontal y vertical, al norte del este, sobre la horizontal. New wording is in `../SPANISH_TERMS.md`.

## Changelog

1.0.0: Ten generators in four skills, exact sums along a line, advisory rounding with traps for radian mode, the upside-down ratio, switched sine and cosine and adding perpendicular magnitudes, rules reference, About/SEO/sitemap and directory entries, English and Mexican Spanish.

ZornScience. CC BY-NC-SA 4.0.
