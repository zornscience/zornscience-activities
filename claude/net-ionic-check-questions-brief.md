# Net Ionic Reactions Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `net-ionic-lab/` (Net Ionic Reactions Lab, version 1.1.3, activity slug `net-ionic-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-net-ionic-lab-check.pdf` (student sheet) and `chem-net-ionic-lab-check-key.pdf` (answer key). Course is Chemistry, prefix `chem-`. The lab's existing worksheet is `chem-net-ionic-virtual-lab.pdf` (media 7707, key 7708), so the new names are `chem-net-ionic-lab-check.pdf` and `chem-net-ionic-lab-check-key.pdf`.

## Registry entry (shared/zsa-codes.js)

- Prefix `NLC`, registry id **24**. Not taken, not the start of another prefix.
- Entry, same shape as id 12:

```js
{id:24, prefix:"NLC", slug:"net-ionic-lab", setting:"Lab check", name:"Net Ionic Reactions", maxItems:5,
  stats:[["silver", "A precipitate forms"], ["none", "A color change, no reaction"], ["single", "A metal displaces a metal ion"],
    ["balance", "Balance and states"], ["spectator", "Spectator ions"]],
  totals:[["silver"], ["none"], ["single"], ["balance"], ["spectator"]], items:[0, 1, 2, 3, 4]}
```

- Bump `zsa-version` to 1.2.0 in `net-ionic-lab/index.html`, add `model.js`, `labcheck.js` and the shared Lab check files the way `collision-carts/index.html` does, and add `<div id="zsa-ni-check"></div>` as the mount (for example after the `.lab-layout` div, before the About section).
- **Id clash notes:** the lab's ids are `instructions share reactions mixture-title phase apparatus mix reset progress observation-title observation-text chemistry equation explanation help help-title share-dialog share-title share-url copy email share-status` plus the About ids. Nothing contains "check". `#zsa-ni-check` is free. Do not reuse `#equation`, `#explanation` or `#observation-text` for the check. The root has class `ionic-lab`; do not reuse it.
- `README.md` says "No data entry, grading, tracking". Reword to say that only the Lab check issues a completion code (kept in the browser, nothing sent).

## The lab has no model file and no setup event

All ten mixtures are a `trials` array inside `lab.js`, and the chosen mixture is the module variable `selected`. Two changes:

1. **Add `net-ionic-lab/model.js`** (loaded before `lab.js`, global `NetIonicModel`, `module.exports` for tests) holding the `reagents` and `trials` arrays moved out of `lab.js`, so there is one copy, with these accessors. `lab.js` then reads `NetIonicModel.trials` and `NetIonicModel.reagents`:

```js
(function () {
  "use strict";
  const reagents = {/* the reagents object from lab.js, unchanged */};
  const trials = [/* the trials array from lab.js, unchanged: [first, second, solid, liquid color, observation, net ionic equation, explanation] */];
  const api = {
    reagents, trials,
    names: i => reagents[trials[i][0]][0] + " + " + reagents[trials[i][1]][0],   // the button and heading text
    observation: i => trials[i][4],   // #observation-text after mixing
    equation: i => trials[i][5],      // #equation inside Reveal the chemistry
    explanation: i => trials[i][6]    // #explanation inside Reveal the chemistry
  };
  if (typeof module === "object" && module.exports) module.exports = api; else self.NetIonicModel = api;
}());
```

2. **Add one event to `lab.js`** (before the final `reset()`), as `collision-carts/lab.js` does with `zsa-cc:request-lab`:

```js
document.querySelector('[data-zsa-activity="net-ionic-lab"]').addEventListener('zsa-ni:request-lab',e=>e.detail.receive({
  // s = {trial: 0 to 9, the index in trials}
  setup(s){selected=s.trial;reset();},   // reset() cancels any pour, selects the mixture and leaves the beaker empty
  format:t=>t                            // text is shown as the lab prints it
}));
```

The student then presses **Mix reagents**, waits for "Mixed" (about 7 seconds), opens **Reveal the chemistry** and reads the equation or the explanation. "Set up the lab" selects the mixture but does not start the mix.

## How the question text is filled in

