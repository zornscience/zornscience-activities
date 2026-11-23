# Kinetics and Collision Theory Sandbox Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `kinetics-lab/` (Kinetics and Collision Theory Sandbox, version 1.1.3, activity slug `kinetics-lab`). Do not confuse it with the Iodine Clock Lab (`iodine-clock-lab`), which already has its own Lab check. Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-kinetics-lab-check.pdf` (student sheet) and `chem-kinetics-lab-check-key.pdf` (answer key). Chemistry course, file prefix `chem-`. The lab's worksheet is `chem-kinetics-virtual-lab.pdf` (media 7701, key 7702), so these names match it.

**What the lab shows.** A 2D box of colliding A and B disks, with the concentration graph, readouts (time, [A], collisions per second, successful per second, success rate, reaction rate) and two energy charts. The numbers a Lab check can rely on are the model's collision theory values, printed in `#zsa-kn-energy-text`: "At {T} K, the average collision energy (RT) is {rt} kJ/mol. Collision theory predicts that {pct} of A-B collisions have at least Ea = {ea} kJ/mol." The same share is printed on the collision energy chart ("Ea: {pct} react"). Also readable: the slider outputs (`#zsa-kn-temp-out` "300 K", `#zsa-kn-ea-out` "8.0 kJ/mol"), the catalyst text (`#zsa-kn-catalyst-text`: "Catalyst in the box: Ea is lowered from 12.0 to 6.0 kJ/mol.") and the profile chart ("Ea = 6.0 kJ/mol with the catalyst").

**Determinism (this is the random group).** The box is random: `newRun()` seeds each run with `Math.random()` (`seed()` in `lab.js`), and the collision counts, successful collisions per second, success rate, half-life and graph all depend on that seed and on the clock (`requestAnimationFrame`). **No question reads any of those.** Every question reads only values computed from the model's closed-form collision theory, `fractionAbove(ea, T)` = e^(-Ea/RT) through `percent()`, and `RT(T)`, which depend only on T, Ea and the catalyst. The setup event also makes the starting state identical every time: it pauses the run at time 0 (nothing moves, no collisions, so the energy text has no "So far this run" sentence) and creates the run with a fixed seed of 1 (`M.createRun(settings, 1)`) so even the picture of the box is the same. The sheet note tells students the moving particles are only a picture and not to press Play. Verified on the live lab: every question set up and driven three times, each time after letting the page run a different length of time first (0.5, 1.2 and 1.9 s of random motion before the setup), and all readouts were identical (table below).

## Registry entry (shared/zsa-codes.js)

