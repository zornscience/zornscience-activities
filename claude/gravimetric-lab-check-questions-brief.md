# Gravimetric Analysis Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `gravimetric-lab/` (Gravimetric Analysis, version 1.1.3, activity slug `gravimetric-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-gravimetric-lab-check.pdf` (student sheet) and `chem-gravimetric-lab-check-key.pdf` (answer key). Course is Chemistry, prefix `chem-`.

## Registry entry (shared/zsa-codes.js)

- Prefix `GRLC` (the initial plus LC would be `GLC`, which is the Gas Lab, so it takes the first two letters plus LC).
- Registry id **21**.
- Entry, same shape as id 12:

```js
{id:21, prefix:"GRLC", slug:"gravimetric-lab", setting:"Lab check", name:"Gravimetric Analysis", maxItems:5,
  stats:[["mass", "Mass by difference"], ["constant", "Constant mass"], ["precip", "Mass of the precipitate"],
    ["moles", "Moles from the mole ratio"], ["identify", "Identify the unknown"]],
  totals:[["mass"], ["constant"], ["precip"], ["moles"], ["identify"]], items:[0, 1, 2, 3, 4]}
```

- The Collision Carts test that asserts the highest id is 12 must be fixed first (see the Projectile brief).
- Bump `zsa-version` to 1.2.0 in `gravimetric-lab/index.html` (minor), add `model.js`, `labcheck.js` and the shared Lab check files (`../shared/zsa-codes.js`, `../shared/zsa-labcheck.js`) the way `collision-carts/index.html` does, and add `<div class="labcheck-mount" id="zsa-gv-check"></div>` as the mount, inside `<main>` (for example after the `.workspace` block, before `details.model-note`).
- **Id clash notes:** the lab has no id containing "check". Existing ids include `action`, `balance`, `balance-display`, `observation`, `result`, `result-text`, `reveal`, `sample`, `identity`, `step-counter`, `step-title`, `step-detail`, `time-note`, `bench`, `scene-caption`. None is reused. `zsa-gv-check` is unused.
- README.md: add the version note and a line that the Lab check exists and issues a completion code.

## The lab has no model file and no way to set up a question from outside

The lab is a fixed 23-step procedure (the `steps` array in `lab.js`). The numbers are constants in `lab.js`: empty crucible 18.642 g, sample 2.000 g, filter paper 0.598 g, residual moisture 0.032 g on the first precipitate weighing, CaCO3 100.09 g/mol, and the unknown (odd trial sodium carbonate 105.99, even trial potassium carbonate 138.21). Two changes:

1. **Add `gravimetric-lab/model.js`** (loaded before `lab.js`, global `GravimetricModel`, `module.exports` for tests), and make `lab.js` read its constants from it so there is one copy (`crucible`, `paper`, the 2 g sample, 0.032 and 100.09, and `solid = 2/molar*100.09`):

```js
(function(){"use strict";
  const M={crucible:18.642, paper:0.598, sample:2, caco3:100.09, residual:0.032, molar:{Li:73.89, Na:105.99, K:138.21}};
  M.solid=u=>M.sample/M.molar[u]*M.caco3;   // g CaCO3 formed (quantitative recovery)
  // the readings the balance shows, before rounding to 3 decimals: empty crucible, crucible + sample, paper,
  // first paper + solid weighing (still 0.032 g wet), and the constant paper + solid mass
  M.readings=u=>{const s=M.solid(u);return {empty:M.crucible, withSample:M.crucible+M.sample, paper:M.paper,
    first:M.paper+s+M.residual, constant:M.paper+s, solid:s};};
  if(typeof module==="object"&&module.exports)module.exports=M;else self.GravimetricModel=M;
}());
```

2. **Add one event to `lab.js`** (replace the final `reset();` with this block followed by `reset();`), as `collision-carts/lab.js` does with `zsa-cc:request-lab`:

```js
root.addEventListener('zsa-gv:request-lab',function(e){e.detail.receive({
  // s = {unknown: "Na" | "K", step: 0 to 22 (how many steps are already done)}
  setup:function(s){
    trial=s.unknown==='K'?1:0; reset();      // reset() adds 1: odd gives sodium (Unknown A), even gives potassium (Unknown B)
    var n=s.step||0;
    for(var i=0;i<n;i++) steps[i][7]();       // run the state setter of each finished step, so the bench looks as it would
    index=n; render();                        // reset() cleared any run in progress and its timer
  },
  format:{g3:function(v){return v.toFixed(3);},mol5:function(v){return v.toFixed(5);},mm2:function(v){return v.toFixed(2);}}
});});
```

   `g3` is the balance format (`n.toFixed(3) + ' g'`). A student presses the action button once per step; it is disabled for about 1.8 s per step (0.75 s on a weighing) and then ready again. The Reveal button must not be pressed for Question 5 (it states the unknown); the sheet says so.

## How the numbers are filled in