There are no numbers. Every right answer and the "no reaction" and other-mixture wrong answers are strings read from `NetIonicModel` through `format`. The remaining wrong answers are written from the reagent formulas in `NetIonicModel.reagents` (index 1 of each entry), so a choice never drifts from what the lab prints. Slots: `eq(i)` = `NetIonicModel.equation(i)`, `ex(i)` = `NetIonicModel.explanation(i)`. Trial indexes: 0 NaCl+CuSO₄, 1 Zn+Pb(NO₃)₂, 2 AgNO₃+NaCl, 3 CaCl₂+Fe(NO₃)₃, 4 Fe(NO₃)₃+NaOH, 5 NaCl+Fe(NO₃)₃, 6 CuSO₄+Fe(NO₃)₃, 7 Pb(NO₃)₂+CuSO₄, 8 Pb(NO₃)₂+NaCl, 9 CuSO₄+NaOH.

## The five questions

All wrong choices are different common mistakes, and all four options differ in every question.

### 1. `silver`: A precipitate forms
- setup: `{trial: 2}` (Silver nitrate + Sodium chloride)
- question: "Press Mix reagents and wait for Mixed. Open Reveal the chemistry. Which is the net ionic equation the lab shows?"
- choices (value, label, feedback key):
  - `right` `eq(2)` = "Ag⁺(aq) + Cl⁻(aq) → AgCl(s)" correct
  - `molecular` "AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq)"
  - `spectator` "Na⁺(aq) + NO₃⁻(aq) → NaNO₃(s)"
  - `none` `eq(0)` = "No net ionic reaction."
- feedback:
  - molecular: "That is the molecular equation. A net ionic equation shows only the ions that change, and writes soluble salts as ions."
  - spectator: "Sodium and nitrate ions stay dissolved. They are spectators, so they do not appear in the net ionic equation."
  - none: "Look at the beaker. A white solid forms, so the ions did react. Check the observation after mixing."
- explanation: "Silver ions and chloride ions join to make solid silver chloride. Sodium and nitrate ions stay dissolved, so they are left out. The net ionic equation is {right}."

### 2. `none`: A color change, no reaction
- setup: `{trial: 6}` (Copper(II) sulfate + Iron(III) nitrate)
- question: "Press Mix reagents and wait for Mixed. The mixture turns blue-green. Open Reveal the chemistry. What does the lab show?"
- choices:
  - `right` `eq(6)` = "No net ionic reaction." correct
  - `iron` "2 Fe³⁺(aq) + 3 SO₄²⁻(aq) → Fe₂(SO₄)₃(s)"
  - `copper` "Cu²⁺(aq) + 2 NO₃⁻(aq) → Cu(NO₃)₂(s)"
  - `join` "Cu²⁺(aq) + Fe³⁺(aq) → CuFe⁵⁺(aq)"
- feedback:
  - iron: "No solid forms in the beaker. Iron(III) sulfate is soluble, so those ions stay dissolved."
  - copper: "No solid forms in the beaker. Copper(II) nitrate is soluble, so those ions stay dissolved."
  - join: "Two positive ions do not join into one ion. The color changes because blue and yellow solutions mix."
- explanation: "Blue and yellow solutions mixing look blue-green, but no solid, gas or new substance forms. All the ions stay dissolved, so the lab shows: {right} {ex(6)}"

### 3. `single`: A metal displaces a metal ion
- setup: `{trial: 1}` (Zinc + Lead(II) nitrate)
- question: "Press Mix reagents and wait for Mixed. A gray coating grows on the zinc strip. Open Reveal the chemistry. Which net ionic equation does the lab show?"
- choices:
  - `right` `eq(1)` = "Zn(s) + Pb²⁺(aq) → Zn²⁺(aq) + Pb(s)" correct
  - `reverse` "Pb(s) + Zn²⁺(aq) → Pb²⁺(aq) + Zn(s)"
  - `charge` "Zn(s) + Pb²⁺(aq) → Zn⁺(aq) + Pb(s)"
  - `molecular` "Zn(s) + Pb(NO₃)₂(aq) → Zn(NO₃)₂(aq) + Pb(s)"
- feedback:
  - reverse: "That has the metals the wrong way round. The coating grows on the zinc, so lead metal forms and zinc dissolves."
  - charge: "Charge must balance. Zn loses 2 electrons and Pb²⁺ gains 2 electrons, so zinc becomes Zn²⁺."
  - molecular: "That is the molecular equation. A net ionic equation leaves out the nitrate spectator ions."
- explanation: "Zinc gives electrons to lead(II) ions. Zinc dissolves as Zn²⁺ and lead metal coats the strip. The net ionic equation is {right} {ex(1)}"

