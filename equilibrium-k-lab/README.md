# Equilibrium Constant Lab

Version: 1.0.4

Version 1.0.4 improves keyboard and screen reader access. Every focusable element, including summaries, text areas and custom controls, now shows the same visible focus ring (`shared/zsa-lab-a11y.css`), a blue ring with a white gap that reads on light and dark panels and in high contrast mode. `tests/e2e/labs-a11y.spec.js` now checks this lab in English and Mexican Spanish with axe-core, the Tab order, a visible focus indicator on every stop, names and states of custom controls, and text alternatives for drawings. The science, scoring and any completion code are unchanged.

Version 1.0.3 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

Version 1.0.2 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

Open `/equilibrium-k-lab/`. This static activity teaches AP Chemistry Unit 7.1 to 7.8, 7.10, 7.11 and 7.12, plus Chemistry Equilibrium and RICE Tables. No build, account, persistence, tracking, runtime dependency or application network request is required. Scripts, styles, favicon and Inter font load from this repository. Shared files are unchanged.

## Files

- `index.html`: shared header, instruction and Share dialogs, footer, CSP and mode panels.
- `chem.js`: DOM-independent CommonJS model and `zsa-ek:request-model` browser event API.
- `lab.js`: controls, accessible tables and SVGs, URL settings, data exports.
- `data.js`: complete Mexican Spanish dictionary using shared `zsa-i18n`.
- `lab.css`: scoped responsive layout and visible focus.
- `README.md`, `TESTING.md`: usage, model assumptions and verification.
- `screenshots/`: five modes in English and Spanish.
- `REPORT.md`: delivery file list, examples, terminology, numerical notes, validation and screenshots.
- `../tests/unit/equilibrium-k-lab.test.js`, `../tests/e2e/equilibrium-k-lab.spec.js`.
- `../SPANISH_TERMS.md`: activity terminology additions.

## URL parameters

Parameters combine with `&`. Invalid or out-of-range values use defaults. Reaction and salt IDs are checked as own properties. Language switching preserves settings and reloads a fresh activity; row answers and run history are never serialized.

| Parameter | Values and default |
| --- | --- |
| `mode` | `explore` (default), `qk`, `ice`, `rules`, `ksp` |
| `rxn` | `hi` (default), `n2o4`, `pcl5`, `co`, `nh3`, `no`, `so3`, `caco3`, `ab`, `xy` |
| `k` | Positive finite K, 1e-30 to 1e30; default is the selected reaction's library K |
| `c0`, `c1`, `c2`, `c3` | Initial values in balanced equation species order, 0 to 1.00 M; atm for `caco3`. Missing values use library defaults. Solids are left out and treated as excess phases. |
| `view` | `curves` (default), `particles`, `k`. Particles support `ab` and `xy`; K magnitude supports `ab`. |
| `salt` | `agcl` (default), `agbr`, `pbi2`, `caf2`, `ag2cro4` |
| `ion` | `nacl`, `nabr`, `nai`, `naf`, `ca_no3_2`, `agno3`, `na2cro4`. A valid supplied source selects common-ion solution; otherwise pure water. |
| `ionc` | Source formula-unit molarity, 0 to 0.50 M (default 0). Only the salt's matching ions enter Ksp. |
| `course` | `chem` gives plain K and RICE with a balanced reaction R row; default AP gives Kc or Kp and ICE. |
| `lang` | `es` for Mexican Spanish; default English |
| `from` | Lesson return URL. Only HTTPS on exactly `zornscience.org`, with no credentials or nondefault port, is accepted. The lesson path follows the selected language, using `/es/` in Spanish. The course-specific fallback follows the same rule. |
| `embed` | `1` enables shared embed behavior, hides site chrome and reports height to the parent. |

Settings update the address bar. The shared Share dialog intentionally supplies a clean activity link with language only, matching the pH lab. It omits experimental settings and answers. Copy the address bar to share a configured lesson preset.

Examples:

- `/equilibrium-k-lab/?mode=qk&rxn=n2o4&c0=0.200&c1=0.0500`
- `/equilibrium-k-lab/?mode=explore&rxn=ab&k=0.0001&view=k&lang=es`
- `/equilibrium-k-lab/?mode=ksp&salt=caf2&ion=ca_no3_2&ionc=0.020`
- `/equilibrium-k-lab/?mode=ice&rxn=n2o4&k=0.0200&course=chem`

