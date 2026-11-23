# Electrochemistry Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `electrochemistry-lab/` (Electrochemistry Cell Builder, version 1.4.3, activity slug `electrochemistry-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code. The calorimetry brief (`calorimetry-check-questions-brief.md`) is the closest model.

Companion files in this folder: `chem-electrochemistry-lab-check.pdf` (student sheet) and `chem-electrochemistry-lab-check-key.pdf` (answer key). Course on the PDFs is Chemistry, prefix `chem-`.

## Registry entry (shared/zsa-codes.js)

- Prefix `ELLC` (`ELC` is the Equipotential lab). Registry id **25**.
- Entry, same shape as the other Lab check entries:

```js
{id:25, prefix:"ELLC", slug:"electrochemistry-lab", setting:"Lab check", name:"Electrochemistry Cell Builder", maxItems:5,
  stats:[["voltage", "Cell voltage"], ["anode", "Anode and cathode"], ["atoms", "Atoms lost and gained"],
    ["reverse", "Running a cell in reverse"], ["bridge", "The salt bridge"]],
  totals:[["voltage"], ["anode"], ["atoms"], ["reverse"], ["bridge"]], items:[0, 1, 2, 3, 4]}
```

- Bump `zsa-version` (minor) in `electrochemistry-lab/index.html`, add `labcheck.js` and the shared Lab check files the way `collision-carts/index.html` does, and add `<div id="zsa-ec-check"></div>` as the mount (inside `main.zsa-ec`, after the work area).
- **Id clash to avoid:** the lab already uses many ids that start `zsa-ec-` (`zsa-ec-instructions`, `zsa-ec-instructions-open`, `zsa-ec-instructions-close`, `zsa-ec-instructions-title`, `zsa-ec-instructions-intro`, `zsa-ec-share-toggle`, `zsa-ec-share-panel`, `zsa-ec-share-title`, `zsa-ec-share-close`, `zsa-ec-share-url`, `zsa-ec-share-copy`, `zsa-ec-share-email`, `zsa-ec-share-device`, `zsa-ec-share-status`) and plain ids `example swap mode mode-help builder metals selected bridge meter power-label power reset run step restart status show-ions show-labels speed apparatus meter-help potential-math beakers sample-counts sample-note flow-help voltage` plus generated `solution-left`, `solution-right`, `place-left`, `place-right`, `cell-scene`, `scene-title`, `scene-desc`, `plate-*`, `sample-ions-*`, `anode-loss`, `deposited-atoms`. Nothing contains "check", and `#zsa-ec-check` is unused. Do not reuse any of them. Note `bridge` is a checkbox id, so the question key `bridge` is only a data key and never an element id.
- `README.md` says "No ... completion codes". Reword it to say that only the Lab check issues a completion code, and mention the version.

## The model is a global, only a setup hook is missing

`model.js` defines `window.Electrochem` (`metals`, `ion`, `cell`, `assess`, `sample`) and `module.exports` for Node. `labcheck.js` can read `Electrochem` directly. `cell(left, right, mode)` returns `{anode, cathode, n, anodeAtoms, cathodeAtoms, e, ...}`, and `sample(c, events)` returns `{dissolved, deposited, electrons, ...}`. The settings live in closure variables (`left`, `right`, `solutions`) and in form controls, so add a setup event to `lab.js` (replace the final `select('Zn');loadExample();` line with the handler plus that line), as `collision-carts/lab.js` does with `zsa-cc:request-lab`:

```js
document.querySelector('.zsa-ec').addEventListener('zsa-ec:request-lab',e=>e.detail.receive({
  // s = {example: "Zn,Cu" | "Zn,Ag" | "Cu,Ag" (an Example select value), mode: "galvanic" | "electrolytic" (default galvanic), power: "0.3" (electrolytic only)}
  setup(s){
    $('example').value=s.example;loadExample();   // sets both electrodes and solutions, bridge and meter on, sample cleared
    $('mode').value=s.mode||'galvanic';
    if(s.power!==undefined)$('power').value=s.power;
    clearSample();render();
  },
  format:{volt:v=>(v>=0?'+':'−')+Math.abs(v).toFixed(2),plain:v=>Math.abs(v).toFixed(2)}   // volt is the voltmeter text (U+2212 minus), plain has no sign
}));
```

