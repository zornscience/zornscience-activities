# Free Energy Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `free-energy-lab/` (Free Energy Lab, version 1.0.4, activity slug `free-energy-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-free-energy-lab-check.pdf` (student sheet) and `chem-free-energy-lab-check-key.pdf` (answer key). The course on the PDFs is Chemistry (the lab's worksheet is `chem-free-energy-virtual-lab.pdf`, media 8440 and key 8441).

## Registry entry (shared/zsa-codes.js)

- Prefix `FRLC`. The rule is the initial plus LC, which would be `FLC`, but that is the Faraday lab, so it takes the first two letters plus LC. `FRLC` is not taken and is not the start of another prefix.
- Registry id **31** (the last free id).
- Entry, same shape as id 12:

```js
{id:31, prefix:"FRLC", slug:"free-energy-lab", setting:"Lab check", name:"Free Energy Lab", maxItems:5,
  stats:[["entropy", "Entropy change from tables"], ["gibbs", "Gibbs energy at 298 K"], ["cross", "The crossover temperature"],
    ["catalyst", "A catalyst and the barrier"], ["k", "From Gibbs energy to K"]],
  totals:[["entropy"], ["gibbs"], ["cross"], ["catalyst"], ["k"]], items:[0, 1, 2, 3, 4]}
```

- The test that asserts the highest registry id must be updated to 31 (see the earlier briefs).
- Bump `zsa-version` to 1.1.0 in `free-energy-lab/index.html`. Add the shared Lab check files and `labcheck.js` the way `collision-carts/index.html` does (`../shared/zsa-labcheck.css`, `../shared/zsa-codes.js`, `../shared/zsa-labcheck.js`, `labcheck.js`; `data.js` is already loaded). The lab's CSP already allows local scripts.
- Mount: add `<div id="zsa-fe-check"></div>` as a static element, after the Data table `<section class="zsa-card">` and before the `<!-- zsa-about -->` block. It must not go inside any `#panel-*` section, because the panels are cleared and rebuilt on every mode change.
- **Id clash notes.** Nothing uses `zsa-fe-check`. The lab does use the class names `zsa-fe`, `zsa-fe-header`, `zsa-fe-tabs`, `zsa-fe-layout`, `zsa-fe-readout`, `zsa-fe-feedback` and so on (classes only, no ids), so do not give the runner's own markup a `zsa-fe-` class. Existing ids to leave alone: `check-entropy`, `check-products`, `check-reactants`, `check-unknown`, `check-dg`, `check-formation`, `check-control`, `check-k`, `check-chain`, `show-dg`, `show-k`, `show-chain`, `entropy-feedback`, `dg-feedback`, `k-feedback`, `control-feedback`, `feedback-products`, `feedback-reactants`, `dg-answer`, `k-answer`, `live`, `back`, `data-table`.
- `README.md` and `TESTING.md`: mention the Lab check and the `?check=1` parameter. The README now says "any completion code" is unchanged; reword it so the Lab check issues the completion code.

## The model is already separate; only a setup event is missing

`chem.js` is the model (`FreeEnergyModel`-style API through `module.exports` and the `zsa-fe:request-model` event). It has `entropy(id, chem)`, `thermo(id, chem)`, `gibbs`, `gibbsDisplay`, `crossover`, `toK`, `control(id, catalyst, heated, light)` and `format(value, digits)`. `labcheck.js` requests it the way `lab.js` does. No model extraction is needed.

What is missing is a way to set up a question from outside, because every setting lives in controls built inside `lab.js`. All five questions use numbers that are the same in the AP and the Chemistry versions (`?course=chem` only changes labels such as ΔG and ΔG°, and a few ΔS and ΔH values for Haber and CaCO<sub>3</sub>, which these questions avoid on purpose), so the check works with or without `course=chem`. Write the questions with plain "ΔG", "ΔS" and "ΔH".

Add this to `lab.js`, after `activate` is defined and before the end of the closure:

