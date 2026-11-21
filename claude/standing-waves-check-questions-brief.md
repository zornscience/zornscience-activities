# Standing Waves Lab check: questions brief for Claude Code

Written Nov 21, 2026. Lab: `standing-waves-lab/` (v1.1.3, activities.zornscience.org/standing-waves-lab/). It follows Snell's Law in the rollout order and comes before the Physics Graphing Lab.

## What to ship

- Completion code prefix **STLC**, because SLC is the Snell's Law check. Registry: `{id:15, prefix:"STLC", slug:"standing-waves-lab", setting:"Lab check", name:"Standing Waves on a String", maxItems:5}`. Id 14 is SLC. Ids 11 (Inclined Plane) and 13 (Projectile Motion, PRLC) are reserved by earlier briefs, so if those have not merged when you start, still use 15 and leave the gaps.
- Same pieces as the Collision Carts check (commit 1191472): a `check` block in `data.js`, a new `labcheck.js`, a `zsa-sw:request-lab` event in `lab.js`, a `#zsa-sw-check` mount in `index.html`, README, TESTING, TEACHERS and SPANISH_TERMS notes, the `check/index.html` registry bump, and unit and e2e tests.
- `?check=1` opens the Lab check panel. Without it the lab looks as it does today.
- Spanish: add the strings to the `es` table so the English fallback never shows, but Spanish ships only after Gemini proofreads.
- No answer is written in the page source. Every number comes from the lab's model through the slots below.

## One change to `lab.js` that this lab needs

Unlike Snell's Law and Collision Carts, this lab has no `physics.js`. The model is the `model()` function inside `lab.js`: `T = mass/1000 * 9.81`, `v = √(T/μ)`, `f₁ = v/(2L)`, `n = max(1, round(f/f₁))`. Expose it, and the setup, through one event so `labcheck.js` never copies a formula:

```js
root.addEventListener("zsa-sw:request-lab", function (event) {
  event.detail.receive({model: model, setup: setup, format: format});
});
```

- `model()` returns `{L, T, v, f1, f, n, detune, resonant}` for the controls as they are now.
- `setup(s)` sets the controls from `s`, fires their `input` events (so `update()` runs), switches the oscillator on if it is off, leaves strobe lock off, and sets drive amplitude to 65%. It does not touch the investigation.
- `format` is the lab's own number formatting: two decimals for Hz, m/s and N, three for metres.

`labcheck.js` fills the slots by calling `setup(q.setup)` on a scratch basis (or by calling `model()` after it), never from a copied formula.

## Setup object

`setup: {frequency, mass, length, density, nodes}`

| field | control | notes |
| --- | --- | --- |
| `frequency` | `#frequency`, Hz | set with two decimals |
| `mass` | `#mass`, grams | 50 to 500, step 10 |
| `length` | `#length`, metres | 0.6 to 1.5, step 0.05 |
| `density` | `#density`, kg/m | `0.001`, `0.002` or `0.004` |
| `nodes` | `#nodes` (Label nodes and antinodes) | optional, `true` for the wavelength question |

Every question starts with the Medium cord (0.002 kg/m), 200 g and 1.20 m unless it says otherwise, as the lab does when you press Reset.

## Readouts the questions use

| name on the page | element | text format |
| --- | --- | --- |
| WAVE SPEED | `#velocity` | `31.32 m/s` |
| FUNDAMENTAL f₁ | `#fundamental` | `13.05 Hz` |
| NEAREST HARMONIC | `#harmonic` | `n = 3` |
| generator display | `#display` | `39.15 Hz` |
| Measure the string | `#measurement-feedback` | `… Your measured wavelength is λ = 2Δx = 0.800 m.` after **Place cursors on adjacent nodes** |

## Slots (filled in `labcheck.js` from `model()`)

Let `m = model()` after `setup(q.setup)`, and `f = m.f1`.

