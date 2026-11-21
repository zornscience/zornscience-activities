# Equilibrium Sandbox Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `equilibrium-lab/` (Equilibrium Sandbox, version 1.3.3, activity slug `equilibrium-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-equilibrium-lab-check.pdf` (student sheet) and `chem-equilibrium-lab-check-key.pdf` (answer key). Course on the PDFs is Chemistry, file prefix `chem-`.

## Registry entry (shared/zsa-codes.js)

- Prefix `EQLC`. The rule is initial plus LC, which would be `ELC`, but that is the Equipotential lab, so it takes the first two letters plus LC. `EQLC` is not taken and is not the start of another prefix (check the list once more when merging).
- Registry id **26** (as assigned by the orchestrator).
- Entry, same shape as id 12:

```js
{id:26, prefix:"EQLC", slug:"equilibrium-lab", setting:"Lab check", name:"Equilibrium Sandbox", maxItems:5,
  stats:[["reactant", "Add reactant"], ["squeeze", "Squeeze the vessel"], ["heat", "Heat the reaction"],
    ["rates", "Dynamic equilibrium"], ["kcvol", "Constant or quotient"]],
  totals:[["reactant"], ["squeeze"], ["heat"], ["rates"], ["kcvol"]], items:[0, 1, 2, 3, 4]}
```

- Bump `zsa-version` to 1.4.0 (minor) in `equilibrium-lab/index.html`, add `labcheck.js` and the shared Lab check files the way `collision-carts/index.html` does, and add the mount `<div id="zsa-eqs-check"></div>`.
- **Id clash notes:** the mount is `#zsa-eqs-check`. The lab's ids are `eq`, `reset-eq`, `eq-metrics`, `eq-step`, `eq-graph`, `temp`, `temp-out`, `volume`, `volume-out`, `species`, `add`, `remove`, `pause`, `state`, `vessel`, `forward-rate`, `reverse-rate`, `forward-value`, `reverse-value`, `rate-note`, `explanation`, `csv`, `print` and the `zsa-th-...` header ids. None contains "check" and none starts with `zsa-eqs`. The Equipotential lab's event is `zsa-eq:request-lab`, so this lab uses **`zsa-eq2:request-lab`**.
- `README.md` says "Open investigations do not issue completion codes." Reword it to say that only the Lab check does, and note the new version in the changelog.

## The model is separate; only a setup event is missing

`model.js` exposes `K(t)`, `equilibrium(a, b, v, t)`, `rates(s)` and `advance(s, dt)` through the `equilibrium-lab-model` event and `module.exports`. `labcheck.js` requests the same event, as `lab.js` does. State is `{a, b, v, t}` (mol N2O4, mol NO2, liters, kelvin). The starting state is `{...M.equilibrium(2, 0.2, 5, 298), v: 5, t: 298}`, which is 1.559 mol N2O4 and 1.081 mol NO2.

What is missing is a way to put the lab in its starting state and keep it still. The lab runs a clock (a tick every 250 ms) that moves the reaction, so a question must start **paused** or the readouts drift. Add this to `lab.js` (before the final `resetEq()` line, after the Pause handler), as `collision-carts/lab.js` does with `zsa-cc:request-lab`:

```js
document.querySelector('.thermo').addEventListener('zsa-eq2:request-lab',ev=>ev.detail.receive({
  // setup(): the default starting equilibrium (2 mol N2O4, 0.2 mol NO2, 5 L, 298 K), paused.
  setup(){resetEq();if(playing)$('pause').click();},
  // Same expressions the readouts use, so a choice always matches the screen.
  format:{conc:v=>v.toFixed(3),q:v=>v.toFixed(3),k:v=>v.toFixed(3),p:v=>v.toFixed(2),rate:v=>(v>0&&v<.00001?v.toExponential(2):v.toFixed(5))}
}));
```

Better still, make `renderEq()` call these formatters so there is one copy. `resetEq()` already sets the sliders back to 298 K and 5 L, and also restores Pause (`playing=true`), which is why `setup()` presses Pause afterward. The Set up the lab button must leave the lab **paused** (button reads Resume). Every question here changes one condition by hand and reads a tile, so a paused lab shows the change at once with no drift.

## How the numbers are filled in

Every number comes from `M.equilibrium`, `M.K` and `M.rates` through `format`. Nothing is typed in. Let `s = M.equilibrium(2, 0.2, 5, 298)` (a, b in mol) and `R = 0.082057`.

| slot | formula | format | reads |
|---|---|---|---|
| Qc after adding 0.30 mol N2O4 | `b^2 / (5 * (a + 0.30))` | q | 0.126 |
| Kc at 298 K | `M.K(298)` | k | 0.150 |
| pressure at 1 L | `(a + b) * R * 298 / 1` | p | 64.57 |
| pressure at 5 L | `(a + b) * R * 298 / 5` | p | 12.91 |
| Kc at 340 K | `M.K(340)` | k | 2.598 |
| Kc at 270 K | `M.K(270)` | k | 0.014 |
| forward rate at start | `M.rates({a, b, v: 5, t: 298}).forward` | rate | 0.01169 |
| reverse rate at start | `M.rates(...).reverse` | rate | 0.01169 |
| Qc at 1 L | `(b / 1)^2 / (a / 1)` | q | 0.750 |

