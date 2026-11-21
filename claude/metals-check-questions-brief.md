# Metals, Nonmetals & Metalloids Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `metals-lab/` (Metals, Nonmetals & Metalloids Lab, version 1.1.4, activity slug `metals-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-metals-lab-check.pdf` (student sheet) and `chem-metals-lab-check-key.pdf` (answer key). Chemistry course, so the prefix is `chem-`. The lab's existing worksheet is `chem-metals-virtual-lab.pdf` (media 7705, key 7706).

This lab is qualitative: there is no calculation. Every "number" is a readout the lab prints (a word, a status line or a temperature). The answers still come from one place, a new `model.js`, so nothing is typed into the questions.

## Registry entry (shared/zsa-codes.js)

- Prefix `MLC`. The rule is the lab's initial plus LC. `MLC` is not the start of another prefix (check the list again when merging, other labs are being added).
- Registry id **22** (assigned by the orchestrator).
- Entry, same shape as id 12:

```js
{id:22, prefix:"MLC", slug:"metals-lab", setting:"Lab check", name:"Metals, Nonmetals & Metalloids", maxItems:5,
  stats:[["luster", "Color and luster of Unknown C"], ["conduct", "Conductivity of Unknown C"], ["press", "Pressing Unknown C"],
    ["acid", "Unknown A in hydrochloric acid"], ["open", "Open circuit or no current"]],
  totals:[["luster"], ["conduct"], ["press"], ["acid"], ["open"]], items:[0, 1, 2, 3, 4]}
```

- Bump `zsa-version` to 1.2.0 in `metals-lab/index.html` (minor), add `labcheck.js` and the shared Lab check files the way `collision-carts/index.html` does, and add `<div id="zsa-mt-check"></div>` as the mount.
- **Id clash notes:** the lab's ids are `observation`, `scene-state`, `clock`, `temperature`, `meter-value`, `meter-led`, `press`, `contact`, `add-acid`, `add-solid`, `dispose`, `fresh-tube`, `fresh-mortar`, `pause`, `light-angle`, `station-title`, `sample-badge`, `equipment` and the SVG ids, plus `zsa-th-*` header ids. None contains "check" and none starts with `zsa-mt`. The mount `#zsa-mt-check` is new. Do not reuse `#observation`, `#temperature` or `#press`: the checks read them.
- `README.md` says "No persistence, logging, grading, completion codes, outside requests, or student data entry." Reword it to say that only the Lab check issues a completion code. The CSP in `index.html` already allows same-origin scripts.

## The lab has no model file and no setup hook: extract one and add one event

All the answer data (`samples` with appearance, mechanical and conductivity text, the meter word, and the acid warming formula) lives inside the closure in `lab.js`. Move it to a new `metals-lab/model.js` (load it before `lab.js` and `labcheck.js`; also `module.exports` for tests). `lab.js` must use it, so the lab and the check share one copy:

```js
// metals-lab/model.js
(function (root) {
  var samples = {
    A: {color: "Silvery gray", luster: "shiny", press: "SOLID FLATTENS", current: "STRONG"},
    B: {color: "Yellow",       luster: "dull",  press: "SOLID FRACTURES", current: "NONE"},
    C: {color: "Dark gray",    luster: "shiny", press: "SOLID FRACTURES", current: "WEAK"}
  };
  // lab.js keeps its long sentences (appearance, mechanical, conductivity) in the same table and fills in the fields above.
  function acidTemperature(sample, elapsed) {   // elapsed in simulated seconds, 0 to 300 (what lab.js calls elapsed)
    var warming = sample === "A" ? Math.max(0, Math.min(1, (elapsed - 35) / 220)) * 2.6 : 0;
    return 22 + warming;
  }
  var api = {samples: samples, acidTemperature: acidTemperature, OPEN: "OPEN", END: 300};
  if (typeof module !== "undefined") module.exports = api; else root.MetalsLabModel = api;
}(this));
```

Then in `lab.js`: `samples[sample].current`, the scene status words (`SOLID FLATTENS` / `SOLID FRACTURES`, now `samples[sample].press`) and the temperature line (`MetalsLabModel.acidTemperature(sample, elapsed).toFixed(1) + ' °C'`) read from the model. Text and behavior stay the same. The Spanish translation keys in `data.js` stay as they are (the lab still passes the same English strings through `t()`).

What is missing is a way to set up a question from outside, because the sample and station are closure variables. Add this to `lab.js` (just before the final `restore(); window.requestAnimationFrame(frame);`), as `collision-carts/lab.js` does with `zsa-cc:request-lab`:

```js
root.addEventListener('zsa-mt:request-lab',function (e) { e.detail.receive({
  // s = {sample: "A" | "B" | "C", station: "appearance" | "malleability" | "conductivity" | "acid"}
  setup: function (s) {
    if (acidBusy()) { acid = 'disposed'; }          // a question can start while an acid run is open: drop it
    sample = s.sample; station = s.station; restore();
    say(t('Lab set up for the question.'));            // optional; only if you also add the Spanish string
  },
  format: {
    temperature: function (v) { return v.toFixed(1) + ' °C'; }   // exactly the temperature readout
  }
}); });
```

