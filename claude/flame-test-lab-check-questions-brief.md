# Flame Test Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `flame-test-lab/` (Virtual Flame Test Lab, version 1.1.3, activity slug `flame-test-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-flame-test-lab-check.pdf` (student sheet) and `chem-flame-test-lab-check-key.pdf` (answer key). Chemistry course, file prefix `chem-`. The lab's worksheet is `chem-flame-test-virtual-lab.pdf` (media 7691, key 7692), so these names match it.

**What the lab shows.** This lab has no wavelength or energy readout. Its readouts are the flame color text (`#observation`, for example "Crimson red flame"), the sample label (`#sample-label`), the color chip, and the tray counter (`#progress`, "3 / 8 tested"). The questions use those, which are the same every time.

**Determinism (the unknown is random).** `reset()` in `lab.js` picks the mystery sample with `Math.random()`. Nothing else is random or clock-driven (the flame is CSS, there is no noise). The setup event below calls `reset()` and then fixes the unknown to a chosen salt (`unknown = salts.find(...)`), so question 5 is the same for every student. Pressing New investigation still picks a random unknown, as in the normal lab. Verified on the live lab, setup run twice, identical readouts (table below).

## Registry entry (shared/zsa-codes.js)

- Prefix `FLLC` (first two letters of Flame plus LC, because `FLC` is Faraday). It is not taken and is not the start of another prefix (existing prefixes: ICT, IFB, GAS, PTR, LVB, LVA, GLC, ALC, PLC, HLC, CLC, FLC and the others in the briefs; none is a prefix of FLLC and FLLC starts no other).
- Registry id: to be assigned (none left, awaiting the code-format decision). Use `id: <next id>` as a placeholder below.
- Entry, same shape as id 12:

```js
{id:<next id>, prefix:"FLLC", slug:"flame-test-lab", setting:"Lab check", name:"Virtual Flame Test Lab", maxItems:5,
  stats:[["lithium", "Lithium's flame"], ["green", "Green flames"], ["group1", "Group 1 chlorides"],
    ["tray", "The tray counter"], ["unknown", "Identify the unknown"]],
  totals:[["lithium"], ["green"], ["group1"], ["tray"], ["unknown"]], items:[0, 1, 2, 3, 4]}
```

- Bump `zsa-version` from 1.1.3 to 1.2.0 (minor) in `flame-test-lab/index.html`, change every `?v=1.1.3` to `?v=1.2.0`, add the Lab check CSS, `../shared/zsa-codes.js`, `../shared/zsa-labcheck.js`, `model.js` (before `lab.js`) and `labcheck.js` the way `collision-carts/index.html` does, and add the mount `<div id="zsa-ft-check"></div>`. Add a changelog line to `README.md`. Run `node tools/build-seo.js` only if the version needs it.
- **Id and event clash check.** The lab's ids are `samples`, `unknown-row`, `clear`, `new`, `dropzone`, `loop`, `sample-label`, `observation`, `color-chip`, `progress`, `toast` and the shared `zsa-th-...` ids. None contains "check" and none starts `zsa-ft`. A search of the repo finds no `zsa-ft` id or event anywhere. So the mount is **`#zsa-ft-check`** and the event is **`zsa-ft:request-lab`**. The lab's only existing event is `zsa:request-i18n`.
- `README.md` says "Open investigations do not issue completion codes." Reword it so only the Lab check issues a completion code, and note that the Lab check fixes the unknown sample.

## The lab has no model file and no way to set up from outside

The data is the `salts` array inside `lab.js` and the state is closure variables. Two changes:

1. **Add `flame-test-lab/model.js`** (loaded before `lab.js`, global `FlameModel`, `module.exports` for tests) and move the `salts` array out of `lab.js` into it, so there is one copy. Also export `byId(id)` (`salts.find(s => s.id === id)`) and the count `8`:

```js
(function () {
  "use strict";
  const salts = [ /* the eight objects now at the top of lab.js, unchanged: id, name, symbol, formula, color, observation */ ];
  const api = {salts, byId: function (id) { return salts.find(function (s) { return s.id === id; }); }};
  if (typeof module === "object" && module.exports) module.exports = api; else self.FlameModel = api;
}());
```

   In `lab.js` replace the array with `const salts = FlameModel.salts;`.

2. **Add one event to `lab.js`**, just before `$('clear').onclick=clearFlame;` (tested on a copy):

```js
root.addEventListener("zsa-ft:request-lab", function (e) {
  e.detail.receive({
    // s = {unknown: "li" | "na" | "k" | "ca" | "sr" | "ba" | "cu" | "cs"}: the fixed mystery sample
    setup: function (s) { reset(); unknown = salts.find(function (x) { return x.id === s.unknown; }); },
    // the text as the page prints it
    format: {
      flame: function (id) { return salts.find(function (x) { return x.id === id; }).observation + " flame"; },   // #observation
      sample: function (id) { var x = salts.find(function (y) { return y.id === id; }); return x.name + " " + x.formula; },   // the bottle text
      progress: function (n) { return n + " / 8 tested"; }   // #progress
    }
  });
});
```

   `reset()` clears the tested marks and the flame, then the setup replaces the random unknown. The "Set up the lab" button therefore also clears any earlier tests. In the Spanish lab the English `format` strings are used only for the English check (Spanish waits for the proofread).