Every number comes from `GravimetricModel.readings(unknown)` through `format`. Nothing is typed in. Round each balance reading to 3 decimals FIRST (`sh = v => Math.round(v*1000)/1000`) and compute the derived values from those rounded readings, because that is what a student with a calculator uses.

| slot | meaning | Na (Q1 to Q4) | K (Q5) |
|---|---|---|---|
| `empty`, `withSample` | sh(empty), sh(withSample) | 18.642, 20.642 | |
| `first`, `constant` | sh(first), sh(constant) | 2.519, 2.487 | 2.078, 2.046 |
| `paper` | 0.598 | 0.598 | 0.598 |
| `mass` | sh(withSample - empty) | 2.000 | |
| `water` | sh(first - constant) | 0.032 | |
| `precip` | sh(constant - paper) | 1.889 | 1.448 |
| `precipFirst` | sh(first - paper) | 1.921 | 1.480 |
| `nCaCO3` | precip / 100.09 | 0.01887 (mol5) | 0.01447 |
| `mm` | sample / (precip / 100.09) | 105.97 | 138.25 (mm2) |

## The five questions

All wrong choices are different common mistakes, and all four options show different values in every question (checked: Q1 2.000, 20.642, 18.642, 39.284; Q2 0.032, 0.000, 2.487, 0.598; Q3 1.889, 2.487, 1.921, 2.000; Q4 0.01887, 0.02485, 0.01998, 0.03775; Q5 138.25, 97.84, 135.26, 69.12).

### 1. `mass`: Mass by difference
- setup: `{unknown: "Na", step: 0}`
- question: "Press the action button 3 times and write down the balance reading for the empty crucible. Press it 4 more times (7 in all) and read the balance for crucible + carbonate. What is the mass of the dry carbonate?"
- choices (value, label, feedback key):
  - `right` `{mass} g` correct (= g3(withSample - empty))
  - `total` `{total} g` (= g3(withSample))
  - `empty` `{empty} g` (= g3(empty))
  - `sum` `{sum} g` (= g3(withSample + empty))
- feedback:
  - total: "That is the reading for the crucible and the carbonate together. The balance also weighs the crucible, so subtract the empty crucible reading."
  - empty: "That is the empty crucible from Weigh empty crucible. Subtract it from the crucible + carbonate reading to get the carbonate alone."
  - sum: "Do not add the two readings. The carbonate is the extra mass, so subtract the empty crucible."
- explanation: "The balance reads {withSample} g with the carbonate and {empty} g without it. The carbonate is the difference: {withSample} - {empty} = {mass} g."

### 2. `constant`: Constant mass
- setup: `{unknown: "Na", step: 19}` (the next step is Cool & weigh paper + solid)
- question: "Press Cool & weigh paper + solid, then Dry, cool & reweigh. How much mass did the paper and solid lose between the first and second readings?"
- choices:
  - `right` `{water} g` correct (= g3(first - constant))
  - `zero` `{zero} g` (= g3(0))
  - `second` `{second} g` (= g3(constant))
  - `paper` `{paper} g` (= g3(paper))
- feedback:
  - zero: "The two readings are not the same yet. A lower second reading means water was still in the solid. Subtract the second reading from the first."
  - second: "That is the second balance reading, not the change. Subtract it from the first reading."
  - paper: "That is the mass of the filter paper. The change is the first reading minus the second reading."
- explanation: "The first weighing was {first} g and the second was {constant} g. The solid lost {water} g of water. A lower reading means water was still present, so you dry and weigh again until two readings in a row agree."

### 3. `precip`: Mass of the precipitate
- setup: `{unknown: "Na", step: 19}`
- question: "The dry filter paper has a mass of {paper} g. Press the action button 3 times, until two readings in a row match. What is the mass of CaCO3?" (write CaCO<sub>3</sub> as the lab does in other strings, or CaCO₃ in the page text)
- choices:
  - `right` `{right} g` correct (= g3(constant - paper))
  - `withPaper` `{withPaper} g` (= g3(constant))
  - `first` `{first} g` (= g3(first - paper))
  - `sample` `{sample} g` (= g3(2))
- feedback:
  - withPaper: "That is the paper and solid together. Subtract the mass of the filter paper."
  - first: "That uses the first weighing, which still had water in it. Use the constant mass, where two readings in a row match."
  - sample: "That is the mass of the carbonate you started with. The question asks for the mass of CaCO₃ that formed, so use the final balance reading."
- explanation: "Constant mass is reached when two readings in a row match: {constant} g. Take away the filter paper: {constant} - {paper} = {right} g of CaCO₃."

