# Solutions Lab

Version: 1.0.4

Version 1.0.4 adds search engine tags from `shared/zsa-seo.js`: hreflang links for English and Spanish, a canonical address that keeps `?lang=es` and drops every other parameter, and a description in each language. The activity itself is unchanged.

Version 1.0.3 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

A high school Chemistry Unit 7 activity for lessons 550 Characteristics of Solutions,
551 Solubility Curves, 552 Molarity Calculations, and 553 Dilutions.
Open `/solutions-lab/` on the static site. There is no build step or runtime dependency.

## Files and integration

- `index.html`: shared header, instructions and Share dialogs, four keyboard tabs, lab controls, data table, footer, CSP and version.
- `chem.js`: DOM-independent calculations, significant figures, exact curve data, state transitions, parameter validation, and challenge checking. CommonJS export; browser event `zsa-sl:request-model` on the activity root.
- `lab.js`: apparatus, meniscus, particles, graph, ordered steps, keyboard interactions, data exports, and challenge views.
- `data.js`: full English to Mexican Spanish dictionary through `zsa-i18n`.
- `lab.css`: responsive layout and reduced-motion behavior.
- `README.md` and `TESTING.md`: setup, model decisions, and validation.
- `../tests/unit/solutions-lab.test.js` and `../tests/e2e/solutions-lab.spec.js`: automated checks.
- `../SPANISH_TERMS.md`: activity terminology.

The remote pH & Buffer Lab 1.0.1 was read as the reference because this checkout did
not contain its folder. The activity reuses the existing, unchanged `shared/`
header, Inter font, base styles, i18n, and embed scripts. The Style Kit v1.8,
sections 1 and 4 through 7, was read from its master Google Doc.

No accounts, saved state, completion codes, tracking, or runtime network requests.
Experiments live only in the open page. Reloading or changing language starts fresh.
Language links preserve the current URL settings, including `from` and `embed`.
Share uses the shared dialog's clean activity URL with language, without student data.

## Parameters

Parameters can be combined. Unknown values use the defaults below. Input changes
update the settings in the URL; masses, answers, data rows and serial stock history
are never placed in the URL.

Parameter | Accepted values | Default
--- | --- | ---
`mode` | `make`, `dilute`, `solubility`, `challenge` | `make`
`solute` | Make/dilute: `nacl`, `kno3`, `kcl`, `cuso4`, `sucrose`; solubility: `kno3`, `nano3`, `nh4cl`, `kcl`, `nacl`, `nh3` | `nacl`, or `kno3` for solubility
`flask` | `50`, `100`, `250`, `500`, `1000`; dilute excludes `1000` | `250`, or `100` for dilute
`stock` | `1`, `2`, `4` M, used in dilute | `2`, or `1` for dilute with `solute=cuso4`
`temp` | Integer from `0` to `100` °C | `25`
`conductivity` | `1` opens the tester in make | off
`lang` | `es` for Mexican Spanish, otherwise English | English
`from` | Absolute HTTPS URL with hostname exactly `zornscience.org`, no credentials or nonstandard port | Chemistry course
`embed` | `1` hides shared chrome and reports height to `https://zornscience.org` | standalone

The flask labels are `50.00`, `100.0`, `250.0`, `500.0`, and `1000.` mL.
`cuso4` in Make uses the pentahydrate's molar mass; its diluted aqueous solute is
labeled CuSO₄. Dilute has the three requested presets. A valid URL can additionally
initialize another supported solute with a permitted preset molarity.
A made solution or serial stock is kept at full precision only within the page.
A fresh URL intentionally cannot restore that experimental stock.

Lesson presets:

- 550: `/solutions-lab/?mode=make&solute=sucrose&conductivity=1`
- 551: `/solutions-lab/?mode=solubility&solute=kno3`
- 552: `/solutions-lab/?mode=make&solute=nacl&flask=250`
- 553: `/solutions-lab/?mode=dilute&solute=cuso4`
- Combined: `/solutions-lab/?mode=solubility&solute=nh3&temp=0&lang=es&embed=1`
- Safe return: `/solutions-lab/?mode=make&flask=250&from=https%3A%2F%2Fzornscience.org%2Fscience%2Fchemistry%2F`

## Chemistry and measurement model

### Making a solution

Ideal behavior at 25 °C. The mass range is 0.01 to 250.00 g, measured to 0.01 g.
The class atomic masses are H 1.01, C 12.01, N 14.01, O 16.00, Na 22.99,
S 32.07, Cl 35.45, K 39.10, Cu 63.55. The resulting molar masses are exactly
58.44, 101.11, 74.55, 249.72, and 342.34 g/mol for the five listed solutes.
The hydrate work includes all nine O and ten H atoms.

`molarity (M) = moles of solute ÷ liters of solution`.
The flask's calibrated final volume is the solution volume, not a measurement of
water to add to solid. No component-volume additivity or density calculation is
used for ordinary preparation. Make and Dilute do not enforce physical solubility
limits; use the Solubility Curves mode to investigate phase separation.

Preparation is locked in order: place and tare, weigh, transfer, dissolve,
fill to the line, stopper and invert. Setup changes require Start over after taring.
Typed mass supports the same balance precision as the scoop buttons. Overfilling
permanently disables filling and mixing until Start over. There is no pour-out action.

