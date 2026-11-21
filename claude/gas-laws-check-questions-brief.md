# Gas Laws Sandbox Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `gas-laws/` (Gas Laws Sandbox, version 1.1.2, activity slug `gas-laws`). Do not confuse it with the AP Gas Laws and KMT Lab (`gas-lab`, which already has its own Lab check, `apchem-gas-kmt-lab-check.pdf`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-gas-laws-lab-check.pdf` (student sheet) and `chem-gas-laws-lab-check-key.pdf` (answer key). Chemistry course, file prefix `chem-`. The lab's worksheet is `chem-gas-laws-virtual-lab.pdf` (media 7695, key 7696), so these names match it.

**What the lab shows.** Four readouts under the particle model (`#readouts`, one `<div class="reading">` per variable with `<dt>` "P (atm)", "V (L)", "T (K)", "n (mol)" and `<dd>` the value to 3 significant figures, `Number.toPrecision(3)`). Also `#balance` ("PV = 22.4 L·atm | nRT = 22.4 L·atm") and, under the T box, the temperature in °C (`#hint-T`, for example "99.85 °C"). Four laws (`#law` select) lock two variables; the two other number boxes (`#number-P`, `#number-V`, `#number-T`, `#number-n`) take a typed value and Enter.

**Determinism (nothing random touches a readout).** `Math.random()` is used only in `syncDots()` for the starting position and direction of the decorative particles, and the animation runs on `requestAnimationFrame`. Neither feeds P, V, T or n (state is set only by `change()`, `reset()` and the setup event, all pure `PV = nRT` math). So no seed or quiet flag is needed; the sandbox readouts are the same every time. The setup event sets the law and the state directly, so it does not depend on whether motion is paused. The sheet note tells students the moving particles are only a picture. Verified on the live lab, every setup and typed value run twice, identical readouts (table below).

## Registry entry (shared/zsa-codes.js)

- Prefix `GALC` (first two letters of Gas Laws plus LC, because `GLC` is the Gas Lab and `GAS` is an older code). Confirmed: existing prefixes are ICT, IFB, GAS, PTR, LVB, LVA, GLC, ALC, PLC, HLC, CLC plus FLC, CALC, FLLC, EKLC, ELC, ELLC, EQLC, FRLC, GRLC, IOLC, MLC, NLC, PBLC, RLC, BLC, CHLC from the other briefs. None is a prefix of `GALC` and `GALC` starts none of them.
- Registry id: to be assigned (none left, awaiting the code-format decision). Use `id: <next id>` as a placeholder below.
- Entry, same shape as id 12:

```js
{id:<next id>, prefix:"GALC", slug:"gas-laws", setting:"Lab check", name:"Gas Laws Sandbox", maxItems:5,
  stats:[["boyle", "Boyle's law"], ["kelvin", "Charles's law and kelvin"], ["gaylussac", "Gay-Lussac's law"],
    ["avogadro", "Avogadro's law"], ["combined", "Two changes in a row"]],
  totals:[["boyle"], ["kelvin"], ["gaylussac"], ["avogadro"], ["combined"]], items:[0, 1, 2, 3, 4]}
```

- Bump `zsa-version` from 1.1.2 to 1.2.0 (minor) in `gas-laws/index.html`, change every `?v=1.1.2` to `?v=1.2.0`, add the Lab check CSS, `../shared/zsa-codes.js`, `../shared/zsa-labcheck.js`, `model.js` (before `activity.js`) and `labcheck.js` the way `collision-carts/index.html` does, and add the mount `<div id="zsa-gs-check"></div>` (inside `<main>`, after the `.below` block). Add a changelog line to `README.md`. Run `node tools/build-seo.js` only if the version needs it. The lab keeps its standard self-only CSP (all new files are local).
- **Id and event clash check.** The lab's ids are `law`, `reset`, `model-heading`, `pause`, `particles`, `particle-note`, `readouts`, `controls-heading`, `controls`, `error`, `graph-heading`, `graph`, `graph-title`, `graph-desc`, `graph-summary`, `law-heading`, `relation`, `explanation`, `balance`, `status`, `zsa-about-heading`, `zsa-about-lessons`, plus generated `label-X`, `badge-X`, `range-X`, `number-X`, `hint-X` (X = P, V, T, n). None contains "check" and none starts `zsa-gs`. A search of the repo finds no `zsa-gs` id or event (the Gas Lab uses `zsa-gl-` classes, which is a different prefix). So the mount is **`#zsa-gs-check`** and the event is **`zsa-gs:request-lab`**. The lab's existing events are `zsa:request-data` and `zsa:request-i18n`. Careful: the Reset button is `#reset`; the Lab check must not reuse it.
- `README.md` has no "completion code" wording; add that only the Lab check issues a completion code.