The student then reads the voltmeter (`#voltage`), the beaker role labels, the particle counts (`#sample-counts`), the status line (`#status`) or the line under the meter (`#flow-help`). `format.volt` matches `fmt()` in `lab.js`, so a choice always matches the screen (the minus is U+2212, as on the screen). The Set up the lab button must not start a run; Q3 asks the student to press Step once three times.

## How the numbers are filled in

Every number comes from `Electrochem` through `format`. Nothing is typed in. With `M = Electrochem`: `c = M.cell(left, right, mode)`, `c.e` is the standard potential, `M.metals[x].e` is a reduction potential, `M.sample(c, 3)` gives the counts after 3 steps.

| Slot | Source |
|---|---|
| `{right}` Q1 | `volt(M.cell("Zn","Ag","galvanic").e)` = +1.56 |
| anode metal, sign Q2 | `M.cell("Cu","Ag","galvanic").anode` = Cu, sign "−" for a galvanic anode |
| lost, deposited Q3 | `M.sample(M.cell("Zn","Ag","galvanic"), 3)`: `dissolved` 3, `deposited` 6, `electrons` 6 |
| `{right}` Q4 | `plain(M.cell("Cu","Ag","electrolytic").e)` = 0.46 |
| cathode Q5 | `M.cell("Zn","Cu","galvanic").cathode` = Cu |

## The five questions

All wrong choices are different common mistakes, and all four options show different values in every question.

### 1. `voltage`: Cell voltage
- setup: `{example: "Zn,Ag"}` (galvanic)
- question: "What does the voltmeter read for the zinc / silver cell? (Zn: −0.76 V, Ag: +0.80 V)"
- choices (value, label, feedback key):
  - `right` `+1.56 V` correct (= volt(e_Ag - e_Zn))
  - `flip` `−1.56 V` (= volt(e_Zn - e_Ag))
  - `sum` `+0.04 V` (= volt(e_Ag + e_Zn))
  - `double` `+2.36 V` (= volt(2 x e_Ag - e_Zn))
- feedback:
  - flip: "E° is cathode minus anode. In a galvanic cell the result is positive. Check which metal has the higher reduction potential."
  - sum: "You added the two potentials. Subtract: E°cell = E°cathode − E°anode."
  - double: "Potentials are not multiplied by the number of electrons or by coefficients. Use the table values once."
- explanation: "E°cell = E°cathode − E°anode = (+0.80) − (−0.76) = +1.56 V. Silver is the cathode and zinc is the anode."

### 2. `anode`: Anode and cathode
- setup: `{example: "Cu,Ag"}` (galvanic)
- question: "Read the labels on the two beakers. Which metal is the anode, and what sign does the lab show for it?"
- choices: `right` "Cu, −" correct; `swap` "Ag, −" (swapped roles); `sign` "Cu, +" (sign of the electrolytic anode); `both` "Ag, +".
- feedback:
  - swap: "The metal with the lower reduction potential is oxidized, and oxidation happens at the anode. Compare +0.34 V and +0.80 V."
  - sign: "In a galvanic cell the anode is negative. Read the sign in the beaker label."
  - both: "Both the metal and the sign are reversed. Read the labels on the two beakers."
- explanation: "Cu (+0.34 V) has a lower reduction potential than Ag (+0.80 V), so Cu is oxidized: Cu → Cu²⁺ + 2e⁻. It is the anode, and in a galvanic cell the anode is negative."

### 3. `atoms`: Atoms lost and gained
- setup: `{example: "Zn,Ag"}` (galvanic), then press Step once 3 times.
- question: "After 3 steps, how many Zn atoms are lost and how many Ag atoms are deposited?"
- choices: `right` "3 Zn lost, 6 Ag deposited" correct (= `dissolved`, `deposited`); `equal` "3 Zn lost, 3 Ag deposited" (1 to 1); `swap` "6 Zn lost, 3 Ag deposited" (swapped); `electrons` "6 Zn lost, 6 Ag deposited" (electrons used as atoms).
- feedback:
  - equal: "Each Zn gives 2 electrons, but each Ag⁺ takes only 1. Silver atoms form twice as fast as zinc atoms are lost."
  - swap: "It is the other way round. Zn gives up 2 e⁻ per atom, so fewer Zn atoms are lost than Ag atoms deposited."
  - electrons: "That is the number of electrons transferred. Count atoms, not electrons: 1 Zn atom lost per step."