The fill controls are schematic portions, not measured wash-bottle flow rates:
a big squirt adds 6% of the flask volume and a single illustrated drop adds 0.1%.
After adding water partway (80%), three big squirts reach 98%; use 20 small drops
for the final approach. The bottom of the concave meniscus meets the single etched
line at exactly the flask volume. Reduced motion skips swirl, inversion and crystal
animations; Heat and Cool change temperature by 10 °C immediately instead of
running their 1 °C animation timer. The slider always supports 1 °C steps.

Balance digits determine mass significant figures, including trailing decimal zeros.
Flask labels determine volume significant figures. Molarity uses the fewer of these.
Values stay unrounded internally. Scientific notation is used when necessary to
preserve significant figures. Worked solutions show the mL to L conversion.

The water misconception toggle is available only on the 1000. mL flask. It uses
an explicitly illustrative apparent molar volume of 20 mL/mol. Thus 1.00 mol of
NaCl in 1.00 L of water produces 1.0200 L and 0.9804 M in this model. This is not
a measured partial molar volume or a prediction of density. The supplied request
specified only a volume above 1.00 L and M below 1.00; both are satisfied.

Ionic solutes use a bright bulb and the label strong electrolyte; sucrose uses off
and nonelectrolyte. The model also reserves dim for future weak electrolytes.
Brightness is qualitative and independent of molarity. CuSO₄ color intensity
increases with molarity using an illustrative blue opacity; all other solutions
are colorless.

### Dilution

`M₁V₁ = M₂V₂`, with 1 the stock and 2 the diluted solution. V₂ is the total final
solution volume. Moles in the measured aliquot before and after dilution are equal.
Water added is `V₂ − V₁`, an ideal volume bookkeeping assumption after the flask
is filled to the line. It is not a density or real mixing-volume model.
Volumetric pipets are 5.00, 10.00, and 25.00 mL; the 10 mL graduated cylinder
supports 0.1 through 10.0 mL in 0.1 mL steps.
M₂ significant figures also account for stock precision and V₁ measurement precision.
Live moles-before and moles-after readouts use M₂ significant figures. Internally
and in CSV exports, mole values remain unrounded.
The particle diagram uses twelve schematic solute markers on both sides, not a
molecular count. Its liquid heights are schematic and have a minimum visible height
to keep the twelve particles distinct. Blue color decreases continuously as water is added.

Serial dilution retains exact previous concentrations and records a source-step
relationship. The serial challenge checks an actual connected chain, so two
unrelated experiments at the right concentrations do not satisfy it.

### Solubility

Every supplied table value is used unchanged, with linear interpolation between
0, 10, 20 ... 100 °C. Units are g solute per 100 g H₂O. The beaker has 100 g of
water and accepts up to 250 g of added solute. Graph axes use 10 °C and 10 g
gridlines, with 30 g labels on the default 150 g scale and 50 g labels on the
250 g scale. KNO₃ or a mass over
150 g changes the maximum to 250 g.

Solution state uses the dissolved amount. The solid graph point, live state readout,
and data table all use dissolved solute. Any crystals or undissolved solid mean
saturated. With no solid, dissolved mass above solubility + 1 g means
supersaturated; within **±1 g** means saturated, and below means unsaturated.
The abstract point-classification challenges retain their original curve rule.

At a fixed temperature, excess solid stays undissolved. Normal cooling crystallizes
the excess, and heating redissolves it. Gentle cooling can retain dissolved excess
only if no crystals were present before cooling. Any added solid seeds a
supersaturated solution immediately: dissolved solute returns to the curve and the
added grams join the crystals. The seed-crystal button adds no measurable mass.
Turning gentle cooling off equilibrates the solution. This is a simplified
nucleation demonstration, not a kinetic model.

NH₃ is dissolved gas. Excess escapes, never forms crystals, and cannot be restored
by cooling unless more gas is explicitly added. Gas escaped is cumulative. Seed
and gentle-cooling controls are disabled for NH₃. Total mass added includes gas
already escaped; the dissolved amount is reported separately.

### Challenges

The first set has the exact fixed targets from the request. Preparation and
single/serial dilution challenges check actual finished experiments, with ±1%
concentration tolerance. Solubility checks include three classifications, 54 g
KNO₃ crystallized, and NH₄Cl saturation at 40 °C. Numeric answers allow ±0.5 g or
±0.5 °C; classification uses the curve's ±1 g rule. New numbers randomizes sensible
flasks, concentrations, aliquots, curve points, and temperatures. Each answer is
checked by the same model. Hints are available. There are no completion codes.

## Accessibility, localization and exports

Native buttons, inputs, details and dialogs support keyboard operation. Tabs use
arrow keys, Home and End. Status readouts use polite live regions. Every drawing
has a localized text alternative; data tables provide the numeric counterpart.
Table overflow is confined to its labeled, keyboard-focusable region at 360 px.
All experiment data can be copied as tab-separated text or downloaded as a CSV
with localized column headers. Copy has a selectable-text fallback. Downloads
use a local Blob, not a server. Language changes start a fresh experiment.

New terminology recorded in `SPANISH_TERMS.md`: matraz aforado, línea de aforo,
menisco, balanza, pipeta volumétrica, probeta graduada, piseta, cristal semilla,
solución insaturada, solución sobresaturada, electrolito fuerte, no electrolito,
alícuota, tarar, sacarosa, sulfato de cobre(II) pentahidratado.

ZornScience. CC BY-NC-SA 4.0.

## Version 1.0.2

Dilute mole columns now use the readouts' significant figures, hiding floating-point tails such as 0.0019999999999999996 behind the correct 0.00200 display. Download CSV still exports the original unrounded moles; Copy data follows the table.
