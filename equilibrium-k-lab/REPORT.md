# Equilibrium Constant Lab delivery report

Version: 1.0.1

Implemented `/equilibrium-k-lab/` with five modes, shared chrome and Inter, exact mass-action calculations, AP/Chemistry wording, Mexican Spanish, keyboard access, offline interaction and data exports. Shared files are unchanged.

## File list

New activity files:

- `equilibrium-k-lab/index.html`
- `equilibrium-k-lab/chem.js`
- `equilibrium-k-lab/lab.js`
- `equilibrium-k-lab/data.js`
- `equilibrium-k-lab/lab.css`
- `equilibrium-k-lab/README.md`
- `equilibrium-k-lab/TESTING.md`
- `equilibrium-k-lab/REPORT.md`

New tests:

- `tests/unit/equilibrium-k-lab.test.js`
- `tests/e2e/equilibrium-k-lab.spec.js`

Modified glossary: `SPANISH_TERMS.md`, appended activity-specific terminology only.

New screenshots: `equilibrium-k-lab/screenshots/{explore,qk,ice,rules,ksp}-{en,es}.png`, ten PNG files. Each is linked below.

## Parameter examples

- Explore exact HI equilibrium: `/equilibrium-k-lab/?mode=explore&rxn=hi&k=49&c0=0.200&c1=0.200&c2=0`
- Spanish K magnitude: `/equilibrium-k-lab/?mode=explore&rxn=ab&k=0.0001&view=k&lang=es`
- Lesson 7.8 particles: `/equilibrium-k-lab/?mode=explore&rxn=xy&view=particles`
- Q prediction: `/equilibrium-k-lab/?mode=qk&rxn=n2o4&c0=0.200&c1=0.0500`
- Chemistry RICE: `/equilibrium-k-lab/?mode=ice&rxn=n2o4&k=0.0200&course=chem`
- Combine K: `/equilibrium-k-lab/?mode=rules`
- Common ion: `/equilibrium-k-lab/?mode=ksp&salt=agcl&ion=nacl&ionc=0.10`
- Calcium common ion: `/equilibrium-k-lab/?mode=ksp&salt=caf2&ion=ca_no3_2&ionc=0.020`
- Embedded Spanish: `/equilibrium-k-lab/?mode=ksp&salt=pbi2&lang=es&embed=1`

All parameter definitions and all thirteen requested lesson presets are in [README.md](README.md).

## Every added Spanish term

The appended glossary section records these thirty-three terms, including the supplied glossary vocabulary for a self-contained activity record:

constante de equilibrio; cociente de reacción (Q); tabla ICE (inicial, cambio, equilibrio); tabla RICE; producto de solubilidad (Ksp); solubilidad molar; efecto del ion común; ion común; desplazamiento a la derecha; desplazamiento a la izquierda; se favorecen los productos; se favorecen los reactivos; reacción directa; reacción inversa; magnitud de K; aproximación de x pequeña; verificación del 5%; extensión de reacción; bisección; unidad fórmula; presión parcial; coeficiente neto; reacción objetivo; escala logarítmica; sólido: se omite; partículas parciales; reloj de relajación; constante transformada; molaridad; exotérmica; velocidad de reacción directa; velocidad de reacción inversa; perturbación.

All interface and dynamic feedback translations are in `data.js`.

## Model and rounding differences

All requested numerical reference cases are covered by the unit tests. Calculations retain unrounded values internally.

- CaF₂ in 0.020 M Ca(NO₃)₂: exact s = 2.149426618e-5 M, which rounds to 2.1e-5 M at two significant figures. The supplied lesson value is 2.2e-5 M. The exact calculation is retained.
- The supplied 7.10 HI concentration, 0.707 M, is rounded. It produces Q = 49.9849 initially and 24.99245 after raising H₂ to 0.200 M. These round to 50.0 and 25.0 at three significant figures. The rounded initial mixture has a very small predicted shift right because Q is slightly below 50. The UI retains six significant figures in Q/K readouts so the comparison remains visible.
- H₂/I₂ exact x = 0.1555555556 M, remaining reactants = 0.0444444444 M, HI = 0.3111111111 M. The supplied rounded results agree. The supplied equilibrium HI data produce K = 49.37910884, rounding to 49.4.
- NO shortcut [NO] = 0.001264911 M and percent = 0.316227766%, rounding to 0.0013 M and 0.32%. Exact [NO] agrees at two significant figures.
- Pure-water PbI₂ s = 1.348099750e-3 M and AgCl s = 1.341640786e-5 M, agreeing with the supplied two-significant-figure values. Using the supplied rounded CaF₂ s = 2.1e-4 M reconstructs Ksp = 3.7044e-11, rounding to 3.7e-11.
- Curves use a labeled illustrative relaxation time while conserving stoichiometry and ending at the exact bisection solution. Forward/reverse elementary-step rate products are illustrative and satisfy K = kf/kr. They are not measured overall rate laws.
- Temperature calculations use only the supplied numeric N₂O₄ ΔH. SO₃ is labeled exothermic but has no numerical temperature control, because a numeric ΔH was not supplied.
- The heterogeneous example assumes excess solid phases. Ideal behavior and no activity corrections follow the requested model.