### 4. `balance`: Balance and states
- setup: `{trial: 4}` (Iron(III) nitrate + Sodium hydroxide)
- question: "Press Mix reagents and wait for Mixed. A rust-brown solid forms. Open Reveal the chemistry. Which net ionic equation does the lab show?"
- choices:
  - `right` `eq(4)` = "Fe³⁺(aq) + 3 OH⁻(aq) → Fe(OH)₃(s)" correct
  - `unbalanced` "Fe³⁺(aq) + OH⁻(aq) → Fe(OH)₃(s)"
  - `state` "Fe³⁺(aq) + 3 OH⁻(aq) → Fe(OH)₃(aq)"
  - `spectators` "Fe³⁺(aq) + 3 OH⁻(aq) + 3 Na⁺(aq) → Fe(OH)₃(s) + 3 Na⁺(aq)"
- feedback:
  - unbalanced: "Count the atoms and charges. Fe(OH)₃ has three hydroxide ions, so you need 3 OH⁻ on the left."
  - state: "A solid forms in the beaker, so the product is (s), not (aq)."
  - spectators: "Na⁺ is on both sides, so it is a spectator. Cross it out of a net ionic equation."
- explanation: "One Fe³⁺ needs three OH⁻ to make Fe(OH)₃, and the brown solid is (s). Na⁺ is a spectator, so it is left out. The net ionic equation is {right}"

### 5. `spectator`: Spectator ions
- setup: `{trial: 7}` (Lead(II) nitrate + Copper(II) sulfate)
- question: "Press Mix reagents and wait for Mixed. The liquid above the white solid stays blue. Open Reveal the chemistry. Which ion stays dissolved and gives the liquid its blue color?"
- choices:
  - `right` "Cu²⁺(aq)" correct
  - `sulfate` "SO₄²⁻(aq)"
  - `lead` "Pb²⁺(aq)"
  - `nitrate` "NO₃⁻(aq)"
- feedback:
  - sulfate: "Sulfate ions leave the solution in the white solid PbSO₄. Check the net ionic equation."
  - lead: "Lead ions leave the solution in the white solid PbSO₄. Check the net ionic equation."
  - nitrate: "Nitrate ions do stay dissolved, but they are colorless. Read which ion the explanation says gives the blue color."
- explanation: "Pb²⁺ and SO₄²⁻ form the white solid PbSO₄. Cu²⁺ and NO₃⁻ stay dissolved. Copper(II) ions are blue, so the liquid stays blue. {ex(7)}"

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `net-ionic-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does.
- Spanish waits for the proofread. Leave the strings English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys. Note: the equation text on screen is translated only where the lab has Spanish; the equations and formulas themselves do not change in Spanish.
- Style: no em dashes, short sentences, "Lab check" as in the other labs.

## Tests to add

1. Every choice value in every question is different (5 x 4).
2. The right choice for Q1, Q2, Q3 and Q4 equals `NetIonicModel.equation(trial)`, and Q5's explanation contains "Copper(II) ions remain dissolved" from `NetIonicModel.explanation(7)`. (Playwright) after `zsa-ni:request-lab` setup, Mix reagents and waiting for `#phase` = "Mixed", then opening Reveal the chemistry, `#equation` (Q1 to Q4) equals the right choice, and `#explanation` contains the Q5 text.
3. Registry: id 24 `NLC` decodes, `maxItems` is 5, the highest-id assertion is updated.
4. No element id clash: `document.querySelectorAll('#zsa-ni-check').length === 1`, and the lab still works after `trials` moved to `model.js` (all ten mixtures still show their observation and equation).

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on the `file://` lab: choose the mixture, press Mix reagents, wait for Mixed, open Reveal the chemistry, read `#observation-text`, `#equation`, `#explanation`.

| Q | Mixture | Observation | Equation panel |
|---|---|---|---|
| 1 | AgNO₃ + NaCl | white, curdy cloud | **Ag⁺(aq) + Cl⁻(aq) → AgCl(s)** |
| 2 | CuSO₄ + Fe(NO₃)₃ | blue-green mixture, no solid | **No net ionic reaction.** |
| 3 | Zn + Pb(NO₃)₂ | dark gray lead coating on zinc | **Zn(s) + Pb²⁺(aq) → Zn²⁺(aq) + Pb(s)** |
| 4 | Fe(NO₃)₃ + NaOH | rust-brown gelatinous solid | **Fe³⁺(aq) + 3 OH⁻(aq) → Fe(OH)₃(s)** |
| 5 | Pb(NO₃)₂ + CuSO₄ | white PbSO₄ in pale blue liquid | explanation: copper(II) ions stay dissolved and give the blue color (**Cu²⁺**) |

## Media (WordPress site 257744344)

`chem-net-ionic-lab-check.pdf` and `chem-net-ionic-lab-check-key.pdf`. No earlier Lab check copies exist in Drive or the media library.
