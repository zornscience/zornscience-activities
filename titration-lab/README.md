# Virtual Titration Simulator
Version: 1.0.1

A titration lab for AP Chemistry (Unit 8, Acids and Bases). Students choose an analyte, a titrant and an indicator, add titrant with a stopcock (closed, drop by drop, slow or fast stream) or one drop at a time, and watch the flask's color, the pH meter and a live pH curve. They record the endpoint, read the equivalence volume and the pKa (or the equivalence pH) from their own curve, check those answers, and then show the key points to connect the steep slope to the equivalence point and the half-equivalence point to the pKa.

## Assumptions and decisions
- Built from a one-paragraph request, not a handoff. Built on the house conventions of the Physics Graphing Lab: plain JavaScript in strict IIFEs, classic deferred scripts, no globals (the page reaches the model through a `zsa-ti:request-model` event), every element built with `createElement`, `createElementNS` and `textContent`, the shared Content Security Policy, tokens and Inter font, embed mode, and no storage, cookies or outside requests. Nothing in `shared/` changed.
- Not an engine activity, and no completion code: the lab has no round or score. A code could be added later by registering it in `shared/zsa-codes.js`.
- Built and browser-tested in Chromium by Claude. Real screen readers, Firefox, Safari and school devices remain untested. See TESTING.md.

## Purpose
Lessons that link here: AP Chemistry Unit 8 (Acids and Bases): acid-base titrations, weak acid and base equilibria, buffers (the flat region around the half-equivalence point) and indicator choice. The Chemistry acids and bases unit could link here with a strong acid and strong base (`?analyte=hcl`).

## Installation and local use
From the repository root run `npm run serve` (or `python3 -m http.server 8000`) and open `http://localhost:8000/titration-lab/`. No build step or dependencies. Keep `shared/` beside `titration-lab/`.

Live URL after merging: https://activities.zornscience.org/titration-lab/

Embed mode (`?embed=1`) hides the back link line and the footer and sends `{type: "zsa:resize", activity: "titration-lab", height}` to `https://zornscience.org` when framed.

## Links and deep links
| Parameter | Effect |
|---|---|
| `?analyte=ammonia` | Analyte: `hcl`, `acetic` (the default), `formic`, `hypochlorous`, `naoh`, `ammonia` or `methylamine`. |
| `?titrant=hcl` | Titrant: `naoh` or `ammonia` for an acid analyte, `hcl` or `acetic` for a base. A titrant that does not suit the analyte is ignored (the first one is used). |
| `?ca=0.2`, `?ct=0.05` | Analyte and titrant concentrations: `0.05`, `0.1` (default) or `0.2` M. `?ca=unknown` hides the analyte concentration and draws one from 0.080 to 0.180 M. |
| `?va=10` | Analyte volume: `10`, `20` or `25` (default) mL. |
| `?indicator=methylred` | `phenolphthalein` (default), `bromothymol`, `methylred`, `methylorange` or `none`. |
| `?from=<url>` | Sets "Back to the lesson". Accepted only for `https://zornscience.org/` pages (no other host, http, port or user name), as in the other activities. The default is https://zornscience.org/science/ap-chemistry/ |
| `?embed=1` | Embed mode. |

Unknown values are ignored. Parameters combine, for example `?analyte=hypochlorous&indicator=bromothymol`.

## Lesson callouts
The lessons are WordPress pages on zornscience.org, not files in this repository, so the links below still need to be added to them.

Heading: **Practice with the Virtual Titration Simulator**

Text: Titrate a strong or weak acid or base drop by drop, watch the pH curve form, and find the equivalence point and the pKa from your own data.

Button: **Open the Virtual Titration Simulator**