- Prefix `KLC` (Kinetics Lab Check, the lab's initial plus LC). Confirmed free: existing prefixes are ICT, IFB, GAS, PTR, LVB, LVA, GLC, ALC, PLC, HLC, CLC plus FLC, CALC, FLLC, EKLC, ELC, ELLC, EQLC, FRLC, GALC, GRLC, IOLC, MLC, NLC, PBLC, RLC, BLC, CHLC from the other briefs. None is a prefix of `KLC` and `KLC` starts none of them.
- Registry id: to be assigned (none left, awaiting the code-format decision). Use `id: <next id>` as a placeholder below.
- Entry, same shape as id 12:

```js
{id:<next id>, prefix:"KLC", slug:"kinetics-lab", setting:"Lab check", name:"Kinetics and Collision Theory Sandbox", maxItems:5,
  stats:[["temp", "Temperature and the share that react"], ["ea", "Lowering the activation energy"], ["catalyst", "Adding a catalyst"],
    ["rt", "Average collision energy"], ["both", "A catalyst and a higher temperature"]],
  totals:[["temp"], ["ea"], ["catalyst"], ["rt"], ["both"]], items:[0, 1, 2, 3, 4]}
```

- Bump `zsa-version` from 1.1.3 to 1.2.0 (minor) in `kinetics-lab/index.html`, change every `?v=1.1.3` to `?v=1.2.0`, add the Lab check CSS, `../shared/zsa-codes.js`, `../shared/zsa-labcheck.js` and `labcheck.js` (after `lab.js`) the way `collision-carts/index.html` does, and add the mount `<div id="zsa-kt-check"></div>` (inside `<main>`, after the `.zsa-kn-work` block and before the live region). Add a changelog line to `README.md`, and reword "no completion code" in the README (Assumptions and "Decisions for the teacher") to say that only the Lab check issues a completion code. The lab keeps its self-only CSP.
- **Id and event clash check.** The lab's ids are all `zsa-kn-...`, **including `#zsa-kn-check`, the "Check my answers" button**. So the suggested `kn` short name clashes: do not use `#zsa-kn-check`. Use short name **`kt`**: mount **`#zsa-kt-check`**, event **`zsa-kt:request-lab`**. A search of the repo finds no `zsa-kt` id, class or event. The lab's existing events are `zsa-kn:request-model`, `zsa:request-i18n` and `zsa:request-data` (the last is answered from `data.js`; check how `data.js` answers it and add `check` the way Collision Carts does). Do not touch `#zsa-kn-check`, `#zsa-kn-feedback` or the lab's own four questions (`sim.js` `QUESTIONS`); they stay as they are.

## The model is separate; only a setup event is missing

`sim.js` already exposes the model through the `zsa-kn:request-model` event and `module.exports` (`fractionAbove`, `effectiveEa`, `RT`, `percent`, `fmt`, `createRun`). `labcheck.js` requests it the way `lab.js` does. What is missing is a way to set up a question from outside, because the settings live in closure variables in `lab.js`. Add this to `lab.js` just before the final `showSettings(); newRun(true);` lines. Tested on a copy of the lab:

```js
// Lab check setup: the same conditions every time, paused at time 0 with a fixed seed, so every readout is the same.
root.addEventListener("zsa-kt:request-lab", function (event) {
  event.detail.receive({
    // s = {T, conc, ea, catalyst}: T in K (200 to 600, steps of 10), conc in M, ea in kJ/mol, catalyst true or false
    setup: function (s) {
      window.clearTimeout(concTimer);
      window.clearTimeout(settleTimer);
      settings = {conc: s.conc, T: s.T, ea: s.ea, catalyst: !!s.catalyst};
      earlier = [];
      runNumber = 1;
      playing = false;
      flashes = [];
      halfTold = false;
      run = M.createRun(settings, 1);
      showSettings();
      showEarlier();
      show();
    },
    // the text as the page prints it
    format: {percent: M.percent, kj1: function (v) { return fmt(v, 1); }, kj2: function (v) { return fmt(v, 2); }}
  });
});
```

The "Set up the lab" button therefore also undoes any earlier slider changes and clears the earlier runs. It leaves the lab paused ("Play" button). If a student presses Play anyway, the energy text still shows the same first two sentences (only a third, random sentence about this run is appended), so the answers stay correct. In the Spanish lab the English labels are used only for the English check (Spanish waits for the proofread).

The student then follows the question using the lab's own controls with the keyboard so they land on exact values: click the slider's **label** (Temperature or Activation energy, which focuses the slider without moving it), then press **End**, **Home** or the **Right arrow** key (steps of 10 K and 0.5 kJ/mol). The catalyst is the "Add a catalyst" button. Never click on the slider track (that sets an unpredictable value).

## How the question numbers are filled in

Every label comes from the model through `format`. Nothing is typed in. Let `share(T, ea, cat) = format.percent(M.fractionAbove(M.effectiveEa(ea, cat), T))` and `rt(T) = format.kj2(M.RT(T))`.

| slot | formula | value |
|---|---|---|
| Q1 right | `share(600, 8, false)` | 20% |
| Q1 same | `share(300, 8, false)` | 4.0% |
| Q1 double | `format.percent(M.fractionAbove(8, 300) * 2)` | 8.1% |
| Q1 falls | `share(200, 8, false)` | 0.81% |
| Q2 right | `share(300, 2, false)` | 45% |
| Q2 same | `share(300, 8, false)` | 4.0% |
| Q2 quarter | `format.percent(M.fractionAbove(8, 300) * 4)` | 16% |
| Q2 high | `share(300, 16, false)` | 0.16% |
| Q3 right | `share(300, 12, true)` | 9.0% |
| Q3 same | `share(300, 12, false)` | 0.81% |
| Q3 twice | `format.percent(M.fractionAbove(12, 300) * 2)` | 1.6% |
| Q3 all | the text "100%" (a catalyst does not remove the barrier) | 100% |
| Q4 right | `rt(400)` | 3.33 |
| Q4 same | `rt(300)` | 2.49 |
| Q4 joules | `String(Math.round(M.R * 400))` | 3326 |
| Q4 ea | `format.kj1(8)` | 8.0 |
| Q5 right | `share(400, 12, true)` | 16% |
| Q5 temp | `share(400, 12, false)` | 2.7% |
| Q5 cat | `share(300, 12, true)` | 9.0% |
| Q5 start | `share(300, 12, false)` | 0.81% |

Explanation slots: Q1 `{rt300}` 2.49, `{rt600}` 4.99; Q2 `{rt}` 2.49; Q3 `{ea}` 12.0, `{cat}` 6.0 (`format.kj1(M.effectiveEa(12, true))`); Q4 `{ea}` 8.0, `{pct}` = `share(400, 8, false)` 9.0%; Q5 `{cat}` 9.0%, `{temp}` 2.7%, `{rt}` 3.33.

## The five questions

All wrong choices are different common mistakes, and all four options differ in every question (checked in the table above).

### 1. `temp`: Temperature and the share that react
- setup: `{T: 300, conc: 0.5, ea: 8, catalyst: false}` (300 K, 0.50 M, Ea 8.0 kJ/mol, shown share 4.0%)
- question: "Click the Temperature label, then press the End key (600 K). Do not press Play. What share of A-B collisions does the energy text say have at least Ea?"
- choices (value, label, feedback key):
  - `right` `{right}` correct (20%)
  - `same` `{same}` (4.0%)
  - `double` `{double}` (8.1%)
  - `falls` `{falls}` (0.81%)
- feedback:
  - same: "That is the share at 300 K. Click the Temperature label, press End so the slider reads 600 K, then read the energy text again."
  - double: "That only doubles the starting share because 600 K is twice 300 K. The share does not grow in proportion to T. It grows much faster. Read the energy text at 600 K."
  - falls: "That is the share at a lower temperature. A hotter box has faster particles, so more collisions reach Ea, not fewer. Check that the slider reads 600 K."
- explanation: "Faster particles hit harder, so more collisions reach Ea = 8.0 kJ/mol. The share is e^(-Ea/RT). The average collision energy RT rises from {rt300} to {rt600} kJ/mol, so the share goes from {same} to {right}, much more than double."

### 2. `ea`: Lowering the activation energy
- setup: `{T: 300, conc: 0.5, ea: 8, catalyst: false}`
- question: "Click the Activation energy label, then press the Home key (Ea 2.0 kJ/mol). Do not press Play. What share of A-B collisions does the energy text say have at least Ea?"
- choices:
  - `right` `{right}` correct (45%)
  - `same` `{same}` (4.0%)
  - `quarter` `{quarter}` (16%)
  - `high` `{high}` (0.16%)
- feedback:
  - same: "That is the share with Ea = 8.0. Click the Activation energy label, press Home so the slider reads 2.0 kJ/mol, then read the energy text."
  - quarter: "That treats the share as proportional to Ea: a quarter of the barrier, four times the share. It is not that simple. The share is e^(-Ea/RT). Read the energy text."
  - high: "That is the share with a very high barrier. A lower Ea lets more collisions react, not fewer. Check that the slider reads 2.0 kJ/mol."
- explanation: "The share is e^(-Ea/RT). At 300 K, RT = {rt} kJ/mol, so with Ea = 2.0 kJ/mol the share is e^(-2.0/2.49) = {right}. A lower barrier lets many more collisions react."

### 3. `catalyst`: Adding a catalyst
- setup: `{T: 300, conc: 0.5, ea: 12, catalyst: false}` (300 K, Ea 12.0 kJ/mol, shown share 0.81%)
- question: "Press Add a catalyst. Do not press Play. What share of A-B collisions does the energy text say have at least Ea now?"
- choices:
  - `right` `{right}` correct (9.0%)
  - `same` `{same}` (0.81%)
  - `twice` `{twice}` (1.6%)
  - `all` `{all}` (100%)
- feedback:
  - same: "That is the share before the catalyst. Press Add a catalyst and check that the catalyst text says Ea is lowered. Then read the energy text."
  - twice: "That only doubles the old share because Ea is halved. The share is e^(-Ea/RT), so halving Ea does much more than double it. Read the energy text."
  - all: "A catalyst lowers the barrier. It does not remove it, so most collisions still bounce. Read the share in the energy text."
- explanation: "A catalyst offers a pathway with half the activation energy, so Ea goes from {ea} to {cat} kJ/mol. The temperature and the collisions are the same, but the share with at least Ea rises from {same} to {right}. The catalyst is not used up."

### 4. `rt`: Average collision energy
- setup: `{T: 300, conc: 0.5, ea: 8, catalyst: false}`
- question: "Click the Temperature label, then press the Right arrow key 10 times (400 K). Do not press Play. What average collision energy (RT) does the energy text show, in kJ/mol?"
- choices:
  - `right` `{right} kJ/mol` correct (3.33)
  - `same` `{same} kJ/mol` (2.49)
  - `joules` `{joules} kJ/mol` (3326)
  - `ea` `{ea} kJ/mol` (8.0)
- feedback:
  - same: "That is RT at 300 K. Press the Right arrow 10 times so the slider reads 400 K, then read the energy text again."
  - joules: "That is R times T in joules per mole. The lab gives kJ/mol, so divide by 1000. Read the RT value in the energy text."
  - ea: "That is the activation energy, not the average collision energy. RT is the first number in the energy text."
- explanation: "RT = 8.314 J/(mol·K) × 400 K = 3326 J/mol = {right} kJ/mol. That is well below Ea = {ea} kJ/mol, so most collisions bounce. Only the {pct} in the high-energy tail react."

### 5. `both`: A catalyst and a higher temperature
- setup: `{T: 300, conc: 0.5, ea: 12, catalyst: false}`
- question: "Press Add a catalyst. Then click the Temperature label and press the Right arrow key 10 times (400 K). Do not press Play. What share of A-B collisions does the energy text say have at least Ea?"
- choices:
  - `right` `{right}` correct (16%)
  - `temp` `{temp}` (2.7%)
  - `cat` `{cat}` (9.0%)
  - `start` `{start}` (0.81%)
- feedback:
  - temp: "That is the share with the higher temperature only. Press Add a catalyst too, so the catalyst text says Ea is lowered to 6.0, then read the energy text."
  - cat: "That is the share with the catalyst only. Raise the temperature to 400 K as well (Right arrow 10 times), then read the energy text."
  - start: "That is the starting share. Both changes make more collisions reach Ea. Check that the catalyst is on and the slider reads 400 K."
- explanation: "With the catalyst Ea = 6.0 kJ/mol, and at 400 K RT = {rt} kJ/mol, so the share is e^(-6.0/3.33) = {right}. The catalyst alone gives {cat} and the temperature alone gives {temp}. Together they give far more than either one."

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `kinetics-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data` the way Collision Carts does (keep the lab's existing `copy` for `i18n.configure`; the `zsa:request-data` answer is a new handler or extends the lab's own, as Collision Carts does).
- Spanish waits for the proofread. English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check".

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices), and every label in a question is different.
2. The right choice equals the formatted model result for each setup (slots table), and (Playwright) after `zsa-kt:request-lab` setup and the stated steps (click the label, press End, Home or the arrow keys, or click the catalyst button), the right choice appears in the text of `#zsa-kn-energy-text` (Q1, Q2, Q3, Q5: the share; Q4: the RT value), and the chart label `#zsa-kn-dist` "Ea: {share} react" matches for Q1, Q2, Q3, Q5.
3. Reproducibility: run each setup 20 times in a loop, and let the page run for different lengths of time before each setup, and assert the energy text, the slider outputs and the readouts (`0.0 s`, `0.50 M`, `none yet`) are identical. Assert the lab is paused ("Play") after setup.
4. Registry: the new `KLC` entry decodes, `maxItems` is 5, and the Collision Carts highest-id test is updated for whatever id is assigned.
5. `document.querySelectorAll('#zsa-kt-check').length === 1`, `#zsa-kn-check` still has its own handler, and the existing Kinetics tests (`tests/e2e/kinetics-lab.spec.js`, unit tests for `sim.js`, SEO and a11y specs, i18n) still pass with the new version.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on a `file://` copy of the lab with the setup event above, driving the real slider labels, keys and catalyst button. Each question was run three times, after letting the box run a different time before the setup, and all three were identical.