## The model is inside activity.js; extract it and add a setup event

The model is closure code in `activity.js` (`R = 0.0821`, `STANDARD`, `solve(s, k)`, `fmt`). Two changes:

1. **Add `gas-laws/model.js`** (loaded before `activity.js`, global `GasModel`, `module.exports` for tests) and move the constants and `solve` out of `activity.js`, so there is one copy:

```js
(function () {
  "use strict";
  const R = 0.0821, STANDARD = {P: 1, V: R * 273, n: 1, T: 273};
  function solve(s, k) {
    if (k === "P") return s.n * R * s.T / s.V;
    if (k === "V") return s.n * R * s.T / s.P;
    if (k === "T") return s.P * s.V / (s.n * R);
    return s.P * s.V / (R * s.T);
  }
  const api = {R: R, STANDARD: STANDARD, solve: solve, fmt: function (v) { return Number(v).toPrecision(3); }};
  if (typeof module === "object" && module.exports) module.exports = api; else self.GasModel = api;
}());
```

   In `activity.js` replace the `const R=..., STANDARD=...` line and `solve` with `const {R, STANDARD, solve} = GasModel;` and keep `fmt` as is (or use `GasModel.fmt`). **Test impact:** `tests/unit/gas-laws.test.js` runs `activity.js` text in a `vm` context; load `model.js` into that context first (`vm.runInContext(modelSource, context)` then `const {R, STANDARD, solve} = GasModel;` is already in the activity text), and update the static test that lists the page scripts.

2. **Add one event to `activity.js`**, just before the final `render();requestAnimationFrame(frame);` (after `makeControls();`). Tested on a copy:

```js
root.addEventListener("zsa-gs:request-lab", function (e) {
  e.detail.receive({
    // s = {law: "boyle" | "charles" | "gay" | "avogadro", P, T, n}: the starting state. V is solved from PV = nRT.
    setup: function (s) {
      mode = s.law; $("law").value = mode;
      const st = {P: s.P, T: s.T, n: s.n}; st.V = solve(st, "V"); state = st;
      $("error").textContent = ""; render();
    },
    // the text as the page prints it (the readouts, 3 significant figures)
    format: {sig3: function (v) { return Number(v).toPrecision(3); }}
  });
});
```

   The "Set up the lab" button therefore also undoes any earlier typed values. It does not touch the paused state or the particles. In the Spanish lab the English labels are used only for the English check (Spanish waits for the proofread).

The student then follows the question using the lab's own boxes: type a value into a number box, press Enter, and read the readouts.

## How the question numbers are filled in

Every label comes from `GasModel.solve` through `format.sig3`. Nothing is typed in. `v = GasModel.solve`, `f = format.sig3`, `V0 = STANDARD.V` (22.4133 L, shown as 22.4).

| slot | formula | value |
|---|---|---|
| Q1 right | `f(v({P:4,T:273,n:1},"V"))` | 5.60 |
| Q1 mult | `f(V0 * 4)` | 89.7 |
| Q1 sub | `f(V0 - 4)` | 18.4 |
| Q1 same | `f(V0)` | 22.4 |
| Q2 right | `f(v({P:1,T:373,n:1},"V"))` | 30.6 |
| Q2 celsius | `f(v({P:1,T:100,n:1},"V"))` | 8.21 |
| Q2 same | `f(V0)` | 22.4 |
| Q2 inverse | `f(V0 * 273 / 373)` | 16.4 |
| Q3 right | `f(v({V:V0,T:410,n:1},"P"))` | 1.50 |
| Q3 inverse | `f(273 / 410)` | 0.666 |
| Q3 same | `f(1)` | 1.00 |
| Q3 volume | `f(V0)` | 22.4 |
| Q4 right | `f(v({P:1,T:273,n:2.5},"V"))` | 56.0 |
| Q4 inverse | `f(V0 / 2.5)` | 8.97 |
| Q4 same | `f(V0)` | 22.4 |
| Q4 add | `f(V0 + 2.5)` | 24.9 |
| Q5 right | `f(v({P:2,T:410,n:1},"V"))` | 16.8 |
| Q5 same | `f(v({P:2,T:273,n:1},"V"))` | 11.2 |
| Q5 inverse | `f(v({P:2,T:273,n:1},"V") * 273 / 410)` | 7.46 |
| Q5 onebar | `f(v({P:1,T:410,n:1},"V"))` | 33.7 |

