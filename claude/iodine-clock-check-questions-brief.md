# Iodine Clock Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `iodine-clock-lab/` (Iodine Clock Lab, version 1.1.4, activity slug `iodine-clock-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-iodine-clock-lab-check.pdf` (student sheet) and `chem-iodine-clock-lab-check-key.pdf` (answer key). Chemistry course, file prefix `chem-`.

**Determinism.** The lab has no random values. The clock time is `model.clockTime(volume, temperature)`, and the stopwatch always ends on exactly that value (`finish()` sets `elapsed = endTime`), so every answer is the same for a given setup on every run, at 1x or 4x speed. Pouring time is included in the stopwatch but does not change the final reading. The student should choose 4x speed to save time (the real wait is 16 s to 18 s per trial). A hidden browser tab pauses the clock, so the student must keep the lab tab visible.

## Registry entry (shared/zsa-codes.js)

- Prefix `IOLC` (ILC is reserved for Inclined Plane). Registry id **27**, slug `iodine-clock-lab`, setting "Lab check", name "Iodine Clock", maxItems 5.
- Entry, same shape as id 12:

```js
{id:27, prefix:"IOLC", slug:"iodine-clock-lab", setting:"Lab check", name:"Iodine Clock", maxItems:5,
  stats:[["dilution", "Diluting the stock"], ["half", "Less iodate, longer wait"], ["warm", "A warm bath"],
    ["ice", "An ice bath and mixing"], ["challenge", "Beat the 20-second clock"]],
  totals:[["dilution"], ["half"], ["warm"], ["ice"], ["challenge"]], items:[0, 1, 2, 3, 4]}
```

- Bump `zsa-version` to 1.2.0 (minor) in `iodine-clock-lab/index.html`, add the Lab check CSS, `../shared/zsa-codes.js`, `../shared/zsa-labcheck.js` and `labcheck.js` the way `collision-carts/index.html` does (all `?v=` strings to 1.2.0), and add `<div id="zsa-ic-check"></div>` as the mount. The lab CSP is `default-src 'self'`, which already allows these local files.
- **Id clash to avoid:** the lab has no id containing "check" and none starting with `zsa-ic`. Existing ids include `action`, `reset`, `stock`, `stock-out`, `conc-out`, `speed`, `pause`, `status`, `observation`, `stopwatch`, `thermometer-out`, `a-volume`, `a-temp`, `mix-volume`, `clock-state`, `phase`, `bench`. The mount `#zsa-ic-check` is new. The lab root for events is `.clock`.
- `README.md` says "No student data entry, storage, accounts, network requests, export, or completion codes." Reword it so only the Lab check issues a completion code. Add a changelog line for 1.2.0.

## The model is already separate; only a setup event is missing

`model.js` exposes `concentration(v)`, `mixtureTemperature(t)` and `clockTime(v, t)` through the `iodine-clock-model` event on `.clock` and `module.exports`. `labcheck.js` requests the same event, as `lab.js` does. What is missing is a way to set up a question from outside, because mode, volume and bath temperature are closure variables. Add this to `lab.js` (before the final `reset()`), as `collision-carts/lab.js` does with `zsa-cc:request-lab`. It only clicks the lab's own controls, so every path the student uses is exercised:

```js
document.querySelector('.clock').addEventListener('zsa-ic:request-lab', e => e.detail.receive({
 // s = {mode: "concentration" | "temperature" | "challenge", volume: stock mL (concentration and challenge only), temp: 5 | 22 | 45 (temperature only)}
 setup(s) {
  document.querySelector('[data-mode="' + s.mode + '"]').click();   // switches mode and calls reset(), even when the mode is already active
  $('speed').value = '1';
  if (s.mode !== 'temperature' && s.volume) { $('stock').value = s.volume; $('stock').dispatchEvent(new Event('input', {bubbles: true})); }
  if (s.mode === 'temperature' && s.temp) document.querySelector('[data-temp="' + s.temp + '"]').click();
 },
 format: {c4: v => v.toFixed(4), t1: v => v.toFixed(1), t2: v => v.toFixed(2)}   // conc-out, thermometer-out, stopwatch and status
}));
```

Notes: in temperature mode the volume is fixed at 4.0 mL by the lab (the volume controls are disabled). The "Set up the lab" button does not start the run. The student then presses Measure KIO₃, Add DI water, (Condition Solution A in temperature mode) and Add B & start clock, and reads the lab.

## How the question numbers are filled in