- explanation: "Each step is Zn + 2Ag⁺ → Zn²⁺ + 2Ag. One Zn atom is lost and 2 Ag atoms are deposited per step, so 3 steps give 3 Zn lost, 6 Ag deposited and 6 e⁻ transferred."

### 4. `reverse`: Running a cell in reverse
- setup: `{example: "Cu,Ag", mode: "electrolytic", power: "0.3"}`
- question: "The lab will not run at 0.3 V. Read the status line. What is the smallest supply voltage it will accept, as a value to go above?"
- choices: `right` "More than 0.46 V" correct (= plain(e)); `ag` "More than 0.80 V" (silver potential only); `sum` "More than 1.14 V" (0.80 + 0.34); `cu` "More than 0.34 V" (copper potential only).
- feedback:
  - ag: "That is the reduction potential of silver alone. The needed voltage comes from the difference of both metals."
  - sum: "You added the potentials. Subtract them and read the size of E° for this cell."
  - cu: "That is the reduction potential of copper alone. Use the difference between both metals."
- explanation: "E° for Cu and Ag is (+0.80) − (+0.34) = 0.46 V. Running it in reverse needs a supply above 0.46 V. The voltmeter shows −0.46 V in electrolytic mode."

### 5. `bridge`: The salt bridge
- setup: `{example: "Zn,Cu"}` (galvanic)
- question: "Read the line under the meter. Which particle moves through the salt bridge toward the cathode?"
- choices: `right` "K⁺" correct; `anion` "NO₃⁻" (wrong direction); `zn` "Zn²⁺" (metal ions cross the bridge); `e` "e⁻" (electrons cross the bridge).
- feedback:
  - anion: "Negative ions move toward the anode. The cathode is where positive charge in the solution is used up."
  - zn: "Zn²⁺ ions stay in their own beaker. Only the ions of the salt in the bridge move through it."
  - e: "Electrons travel through the wire. They never cross the salt bridge."
- explanation: "Zn is the anode and Cu is the cathode. K⁺ moves toward the cathode and NO₃⁻ toward the anode, which keeps each beaker neutral. Electrons stay in the wire."

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `electrochemistry-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does.
- Spanish waits for the proofread. English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check".

## Tests to add

1. Every choice value in every question is different (5 x 4).
2. The right choice equals the `Electrochemistry` model result through `format` for each setup, and (Playwright) after setup through `zsa-ec:request-lab` the right choice matches `#voltage` (Q1), the beaker role labels (Q2), `#sample-counts` after 3 clicks of `#step` (Q3), `#status` (Q4) and `#flow-help` (Q5).
3. Registry: id 25 `ELLC` decodes, `maxItems` is 5, no prefix clash.
4. `document.querySelectorAll('#zsa-ec-check').length === 1`, and the existing ids (`#bridge`, `#voltage`, `#status`) are unchanged.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on the `file://` lab with the setup handler above added to a scratch copy, then reading the page.

| Q | Setup | Readout |
|---|---|---|
| 1 | Zn / Cu example swapped to Zn / Ag | `#voltage` "+1.56 V" |
| 2 | Cu / Ag | left beaker "Anode · oxidation · −", right "Cathode · reduction · +" (left is Cu) |
| 3 | Zn / Ag, Step once x3 | "3 / 12 events, 6 e⁻ transferred, 3 Zn atoms lost, 6 Ag atoms deposited" |
| 4 | Cu / Ag, electrolytic, 0.3 V | `#status` "Set the applied voltage above 0.46 V (up to 10 V) to drive the reverse reaction." and `#voltage` "−0.46 V" |
| 5 | Zn / Cu | `#flow-help` "Electrons: Zn → load → Cu. K⁺ moves toward the cathode; NO₃⁻ toward the anode. Electrons never cross the salt bridge." |

## Media (WordPress site 257744344)

`chem-electrochemistry-lab-check.pdf` (media id 14789) and `chem-electrochemistry-lab-check-key.pdf` (media id 14790). The lab's existing worksheet is `chem-electrochemistry-virtual-lab.pdf` (media 7687, key 7688), so the names match it.