The "Kc" tile shows `K` (three decimals) and its label shows `Qc = ...` (three decimals). The pressure tile shows two decimals with "atm". The rate numbers show five decimals.

## The five questions

All wrong choices are different common mistakes and all four options show different values in every question (checked below). Every action is a button press or one key on a slider, so no dragging is needed.

### 1. `reactant`: Add reactant
- setup: the default start, paused (`setup()`)
- question: "In the substance menu, N₂O₄ is chosen. Press + 0.10 mol 3 times. What does Qc show in the Kc tile?"
- choices (value, label, feedback key):
  - `right` `{right}` correct (= q(b² / (5 (a + 0.30))) = 0.126)
  - `same` `{same}` (= k(K(298)) = 0.150, Qc unchanged)
  - `wrongSide` `{wrongSide}` (= q((b + 0.30)² / (5 a)) = 0.245, the amount added to NO₂)
  - `flip` `{flip}` (= q(Kc / Qc right), 1.192, the quotient upside down)
- feedback:
  - same: "Qc only equals Kc when the system is at equilibrium. Adding a substance changes the concentrations at once, so read the Qc in the Kc tile after the 3 presses."
  - wrongSide: "That adds the 0.30 mol to NO₂. Check the substance menu. The extra N₂O₄ goes in the bottom of Qc, so Qc gets smaller."
  - flip: "Qc is products over reactants, [NO₂]² / [N₂O₄]. More reactant makes Qc smaller than Kc, not bigger."
- slots: nA = a / 5 (0.312 M), nA2 = (a + 0.30) / 5 (0.372 M), nB = b / 5 (0.216 M)
- explanation: "Qc = [NO₂]² / [N₂O₄]. After adding 0.30 mol, [N₂O₄] = {nA2} M and [NO₂] = {nB} M, so Qc = {right}. That is less than Kc = {same}, so the reaction shifts right, toward NO₂."

### 2. `squeeze`: Squeeze the vessel
- setup: the default start, paused (pressure 12.91 atm)
- question: "Click the Volume slider and press Home to set 1 L. What does the pressure tile show?"
- choices:
  - `right` `{right} atm` correct (= p(P at 1 L) = 64.57)
  - `same` `{same} atm` (= p(P at 5 L) = 12.91, the start)
  - `inverse` `{inverse} atm` (= p(P at 1 L / 25) = 2.58, divided instead of multiplied)
  - `squared` `{squared} atm` (= p(5 x P at 1 L) = 322.87)
- feedback:
  - same: "That is the reading at 5 L. Press Home on the Volume slider first, then read the pressure tile again."
  - inverse: "A smaller volume gives a higher pressure, not a lower one. The same gas is crowded into less space."
  - squared: "Pressure goes as 1 / V, not 1 / V². Cutting the volume to one fifth makes the pressure 5 times larger."
- slots: start = p(P at 5 L), nTotal = a + b (2.641 mol, three decimals)
- explanation: "P = nRT / V with n = {nTotal} mol of gas and T = 298 K. The amounts have not changed yet, so only V changed. At 5 L the pressure is {same} atm, and at 1 L it is 5 times larger, {right} atm."

### 3. `heat`: Heat the reaction
- setup: the default start, paused
- question: "Click the Temperature slider and press End to set 340 K. What does the Kc tile show for Kc?"
- choices:
  - `right` `{right}` correct (= k(K(340)) = 2.598)
  - `same` `{same}` (= k(K(298)) = 0.150)
  - `cooled` `{cooled}` (= k(K(270)) = 0.014)
  - `inverse` `{inverse}` (= k(1 / K(340)) = 0.385)
- feedback:
  - same: "That is Kc at 298 K, and it is also the Qc in the tile label. Temperature changes Kc. Read the large number in the tile after you press End."
  - cooled: "That is Kc for a cooler system. The forward reaction absorbs heat, so heating makes Kc larger, not smaller."
  - inverse: "That is Kc for the reverse reaction, 1 / Kc. This tile shows Kc for N₂O₄ ⇌ 2 NO₂ as written."
- explanation: "The forward reaction is endothermic (ΔH° = +57.2 kJ/mol), so heating favors it and Kc rises from {same} to {right}. The Qc in the tile label is still {same}, because the amounts have not changed yet. Now Qc < Kc, so the reaction shifts right."

