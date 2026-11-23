# pH & Buffer Lab Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `ph-buffer-lab/` (pH & Buffer Lab, version 1.0.5, activity slug `ph-buffer-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-ph-buffer-lab-check.pdf` (student sheet) and `chem-ph-buffer-lab-check-key.pdf` (answer key). Course on the PDFs is Chemistry, file prefix `chem-`.

## Registry entry (shared/zsa-codes.js)

- Prefix `PBLC`. The rule is the lab's initial plus LC, which would be `PLC`, but that is the Pendulum. The first two letters would give `PHLC`, which is the Physics Graphing Lab. So it takes P + B (pH + Buffer) + LC. `PBLC` is not taken and is not the start of another prefix.
- Registry id **29**.
- Entry, same shape as id 12:

```js
{id:29, prefix:"PBLC", slug:"ph-buffer-lab", setting:"Lab check", name:"pH & Buffer Lab", maxItems:5,
  stats:[["weak", "A weak acid"], ["base", "A strong base"], ["hh", "Build a buffer"],
    ["stress", "Buffer versus acid"], ["indicator", "Pick the indicator"]],
  totals:[["weak"], ["base"], ["hh"], ["stress"], ["indicator"]], items:[0, 1, 2, 3, 4]}
```

- Bump `zsa-version` to 1.1.0 (minor) in `ph-buffer-lab/index.html` (also the `?v=` query strings and the README version line, as past bumps did), add `labcheck.js` and the shared Lab check files the way `collision-carts/index.html` does, and add `<div id="zsa-pb-check"></div>` as the mount (place it after the tab panels, before the `zsa-about` section).
- **Id clash notes:** the lab already has `#check-design` and `#check-indicator` (the Challenges buttons), `#zsa-pb-live` and `#zsa-pb-back`. Do not reuse them. `#zsa-pb-check` is not used as an id anywhere. There is a CSS class `.zsa-pb-check` (a checkbox label, `.zsa-pb label.zsa-pb-check` in `lab.css`); it is a class, not an id, and only matches a `label`, so the `div` mount is unaffected. Make sure the shared Lab check styles do not add that class.
- `README.md` says "There is no ... completion code". Reword it to say that only the Lab check issues a completion code, and add a short 1.1.0 paragraph.

## The model is already separate; only a setup event is missing

`chem.js` is the model (no DOM). It already answers `zsa-pb:request-model` on `[data-zsa-activity="ph-buffer-lab"]` and exposes `explore`, `hh`, `buffer`, `stress`, `PAIRS`, `SOLUTES`, `INDICATORS`, `bestIndicator`, `scientific` (also `module.exports`). `labcheck.js` requests the same event, as `lab.js` does.

What is missing is a way to set up a question from outside. Add this to `lab.js` next to the other root listeners (after `reset();showMode(mode,false);blood();`), as `collision-carts/lab.js` does with `zsa-cc:request-lab`. `$` and `root` are already defined in `lab.js`:

```js
root.addEventListener('zsa-pb:request-lab',function(e){e.detail.receive({
  // s = {mode: "explore" | "buffer" | "stress" | "challenge",
  //   explore: solute (id from SOLUTES), conc (M)
  //   buffer: pair (id from PAIRS), ha, a (M)
  //   stress: pair, capacity (total M)
  //   challenge: equivalence ("4.50" | "8.00" | "9.20" | "11.00")}
  setup:function(s){
    function set(id,v,ev){$(id).value=v;$(id).dispatchEvent(new Event(ev||'input',{bubbles:true}));}
    $('tab-'+s.mode).click();   // showMode() and syncURL() run through the click handler
    if(s.mode==='explore'){set('solute',s.solute,'change');set('concentration',Math.log10(s.conc));}
    else if(s.mode==='buffer'){set('builder-pair',s.pair,'change');set('ha',Math.log10(s.ha));set('a',Math.log10(s.a));}
    else if(s.mode==='stress'){set('stress-pair',s.pair,'change');set('capacity',Math.log10(s.capacity));}  // reset() runs through the events, so no additions are left over
    else{$('equivalence-ph').value=s.equivalence;$('indicator').selectedIndex=0;$('indicator-feedback').textContent='';$('indicator-feedback').className='';}  // no change event, so no "Try again" appears before the student picks
  },
  format:{ph:function(v){return v.toFixed(2);}}   // every pH readout in the lab is toFixed(2)
});});
```

