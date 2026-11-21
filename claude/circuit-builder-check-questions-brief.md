# Circuit Builder check: questions brief for Claude Code

Written Nov 21, 2026. Lab: `circuit-builder/` (v1.1.4, activities.zornscience.org/circuit-builder/). It follows the Physics Graphing Lab in the rollout order and comes before Equipotential.

## What to ship

- Completion code prefix **CILC**. The rule is the lab's initial plus LC, but CLC is Collision Carts, so this lab takes the first two letters. Registry: `{id:17, prefix:"CILC", slug:"circuit-builder", setting:"Lab check", name:"Circuit Builder", maxItems:5}`. Id 14 is SLC, 15 STLC, 16 PHLC. Ids 11 (Inclined Plane) and 13 (Projectile Motion, PRLC) are reserved by earlier briefs, so if those have not merged when you start, still use 17 and leave the gaps.
- This lab had no completion code before (its README says it has no round or score), so registering it is part of the job. Add it to the README and the changelog.
- Same pieces as the Collision Carts check (commit 1191472): a `check` block in `data.js`, a new `labcheck.js`, a `zsa-cb:request-lab` event in `lab.js`, a mount, README, TESTING, TEACHERS and SPANISH_TERMS notes, the `check/index.html` registry bump, and unit and e2e tests.
- **Name clash to avoid:** this lab already has a "Check your thinking" section with six questions and a **Check answers** button, and its button's id is `zsa-cb-check`. Use a different mount, `#zsa-cb-labcheck`, and a different heading, "Lab check", so students can tell the two apart. The six existing questions, `M.QUESTIONS` and `M.check()` do not change.
- `?check=1` opens the Lab check panel. Without it the lab looks as it does today. Keep `?from=`, `?circuit=` and `?meter=` working next to it (the lesson pages link with them); the Lab check's setup overrides the circuit and meter while a question is open.
- Spanish: add the strings to the `es` table so the English fallback never shows, but Spanish ships only after Gemini proofreads.
- No answer is written in the page source. Every number comes from the model through the slots below.

## One change to `lab.js` this lab needs

`model.js` already exposes the model through `zsa-cb:request-model` (`preset`, `solve`, `byId`, `ends`, `fmt`, `volts`, `amps`). The setup is the missing piece. Add a second event:

```js
root.addEventListener("zsa-cb:request-lab", function (event) {
  event.detail.receive({setup: setup});
});
```

`setup({preset, mode, part})` does what the Starting-circuit menu's `change` handler does (`load(preset)`, which also resets selection, the solved circuit and the default meter), then:

- `setMode(mode)` (`"current"` or `"voltage"`), which also checks the matching radio button,
- in current mode, sets `meter.part = part`; in voltage mode, calls `probesAcross(M.byId(parts, part))`, which puts the red probe on the higher end,
- clears the undo history, then calls `update()`.