Notes:
- `restore()` already resets the tube, mortar, probes and light. Do not call `say(...)` after it if you prefer the lab's own opening sentence to stay on screen (the questions do not need the extra sentence, so leaving it out avoids a new Spanish string).
- `format.temperature` must be the same expression the readout uses (`(22 + warming).toFixed(1) + ' °C'`). Better still, make `updateAcid()` call it, so there is one copy.
- The check sets up only the starting state. The student still presses the lab's own buttons.

## How the question words are filled in

Everything comes from `MetalsLabModel.samples[...]` and `acidTemperature`. Nothing is typed in. Slots for the questions:

| Slot | Source |
|---|---|
| `cLabel`, `aLabel`, `bLabel` | `color.toLowerCase()` + " and " + `luster` of C, A, B (for example "dark gray and shiny") |
| `cMixed` | C's color with B's luster ("dark gray and dull") |
| `cur.A/B/C` | `samples.X.current` |
| `open` | `MetalsLabModel.OPEN` |
| `press.A/B/C`, `pressing`, `fresh` | `samples.X.press`; `pressing` is the status line during the press ("TESTING MALLEABILITY"); `fresh` is the status before a press ("FRESH SOLID IN MORTAR"). Read these two from `lab.js` through the model too (add `states: {pressing: "TESTING MALLEABILITY", fresh: "FRESH SOLID IN MORTAR"}`) |
| `t0`, `tEnd`, `rise`, `drop` | `t0 = acidTemperature("A", 0)` (22.0), `tEnd = acidTemperature("A", END)` (24.6), `rise = tEnd - t0` (2.6), `drop = t0 - rise` (19.4); all formatted with `format.temperature` or `toFixed(1)` |

## The five questions

All wrong choices are different common mistakes, and all four options show different values in every question (checked: Q1 four labels, Q2 WEAK / STRONG / NONE / OPEN, Q3 SOLID FRACTURES / SOLID FLATTENS / TESTING MALLEABILITY / FRESH SOLID IN MORTAR, Q4 24.6 / 22.0 / 2.6 / 19.4, Q5 OPEN / STRONG / NONE / WEAK).

### 1. `luster`: Color and luster of Unknown C
- setup: `{sample: "C", station: "appearance"}`
- question: "Move the inspection light across Unknown C. Which description matches the bench note?"
- choices (value, label, feedback key):
  - `right` `{cLabel}` correct (Dark gray and shiny)
  - `silver` `{aLabel}` (Silvery gray and shiny, Unknown A)
  - `yellow` `{bLabel}` (Yellow and dull, Unknown B)
  - `dull` `{cMixed}` (Dark gray and dull)
- feedback:
  - silver: "That describes Unknown A. Check the sample button: the bench note must say Unknown C, and look at the color word."
  - yellow: "That describes Unknown B. Check that Unknown C is selected and read the color in the bench note."
  - dull: "Look at the luster. The bench note says the crystal faces are shiny and reflective as the light moves."
- explanation: "Unknown C is {cLabel}. Luster alone does not make it a metal. Use malleability, conductivity and the acid test too."
- Right answer on the sheet: Dark gray, shiny.

### 2. `conduct`: Conductivity of Unknown C
- setup: `{sample: "C", station: "conductivity"}`
- question: "Press Touch probes to solid. What does the tester show?"
- choices:
  - `right` `{cur.C}` correct (WEAK)
  - `strong` `{cur.A}` (STRONG, expects a shiny solid to conduct like a metal)
  - `none` `{cur.B}` (NONE, expects an insulator)
  - `open` `{open}` (OPEN, forgot to press the button)
- feedback:
  - strong: "STRONG is Unknown A, the metal. A shiny solid is not always a strong conductor. Check which unknown is selected and read the tester."
  - none: "NONE means no current at all, which is Unknown B. Unknown C conducts a little. Read the tester while the probes touch the solid."
  - open: "OPEN means the probes are not touching the solid. Press Touch probes to solid first."
- explanation: "Unknown C reads {cur.C}. It conducts, but much less than the metal ({cur.A}) and more than the nonmetal ({cur.B}). That is semiconductor behavior."

### 3. `press`: Pressing Unknown C
- setup: `{sample: "C", station: "malleability"}`
- question: "Press with pestle once and wait for the press to finish. What does the status line under the picture show?"
- choices:
  - `right` `{press.C}` correct (SOLID FRACTURES)
  - `flat` `{press.A}` (SOLID FLATTENS, shiny must mean malleable)
  - `mid` `{pressing}` (TESTING MALLEABILITY, read too early)
  - `fresh` `{fresh}` (FRESH SOLID IN MORTAR, did not press)
- feedback:
  - flat: "SOLID FLATTENS is what a metal like Unknown A does. Unknown C is shiny but brittle. Read the status after the press."
  - mid: "That shows while the pestle is still pressing. Wait about two seconds until the press finishes, then read it again."
  - fresh: "That is the starting status. Press with pestle, then read the status line again."
