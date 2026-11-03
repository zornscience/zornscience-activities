# Free Energy Lab delivery report

Version: 1.0.0

Implemented `/free-energy-lab/` with all six modes, English and Mexican Spanish, AP/Chemistry wording and data, explicit unit conversions, misconception feedback, accessible diagrams and tables, keyboard controls, local exports and the unchanged shared shell. No shared files were modified.

## File list

- `free-energy-lab/index.html`
- `free-energy-lab/chem.js`
- `free-energy-lab/lab.js`
- `free-energy-lab/data.js`
- `free-energy-lab/lab.css`
- `free-energy-lab/README.md`
- `free-energy-lab/TESTING.md`
- `free-energy-lab/REPORT.md`
- `free-energy-lab/screenshots/{entropy,ds,dg,control,k,coupled}-{en,es}.png`, twelve screenshots
- `tests/unit/free-energy-lab.test.js`
- `tests/e2e/free-energy-lab.spec.js`
- `SPANISH_TERMS.md`, appended Free Energy Lab terminology only

The requested `/reaction-energy-lab/` reference is absent from this checkout. The implementation follows `/equilibrium-k-lab/` and `/solutions-lab/`. Inter, header, instructions/share dialogs, footer, embed behavior, i18n, CSP and versioned assets use their existing conventions. The site has no build step and the lab makes no runtime network requests. Its initial HTML, scripts, styles, font and icon are local assets.

## Parameter examples

| Lesson or example | Path |
| --- | --- |
| AP 9.1 | `/free-energy-lab/?mode=entropy` |
| AP 9.2 | `/free-energy-lab/?mode=ds&rxn=ch4` |
| AP 9.3 | `/free-energy-lab/?mode=dg&rxn=haber` |
| AP 9.4 | `/free-energy-lab/?mode=control&case=sucrose` |
| AP 9.5 | `/free-energy-lab/?mode=k&case=haber` |
| AP 9.6 | `/free-energy-lab/?mode=coupled&case=nh4no3` |
| AP 9.7 | `/free-energy-lab/?mode=coupled&case=iron` |
| Chemistry lesson | `/free-energy-lab/?mode=dg&rxn=caco3&course=chem` |
| Spanish temperature comparison | `/free-energy-lab/?mode=dg&dh=40&ds=100&t=600&lang=es` |
| Unknown S° | `/free-energy-lab/?mode=ds&rxn=no2` |
| SO₃ formation method | `/free-energy-lab/?mode=dg&rxn=so3` |
| Mercury coupling | `/free-energy-lab/?mode=coupled&case=mercury` |
| Embedded Spanish K | `/free-energy-lab/?mode=k&case=acetic&lang=es&embed=1` |

`README.md` documents every allowed reaction ID, numeric range, fallback and combinable parameter. `from` accepts HTTPS on exactly zornscience.org and rejects credentials, other hosts and nondefault ports. The selected language controls the lesson/home language path. EN/ES preserves URL settings and reloads fresh answers. The shared Share dialog contains a fresh canonical URL and selected language.

## New Spanish terms

These eighteen activity-specific choices were appended to `SPANISH_TERMS.md`:

| English | Mexican Spanish |
| --- | --- |
| crossover temperature | temperatura de cruce |
| common intermediate | intermediario común |
| entropy-driven | impulsada por la entropía |
| enthalpy-driven | impulsada por la entalpía |
| ion-dipole attractions | atracciones ion-dipolo |
| hydration | hidratación |
| accessible microstates | microestados accesibles |
| matter becomes more dispersed | la materia se dispersa más |
| matter becomes less dispersed | la materia se dispersa menos |
| ordering of water | ordenamiento del agua |
| fixed lattice | red fija |
| mobile neighbors | partículas vecinas móviles |
| activation barrier | barrera de activación |
| observed reaction rate | velocidad de reacción observada |
| Gibbs free energy of formation | energía libre de Gibbs de formación |
| four-case sign grid | cuadro de los cuatro casos de signos |
| coupled-reaction partner | reacción para acoplar |
| Maxwell-Boltzmann style curves | curvas de tipo Maxwell-Boltzmann |

The supplied glossary terms, including entropía, microestado, energía libre de Gibbs, favorabilidad termodinámica, control cinético / control termodinámico, reacción acoplada, energía de activación, estado estándar and kelvin, are preserved. Headings use noun phrases. Formulas, charges, decimal points, numbers, units and state symbols remain unchanged. No em dashes are used.

## Model and rounding notes