### 4. `rates`: Dynamic equilibrium
- setup: the default start, paused
- question: "The system is at equilibrium. What does the Reverse rate number show? (Read it in the rate panel.)"
- choices:
  - `right` `{right}` correct (= rate(reverse) = 0.01169, equal to the forward rate)
  - `zero` `{zero}` (= rate(0) = 0.00000)
  - `noKc` `{noKc}` (= rate(0.25 a / 5) = 0.07796, forward rate with Kc left out)
  - `first` `{first}` (= rate(0.25 b / 5) = 0.05407, NO₂ treated as first order)
- feedback:
  - zero: "At equilibrium the reactions do not stop. The forward and reverse reactions both keep running at the same rate. Read the Reverse number."
  - noKc: "That is not the Reverse rate. Compare it with the Forward number. At equilibrium the two rates are equal."
  - first: "The reverse reaction depends on [NO₂]², not [NO₂]. At equilibrium its rate equals the Forward rate."
- slots: fwd = rate(forward) (equals right), a = a / 5 (0.312 M), b = b / 5 (0.216 M)
- explanation: "At equilibrium the forward and reverse rates are equal, here {right} mol/(L·s) each. Both reactions keep going, so [N₂O₄] = {a} M and [NO₂] = {b} M stay steady. Equal rates do not mean equal concentrations."

### 5. `kcvol`: Constant or quotient
- setup: the default start, paused
- question: "Click the Volume slider and press Home to set 1 L. What does the Kc tile show for Kc, before the label's Qc?"
- choices:
  - `right` `{right}` correct (= k(K(298)) = 0.150)
  - `qc` `{qc}` (= q(Qc at 1 L) = 0.750, the Qc in the label)
  - `fifth` `{fifth}` (= k(K(298) / 5) = 0.030)
  - `squared` `{squared}` (= k(K(298) x 25) = 3.750)
- feedback:
  - qc: "That is the Qc in the tile label. The big number is Kc. Volume changes Qc, but only temperature changes Kc."
  - fifth: "Kc does not follow the volume. Only temperature changes Kc, so it stays at its 298 K value."
  - squared: "Kc does not change when you squeeze the gas. Only temperature changes Kc."
- slots: qc = q(Qc at 1 L)
- explanation: "Squeezing the gas makes every concentration 5 times larger, so Qc rises to {qc}. Kc stays {right} because the temperature is still 298 K. Now Qc > Kc, so the reaction shifts left, toward fewer gas molecules."

Check in a test that the four values in each question differ: Q1 0.126, 0.150, 0.245, 1.192; Q2 64.57, 12.91, 2.58, 322.87; Q3 2.598, 0.150, 0.014, 0.385; Q4 0.01169, 0.00000, 0.07796, 0.05407; Q5 0.150, 0.750, 0.030, 3.750.

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `equilibrium-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does.
- Spanish waits for the proofread. Leave the strings English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check" as in the other labs. Use real subscripts in the lab text (₂, ₄) as the lab already does.

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices).
2. The right choice equals the formatted model result for each question, and (Playwright) after `zsa-eq2:request-lab` setup, doing the steps in the question text (Q1 click `#add` 3 times; Q2 and Q5 focus `#volume`, press Home; Q3 focus `#temp`, press End), the right choice matches the readout: `#eq-metrics` tile 3 (Kc and `Qc = ...`), tile 4 (pressure), `#reverse-value`.
3. The lab stays paused after setup (button text Resume) and the readouts do not change after 800 ms.
4. Registry: id 26 `EQLC` decodes, `maxItems` is 5.
5. No element id clash: `document.querySelectorAll('#zsa-eqs-check').length === 1`.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on the `file://` lab: click Reset experiment, click Pause, do the steps, read `#eq-metrics`, `#forward-value`, `#reverse-value`, `#state`. After setup the lab stays paused and nothing changed after 800 ms.

| Q | Steps | Readout | State pill |
|---|---|---|---|
| start | none | 0.312 M, 0.216 M, Kc 0.150 (Qc = 0.150), 12.91 atm, forward 0.01169, reverse 0.01169 | At equilibrium |
| 1 | species N₂O₄, + 0.10 mol x 3 | [N₂O₄] 0.372 M, Kc 0.150, **Qc = 0.126**, 14.38 atm | Shifting right → |
| 2 | Volume, Home (1 L) | **64.57 atm** | ← Shifting left |
| 3 | Temperature, End (340 K) | **Kc 2.598**, Qc = 0.150 | Shifting right → |
| 4 | none | forward 0.01169, **reverse 0.01169** | At equilibrium |
| 5 | Volume, Home (1 L) | **Kc 0.150**, Qc = 0.750, forward 0.05847, reverse 0.29237 | ← Shifting left |

## Media (WordPress site 257744344)

`chem-equilibrium-lab-check.pdf` (media 14791) and `chem-equilibrium-lab-check-key.pdf` (media 14792), uploaded. The lab's existing worksheet is `chem-equilibrium-virtual-lab.pdf` (media 7689, key 7690), so the names match it.
