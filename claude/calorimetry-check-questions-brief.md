# Calorimetry Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `calorimetry-lab/` (Calorimetry & Enthalpy Lab, version 1.3.3, activity slug `calorimetry-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-calorimetry-lab-check.pdf` (student sheet) and `chem-calorimetry-lab-check-key.pdf` (answer key). This is the first Chemistry lab in the rollout, so the course on the PDFs is Chemistry and the file prefix is `chem-`.

## Registry entry (shared/zsa-codes.js)

- Prefix `CALC`. The rule is the lab's initial plus LC, which would be `CLC`, but that is Collision Carts, so it takes the first two letters plus LC. `CALC` is not taken and is not the start of another prefix.
- Registry id **20** (ids 11 and 13 stay reserved for Inclined Plane and Projectile; 12 CLC, 14 SLC, 15 STLC, 16 PHLC, 17 CILC, 18 ELC and 19 FLC are used).
- Entry, same shape as id 12:

```js
{id:20, prefix:"CALC", slug:"calorimetry-lab", setting:"Lab check", name:"Calorimetry & Enthalpy", maxItems:5,
  stats:[["balance", "Heated copper in water"], ["sign", "The sign of the temperature change"], ["mass", "Double the metal mass"],
    ["acid", "Acid and base"], ["cold", "A metal colder than the water"]],
  totals:[["balance"], ["sign"], ["mass"], ["acid"], ["cold"]], items:[0, 1, 2, 3, 4]}
```

- The Collision Carts test that asserts the highest id is 12 must be fixed first (see the Projectile brief).
- Bump `zsa-version` to 1.4.0 in `calorimetry-lab/index.html`, add `labcheck.js` and the shared Lab check files the way `collision-carts/index.html` does, and add `<div id="zsa-cal-check"></div>` as the mount.
- **Id clash to avoid:** the lab already has `#check-answer`, the Check calculation button. Do not reuse it or any `cal-...` id (`cal`, `cal-answer`, `cal-practice`, `cal-result`, `cal-measurements` and so on). The new mount is `#zsa-cal-check`, which nothing uses.
- `README.md` says "Open investigations do not issue completion codes." Reword it to say that only the Lab check does.

## The model is already separate; only a setup event is missing

`model.js` exposes `metal(m, cm, tm, w, tw)` and `neutral(av, ac, bv, bc, t)` through the `calorimetry-lab-model` event and `module.exports`. `labcheck.js` can use them directly (request the same event, as `lab.js` does). What is missing is a way to set up a question from outside, because the settings are read from the form controls. Add this to `lab.js` (before the final `resetCal()`), as `collision-carts/lab.js` does with `zsa-cc:request-lab`:

```js
document.querySelector('.thermo').addEventListener('zsa-cal:request-lab',e=>e.detail.receive({
  // s = {experiment: "metal" | "acid", metal: "0.385" | "0.897" | "0.449" (the Metal option value: copper, aluminum, iron),
  //      mass, hot, water, initial (metal runs), av, ac, bv, bc, initial (acid runs)}
  setup(s){
    $('experiment').value=s.experiment;$('experiment').onchange();   // shows the right fields and resets the run
    const set=(id,v)=>{$(id).value=v;$(id).dispatchEvent(new Event('input',{bubbles:true}));};
    if(s.experiment==='metal'){$('metal').value=s.metal;$('metal').dispatchEvent(new Event('change',{bubbles:true}));set('mass',s.mass);set('hot',s.hot);set('water',s.water);}
    else for(const k of ['av','ac','bv','bc'])set(k,s[k]);
    set('initial',s.initial);
    // resetCal() already ran through the input events, so no drop in progress is left over
  },
  format:{t2:v=>v.toFixed(2),t3:v=>v.toFixed(3)}   // the thermometer shows two decimals; the Measured temperatures table shows three
}));
```

The student then presses Place metal & start (or Mix solutions & start) and Go to final reading, and reads the thermometer or the Measured temperatures table. `format.t2` is `c.final.toFixed(2)` as the thermometer prints it; `format.t3` is the table's `toFixed(3)`. Use these for every choice so a choice always matches the screen. The "Set up the lab" button does not start the run.

## How the question numbers are filled in

