# Reaction Energy Lab Check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `reaction-energy-lab/` (Reaction Energy Lab, version 1.0.4 in `index.html`, activity slug `reaction-energy-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-reaction-energy-lab-check.pdf` (student sheet) and `chem-reaction-energy-lab-check-key.pdf` (answer key). Course on the PDFs is Chemistry, file prefix `chem-`, matching the lab's worksheet `chem-reaction-energy-virtual-lab.pdf` (media 8477, key 8478).

## The "not before Check" rule (sheet note, Reaction Energy Lab v1.0.2)

The lab must not show the stoichiometry steps (Calculation steps panel) or the energy diagram readout (the "ΔH = ...; Ea = ..." line and its Data table rows) before the student presses Check. Today the lab shows both immediately. These five questions never read either one, so hiding them later breaks nothing here. Do not add a question that reads the diagram readout or the stoichiometry steps unless that Check rule is built first. The setup event below never touches diagram or stoichiometry mode.

## Registry entry (shared/zsa-codes.js)

- Prefix `RLC` (assigned), registry id **28**, slug `reaction-energy-lab`, setting "Lab check", name "Reaction Energy", maxItems 5. Check that `RLC` is not the start of another prefix and that id 28 is free.
- Entry, same shape as id 12:

```js
{id:28, prefix:"RLC", slug:"reaction-energy-lab", setting:"Lab check", name:"Reaction Energy", maxItems:5,
  stats:[["warm", "Ice warmed through melting"], ["steam", "Steam condensing"], ["hess", "Hess's law, reverse and multiply"],
    ["bonds", "Bond enthalpies"], ["koh", "Dissolving KOH"]],
  totals:[["warm"], ["steam"], ["hess"], ["bonds"], ["koh"]], items:[0, 1, 2, 3, 4]}
```

- The Collision Carts test that asserts the highest id must be updated if it is not already (see the other briefs).
- Bump `zsa-version` (minor, 1.0.4 to 1.1.0) in `reaction-energy-lab/index.html`, add `labcheck.js` and the shared Lab check files the way `collision-carts/index.html` does, and add `<div id="zsa-re-check"></div>` as the mount (inside `main`, after the Data table card, before the live region).
- **Id clash to avoid:** the lab has many ids containing "check": `check-diagram`, `check-sketch`, `check-stoich`, `check-bonds`, `check-heating`, `check-sum--1`, `check-sum-1`, `check-formation`, `check-hess`, `check-unknown`, plus `copy-data`, `download-data`, `export-status`, `copy-fallback`, `live`. None may be reused. `#zsa-re-check` is unused. The lab also uses the CLASS `zsa-re-check` (checkbox label in `check()` in lab.js): that is a class, not an id, so there is no clash, but make sure no stylesheet rule written for the Lab check uses `.zsa-re-check`. Also do not use the ids `tab-*`, `panel-*`, `r`, `p`, `peak`, `mass`, `start`, `end`, `reaction`, `substance`.
- `README.md` says "Student answers ... any completion code" is unchanged. Reword the line about completion codes (top of the README, version note) so it says the Lab check issues a completion code, and update the Files table with `labcheck.js`.

## What to add to the lab: a setup event (and a course switch)

The lab has a model (`chem.js`, event `zsa-re:request-model`), so no model extraction is needed. `labcheck.js` requests the model the way `lab.js` does. What is missing is a way to set up a question from outside, because the mode, reaction and heating settings are closure variables in `lab.js`. Also, the course (`chem` or AP) is a `const` read from `?course=chem`, and the Lab check link has no course. The check uses Chemistry numbers, so the setup must set the course. Two edits to `lab.js`:

1. Line 8: change `const params=new URLSearchParams(location.search),chem=...,course=...,unit=...;` to `const params=new URLSearchParams(location.search);let chem=params.get('course')==='chem',course=chem?'chem':'ap',unit=chem?'kJ':'kJ/molrxn';` (only `const` to `let`, split the first declaration).
2. Before the final `sync();render();`, add (tested on a scratch copy, see Verified readouts):

```js
root.addEventListener('zsa-re:request-lab',e=>e.detail.receive({
  // s = {course: 'chem' | 'ap', mode: 'heating' | 'bonds' | 'process' | 'hess', rxn: reaction or set id (bonds, process, hess),
  //      mass, start, end, startPhase, endPhase (heating)}. Hess multipliers and reversals, bond tallies and the process
  //      prediction are left at their fresh-load values: the student sets them.
  setup(s){
    stop();progress=0;
    chem=s.course==='chem';course=chem?'chem':'ap';unit=chem?'kJ':'kJ/molrxn';
    $('tab-diagram').textContent=t(chem?'PE diagram':'Energy diagram');$('tab-formation').textContent=t(chem?'Heat of Formation Calculations':'Enthalpy of Formation');
    mode=s.mode;
    if(s.mode==='heating'){mass=s.mass;start=s.start;end=s.end;startPhase=s.startPhase||'auto';endPhase=s.endPhase||'auto';}
    else if(s.rxn&&own(collections[s.mode],s.rxn))chosen[s.mode]=s.rxn;
    sync();render();
  },
  format:{sig:n=>f(n),kJ:n=>f(n/1000),one:exact}   // sig: the lab's 3 significant figures; kJ: Total q (given in J); one: one decimal, as Hess and process lines print
}));
```