The student then follows the question with the lab's own bottles: click or tap a sample button to put it in the flame, and read the flame readout and the tray counter.

## How the question numbers are filled in

Every label comes from `FlameModel.salts` through `format` (`flame(id)`, `sample(id)`, `progress(n)`). Nothing is typed in. Right and wrong choices are the strings below. `f = format.flame`, `n = format.sample`, `p = format.progress`.

| slot | formula | value |
|---|---|---|
| Q1 right | `f("li")` | Crimson red flame |
| Q1 sr | `f("sr")` | Scarlet red flame |
| Q1 ca | `f("ca")` | Orange-red / brick red flame |
| Q1 na | `f("na")` | Intense golden yellow flame |
| Q2 right | `n("ba")` | Barium BaCl₂ |
| Q2 cu | `n("cu")` | Copper CuCl₂ |
| Q2 cs | `n("cs")` | Cesium CsCl |
| Q2 k | `n("k")` | Potassium KCl |
| Q3 right | `n("cs")` | Cesium CsCl |
| Q3 k | `n("k")` | Potassium KCl |
| Q3 na | `n("na")` | Sodium NaCl |
| Q3 li | `n("li")` | Lithium LiCl |
| Q4 right | `p(3)` | 3 / 8 tested |
| Q4 clicks | `p(5)` | 5 / 8 tested |
| Q4 unknown | `p(4)` | 4 / 8 tested |
| Q4 last | `p(1)` | 1 / 8 tested |
| Q5 right | `n("ca")` | Calcium CaCl₂ |
| Q5 sr | `n("sr")` | Strontium SrCl₂ |
| Q5 li | `n("li")` | Lithium LiCl |
| Q5 na | `n("na")` | Sodium NaCl |

Explanation slots: Q1 `{li}` = `f("li")` lowercased as shown in the table, `{sr}`, `{ca}`; Q2 `{ba}` = `f("ba")` (Apple green flame), `{cu}` = `f("cu")` (Blue-green flame); Q3 `{cs}` = `f("cs")` (Blue-violet flame), `{k}` = `f("k")` (Pale lilac flame); Q5 `{unk}` = `f("ca")` (Orange-red / brick red flame), `{sr}` = `f("sr")` (Scarlet red flame).

## The five questions

All wrong choices are different common mistakes, and all four options differ in every question.

### 1. `lithium`: Lithium's flame
- setup: `{unknown: "ca"}`
- question: "Click the Lithium LiCl bottle. What does the flame readout say?"
- choices (value, label, feedback key):
  - `right` `{right}` correct (Crimson red flame)
  - `sr` `{sr}` (Scarlet red flame)
  - `ca` `{ca}` (Orange-red / brick red flame)
  - `na` `{na}` (Intense golden yellow flame)
- feedback:
  - sr: "Strontium gives a scarlet red flame, but this is lithium. Make sure you clicked the Lithium LiCl bottle, then read the flame readout."
  - ca: "That is the calcium flame. Check which bottle you clicked. The sample label above the readout names it."
  - na: "That is the sodium flame, the golden yellow one. Check the sample label above the readout. It should say LITHIUM CHLORIDE."
- explanation: "Lithium chloride gives a {right}. Strontium looks red too ({sr}) and calcium is more orange ({ca}), so read the exact color text, not just the word red."

### 2. `green`: Green flames
- setup: `{unknown: "ca"}`
- question: "Click the Copper CuCl₂ bottle and then the Barium BaCl₂ bottle. Which sample gives the apple green flame?"
- choices:
  - `right` `{right}` correct (Barium BaCl₂)
  - `cu` `{cu}` (Copper CuCl₂)
  - `cs` `{cs}` (Cesium CsCl)
  - `k` `{k}` (Potassium KCl)
- feedback:
  - cu: "Copper looks green too, but its readout says Blue-green. Look for Apple green in the flame readout."
  - cs: "Cesium gives a blue-violet flame. Click it and compare the readout with the apple green one."
  - k: "Potassium gives a pale lilac flame. Look for Apple green in the flame readout."
- explanation: "{ba} is barium. Copper gives a {cu}. Both look green, so the exact color text and the sample label tell them apart."

### 3. `group1`: Group 1 chlorides
- setup: `{unknown: "ca"}`
- question: "Click the four Group 1 chlorides: Lithium LiCl, Sodium NaCl, Potassium KCl and Cesium CsCl. Which one gives the blue-violet flame?"
- choices:
  - `right` `{right}` correct (Cesium CsCl)
  - `k` `{k}` (Potassium KCl)
  - `na` `{na}` (Sodium NaCl)
  - `li` `{li}` (Lithium LiCl)
