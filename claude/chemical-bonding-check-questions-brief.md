# Chemical Bonding Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `chemical-bonding-lab/` (Chemical Bonding Lab, version 1.1.4, activity slug `chemical-bonding-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-chemical-bonding-lab-check.pdf` (student sheet) and `chem-chemical-bonding-lab-check-key.pdf` (answer key). Course on the PDFs is Chemistry, prefix `chem-`.

This lab is qualitative. It has no numbers to compute. Every readout is a word (the conductivity tester shows OPEN, NONE, HIGH or VERY HIGH) or a line of text in the "At the bench" box, plus the hot plate temperature. So "the right answer comes from the lab's model" means: the answer text is read from a new `model.js` that holds the sample data, so lab.js and the Lab check share one copy.

## Registry entry (shared/zsa-codes.js)

- Prefix `CHLC`. The rule (initial plus LC) would give `CLC`, which is Collision Carts. `CHLC` is not taken and is not the start of another prefix (check `CLC`, `CALC`, `CILC` do not start with it and it does not start with any of them).
- Registry id **23**.
- Entry, same shape as id 12:

```js
{id:23, prefix:"CHLC", slug:"chemical-bonding-lab", setting:"Lab check", name:"Chemical Bonding Lab", maxItems:5,
  stats:[["solid", "Solid conductivity"], ["water", "Dissolving and conducting"], ["melt", "Melting at 300 °C"],
    ["solvent", "Like dissolves like"], ["press", "Malleable or brittle"]],
  totals:[["solid"], ["water"], ["melt"], ["solvent"], ["press"]], items:[0, 1, 2, 3, 4]}
```

- The Collision Carts test that asserts the highest id must be updated for whatever the final highest id is (see the earlier briefs).
- Bump `zsa-version` to 1.2.0 in `chemical-bonding-lab/index.html`, add `model.js`, `labcheck.js` and the shared Lab check files (`zsa-labcheck.js`, `zsa-labcheck.css`, `zsa-codes.js`) the way `collision-carts/index.html` does, and add `<div id="zsa-bd-check"></div>` as the mount (put it after the `.workspace` div, before `details.model-note`).
- **Id clash to avoid:** existing ids are `instructions-open`, `share-open`, `station-title`, `sample-badge`, `equipment`, `apparatus`, `scene-title`, `scene-desc`, `wall`, `bench`, `glass`, `steel`, `metal`, `porcelain`, `liquid`, `shadow`, `light`, `sample-1` to `sample-4`, `dish`, `scene-content`, `scene-status`, `scene-detail`, `interaction`, `observation`, `reset`, `zsa-about-heading`, `zsa-about-lessons`, `instructions`, `instructions-title`, `share`, `share-title`, `share-url`, `copy-link`, `share-status`, plus `equipment-control` created at run time. Nothing uses `zsa-bd-check`. Do not reuse `#observation`, `#reset` or `#share` for the check.
- The root element is `<main class="zsa bonding" data-zsa-activity="chemical-bonding-lab">`; dispatch events on it.
- The README says there are no student response fields, scores or completion codes, and the page has a strict CSP (`default-src 'self'`). Reword the README to say that only the Lab check has answer choices and issues a completion code, and that open investigation does not. Check `tests/e2e` for any assertion that the page has no radio buttons or storage, and adjust it for the Lab check only.

## Add model.js and a setup event

### 1. `chemical-bonding-lab/model.js` (loaded before `lab.js` and `labcheck.js`, global `BondingModel`, `module.exports` for tests)

Move the `samples` table out of `lab.js` into it so there is one copy, and add the melting numbers that `meltingObservation()` and `heatingScene()` already hard-code:

```js
(function () {
  "use strict";
  // samples: the table now in lab.js (appearance, solid, water, cyclo, dissolved, conductivity, press), unchanged
  const samples = { /* 1..4 exactly as in lab.js */ };
  // temperatures in the lab, in °C
  const melt = {plate: 300, tinMelts: 232, lactoseBrowns: 203, iodineMelts: 114, iodineVaporizes: 184, iodineSublimes: 80};
  // What a portion has done after the plate has been at `peak` °C. Same thresholds as heatingScene().
  function state(n, peak) {
    if (n === 1) return peak >= melt.tinMelts ? "melted" : "solid";
    if (n === 3) return peak >= melt.lactoseBrowns ? "decomposed" : "solid";
    if (n === 4) return peak >= melt.iodineVaporizes ? "vaporized" : peak >= melt.iodineMelts ? "melted" : "solid";
    return "solid";   // Unknown 2 (NaI) stays solid to the 300 °C plate limit
  }
  const api = {samples, melt, state};
  if (typeof module === "object" && module.exports) module.exports = api; else self.BondingModel = api;
}());
```

`lab.js` then reads `var samples = BondingModel.samples;` and the thresholds from `BondingModel.melt` (232, 203, 114, 184, 300) instead of literals. Nothing on screen changes. Add a test that `state(n, 300)` gives solid only for Unknown 2.

