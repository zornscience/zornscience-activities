# Faraday Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `faraday-lab/` (Faraday’s Law: Magnet Drop, version 1.2.3, activity slug `faraday-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `phys-faraday-lab-check.pdf` (student sheet) and `phys-faraday-lab-check-key.pdf` (answer key).

## Registry entry (shared/zsa-codes.js)

- Prefix `FLC` (initial plus LC). Not taken, and not the start of another prefix.
- Registry id **19** (ids 11 and 13 stay reserved for Inclined Plane and Projectile; 12 CLC, 14 SLC, 15 STLC, 16 PHLC, 17 CILC and 18 ELC are used).
- Entry, same shape as id 12:

```js
{id:19, prefix:"FLC", slug:"faraday-lab", setting:"Lab check", name:"Faraday’s Law: Magnet Drop", maxItems:5,
  stats:[["plastic", "Plastic tube"], ["copper", "Copper tube"], ["slot", "Slotted copper tube"],
    ["strong", "A stronger magnet"], ["poles", "Reverse the poles"]],
  totals:[["plastic"], ["copper"], ["slot"], ["strong"], ["poles"]], items:[0, 1, 2, 3, 4]}
```

- The Collision Carts test that asserts the highest id is 12 must be fixed first (see the Projectile brief).
- Bump `zsa-version` to 1.3.0 in `faraday-lab/index.html`, add `physics.js`, `labcheck.js` and the shared Lab check files the way `collision-carts/index.html` does, and add `<div id="zsa-fl-check"></div>` as the mount. No existing element uses `zsa-fl-check`. The lab’s ids are `material`, `strength`, `flip`, `release`, `pause`, `reset`, `slow`, `replay`, `replay-time`, `state`, `observation`, `challenge`, `try-slot`, `try-poles` and so on; do not reuse `#observation` or `#challenge` for the check.

## The lab has no physics.js and no way to set up a question from outside

All the physics is inside `lab.js` (`dragAt`, `integrate`, `prepareReplay`), and the settings are read from the controls. Two changes:

1. **Add `faraday-lab/physics.js`** (loaded before `lab.js`, global `FaradayModel`, `module.exports` for tests) and move the model into it so there is one copy. `lab.js` then calls it:

```js
(function () {
  "use strict";
  const g = 9.81, end = 1.13, dt = 0.002;
  const K = {copper: 34, slotted: 0.65, plastic: 0};   // s^-1 at strength 1.0
  // drag coefficient at depth pos (m) for a tube material and a magnet strength (0.5 to 1.5)
  function dragAt(material, strength, pos) { return K[material] * strength ** 2 * Math.max(0, Math.min(1, (pos + 0.025) / 0.07, (1.025 - pos) / 0.07)); }
  function integrate(material, strength, state, h) { /* the body of integrate() in lab.js, with dragAt(material, strength, pos) */ }
  // The Replay readout's total: the time until both the tube magnet and the free-fall magnet are caught.
  function fallTime(material, strength) {
    let state = [0, 0, 0, 0], n = 0;
    for (let i = 1; i < 12000; i++) { state = integrate(material, strength, state, dt); n = i; if (state[0] === end && state[2] === end) break; }
    return n * dt;
  }
  const api = {dragAt, integrate, fallTime};
  if (typeof module === "object" && module.exports) module.exports = api; else self.FaradayModel = api;
}());
```

   `prepareReplay()` in `lab.js` must produce the same frames and the same `duration` as `fallTime` (a test below checks this). Poles do not enter the drag, which is why reversing them leaves the time unchanged.

2. **Add one event to `lab.js`** (near the end, before `reset()`), as `collision-carts/lab.js` does with `zsa-cc:request-lab`:

```js
root.addEventListener('zsa-fl:request-lab',e=>e.detail.receive({
  // s = {material: "plastic" | "copper" | "slotted", strength: 0.5 to 1.5 in steps of 0.1, poles: "N" | "S" (the pole pointing down)}
  setup(s){
    $('material').value=s.material;$('material').onchange();
    $('strength').value=s.strength;$('strength').oninput();
    if((north===1)!==(s.poles==='N'))$('flip').click();
    reset();   // clears any drop in progress; the lab stays in Observe view
  },
  format:t=>t.toFixed(2)   // the same expression the Replay readout uses
}));
```