- feedback:
  - k: "Potassium is the pale lilac one, a light purple. Look for blue-violet in the flame readout."
  - na: "Sodium gives an intense golden yellow flame. Look for blue-violet in the flame readout."
  - li: "Lithium gives a crimson red flame. Look for blue-violet in the flame readout."
- explanation: "Metals in the same group do not give the same color. Cesium gives a {cs}, potassium a {k}, sodium an intense golden yellow and lithium a crimson red. Each ion has its own set of emission wavelengths."

### 4. `tray`: The tray counter
- setup: `{unknown: "ca"}`
- question: "Click these bottles in this order: Lithium, Sodium, Lithium again, the Unknown sample, then Potassium. What does the tray counter show?"
- choices:
  - `right` `{right}` correct (3 / 8 tested)
  - `clicks` `{clicks}` (5 / 8 tested)
  - `unknown` `{unknown}` (4 / 8 tested)
  - `last` `{last}` (1 / 8 tested)
- feedback:
  - clicks: "That counts every click. The counter counts different known samples, so a repeat does not add to it."
  - unknown: "The Unknown sample does not add to the count, because the counter tracks the eight known samples. Count the different known bottles you clicked."
  - last: "The counter keeps every known sample you tested, not just the last one. Count the different known bottles you clicked."
- explanation: "You tested three different known samples: lithium, sodium and potassium. The repeat of lithium and the unknown do not add, so the tray shows {right}."

### 5. `unknown`: Identify the unknown
- setup: `{unknown: "ca"}` (the unknown is calcium chloride for every student)
- question: "Click the Unknown sample and read its flame. Then click the known samples and compare. Which known salt is the unknown?"
- choices:
  - `right` `{right}` correct (Calcium CaCl₂)
  - `sr` `{sr}` (Strontium SrCl₂)
  - `li` `{li}` (Lithium LiCl)
  - `na` `{na}` (Sodium NaCl)
- feedback:
  - sr: "Strontium is red too, but its flame text is Scarlet red. Compare the exact text of the unknown's flame readout with each known flame."
  - li: "Lithium gives a crimson red flame. Compare the exact text of the unknown's flame readout with each known flame."
  - na: "Sodium gives an intense golden yellow flame, which is a different color. Compare the exact text of the unknown's flame readout with each known flame."
- explanation: "The unknown's flame readout says {unk}. Only calcium chloride gives that. Strontium ({sr}) is the closest look-alike, so read the text carefully before you decide."

The sample label for the unknown reads "UNKNOWN SAMPLE · OBSERVING" and the color chip matches the calcium flame. The lab never says which salt it is, so the student must compare.

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `flame-test-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does (the lab's existing `zsa:request-i18n` strings stay untouched).
- Spanish waits for the proofread. English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys. Note that the right and wrong labels come from `format`, which is English, so the Spanish pass must switch the labels to the lab's translated `t()` strings.
- Style: no em dashes, short sentences, "Lab check".

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices).
2. The right choice equals the formatted model result, and (Playwright) after `zsa-ft:request-lab` setup the readouts match: Q1 `#observation` after clicking `button[data-sample="li"]`; Q2 and Q3 `#observation` for each bottle; Q4 `#progress` after the click sequence; Q5 `#observation` after clicking `button[data-sample="unknown"]` equals `format.flame("ca")`.
3. Reproducibility: run setup and Q5 twice and in a loop of 20 setups assert the unknown's `#observation` is always `format.flame("ca")`. Also assert that New investigation (`#new`) still picks a random unknown (over 40 presses at least two different results).
4. Registry: the new `FLLC` entry decodes, `maxItems` is 5, and the Collision Carts highest-id test is updated for whatever id is assigned.
5. `document.querySelectorAll('#zsa-ft-check').length === 1`, and the existing flame lab tests (including `tests/e2e/labs-a11y.spec.js`) still pass with the new version.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on a `file://` copy of the lab with the setup event above, clicking the real bottles. Everything was run twice (setup each time) and was identical.

| Q | Steps | Reading |
|---|---|---|
| 1 | click Lithium | label LITHIUM CHLORIDE · LiCl, **Crimson red flame** |
| 2 | click Copper, then Barium | Blue-green flame, then **Apple green flame** (BARIUM CHLORIDE · BaCl₂) |
| 3 | click Li, Na, K, Cs | Crimson red, Intense golden yellow, Pale lilac, **Blue-violet flame** (Cs) |
| 4 | Li, Na, Li, Unknown, K | before: 0 / 8 tested; after: **3 / 8 tested** |
| 5 | click Unknown | UNKNOWN SAMPLE · OBSERVING, **Orange-red / brick red flame**, same as Ca; Sr reads Scarlet red flame |

## Media (WordPress site 257744344)

`chem-flame-test-lab-check.pdf` and `chem-flame-test-lab-check-key.pdf` (media ids in the final report). The lab's worksheet is `chem-flame-test-virtual-lab.pdf` (media 7691, key 7692). The older `flame-test-virtual-lab.pdf` (4503) is not the one the lessons use now.