## Lesson presets

Append these queries to `/equilibrium-k-lab/`:

| Lesson | Query |
| --- | --- |
| Chemistry Equilibrium | `?mode=explore&rxn=nh3&course=chem` |
| Chemistry RICE Tables | `?mode=ice&rxn=n2o4&k=0.0200&course=chem` |
| 7.1 | `?mode=explore&rxn=n2o4` |
| 7.2 | `?mode=explore&rxn=ab` |
| 7.3 | `?mode=explore&rxn=nh3` |
| 7.4 | `?mode=ice&rxn=hi` |
| 7.5 | `?mode=explore&rxn=ab&view=k` |
| 7.6 | `?mode=rules` |
| 7.7 | `?mode=ice&rxn=hi&k=49.0` |
| 7.8 | `?mode=explore&rxn=xy&view=particles` |
| 7.10 | `?mode=qk&rxn=hi&k=50.0` |
| 7.11 | `?mode=ksp&salt=pbi2` |
| 7.12 | `?mode=ksp&salt=agcl&ion=nacl&ionc=0.10` |

## Model and rounding

Mass action uses products over reactants, stoichiometric exponents, and omits pure solids and liquids. K is dimensionless. Concentrations are ideal molarity; Kp uses partial pressures in atm. Each run and ICE answer uses 200 bisection iterations on reaction extent within nonnegative physical concentration bounds. Excess pure phases are reservoirs, so solid inventory does not bound the heterogeneous example. An all-zero closed mixture has undefined Q and cannot move.

The illustrative elementary-step forward and reverse rate products use `kf = K/(1+K)` and `kr = 1/(1+K)`. They become equal at equilibrium. These are illustrative formal rate products for teaching, not measured rate laws for the listed overall reactions. Curves use an exponential relaxation in reaction extent, conserving stoichiometry, with the exact equilibrium endpoint at step 80. The time scale has no real-time calibration. Reduced motion renders the full run immediately.

Q vs K applies stresses to the latest displayed mixture. Volume changes all participating concentrations together. Temperature changes K with the van 't Hoff relation while the instantaneous concentrations and Q stay fixed. N₂O₄ uses +57.2 kJ/mol. SO₃ is labeled exothermic but has no temperature calculation, because the supplied library gives no numeric ΔH. K otherwise stays fixed at a given temperature. Temperature is bounded to 200 to 500 K in the controls.

ICE/RICE initial values and supplied equilibrium values belong to each guided problem. The HI K-given problem honors the HI `k` preset. Other problem types carry their own lesson constants and data. All rows use text inputs. I accepts numbers; C and E accept either numeric answers or linear expressions such as `-x`, `+2x`, `0.100 - x` and `0.050 + 2x`. The parser accepts hyphens, real minus signs and U+2013, spaces, a leading plus, implicit coefficient 1, and optional multiplication signs. It rejects nonlinear operations, function calls and code. No dynamic code execution is used.

The model checks the constant term and coefficient separately. C follows stoichiometry in the predicted direction; E is I + C. Student x is nonnegative, including when the reaction shifts left. Correct rows unlock the next row. Moles problems require conversion first. Hints appear only on request. After E, Solve for x shows the supplied equilibrium relation, the HI square-root step, the separate small-x calculation and 5% check, or the exact-equilibrium method. Checking x reveals the numeric equilibrium row and its K entry. Numeric C/E answers remain valid. Internal calculations never use a rounded student x. The lesson rule remains: "(x ÷ starting concentration) × 100 should be less than 5%." Equality at 5% fails.

Each particle represents 0.10 mol in 1.0 L. Fractional particles scale by area, with a labeled minimum visible size for tiny fractions. Tiny nonzero product concentrations remain in the numerical alternative. Ksp solves the complete common-ion polynomial numerically, including ions contributed by dissolution. Alongside that exact result, a separate shortcut freezes the supplied common-ion concentrations, solves for s, and reports the largest neglected ion change as a percent of its initial concentration. A failed 5% check leaves the exact result authoritative. The dissolution table shows signed C entries and symbolic E entries above their numeric concentrations. Common-ion inputs retain two or three significant figures, including trailing zeros such as 0.050. Pure-water and selected-solution values are in the data table. Different ion ratios require comparing s rather than ranking Ksp.