Every number comes from `M.metal` and `M.neutral` (`model.js`), through `format`. Nothing is typed in. For a metal question, with `{m, cm, tm, w, tw}` from the setup: `final = M.metal(m, cm, tm, w, tw)`, water ΔT = `final - tw`, metal ΔT = `final - tm`, heat capacities `Cm = m * cm` and `Cw = w * 4.184` (the lab uses 4.184), and the shared energy `q = w * 4.184 * (final - tw)`. For the acid question, `M.neutral(av, ac, bv, bc, t)` returns `{n, q, final}`.

## The five questions

All wrong choices are different common mistakes, and all four options show different values in every question (checked: Q1 24.99, 56.00, 44.67, 90.00; Q2 -65.009, 65.009, 2.991, -2.991; Q3 5.730, 5.982, 2.991, 27.730; Q4 26.38, 30.22, 34.60, 17.62; Q5 21.39, 22.61, 22.00, 16.00). Use the lab's own minus (a hyphen from `toFixed`) in the labels, as it appears on the screen.

### 1. `balance`: Heated copper in water
- setup: `{experiment: "metal", metal: "0.385", mass: 50, hot: 90, water: 100, initial: 22}`
- question: "Press Place metal & start, then Go to final reading. What does the thermometer show?"
- choices (value, label, feedback key):
  - `right` `{right} °C` correct (= t2(final))
  - `average` `{average} °C` (= t2((tm + tw) / 2))
  - `massOnly` `{massOnly} °C` (= t2((m * tm + w * tw) / (m + w)))
  - `hot` `{hot} °C` (= t2(tm))
- feedback:
  - average: "That is the midpoint of the two starting temperatures. The water has a much larger heat capacity than the copper, so the final temperature is not halfway."
  - massOnly: "That weights by mass only. Heat capacity is mass times specific heat, and the specific heat of water is much larger than copper's."
  - hot: "The water cannot reach the metal's starting temperature. Both end at one final temperature that comes from the energy balance. Read the thermometer after the final reading."
- explanation: "The energy balance is q(metal) + q(water) = 0. The copper has a heat capacity of {Cm} J/°C and the water has {Cw} J/°C, so the final temperature is {right} °C, close to the water's starting {tw} °C."