Notes. The sliders are log scales (`value = log10(M)`, step 0.01) and the lab reads them back with `Number(10^v).toPrecision(2)`, so 0.10, 0.010 and 0.020 M round-trip exactly (checked). The Stress Test default capacity is already 0.020 M. "Set up the lab" is the only thing the student presses before reading readouts; it does not add acid or base.

## How the question numbers are filled in

Every number comes from `chem.js`, through `format.ph` (`toFixed(2)`, the same as the lab's `f()`), and the explanations use `M.scientific` for concentrations as the lab does. Nothing is typed in.

| Q | slot | value |
|---|---|---|
| 1 | right | `ph(M.explore("acetic", 0.1).pH)` = 2.88 |
| 1 | strong | `ph(-log10(0.1))` = 1.00 |
| 1 | poh | `ph(M.explore("acetic", 0.1).pOH)` = 11.12 |
| 1 | noRoot | `ph(-log10(Ka x C))` with `Ka = M.SOLUTES.acetic.k` = 5.74 |
| 1 | x | `M.scientific(sqrt(Ka x C))` = 1.3 × 10⁻³; ka = `M.scientific(Ka)` = 1.8 × 10⁻⁵; c = 0.10; percent = `ph(M.explore(...).ionized)` = 1.33 |
| 2 | right | `ph(M.explore("baoh2", 0.01).pH)` = 12.30 |
| 2 | noFactor | `ph(14 + log10(0.01))` = 12.00 |
| 2 | poh | `ph(M.explore("baoh2", 0.01).pOH)` = 1.70 |
| 2 | acid | `ph(-log10(0.01))` = 2.00 |
| 2 | oh | `M.scientific(M.explore("baoh2", 0.01).oh)` = 2.0 × 10⁻² |
| 3 | right | `ph(M.hh("ammonium", 0.1, 0.01))` = 8.25 |
| 3 | noLog | `ph(pKa)`, `pKa = M.PAIRS.ammonium.pKa` = 9.25 |
| 3 | flip | `ph(M.hh("ammonium", 0.01, 0.1))` = 10.25 |
| 3 | addRatio | `ph(pKa + 0.01/0.1)` = 9.35 |
| 4 | right | `ph(M.stress("acetate", 0.02, 5, 0).buffer.pH)` = 4.27 |
| 4 | water | `ph(M.stress("acetate", 0.02, 5, 0).water.pH)` = 2.32 |
| 4 | before | `ph(M.stress("acetate", 0.02, 0, 0).buffer.pH)` = 4.74 |
| 4 | base | `ph(M.stress("acetate", 0.02, 0, 5).buffer.pH)` = 5.22 |
| 4 | ha, a | `M.scientific(stress.ha)`, `M.scientific(stress.a)` = 1.5 × 10⁻³, 5.1 × 10⁻⁴ (the Moles readout) |
| 5 | right | `M.bestIndicator(9.2).name` = Phenolphthalein |
| 5 | others | the other three `M.INDICATORS[i].name`: Bromocresol green, Phenol red, Alizarin yellow R |
| 5 | pKa slots | `ph(M.INDICATORS[i].pKa)`: 4.70, 7.90, 9.40, 11.20 |

Because question 5's choices are names, they are the same for every student; the right one comes from `bestIndicator`, not a typed answer.

## The five questions

All wrong choices are different common mistakes, and all four options show different values in every question (checked: Q1 2.88, 1.00, 11.12, 5.74; Q2 12.30, 12.00, 1.70, 2.00; Q3 8.25, 9.25, 10.25, 9.35; Q4 4.27, 2.32, 4.74, 5.22; Q5 four different names).

### 1. `weak`: A weak acid
- setup: `{mode: "explore", solute: "acetic", conc: 0.1}`
- question: "In the pH Explorer, what does the pH readout show for 0.10 M acetic acid?"
- choices (value, label, feedback key):
  - `right` `{right}` correct
  - `strong` `{strong}` (feedback `strong`)
  - `poh` `{poh}` (feedback `poh`)
  - `noRoot` `{noRoot}` (feedback `noRoot`)
- feedback:
  - strong: "That is the pH of a strong acid at 0.10 M. Acetic acid is weak, so it ionizes only a little. Read the pH readout and the Ionized percent."
  - poh: "That is the pOH. The lab shows pH and pOH side by side. Read the one labeled pH."
  - noRoot: "That is -log(Ka x C). For a weak acid, [H₃O⁺] is the square root of Ka x C, so the pH is much lower. Check the student method."
- explanation: "Acetic acid is a weak acid with Ka = {ka}. [H₃O⁺] is about √(Ka × C) = √({ka} × 0.10) = {x} M, so pH = {right}. Only {percent}% of the molecules ionize, so the pH is much higher than the strong acid value of {strong}."

### 2. `base`: A strong base
- setup: `{mode: "explore", solute: "baoh2", conc: 0.01}`
- question: "In the pH Explorer, what does the pH readout show for 0.010 M barium hydroxide, Ba(OH)₂?"
- choices:
  - `right` `{right}` correct
  - `noFactor` `{noFactor}` (feedback `noFactor`)
  - `poh` `{poh}` (feedback `poh`)
  - `acid` `{acid}` (feedback `acid`)
- feedback:
  - noFactor: "That treats it as one OH⁻ per formula unit. Ba(OH)₂ gives two OH⁻ for each Ba²⁺, so [OH⁻] is twice the concentration."
  - poh: "That is the pOH. A base has a low pOH and a high pH. Read the pH readout."
  - acid: "That is the pH of a 0.010 M strong acid. This is a base, so the pH is above 7."
- explanation: "Ba(OH)₂ is a strong base with two OH⁻ per formula unit, so [OH⁻] = 2 × 0.010 = {oh} M and pOH = {poh}. Then pH = 14.00 - {poh} = {right}."

### 3. `hh`: Build a buffer
- setup: `{mode: "buffer", pair: "ammonium", ha: 0.1, a: 0.01}`
- question: "In the Buffer Builder, what does pH from method show for this NH₄⁺ / NH₃ buffer (acid 0.10 M, conjugate base 0.010 M)?"
- choices:
  - `right` `{right}` correct
  - `noLog` `{noLog}` (feedback `noLog`)
  - `flip` `{flip}` (feedback `flip`)
  - `addRatio` `{addRatio}` (feedback `addRatio`)
- feedback:
  - noLog: "That is the pKa, which is the pH only when [A⁻] = [HA]. Here the conjugate base is 10 times smaller than the acid. Read the substitution line."
  - flip: "The ratio is upside down. It is [A⁻] over [HA], conjugate base over acid. More acid than base lowers the pH below the pKa."
  - addRatio: "Add the log of the ratio, not the ratio itself. log(0.10) is -1, not 0.10."
- explanation: "The ratio [A⁻]/[HA] = 0.010 / 0.10 = 0.10, and log(0.10) = -1.00. So pH = {pKa} + (-1.00) = {right}. The buffer has ten times more acid than base, so its pH sits one unit below the pKa."
- slot: pKa = `ph(M.PAIRS.ammonium.pKa)`.

### 4. `stress`: Buffer versus acid
- setup: `{mode: "stress", pair: "acetate", capacity: 0.02}`
- question: "In the Stress Test, press Add 5.0 mL HCl once. What does the Buffer pH readout show?"
- choices:
  - `right` `{right}` correct
  - `water` `{water}` (feedback `water`)
  - `before` `{before}` (feedback `before`)
  - `base` `{base}` (feedback `base`)
- feedback:
  - water: "That is the Pure water beaker. The buffer beaker is the one on the right. Read the Buffer pH readout."
  - before: "The buffer resists a change in pH, but it does not stop it. Some A⁻ reacted, so the pH did drop a little. Press Add 5.0 mL HCl and read the Buffer pH again."
  - base: "That is the pH after adding NaOH. HCl is an acid, so the buffer pH goes down, not up."
- explanation: "The HCl reacts with the conjugate base: A⁻ + H₃O⁺ → HA + H₂O. The buffer now has {ha} mol HA and {a} mol A⁻, so its pH falls only from {before} to {right}. The same acid drops pure water to {water}."

### 5. `indicator`: Pick the indicator
- setup: `{mode: "challenge", equivalence: "9.20"}`
- question: "In Challenges, set Equivalence point pH to 9.20. Pick each indicator. Which one does the lab call Correct?"
- choices: `right` `{right}` (Phenolphthalein, correct), `acidic` `{acidic}` (Bromocresol green, feedback `acidic`), `neutral` `{neutral}` (Phenol red, feedback `neutral`), `high` `{high}` (Alizarin yellow R, feedback `high`). The choices keep the lab's own order of names, which the shared Lab check may shuffle like the other labs.
- feedback:
  - acidic: "Its pKa is {acidicPka}, far below pH 9.20. Pick the indicator whose pKa is closest to the equivalence point."
  - neutral: "Its pKa is {neutralPka}, still more than one unit below pH 9.20. Compare the distance from each pKa to 9.20."
  - high: "Its pKa is {highPka}, two units above pH 9.20. Compare the distance from each pKa to 9.20."
- explanation: "The best indicator has a pKa closest to the equivalence point. {right} has pKa {rightPka}, only 0.20 from pH 9.20. It changes from colorless to pink near that pH."

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `ph-buffer-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does.
- Spanish waits for the proofread. Leave the strings English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check" as in the other labs.

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices).
2. The right choice equals the formatted model result for each setup, and (Playwright) after setup through `zsa-pb:request-lab`: Q1 and Q2 `#explore-ph`; Q3 `#builder-hh`; Q4 click `#acid-bulk`, then `#buffer-ph` reads "pH {right}"; Q5 selecting `#indicator` option `phenolphthalein` makes `#indicator-feedback` start with "Correct" and the other three start with "Try again".
3. Registry: id 29 `PBLC` decodes, `maxItems` is 5, no earlier prefix is a prefix of it.
4. `document.querySelectorAll('#zsa-pb-check').length === 1`, and `#check-design` and `#check-indicator` still have their own handlers.
5. After Q4's setup the data table has only the Initial row (no stale additions) and Q5's feedback line is empty.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on the `file://` lab, with the setup code above attached to the page and driven through the event.

| Q | Setup | Readout |
|---|---|---|
| 1 | Explorer, acetic acid 0.10 M | pH **2.88**, pOH 11.12, "weak acid; Ka = 1.8 × 10⁻⁵ at 25 °C." |
| 2 | Explorer, Ba(OH)₂ 0.010 M | pH **12.30**, pOH 1.70 |
| 3 | Builder, NH₄⁺/NH₃, 0.10 and 0.010 M | pH from method **8.25**, exact pH 8.25 ("pH = 9.25 + log(1.0 × 10⁻² / 1.0 × 10⁻¹) = 8.25") |
| 4 | Stress Test, acetate, 0.020 M: start | buffer 4.74, water 7.00, capacity 10.00 mL |
| 4 | after Add 5.0 mL HCl | buffer **4.27**, water 2.32 (Add 5.0 mL NaOH instead: buffer 5.22, water 11.68) |
| 5 | Challenges, equivalence 9.20 | Bromocresol green: Try again; Phenol red: Try again; **Phenolphthalein: Correct** (pKa 9.40); Alizarin yellow R: Try again |

## Media (WordPress site 257744344)

`chem-ph-buffer-lab-check.pdf` and `chem-ph-buffer-lab-check-key.pdf`. The lab's existing worksheet is `chem-ph-buffer-virtual-lab.pdf` (media 8215, key 8216), so these names match it.