`labcheck.js` fills the slots by solving the same preset with `M.solve(M.preset(id))`, never from a copied formula, and formats every number with `M.amps` or `M.volts` (the meter's own format: `0.600 A`, `4.00 V`).

## Setup object

`setup: {preset, mode, part}`

| field | values |
| --- | --- |
| `preset` | a `M.PRESETS` id: `one`, `series2`, `parallel2`, `mixed`, `divider`, and the rest |
| `mode` | `"current"` or `"voltage"` |
| `part` | a part id from that preset: `V1`, `B1`, `R2` and so on. In voltage mode the probes go across this part. |

## Readouts the questions use

| name on the page | element | format |
| --- | --- | --- |
| Meter display | `#zsa-cb-meter-value` | `0.600 A` or `4.00 V` |
| Meter caption | `#zsa-cb-meter-caption` | `Through Bulb 1, flowing from C2 to D2.` or `Red at E2, black at F2: across Resistor 2.` |

## Slots (filled in `labcheck.js`)

Let `solve(id)` be `M.solve(M.preset(id))` and `I(id, part)` and `V(id, part)` be the absolute current and voltage of that part, formatted with `M.amps` and `M.volts`.

| slot | value |
| --- | --- |
| `{right}` | per question, below |
| `{one}` | `I("one", "B1")` |
| `{series}` | `I("series2", "B1")` |
| `{parallel}` | `I("parallel2", "V1")` |
| `{three}` | `I("parallel3", "V1")` |
| `{half}` | `I("series2", "B1") / 2` |
| `{battery}` | `V("divider", "V1")` |
| `{r1}` | `V("divider", "R1")` |
| `{r2}` | `V("divider", "R2")` |
| `{equal}` | `V("divider", "V1") / 2` |
| `{branch}` | `I("mixed", "B2")` |
| `{twice}` | `2 * I("mixed", "B1")` |
| `{volts}` | the battery voltage written as amps, `6.00 A` (`M.fmt(6) + " A"`) |

## Questions (ready to paste into `data.js`)

Same shape as Collision Carts: each choice is `[value, label, feedbackKey]`, the right choice has a `null` key.

```js
questions: [
  {id: "onebulb", title: "One bulb", setup: {preset: "one", mode: "current", part: "V1"},
    question: "Set up the lab. One 10 Ω bulb sits across a 6 V battery. What does the meter show for the current through the battery?",
    choices: [["right", "{one}", null], ["series", "{series}", "series"], ["parallel", "{parallel}", "parallel"], ["volts", "{volts}", "volts"]],
    feedback: {
      series: "That is the current when two bulbs share the battery in series. Here there is only one bulb.",
      parallel: "That is the battery's current with two bulbs in parallel. Here there is only one bulb, so the battery has less to supply.",
      volts: "6 V is the battery's voltage, not a current. Use V = IR with the bulb's 10 Ω, or read the meter."
    },
    explanation: "The bulb is 10 Ω and the battery is 6 V, so I = V / R = 6.00 V / 10 Ω = {one}. The battery and the bulb are in one loop, so the current through the battery is the current through the bulb."},
  {id: "series", title: "Two bulbs in series", setup: {preset: "series2", mode: "current", part: "B1"},
    question: "Set up the lab. Two identical bulbs are in series on the 6 V battery. What does the meter show for the current through Bulb 1? Then move the meter to Bulb 2.",
    choices: [["right", "{series}", null], ["one", "{one}", "one"], ["half", "{half}", "half"], ["parallel", "{parallel}", "parallel"]],
    feedback: {
      one: "That is the current with one bulb. A second bulb in the same loop adds resistance, so the current is smaller.",
      half: "Current is not used up by the first bulb. In a series loop it is the same at every part. Put the meter on Bulb 2.",
      parallel: "That is the battery's current when the bulbs are in parallel. In series there is only one path, and it has more resistance."
    },
    explanation: "Two 10 Ω bulbs in series add to 20 Ω, so I = 6.00 V / 20 Ω = {series}. There is only one path, so the current is the same through Bulb 1, Bulb 2 and the battery."},
  {id: "share", title: "Resistors share the voltage", setup: {preset: "divider", mode: "voltage", part: "R2"},
    question: "Set up the lab. A 10 Ω resistor and a 20 Ω resistor are in series on the 6 V battery, and the probes are across the 20 Ω resistor, R2. What does the meter show?",
    choices: [["right", "{r2}", null], ["battery", "{battery}", "battery"], ["r1", "{r1}", "r1"], ["equal", "{equal}", "equal"]],
    feedback: {
      battery: "That is the battery's whole voltage. In series the resistors share it, so each one gets less.",
      r1: "That is the voltage across R1, the 10 Ω resistor. R2 has twice the resistance, so it gets the bigger share.",
      equal: "The voltage would split equally only if the resistors were equal. R2 is 20 Ω and R1 is 10 Ω."
    },
    explanation: "The current is the same through both: I = 6.00 V / (10 Ω + 20 Ω) = 0.200 A. Across R2, V = IR = 0.200 A × 20 Ω = {r2}. R1 gets {r1}, and {r1} + {r2} = {battery}."},
  {id: "parallel", title: "Two bulbs in parallel", setup: {preset: "parallel2", mode: "current", part: "V1"},
    question: "Set up the lab. Two identical bulbs are in parallel on the 6 V battery. What does the meter show for the current through the battery?",
    choices: [["right", "{parallel}", null], ["one", "{one}", "one"], ["series", "{series}", "series"], ["three", "{three}", "three"]],
    feedback: {
      one: "That is the current through one branch. The battery has to supply both branches.",
      series: "That is the current when the bulbs are in series. In parallel each bulb is across the full battery voltage and draws more.",
      three: "That is the battery's current with three bulbs. This circuit has two branches."
    },
    explanation: "Each branch is a 10 Ω bulb across the full 6.00 V, so each draws {one}. The battery supplies both branches: {one} + {one} = {parallel}."},
  {id: "mixed", title: "One bulb, then two in parallel", setup: {preset: "mixed", mode: "current", part: "B1"},
    question: "Set up the lab. Bulb 1 is in series with Bulbs 2 and 3, which are in parallel with each other. What does the meter show for the current through Bulb 1?",
    choices: [["right", "{right}", null], ["branch", "{branch}", "branch"], ["one", "{one}", "one"], ["twice", "{twice}", "twice"]],
    feedback: {
      branch: "That is the current through Bulb 2, one of the two parallel branches. Bulb 1 carries the current for both of them.",
      one: "That is the current with one bulb on its own. Here the extra bulbs add resistance, so the current is smaller.",
      twice: "Bulb 1 carries the battery's whole current, which then splits. It does not carry double that."
    },
    explanation: "Bulbs 2 and 3 in parallel act like one 5 Ω load. With Bulb 1's 10 Ω in series, the total is 15 Ω, so I = 6.00 V / 15 Ω = {right} through Bulb 1 and the battery. It then splits evenly, {branch} through Bulb 2 and {branch} through Bulb 3."}
]
```

For `mixed`, `{right}` is `I("mixed", "B1")`. Values, computed from `model.js` and read from the live meter in headless Chromium on Nov 21, 2026 (the two agree):

| id | setup | `{right}` | distractors |
| --- | --- | --- | --- |
| onebulb | one, current, V1 | 0.600 A | 0.300 A, 1.200 A, 6.00 A |
| series | series2, current, B1 | 0.300 A (B2 also 0.300 A) | 0.600 A, 0.150 A, 1.200 A |
| share | divider, voltage across R2 | 4.00 V | 6.00 V, 2.00 V, 3.00 V |
| parallel | parallel2, current, V1 | 1.200 A (B1 0.600 A) | 0.600 A, 0.300 A, 1.800 A |
| mixed | mixed, current, B1 | 0.400 A (B2 0.200 A) | 0.200 A, 0.600 A, 0.800 A |

All four answer options in each question show different values.

## Tests

- Unit: `resolve()` fills every slot (including `question`), no `{` is left, the right choice equals the value above, and no distractor equals the right choice.
- E2E (headless): open `?check=1`, press **Set up the lab** for each question, read `#zsa-cb-meter-value`, and confirm the right choice's label equals it. Then pick the right choice and confirm the code starts with `CILC` and shows the score. Also confirm the existing **Check answers** button still works.
- The Collision Carts test that pins the highest registry id must not pin 17.

## Worksheet and key

`phys-circuits-lab-check.pdf` and `phys-circuits-lab-check-key.pdf` (made Nov 21, 2026). The long lab worksheet is `phys-circuits-virtual-lab.pdf`, so the Lab check files use the same `circuits` name. Their setups and answers match this brief question for question.