### 2. `sign`: The sign of the temperature change
- setup: the same as question 1.
- question: "After the run, what is ΔT for the metal in the Measured temperatures table?"
- choices:
  - `right` `{right} °C` correct (= t3(final - tm))
  - `flip` `{flip} °C` (= t3(tm - final))
  - `water` `{water} °C` (= t3(final - tw), the water's row)
  - `negWater` `{negWater} °C` (= t3(tw - final))
- feedback:
  - flip: "ΔT is final minus initial. The metal cools, so its ΔT is negative."
  - water: "That is the water's ΔT. Read the Metal row of the Measured temperatures table."
  - negWater: "The two ΔT values are not equal and opposite. The energies are equal and opposite, not the temperature changes."
- explanation: "ΔT is final minus initial, so the cooling copper has ΔT = {final} - {tm} = {right} °C. The water warms by {water} °C. The energies are equal and opposite: q(water) = +{q} J and q(metal) = -{q} J."

### 3. `mass`: Double the metal mass
- setup: `{experiment: "metal", metal: "0.385", mass: 100, hot: 90, water: 100, initial: 22}`
- question: "After the run, what is ΔT for the water in the Measured temperatures table?"
- choices:
  - `right` `{right} °C` correct (= t3(final - tw) for 100 g)
  - `double` `{double} °C` (= t3(2 x (final for 50 g - tw)))
  - `same` `{same} °C` (= t3(final for 50 g - tw))
  - `final` `{final} °C` (= t3(final for 100 g), the Final column)
- feedback:
  - double: "Close, but not exactly double. The copper ends warmer, so each gram gives up less energy than before. Read the water's ΔT in the table."
  - same: "That is the ΔT with 50 g of copper. Check the metal mass in the setup. More copper gives up more energy."
  - final: "That is the final temperature, not the change. ΔT is final minus initial."
- explanation: "With 100 g of copper the water warms by {right} °C, not twice {same} = {double} °C. The copper ends warmer, at {final} °C, so it changes by less than before. Heat stops flowing when the temperatures match."

### 4. `acid`: Acid and base
- setup: `{experiment: "acid", av: 60, ac: 1, bv: 40, bc: 0.8, initial: 22}`
- question: "Press Mix solutions & start, then Go to final reading. What does the thermometer show?"
- choices:
  - `right` `{right} °C` correct (= t2(neutral(...).final))
  - `excess` `{excess} °C` (= t2(tw + max(nA, nB) x 57300 / ((av + bv) x 4.184)))
  - `sum` `{sum} °C` (= t2(tw + (nA + nB) x 57300 / ((av + bv) x 4.184)))
  - `sign` `{sign} °C` (= t2(tw - q / ((av + bv) x 4.184)))
- feedback:
  - excess: "That uses the moles of HCl, which is in excess. The limiting reactant sets how much H₂O forms. Compare the moles of HCl and NaOH."
  - sum: "That adds the moles of HCl and NaOH. Each H₂O needs one H⁺ and one OH⁻, so count the limiting reactant only."
  - sign: "The reaction releases energy into the solution, so the solution warms. It does not cool."
- slots: nA = av x ac / 1000 (0.060), nB = bv x bc / 1000 (0.032), n = neutral().n, qkJ = neutral().q / 1000, dT = right - tw, mass = av + bv.
- explanation: "HCl is {nA} mol and NaOH is {nB} mol, so NaOH limits. H₂O formed = {n} mol and q = {n} × 57.3 kJ = {qkJ} kJ. ΔT = {q} J / ({mass} g × 4.184 J/g·°C) = {dT} °C, so the solution warms to {right} °C."

### 5. `cold`: A metal colder than the water
- setup: `{experiment: "metal", metal: "0.449", mass: 50, hot: 10, water: 100, initial: 22}`
- question: "Press Place metal & start, then Go to final reading. What does the thermometer show?"
- choices:
  - `right` `{right} °C` correct (= t2(final))
  - `mirror` `{mirror} °C` (= t2(tw + (tw - final)), the water warms by the amount it should cool)
  - `same` `{same} °C` (= t2(tw))
  - `avg` `{avg} °C` (= t2((tm + tw) / 2))
- feedback:
  - mirror: "The metal is colder than the water, so heat flows from the water to the metal. The water cools, not warms."
  - same: "Heat flows until the metal and water reach the same temperature, so the water does change. Read the thermometer after the final reading."
  - avg: "That is the midpoint of 10 °C and 22 °C. The water has a much larger heat capacity, so the final temperature stays near 22 °C."
- explanation: "Heat flows from the warmer water to the cooler iron. The iron's heat capacity is {Cm} J/°C and the water's is {Cw} J/°C, so the final temperature is {right} °C. The water falls by only {dTw} °C and the iron warms by {dTm} °C."

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `calorimetry-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does.
- Spanish waits for the proofread. Leave the strings English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check" as in the other labs.

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices).
2. The right choice equals the formatted `M.metal` or `M.neutral` result for each setup, and (Playwright) after setup through `zsa-cal:request-lab`, Place metal & start (or Mix solutions & start) and Go to final reading, the right choice matches `#thermometer` (Q1, Q4, Q5) or the table cell (Q2 Metal row ΔT, Q3 Water row ΔT).
3. Registry: id 20 `CALC` decodes, the highest-id assertion in the Collision Carts test is updated, `maxItems` is 5.
4. No element id clash: `document.querySelectorAll('#zsa-cal-check').length === 1`, and `#check-answer` still has its own handler.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on the `file://` lab: set up the controls, press start, press Go to final reading, read `#thermometer` and `#cal-measurements`.

| Q | Setup | Thermometer | Water row (initial, final, ΔT) | Metal row (initial, final, ΔT) |
|---|---|---|---|---|
| 1, 2 | Cu 50 g at 90 °C, 100 g water at 22 °C | **24.99 °C** | 22.000, 24.991, 2.991 | 90.000, 24.991, **-65.009** |
| 3 | Cu 100 g at 90 °C, 100 g water at 22 °C | 27.73 °C | 22.000, 27.730, **5.730** | 90.000, 27.730, -62.270 |
| 4 | 60 mL 1.0 M HCl + 40 mL 0.8 M NaOH at 22 °C | **26.38 °C** | Solution: 22.000, 26.382, 4.382 | none |
| 5 | Fe 50 g at 10 °C, 100 g water at 22 °C | **21.39 °C** | 22.000, 21.389, -0.611 | 10.000, 21.389, 11.389 |

## Media (WordPress site 257744344)

`chem-calorimetry-lab-check.pdf` and `chem-calorimetry-lab-check-key.pdf`. The lab's existing worksheet is `chem-calorimetry-virtual-lab.pdf` (media 7683, key 7684), so these names match it.