The shortcut rule uses strict less than 5%, including rejection at exactly 5%. Final guided answers use the problem's significant figures; a correctly rounded row is accepted without rounding the internal calculation.

## Verification

- Initial-delivery full repository unit suite: 247 passed, 0 failed. After the Style Kit corrections, the chemistry file passed all 10 tests and the repository static checks passed all 6 tests.
- New browser spec: 7 passed on the final code, including English and Spanish axe checks in every mode, at desktop and 360 px, offline interaction, keyboard navigation, exports, URL validation, shared dialogs and embed behavior.
- Reduced-motion probe: the media query returned true and Run rendered all 81 readings immediately.
- Initial-delivery full browser suite: 534 tests ran; the first pass had 524 passes and 10 failures. Two new-lab accessibility failures were fixed and passed in the final focused run. Seven existing failures passed on serial retry: ACT timing, chemical-bonding unknowns, Lewis AP routing group 2, periodic-trends radius/EN/IE routing, and 200 mixed ion-charge rounds.
- One existing browser failure remains: `tests/e2e/gas-lab.spec.js:468`, the 30 FPS check under 4x CPU throttling. It measured 17.9 FPS during the full run and 29.5 FPS on serial retry, below the strict >30 threshold. No gas-lab code changed.
- The system browser was used through a temporary Playwright configuration, without changing the repository configuration. PHP and its required extensions were extracted under `/tmp` for the existing WordPress tests, without repository dependencies or system installation.

Full unit-suite and final static-check results are recorded in TESTING.md.

## Screenshots

| Mode | English | Mexican Spanish |
| --- | --- | --- |
| Explore K | [English](screenshots/explore-en.png) | [Español](screenshots/explore-es.png) |
| Q vs K | [English](screenshots/qk-en.png) | [Español](screenshots/qk-es.png) |
| ICE/RICE | [English](screenshots/ice-en.png) | [Español](screenshots/ice-es.png) |
| K Rules | [English](screenshots/rules-en.png) | [Español](screenshots/rules-es.png) |
| Ksp and Common Ion | [English](screenshots/ksp-en.png) | [Español](screenshots/ksp-es.png) |

## Style Kit conformance review

Reviewed the supplied ZornScience Style Kit v1.8 (November 2, 2026), sections 1, 4, 5, 6 and 7.

| Section | Review and corrections |
| --- | --- |
| 1, brand and writing | ZornScience branding and CC BY-NC-SA 4.0 remain visible. No em dashes. Short student-facing explanations and the Chemistry/AP distinction remain intact. |
| 4, Spanish | Mexican Spanish uses tú, decimal points, unchanged formulas, numbers, units and state symbols. Valid lesson return URLs, the from parameter and the home link follow the selected language, using /es/ for Spanish. HTTPS and exact-host validation remain enforced. |
| 5, interface and titles | Spanish section titles now use noun phrases, including Exploración de K, Preparación de la mezcla, Conversión a molaridad and Construcción de la reacción objetivo. Action buttons remain actions. The supplied activity title is preserved. |
| 6, glossary | Replaced rapidez/rapideces de reacción with velocidad/velocidades de reacción throughout Spanish readouts, graph alternatives, descriptions and CSV headers. Perturbación replaces the stress heading. Existing equilibrium glossary terms are preserved. |
| 7, scope | Activity, tests, docs and repo glossary only. No WordPress changes, PDFs or changes to the Style Kit master. |

The three added glossary entries are velocidad de reacción directa, velocidad de reacción inversa and perturbación. All ten screenshots were refreshed after the corrections. The shared shell was checked against both `/ph-buffer-lab/` and `/solutions-lab/` after rebasing onto the latest main. Both use the same shared header/dialogs, local Inter, CSP, localization, embed behavior and event-based chemistry API.