Notes:
- `material.onchange` and `strength.oninput` already reset the drop. Pole reversal is `flip.click()`.
- The Replay readout is `clock.toFixed(2) + ' s / ' + duration.toFixed(2) + ' s'`. After Release magnets the second number is the total time, shown immediately. Use `format` for every choice so a choice always matches the screen.

## How the question numbers are filled in

Every number is `FaradayModel.fallTime(material, strength)` through `format`. Slots used below:

| slot | meaning | value (checked) |
|---|---|---|
| `free` | fallTime("plastic", 1), the free-fall time | 0.48 |
| `cu` | fallTime("copper", 1) | 3.55 |
| `sl` | fallTime("slotted", 1) | 0.50 |
| `st` | fallTime("copper", 1.5) | 7.76 |
| `wk` | fallTime("copper", 0.5) | 1.05 |
| `double` | 2 x cu | 7.09 |
| `half` | cu / 2 | 1.77 |
| `mid` | (free + cu) / 2 | 2.01 |
| `lin` | 1.5 x cu | 5.32 |

Compute the derived slots from the unrounded values and format them last.

## The five questions

All wrong choices are different common mistakes, and all four options show different values in every question (checked: Q1 0.48, 3.55, 0.50, 1.05; Q2 3.55, 0.48, 7.09, 1.77; Q3 0.50, 3.55, 0.48, 2.01; Q4 7.76, 3.55, 5.32, 1.05; Q5 3.55, 0.48, 7.09, 1.05). Every question asks for the total time in the Replay readout after Release magnets.

### 1. `plastic`: Plastic tube
- setup: `{material: "plastic", strength: 1, poles: "N"}`
- question: "Press Release magnets. After you release, what total time does the Replay readout show?"
- choices (value, label, feedback key):
  - `right` `{free} s` correct
  - `copper` `{cu} s`
  - `slot` `{sl} s`
  - `weak` `{wk} s`
- feedback:
  - copper: "That is the time for the intact copper tube. A magnet’s field alone does not brake it. Check the tube material in the setup."
  - slot: "That is the time for the slotted copper tube. Plastic cannot carry any current, so nothing brakes the magnet. Check the tube material in the setup."
  - weak: "That is what copper gives with the weakest magnet. Plastic is an insulator, so the magnet strength does not matter. Read the Replay readout after you release."
- explanation: "Plastic is an insulator, so no eddy currents flow and nothing brakes the magnet. Both magnets fall freely and the total time is {right} s. The intact copper tube takes {cu} s."

### 2. `copper`: Copper tube
- setup: `{material: "copper", strength: 1, poles: "N"}`
- question: "Press Release magnets. What total time does the Replay readout show?"
- choices:
  - `right` `{cu} s` correct
  - `free` `{free} s`
  - `double` `{double} s`
  - `half` `{half} s`
- feedback:
  - free: "Copper is not magnetic, but it is a conductor. Eddy currents in the copper brake the magnet. Release the magnets and read the Replay readout."
  - double: "There is one current loop above the magnet and one below it, but that does not double the time. Read the total time in the Replay readout."
  - half: "The braking acts along the whole tube, not just at the ends. Read the total time in the Replay readout."
- explanation: "The falling magnet changes the flux through the copper and drives eddy currents. Their magnetic field opposes the change, so the force on the magnet points up and nearly balances its weight. The drop takes {right} s instead of the free-fall {free} s."

### 3. `slot`: Slotted copper tube
- setup: `{material: "slotted", strength: 1, poles: "N"}`
- question: "Press Release magnets. What total time does the Replay readout show?"
- choices:
  - `right` `{sl} s` correct
  - `copper` `{cu} s`
  - `free` `{free} s`
  - `mid` `{mid} s`