Explanation slots: Q1 `{p}` 4.00, `{right}`; Q2 `{c}` = f(373 - 273) is not needed (use the text 100 + 273 = 373); Q3 `{right}`; Q4 `{right}`; Q5 `{p0}` 11.2 (the starting V), `{right}`, `{onebar}`.

## The five questions

All wrong choices are different common mistakes, and all four options differ in every question (checked in the table above).

### 1. `boyle`: Boyle's law
- setup: `{law: "boyle", P: 1, T: 273, n: 1}` (P 1.00 atm, V 22.4 L, T 273 K, n 1.00 mol)
- question: "Type 4 in the Pressure P box and press Enter. What does the V readout show, in L?"
- choices (value, label, feedback key):
  - `right` `{right} L` correct (5.60)
  - `mult` `{mult} L` (89.7)
  - `sub` `{sub} L` (18.4)
  - `same` `{same} L` (22.4)
- feedback:
  - mult: "That multiplies V by 4. Pressure and volume are inverse in Boyle's law, so a higher pressure gives a smaller volume. Check that P times V is the same as before."
  - sub: "The volume does not drop by 4 L. P times V stays constant, so V is divided by 4. Check the PV line under the graph."
  - same: "That is the starting volume. T and n are locked, so changing P must change V. Press Enter after typing, then read the V readout."
- explanation: "T and n are locked, so P times V stays constant at {pv} L·atm. With P = 4.00 atm, V = {pv} / 4.00 = {right} L, one fourth of the starting volume."  (`{pv}` = f(V0), 22.4)

### 2. `kelvin`: Charles's law and kelvin
- setup: `{law: "charles", P: 1, T: 273, n: 1}`
- question: "The gas is heated to 100 °C. Type that temperature in kelvin, rounded to a whole number, in the Temperature T box and press Enter. What does the V readout show?"
- choices:
  - `right` `{right} L` correct (30.6)
  - `celsius` `{celsius} L` (8.21)
  - `same` `{same} L` (22.4)
  - `inverse` `{inverse} L` (16.4)
- feedback:
  - celsius: "That uses 100 as the kelvin value. The T box needs kelvin. Convert 100 °C to K first (add 273), then check that the line under the T box reads about 100 °C."
  - same: "That is the starting volume. P and n are locked, so a higher T makes V larger. Press Enter after typing, then read the V readout."
  - inverse: "That makes V shrink when the gas is heated. In Charles's law, V and T are directly proportional, so heating makes V grow."
- explanation: "100 °C is 100 + 273 = 373 K. V/T stays constant, so V = 22.4 L × 373 K / 273 K = {right} L. The volume grows in proportion to the kelvin temperature, not the Celsius temperature."

### 3. `gaylussac`: Gay-Lussac's law
- setup: `{law: "gay", P: 1, T: 273, n: 1}`
- question: "Type 410 in the Temperature T box and press Enter. What does the P readout show, in atm?"
- choices:
  - `right` `{right} atm` correct (1.50)
  - `inverse` `{inverse} atm` (0.666)
  - `same` `{same} atm` (1.00)
  - `volume` `{volume} atm` (22.4)
- feedback:
  - inverse: "That is the upside-down ratio, 273 / 410. Heating a gas in a rigid container raises its pressure, so P goes up, not down."
  - same: "That is the starting pressure. V and n are locked, so P changes with T. Press Enter after typing, then read the P readout."
  - volume: "That is the V readout, which stays fixed in this law. Read the P readout."
- explanation: "V and n are locked, so P/T stays constant. P = 1.00 atm × 410 K / 273 K = {right} atm. Hotter particles hit the walls more often and harder. V stays {volume} L."

### 4. `avogadro`: Avogadro's law
- setup: `{law: "avogadro", P: 1, T: 273, n: 1}`
- question: "Type 2.5 in the Amount of gas n box and press Enter. What does the V readout show, in L?"
- choices:
  - `right` `{right} L` correct (56.0)
  - `inverse` `{inverse} L` (8.97)
  - `same` `{same} L` (22.4)
  - `add` `{add} L` (24.9)
