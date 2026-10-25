# Beer's Law Spectrophotometer Lab
Version: 1.0.1

A spectrophotometry lab for Chemistry and AP Chemistry (Beer's law, Beer-Lambert law). Students zero a spectrophotometer with a blank, choose the concentrations of their own standards and measure each one to build a calibration curve, then measure an unknown of the same solution and calculate its concentration. They check their answer, or show it, and can take a new unknown, which has a different random concentration each time. The page shows a mock-up of the spectrophotometer, with a cutaway of the light path (lamp, grating, the selected wavelength, the cuvette and the light that gets through to the detector), a calibration curve with every standard, the best-fit line and the unknown's absorbance, and a data table.

## Assumptions and decisions
- Built from a one-paragraph request, not a handoff. Built on the house conventions of the Virtual Titration Simulator: plain JavaScript in strict IIFEs, classic deferred scripts, no globals (the page reaches the model through a `zsa-bl:request-model` event), every element built with `createElement`, `createElementNS` and `textContent`, the shared Content Security Policy, tokens and Inter font, embed mode, and no storage, cookies or outside requests. Nothing in `shared/` changed.
- Named "Beer's Law Spectrophotometer Lab", slug `beers-law-lab`, class prefix `zsa-bl-`.
- Not an engine activity, and no completion code: there is no round or score. A code could be added later by registering it in `shared/zsa-codes.js`.
- Three solutions of colored metal ions, with concentrations in M so the answer is a molarity. No dye in µM, so no scientific notation is needed.
- Built and browser-tested in Chromium by Claude. Real screen readers, Firefox, Safari and school devices remain untested. See TESTING.md.

## Purpose
Lessons that link here: AP Chemistry Unit 3 (Properties of Substances and Mixtures), topic 3.13 Beer-Lambert law: A = εbc, calibration curves, choosing λmax, and finding an unknown concentration. A Chemistry solutions unit could link here too, with the best-fit line hidden (`?fit=0`) so students find the slope themselves.

## Installation and local use
From the repository root run `npm run serve` (or `python3 -m http.server 8000`) and open `http://localhost:8000/beers-law-lab/`. No build step or dependencies. Keep `shared/` beside `beers-law-lab/`.

Live URL after merging: https://activities.zornscience.org/beers-law-lab/

Embed mode (`?embed=1`) hides the back link line and the footer and sends `{type: "zsa:resize", activity: "beers-law-lab", height}` to `https://zornscience.org` when framed.

## Links and deep links
| Parameter | Effect |
|---|---|
| `?solution=nicl2` | The solution: `cocl2` (cobalt(II) chloride, the default), `nicl2` (nickel(II) chloride) or `cuso4` (copper(II) sulfate). |
| `?wavelength=600` | The starting wavelength, a whole number of nm from 380 to 950. The default is the solution's λmax. |
| `?fit=0` | Hides the best-fit line and its equation at the start (students can still turn it on). |
| `?from=<url>` | Sets "Back to the lesson". Accepted only for `https://zornscience.org/` pages (no other host, http, port or user name), as in the other activities. The default is https://zornscience.org/science/ap-chemistry/ |
| `?embed=1` | Embed mode. |

Unknown values are ignored. Parameters combine, for example `?solution=cuso4&fit=0`. The unknown is never set by a link, so a link cannot give away the answer.

## Lesson callouts
The lessons are WordPress pages on zornscience.org, not files in this repository, so the links below still need to be added to them.

Heading: **Practice with the Beer's Law Spectrophotometer Lab**

Text: Measure standards with a virtual spectrophotometer, build a calibration curve, and use it to find the concentration of an unknown.

Button: **Open the Beer's Law Spectrophotometer Lab**

Suggested links (add `&from=` with the lesson's own URL):
- Beer's law and calibration curves: https://activities.zornscience.org/beers-law-lab/
- Finding the slope yourself: https://activities.zornscience.org/beers-law-lab/?fit=0
- Why measure at λmax: https://activities.zornscience.org/beers-law-lab/?solution=nicl2&wavelength=600

## How it works
- **The science.** Beer's law, A = εbc, with a 1.00 cm cuvette. Each solution's molar absorptivity ε at any wavelength is a sum of bands at the usual textbook peaks:

| Solution | Ion | Color | Bands: peak (ε, L/(mol·cm)) | λmax | Standards |
|---|---|---|---|---|---|
| Cobalt(II) chloride, CoCl₂ | [Co(H₂O)₆]²⁺ | pink | 510 nm (4.8) | 510 nm | 0 to 0.350 M |
| Nickel(II) chloride, NiCl₂ | [Ni(H₂O)₆]²⁺ | green | 395 nm (5.2), 656 nm (1.8), 720 nm (2.1) | 395 nm | 0 to 0.350 M |
| Copper(II) sulfate, CuSO₄ | [Cu(H₂O)₆]²⁺ | blue | 780 nm (12), broad | 780 nm | 0 to 0.150 M |

  The top standard of each reads between 1.6 and 1.8 at λmax.
- **Readings.** The instrument reads against the blank, with 0.1% stray light (light that reaches the detector without passing through the sample), so readings below 1 follow Beer's law within 0.005 and very dark samples read a little low, as on a real instrument. Each reading has a little random noise (standard deviation 0.002 + 0.4% of the absorbance), so remeasuring a standard gives a slightly different value and the points scatter slightly about the line. Absorbance is shown to 0.001 and transmittance to 0.1%.
- **The blank.** Insert blank and zero puts distilled water in the cuvette and sets A = 0. It stores a full-spectrum reference, like a scanning spectrophotometer, so it holds at every wavelength and for every solution. Nothing can be measured before it.
- **Standards.** Students type any concentration from 0 to the solution's top standard (rounded to 0.001 M) and measure it. Each one is added to the table and the graph, up to 12. Any one can be removed, or all cleared. Standards can repeat a concentration.
- **Wavelength.** A slider from 380 to 950 nm (with a button to jump to λmax). Moving it with a sample in the cuvette updates the reading, so students can sweep to find λmax. Once there are standards it is locked, because a calibration curve only works at the wavelength it was measured at. An unknown read at another wavelength must be read again. The beam in the drawing takes the color of the light (infrared is gray and dashed), and the beam after the cuvette fades with the transmittance.
- **The calibration curve.** Absorbance against concentration: the standards as dots, the least squares best-fit line A = mc + b with R², which can be hidden, and the unknown's absorbance as a dashed horizontal line. Once the answer is found or shown, the unknown is marked on the graph at its concentration.
- **The unknown.** A random concentration from 15% to 85% of the solution's range, to 0.001 M, at least 5% of the range away from the last one. A new one is drawn on load, for each new solution, and with New unknown. Measuring it again gives a fresh reading.
- **Checking.** An answer is right within 4% of the true concentration (at least 0.002 M), or within 1% (at least 0.001 M) of what the student's own best-fit line gives, so a careful calculation from noisy data is never marked wrong. Wrong answers get a hint for the likely mistake: entering the absorbance, multiplying by the slope, mM instead of M, adding the intercept instead of subtracting it, close but outside 4%, too few standards, or the general method. Show the answer gives the true concentration and works it from the student's line: c = (A − b) ÷ m, with the percent error. Unknowns found counts unknowns answered correctly before the answer was shown.
- **Insight.** Under the table: whether the standards fall on a line (R² of at least 0.99) or scatter, the slope as εb and ε in L/(mol·cm), why the intercept is near 0, a note when the wavelength is far from λmax (ε below 80% of its peak), a note when standards read above 1.5, and a warning when the unknown is outside the standards' range.
- **Changing the solution** clears the standards, sets the wavelength to the new λmax and draws a new unknown. The blank stays valid.
- **Reflection, printing and data.** The reflection stays in the tab. Print lab prints a summary line (solution, wavelength, number of standards, the best-fit line, the unknown's absorbance and the student's answer), the instrument, the curve, the data table and the whole reflection, without the controls. Download data (CSV) saves `zornscience-beers-law-data.csv`: each standard's concentration and absorbance, then the unknown's absorbance, with the wavelength.

## Decisions for the teacher to confirm
- **Default back link**: the AP Chemistry page, because the topic 3.13 lesson's address was not known. Set the default in `index.html` and `DEFAULT_BACK` in `tests/e2e/beers-law-lab.spec.js` once it is, or give each lesson its own `?from=`.
- **The best-fit line is on by default**, with its equation, as in most school graphing software. `?fit=0` starts with it hidden.
- **Show the answer is always available**, so a stuck student can see the method. It does not count toward Unknowns found.
- **Noise** is small and always on. Set `NOISE` in `model.js` to `{base: 0, rel: 0}` for exact readings.
- **No completion code** for now.

## Files
| File | What it holds |
|---|---|
| `index.html` | Page shell: setup, the spectrophotometer with its readouts and controls, the graph, the table and the unknown, reflection and the live region. |
| `model.js` | The solutions and their spectra, Beer's law readings with stray light and noise, λmax, the best-fit line, random unknowns, the answer check and hints, the worked answer, light and solution colors, insight text, spoken descriptions, graph scales, number formatting and the CSV. No page code. |
| `lab.js` | The page: the instrument drawing, the blank, standards and unknown, the wavelength lock, the graph, the table, checking and showing the answer, printing, the download and deep links. |
| `lab.css` | Layout, instrument and graph colors and print styles, prefixed `zsa-bl-`. |

## Keyboard and screen readers
- Every control is a native button, select, slider or number box. The best-fit line is a toggle with `aria-pressed`. The slider's value is spoken with the color of the light ("510 nm (green)"). Each Remove button names its standard ("Remove standard 2, 0.100 M").
- The spectrophotometer and the graph are images with spoken descriptions: the wavelength and its color, whether it is zeroed, what is in the cuvette and its color, the absorbance and transmittance; and the graph's scales, the standards' range, the best-fit line, the unknown's absorbance and, once shown, its concentration.
- One polite live region announces zeroing, each standard, the unknown's reading, wavelength changes (when the slider is released), removing and clearing, checked answers with their hints, the shown answer, a new unknown, a new solution and the download.
- Focus never moves on its own, except after a Remove button removes itself: focus goes to the next Remove button, or to the concentration box.

## Layout
- 1100 px and wider: the setup in a 280 px column, the work beside it.
- 860 px and wider: the spectrophotometer and the curve side by side.
- Narrower: one column. From 600 to 1099 px the setup is in two columns.
- The graph is drawn at its real width so its labels keep their size on phones; the unknown's labels stay inside the plot.
- No sideways scrolling from 320 px, and every button, select, slider and box is at least 44 px.

## Changelog
- 1.0.0: first version.