- feedback:
  - copper: "That is the intact copper tube. The slot breaks the large current loops, so the braking is much weaker. Check the tube in the setup."
  - free: "That is the free-fall time. Small local currents still flow in the slotted tube, so the magnet lands a little later. Compare to two decimals."
  - mid: "The slot does much more than cut the braking in half. Read the total time in the Replay readout."
- explanation: "The slot breaks the large circular current paths, so only small local currents remain. The braking is weak: the total time is {right} s, just above the free-fall {free} s and far below the intact copper tube’s {cu} s."

### 4. `strong`: A stronger magnet
- setup: `{material: "copper", strength: 1.5, poles: "N"}`
- question: "Press Release magnets. What total time does the Replay readout show?"
- choices:
  - `right` `{st} s` correct
  - `same` `{cu} s`
  - `linear` `{lin} s`
  - `weak` `{wk} s`
- feedback:
  - same: "That is the time at strength 1.0×. Check the strength in the setup. A stronger magnet drives larger eddy currents."
  - linear: "The braking grows with the square of the strength, not in step with it. Read the total time in the Replay readout."
  - weak: "That is the time at the weakest setting, 0.5×. A stronger magnet is braked more, not less."
- explanation: "In the lab the braking grows with the square of the magnet strength, 1.5² = 2.25 times as much as at 1.0×. The terminal speed is lower, so the drop takes {right} s instead of {cu} s."

### 5. `poles`: Reverse the poles
- setup: `{material: "copper", strength: 1, poles: "S"}`
- question: "Press Release magnets. What total time does the Replay readout show with the poles reversed?"
- choices:
  - `right` `{cu} s` correct
  - `free` `{free} s`
  - `double` `{double} s`
  - `weak` `{wk} s`
- feedback:
  - free: "Reversing the poles reverses the current and the induced field, but the force still opposes the fall. The braking does not disappear."
  - double: "Reversing the poles does not double the braking. It only reverses the directions of the current and the field."
  - weak: "That is the time with the weakest magnet. Reversing the poles does not change how strong the braking is."
- explanation: "Reversing the poles reverses the eddy current and the induced field, but the force still points up, against the fall. The drop takes {right} s, the same as with N down."

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `faraday-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does.
- Spanish waits for the proofread. Leave the strings English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check" as in the other labs.

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices).
2. `FaradayModel.fallTime("plastic", 1)`, `("copper", 1)`, `("slotted", 1)`, `("copper", 1.5)` and `("copper", 0.5)` give 0.48, 3.55, 0.50, 7.76 and 1.05 to two decimals.
3. In Playwright, set up each question through `zsa-fl:request-lab`, press Release magnets, and compare the second number in `#replay-time` with the right choice. Also check that setting poles to "S" gives the same total as "N".
4. `prepareReplay()` in `lab.js` and `fallTime` agree for all three materials at strengths 0.5, 1 and 1.5.
5. Registry: id 19 `FLC` decodes, the highest-id assertion in the Collision Carts test is updated, `maxItems` is 5.
6. No element id clash: `document.querySelectorAll('#zsa-fl-check').length === 1`.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on the `file://` lab: set the tube, strength and poles, press Release magnets, read `#replay-time` ("0.00 s / total s").

| Setup | Replay readout |
|---|---|
| plastic, 1.0×, N down | 0.00 s / **0.48 s** |
| copper, 1.0×, N down | 0.00 s / **3.55 s** |
| slotted, 1.0×, N down | 0.00 s / **0.50 s** |
| copper, 1.5×, N down | 0.00 s / **7.76 s** |
| copper, 1.0×, S down | 0.00 s / **3.55 s** |
| copper, 0.5×, N down (used only as a wrong choice) | 0.00 s / 1.05 s |

## Media (WordPress site 257744344)

`phys-faraday-lab-check.pdf` and `phys-faraday-lab-check-key.pdf`. The lab’s existing worksheet is `phys-faraday-virtual-lab.pdf` (media 7717, key 7718), so these names match it.