```js
root.addEventListener('zsa-fe:request-lab',e=>e.detail.receive({
  // s = {mode: "ds" | "dg" | "control" | "k", rxn: the Reaction/Case select value, dh, ds (dg mode, optional text),
  //      catalyst: true (control mode)}
  setup(s){
    activate(s.mode);   // rebuilds the panel fresh
    const pick=(id,v)=>{$(id).value=v;$(id).onchange();};
    const sel={ds:'ds-rxn',dg:'dg-rxn',control:'control-case',k:'k-case'}[s.mode];
    if(s.rxn)pick(sel,s.rxn);
    if(s.mode==='dg'){if(s.dh!==undefined)pick('dh',s.dh);if(s.ds!==undefined)pick('ds',s.ds);}
    if(s.mode==='control'&&s.catalyst&&$('catalyst').getAttribute('aria-pressed')!=='true')$('catalyst').click();
    // temperature stays at 298 K (the default) in every question
  },
  format:{f:(n,d)=>f(n,d), given:n=>given(n), gibbs:(dh,ds,t)=>M.gibbsDisplay(dh,ds,t),
          cross:v=>v>=1000&&v<10000?f(v/1000)+" × 10³":f(v)}   // the same expressions the readouts use
}));
```

Notes:
- `activate(mode)` re-renders the mode from its defaults. The select `onchange` handlers reset the answer gates, so a question always starts with every worked answer hidden.
- `f(n, d)` is the lab's trimmed formatter (`M.format` with trailing zeros removed), `given(n)` is `f(n, M.sigDigits(n))`, and `cross` is the exact text of the "Crossover temperature" line. Use these for every choice so a choice matches the screen. The lab prints a true minus sign (U+2212) in these readouts, so the labels use it too.
- The student does not press "Set up the lab" and then anything else to start a run: there is no run. They follow the steps in each question.
- Gated readouts. The lab hides worked values until the matching Check passes, or until Show solution is pressed after one wrong Check. Questions 2, 3 and 5 therefore tell the student to type any number (for example 0) in the answer box, press Check, and press Show solution, or to work out the answer and type it. Both paths show the same readout. Question 1 needs the two sum Checks to pass.

## How the question numbers are filled in

Every number comes from `chem.js` through `format`. Nothing is typed in. Slots (all computed in `labcheck.js` from the setup):

| Q | model call | slots |
|---|---|---|
| 1 | `M.entropy("ch4", false)` gives `{reactants, products, ds}`; `S` table `M.entropyTable(false)` | `right` = f(ds, 4), `flip` = f(-ds, 4), `noProd` = f(products without the 2 on H₂O(l) minus reactants, 4), `noO2` = f(products minus reactants without the 2 on O₂, 4), `p` = f(products, 4), `r` = f(reactants, 4) |
| 2 | `M.thermo("n2o4", false)` with T = 298 | `right` = format.gibbs(dh, ds, 298), `noConv` = f(dh - T * ds), `celsius` = format.gibbs(dh, ds, 25), `flip` = f(dh + T * ds / 1000), `tds` = f(T * ds / 1000, 3) |
| 3 | `M.crossover(178, 161)` | `right` = format.cross(c), `noConv` = f(dh / ds), `inverted` = f(ds / dh * 1000), `double` = f(dh * 1000 / (ds / 1000)) |
| 4 | `M.control("hcl", true, false, false)` and `(…, false, …)` | `right` = given(ea with catalyst), `same` = given(ea without), `dg` = given(abs(dg)), `cut` = given(ea without minus ea with) |
| 5 | `M.toK(dg, 298)` with dg = `M.KCASES.n2o4.dg` | `right` = f(k, 2), `noConv` = f(toK(dg / 1000, 298).k, 2), `flip` = f(toK(-dg, 298).k, 2), `celsius` = f(toK(dg, 25).k, 2) |

## The five questions

All wrong choices are different common mistakes, and all four options show different values in every question (checked, see the table at the end). Use the lab's own minus (U+2212) in labels.

### 1. `entropy`: Entropy change from tables
- setup: `{mode: "ds", rxn: "ch4"}` (CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l))
- question: "Use the S° table. In ΣnS°(products) enter 213.7 + 2 × 69.9 and press Check products. In ΣnS°(reactants) enter 186.3 + 2 × 205.0 and press Check reactants. What ΔS does the lab then show, in J/K?"
- choices:
  - `right` `{right}` correct
  - `flip` `{flip}` (reactants minus products)
  - `noProd` `{noProd}` (forgot the 2 in front of H₂O(l))
  - `noO2` `{noO2}` (forgot the 2 in front of O₂)