### 2. The setup event in `lab.js` (before the final `reset()`), as `collision-carts/lab.js` does with `zsa-cc:request-lab`

```js
root.addEventListener('zsa-bd:request-lab',e=>e.detail.receive({
  // s = {sample: 1 to 4, station: "appearance" | "solid" | "melting" | "water" | "cyclohexane" | "malleability"}
  setup(s){selected=s.sample;station=s.station;reset();},   // fresh portion, nothing started, as the station buttons do
  format:{n:v=>String(v)}
}));
```

`root` is already the `[data-zsa-activity="chemical-bonding-lab"]` element in `lab.js`. `reset()` stops any timer, clears the phase and redraws, so a question can be set up while another test is running.

The student then follows the steps in the question text and reads the tester or the "At the bench" line. The "Set up the lab" button only selects the unknown and the station; it does not start the test.

## How the answers are filled in

Everything comes from `BondingModel` (`samples[n].solid`, `samples[n].conductivity`, `samples[n].dissolved`, `samples[n].water`, `samples[n].cyclo`, `samples[n].press`, `melt.*`, `state(n, melt.plate)`). The choice labels below are short descriptions of those strings. In `labcheck.js` build each label from the model, for example `solid` labels are `samples[2].solid` (`NONE`), `samples[1].solid` (`VERY HIGH`), `samples[2].conductivity` (`HIGH`) and the tester's own word `OPEN`. For the sentence choices, derive the first part from `samples[n].dissolved` and the second from `samples[n].conductivity`, and write the fixed wording shown below. Put the temperatures in the feedback through `{tin}`, `{lactose}`, `{iodine}`, `{plate}` slots from `melt`.

## The five questions

All wrong choices are different common mistakes, and all four options differ in every question.

### 1. `solid`: Solid conductivity of an ionic solid
- setup: `{sample: 2, station: "solid"}`
- question: "Press Touch probes to solid. What does the conductivity tester show for Unknown 2?"
- choices (value, label, feedback key):
  - `right` `NONE` correct (= samples[2].solid)
  - `high` `HIGH` (= samples[2].conductivity, the dissolved reading)
  - `veryHigh` `VERY HIGH` (= samples[1].solid)
  - `open` `OPEN`
- feedback:
  - high: "That is what Unknown 2 shows when it is dissolved in water. In a solid the ions are locked in place and cannot carry a current."
  - veryHigh: "That is the reading for a metal. Unknown 2 has no free electrons. Check which unknown you selected and read the tester after the probes touch."
  - open: "OPEN only means the test circuit is incomplete, because the probes are lifted. Press Touch probes to solid first."
- explanation: "The tester shows NONE. In an ionic solid the ions can only vibrate in place, so no charge moves. Unknown 1, a metal, shows VERY HIGH because its electrons move freely."

### 2. `water`: Dissolving is not the same as conducting
- setup: `{sample: 3, station: "water"}`
- question: "Press the step button through Immerse conductivity probe. What happens to Unknown 3 in water, and what does the meter show?"
- choices:
  - `right` "It dissolves completely and the conductivity is NONE" correct (dissolved true, conductivity NONE)
  - `ions` "It dissolves completely and the conductivity is HIGH" (the Unknown 2 reading)
  - `stays` "It stays at the bottom and the conductivity is NONE"
  - `part` "Only a small part dissolves and the conductivity is NONE" (the Unknown 4 water result)
- feedback:
  - ions: "Dissolving does not always mean conducting. Only ions carry current in water. Read the meter after you immerse the probe."
  - stays: "Watch the beaker after you stir. The pale granules dissolve completely and the water turns clear."
  - part: "That is what Unknown 4 does. Check that Unknown 3 is selected. Unknown 3 dissolves completely."
- explanation: "Unknown 3 dissolves as whole neutral molecules (it is lactose), so no ions form and the liquid conductivity is NONE. Unknown 2 also dissolves completely, but it gives HIGH because it makes ions."

### 3. `melt`: Which solid is still solid at 300 °C?
- setup: `{sample: 1, station: "melting"}` (the station heats all four, so the unknown does not matter)
- question: "Press Load all four portions, then Switch on hot plate. Wait until the plate reaches 300 °C and read the At the bench line. Which unknown is still an unchanged solid?"
- choices (label `Unknown {n}`, n from `state`):
  - `right` `Unknown 2` correct (the only n with `state(n, 300) === "solid"`)
  - `one` `Unknown 1` (melts near {tin} °C)
  - `three` `Unknown 3` (browns near {lactose} °C)
  - `four` `Unknown 4` (melts near {iodine} °C, then vaporizes)
- feedback:
  - one: "Unknown 1 melts near {tin} °C into a shiny liquid. That is below the {plate} °C limit of the plate."
  - three: "Unknown 3 softens and browns near {lactose} °C. It decomposes, so it does not stay unchanged."
  - four: "Unknown 4 melts near {iodine} °C and then vaporizes. It melts first, and it has the weakest attractions."