Every number comes from `model.js` through `format`, nothing typed in. `c4` is `conc-out`'s `toFixed(4)` (the lab prints a trailing " M"), `t1` is the thermometer's `toFixed(1)`, `t2` is the stopwatch's `toFixed(2)`. Let `base = clockTime(4, 22)` (32.00 s).

| slot | formula |
|---|---|
| Q1 right | `c4(concentration(2))` = 0.0125 |
| Q1 stock | `c4(concentration(16))` = 0.1000 (stock, nothing diluted) |
| Q1 mixed | `c4(concentration(2) * 16 / 22.4)` = 0.0089 (after adding B) |
| Q1 ratio | `c4(0.1 * 2 / 14)` = 0.0143 (stock to water ratio) |
| Q2 right | `t2(clockTime(2, 22))` = 64.00 |
| Q2 same | `t2(base)` = 32.00 |
| Q2 faster | `t2(base / 2)` = 16.00 |
| Q2 square | `t2(base * 4)` = 128.00 |
| Q3 right | `t2(clockTime(4, 45))` = 12.17 |
| Q3 same | `t2(base)` = 32.00 |
| Q3 rule | `t2(base / 2 ** ((45 - 22) / 10))` = 6.50 (doubles every 10 °C, applied without the mixing) |
| Q3 slower | `t2(base * base / clockTime(4, 45))` = 84.15 (warmer taken as slower) |
| Q4 right | `t1(mixtureTemperature(5))` = 9.9 |
| Q4 cold | `t1(5)` = 5.0 (Solution A only) |
| Q4 avg | `t1((5 + 22) / 2)` = 13.5 |
| Q4 swapped | `t1((6.4 * 5 + 16 * 22) / 22.4)` = 17.1 (volumes weighted the wrong way) |
| Q5 right | `t2(Math.abs(clockTime(8, 22) - 20))` = 4.00 with word "early" (time is below 20) |
| Q5 wrong sign | same number, word "late" |
| Q5 stopwatch | `t2(clockTime(8, 22))` = 16.00 |
| Q5 baseline | `t2(base - 20)` = 12.00 |

Slots for explanations: `Q2.t` = right, `Q3.mix` = `t1(mixtureTemperature(45))` = 38.4, `Q5.v` = `(base * 4 / 20).toFixed(1)` = 6.4 (`clockTime(6.4, 22)` is exactly 20).

## The five questions

All wrong choices are different common mistakes, and all four options show different values in every question. The Q5 status text is the lab's own "4.00 s early - adjust your next mixture." (the choice label is "4.00 s early", the student matches the start of the status line). Label format: Q1 `{x} M`, Q2 and Q3 `{x} s`, Q4 `{x} °C`, Q5 as shown.

### 1. `dilution`: Diluting the stock
- setup: `{mode: "concentration", volume: 2}`
- question: "Look at [KIO₃] in Solution A. What does the lab show?"
- choices: `right` 0.0125 M (correct); `stock` 0.1000 M; `mixed` 0.0089 M; `ratio` 0.0143 M
- feedback:
  - stock: "That is the stock, before any DI water. Solution A is made up to 16.0 mL, so the concentration is lower."
  - mixed: "That is the concentration after Solution B is added, but the readout is for Solution A before B. Read [KIO₃] in Solution A."
  - ratio: "That divides by the volume of water, 14.0 mL, instead of the total volume of Solution A, 16.0 mL. Use M₁V₁ = M₂V₂ with the final volume."
- explanation: "M₁V₁ = M₂V₂ gives (0.1000 M)(2.0 mL) / (16.0 mL) = {right} M. The same moles of KIO₃ are spread over 16.0 mL."

### 2. `half`: Less iodate, longer wait
- setup: `{mode: "concentration", volume: 2}`
- question: "Press Measure KIO₃, Add DI water, then Add B & start clock. What does the stopwatch show at the blue endpoint?"
- choices: `right` 64.00 s (correct); `same` 32.00 s; `faster` 16.00 s; `square` 128.00 s
- feedback:
  - same: "That is the time with 4.0 mL of stock. Check the volume you set. Less KIO₃ changes the time."
  - faster: "Less KIO₃ means a slower clock, not a faster one. Run the trial and read the stopwatch."
  - square: "The time is inversely proportional to the concentration, not to its square. Half the KIO₃ doubles the time, it does not quadruple it."
- explanation: "The time is inversely proportional to the KIO₃ concentration. 2.0 mL is half of 4.0 mL, so the time is twice {same} s, which is {right} s."