| slot | value |
| --- | --- |
| `{f1}` | `m.f1`, two decimals |
| `{f1Base}` | `f₁` for 200 g, 1.20 m, Medium cord: 13.05 |
| `{h3}`, `{h4}` | `3·m.f1`, `4·m.f1`, two decimals |
| `{add}` | `m.f1 + 3`, two decimals |
| `{div}` | `m.f1 / 3`, two decimals |
| `{dx}` | `m.L / m.n`, three decimals (neighboring nodes) |
| `{lambda}` | `2·m.L / m.n`, three decimals |
| `{L}` | `m.L`, three decimals |
| `{twoL}` | `2·m.L`, three decimals |
| `{v}` | `m.v`, two decimals |
| `{double}`, `{half}` | `2·m.v`, `m.v / 2` for the speed questions; `2·f₁Base`, `f₁Base / 2` for the tension question |
| `{freq}` | `m.f`, two decimals |
| `{vMedium}` | `v` for the Medium cord, 31.32 |
| `{vFaster}` | `v` for the Medium cord times √2 |
| `{T}` | `m.T`, two decimals |
| `{lambda4}`, `{lambda2}` | `2L/4` and `2L/2`, three decimals |
| `{f2}` | `2·f₁Base`, two decimals |

`resolve()` must also fill the slots in `question` (the tension question names `{f1Base}`), not only the choices, feedback and explanation.

## Questions (ready to paste into `data.js`)

Same shape as Collision Carts: each choice is `[value, label, feedbackKey]`, the right choice has a `null` key.

```js
questions: [
  {id: "harmonic3", title: "Three loops", setup: {frequency: 26.1, mass: 200, length: 1.2, density: 0.002},
    question: "Set up the lab. Read the Fundamental f₁ readout. Which generator frequency makes the string vibrate in 3 loops (harmonic 3)?",
    choices: [["right", "{h3} Hz", null], ["add", "{add} Hz", "add"], ["h4", "{h4} Hz", "h4"], ["div", "{div} Hz", "div"]],
    feedback: {
      add: "Harmonics are multiples of f₁, not f₁ plus a number. Harmonic n is at n × f₁.",
      h4: "That frequency makes 4 loops. Harmonic 3 has 3 loops.",
      div: "Higher harmonics have higher frequencies than f₁, not lower. Multiply f₁ by n."
    },
    explanation: "Harmonic n has frequency fₙ = n × f₁. With f₁ = {f1} Hz, harmonic 3 is 3 × {f1} = {h3} Hz. Press the 3 harmonic button to check: the generator shows {h3} Hz and the readout says n = 3."},
  {id: "wavelength", title: "Wavelength from the nodes", setup: {frequency: 39.15, mass: 200, length: 1.2, density: 0.002, nodes: true},
    question: "Set up the lab at harmonic 3. Press Place cursors on adjacent nodes. What wavelength does the Measure the string readout give?",
    choices: [["right", "{lambda} m", null], ["dx", "{dx} m", "dx"], ["whole", "{L} m", "whole"], ["twoL", "{twoL} m", "twoL"]],
    feedback: {
      dx: "That is Δx, the distance between neighboring nodes. It is only half a wavelength, so λ = 2Δx.",
      whole: "That is the length of the string. At harmonic 3, 1.5 wavelengths fit on it, so one wavelength is shorter.",
      twoL: "That is the wavelength of harmonic 1, λ = 2L. Harmonic 3 packs in three times as many loops."
    },
    explanation: "Neighboring nodes are Δx = {dx} m apart, half a wavelength. So λ = 2Δx = {lambda} m. Check: harmonic 3 fits 3 loops on a {L} m string, so λ = 2L / 3 = {lambda} m."},
  {id: "speed", title: "The same speed", setup: {frequency: 52.2, mass: 200, length: 1.2, density: 0.002},
    question: "Set up the lab at harmonic 4. Read the Wave speed. Then press the 2 harmonic button and read it again. What does the Wave speed readout show?",
    choices: [["right", "{v} m/s", null], ["double", "{double} m/s", "double"], ["half", "{half} m/s", "half"], ["hz", "{freq} m/s", "hz"]],
    feedback: {
      double: "Wave speed depends on the string, not on how many loops it has. Tune to another harmonic and watch the readout.",
      half: "Wave speed depends on the string, not on how many loops it has. Tune to another harmonic and watch the readout.",
      hz: "That number is the generator frequency, in hertz. Wave speed is in m/s: read the Wave speed readout."
    },
    explanation: "Wave speed depends only on the tension and the string, so it is {v} m/s at harmonic 2 and at harmonic 4. Higher harmonics have a higher frequency and a shorter wavelength: v = fλ = {freq} Hz × {lambda4} m = {v} m/s, and at harmonic 2, {f2} Hz × {lambda2} m = {v} m/s."},
  {id: "tension", title: "More tension", setup: {frequency: 26.1, mass: 400, length: 1.2, density: 0.002},
    question: "Set up the lab. The hanging mass is now 400 g, double the usual 200 g, which gave f₁ = {f1Base} Hz. What does the Fundamental f₁ readout show?",
    choices: [["right", "{f1} Hz", null], ["double", "{double} Hz", "double"], ["same", "{f1Base} Hz", "same"], ["half", "{half} Hz", "half"]],
    feedback: {
      double: "Doubling the mass doubles the tension, but wave speed goes as the square root of tension. f₁ does not double.",
      same: "More mass means more tension, so waves travel faster and f₁ changes. Read the Fundamental readout.",
      half: "More tension makes waves faster, so f₁ rises. It does not fall."
    },
    explanation: "Doubling the mass doubles the tension (T = mg = {T} N). Wave speed goes as √T, so f₁ rises by √2, about 1.41: {f1Base} × 1.41 = {f1} Hz, not twice as much."},
  {id: "density", title: "A heavier cord", setup: {frequency: 26.1, mass: 200, length: 1.2, density: 0.004},
    question: "Set up the lab with the Heavy cord (4.0 g/m) at the same tension and length. What does the Wave speed readout show?",
    choices: [["right", "{v} m/s", null], ["same", "{vMedium} m/s", "same"], ["faster", "{vFaster} m/s", "faster"], ["half", "{half} m/s", "half"]],
    feedback: {
      same: "A heavier string changes the speed. Compare the readout with 31.32 m/s for the Medium cord.",
      faster: "A heavier string is harder to move, so waves travel slower, not faster.",
      half: "Wave speed goes as 1 / √μ. Doubling μ divides the speed by √2, about 1.41, not by 2."
    },
    explanation: "v = √(T/μ). Doubling the density at the same tension divides the speed by √2: {vMedium} / 1.41 = {v} m/s. The same string would also have a lower f₁ and lower harmonics."}
]
```

