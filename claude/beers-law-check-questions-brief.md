# Beer's Law Lab check: questions and build brief

For Claude Code. Written Nov 21, 2026. The lab is `beers-law-lab/` (Beer's Law Spectrophotometer Lab, version 1.1.3, activity slug `beers-law-lab`). Build the same Lab check the Collision Carts lab has (`collision-carts/data.js`, `collision-carts/labcheck.js`, `shared/zsa-labcheck.js`): 5 multiple-choice questions with short feedback on each wrong choice, retry, Show me, and a completion code.

Companion files in this folder: `chem-beers-law-lab-check.pdf` (student sheet) and `chem-beers-law-lab-check-key.pdf` (answer key). Chemistry course, file prefix `chem-`. Both are already uploaded (media 14875 and 14876).

**Determinism (this lab is random).** Two things in the lab are random: every reading carries Gaussian noise (`M.reading(s, c, nm, rng)` with `Math.random`), and each unknown is drawn with `M.drawUnknown`. The Lab check must not depend on either. The setup event below (a) turns the noise off (`quiet = true`, so `read()` calls `M.reading(...)` with no rng, which is the exact Beer's law value plus the fixed 0.1% stray light, rounded to 0.001), and (b) sets the unknown to a fixed concentration (`lab.unknown = s.unknown`). With both, every reading, the best-fit line and the unknown's absorbance are the same on every run. Verified on the live lab (below), run twice. Questions 1 to 4 do not use the unknown. Question 5 uses it, fixed at 0.150 M by the setup.

## Registry entry (shared/zsa-codes.js)

- Prefix `BLC` (Beer's Law plus LC). It is not taken and is not the start of another prefix (PBLC and the others do not start with BLC).
- Registry id: to be assigned (none left, awaiting the code-format decision). Use `id: <next id>` as a placeholder below.
- Entry, same shape as id 12:

```js
{id:<next id>, prefix:"BLC", slug:"beers-law-lab", setting:"Lab check", name:"Beer's Law Spectrophotometer", maxItems:5,
  stats:[["blank", "Zero with the blank"], ["standard", "Absorbance of a standard"], ["offpeak", "Away from the peak"],
    ["slope", "The slope of the calibration line"], ["unknown", "Find the unknown"]],
  totals:[["blank"], ["standard"], ["offpeak"], ["slope"], ["unknown"]], items:[0, 1, 2, 3, 4]}
```

- Bump `zsa-version` from 1.1.3 to 1.2.0 (minor) in `beers-law-lab/index.html`, change every `?v=1.1.3` to `?v=1.2.0`, add the Lab check CSS, `../shared/zsa-codes.js`, `../shared/zsa-labcheck.js` and `labcheck.js` the way `collision-carts/index.html` does, and add the mount (below). The CSP is `default-src 'self'`, which already allows these local files. Add a changelog line to `README.md` and run `node tools/build-seo.js` only if it is needed for the version.
- **Id clash (important).** The usual mount `#zsa-bl-check` is already taken: it is the Check my answer button (`$("check")` in `lab.js`, id `zsa-bl-check`). Use the mount **`<div id="zsa-blc-check"></div>`** instead. Nothing uses `zsa-blc-`. Do not reuse any `zsa-bl-...` id (`zsa-bl-check`, `zsa-bl-answer`, `zsa-bl-feedback`, `zsa-bl-status`, `zsa-bl-new`, `zsa-bl-show` and so on). `lab.js` finds its own ids with `root.querySelector("#zsa-bl-" + id)`, so the new mount does not collide with it.
- The lab root for events is `main.zsa-bl` (`[data-zsa-activity="beers-law-lab"]`). The setup event is `zsa-bl:request-lab` (it clashes with no existing event; the lab's own is `zsa-bl:request-model`). The mount is `#zsa-blc-check`.
- `README.md` says "no completion code" and "Not an engine activity, and no completion code". Reword it so only the Lab check issues a completion code, and note that the Lab check turns off reading noise and fixes the unknown.

## The model is already separate; the lab needs a setup event

`model.js` exposes `solution`, `reading`, `absorbance`, `transmittance`, `fit`, `fromLine`, `fmt`, `sig`, `equation` and more through the `zsa-bl:request-model` event and `module.exports`. `labcheck.js` requests the same event, as `lab.js` does. What is missing is a setup from outside (the state is closure variables) plus the quiet and fixed-unknown behaviour. Make these four edits to `beers-law-lab/lab.js` (tested on a copy):

1. Next to `function rng() { return Math.random(); }` add `var quiet = false;`.
2. In `read()`, replace `M.reading(sol(), sampleC(), lab.wavelength, rng)` with `M.reading(sol(), sampleC(), lab.wavelength, quiet ? null : rng)`.
3. In the New unknown click handler, add `quiet = false;` as its first line. (A student who asks for a fresh random unknown is back in the normal noisy lab. The Lab check's own setup does not call this handler.)
4. Before the final `buildInstrument();` call, add:

```js
  root.addEventListener("zsa-bl:request-lab", function (event) {
    event.detail.receive({
      // s = {solution: "cocl2" | "nicl2" | "cuso4", wavelength: nm (optional, default the solution's λmax), unknown: M (fixed unknown)}
      setup: function (s) {
        quiet = true;                                   // no reading noise: every reading is the exact model value
        $("solution").value = s.solution;
        $("solution").dispatchEvent(new Event("change", {bubbles: true}));   // clears standards, sets λmax, redraws
        lab.points = []; zeroed = false; cuvette = {kind: "none"}; a = null;
        lab.unknown = s.unknown; lab.unknownA = null; shown = false; foundThis = false; stale = false;   // the fixed unknown
        $("conc").value = ""; $("answer").value = ""; $("feedback").hidden = true;
        if ($("fit").getAttribute("aria-pressed") === "false") $("fit").click();   // the best-fit equation must be visible
        if (s.wavelength) setWavelength(s.wavelength, false);
        status(t("Start by inserting the blank (distilled water) and zeroing the spectrophotometer."));
        showSetup(); redraw();
      },
      // the readouts and the equation as the page prints them: 3 decimals, 1 decimal, 4 significant figures
      format: {f1: function (v) { return M.fmt(v, 1); }, f3: function (v) { return M.fmt(v, 3); }, s4: function (v) { return M.sig(v, 4); }}
    });
  });
```

The student then follows the question using the lab's own buttons: Insert blank and zero, the Standard concentration box with Measure standard, Measure the unknown, and the Check my answer button. The "Set up the lab" button does not zero the instrument or measure anything. The wavelength for question 3 is set by the setup, so the student does not need to drag the slider.

## How the question numbers are filled in

Every number comes from `model.js` through `format`. Nothing is typed in. In `labcheck.js`, with `M` from the model event, `S = M.solution("cocl2")` and no rng (so no noise), define `R(c, nm) = M.reading(S, c, nm)`, `f3 = format.f3`, `f1 = format.f1`, `s4 = format.s4`. For the calibration, `pts = [0.100, 0.200, 0.300].map(c => [c, R(c, 510)])` and `L = M.fit(pts)`. The standard concentrations and the unknown (0.150) are in each question's `setup` and `standards`, not computed.

| slot | formula | value |
|---|---|---|
| Q1 right | `f3(0) + " and " + f1(M.transmittance(0)) + "%"` | 0.000 and 100.0% |
| Q1 noLight | `f3(0) + " and " + f1(0) + "%"` | 0.000 and 0.0% |
| Q1 one | `f3(1) + " and " + f1(M.transmittance(1)) + "%"` | 1.000 and 10.0% |
| Q1 swap | `f1(100) + " and " + f1(0) + "%"` | 100.0 and 0.0% |
| Q2 right | `f3(R(0.2, 510))` | 0.956 |
| Q2 conc | `f3(0.2)` | 0.200 |
| Q2 eps | `f3(M.absorbance(S, 1, 510))` (epsilon times 1 M times 1 cm) | 4.800 |
| Q2 pct | `f1(M.transmittance(R(0.2, 510)))` | 11.1 (the %T number) |
| Q2 plain | `f3(M.absorbance(S, 0.2, 510))` | 0.960 (explanation only: no stray light) |
| Q3 right | `f3(R(0.2, 600))` | 0.058 |
| Q3 peak | `f3(R(0.2, 510))` | 0.956 |
| Q3 zero | `f3(0)` | 0.000 |
| Q3 pct | `f1(M.transmittance(R(0.2, 600)))` | 87.5 |
| Q4 right | `s4(L.m)` | 4.750 |
| Q4 inverse | `s4(1 / L.m)` | 0.2105 |
| Q4 intercept | `f3(L.b)` | 0.005 |
| Q4 top | `f3(pts[2][1])` | 1.429 |
| Q5 right | `f3(M.fromLine(L, R(0.15, 510)))` | 0.150 |
| Q5 abs | `f3(R(0.15, 510))` | 0.718 |
| Q5 times | `f3(R(0.15, 510) * L.m)` | 3.411 |
| Q5 standard | `f3(0.2)` | 0.200 |

Slots for explanations: Q2 `Cmax` none. Q4: the three readings `f3(pts[0][1])`, `f3(pts[1][1])`, `f3(pts[2][1])` = 0.479, 0.956, 1.429, and `eq = M.equation(L)` = "A = 4.750c + 0.005". Q5: `A = f3(R(0.15, 510))` = 0.718, `b = f3(L.b)` = 0.005, `m = s4(L.m)` = 4.750.

## The five questions

All wrong choices are different common mistakes, and all four options show different values in every question (checked above). The lab's own minus sign is not needed: every value is positive. Use `M⁻¹` where a unit is shown (the lab itself prints M⁻¹).

### 1. `blank`: Zero with the blank
- setup: `{solution: "cocl2", unknown: 0.15}`
- question: "Press Insert blank and zero. What do the Absorbance and Transmittance readouts show for the blank?"
- choices (value, label, feedback key):
  - `right` `A 0.000 and 100.0%` correct
  - `noLight` `A 0.000 and 0.0%`
  - `one` `A 1.000 and 10.0%`
  - `swap` `A 100.0 and 0.0%`
  (each label is `A ` plus the slot value above)
- feedback:
  - noLight: "The blank is the reference, so all of the light gets through. Transmittance is 100%, not 0%. Read the Transmittance readout after you zero."
  - one: "An absorbance of 1.000 would mean only 10% of the light gets through. The blank absorbs nothing, so A is 0. Press Insert blank and zero and read the lab."
  - swap: "The two values are the wrong way round. A blank has no absorbance and full transmittance. Read both readouts after you zero."
- explanation: "The blank (distilled water) sets the reference. All of the light that reaches the detector counts as 100% (A = 0), and every later reading is compared with it."

### 2. `standard`: Absorbance of a standard
- setup: `{solution: "cocl2", unknown: 0.15}`
- question: "Zero with the blank. Enter 0.200 M and press Measure standard. What absorbance does the lab show?"
- choices:
  - `right` `{right}` correct (0.956)
  - `conc` `{conc}` (0.200, the concentration)
  - `eps` `{eps}` (4.800, epsilon without the concentration)
  - `pct` `{pct}` (11.1, the %T number)
- feedback:
  - conc: "That is the concentration you entered. Absorbance is a different number. Read the Absorbance readout."
  - eps: "That is the molar absorptivity, 4.800 L/(mol·cm). Absorbance is A = εbc, so multiply by the concentration and the 1.00 cm path."
  - pct: "That is the transmittance (percent), not the absorbance. Read the Absorbance readout."
- explanation: "A = εbc = ({eps})(1.00)(0.200) = {plain}. The lab shows {right} because a little stray light reaches the detector and makes dark samples read slightly low. The transmittance is {pct}%."

### 3. `offpeak`: Away from the peak
- setup: `{solution: "cocl2", wavelength: 600, unknown: 0.15}`
- question: "The wavelength is 600 nm, away from the peak. Zero with the blank, enter 0.200 M and press Measure standard. What absorbance does the lab show?"
- choices:
  - `right` `{right}` correct (0.058)
  - `peak` `{peak}` (0.956, the value at 510 nm)
  - `zero` `{zero}` (0.000)
  - `pct` `{pct}` (87.5, the %T number)
- feedback:
  - peak: "That is the reading at the peak, 510 nm. The lab is set to 600 nm, where cobalt(II) chloride absorbs much less. Check the wavelength readout."
  - zero: "The solution still absorbs a little at 600 nm. Read the Absorbance readout after you measure the standard."
  - pct: "That is the transmittance (percent). Read the Absorbance readout."
- explanation: "At 600 nm the molar absorptivity is far smaller than at the peak, so the same 0.200 M standard reads only {right} instead of {peak}. That is why you measure at λmax: the readings, and the slope, are largest there."

### 4. `slope`: The slope of the calibration line
- setup: `{solution: "cocl2", unknown: 0.15, standards: [0.1, 0.2, 0.3]}`
- question: "Zero with the blank. Measure standards of 0.100, 0.200 and 0.300 M. What slope does the best-fit equation under the graph show?"
- choices:
  - `right` `{right} M⁻¹` correct (4.750)
  - `inverse` `{inverse} M⁻¹` (0.2105)
  - `intercept` `{intercept} M⁻¹` (0.005)
  - `top` `{top} M⁻¹` (1.429)
- feedback:
  - inverse: "That is 1 divided by the slope. The slope is how much A rises for each 1 M, absorbance over concentration. Read the number in front of c in the equation."
  - intercept: "That is the intercept b, the number added at the end. The slope is the number multiplied by c."
  - top: "That is the highest absorbance, the 0.300 M standard. The slope is the change in A for each 1 M of concentration. Read the equation under the graph."
- explanation: "The best-fit line is {eq}. The slope is {right} M⁻¹, which is εb for a 1.00 cm cuvette. A rises by about 4.75 for each 1 M."

### 5. `unknown`: Find the unknown
- setup: `{solution: "cocl2", unknown: 0.15, standards: [0.1, 0.2, 0.3]}`
- question: "Zero with the blank and measure standards of 0.100, 0.200 and 0.300 M. Then press Measure the unknown. Use c = (A - b) / m. What is the unknown's concentration?"
- choices:
  - `right` `{right} M` correct (0.150)
  - `abs` `{abs} M` (0.718, the absorbance read as a concentration)
  - `times` `{times} M` (3.411, multiplied by the slope instead of divided)
  - `standard` `{standard} M` (0.200, picking the middle standard)
- feedback:
  - abs: "That is the unknown's absorbance. Convert it with the line: c = (A - b) / m."
  - times: "You multiplied by the slope. Divide by it instead: c = (A - b) / m."
  - standard: "That is the concentration of one of your standards. The unknown's absorbance is lower than that standard's 0.956, so its concentration is lower. Use the equation."
- explanation: "The unknown's absorbance is {abs}. From the line, c = (A - b) / m = ({abs} - {b}) / {m} = {right} M. It falls between your standards' absorbances, so the answer comes from the data. Press Check my answer in the lab to confirm."

Fixed unknown. In the lab check the unknown is 0.150 M for every student (the setup writes `lab.unknown`). If the student presses Check my answer the lab says it is correct and that the sample was made at 0.150 M.

## Labels and Spanish

- Labels: copy the `check.labels` block from `collision-carts/data.js` unchanged.
- Put the question data in `beers-law-lab/data.js` as `check = {labels, questions}` and answer `zsa:request-data`, as Collision Carts does (check `data.js` for how the lab's existing `zsa:request-i18n` text is organized and add the new block without touching it).
- Spanish waits for the proofread. English only (the `text()` helper returns the English when there is no Spanish entry). Do not add Spanish keys.
- Style: no em dashes, short sentences, "Lab check".

## Tests to add

1. Every choice value in every question is different (5 questions x 4 choices).
2. The right choice equals the formatted model result for each setup, and (Playwright) after `zsa-bl:request-lab` setup the readouts match: Q1 `#zsa-bl-a-value` and `#zsa-bl-t-value` after Insert blank and zero; Q2 and Q3 `#zsa-bl-a-value` after zero, entering 0.200 in `#zsa-bl-conc` and Measure standard; Q4 `#zsa-bl-equation`; Q5 the unknown row of the table and Check my answer reporting Correct for 0.150.
3. Reproducibility: run setup and the steps twice in the same page and assert the same readings (this proves the noise is off and the unknown is fixed). Also assert that pressing New unknown turns noise back on (two readings of one standard can differ).
4. Registry: the new `BLC` entry decodes, `maxItems` is 5, and the Collision Carts highest-id test is updated for whatever id is assigned.
5. `document.querySelectorAll('#zsa-blc-check').length === 1`, `#zsa-bl-check` (Check my answer) still works with its own handler, and the existing Beer's Law tests (`tests/e2e/beers-law-lab.spec.js`, `i18n.spec.js`, `scientific-audit.spec.js`, a11y) still pass with the new version.

## Verified readouts (live lab, Nov 21, 2026)

Headless Chromium on a `file://` copy of the lab with the four edits above, driving the real buttons. Every setup was run twice and gave identical readings.

| Q | Steps | Reading |
|---|---|---|
| 1 | setup, Insert blank and zero | A **0.000**, %T **100.0%** (before zeroing: "Zero first") |
| 2 | zero, 0.200 M, Measure standard (510 nm) | A **0.956**, %T 11.1% |
| 3 | setup with 600 nm, zero, 0.200 M, Measure standard | A **0.058**, %T 87.5% |
| 4 | zero, 0.100, 0.200, 0.300 M at 510 nm | readings 0.479, 0.956, 1.429; equation **A = 4.750c + 0.005**, R² = 1.0000 |
| 5 | same standards, Measure the unknown (0.150 M fixed) | A 0.718; typing 0.150 and Check my answer gives "Correct. ... (0.718 - 0.005) / 4.750 = 0.150 M" |

## Media (WordPress site 257744344)

`chem-beers-law-lab-check.pdf` (media 14875) and `chem-beers-law-lab-check-key.pdf` (media 14876). The lab's worksheet is `chem-beers-law-virtual-lab.pdf` (media 7681, key 7682), so these names match it. The media titles carry a stray backslash ("Beer\'s Law Lab Check (worksheet)"); fix the titles in the media library if it matters.

## Lesson pages (done)

The Lab check line was added to the Beer's Law Lab callout on the Chemistry lesson Beer's Law (page 554) and the AP Chemistry lesson 3.13 Beer-Lambert Law (page 84), both using these chem- PDFs. The Chemistry Virtual Labs page 4524 is for the orchestrator.