### 3. `warm`: A warm bath
- setup: `{mode: "temperature", temp: 45}`
- question: "Press Measure KIO₃, Add DI water, Condition Solution A, then Add B & start clock. What does the stopwatch show at the blue endpoint?"
- choices: `right` 12.17 s (correct); `same` 32.00 s; `rule` 6.50 s; `slower` 84.15 s
- feedback:
  - same: "That is the room-temperature time. Check that you pressed Warm bath and conditioned Solution A before mixing."
  - rule: "Solution B is added at 22 °C, so the mixture is much cooler than the 45 °C bath. A simple doubling rule for the whole 23 °C overestimates the speed. Read the stopwatch."
  - slower: "A warmer solution reacts faster, so the time gets shorter, not longer."
- explanation: "Solution A is conditioned at 45 °C, but Solution B starts at 22 °C, so the mixture starts at {mix} °C. That is still warmer than room temperature, so the clock is faster: {right} s instead of {same} s."

### 4. `ice`: An ice bath and mixing
- setup: `{mode: "temperature", temp: 5}`
- question: "Press Measure KIO₃, Add DI water, Condition Solution A, then Add B & start clock. When Solution B has been added, what does the thermometer show?"
- choices: `right` 9.9 °C (correct); `cold` 5.0 °C; `avg` 13.5 °C; `swapped` 17.1 °C
- feedback:
  - cold: "That is Solution A before mixing. Solution B is at 22 °C and warms the mixture. Read the thermometer after Add B."
  - avg: "That is the simple average of 5.0 and 22 °C. Solution A is 16.0 mL and Solution B is only 6.4 mL, so weight by volume."
  - swapped: "That weights the volumes the wrong way. The larger volume is the cold Solution A, so the mixture is closer to 5 °C."
- explanation: "T = [(16.0 mL)(5.0 °C) + (6.4 mL)(22 °C)] / (22.4 mL) = {right} °C. Most of the mixture is cold Solution A."

### 5. `challenge`: Beat the 20-second clock
- setup: `{mode: "challenge", volume: 8}`
- question: "Press Measure KIO₃, Add DI water, then Add B & start clock. How far from the 20.0 s target does the status line say the clock stopped?"
- choices: `right` 4.00 s early (correct); `late` 4.00 s late; `stopwatch` 16.00 s early; `baseline` 12.00 s early
- feedback:
  - late: "Check the stopwatch. If it stopped below 20 s, the clock was early, not late. More KIO₃ makes the clock faster."
  - stopwatch: "That is the stopwatch time. The status line gives the miss, which is the target minus the stopwatch."
  - baseline: "That compares with the 32 s time for 4.0 mL. Compare with the 20.0 s target."
- explanation: "More KIO₃ shortens the time. 8.0 mL stops the clock at {stopwatch} s, which is {right} early. Time × volume is constant (32.00 s × 4.0 mL), so for 20 s try {v} mL."

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `iodine-clock-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data` as Collision Carts does. The lab's existing `data.js` already holds the English and Spanish strings for the lab, so add the new block without touching them.
- Spanish waits for the proofread. English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check".

## Tests to add

1. Every choice value in every question is different (5 x 4).
2. The right choice equals the formatted model result for each setup, and (Playwright) after setup through `zsa-ic:request-lab`, running the steps with 4x speed, the right choice matches `#conc-out` (Q1), `#stopwatch` (Q2, Q3), `#thermometer-out` (Q4) and the status line (Q5).
3. Registry: id 27 `IOLC` decodes, maxItems is 5, ids 11 and 13 stay reserved.
4. `document.querySelectorAll('#zsa-ic-check').length === 1`, and the lab still works unchanged without the check (Measure, Add DI water, Add B).

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on the `file://` lab, 4x speed, driving the buttons as a student would.

| Q | Setup | Reading |
|---|---|---|
| 1 | 2.0 mL preset | `#conc-out` **0.0125 M** |
| 2 | 2.0 mL preset | stopwatch **64.00** (obs: "Clock stopped at 64.00 s.") |
| 3 | Warm bath 45 °C | thermometer after mixing 38.4 °C, stopwatch **12.17** |
| 4 | Ice bath 5 °C | thermometer after adding B **9.9 °C** (also 70.29 s stopwatch) |
| 5 | Challenge, 8.0 mL | stopwatch 16.00, status **"4.00 s early - adjust your next mixture."** |

## Media (WordPress site 257744344)

`chem-iodine-clock-lab-check.pdf` and `chem-iodine-clock-lab-check-key.pdf`. The lab's worksheet is `chem-iodine-clock-virtual-lab.pdf` (media 7699, key 7700), so these names match it.
