# Physics Graphing Lab check: questions brief for Claude Code

Written Nov 21, 2026. Lab: `physics-graphing-lab/` (v1.1.3, activities.zornscience.org/physics-graphing-lab/). It follows Standing Waves in the rollout order and comes before the Circuit Builder.

## What to ship

- Completion code prefix **PHLC**. The rule is the lab's initial plus LC, but PLC is the Simple Pendulum, so this lab takes the first two letters. Registry: `{id:16, prefix:"PHLC", slug:"physics-graphing-lab", setting:"Lab check", name:"Physics Graphing Lab", maxItems:5}`. Id 14 is SLC and 15 is STLC (Standing Waves). Ids 11 (Inclined Plane) and 13 (Projectile Motion, PRLC) are reserved by earlier briefs, so if those have not merged when you start, still use 16 and leave the gaps.
- This lab had no completion code before (its README says it has no round or score), so registering it is part of the job. Add the line to the README and the changelog.
- Same pieces as the Collision Carts check (commit 1191472): a `check` block in `data.js`, a new `labcheck.js`, a `zsa-pg:request-lab` event in `lab.js`, a `#zsa-pg-check` mount in `index.html`, README, TESTING, TEACHERS and SPANISH_TERMS notes, the `check/index.html` registry bump, and unit and e2e tests.
- `?check=1` opens the Lab check panel. Without it the lab looks as it does today. The lab already reads `?scenario=`, so keep that working next to `?check=1`.
- Spanish: add the strings to the `es` table so the English fallback never shows, but Spanish ships only after Gemini proofreads.
- No answer is written in the page source. Every number comes from `physics.js` through the slots below.

## One change to `lab.js` this lab needs

`physics.js` already exposes the model through `zsa-pg:request-model` (`stateAt`, `turnTime`, `fmt`, `SCENARIOS`). The setup is the missing piece. Add a second event:

```js
root.addEventListener("zsa-pg:request-lab", function (event) {
  event.detail.receive({setup: setup});
});
```

`setup({scenario, time})` does what the Scenario menu's `change` handler already does for a built-in scenario (sets `scenario`, `x0`, `v0`, `a` from `M.SCENARIOS`), then:

- switches to Explore mode (the model must be visible: `mode = "explore"`, `revealed` irrelevant),
- stops playback (`stop()`) and clears any sketches,
- sets `t = time` (0 to 10, in 0.1 steps) and calls `redraw()`, so the readouts, cart and graph cursors all move.

`labcheck.js` fills the slots with `M.stateAt(x0, v0, a, t)` for the scenario named in `q.setup`, and formats every number with `M.fmt`.

## Setup object

`setup: {scenario, time}`

| field | values |
| --- | --- |
| `scenario` | a `M.SCENARIOS` id: `cruise`, `speed`, `stop`, `turn`, `left`, `rest` |
| `time` | seconds, 0 to 10, one decimal |

## Readouts the questions use

| name on the page | element | format |
| --- | --- | --- |
| Time | `#zsa-pg-t-value` | `4.00 s` |
| Position | `#zsa-pg-x-value` | `8.00 m`, or `−5.00 m` |
| Velocity | `#zsa-pg-v-value` | `2.00 m/s` |
| Acceleration | `#zsa-pg-a-value` | `0.60 m/s²` |

Negative numbers use the real minus sign `−` (U+2212), not a hyphen. `M.fmt(n)` returns it, so keep every choice label coming from `M.fmt`, never from a literal.

## Slots (filled in `labcheck.js`)

Let `c = M.SCENARIOS.find(s => s.id === q.setup.scenario)`, `t = q.setup.time`, `st = M.stateAt(c.x0, c.v0, c.a, t)`.