All lesson answers and Q readouts use three significant figures; Ksp answers use two. Values below 0.001 M or at least 10,000 use a real multiplication sign and superscript powers, for example 1.8 × 10⁻¹⁰. Decimal notation preserves significant trailing zeros. K expressions use superscript exponents and adjacent factors, such as Kc = [HI]² / [H₂][I₂]. Kp species use subscript elements; an empty denominator gives only the pressure term. Legends pair color swatches with solid line or dashed line. Concentration axes use 1, 2 or 5 times a power of ten for their step; the logarithmic Q/K line uses round decade ticks and the same number formatter.

Copy data follows the displayed precision. CSV retains the full JavaScript number precision for run concentrations, Q, rates, numeric ICE results and solubility. Unsolved symbolic rows remain symbolic in the export, so exporting does not reveal an unrequested x. Q comparisons use unrounded values with a relative log tolerance of 1e-6; when two rounded labels match but the direction is not equilibrium, a note explains the comparison.

Numerical differences from the supplied values:

- H₂/I₂ exact x is 0.1555555556 M, giving 0.0444444444 M and 0.3111111111 M, consistent with the requested rounding. K from the supplied HI equilibrium data is 49.37910884, displayed as 49.4.
- The 7.10 HI mixture uses 0.707 M as supplied: initial Q = 49.9849 and after added H₂ Q = 24.99245, equivalent to 50.0 and 25.0 at three significant figures. The Q readout uses three significant figures; comparisons retain full precision and explain any direction hidden by rounding. Initial Q is very slightly below K, rather than exactly equal, because 0.707 is rounded.
- CaF₂ in 0.020 M calcium nitrate gives exact s = 2.149426618e-5 M, displayed as 2.1 × 10⁻⁵ M at two significant figures. The common-ion shortcut gives 2.2 × 10⁻⁵ M because it neglects s in 0.020 + s. The supplied 2.2e-5 M differs at the rounding boundary; it is not forced into the calculation.
- PbI₂ in pure water gives 1.348099750e-3 M; AgCl gives 1.341640786e-5 M. Both round to the requested two-significant-figure lesson values.
- NO shortcut [NO] = 0.001264911 M and percent = 0.316227766%, displayed as 0.00126 M at the requested three significant figures and 0.32%. Both methods round to the original lesson's 0.0013 M at two significant figures.
- CaF₂ Ksp reconstructed from rounded s = 2.1e-4 M is 3.7044e-11, rounding to 3.7e-11.

## Spanish terminology added

The activity section in `SPANISH_TERMS.md` records every new activity-specific term: constante de equilibrio; cociente de reacción (Q); tabla ICE (inicial, cambio, equilibrio); tabla RICE; producto de solubilidad (Ksp); solubilidad molar; efecto del ion común; ion común; desplazamiento a la derecha; desplazamiento a la izquierda; se favorecen los productos; se favorecen los reactivos; reacción directa; reacción inversa; magnitud de K; aproximación de x pequeña; verificación del 5%; extensión de reacción; bisección; unidad fórmula; presión parcial; coeficiente neto; reacción objetivo; escala logarítmica; sólido: se omite; partículas parciales; reloj de relajación; constante transformada; molaridad; exotérmica; velocidad de reacción directa; velocidad de reacción inversa; perturbación. These include the requested glossary terms for a self-contained activity record.

Reviewed against the attached ZornScience Style Kit v1.8 (November 2, 2026), sections 1, 4, 5, 6 and 7. Spanish reaction rates use velocidad de reacción, headings use noun phrases, and lesson/home links follow the selected language. This work is limited to the repository activity, tests and glossary; no PDFs or WordPress pages were changed. The shared shell was checked against both `/ph-buffer-lab/` and `/solutions-lab/` after updating the branch to the latest main.

## Algebra and common-ion screenshots

| View | English | Mexican Spanish |
| --- | --- | --- |
| ICE/RICE after symbolic E, before solving x | [English](screenshots/ice-mid-problem-en.png) | [Español](screenshots/ice-mid-problem-es.png) |
| CaF₂ with 0.020 M calcium nitrate | [English](screenshots/ksp-common-ion-en.png) | [Español](screenshots/ksp-common-ion-es.png) |

The additional Spanish terms are expresión lineal, término constante, coeficiente de x, resolución de x, paso de la raíz cuadrada, notación científica, línea continua and línea discontinua. They are recorded in SPANISH_TERMS.md. The requested Equilibrium Constant Lab version remains 1.0.1.
