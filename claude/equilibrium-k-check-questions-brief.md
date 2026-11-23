# Equilibrium Constant Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `equilibrium-k-lab/` (Equilibrium Constant Lab, version 1.0.4, activity slug `equilibrium-k-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code. Follow the Calorimetry brief for the overall shape.

Companion files in this folder: `chem-equilibrium-k-lab-check.pdf` (student sheet) and `chem-equilibrium-k-lab-check-key.pdf` (answer key). Course on the PDFs is Chemistry, so the prefix is `chem-`. The lab's worksheet is `chem-equilibrium-k-virtual-lab.pdf` (media 8296, key 8297), so these names match it. The Lab check uses the Chemistry (course=chem) wording: plain K, not Kc.

## Registry entry (shared/zsa-codes.js)

- Prefix `EKLC`. `ELC` is Equipotential and `EQLC` is the Equilibrium Sandbox, so Equilibrium K takes EK plus LC. Check that no other prefix starts with `EKLC` or is a prefix of it.
- Registry id **30**.
- Entry, same shape as id 12:

```js
{id:30, prefix:"EKLC", slug:"equilibrium-k-lab", setting:"Lab check", name:"Equilibrium Constant", maxItems:5,
  stats:[["quotient", "The reaction quotient Q"], ["stress", "Adding a product"], ["equilibrium", "Equilibrium concentrations"],
    ["heat", "Temperature changes K"], ["small", "A very small K"]],
  totals:[["quotient"], ["stress"], ["equilibrium"], ["heat"], ["small"]], items:[0, 1, 2, 3, 4]}
```

- Bump `zsa-version` to 1.1.0 in `equilibrium-k-lab/index.html` (and the `?v=` strings), add `../shared/zsa-labcheck.css`, `../shared/zsa-codes.js`, `../shared/zsa-labcheck.js` and `labcheck.js` the way `collision-carts/index.html` does, and add `<div class="labcheck-mount" id="zsa-ek-check"></div>` as the mount (after the Data table card, before the About section).
- The CSP is `default-src 'self'`, so the shared scripts load fine from the repo. `data.js` must also answer `zsa:request-data` with `{check}` (Collision Carts does it at the end of its `data.js`).
- **Id clash to avoid:** the lab builds its controls in JS and already has `#check-row`, `#check-answer`, `#check-target`, `#check-x`, `#check-conversion`, and a CSS class `zsa-ek-check` (checkbox label). The new mount `#zsa-ek-check` is not used by any id (the class has no `#`). Do not reuse any of those ids. Also avoid ids `run`, `reset`, `reveal`, `readout`, `graph`, `reaction`, `prediction`, `view`, `k-value` and `initial-N`, which the lab uses.
- `README.md`: add a Lab check section and the completion-code rule (only the Lab check issues a code).
- `labcheck.js` runs under `root = [data-zsa-activity="equilibrium-k-lab"]`. The model already exists as `chem.js` and is requested with the `zsa-ek:request-model` event, so no model extraction is needed. The Lab check needs only the new setup event.

## What to add to lab.js: one setup event

`chem`, `mode`, `rxn`, `r`, `k`, `c`, `view`, `temp`, `rows`, `revealed`, `prediction`, `sync()` and `render()` are all inside the lab closure. Add this before the final `sync();render();` (a patched copy of the lab was used to verify everything below):

```js
root.addEventListener('zsa-ek:request-lab',function(e){e.detail.receive({
  // s = {course:"chem", mode:"explore"|"qk", rxn:"n2o4"|"pcl5"|"hi"|"ab"|..., k (optional number), c (optional initial values in species order), view:"curves"|"k"}
  setup:function(s){stop();chem=s.course==='chem';mode=modes.includes(s.mode)?s.mode:'explore';rxn=Object.hasOwn(M.REACTIONS,s.rxn)?s.rxn:'hi';r=M.REACTIONS[rxn];k=Number.isFinite(s.k)?s.k:r.k;c=(s.c||r.initial).slice();view=s.view==='k'||s.view==='particles'?s.view:'curves';temp=298.15;revealed=false;prediction='';rows=[];sync();render();},
  format:{n3:function(v){return M.format(v,3);}}   // the readouts print sf(v,3) = M.format(v,3); US decimal point, 10 with a superscript power for tiny values
});});
```

Notes:
- `format.n3` is exactly what the Q/K readout, the Equilibrium line and the Data table call (`sf(v,3)` is `t(M.format(v,3))`, and `t` is the identity for numbers in English). Use it for every choice so a choice always matches the screen. Spanish waits for the proofread (see below).
- "Set up the lab" does not press Run or any stress button. The student does that.
- `sync()` writes the setup to the address bar, as the lab already does for every change.

## How the numbers are filled in

Every number comes from the lab's own `chem.js` through `M` (`M.REACTIONS`, `M.quotient`, `M.solve`, `M.temperature`) and `format.n3`. Nothing is typed in. Slots (`r = M.REACTIONS[id]`, `c = r.initial` unless stated, `f = format.n3`):

