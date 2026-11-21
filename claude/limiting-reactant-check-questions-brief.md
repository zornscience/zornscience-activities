# Limiting Reactant Visualizer Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `limiting-reactant/` (Limiting Reactant Visualizer, version 1.1.3, activity slug `limiting-reactant`). Do not confuse it with `stoichiometry-coach`. Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-limiting-reactant-lab-check.pdf` (student sheet) and `chem-limiting-reactant-lab-check-key.pdf` (answer key). Chemistry course, file prefix `chem-`. The lab's worksheet is `chem-limiting-reactant-virtual-lab.pdf` (media 7703, key 7704), so these names match it.

**What the lab shows.** A reaction (`#zsa-lr-rxn`: water, ammonia, hcl, co2) and starting moles of each reactant (`#zsa-lr-a`, `#zsa-lr-b`, whole numbers 0 to 10). A prediction step ("Before you react": which reactant runs out first, and an optional mol of product) that locks when the reaction starts. React all (`#zsa-lr-play`) runs the reaction. When it stops, `#zsa-lr-status` reads, for example, "Stopped. 6 mol H₂O made. H₂ is the limiting reactant; 5 mol O₂ is in excess." and the Before, Change, After table (`#zsa-lr-table`) shows moles, with a "limiting" or "excess" tag on each reactant heading.

**Determinism (nothing random touches a readout).** `Math.random()` in `lab.js` only chooses the drawn position, direction and spin of the molecules and shuffles the order they are drawn in (`place()` and `reset()`); the animation runs on `requestAnimationFrame`. None of that feeds the limiting reactant, moles made, moles left or the table: they all come from `M.plan(rxn, a, b)` in `model.js`, which is pure integer math on the reaction and the two starting amounts. So no seed or quiet flag is needed. The setup event fixes the reaction and the amounts (the only inputs), and the student presses React all and reads the status line and table. Verified on the live lab: every setup run twice in fresh page loads (each after a dirty first React once press), status line and table identical both times (table below). The sheet note tells students the moving molecules are only a picture.

**Respecting the prediction step.** The setup event clears the radio buttons and the amount box and unlocks them, so the student starts every question with the prediction step open. Each question text tells the student to predict first (pick the reactant, optional amount), then press React all. The prediction is optional in the lab and the Lab check answer does not depend on it; the sheet's part a) is the prediction.

## Registry entry (shared/zsa-codes.js)