| slot | value |
| --- | --- |
| `{x}`, `{v}` | `st.x`, `st.v`, `M.fmt` |
| `{x0}`, `{v0}`, `{a}`, `{t}` | `c.x0`, `c.v0`, `c.a`, `t`, `M.fmt` |
| `{aAbs}` | `Math.abs(c.a)` |
| `{xAbs}` | `Math.abs(st.x)` |
| `{half}` | `0.5 * c.v0 * t` for `cruise`; `0.5 * t` for the reversal question (see below) |
| `{sq}` | `c.v0 * t * t` |
| `{halfV}` | `0.5 * c.a * t` |
| `{turn}` | `M.turnTime(c.v0, c.a)` |
| `{halfTurn}` | `M.turnTime(c.v0, c.a) / 2` |
| `{end}` | `10` (the run length, `M.DURATION`) |
| `{xTurn}` | `M.stateAt(c.x0, c.v0, c.a, M.turnTime(c.v0, c.a)).x` |
| `{noA}` | `c.x0 + c.v0 * t` |

## Questions (ready to paste into `data.js`)

Same shape as Collision Carts: each choice is `[value, label, feedbackKey]`, the right choice has a `null` key.

```js
questions: [
  {id: "steady", title: "Steady velocity", setup: {scenario: "cruise", time: 4},
    question: "Set up the lab. The cart cruises at a steady velocity. What does the Position readout show at 4.00 s?",
    choices: [["right", "{x} m", null], ["velocity", "{v0} m", "velocity"], ["half", "{half} m", "half"], ["squared", "{sq} m", "squared"]],
    feedback: {
      velocity: "That number is the velocity, in m/s. Position is in metres, and with a steady velocity it grows by that amount every second.",
      half: "With a steady velocity, position grows by the full velocity each second, not half of it. Use x = x₀ + vt.",
      squared: "Time is not squared when the velocity is steady. The squared time only appears when the velocity changes."
    },
    explanation: "With a steady velocity, position changes by the same amount every second: x = x₀ + vt = {x0} + {v0} × {t} = {x} m. The position graph is a straight line with a slope of {v0} m/s."},
  {id: "speedup", title: "Speeding up from rest", setup: {scenario: "speed", time: 5},
    question: "Set up the lab. The cart starts at rest and speeds up to the right. What does the Velocity readout show at 5.00 s?",
    choices: [["right", "{v} m/s", null], ["accel", "{a} m/s", "accel"], ["position", "{x} m/s", "position"], ["halfV", "{halfV} m/s", "halfV"]],
    feedback: {
      accel: "That is the acceleration. Velocity grows by that much every second, so after 5 s it is larger.",
      position: "That number is the Position readout, in metres. The question asks for the Velocity readout, in m/s.",
      halfV: "Velocity is v = v₀ + at, with no ½. The ½ belongs to the position equation, x = x₀ + v₀t + ½at²."
    },
    explanation: "The cart speeds up steadily: v = v₀ + at = {v0} + {a} × {t} = {v} m/s. The velocity graph is a straight line with a slope of {a} m/s², the acceleration."},
  {id: "turn", title: "Where the cart turns around", setup: {scenario: "turn", time: 0},
    question: "Set up the lab. The cart moves right, stops, and then reverses. Drag the Time slider until the Velocity readout shows 0.00 m/s. What does the Time readout show?",
    choices: [["right", "{turn} s", null], ["half", "{halfTurn} s", "half"], ["end", "{end} s", "end"], ["position", "{xTurn} s", "position"]],
    feedback: {
      half: "That is half of the right time. The velocity falls by the same amount every second, so use v = v₀ + at = 0 and watch the readout.",
      end: "At 10 s the cart has already reversed and is moving left. The velocity reads zero earlier.",
      position: "That number is where the cart is at the turn, in metres. The question asks for a time, in seconds."
    },
    explanation: "The velocity reaches zero when v₀ + at = 0, so t = −v₀ / a = −{v0} / ({a}) = {turn} s. At that moment the cart is at {xTurn} m, its farthest point to the right. After that the velocity is negative and the cart moves left."},
  {id: "stop", title: "Slowing to a stop", setup: {scenario: "stop", time: 10},
    question: "Set up the lab. The cart slows down as it moves right. What does the Velocity readout show at 10.00 s?",
    choices: [["right", "{v} m/s", null], ["accel", "{a} m/s", "accel"], ["position", "{x} m/s", "position"], ["start", "{v0} m/s", "start"]],
    feedback: {
      accel: "That is the acceleration. It stays the same, but the velocity keeps changing by that much every second.",
      position: "That number is the Position readout, in metres. The question asks for the Velocity readout, in m/s.",
      start: "That is the starting velocity. The cart has been slowing for 10 s, so the velocity has changed."
    },
    explanation: "The cart loses {aAbs} m/s every second: v = v₀ + at = {v0} + ({a}) × {t} = {v} m/s. It comes to rest at 10 s, at x = {x} m, where the position graph has become flat."},
  {id: "left", title: "Speeding up to the left", setup: {scenario: "left", time: 6},
    question: "Set up the lab. The cart moves left and gets faster. What does the Position readout show at 6.00 s?",
    choices: [["right", "{x} m", null], ["sign", "{xAbs} m", "sign"], ["noA", "{noA} m", "noA"], ["velocity", "{v} m", "velocity"]],
    feedback: {
      sign: "Check the sign. The cart passed 0 m and is now to the left of it, so the position is negative.",
      noA: "That ignores the acceleration. The cart also speeds up, so add the ½at² term: x = x₀ + v₀t + ½at².",
      velocity: "That number is the Velocity readout, in m/s. The question asks for the Position readout, in metres."
    },
    explanation: "x = x₀ + v₀t + ½at² = {x0} + ({v0})({t}) + ½({a})({t})² = {x} m. The cart started at {x0} m, moved left, and passed through 0 m, so it is now to the left of the origin."}
]
```