- feedback:
  - inverse: "That divides V by 2.5. More gas at the same pressure and temperature needs more space, so V grows."
  - same: "That is the starting volume. P and T are locked, so changing n must change V. Press Enter after typing, then read the V readout."
  - add: "That adds 2.5 to the volume. V is proportional to n, so multiply by 2.5. At the start, 1 mol takes up 22.4 L."
- explanation: "P and T are locked, so V/n stays constant. 1.00 mol takes up {same} L, so 2.50 mol takes up {same} L × 2.5 = {right} L."

### 5. `combined`: Two changes in a row
- setup: `{law: "charles", P: 2, T: 273, n: 1}` (P 2.00 atm, V 11.2 L, T 273 K, n 1.00 mol)
- question: "Type 410 in the Temperature T box and press Enter. What does the V readout show, in L?"
- choices:
  - `right` `{right} L` correct (16.8)
  - `same` `{same} L` (11.2)
  - `inverse` `{inverse} L` (7.46)
  - `onebar` `{onebar} L` (33.7)
- feedback:
  - same: "That is the starting volume. P and n are locked, so heating the gas makes V larger. Press Enter after typing, then read the V readout."
  - inverse: "That makes V shrink when the gas is heated. V and T are directly proportional when P and n are locked."
  - onebar: "That is V at 1 atm. This gas is at 2.00 atm, so it takes up half as much volume. Check the P readout."
- explanation: "P is locked at 2.00 atm and n at 1.00 mol. V/T stays constant, so V = {p0} L × 410 K / 273 K = {right} L. At 1 atm the same gas would need {onebar} L, twice as much."

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `gas-laws/data.js` as `check = {labels, questions}` and answer `zsa:request-data` (the lab's existing `copy` object for `zsa:request-data` must stay; add `check` as a separate property or answer in the same handler as Collision Carts does).
- Spanish waits for the proofread. English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check".

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices), and every label in a question is different.
2. The right choice equals the formatted `GasModel.solve` result for each setup, and (Playwright) after `zsa-gs:request-lab` setup, typing the value in the named box (`#number-P`, `#number-T`, `#number-n`) and pressing Enter, the right choice equals the text of the matching `#readouts` `<dd>` (V for Q1, Q2, Q4, Q5; P for Q3).
3. Reproducibility: run each setup twice and in a loop of 20 setups assert the readouts are identical, with motion paused and not paused. Assert that `Math.random` is not used for any readout (the only calls are in `syncDots`).
4. Registry: the new `GALC` entry decodes, `maxItems` is 5, and the Collision Carts highest-id test is updated for whatever id is assigned.
5. `document.querySelectorAll('#zsa-gs-check').length === 1`, and the existing Gas Laws tests (`tests/unit/gas-laws.test.js`, `tests/e2e/i18n.spec.js`, SEO and a11y specs) still pass with the new version.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on a `file://` copy of the lab with the setup event above, typing the values into the real number boxes and pressing Enter. Everything was run twice (setup each time) and was identical.

| Q | Setup | Steps | Reading |
|---|---|---|---|
| 1 | Boyle, 1 atm, 273 K, 1 mol | P = 4 | P 4.00, **V 5.60**, T 273, n 1.00 (PV = 22.4 L·atm) |
| 2 | Charles, 1 atm, 273 K, 1 mol | T = 373 | T 373 (99.85 °C), **V 30.6**, P 1.00 |
| 3 | Gay-Lussac, 1 atm, 273 K, 1 mol | T = 410 | T 410, **P 1.50**, V 22.4 |
| 4 | Avogadro, 1 atm, 273 K, 1 mol | n = 2.5 | n 2.50, **V 56.0**, P 1.00 |
| 5 | Charles, 2 atm, 273 K, 1 mol (V 11.2) | T = 410 | T 410, **V 16.8**, P 2.00 (PV = 33.7 L·atm) |

## Media (WordPress site 257744344)

`chem-gas-laws-lab-check.pdf` (media 14929) and `chem-gas-laws-lab-check-key.pdf` (media 14930), uploaded. The lab's worksheet is `chem-gas-laws-virtual-lab.pdf` (media 7695, key 7696). The AP Gas Laws and KMT Lab's check (`apchem-gas-kmt-lab-check.pdf`, 9028/9029) is separate.