Calculations retain unrounded values. Worked Gibbs answers follow the decimal-place precision of ΔH and the significant figures of TΔS; the two salt examples preserve their supplied one-decimal-place enthalpy precision. Reference S° entries show their supplied precision. Tables show four significant figures, and CSV preserves up to fifteen using typographic scientific notation. Extra table digits support comparison and are not an instruction to round intermediate work.

| Example | Internal result and lesson comparison |
| --- | --- |
| CH₄ combustion, H₂O(l) | ΔS° = −242.8 J/(molrxn·K), as requested |
| NH₄Cl, AP | ΔS° = +284.8, as requested |
| NH₄Cl, Chemistry | +285.1 because Chemistry uses NH₃ S° = 192.8 instead of 192.5 |
| Unknown S°(NO₂) | 240.1 J/(mol·K), as requested |
| Haber, Chemistry entropy table | −198.1 J/K, as requested |
| Haber, AP entropy table | −198.7 from the supplied rounded S° entries. The ΔG preset independently retains the requested lesson ΔS° = −198.8. |
| Haber at 298 K | AP −32.9576 kJ/molrxn, displayed −33.0; Chemistry −33.1662 kJ, displayed −33.2 |
| Forgotten J-to-kJ conversion | Incorrect AP result +59150.2, accepted as the targeted misconception near 5.9 × 10⁴ |
| SO₃ formation method | −141.8 kJ/molrxn, as requested |
| CaCO₃ crossover, AP | 1110.2117061 K, displayed 1.11 × 10³ K |
| CaCO₃, Chemistry | ΔG = +130.022 kJ at 298 K, displayed 130. to mark three significant figures; crossover 1105.5900621 K, displayed 1.11 × 10³ K |
| 2NO₂ → N₂O₄ | ΔH/ΔS gives −4.7818 kJ at 298 K and K = about 6.89. The independent K preset uses the supplied −4.8 kJ, giving K = 6.9405473, displayed 6.9. Favored at low T only. |
| −32.9 kJ to K | Exponent 13.2791297, displayed with guard digits; K = 584861.1389, displayed 5.8 × 10⁵ |
| Haber chained ΔH/ΔS to K | Uses −32.9576 internally, so K is about 6.0 × 10⁵ rather than the standalone −32.9 example's 5.8 × 10⁵ |
| Acetic acid | Ka = 1.8 × 10⁻⁵ gives ΔG° = +27.067818 kJ/molrxn, displayed +27 to two significant figures |
| N₂ + O₂ → 2NO | +173.2 kJ gives K far below 1. The K marker clamps at the log-axis ends; the numerical result is not clamped. The ΔG slider also sits at its limit for this +173.2 kJ case; moving it starts a new value within its −60 to +60 kJ range. |
| NH₄NO₃ dissolving | −4.2926 kJ, displayed −4.3; entropy-driven |
| CaCO₃ dissolving | +47.4642 kJ, displayed +47.5; not favored |
| Iron coupling | −58.8 kJ/molrxn; O₂ cancels |
| Mercury coupling | −249.6 kJ/molrxn; S cancels |

The thermodynamic temperature model assumes constant ΔH and ΔS over 100 to 2000 K. The particle drawings are schematic, and the argon speed curves use normalized ideal Maxwell-Boltzmann densities. No phase transitions, heat-capacity corrections, activity corrections, solubility amounts or actual reaction times are inferred.

The kinetic diagram is explicitly schematic. Since measured Ea and rate data were not supplied, reference barriers are illustrative 320, 180 and 200 kJ/mol for sucrose, H₂/Cl₂ and the unfavored case. A catalyst reduces the illustrative barrier to 30% of its starting value, keeping the unfavored case's barrier above its higher product level. Catalyst or heating toggles raise the favored-case rate meter from 0.002 to 0.85; light initiates only H₂/Cl₂. The unfavored case remains thermodynamically unfavored. Heating holds the reference ΔG fixed for this kinetic comparison, with an explicit note that real ΔG can change with T. The separate temperature mode computes that change.

## Style Kit review

Read the supplied `ZornScience Style Kit-1.pdf`, sections 1, 4, 5, 6 and 7. Branding/license and short explanations follow section 1; Mexican Spanish, units and language paths follow section 4; headings and interface conventions follow section 5; thermodynamics and kinetics terminology follows section 6; repository activity/tests/glossary scope follows section 7. Shared files, WordPress content and PDFs are unchanged.

## Verification

