# Free Energy Lab

Version: 1.0.2

Version 1.0.2 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson. It also adds search engine tags from `shared/zsa-seo.js`: hreflang links for English and Spanish, a canonical address that keeps `?lang=es` and drops every other parameter, and a description in each language.

A standalone, bilingual activity at `/free-energy-lab/` for AP Chemistry 9.1 to 9.7 and Chemistry, Entropy, Enthalpy & Gibbs Energy. Open through a static server, for example `npm run serve`, then visit `/free-energy-lab/`. No build step or runtime dependencies. No accounts, persistence, tracking, or requests beyond the initial local assets. All calculations run in the tab.

Worked answers and computed Data rows stay hidden until the relevant Check passes. One wrong numeric Check enables Show solution. Control and dissolving classifications reveal their explanations after a selection is checked. The formation exercise and the ΔH/ΔS to ΔG to K chain each require their own Check. Changing problem data hides the previous answer again.

## Modes

- **Entropy Explorer:** eight sign predictions, solid/liquid/gas boxes, volume comparison, gas-mole changes, hydration, and normalized Maxwell-Boltzmann style argon speed distributions at 300 K and 400 K.
- **ΔS° Calculator:** coefficient-weighted sums checked independently, an absolute S° table, and an unknown S°(NO₂) problem. Inputs accept numbers or sums such as `213.7 + 2 × 69.9`. The Data table initially shows reaction coefficients and reference S° values; calculated rows appear only after both sums pass. Elements have nonzero absolute entropy.
- **ΔG and Temperature:** editable ΔH/ΔS, a 100 to 2000 K slider and numeric alternative, explicit J-to-kJ conversion, an answer check with a conversion-mistake diagnostic, a shaded straight-line graph, crossover calculation, four sign cases, and the SO₃ formation method. The SO₃ preset uses formation data only, without inventing temperature data.
- **Kinetic vs Thermodynamic Control:** independent reference ΔG and activation barrier, catalyst, heat and light interventions, a rate meter, and classification checks. Ea and rate are illustrative. Heating changes the kinetic comparison while holding the displayed reference ΔG fixed.
- **ΔG° and K:** both calculation directions, a −60 to +60 kJ slider, a logarithmic K marker, and a ΔH/ΔS to ΔG to K chain. Calculations use R = 8.314 J/(mol·K) and retain the exponent internally.
- **Dissolving and Coupled Reactions:** salt classification, hydration diagrams showing water orientation, and keyboard-operated partner selection with signed Gibbs-energy addition and actual stoichiometric cancellation.

## URL parameters

Parameters combine. Unsupported strings, empty numeric values, nonfinite values, and out-of-range numbers fall back to defaults. `rxn` takes priority over `case` when both are supplied. A reaction ID is interpreted within the selected mode.

| Parameter | Values and defaults |
| --- | --- |
| `mode` | `entropy` (default), `ds`, `dg`, `control`, `k`, `coupled` |
| `rxn` or `case`, entropy | `water` (default), `combustion`, `caco3`, `argon`, `haber`, `nacl`, `expansion`, `melting` |
| `rxn` or `case`, ds | `ch4` (default), `nh4cl`, `no2`, `haber` |
| `rxn` or `case`, dg | `haber` (default), `caco3`, `n2o4`, `so3`, `all`, `never`. The last two are illustrative sign cases. |
| `rxn` or `case`, control | `sucrose` (default), `hcl`, `unfavored` |
| `rxn` or `case`, k | `haber` (default), `acetic`, `n2o4`, `no` |
| `rxn` or `case`, coupled | `nh4no3` (default), `caco3`, `iron`, `mercury` |
| `dh` | For dg: −10000 to +10000 kJ, default from the selected reaction |
| `ds` | For dg: −10000 to +10000 J/K, default from the selected reaction |
| `t` | For dg: 100 to 2000 K, default 298 K |
| `course` | `chem` selects Chemistry; any other value selects AP |
| `lang` | `es` selects Mexican Spanish; any other value selects English |
| `from` | Absolute HTTPS lesson URL on exactly `zornscience.org`, without credentials or a nondefault port. Its path follows the selected language. Invalid URLs use the course fallback. |
| `embed` | `1` enables the existing shared embed behavior |

