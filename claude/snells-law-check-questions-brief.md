# Snell's Law Lab check: questions brief for Claude Code

Written Nov 21, 2026. Lab: `snells-law-lab/` (v1.1.3, activities.zornscience.org/snells-law-lab/). It follows Projectile Motion in the rollout order and comes before Standing Waves.

## What to ship

- Completion code prefix **SLC** (Snell's Law Check). Registry: `{id:14, prefix:"SLC", slug:"snells-law-lab", setting:"Lab check", name:"Snell’s Law & Refraction", maxItems:5}`. Id 11 stays reserved for Inclined Plane and id 13 for Projectile Motion (PRLC), so SLC takes **14**. If either of those has not merged when you start, still use 14 and leave the gaps. Standing Waves will need STLC, because SLC is taken.
- Same pieces as the Collision Carts check (commit 1191472): a `check` block in `data.js`, a new `labcheck.js`, a `zsa-snell:request-lab` event in `lab.js` (a `setup(setup)` function and the readout formatter), a `#zsa-sl-check` mount in `index.html`, `labcheck.css` rules if the shared styles are not enough, README/TESTING/TEACHERS/SPANISH_TERMS notes, `check/index.html` registry bump, and unit and e2e tests.
- `?check=1` opens the Lab check panel. Without it the lab looks as it does today.
- Spanish: add the strings to the `es` table so the English fallback never shows, but Spanish ships only after Gemini proofreads. Until then keep the Spanish labels behind the usual untranslated fallback.
- No answer is written in the page source. Every number comes from `physics.js` `interfaceRay(n1, n2, angle)` and `P.indices`, through the slot table below.

## Setup object

`setup: {mode, block, surrounding, angle}`

| field | values | what `lab.setup` does |
| --- | --- | --- |
| `mode` | `"slab"` (Rectangular block) or `"tir"` (Semicircular block) | calls `setMode(mode)` |
| `block` | `air`, `water`, `acrylic`, `glass`, `diamond` | sets `#block`, hides the custom index field |
| `surrounding` | same list | sets `#surrounding` |
| `angle` | degrees, 0 to 80 | `setAngle(angle)` |

`setup()` must also leave the laser on, **Show measurements** checked (the readouts below are the answers), and the protractor snapped to the normal, as the Investigate buttons already do. It must not touch the investigation prompt. The runner's "Set up the lab" button calls it.

## Readouts the questions use

| name on the page | element | text format |
| --- | --- | --- |
| REFRACTION · θ₂ | `#refraction` | `28.1°`, or `No transmitted ray` past the critical angle |
| CRITICAL ANGLE | `#critical-reading` | `41.8°`, or `None` when n₁ ≤ n₂ |

The formatter is one decimal and a degree sign, `v.toFixed(1) + "°"`, the same as `render()`.

## Slots (filled in `labcheck.js`)

Let `n1`, `n2` be the first interface's indices (`slab`: surrounding then block; `tir`: block then surrounding) and `ray = P.interfaceRay(n1, n2, angle)`.

| slot | value |
| --- | --- |
| `{right}` | per question, below |
| `{n1}`, `{n2}` | indices to 3 decimals, as the lab's "First flat surface" line shows them |
| `{angle}` | the setup angle with a degree sign, `45.0°` |
| `{refraction}` | `ray.refracted` formatted, or `No transmitted ray` if `ray.tir` |
| `{critical}` | `ray.critical` formatted |
| `{surface}` | `90 − ray.refracted`, formatted |
| `{divide}` | `angle / n2` (for slab) formatted, the "divide the angle" error |
| `{glass}` | `P.interfaceRay(1, P.indices.glass, angle).refracted` formatted |
| `{v}` | `3.00e8 / n2` to three significant figures, as `1.24 × 10⁸ m/s` |
| `{airCritical}` | `P.interfaceRay(P.indices.glass, 1, 0).critical` formatted |
| `{complement}` | `90 − critical` formatted |
| `{atan}` | `atan(n2 / n1)` in degrees, formatted |

## Questions (ready to paste into `data.js`)

Same shape as Collision Carts: each choice is `[value, label, feedbackKey]`, the right choice has a `null` key, and the `{…}` slots are filled by `labcheck.js`. `title`, `question`, the choice labels, feedback and explanation are the only student text.

```js
questions: [
  {id: "bend", title: "Air into glass", setup: {mode: "slab", block: "glass", surrounding: "air", angle: 45},
    question: "Set up the lab. The laser enters the glass block at 45.0°. What does the Refraction θ₂ readout show?",
    choices: [["right", "{refraction}", null], ["same", "{angle}", "same"], ["surface", "{surface}", "surface"], ["divide", "{divide}", "divide"]],
    feedback: {
      same: "Light does bend when it goes from air into glass, because glass has a higher index. Read the Refraction θ₂ readout.",
      surface: "That angle is measured from the surface. Snell's law uses the angle from the dashed normal. Check where the zero line of the protractor sits.",
      divide: "Snell's law uses the sines of the angles, not the angles themselves. Dividing 45.0° by the index does not work."
    },
    explanation: "Light slows down in glass (n = {n2}) and bends toward the normal. {n1} × sin 45.0° = {n2} × sin θ₂ gives θ₂ = {refraction}, smaller than the incidence angle."},
  {id: "diamond", title: "Diamond bends the most", setup: {mode: "slab", block: "diamond", surrounding: "air", angle: 40},
    question: "Set up the lab with the diamond block. What does the Refraction θ₂ readout show?",
    choices: [["right", "{refraction}", null], ["glass", "{glass}", "glass"], ["divide", "{divide}", "divide"], ["same", "{angle}", "same"]],
    feedback: {
      glass: "That is the angle for a glass block at 40.0°. Check that the Optical block menu says Diamond.",
      divide: "Snell's law uses the sines of the angles, not the angles themselves. Dividing 40.0° by the index only comes close by luck.",
      same: "Diamond has a very high index, so it bends light a lot. Read the Refraction θ₂ readout."
    },
    explanation: "Diamond has n = {n2}, so light travels slowest in it (v = c / n = {v}) and bends the most. {n1} × sin 40.0° = {n2} × sin θ₂ gives θ₂ = {refraction}, compared with {glass} for glass."},
  {id: "match", title: "Matching indices", setup: {mode: "slab", block: "glass", surrounding: "glass", angle: 45},
    question: "Set up the lab. The glass block sits in glass surroundings. What does the Refraction θ₂ readout show?",
    choices: [["right", "{refraction}", null], ["bends", "{glass}", "bends"], ["zero", "0.0°", "zero"], ["half", "22.5°", "half"]],
    feedback: {
      bends: "That is the angle for air into glass. Here the block and its surroundings are both glass. Check the Surrounding medium menu.",
      zero: "A beam along the normal goes straight through, but this beam is aimed at 45.0°. It keeps that angle.",
      half: "Do not halve the angle. Snell's law uses sines: n₁ sin θ₁ = n₂ sin θ₂."
    },
    explanation: "The block and its surroundings are both glass, so n₁ = n₂ = {n1}, and sin θ₂ = sin θ₁. The beam does not bend: θ₂ = {refraction}. Light changes direction only when its speed changes at a boundary."},
  {id: "critical", title: "Critical angle, glass to air", setup: {mode: "tir", block: "glass", surrounding: "air", angle: 30},
    question: "Set up the lab with the semicircular glass block. Which value does the Critical angle readout show?",
    choices: [["right", "{critical}", null], ["refraction", "{refraction}", "refraction"], ["complement", "{complement}", "complement"], ["atan", "{atan}", "atan"]],
    feedback: {
      refraction: "That is the Refraction θ₂ readout at 30.0°. The question asks for the Critical angle readout.",
      complement: "The critical angle is not 90° minus the angle. Use sin θc = n₂ / n₁.",
      atan: "sin θc = n₂ / n₁ = 1.000 / 1.500. Take the inverse sine, not the inverse tangent."
    },
    explanation: "sin θc = n₂ / n₁ = {n2} / {n1}, so θc = {critical}. At 30.0° the beam still leaves the glass, at {refraction}, bending away from the normal. Past {critical} all of the light reflects."},
  {id: "water", title: "Glass in water", setup: {mode: "tir", block: "glass", surrounding: "water", angle: 70},
    question: "Set up the lab. The glass is now surrounded by water, and the laser is at 70.0°. What does the Refraction θ₂ readout show?",
    choices: [["right", "No transmitted ray", null], ["critical", "{critical}", "critical"], ["grazing", "90.0°", "grazing"], ["airCritical", "{airCritical}", "airCritical"]],
    feedback: {
      critical: "That is the critical angle for glass to water, read from the other readout. The laser is at 70.0°, which is past it.",
      grazing: "The ray runs along the surface only at exactly the critical angle. Past it, no ray crosses.",
      airCritical: "That is the critical angle for glass to air. Water's index is closer to glass, so this critical angle is larger."
    },
    explanation: "From glass (n₁ = {n1}) into water (n₂ = {n2}), sin θc = {n2} / {n1}, so θc = {critical}. The laser at 70.0° is past it, so all the light reflects. Glass to air has a smaller critical angle, {airCritical}, because air's index is further from glass."}
]
```

Slot values for each question (computed from `physics.js`, then read from the live lab in headless Chromium on Nov 21, 2026; both agree):

| id | setup | `{right}` |
| --- | --- | --- |
| bend | glass in air, 45.0° | 28.1° (surface 61.9°, divide 30.0°) |
| diamond | diamond in air, 40.0° | 15.4° (glass 25.4°, divide 16.5°) |
| match | glass in glass, 45.0° | 45.0° (air to glass 28.1°) |
| critical | glass to air, semicircular, 30.0° | 41.8° (Refraction readout 48.6°, complement 48.2°, atan 33.7°) |
| water | glass to water, semicircular, 70.0° | No transmitted ray (critical 62.7°, glass to air 41.8°) |

All four answer options in each question show different values in the lab.

## Tests

- Unit: for each question, `resolve()` fills every slot, no `{` is left, the right choice equals the value above, and no distractor equals the right choice (compare the filled labels).
- E2E (headless): open `?check=1`, press **Set up the lab** for each question, read `#refraction` and `#critical-reading`, and confirm the right choice's label equals the readout text (`28.1°`, `15.4°`, `45.0°`, critical `41.8°`, `No transmitted ray`). Then pick it and confirm the code is `SLC` plus the score.
- The Collision Carts test that pins the highest registry id must not pin 14.

## Worksheet and key

`phys-snells-law-lab-check.pdf` and `phys-snells-law-lab-check-key.pdf` (made Nov 21, 2026). Their intro, setups, and answers match this brief question for question. They are separate from the long lab worksheet `phys-snells-law-lab.pdf`, which is unchanged.