The student then reads the numbers that the setup leaves on screen or that their own presses create (see each question). The "Set up the lab" button only sets the lab, it never presses Check, Start process or the Hess controls. `render()` clears old tallies, predictions and multipliers, so every setup starts fresh.

Because the setup does `sync()`, the URL gets `?mode=...`, which is fine; keep `check=1` in the URL (`sync()` copies the current URL, so it survives).

Formatters (use them for every choice so a choice always matches the screen):
- `sig(n)`: `M.format(n)`, 3 significant figures, unicode minus, `× 10⁴` notation for large numbers.
- `kJ(q)`: `M.format(q/1000)`, what "Total q" prints.
- `one(n)`: `n.toFixed(1)` with a unicode minus, what the Hess "Σ ΔH" line and the process line print.

## How the question numbers are filled in

Every number comes from the lab's model `M` (`chem.js`) through `format`. Nothing is typed in. Slots:

| Q | Slot | Value |
|---|---|---|
| 1 | right | `kJ(M.heating(15,-10,40,'auto','auto','chem').total)` = 7.83 |
| 1 | noMelt | `kJ(rows A q + rows C q)` = 2.82 (rows from the same `M.heating` call, segments A and C) |
| 1 | meltOnly | `kJ(row B q)` = 5.01 |
| 1 | noIce | `kJ(row B q + row C q)` = 7.52 |
| 1 | segB, segA, segC | `sig(row.q)` in J: 5.01 × 10³, 309, 2.51 × 10³ |
| 2 | right | `kJ(M.heating(25,100,100,'steam','liquid','chem').total)` = −56.5 |
| 2 | plus | `kJ(-total)` = 56.5 |
| 2 | zero | `sig(0)` = 0 |
| 2 | unit | `sig(total)` = −5.65 × 10⁴ (the J number, labeled kJ) |
| 2 | fus | `kJ(-(25 × M.constants('chem').fus))` = −8.35 (used in explanation only, not a choice) |
| 3 | right | `one(M.combine(steps, [-1, 2, 1]).dh)` with `steps = M.HESS.c2h2.steps` = 226.8 |
| 3 | noRev | `one(combine(steps, [1, 2, 1]).dh)` = −2372.4 |
| 3 | noMult | `one(combine(steps, [-1, 1, 1]).dh)` = 620.3 |
| 3 | wrongRev | `one(combine(steps, [1, -2, -1]).dh)` = −226.8 |
| 4 | right | `sig(M.bonds('ch4').dh)` = −808 (the lab prints `M.format(sum broken - sum formed)`) |
| 4 | swap | `sig(-M.bonds('ch4').dh)` = 808 |
| 4 | measured | `sig(M.BOND_RXNS.ch4.measured)` = −802 |
| 4 | noWater | `sig(M.bondSum({'C-H':4,'O=O':2}) - M.bondSum({'C=O':2,'O-H':2}))` = 118 |
| 4 | broken, formed | `sig(M.bonds('ch4').broken)` 2642, `sig(M.bonds('ch4').formed)` 3450 (explanation) |
| 5 | start, end | `one(M.PROCESSES.koh.start)` 21.0, `one(M.PROCESSES.koh.end)` 34.5 |
| 5 | dT | `one(end - start)` = 13.5 |

For question 4 the lab itself prints the line "ΔH = 2.642 × 10³ − 3.450 × 10³ = −808 kJ" after Check, so `right` is the last number on that line.

## The five questions

All wrong choices are different common mistakes, and all four options show different values in every question (checked: Q1 7.83, 2.82, 5.01, 7.52; Q2 −56.5, 56.5, 0, −5.65 × 10⁴; Q3 226.8, −2372.4, 620.3, −226.8; Q4 −808, 808, −802, 118; Q5 four different texts). Use the lab's own minus (U+2212) in the labels, as it appears on the screen.

### 1. `warm`: Ice warmed through melting
- setup: `{course: "chem", mode: "heating", mass: 15, start: -10, end: 40}`
- question: "The Heating curve is set to 15.0 g of water, from ice at −10 °C to liquid at 40 °C. Read Total q. How much energy does the sample take in?"
- choices:
  - `right` `{right} kJ` correct
  - `noMelt` `{noMelt} kJ`
  - `meltOnly` `{meltOnly} kJ`
  - `noIce` `{noIce} kJ`