AP uses thermodynamically favored, J/(mol<sub>rxn</sub>·K), kJ/mol<sub>rxn</sub>, and ΔG°. Chemistry uses spontaneous, J/K, kJ, and ΔG. Chemistry supplies NH₃ S° = 192.8, Haber ΔS = −198.1, and CaCO₃ ΔH = 178, ΔS = 161. AP supplies NH₃ S° = 192.5, Haber ΔS° = −198.8, and CaCO₃ ΔH° = 178.3, ΔS° = 160.6. All quoted reaction energies refer to the stoichiometric equation as written.

Language links preserve URL settings and reload a fresh activity. Answers and in-tab changes are not saved. The shared Share dialog supplies a fresh canonical activity URL and selected language, without student state, embed, or source lesson. Lesson return links and the home link follow `/es/` for Spanish.

## Lesson presets

All paths below start with `/free-energy-lab/`.

| Lesson | Query |
| --- | --- |
| AP 9.1 | `?mode=entropy` |
| AP 9.2 | `?mode=ds&rxn=ch4` |
| AP 9.3 | `?mode=dg&rxn=haber` |
| AP 9.4 | `?mode=control&case=sucrose` |
| AP 9.5 | `?mode=k&case=haber` |
| AP 9.6 | `?mode=coupled&case=nh4no3` |
| AP 9.7 | `?mode=coupled&case=iron` |
| Chemistry Entropy, Enthalpy & Gibbs Energy | `?mode=dg&rxn=caco3&course=chem` |

Additional examples:

- `/free-energy-lab/?mode=dg&dh=40&ds=100&t=600&lang=es`
- `/free-energy-lab/?mode=dg&rxn=so3`
- `/free-energy-lab/?mode=entropy&case=argon&lang=es`
- `/free-energy-lab/?mode=ds&rxn=no2`
- `/free-energy-lab/?mode=k&case=acetic&lang=es&embed=1`
- `/free-energy-lab/?mode=coupled&case=mercury`

## Accessibility and data

Tabs support Arrow Left, Arrow Right, Home and End. Native controls, partner selection and numeric temperature entry support the keyboard. Visible focus, live feedback, SVG descriptions, text explanations and captioned tables provide alternatives to every graphic. Nothing requires dragging or animation. The layout fits 360 px, and reduced motion is respected.

The Data table describes the current mode. Copy data follows the displayed table, with a selectable-text fallback. Calculated rows use the lesson precision without trailing-zero padding; reference values keep their supplied precision. Download CSV uses up to fifteen significant figures and typographic scientific notation, preserving precision for review without displaying programming exponent notation. Model calculations retain the original numbers. Graph ticks follow the existing 1, 2, 5 scale helper. The logarithmic K axis uses equally spaced powers of ten.

## Implementation and scope

`chem.js` is DOM-independent and exports CommonJS for tests. In the browser it answers `zsa-fe:request-model` with `event.detail.receive(api)`. `lab.js` creates views with DOM methods. `data.js` configures the unchanged shared i18n module. The shell uses shared header dialogs, Inter, base and header CSS, i18n and embed scripts, one CSP, and versioned assets.

Reviewed against the supplied ZornScience Style Kit sections 1, 4, 5, 6 and 7. New terminology is recorded in `../SPANISH_TERMS.md`. No shared files, WordPress content, worksheets, or PDFs are changed. The shared shell, model API, scientific notation and graph conventions were checked against Reaction Energy Lab, Equilibrium Constant Lab and Solutions Lab. The home catalog includes the activity in both languages.

See [TESTING.md](TESTING.md) for checks and [REPORT.md](REPORT.md) for the delivery report, numerical notes and screenshots. ZornScience, CC BY-NC-SA 4.0. Local Inter font, SIL OFL 1.1.