- Final Free Energy Lab model suite: 12 passed.
- Final Free Energy Lab browser suite: 20 passed, including all twelve English/Spanish mode checks at 360 px, contrast/accessibility, offline use, keyboard controls, safe URLs, dialogs, exports and screenshots. The shared-shell Spanish regression check also passed after its assertions were expanded. Final targeted checks passed for the staged entropy flow, reference-data exports, refreshed DS screenshots, and both K line-style legends.
- Final repository static checks: 6 passed. No shared files changed, and `git diff --check` is clean.
- Repository unit run: 275 of 276 passed initially with the temporary PHP runtime. The remaining existing WordPress test required iconv; after enabling that extension, both ACT History tests passed. The final model/static rerun also passed after the last changes.
- Quick parity against the clean starting HEAD (`40dbd91`): 5 scenarios, 984 compared states, 936 screenshot pairs, no differences. This compares the user's actual starting checkout; its `origin/main` reference is older.
- Full browser verification covered all 575 current cases across the original run and a targeted resume after the environment reconnected: 557 passed, 17 failed in unchanged existing activities, and one additional existing Lewis AP routing test stalled beyond its 400-second limit and was stopped. The resumed run recorded 24 passes and that stopped worker. No Free Energy Lab test failed in the final checks.

Checks used the system Chromium through a temporary Playwright configuration, plus a temporary PHP runtime outside the repository. No runtime or development dependencies were added to the repository.

## Existing browser checks that did not pass

These files were not modified. The first seventeen failures below occurred in the original broad run. The last test was stopped after its resumed worker stalled beyond the test's 400-second budget; its recorded worker-exit failure is not a new lab regression.

| Test location | Check |
| --- | --- |
| `tests/e2e/act-platform.spec.js:247` | English with the drafts: mixed practice is 2 passages in 14 minutes, the full section 5 passages in 35 minutes |
| `tests/e2e/act-platform.spec.js:441` | full ACT: English, Math, the break, Reading and Science, then a composite and section reports |
| `tests/e2e/act.spec.js:311` | layout: no sideways scrolling, 44 px bottom bar targets, bar on screen, passage pane scrolls on its own |
| `tests/e2e/act.spec.js:483` | line reader: toggles, keyboard moves and resizes, drags with the mouse, stays on across questions |
| `tests/e2e/act-platform.spec.js:323` | every Math question plays from the drafts list, reads well, and its marked answer is scored correct |
| `tests/e2e/chemical-bonding-lab.spec.js:3` | all unknowns show consistent solid, solution, solvent and mechanical responses |
| `tests/e2e/gas-lab.spec.js:468` | gas lab: the animation stays above 30 frames per second with the most particles on a 4x slower CPU |
| `tests/e2e/i18n.spec.js:707` | chemical-bonding-lab opens in Mexican Spanish and translates every station, the instructions and sharing |
| `tests/e2e/i18n.spec.js:2847` | virtual-lab-graphing opens in Mexican Spanish and translates the data table, examples, fit results, errors, the graph, downloads and sharing |
| `tests/e2e/ionic-reactions.spec.js:211` | all forty ionic problems require balancing and each selected family can be completed and replayed |
| `tests/e2e/lewis-flow.spec.js:331` | every item, every step: the rendered text has no dashes or hyphen-minus charges |
| `tests/e2e/lewis-flow.spec.js:277` | rounds: 80 octet rounds and 120 AP rounds meet the round rules |
| `tests/e2e/periodic-trends.spec.js:97` | periodic trends: every wrong pick routes to its feedback (radius) |
| `tests/e2e/periodic-trends.spec.js:97` | periodic trends: every wrong pick routes to its feedback (en) |
| `tests/e2e/periodic-trends.spec.js:97` | periodic trends: every wrong pick routes to its feedback (ie) |
| `tests/e2e/periodic-trends.spec.js:135` | periodic trends: 40 seeded rounds follow the round rules |
| `tests/e2e/rounds.spec.js:30` | Ion Charge Trainer: 200 mixed rounds meet the round rules |
| `tests/e2e/lewis-routing.spec.js:34` | AP feedback routing, group 2: stalled beyond 400 seconds; worker stopped |

The wider repository suite is not fully green. The isolated Free Energy Lab checks and unchanged-activity parity checks pass.

## Screenshots

| Mode | English | Mexican Spanish |
| --- | --- | --- |
| Entropy Explorer | [English](screenshots/entropy-en.png) | [Español](screenshots/entropy-es.png) |
| ΔS° Calculator | [English](screenshots/ds-en.png) | [Español](screenshots/ds-es.png) |
| ΔG and Temperature | [English](screenshots/dg-en.png) | [Español](screenshots/dg-es.png) |
| Kinetic vs Thermodynamic Control | [English](screenshots/control-en.png) | [Español](screenshots/control-es.png) |
| ΔG° and K | [English](screenshots/k-en.png) | [Español](screenshots/k-es.png) |
| Dissolving and Coupled Reactions | [English](screenshots/coupled-en.png) | [Español](screenshots/coupled-es.png) |