- feedback:
  - flip: "ΔS is products minus reactants. Check the sign. Four moles of gas become one mole of gas and two moles of liquid, so the matter is less dispersed."
  - noProd: "Multiply each S° by its coefficient. There are 2 mol of H₂O(l), so use 2 × 69.9 in the products sum."
  - noO2: "Multiply each S° by its coefficient. There are 2 mol of O₂(g), so use 2 × 205.0 in the reactants sum."
- explanation: "ΣnS°(products) = {p} and ΣnS°(reactants) = {r}. ΔS = {p} - {r} = {right} J/K. It is negative because 3 mol of gas become 1 mol of gas, so the matter is less dispersed."

### 2. `gibbs`: Gibbs energy at 298 K
- setup: `{mode: "dg", rxn: "n2o4"}` (2NO₂(g) → N₂O₄(g), ΔH = −57.2 kJ, ΔS = −175.9 J/K, T = 298 K)
- question: "Type 0 in Your Gibbs free energy, press Check, then press Show solution. What ΔG does the lab show, in kJ?"
- choices:
  - `right` `{right}` correct
  - `noConv` `{noConv}` (did not convert J to kJ)
  - `celsius` `{celsius}` (used 25 for T instead of 298 K)
  - `flip` `{flip}` (added TΔS instead of subtracting it)
- feedback:
  - noConv: "ΔS is in J/K but ΔH is in kJ. Divide ΔS by 1000 before you multiply by T."
  - celsius: "Use kelvin in ΔG = ΔH − TΔS. The lab reminds you that 25 °C = 298 K."
  - flip: "The equation is ΔG = ΔH − TΔS. ΔS is negative, so −TΔS is positive. Check the signs."
- explanation: "ΔG = ΔH − TΔS = −57.2 − (298 K)(−0.1759 kJ/K) = −57.2 + {tds} = {right} kJ. ΔG is negative, so the reaction is spontaneous at 298 K, but only just."

### 3. `cross`: The crossover temperature
- setup: `{mode: "dg", rxn: "caco3", dh: "178", ds: "161"}`. The reaction select is only a starting point; the two typed values are the same in AP and Chemistry.
- question: "Type 0 in Your Gibbs free energy, press Check, then press Show solution. What crossover temperature does the lab show, in K?"
- choices:
  - `right` `{right} K` correct
  - `noConv` `{noConv} K` (ΔH ÷ ΔS without converting J to kJ)
  - `inverted` `{inverted} K` (ΔS ÷ ΔH, then × 1000)
  - `double` `{double} K` (converted both numbers, ΔH to J and ΔS to kJ)
- feedback:
  - noConv: "ΔH is in kJ but ΔS is in J/K. Divide ΔS by 1000 first, so T = ΔH ÷ (ΔS ÷ 1000)."
  - inverted: "Set ΔG = 0 in ΔG = ΔH − TΔS. That gives T = ΔH ÷ ΔS, with ΔH on top."
  - double: "Convert only one number. ΔH is already in kJ, so only ΔS needs the ÷ 1000."
- explanation: "At the crossover ΔG = 0, so T = ΔH ÷ ΔS = 178 kJ ÷ 0.161 kJ/K = {right} K. Above this temperature the entropy term wins, ΔG is negative and the reaction is spontaneous. Below it, ΔG is positive."

### 4. `catalyst`: A catalyst and the barrier
- setup: `{mode: "control", rxn: "hcl", catalyst: false}` (H₂(g) + Cl₂(g) → 2HCl(g), in the dark; the student presses Add a catalyst)
- question: "Press Add a catalyst. What Ea does the readout under the energy diagram show, in kJ/mol?"
- choices:
  - `right` `{right}` correct
  - `same` `{same}` (thinks a catalyst changes nothing)
  - `dg` `{dg}` (reads ΔG instead of Ea)
  - `cut` `{cut}` (the amount Ea drops, not the new Ea)
- feedback:
  - same: "A catalyst lowers Ea. Press Add a catalyst, then read the Ea in the readout again."
  - dg: "That is the size of ΔG, which does not change with a catalyst. Ea is the second number in the readout."
  - cut: "That is how much Ea dropped. The question asks for the new Ea shown in the readout."
- explanation: "The catalyst lowers Ea from {same} to {right} kJ/mol, so the reaction is faster. ΔG stays {dgSigned} kJ. A catalyst does not change ΔG or the spontaneity."
- slot `dgSigned` = given(dg).

