# Equipotential Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `equipotential-lab/` (version 1.2.3, activity slug `equipotential-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `phys-equipotential-lab-check.pdf` (student sheet) and `phys-equipotential-lab-check-key.pdf` (answer key).

## Registry entry (shared/zsa-codes.js)

- Prefix `ELC` (initial plus LC). Not taken, and not the start of another prefix. Later E labs (Electrochemistry, Equilibrium Sandbox) need two letters, for example `ELLC` and `EQLC`; check the list again then.
- Registry id **18** (ids 11 and 13 stay reserved for Inclined Plane and Projectile; 12 CLC, 14 SLC, 15 STLC, 16 PHLC and 17 CILC are used).
- Entry, same shape as id 12:

```js
{id:18, prefix:"ELC", slug:"equipotential-lab", setting:"Lab check", name:"Equipotential & Electric Field Mapping", maxItems:5,
  stats:[["closer", "Closer to a charge"], ["field", "The field weakens faster"], ["dipole", "Zero voltage, but not zero field"],
    ["like", "Zero field, but not zero voltage"], ["around", "Around a charge"]],
  totals:[["closer"], ["field"], ["dipole"], ["like"], ["around"]], items:[0, 1, 2, 3, 4]}
```

- The Collision Carts test that asserts the highest id is 12 must be fixed first (see the Projectile brief).
- Bump `zsa-version` to 1.3.0 in `equipotential-lab/index.html`, add `labcheck.js` and the shared Lab check files the way `collision-carts/index.html` does, and add `<div id="zsa-eq-check"></div>` as the mount. No existing element uses `zsa-eq-check` (the lab's ids are `investigation`, `preset`, `probe`, `voltage`, `field-value`, `position` and so on, and none start with `zsa-eq`). Do not reuse `#question`, `#reveal` or `#explanation`: those belong to the Explore a question panel.

## The lab has no way to set up a question from outside: add one event

`lab.js` keeps `charges`, `probe`, `load()` and `schedule()` inside its own closure, so the check cannot place the probe. Add this near the end of `lab.js` (after `load('dipole')`), as `collision-carts/lab.js` does with `zsa-cc:request-lab`:

```js
const root=document.querySelector('[data-zsa-activity="equipotential-lab"]');
root.addEventListener('zsa-eq:request-lab',e=>e.detail.receive({
  // s = {preset: "single" | "like" | "dipole", probe: {x, y}} with x and y exactly as the position readout shows them
  // (centimeters, y measured up from the bottom). The lab stores y downward, so the stored y is 40 - y.
  setup(s){freeInquiry();$('preset').value=s.preset;load(s.preset);probe={x:s.probe.x,y:40-s.probe.y};schedule(true);announce(tr('Lab set up for the question.'));},
  format:{voltage:v=>(Math.abs(v)<.005?0:v).toFixed(2),field:f=>f.toFixed(1)}
}));
```

Notes:
- `format` must be the same expressions the readouts use (`$('voltage').value` and the `Electric field: {e} V/m` text), so a choice always matches the screen. Better still, make `updatePositions()` call these two functions so there is one copy.
- `freeInquiry()` sets Explore a question back to Free exploration and hides its panel.
- The overlay checkboxes (equipotential lines, field arrows) are left as the student has them. None of the answers depends on them.
- `FieldModel` (`model.js`) is a global, so `labcheck.js` can call `FieldModel.sample(FieldModel.preset(name), x, y)` directly. It returns `{v, ex, ey, near}` in volts and volts per meter. The field readout is `Math.hypot(ex, ey)`.

## How the question numbers are filled in

Every number comes from `FieldModel.sample` and the two formatters. Nothing is typed in. For each question, `labcheck.js` builds a slot table (as `collision-carts/labcheck.js` does) and fills the `{braces}`. Helper: `V(preset, x, y)` is `sample(preset(name), x, y).v` formatted with `format.voltage`, and `E(preset, x, y)` is `Math.hypot(ex, ey)` formatted with `format.field`. Single-charge sums use `FieldModel.sample` on a one-charge list too, so no constant such as k is copied.

Students move the probe with the arrow keys (0.5 cm per press, 2 cm with Shift). Every target is reached with whole presses.

## The five questions

All wrong choices are different common mistakes, and all four options show different values in every question. The values below were read on the live lab (headless Chromium, `file://`, keyboard-moved probe) and match `FieldModel`.

### 1. `closer`: Closer to a charge
- setup: `{preset: "single", probe: {x: 50, y: 20}}` (charge +0.10 nC at x 30, y 20; probe 20 cm away, reads 4.49 V)
- question: "Press Shift + Left 5 times to move the probe to x = 40.0 cm. What does the voltmeter read?"
- choices (value, label, feedback key):
  - `right`  `{right} V` = **8.99 V**, correct
  - `squared` `{squared} V` = 17.98 V
  - `falls` `{falls} V` = 2.25 V
  - `same` `{same} V` = 4.49 V
- slots: right = V(single, 40, 20); squared = 4 x V(single, 50, 20); falls = V(single, 50, 20) / 2; same = V(single, 50, 20); start = V(single, 50, 20)
- feedback:
  - squared: "Voltage depends on 1/r, not 1/r². The 1/r² rule is for the field. Halving the distance doubles the voltage."
  - falls: "Closer to a positive charge means a higher voltage, not a lower one. Compare the voltmeter before and after you move the probe."
  - same: "That is the reading at the start. Move the probe first, then read the voltmeter again."
- explanation: "Voltage from a point charge depends on 1/r. At 20 cm the voltmeter reads {start} V. At 10 cm it reads {right} V, twice as much."

### 2. `field`: The field weakens faster
- setup: `{preset: "single", probe: {x: 40, y: 20}}` (probe 10 cm away, field 89.9 V/m)
- question: "Press Shift + Right 5 times to move the probe to x = 50.0 cm. What does the electric field readout show?"
- choices:
  - `right` `{right} V/m` = **22.5 V/m**, correct
  - `half` `{half} V/m` = 44.9 V/m
  - `same` `{same} V/m` = 89.9 V/m
  - `grows` `{grows} V/m` = 359.5 V/m
- slots: right = E(single, 50, 20); half = E(single, 40, 20) / 2; same = E(single, 40, 20); grows = 4 x E(single, 40, 20); vNear = V(single, 40, 20); vFar = V(single, 50, 20)
- feedback:
  - half: "That would be right if the field depended on 1/r. It depends on 1/r², so doubling the distance does more than halve it."
  - same: "That is the reading at the start. Move the probe to x = 50.0 cm first, then read the Electric field line."
  - grows: "The field gets weaker as you move away from a charge. Check whether your reading went up or down."
- explanation: "The field depends on 1/r². Doubling the distance cuts it to one quarter, from {same} V/m to {right} V/m. The voltage only falls to half, from {vNear} V to {vFar} V."

### 3. `dipole`: Zero voltage, but not zero field
- setup: `{preset: "dipole", probe: {x: 30, y: 12}}` (+0.10 nC at x 20, -0.10 nC at x 40, both y 20)
- question: "Press Shift + Up 4 times to move the probe to the midpoint, x = 30.0 cm, y = 20.0 cm. What does the electric field readout show?"
- choices:
  - `right` `{right} V/m` = **179.8 V/m**, correct
  - `zero` `{zero} V/m` = 0.0 V/m
  - `one` `{one} V/m` = 89.9 V/m
  - `volt` `{volt} V/m` = 8.99 V/m
- slots: right = E(dipole, 30, 20); zero = format.field(0); one = E(single, 40, 20) (one charge 10 cm away); volt = V(single, 40, 20); v = V(dipole, 30, 20) (reads 0.00)
- feedback:
  - zero: "The voltage is zero at the midpoint, but the field is not. Voltage and field are different quantities. Read the Electric field line."
  - one: "That is the field from one charge. The other charge adds to it, because both fields point from + toward −."
  - volt: "That number is the voltage one charge makes at the midpoint. The field is a different quantity. Read the Electric field line."
- explanation: "The two voltages cancel, +{volt} V and −{volt} V, so the voltmeter reads {v} V. The fields do not cancel. Both point from + toward −, so they add: {one} + {one} = {right} V/m."

### 4. `like`: Zero field, but not zero voltage
- setup: `{preset: "like", probe: {x: 30, y: 12}}` (+0.10 nC at x 20 and x 40, both y 20)
- question: "Press Shift + Up 4 times to move the probe to the midpoint, x = 30.0 cm, y = 20.0 cm. What does the voltmeter read?"
- choices:
  - `right` `{right} V` = **17.98 V**, correct
  - `zero` `{zero} V` = 0.00 V
  - `one` `{one} V` = 8.99 V
  - `twenty` `{twenty} V` = 4.49 V
- slots: right = V(like, 30, 20); zero = format.voltage(0); one = V(single, 40, 20); twenty = V(single, 50, 20) (distance 20 cm, the charge spacing); e = E(like, 30, 20) (reads 0.0)
- feedback:
  - zero: "The field is zero at the midpoint, but the voltage is not. Both charges are positive, so their voltages add."
  - one: "That is the voltage from one charge. The other charge adds to it."
  - twenty: "That uses 20 cm, the distance between the charges. Each charge is only 10 cm from the midpoint."
- explanation: "The fields are equal and opposite, so the field readout is {e} V/m. Voltage has no direction. Each charge adds {one} V, so the total is {right} V."

### 5. `around`: Around a charge
- setup: `{preset: "single", probe: {x: 44, y: 20}}` (14 cm from the charge, reads 6.42 V)
- question: "Press Shift + Left 7 times and Shift + Up 7 times to move the probe to x = 30.0 cm, y = 34.0 cm. What does the voltmeter read?"
- choices:
  - `right` `{right} V` = **6.42 V**, correct
  - `zero` `{zero} V` = 0.00 V
  - `path` `{path} V` = 3.21 V
  - `straight` `{straight} V` = 4.54 V
- slots: right = V(single, 30, 6) (14 cm above the charge; it equals V(single, 44, 20)); zero = format.voltage(0); path = Vr(28); straight = Vr(Math.hypot(14, 14)); d = 14
- feedback:
  - zero: "Voltage does not depend on the direction from the charge. Read the voltmeter at the new position."
  - path: "That uses the 28 cm the probe traveled. Voltage depends on the distance from the charge, not on the path."
  - straight: "That uses the straight line between the two probe positions. Use the distance from the probe to the charge."
- explanation: "Both points are {d} cm from the charge, and voltage depends only on that distance, so the voltmeter still reads {right} V. All points {d} cm from a single charge are on one equipotential circle."

`Vr(r)` is the voltage a 0.10 nC charge makes at distance r cm: `FieldModel.sample([{x: 0, y: 0, q: 0.1}], r, 0).v` through `format.voltage` (the model does not clamp positions). Check in the test that all four Q5 values differ (6.42, 0.00, 3.21, 4.54).

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `equipotential-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does.
- Spanish waits for the proofread. Leave the strings English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check" as in the other labs.

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices).
2. The right choice equals the formatted `FieldModel.sample` reading at the target point for each question, and for Q1 to Q4 matches the readouts read in a browser (Playwright, set up through `zsa-eq:request-lab`, move the probe with the keys in the question text, compare with `#voltage` and `#field-value`).
3. Registry: id 18 `ELC` decodes, the highest-id assertion in the Collision Carts test is updated, `maxItems` is 5.
4. No element id clash: `document.querySelectorAll('#zsa-eq-check').length === 1`.

## Verified readouts (live lab, Nov 21, 2026)

| Q | Start readout | Target | Voltage | Field |
|---|---|---|---|---|
| 1 | probe 50, 20 | 40, 20 | 4.49 to **8.99 V** | 22.5 to 89.9 V/m |
| 2 | probe 40, 20 | 50, 20 | 8.99 to 4.49 V | 89.9 to **22.5 V/m** |
| 3 | dipole, 30, 12 | 30, 20 | 0.00 V | **179.8 V/m** |
| 4 | like, 30, 12 | 30, 20 | **17.98 V** | 0.0 V/m |
| 5 | probe 44, 20 | 30, 34 | 6.42 to **6.42 V** | 45.9 V/m both |

## Media (WordPress site 257744344)

`phys-equipotential-lab-check.pdf` and `phys-equipotential-lab-check-key.pdf`. The lab's existing worksheet is `phys-equipotential-lab.pdf` (media 4606, key 4607), so these names match it.