- explanation: "Unknown C fractures into sharp pieces. It is shiny like a metal but brittle like a nonmetal, which is typical of a metalloid."

### 4. `acid`: Unknown A in hydrochloric acid
- setup: `{sample: "A", station: "acid"}`
- question: "Press 1. Pipette 3 mL HCl, then 2. Add solid. Wait until the clock reads 05:00 / 05:00 (about 15 seconds). What does the temperature readout show?"
- choices:
  - `right` `{tEnd}` correct (24.6 °C)
  - `same` `{t0}` (22.0 °C, thinks nothing happens, or read it before the run)
  - `change` `{rise} °C` (2.6 °C, the change instead of the temperature)
  - `cool` `{drop}` (19.4 °C, thinks the reaction cools the tube)
- feedback:
  - same: "That is the starting temperature. Unknown A reacts with the acid and releases energy. Wait until the clock reaches 05:00 / 05:00."
  - change: "That is how much the temperature rose. The readout shows the temperature itself, not the change."
  - cool: "The tube warms, not cools. The reaction releases energy into the liquid."
- explanation: "Unknown A reacts with the acid, bubbles gas and warms the tube by {rise} °C, from {t0} to {tEnd}. Gas and warming are evidence of a chemical reaction."

### 5. `open`: Open circuit or no current
- setup: `{sample: "A", station: "conductivity"}`
- question: "Press Touch probes to solid, then press Lift probes. What does the tester show now?"
- choices:
  - `right` `{open}` correct (OPEN)
  - `strong` `{cur.A}` (STRONG, the old reading)
  - `none` `{cur.B}` (NONE, confuses open circuit with an insulator)
  - `weak` `{cur.C}` (WEAK)
- feedback:
  - strong: "STRONG was the reading while the probes touched the solid. After you lift them, the circuit is open. Read the tester again."
  - none: "NONE is what an insulator gives when the probes touch it. With the probes lifted nothing is touching the solid at all."
  - weak: "WEAK is the reading for Unknown C. With the probes lifted the circuit is open for every sample."
- explanation: "Lifting the probes opens the circuit, so the tester reads {open} for any sample. {cur.B} would mean the probes touch the solid but no current flows, as with the nonmetal."

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `metals-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does.
- Spanish waits for the proofread. Leave the strings English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys. The meter words (STRONG, WEAK, NONE, OPEN) and status lines in the choices are the same English strings the lab already passes through `t()` in Spanish; in a Spanish check the choices will have to use the same `t()` of those strings so they match the screen. Note this for the Spanish pass.
- Style: no em dashes, short sentences, "Lab check" as in the other labs.

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices).
2. Choice labels equal the model values (`MetalsLabModel.samples`, `acidTemperature`) and, in Playwright, after setup through `zsa-mt:request-lab` and the student's button presses, the right choice matches the screen: `#observation` text begins with the color word (Q1), `#meter-value` (Q2, Q5), `#scene-state` after the press (Q3), `#temperature` once `#dispose` is enabled (Q4).
3. Registry: id 22 `MLC` decodes, `maxItems` is 5.
4. No element id clash: `document.querySelectorAll('#zsa-mt-check').length === 1`, and the existing metals-lab test still passes (acid, solid, wait, waste order; sample and station buttons locked during an acid run).
5. Q4 takes about 15 seconds of real time (5 simulated minutes at 20x). In the test, wait for `#dispose` to be enabled (up to 40 s). In hidden tabs the clock stops, so keep the page visible.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on the `file://` lab, driving the sample and station buttons and the lab's own buttons, reading the elements below.

| Q | Setup and steps | Readout |
|---|---|---|
| 1 | Unknown C, Appearance, `#observation` | "Dark gray with shiny, reflective crystal faces..." (A: "Silvery gray with a bright metallic reflection...", B: "Yellow with a dull surface...") |
| 2 | Unknown C, Conductivity, Touch probes to solid, `#meter-value` | **WEAK** (A STRONG, B NONE) |
| 3 | Unknown C, Malleability, Press with pestle, wait 2.2 s, `#scene-state` | **SOLID FRACTURES** (A: SOLID FLATTENS; during the press: TESTING MALLEABILITY; fresh: FRESH SOLID IN MORTAR) |
| 4 | Unknown A, Reaction with HCl, Pipette, Add solid, wait for clock 05:00 / 05:00, `#temperature` | **24.6 °C** (clock "05:00 / 05:00 · 20×", status OBSERVATION COMPLETE). Unknown B ends at 22.0 °C. |
| 5 | Unknown A, Conductivity, Touch probes (STRONG), Lift probes, `#meter-value` | **OPEN** |

## Media (WordPress site 257744344)

`chem-metals-lab-check.pdf` (media 14807) and `chem-metals-lab-check-key.pdf` (media 14808), uploaded. URLs: `https://zornscience.org/wp-content/uploads/2026/11/chem-metals-lab-check.pdf` and `...chem-metals-lab-check-key.pdf`. Linked from the Metals, Nonmetals & Metalloids lesson page (id 504). The Chemistry Virtual Labs page 4524 still needs its Lab check line, and the Spanish pages wait for the proofread.