| Q | Setup | Steps | Energy text |
|---|---|---|---|
| 1 | 300 K, Ea 8.0 | click Temperature label, End | At 600 K, RT is 4.99 kJ/mol. **20%** have at least Ea = 8.0 kJ/mol. Chart: "Ea: 20% react" |
| 2 | 300 K, Ea 8.0 | click Ea label, Home | At 300 K, RT is 2.49. **45%** have at least Ea = 2.0. Chart: "Ea: 45% react" |
| 3 | 300 K, Ea 12.0 | Add a catalyst | RT 2.49. **9.0%** have at least Ea = 6.0. Catalyst text: "Ea is lowered from 12.0 to 6.0 kJ/mol." |
| 4 | 300 K, Ea 8.0 | click Temperature label, Right x10 | At 400 K, RT is **3.33 kJ/mol**. 9.0% have at least Ea = 8.0. |
| 5 | 300 K, Ea 12.0 | Add a catalyst, Temperature label, Right x10 | At 400 K, RT is 3.33. **16%** have at least Ea = 6.0. Chart: "Ea: 16% react" |

In every run the readouts below the box read `0.0 s / 0.50 M / 0 /s / 0.0 /s / none yet / 0.000 M/s` and the button read "Play".

## Judgment call: concentration

The lab's concentration effect (rate = k[A][B]) shows only in collision counts and rates, which come from the random simulation, so no question reads them. The five ideas are temperature, activation energy, the catalyst, average collision energy (RT) and two changes together. If Nick wants a concentration question later, it needs a statistical readout (a seeded run read after a fixed number of steps), which is not in this brief.

## Media (WordPress site 257744344)

`chem-kinetics-lab-check.pdf` (media 14966) and `chem-kinetics-lab-check-key.pdf` (media 14967), uploaded. The lab's worksheet is `chem-kinetics-virtual-lab.pdf` (media 7701, key 7702). The Iodine Clock Lab's check (`chem-iodine-clock-lab-check.pdf`) is separate.