### 4. `moles`: Moles from the mole ratio
- setup: `{unknown: "Na", step: 19}`
- question: "The dry filter paper is {paper} g and CaCO₃ is 100.09 g/mol. Press the action button 3 times to reach constant mass. How many moles of carbonate were in the sample? One mole of M₂CO₃ makes one mole of CaCO₃."
- choices:
  - `right` `{right} mol` correct (= mol5(precip / 100.09))
  - `noPaper` `{noPaper} mol` (= mol5(constant / 100.09))
  - `sample` `{sample} mol` (= mol5(2 / 100.09))
  - `double` `{double} mol` (= mol5(2 x precip / 100.09))
- feedback:
  - noPaper: "That uses the paper and solid together. Subtract the filter paper first, then divide by the molar mass."
  - sample: "That divides the carbonate sample mass by the molar mass of CaCO₃. Use the mass of CaCO₃ that formed."
  - double: "The mole ratio is 1 to 1, not 2 to 1. One mole of M₂CO₃ makes one mole of CaCO₃."
- explanation: "CaCO₃ = {constant} - {paper} = {precip} g. Moles of CaCO₃ = {precip} g / 100.09 g/mol = {right} mol. The ratio is 1 to 1, so the sample held {right} mol of carbonate."

### 5. `identify`: Identify the unknown
- setup: `{unknown: "K", step: 19}` (Unknown B)
- question: "The dry filter paper is {paper} g, the sample was 2.000 g and CaCO₃ is 100.09 g/mol. Press the action button 3 times to reach constant mass. What is the molar mass of the carbonate? Compare it with Li₂CO₃ (73.89), Na₂CO₃ (105.99) and K₂CO₃ (138.21 g/mol)."
- choices:
  - `right` `{right} g/mol` correct (= mm2(2 / (precip / 100.09)))
  - `noPaper` `{noPaper} g/mol` (= mm2(2 / (constant / 100.09)))
  - `first` `{first} g/mol` (= mm2(2 / (precipFirst / 100.09)))
  - `half` `{half} g/mol` (= mm2(2 / (2 x precip / 100.09)))
- feedback:
  - noPaper: "That leaves the filter paper in the precipitate mass, so the moles come out too high and the molar mass too low. Subtract the paper."
  - first: "That uses the first weighing, which still had 0.032 g of water. Use the constant mass, where two readings in a row match."
  - half: "The mole ratio is 1 to 1. Do not double the moles of CaCO₃."
- explanation: "CaCO₃ = {constant} - {paper} = {precip} g, which is {nCaCO3} mol. Molar mass = 2.000 g / {nCaCO3} mol = {right} g/mol. That matches K₂CO₃ (138.21 g/mol), so Unknown B is potassium carbonate."
- Note the wrong choice `first` (135.26) is also near K2CO3, but it is a different number from the right one, so there is still exactly one right choice.

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `gravimetric-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does.
- Spanish waits for the proofread. Leave the strings English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check" as in the other labs. Use real subscripts in the page text (₂, ₃ as the lab already does).

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices).
2. `GravimetricModel.readings("Na")` and `("K")` give balance readings of 20.642, 2.519, 2.487 (Na) and 2.078, 2.046 (K) to three decimals, and solid 1.889 and 1.448.
3. Playwright, on `file://`: set up each question through `zsa-gv:request-lab`, press the action button the stated number of times (wait for it to be enabled each time), and compare `#balance-display` with the right choice (Q1: reading after 3 presses is 18.642 g and after 7 is 20.642 g; Q2: 2.519 g then 2.487 g; Q3 to Q5: the third reading equals constant). Check the sample tag reads Unknown A for Na and Unknown B for K, and that `lab.js` still gives the same readings with no setup (23 presses, Na then K after Reset or reload parity unchanged).
4. Registry: id 21 `GRLC` decodes, the highest-id assertion in the Collision Carts test is updated, `maxItems` is 5.
5. No element id clash: `document.querySelectorAll('#zsa-gv-check').length === 1`.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on the `file://` lab with the event and model above applied to a scratch copy: set up, press the action button, read `#balance-display` after each press.

| Q | Setup | Balance after each press |
|---|---|---|
| 1 | Na, step 0, 7 presses | 0.000, 0.000, **18.642**, 0.000, 0.000, 0.000, **20.642** |
| 2, 3, 4 | Na, step 19, 3 presses (Unknown A) | **2.519**, **2.487**, **2.487** (then the step reads The evidence is ready) |
| 5 | K, step 19, 3 presses (Unknown B) | **2.078**, **2.046**, **2.046** |

Derived from those readings: Q1 2.000 g; Q2 0.032 g; Q3 1.889 g; Q4 0.01887 mol; Q5 138.25 g/mol (K₂CO₃). Note the balance shows 0.000 g between the weighings, so the sheet and the question tell the student which press gives each reading.

## Media (WordPress site 257744344)

`chem-gravimetric-lab-check.pdf` (media 14809) and `chem-gravimetric-lab-check-key.pdf` (media 14810). The lab's existing worksheet is `chem-gravimetric-virtual-lab.pdf` (media 7697, key 7698), so these names match it. The lesson page Gravimetric Analysis (page 546) already links both.