For the `density` question `{half}` is `m.v / 2`. The answers, read from the live lab in headless Chromium on Nov 21, 2026 (the formulas above give the same values):

| id | setup | `{right}` | distractors |
| --- | --- | --- | --- |
| harmonic3 | 200 g, 1.20 m, Medium cord, 26.10 Hz | 39.15 Hz (f₁ 13.05, n = 2) | 16.05, 52.20, 4.35 |
| wavelength | harmonic 3, 39.15 Hz, nodes labelled | 0.800 m (Δx 0.400 m) | 0.400, 1.200, 2.400 |
| speed | harmonic 4, 52.20 Hz | 31.32 m/s (also 31.32 at harmonic 2, 26.10 Hz) | 62.64, 15.66, 52.20 |
| tension | 400 g | 18.46 Hz (f₁ with 200 g is 13.05) | 26.10, 13.05, 6.53 |
| density | Heavy cord, 200 g | 22.15 m/s (f₁ 9.23 Hz) | 31.32, 44.29, 15.66 |

All four answer options in each question show different values.

## Tests

- Unit: `resolve()` fills every slot, no `{` is left, the right choice equals the value above, and no distractor equals the right choice.
- E2E (headless): open `?check=1`, press **Set up the lab** for each question, read `#fundamental`, `#velocity` or `#measurement-feedback`, and confirm the right choice's label equals the readout. For `wavelength`, press **Place cursors on adjacent nodes** first. For `speed`, press harmonic 2 and confirm `#velocity` is still 31.32 m/s. Then pick the right choice and confirm the code starts with `STLC` and shows the score.
- The Collision Carts test that pins the highest registry id must not pin 15.

## Worksheet and key

`phys-standing-waves-lab-check.pdf` and `phys-standing-waves-lab-check-key.pdf` (made Nov 21, 2026). Their setups and answers match this brief question for question. They are separate from the long lab worksheet `phys-standing-waves-virtual-lab.pdf`, which is unchanged.