Suggested links (add `&from=` with the lesson's own URL):
- Strong acid and strong base titrations: https://activities.zornscience.org/titration-lab/?analyte=hcl
- Weak acid titrations and pKa: https://activities.zornscience.org/titration-lab/?analyte=acetic
- Weak base titrations: https://activities.zornscience.org/titration-lab/?analyte=ammonia&indicator=methylred
- Choosing an indicator: https://activities.zornscience.org/titration-lab/?analyte=acetic&indicator=methylorange
- Finding an unknown concentration: https://activities.zornscience.org/titration-lab/?ca=unknown

## How it works
- **The chemistry.** Monoprotic acids and bases at 25 °C, Kw = 1.0 × 10⁻¹⁴, concentrations used for activities. The pH after any volume comes from the charge balance [H⁺] + [BH⁺] = [OH⁻] + [A⁻], with A⁻ the acid's anion (all of it for a strong acid) and BH⁺ the base's cation (Na⁺ for NaOH), solved by bisection on log [H⁺]. No 5% approximation is made, so the curve is right at the start, at the half-equivalence point (which for formic acid sits slightly off its pKa) and at equivalence. Volumes add.

| Species | Kind | Constant (25 °C) |
|---|---|---|
| Hydrochloric acid, HCl | strong acid | |
| Acetic acid, HC₂H₃O₂ | weak acid | Ka = 1.8 × 10⁻⁵ (pKa 4.74) |
| Formic acid, HCOOH | weak acid | Ka = 1.8 × 10⁻⁴ (pKa 3.74) |
| Hypochlorous acid, HOCl | weak acid | Ka = 3.0 × 10⁻⁸ (pKa 7.52) |
| Sodium hydroxide, NaOH | strong base | |
| Ammonia, NH₃ | weak base | Kb = 1.8 × 10⁻⁵ (pKa of NH₄⁺ 9.26) |
| Methylamine, CH₃NH₂ | weak base | Kb = 4.4 × 10⁻⁴ (pKa of CH₃NH₃⁺ 10.64) |

- **Titrants.** NaOH or NH₃ for an acid analyte; HCl or acetic acid for a base. A weak titrant with a weak analyte is allowed on purpose: the curve shows why that titration is avoided.
- **The burette.** 50.00 mL, read to 0.01 mL. One drop is 0.05 mL. Drop by drop delivers 3 drops a second (0.15 mL/s), a slow stream 0.5 mL/s and a fast stream 2 mL/s, in real time (at most 0.1 s per frame, so a stalled tab does not jump ahead). An empty burette closes the stopcock; Refill burette sets the reading back to 0.00 mL and the total keeps counting. There is one animation loop at most.
- **The pH meter and the curve.** The meter logs a reading every 0.10 mL while the stopcock is open, one for every single drop, and one when the stopcock closes. The curve joins the logged readings (dots) to the current reading, so a fast stream through the steep part leaves fewer readings there, as with a real probe. The volume axis runs to 50 mL and grows in 50 mL steps. The indicator's range is shaded; pH 7 is dashed.
- **Indicators.** Phenolphthalein (pH 8.2 to 10.0, colorless to pink), bromothymol blue (6.0 to 7.6, yellow to blue), methyl red (4.4 to 6.2, red to yellow), methyl orange (3.1 to 4.4, red to yellow), or none. The fraction in the base form is 1 / (1 + 10^(pKin − pH)) with pKin at the middle of the range (about 0.1 and 0.9 at its ends). The flask's color blends the acid, middle and base colors, and is also named in words ("pale pink") on screen and to screen readers, so color is never the only cue. Changing the indicator keeps the data.
- **Analysis.** Record endpoint marks the current volume on the graph. Check my answers asks for the equivalence volume (correct within 2% or 0.20 mL), then for a weak analyte the pKa from the half-equivalence point (within 0.15 of the pH there or of the table pKa) or for a strong analyte the pH at equivalence (within 0.3), and with an unknown the concentration (within 3%). Wrong answers get a hint about the method, not the answer.
- **Key points.** Show key points marks the equivalence point and, for a weak analyte, the half-equivalence point with "pH = pKa", and lists them with the starting pH, the unknown concentration, how far the recorded endpoint is from equivalence, a verdict on the indicator (its color change mid-point within 2 drops or 0.5% of the equivalence volume is "a good choice"; otherwise how far before or after, or that it changes at the start or never finishes) and an explanation of the curve's shape.
- **Start over** empties the flask with the same solutions (the same unknown sample, for a second trial). Changing the analyte, a concentration, the volume or the titrant starts a new titration (and a new unknown).
- **Reflection, printing and data.** The reflection stays in the tab. Print lab prints a line with the setup and the endpoint, the bench, the curve, the analysis and the whole reflection, without the controls. Download titration data (CSV) saves `zornscience-titration-data.csv`: titrant added (mL) and pH for every logged reading.

## Decisions for the teacher to confirm
- **Default back link**: the AP Chemistry page, because the Unit 8 titration lesson's address was not known. Set the default in `index.html` and `DEFAULT_BACK` in `tests/e2e/titration-lab.spec.js` once it is, or give each lesson its own `?from=`.
- **Show key points is always available**, so a student can check the picture before finishing. Hiding it until an answer is checked would push more students to work it out first.
- **Weak titrant with weak analyte** is allowed (see above). Remove `ammonia` and `acetic` from `TITRANTS` in `chem.js` to offer only strong titrants.
- **No completion code** for now.

## Files
| File | What it holds |
|---|---|
| `index.html` | Page shell: setup, bench with stopcock and readouts, the graph, analysis, reflection and the live region. |
| `chem.js` | The species, pH from the charge balance, equivalence and half-equivalence points, indicator colors and verdicts, the analysis checks, insight text, spoken descriptions, number formatting and the CSV. No page code. |
| `lab.js` | The page: the apparatus drawing, the stopcock and animation loop, the curve, the endpoint, questions and key points, printing, the download and deep links. |
| `lab.css` | Layout, apparatus and graph colors and print styles, prefixed `zsa-ti-`. |

## Keyboard and screen readers
- Every control is a native button, select, number box or text area. The stopcock is a group of four buttons with `aria-pressed`; Show key points is a toggle with `aria-pressed`.
- The apparatus and the graph are images with spoken descriptions: the burette reading, stopcock, flask volume, color and pH; and the graph's scale, number of readings, their range, the steepest stretch and, once shown, the key points.
- One polite live region announces each single drop (volume, pH, color), color changes while the stopcock is open, closing the stopcock, an empty burette, refilling, setup changes, the endpoint, checked answers, key points and the download.
- Focus never moves on its own.

## Layout
- 1100 px and wider: the setup in a 280 px column, the work beside it.
- 760 px and wider: the bench and the curve side by side.
- Narrower: one column. From 600 to 1099 px the setup is in three columns.
- The graph is drawn at its real width so its labels keep their size on phones; key point labels stay inside the plot.
- No sideways scrolling from 320 px, and every button, select and box is at least 44 px.

## Changelog
- 1.0.0: first version.