For `turn`, `{half}` is not used; use `{halfTurn}`. For `steady`, `{half}` is `0.5 * c.v0 * t`.

Values, computed from `physics.js` and read from the live lab in headless Chromium on Nov 21, 2026 (the two agree):

| id | setup | `{right}` | distractors |
| --- | --- | --- | --- |
| steady | cruise (x₀ 0, v₀ 2.00), 4.00 s | 8.00 m | 2.00 m, 4.00 m, 32.00 m |
| speedup | speed (a 0.60), 5.00 s | 3.00 m/s (x 7.50 m) | 0.60 m/s, 7.50 m/s, 1.50 m/s |
| turn | turn (v₀ 3.00, a −0.60) | 5.00 s (readout is 0.06 at 4.9, 0.00 at 5.0, −0.06 at 5.1) | 2.50 s, 10.00 s, 7.50 s |
| stop | stop (v₀ 4.00, a −0.40), 10.00 s | 0.00 m/s (x 10.00 m) | −0.40 m/s, 10.00 m/s, 4.00 m/s |
| left | left (x₀ 10.00, v₀ −1.00, a −0.50), 6.00 s | −5.00 m (v −4.00 m/s) | 5.00 m, 4.00 m, −4.00 m |

All four answer options in each question show different values.

## Tests

- Unit: for each question, `resolve()` fills every slot (including `question`), no `{` is left, the right choice equals the value above, and no distractor equals the right choice. Check the minus sign is U+2212.
- E2E (headless): open `?check=1`, press **Set up the lab** for each question, read the readout, and confirm the right choice's label equals it. For `turn`, set the Time slider to 5.0 and confirm `#zsa-pg-v-value` reads `0.00 m/s`. Then pick the right choice and confirm the code starts with `PHLC` and shows the score.
- The Collision Carts test that pins the highest registry id must not pin 16.

## Worksheet and key

`phys-motion-graphs-lab-check.pdf` and `phys-motion-graphs-lab-check-key.pdf` (made Nov 21, 2026). The long lab worksheet is `phys-motion-graphs-virtual-lab.pdf`, so the Lab check files use the same `motion-graphs` name. Their setups and answers match this brief question for question.