| Q | Slot | Value |
|---|---|---|
| 1 `quotient` (n2o4, c = [0.2, 0.05]) | `right` | `f(M.quotient(r, c))` |
| | `noSquare` | `f(c[1] / c[0])` |
| | `flipped` | `f(c[0] / (c[1] * c[1]))` |
| | `coefficient` | `f(2 * c[1] / c[0])` |
| | extra | `k = f(r.k)`, `a = f(c[0])`, `b = f(c[1])` |
| 2 `stress` (pcl5, c = [0.09, 0.02, 0.02]) | `right` | `f(M.quotient(r, [c0, c1, c2 + 0.05]))` |
| | `unchanged` | `f(M.quotient(r, c))` |
| | `reactant` | `f(M.quotient(r, [c0 + 0.05, c1, c2]))` |
| | `both` | `f(M.quotient(r, [c0, c1 + 0.05, c2 + 0.05]))` |
| | extra | `k = f(r.k)` |
| 3 `equilibrium` (hi, c = [0.2, 0.2, 0]); `s = M.solve(r, c, r.k)` | `right` | `f(s.values[2])` |
| | `half` | `f(s.values[2] / 2)` (this is x) |
| | `h2` | `f(s.values[0])` |
| | `initial` | `f(c[0])` |
| | extra | `k = f(r.k)`, `x = f(s.x)` |
| 4 `heat` (n2o4, 298.15 K to 323.15 K) | `right` | `f(M.temperature(r.k, r.dh, 298.15, 323.15))` |
| | `same` | `f(r.k)` |
| | `cool` | `f(M.temperature(r.k, r.dh, 298.15, 273.15))` |
| | `q` | `f(M.quotient(r, r.initial))` |
| 5 `small` (ab, k = 0.01, c = [1, 0]); `s = M.solve(r, [1, 0], 0.01)` | `right` | `f(s.values[1])` |
| | `k` | `f(0.01)` |
| | `a` | `f(s.values[0])` |
| | `zero` | `f(0)` |

## The five questions

All wrong choices are different common mistakes, and all four options show different values in every question (checked below). Use the lab's own formats in the labels.

### 1. `quotient`: The reaction quotient Q
- setup: `{course: "chem", mode: "qk", rxn: "n2o4"}` (N₂O₄ 0.200 M, NO₂ 0.0500 M, K = 0.00460)
- question: "Read the reaction quotient in the readout. What is Q for this mixture?"
- choices (value, label, feedback key):
  - `right` `{right}` correct
  - `noSquare` `{noSquare}`
  - `flipped` `{flipped}`
  - `coefficient` `{coefficient}`
- feedback:
  - noSquare: "That leaves out the exponent. The coefficient 2 on NO₂ makes it [NO₂] squared in Q. Check the K expression shown in the lab."
  - flipped: "That is reactants over products. Q is products over reactants."
  - coefficient: "The coefficient 2 is an exponent, not a multiplier. Write [NO₂] squared, not 2 times [NO₂]."
- explanation: "Q = [NO₂]² / [N₂O₄] = ({b})² / ({a}) = {right}. Q is greater than K = {k}, so the mixture would shift left."

### 2. `stress`: Adding a product
- setup: `{course: "chem", mode: "qk", rxn: "pcl5"}` (PCl₅ 0.0900 M, PCl₃ 0.0200 M, Cl₂ 0.0200 M, already at equilibrium, Q = K = 0.00444)
- question: "Under Stress the mixture, choose Cl₂ in Species and press Add 0.050 M. What does the readout show for Q?"
- choices:
  - `right` `{right}` correct
  - `unchanged` `{unchanged}`
  - `reactant` `{reactant}`
  - `both` `{both}`
- feedback:
  - unchanged: "Q uses the concentrations right now, so adding a substance changes it. K is the number that stays the same."
  - reactant: "That adds the 0.050 M to PCl₅. Check that Cl₂ is chosen in Species before you press Add 0.050 M."
  - both: "Only the species you choose changes. Add the 0.050 M to Cl₂ only."
- explanation: "Adding a product raises the top of Q. Q = (0.0200)(0.0700) / (0.0900) = {right}, which is greater than K = {k}. So the mixture shifts left."

### 3. `equilibrium`: Equilibrium concentrations
- setup: `{course: "chem", mode: "explore", rxn: "hi"}` (H₂ 0.200 M, I₂ 0.200 M, HI 0, K = 49.0)
- question: "Press Run and wait until the Data table reaches time 80. What is [HI] in the last row?"
- choices:
  - `right` `{right} M` correct
  - `half` `{half} M`
  - `h2` `{h2} M`
  - `initial` `{initial} M`
- feedback:
  - half: "That is x, the amount of H₂ that reacted. The coefficient of HI is 2, so [HI] is 2x."
  - h2: "That is [H₂] at equilibrium. Read the HI column of the last row."
  - initial: "That is the starting [H₂]. Read the last row, not the first."
- explanation: "x = {x} M. [H₂] = [I₂] = 0.200 - {x} = {h2} M and [HI] = 2({x}) = {right} M. Check: ({right})² / ({h2})² = {k} = K."