- explanation: "Only Unknown 2 is unchanged at {plate} °C. It is an ionic solid, so its strong ion-to-ion attractions take far more energy to break than the plate can supply. The others changed at {iodine}, {lactose} and {tin} °C."

### 4. `solvent`: Like dissolves like
- setup: `{sample: 4, station: "cyclohexane"}`
- question: "Press the three step buttons, then Advance to 5:00. What happens to Unknown 4 in cyclohexane?"
- choices:
  - `right` "The crystals dissolve and the liquid turns violet" correct (= samples[4].cyclo)
  - `stays` "The crystals stay at the bottom and the liquid stays clear" (the Unknown 2 and 3 result)
  - `clear` "The crystals dissolve and the liquid stays clear"
  - `water` "The crystals stay at the bottom and the liquid turns yellow-brown" (the Unknown 4 water result)
- feedback:
  - stays: "That is what happens to Unknowns 2 and 3 in cyclohexane. Check that Unknown 4 is selected and that you advanced to 5:00."
  - clear: "Look at the color of the liquid after five minutes. Something dissolved in it."
  - water: "That is how Unknown 4 looks in water, where only a little dissolves. Cyclohexane is a different solvent."
- explanation: "Cyclohexane is nonpolar, and Unknown 4 is a nonpolar molecular solid (iodine), so it dissolves and gives a violet solution. In polar water only a small part dissolves."

### 5. `press`: Malleable or brittle
- setup: `{sample: 1, station: "malleability"}`
- question: "Press with pestle. What does Unknown 1 do?"
- choices:
  - `right` "It flattens into a thin piece" correct (= samples[1].press)
  - `fracture` "It fractures into smaller angular pieces" (the Unknown 2 result)
  - `crumble` "It crumbles into a finer powder" (the Unknown 3 result)
  - `nothing` "Nothing happens, because metals are too hard"
- feedback:
  - fracture: "That is how Unknown 2, an ionic solid, behaves. Check which unknown is selected. A metal does not break."
  - crumble: "That is how Unknown 3 behaves. Unknown 1 does not turn to powder."
  - nothing: "Metals are hard but not brittle. Wait for the pestle to finish pressing and read the At the bench line."
- explanation: "Unknown 1 is malleable. In a metal the atoms slide past each other while the sea of electrons keeps holding them. In an ionic solid, sliding puts like charges together, so the crystal cracks."

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `chemical-bonding-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does. Note `data.js` here is the i18n file; follow how Collision Carts combines the two (the `text()` helper).
- Spanish waits for the proofread. Leave the strings English only. Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check" as in the other labs.

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices).
2. `BondingModel.state(n, 300)` is "solid" only for n = 2, and the Q3 right choice is Unknown 2. The Q1 to Q5 right choices equal the model strings.
3. Playwright, after `zsa-bd:request-lab`: Q1 touch probes and read the tester LCD (`#scene-content text.lcd`) equals NONE (and OPEN before touching); Q2 steps give the dissolved line in `#observation` and meter NONE; Q3 reaches 300 °C (`#scene-detail`) and `#observation` says Unknown 2 remains solid; Q4 `#observation` says dissolve and violet solution; Q5 `#observation` says flattens.
4. Registry: id 23 `CHLC` decodes, `maxItems` is 5.
5. `document.querySelectorAll('#zsa-bd-check').length === 1` and the existing e2e a11y spec still passes with the Lab check closed.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on the `file://` lab, clicking the station and unknown buttons and the step buttons.

| Q | Setup | Readout |
|---|---|---|
| 1 | Unknown 2, Solid conductivity | LCD OPEN, then **NONE** after Touch probes ("Solid conductivity: none. Both probes are touching the solid.") Unknown 1 shows VERY HIGH. |
| 2 | Unknown 3, In water, through Immerse conductivity probe | "The pale granules dissolve completely, leaving a clear, colorless solution." meter **NONE**. Unknown 2 gives HIGH. |
| 3 | Melting, Load all four, Switch on hot plate, to 300 °C (about 14 s) | "Unknown 1 melts near 232 °C into a shiny liquid. **Unknown 2 remains solid up to 300 °C.** Unknown 3 has browned and decomposed; Unknown 4 melted first and then vaporized." |
| 4 | Unknown 4, In cyclohexane, three steps, Advance to 5:00 | "The dark crystals dissolve, producing a violet solution." Unknown 2: "remain at the bottom". |
| 5 | Unknown 1, Malleability, Press with pestle | "The solid flattens into a thin piece rather than crumbling. It is malleable." Unknown 2: "fracture into smaller angular pieces". |

## Media (WordPress site 257744344)

Uploaded: `chem-chemical-bonding-lab-check.pdf` (media 14794) and `chem-chemical-bonding-lab-check-key.pdf` (media 14795). The lab's worksheet is `chem-chemical-bonding-virtual-lab.pdf` (media 7685, key 7686), so the names match it.