### 5. `k`: From Gibbs energy to K
- setup: `{mode: "k", rxn: "n2o4"}` (ΔG = −4.8 kJ, T = 298 K, ΔG to K)
- question: "Type 0 in Your result, press Check, then press Show solution. What K does the lab show?"
- choices:
  - `right` `{right}` correct
  - `noConv` `{noConv}` (did not convert kJ to J)
  - `flip` `{flip}` (used +ΔG in the exponent)
  - `celsius` `{celsius}` (used 25 for T instead of 298 K)
- feedback:
  - noConv: "R is 8.314 J/(mol·K), so ΔG must be in joules. Multiply kJ by 1000."
  - flip: "K = exp(−ΔG ÷ RT). ΔG is negative, so the exponent is positive and K is greater than 1."
  - celsius: "Use kelvin in RT. The temperature box shows 298 K."
- explanation: "K = exp[−ΔG ÷ (RT)] = exp[−(−4800 J) ÷ (8.314 × 298)] = exp(1.9374) = {right}. ΔG is negative, so K is greater than 1 and the products are favored."

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `free-energy-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data` the way Collision Carts does. `data.js` already holds the `es` table for `I.configure`; add the `check` data after it.
- Spanish waits for the proofread. Leave the strings English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check" as in the other labs.

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices).
2. The right choice equals the model result: Q1 `M.entropy("ch4").ds`, Q2 `M.gibbsDisplay(-57.2, -175.9, 298)`, Q3 `M.crossover(178, 161)` through `format.cross`, Q4 `M.control("hcl", true).ea`, Q5 `M.toK(M.KCASES.n2o4.dg, 298).k`. Run with `course=chem` and without.
3. Playwright, using `zsa-fe:request-lab`: Q1 type the two sums and press the two Check buttons, the text `ΔS° = … = {right} J/(molrxn·K)` (or `ΔS = … J/K` with `course=chem`) is on the page; Q2 and Q3 type 0 in `#dg-answer`, press `#check-dg` then `#show-dg`, and the readout `ΔG = −57.2 − (298 K)(−0.1759) = −4.8 kJ` and the `Crossover temperature` line contain the right choices; Q4 press `#catalyst` and the readout `Ea = 54 kJ/mol` appears; Q5 type 0 in `#k-answer`, press `#check-k`, `#show-k`, and the Data table K row reads `6.9`.
4. Registry: id 31 `FRLC` decodes, the highest-id assertion is updated, `maxItems` is 5.
5. No element id clash: `document.querySelectorAll('#zsa-fe-check').length === 1`, and the mount is outside every `#panel-*`.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on the `file://` lab, AP default and `?course=chem`, driving the real controls.

| Q | Steps | Readout |
|---|---|---|
| 1 | ΔS° Calculator, CH₄ reaction, enter both sums, Check both | `ΔS° = 353.5 − 596.3 = −242.8 J/(molrxn·K)`; with `course=chem` `ΔS = 353.5 − 596.3 = −242.8 J/K` |
| 2 | ΔG and Temperature, 2NO₂ → N₂O₄, T 298, Check 0, Show solution | `ΔG = −57.2 − (298 K)(−0.1759) = −4.8 kJ` |
| 3 | same panel, ΔH 178, ΔS 161, Check 0, Show solution | `T = ΔH ÷ (ΔS ÷ 1000) = 1.11 × 10³ K` |
| 4 | Kinetic vs Thermodynamic Control, H₂ + Cl₂, Add a catalyst | before: `ΔG = −190.6 kJ; Ea = 180 kJ/mol`; after: `ΔG = −190.6 kJ; Ea = 54 kJ/mol` |
| 5 | ΔG° and K, N₂O₄ case, ΔG to K, 298 K, Check 0, Show solution | `K = exp[−(−4800) ÷ (8.314 × 298)] = exp(1.9374) = 6.9` and Data table K 6.9 |

Choice values (all distinct): Q1 −242.8, 242.8, −312.7, −37.8. Q2 −4.8, 5.24 × 10⁴, −52.8, −110. Q3 1.11 × 10³, 1.11, 904, 1.11 × 10⁶. Q4 54, 180, 190.6, 126. Q5 6.9, 1, 0.14, 1.1 × 10¹⁰.

## Media (WordPress site 257744344)

`chem-free-energy-lab-check.pdf` and `chem-free-energy-lab-check-key.pdf`. The lab's existing worksheet is `chem-free-energy-virtual-lab.pdf` (media 8440, key 8441), so these names match it.