- Prefix `LLC` (Limiting reactant, initial L plus LC). Confirmed: existing prefixes are ICT, IFB, GAS, PTR, LVB, LVA, GLC, ALC, PLC, HLC, CLC plus the prefixes in the other briefs (FLC, CALC, FLLC, EKLC, ELC, ELLC, EQLC, FRLC, GALC, GRLC, IOLC, KLC, MLC, NLC, PBLC, RLC, BLC, CHLC, and the Beer's law, Equilibrium and Free Energy ones). None is a prefix of `LLC`, `LLC` starts none of them, and a search of the repo and `claude/` finds no `LLC`. Recheck against the other briefs at build time.
- Registry id: to be assigned (none left, awaiting the code-format decision). Use `id: <next id>` as a placeholder below.
- Entry, same shape as id 12:

```js
{id:<next id>, prefix:"LLC", slug:"limiting-reactant", setting:"Lab check", name:"Limiting Reactant Visualizer", maxItems:5,
  stats:[["limiting", "The limiting reactant"], ["excess", "Adding more of the excess reactant"], ["left", "Excess left over"],
    ["exact", "Exactly the right ratio"], ["ratio", "The mole ratio in the equation"]],
  totals:[["limiting"], ["excess"], ["left"], ["exact"], ["ratio"]], items:[0, 1, 2, 3, 4]}
```

- Bump `zsa-version` from 1.1.3 to 1.2.0 (minor) in `limiting-reactant/index.html`, change every `?v=1.1.3` to `?v=1.2.0`, add the Lab check CSS, `../shared/zsa-codes.js`, `../shared/zsa-labcheck.js` and `labcheck.js` the way `collision-carts/index.html` does (`labcheck.js` requests the model with `zsa-lr:request-model`, exactly as `lab.js` does, so `model.js` loads first as now), and add the mount `<div id="zsa-lrc-check"></div>` inside the main content, after the last section and before the About block. Add a changelog line to `README.md`, and say that only the Lab check issues a completion code. Run `node tools/build-seo.js` only if the version needs it. The lab keeps its standard self-only CSP.
- **Id and event clash check (important).** The lab already has **`#zsa-lr-check`**, the "Check my answers" button, and every other lab id starts `zsa-lr-` (`zsa-lr-rxn`, `-a`, `-b`, `-play`, `-once`, `-reset`, `-status`, `-table`, `-questions`, `-feedback`, `-live`, ...). So the suggested short name `lr` does NOT work: `#zsa-lr-check` is taken, and `zsa-lr:` is the lab's event prefix (`zsa-lr:request-model`). Use the short name **`lrc`**: mount **`#zsa-lrc-check`** and event **`zsa-lrc:request-lab`**. A repo search finds no `zsa-lrc` id, class or event. Keep the lab's own `#zsa-lr-check` button and its handler untouched. Also note the lab's own four "Test each idea in the box" questions (`M.QUESTIONS`) stay as they are; they are separate from the Lab check.
- `README.md` mentions no completion code today; add that only the Lab check issues one.

## The model is already separate; only a setup event is missing

`model.js` exposes `plan(rxn, a, b)`, `after(p, done)`, `table(p, done)`, `reaction(id)`, `name(formula)`, `num` and `mol` through the `zsa-lr:request-model` event and `module.exports`. `labcheck.js` can use them directly. What is missing is a way to set up a question from outside (the settings are `settings = {rxn, a, b}` inside the lab closure). Add this to `lab.js`, just before the final `showSetup(); reset(); resize(); nudge();` block (all helpers it calls already exist). Tested on a copy:

```js
root.addEventListener("zsa-lrc:request-lab", function (e) {
  e.detail.receive({
    // s = {rxn: "water" | "ammonia" | "hcl" | "co2", a, b}: the reaction and the starting moles (whole numbers 0 to 10).
    // It always starts over, even when the settings match, clears and unlocks the predictions, and stops any run.
    setup: function (s) {
      window.clearTimeout(settleTimer);
      clearPrediction();
      settings = {rxn: s.rxn, a: s.a, b: s.b};
      showSetup();
      reset();
      nudge();
    },
    // the text as the page prints it: M.mol gives "5 mol" and "0.5 mol"; M.name gives the formula, for example "H₂".
    format: {name: function (f) { return M.name(f); }, mol: function (v) { return M.mol(v); }}
  });
});
```

(`reset()` already unlocks the predictions and redraws; `settleTimer` is the lab's existing announce timer. The "Set up the lab" button does not press React all.) Spanish waits for the proofread: the English labels are used only for the English check.

## How the numbers are filled in

Every number comes from `M.plan` and `M.after` through `format`. Nothing is typed in. With `p = M.plan(M.reaction(rxn), a, b)`: moles of product `p.extent * p.cp`; limiting reactant `p.reactants` index `p.limiting` (0, 1 or "both"); moles left `M.after(p, p.sets).mol[i]`; moles used `start - left`. Let `mol = format.mol`, `nm = format.name`.

| slot | formula | value |
|---|---|---|
| Q1 right | `nm("CO")` | CO |
| Q1 fewer | `nm("O2")` | O₂ |
| Q1 product | `nm("CO2")` | CO₂ |
| Q1 both | text "Both CO and O₂" (the model says "both" when `p.limiting === "both"`; here it is not) | Both |
| Q2 right | `mol(p.extent * p.cp)`, water 6 and 8 | 6 mol |
| Q2 excess | `mol(2 * 8)` (2 mol H₂O per 1 mol O₂ on all the O₂) | 16 mol |
| Q2 o2 | `mol(8)` (the O₂ moles) | 8 mol |
| Q2 sum | `mol(6 + 8)` | 14 mol |
| Q3 right | `mol(after(p, p.sets).mol[0])`, ammonia 4 and 9 | 1 mol |
| Q3 none | `mol(0)` | 0 mol |
| Q3 used | `mol(4 - 1)` (N₂ used, the Change row) | 3 mol |
| Q3 subtract | `mol(9 - 4)` | 5 mol |
| Q4 right | text "No reactant is left over" | none |
| Q4 h2 | `mol(6 - 2) + " H₂ left over"` (1 to 1 ratio mistake: 2 mol used) | 4 mol H₂ |
| Q4 n2 | `mol(2) + " N₂ left over"` (the fewer-moles guess) | 2 mol N₂ |
| Q4 product | `mol(p.extent * p.cp) + " NH₃ left over"` (the product mistaken for a leftover) | 4 mol NH₃ |
| Q5 right | `mol(p.extent * p.cp)`, hcl 3 and 5 | 6 mol |
| Q5 ratio | `mol(3)` (1 to 1, ignoring the coefficient 2 of HCl) | 3 mol |
| Q5 excess | `mol(2 * 5)` | 10 mol |
| Q5 sum | `mol(3 + 5)` | 8 mol |

Explanation slots: Q1 `{need}` = mol(5 * 1 / 2) = 2.5 mol, `{have}` = mol(3), `{left}` = mol(0.5), `{L}` CO; Q2 `{used}` = mol(3), `{left}` = mol(5); Q3 `{used}` 3 mol, `{left}` 1 mol, `{made}` 6 mol; Q4 `{made}` 4 mol; Q5 `{made}` 6 mol.

## The five questions

All wrong choices are different common mistakes, and all four options differ in every question. Every question text ends with the prediction instruction: "Predict first in Before you react, then press React all." (shortened below).

### 1. `limiting`: The limiting reactant
- setup: `{rxn: "co2", a: 5, b: 3}` (2 CO + O₂ → 2 CO₂, 5 mol CO and 3 mol O₂)
- question: "Predict which reactant runs out first, then press React all. Which reactant gets the limiting tag in the table?"
- choices (value, label, feedback key):
  - `right` `{right}` correct (CO)
  - `fewer` `{fewer}` (O₂)
  - `product` `{product}` (CO₂)
  - `both` Both CO and O₂
- feedback:
  - fewer: "O₂ has fewer moles, but that is not the test. The equation uses 2 CO for each O₂. Compare moles with the coefficients, then read the limiting tag in the table."
  - product: "CO₂ is the product. The limiting reactant is one of the starting substances. Read which heading has the limiting tag."
  - both: "Both run out together only when the moles match the equation's ratio. Check which reactant has moles left over in the After row."
- explanation: "5 mol CO needs {need} O₂, and there are {have}. CO runs out first, so CO is the limiting reactant and {left} O₂ is left over. Having fewer moles is not the test; the coefficients are."

### 2. `excess`: Adding more of the excess reactant
- setup: `{rxn: "water", a: 6, b: 8}` (2 H₂ + O₂ → 2 H₂O; the default box has 5 mol O₂, here it is raised to 8)
- question: "You raise O₂ from 5 mol to 8 mol with 6 mol H₂. Predict, then press React all. How many mol of H₂O are made?"
- choices:
  - `right` `{right}` correct (6 mol)
  - `excess` `{excess}` (16 mol)
  - `o2` `{o2}` (8 mol)
  - `sum` `{sum}` (14 mol)
- feedback:
  - excess: "That uses all the O₂. O₂ is in excess, so it does not set the product. Find the reactant that runs out first and use its moles."
  - o2: "The product is not equal to the moles of one reactant. Use the mole ratio from the equation, 2 H₂O for every 2 H₂, and the limiting reactant."
  - sum: "Products are not made by adding reactant moles. Read the 'mol H₂O made' in the status line after the reaction stops."
- explanation: "H₂ is the limiting reactant: 6 mol H₂ makes 6 mol H₂O, and it uses only {used} O₂. The extra O₂ is stranded ({left} left over), so adding more of the excess reactant does not make more product."

### 3. `left`: Excess left over
- setup: `{rxn: "ammonia", a: 4, b: 9}` (N₂ + 3 H₂ → 2 NH₃, 4 mol N₂ and 9 mol H₂)
- question: "Predict, then press React all. In the After row, how many mol of N₂ are left over?"
- choices (labels are `{x}` followed by " N₂", for example "1 mol N₂"):
  - `right` `{right} N₂` correct (1 mol)
  - `none` `{none} N₂` (0 mol)
  - `used` `{used} N₂` (3 mol)
  - `subtract` `{subtract} N₂` (5 mol)
- feedback:
  - none: "Zero is the After amount of the limiting reactant. Look at the N₂ column in the After row."
  - used: "That is how much N₂ reacted (the Change row). Leftover is start minus used. Read the After row."
  - subtract: "The reactants are not used 1 to 1, so you cannot subtract the starting amounts. The equation uses 3 H₂ for each N₂. Find how much N₂ the 9 mol H₂ uses first."
- explanation: "H₂ is limiting. 9 mol H₂ uses {used} N₂ (3 mol H₂ for each N₂), so the left over is 4 mol - {used} = {right}. {made} NH₃ is made."

### 4. `exact`: Exactly the right ratio
- setup: `{rxn: "ammonia", a: 2, b: 6}` (N₂ + 3 H₂ → 2 NH₃, 2 mol N₂ and 6 mol H₂)
- question: "Predict whether anything is left over, then press React all. What does the lab show is left over?"
- choices:
  - `right` No reactant is left over (correct)
  - `h2` `{h2}`
  - `n2` `{n2}`
  - `product` `{product}`
- feedback:
  - h2: "That treats the reaction as 1 to 1. The equation uses 3 H₂ for each N₂, so 2 mol N₂ uses 6 mol H₂. Read the After row."
  - n2: "N₂ has fewer moles, but 2 mol N₂ needs 6 mol H₂ and there are 6 mol. Compare the moles with the coefficients, then read the After row."
  - product: "NH₃ is the product, not a leftover. Leftover means unreacted starting substance. Read the Stopped line."
- explanation: "2 mol N₂ needs 3 x 2 = 6 mol H₂, exactly what is there. Both run out together, both get the limiting tag, and the After row shows 0 and 0. The only thing in the box is the product, {made} NH₃."

### 5. `ratio`: The mole ratio in the equation
- setup: `{rxn: "hcl", a: 3, b: 5}` (H₂ + Cl₂ → 2 HCl, 3 mol H₂ and 5 mol Cl₂)
- question: "Predict how much HCl forms, then press React all. How many mol of HCl are made?"
- choices:
  - `right` `{right}` correct (6 mol)
  - `ratio` `{ratio}` (3 mol)
  - `excess` `{excess}` (10 mol)
  - `sum` `{sum}` (8 mol)
- feedback:
  - ratio: "That treats the reaction as 1 mol of product for 1 mol of reactant. The equation makes 2 HCl for each H₂. Check the coefficient on HCl."
  - excess: "That uses the excess reactant, Cl₂. The limiting reactant sets the product. Find which reactant runs out first."
  - sum: "Products are not found by adding reactant moles. Use the limiting reactant and the mole ratio, then read the status line."
- explanation: "H₂ is limiting, 3 mol. The equation makes 2 mol HCl for each 1 mol H₂, so 3 x 2 = {right} HCl. The {left} Cl₂ left over does not make more."  (`{left}` = mol(2))

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `limiting-reactant/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does.
- Spanish waits for the proofread. Leave the strings English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys. Chemical formulas use the real subscripts (H₂O as in the lab's own text).
- Style: no em dashes, short sentences, "Lab check" as in the other labs.

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices), and Q2's right choice differs from all three wrong ones.
2. The right choice equals the model's result for each setup, and (Playwright) after the setup through `zsa-lrc:request-lab`, pressing `#zsa-lr-play` and waiting for `#zsa-lr-status` to start with "Stopped", the right choice matches the status line (Q2, Q5 moles made; Q1 the limiting tag in `#zsa-lr-thead`) or the After row (Q3 N₂, Q4 both 0).
3. Determinism: running each setup twice gives identical status text and table rows (the random molecule positions never change them). After a React once press and then a setup call with the same settings, the lab is reset (status "Ready", predictions cleared and enabled).
4. Registry: the `LLC` entry decodes, `maxItems` is 5, no prefix clash, and the Collision Carts highest-id test is updated for whatever id is assigned.
5. No element id clash: `document.querySelectorAll('#zsa-lrc-check').length === 1`, and the lab's own `#zsa-lr-check` button still has its own handler and "Check my answers" feedback.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on the `file://` lab (patched copy): dirty the lab with React once, call the setup event, press React all, wait for the status to start with "Stopped", read `#zsa-lr-status` and `#zsa-lr-table`. Two page loads per setup, identical.

| Q | Setup | Status line | Before / Change / After |
|---|---|---|---|
| 1 | CO 5, O₂ 3 | Stopped. 5 mol CO₂ made. CO is the limiting reactant; 0.5 mol O₂ is in excess. | CO 5, −5, 0 (limiting); O₂ 3, −2.5, 0.5 (excess); CO₂ 0, +5, 5 |
| 2 | H₂ 6, O₂ 8 | Stopped. 6 mol H₂O made. H₂ is the limiting reactant; 5 mol O₂ is in excess. | H₂ 6, −6, 0; O₂ 8, −3, 5; H₂O 0, +6, 6 |
| 3 | N₂ 4, H₂ 9 | Stopped. 6 mol NH₃ made. H₂ is the limiting reactant; 1 mol N₂ is in excess. | N₂ 4, −3, 1; H₂ 9, −9, 0; NH₃ 0, +6, 6 |
| 4 | N₂ 2, H₂ 6 | Stopped. 4 mol NH₃ made. Neither reactant is in excess. | N₂ 2, −2, 0; H₂ 6, −6, 0; NH₃ 0, +4, 4 (both tagged limiting) |
| 5 | H₂ 3, Cl₂ 5 | Stopped. 6 mol HCl made. H₂ is the limiting reactant; 2 mol Cl₂ is in excess. | H₂ 3, −3, 0; Cl₂ 5, −3, 2; HCl 0, +6, 6 |

The minus sign in the table is the Unicode minus (`−`), as `M.signed` prints it.

## Media (WordPress site 257744344)

`chem-limiting-reactant-lab-check.pdf` (media 15003) and `chem-limiting-reactant-lab-check-key.pdf` (media 15004), uploaded and returning 200. Lesson page 549 (Limiting & Excess Reactants) already has the Lab check line in its Visualizer callout. No existing Lab check copies were found in Drive or the media library.