### 4. `heat`: Temperature changes K
- setup: `{course: "chem", mode: "qk", rxn: "n2o4"}` (K = 0.00460 at 298.15 K, Q = 0.0125, ΔH = +57.2 kJ/mol)
- question: "Press Heat +25 K. What is K now?"
- choices:
  - `right` `{right}` correct
  - `same` `{same}`
  - `cool` `{cool}`
  - `q` `{q}`
- feedback:
  - same: "Temperature is the one stress that changes K. Read K in the readout after you press Heat +25 K."
  - cool: "That is the value after cooling. This reaction takes in heat, so heating raises K."
  - q: "That is Q, not K. Q stays the same right after heating. Read the number after K in the readout."
- explanation: "N₂O₄ breaking into NO₂ takes in heat, so heating favors the products and K rises to {right}. Q is still {q}, so Q is now less than K and the mixture shifts right."

### 5. `small`: A very small K
- setup: `{course: "chem", mode: "explore", rxn: "ab", k: 0.01, view: "k"}` (A ⇌ B, K = 0.0100, A 1.00 M, B 0)
- question: "Read the Equilibrium line in the readout. What is [B] at equilibrium?"
- choices:
  - `right` `{right} M` correct
  - `k` `{k} M`
  - `a` `{a} M`
  - `zero` `{zero} M`
- feedback:
  - k: "K is a ratio, not an amount. Read [B] in the Equilibrium line."
  - a: "That is [A]. Read the amount for B."
  - zero: "The lab says it: a small K still gives a nonzero amount of products."
- explanation: "[B] / [A] = {right} / {a} = {k} = K. Almost all of the mixture stays A, but [B] is {right} M, not zero. A small K means few products, not no reaction."

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `equilibrium-k-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does.
- Spanish waits for the proofread. Leave the strings English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys. The unit symbols and formulas are not translated.
- Style: no em dashes, short sentences, "Lab check" as in the other labs. Write the formulas with subscripts as Unicode in the strings (the lab itself does) and use the ordinary minus-free formats above.

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices).
2. The right choice equals the formatted model result for each setup (slot table above).
3. (Playwright) after `zsa-ek:request-lab` setup, the student steps give the right choice: Q1 `#readout` text `Q = {right}; K = ...`; Q2 select `#stress-species` value `2`, click Add 0.050 M, `#readout` shows `Q = {right}`; Q3 press `#run`, wait for the last Data table row to have time 80, the HI cell is `{right}`; Q4 click Heat +25 K, `#readout` shows `K = {right}`; Q5 `#readout` contains `B = {right} M`.
4. Registry: id 30 `EKLC` decodes, `maxItems` is 5, no prefix clash.
5. No element id clash: `document.querySelectorAll('#zsa-ek-check').length === 1`, and `#check-row`, `#check-answer`, `#check-target`, `#check-x` still work (open the ICE tab and the K Rules tab and press them).
6. The setup is idempotent: running Q1 setup after Q3 (rows filled) leaves no old table or Q value.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on the `file://` lab with the setup event above, driving the real controls. Matches `chem.js` in every row.

| Q | Setup and steps | Readout |
|---|---|---|
| 1 | qk, N₂O₄ 0.200, NO₂ 0.0500 | **Q = 0.0125**; K = 0.00460 (wrong: 0.250, 80.0, 0.500) |
| 2 | qk, PCl₅ 0.0900, PCl₃ 0.0200, Cl₂ 0.0200 (Q = K = 0.00444); Species Cl₂, Add 0.050 M | **Q = 0.0156** (wrong: 0.00444, 0.00286, 0.0544); inputs show 0.0900, 0.0200, 0.0700 |
| 3 | explore, H₂ 0.200, I₂ 0.200; Run, wait for time 80 | last row: H₂ 0.0444, I₂ 0.0444, **HI 0.311**, Q 49.0 (wrong: 0.156, 0.0444, 0.200) |
| 4 | qk, N₂O₄ 0.200, NO₂ 0.0500; Heat +25 K | **K = 0.0274**, Q = 0.0125, 323.15 K (wrong: 0.00460, 5.57 × 10⁻⁴, 0.0125) |
| 5 | explore, A ⇌ B, K = 0.0100, K magnitude view | A = 0.990 M; **B = 0.00990 M** (wrong: 0.0100, 0.990, 0) |

Run takes about 3.7 s (81 steps at 45 ms) and is deterministic. With reduced motion it fills at once.

## Media (WordPress site 257744344)

`chem-equilibrium-k-lab-check.pdf` (media 14805) and `chem-equilibrium-k-lab-check-key.pdf` (media 14806), uploaded Nov 21, 2026:
- https://zornscience.org/wp-content/uploads/2026/11/chem-equilibrium-k-lab-check.pdf
- https://zornscience.org/wp-content/uploads/2026/11/chem-equilibrium-k-lab-check-key.pdf

Lesson pages updated with the Lab check paragraph in the lab callout (English): 560, 561, 114, 115, 116, 117, 118, 119, 120, 121, 123, 124, 125. Page 4524 and the Spanish pages are left for the orchestrator.