- feedback:
  - noMelt: "That leaves out the melting step. Melting is a phase change with q = mΔH, and it is the largest part. Check segment B in the Segment calculator."
  - meltOnly: "That is only the melting step. The ice must also warm up before it melts, and the liquid must warm up after. Add every segment."
  - noIce: "That skips segment A, where the ice warms from −10 °C to 0 °C. Add all three segments in the Segment calculator."
- explanation: "The path has three parts: warm the ice, melt it, warm the liquid. Segment A is {segA} J, segment B is {segB} J and segment C is {segC} J. They add to {right} kJ."

### 2. `steam`: Steam condensing
- setup: `{course: "chem", mode: "heating", mass: 25, start: 100, end: 100, startPhase: "steam", endPhase: "liquid"}`
- question: "The Heating curve is set to 25.0 g of steam at 100 °C turning into liquid water at 100 °C. Read Total q. What does it show?"
- choices:
  - `right` `{right} kJ` correct
  - `plus` `{plus} kJ`
  - `zero` `{zero} kJ`
  - `unit` `{unit} kJ`
- feedback:
  - plus: "Condensing releases energy, so q is negative. Cooling and condensing give negative q."
  - zero: "The temperature does not change, but energy still leaves during a phase change. Use q = mΔH, not q = mcΔT."
  - unit: "That is the value in joules. Total q is in kJ, and the Data table has both columns. Check the unit."
- explanation: "Condensing is a phase change, so q = −mΔH(vap) = −(25.0 g)(2260 J/g) = −56 500 J, which is {right} kJ. Using the heat of fusion by mistake would give {fus} kJ."

### 3. `hess`: Hess's law, reverse and multiply
- setup: `{course: "chem", mode: "hess", rxn: "c2h2"}` (target 2 C(s) + H₂(g) → C₂H₂(g); three steps, Multiplier 1, Reverse off)
- question: "The target is 2 C(s) + H₂(g) → C₂H₂(g). Use Reverse and Multiplier on the steps until the Net reaction matches the target. What does Σ ΔH show?"
- how to reach it: tick Reverse on step 1 and type 2 in the Multiplier of step 2 (press Tab so the value is accepted), leave step 3 alone.
- choices:
  - `right` `{right} kJ` correct
  - `noRev` `{noRev} kJ`
  - `noMult` `{noMult} kJ`
  - `wrongRev` `{wrongRev} kJ`
- feedback:
  - noRev: "Step 1 burns C₂H₂, but the target makes C₂H₂. Reverse step 1, and its ΔH changes sign."
  - noMult: "The net reaction only matches the target when step 2 is multiplied by 2. Multiply the equation and its ΔH."
  - wrongRev: "You reversed the wrong steps. Only the step that has C₂H₂ on the wrong side needs reversing. Check that the Net reaction matches the target."
- explanation: "Step 1 is reversed: +1299.6 kJ. Step 2 is multiplied by 2: 2 × (−393.5) = −787.0 kJ. Step 3 stays: −285.8 kJ. The sum is {right} kJ."

### 4. `bonds`: Bond enthalpies
- setup: `{course: "chem", mode: "bonds", rxn: "ch4"}` (CH₄ + 2O₂ → CO₂ + 2H₂O(g), all tallies 0)
- question: "Count the bonds broken and formed for CH₄ + 2O₂ → CO₂ + 2H₂O. Enter your tallies and press Check. What does the ΔH line show?"
- how to reach it: broken C-H 4, O=O 2; formed C=O 2, O-H 4; press Check.
- choices:
  - `right` `{right} kJ` correct
  - `swap` `{swap} kJ`
  - `measured` `{measured} kJ`
  - `noWater` `{noWater} kJ`
- feedback:
  - swap: "ΔH is bonds broken minus bonds formed. Check that the broken bonds are in the Bonds broken column."
  - measured: "That is the Measured ΔH printed on the page. Read the ΔH line from your own tallies after Check."
  - noWater: "Each H₂O has 2 O-H bonds, and there are 2 H₂O. Multiply by the coefficient to get 4 O-H bonds formed."
- explanation: "Broken: 4 C-H + 2 O=O = {broken} kJ. Formed: 2 C=O + 4 O-H = {formed} kJ. ΔH = {broken} − {formed} = {right} kJ. It differs a little from the Measured {measured} kJ because bond enthalpies are averages."

### 5. `koh`: Dissolving KOH
- setup: `{course: "chem", mode: "process", rxn: "koh"}`
- question: "Choose a prediction and press Start process. The water goes from {start} °C to {end} °C. What is the temperature change, and what does it say about the KOH system?"
- choices (labels are text, so the four values differ):
  - `right` "Up {dT} °C. The system released energy." correct
  - `sysSurr` "Up {dT} °C. The system absorbed energy."
  - `backwards` "Down {dT} °C. The system absorbed energy."
  - `final` "Up {end} °C. The system released energy."
- feedback:
  - sysSurr: "The thermometer measures the surroundings, not the system. If the surroundings warm, the system gave energy away."
  - backwards: "ΔT is final minus initial, and the water ended warmer, so the change is positive."
  - final: "{end} °C is the final temperature, not the change. ΔT is final minus initial."
- explanation: "ΔT = {end} − {start} = {dT} °C. The water is the surroundings and it warmed, so energy flowed from the KOH system to the water. The process is exothermic."

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `reaction-energy-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does. Note that `data.js` here is the lab's existing Spanish dictionary file (`zsa-i18n`); keep the existing dictionary object and add the check data next to it the way the other labs with a dictionary do (see the Calorimetry or Gas Laws data.js).
- Spanish waits for the proofread. Leave the strings English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check" as in the other labs.

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices).
2. The right choice equals the formatted model result for each setup, and (Playwright) after setup through `zsa-re:request-lab` the right choice matches: Q1 `#heat-total` ("Total q = 7.83 kJ"), Q2 `#heat-total`, Q3 `#panel-hess .zsa-re-result` after Reverse step 1 and Multiplier 2 on step 2, Q4 the `ΔH = ... = −808 kJ` line in `#panel-bonds .zsa-re-result` after the tallies and `#check-bonds`, Q5 the Data table row "21.0 °C → 34.5 °C" after selecting a prediction, `#start-process` and waiting 1 s.
3. Registry: id 28 `RLC` decodes, the highest-id assertion is updated, `maxItems` is 5.
4. No element id clash: `document.querySelectorAll('#zsa-re-check').length === 1`, and `#check-bonds`, `#check-hess`, `#check-heating` still work.
5. The setup event: `setup({course:'chem', mode:'heating', ...})` re-renders in Chemistry units (Segment calculator shows `15.0 g × 334 J/g`), and a page loaded without `?course=chem` still shows kJ after setup.
6. Existing tests: the `const` to `let` change must leave all 15 README presets unchanged (no `setup` call, same behavior).

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on a scratch copy of the repo with the setup event above added: `file://.../reaction-energy-lab/index.html?check=1`, call `zsa-re:request-lab` setup, drive the controls, read the page.

| Q | Setup and presses | Lab shows | Other choices |
|---|---|---|---|
| 1 | heating 15 g, −10 to 40 °C | `#heat-total` "Total q = **7.83** kJ"; Segment calculator A 309 J, B 5.01 × 10³ J, C 2.51 × 10³ J | 2.82, 5.01, 7.52 (from the model) |
| 2 | heating 25 g, steam to liquid at 100 °C | `#heat-total` "Total q = **−56.5** kJ"; Data table D `q = mΔH` −5.65 × 10⁴ J, −56.5 kJ; phase selects read steam and liquid | 56.5, 0, −5.65 × 10⁴ |
| 3 | hess c2h2; `#reverse-0` checked, `#scale-1` = 2 (change event) | "Σ ΔH = **226.8** kJ"; Net reaction `2 C(s) + H₂(g) → C₂H₂(g)` equals the target | −2372.4 (no reverse), 620.3 (no multiply), −226.8 |
| 4 | bonds ch4; broken 4, 2, 0, 0; formed 0, 0, 2, 4; `#check-bonds` | "ΔH = 2.642 × 10³ − 3.450 × 10³ = **−808** kJ"; Measured ΔH = −802 kJ shown on the page | 808 (columns swapped, verified), 118 (2 O-H, verified), −802 |
| 5 | process koh; prediction exothermic; `#start-process`; wait 1.2 s | Data table "21.0 °C → 34.5 °C", "exothermic", "The surroundings warm." | none (text choices) |

Bond tallies were entered as in the question (inputs `#broken-0..3`, `#formed-0..3`). The bond row order is C-H, O=O, C=O, O-H. No page errors in the console.

The lab's lesson links open it in the AP course by default (no `course=chem`); the setup forces Chemistry so these numbers (and the kJ unit) are the same on every lesson page.

## Media (WordPress site 257744344)

Uploaded: `chem-reaction-energy-lab-check.pdf` (media 14819, https://zornscience.org/wp-content/uploads/2026/11/chem-reaction-energy-lab-check.pdf) and `chem-reaction-energy-lab-check-key.pdf` (media 14821, https://zornscience.org/wp-content/uploads/2026/11/chem-reaction-energy-lab-check-key.pdf). The lab's existing worksheet is `chem-reaction-energy-virtual-lab.pdf` (media 8477, key 8478).
