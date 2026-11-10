# AP Chemistry Unit 9 Practice

Version: 1.0.1

Original bilingual ZornScience practice aligned to College Board CED Unit 9, Thermodynamics and Electrochemistry. Each of eleven topics has six questions: four multiple choice and two numeric entry. There are 66 questions, 44 multiple choice and 22 numeric, with individual English and Mexican Spanish explanations for all 132 distractors. These are original aligned questions, not official College Board exam items.

## Shared engine contract

Follows “Add Unit 4 with two runtime files” in `../shared/README.md`, using Unit 8 as the model. Prefix: `zsa-u9`. Activity: `apchem-unit9-practice`. Runtime content is in `index.html` and `data.js`, plus scoped unit-owned `diagrams.css`. The strict IIFE exports `{topics, questions, units, copy}` in Node and uses the established data and i18n events in the browser. The CSP, asset order, native dialogs, language links, focus, scoring and footer follow the shared practice contract.

No shared engine, numeric model, i18n or shared styles were changed. The shared About catalog gains the required Unit 9 lesson/activity records. The English About section is generated with `node tools/build-about.js`; it switches to Mexican Spanish at runtime. Descriptions in `tools/seo-pages.js` generate the canonical/hreflang tags and sitemap entries through `node tools/build-seo.js`. No WordPress or zornscience.org content changes, new dependencies, storage or network requests. State remains in the current tab and resets on reload.

## Content and misconception map

Topic | MC | Numeric | Coverage and misconceptions
--- | --- | --- | ---
9.1 Introduction to Entropy | 4 | 2 | Phase changes, gas amounts, temperature, volume, accessible microstates and signed phase entropy differences
9.2 Absolute Entropy and Entropy Change | 4 | 2 | Absolute elemental entropy versus formation convention, third law, coefficients, reverse sign and reaction entropy tables
9.3 Gibbs Free Energy and Thermodynamic Favorability | 4 | 2 | All four ΔH°/ΔS° sign cases, model ΔG° line, J/kJ conversion, favorability and temperature crossing
9.4 Thermodynamic and Kinetic Control | 4 | 2 | Favorable but slow reactions, activation barriers, catalysts, kinetic versus thermodynamic products, formation enthalpies and ΔG°
9.5 Free Energy and Equilibrium | 4 | 2 | ΔG° and K, actual ΔG at equilibrium, Q versus K, natural logarithm and inverse exponential
9.6 Free Energy of Dissolution | 4 | 2 | Entropy-driven endothermic dissolution, gas dissolution, hydration ordering, equilibrium versus rate and signed ΔG°
9.7 Coupled Reactions | 4 | 2 | Shared mechanisms, physical coupling, light/electrical energy, reversing/scaling equations and net free energy
9.8 Galvanic (Voltaic) and Electrolytic Cells | 4 | 2 | Electrode roles and signs, external e− flow, salt bridge ions, electrical work, transferred charge amount and E°cell
9.9 Cell Potential and Free Energy | 4 | 2 | Intensive potentials, coefficients, signed ΔG° = −nFE°, Zn/Ag and reverse Zn/Cu potential
9.10 Cell Potential Under Nonstandard Conditions | 4 | 2 | Qualitative Q effects, equilibrium E = 0, composition changes and exactly two Nernst calculations
9.11 Electrolysis and Faraday's Law | 4 | 2 | Current, charge, time, charge-to-metal stoichiometry, electrolytic cathode, copper mass and silver plating time

The supplied topic titles are exact in both languages, with full string IDs keeping 9.1, 9.10 and 9.11 distinct. The reference includes every requested equation and constant, all S°/ΔH°f/reduction-potential data used, and the earlier units' two-decimal atomic masses plus Cu, Zn and Ag. Supplied values are rounded classroom data, with all calculations consistent with those values. Elements' room-temperature S° values are explicitly distinguished from the zero standard-formation-enthalpy convention.

Two inline SVGs use the existing arbitrary visual flags: `free` for the constant-ΔH°/ΔS° line and `cell` for the Zn/Cu galvanic cell. Titles, descriptions, visible labels and captions are bilingual and label the drawings as models. Their facts are also stated in prompts. The line crosses zero at 600 K. The cell separates external e− flow from salt-bridge ion flow and shows electrode signs.

## Units, signs and precision

New question-set unit IDs are `J/(mol·K)`, `V`, `C` and `A`. Existing `kJ/mol`, `K`, `s`, `g`, `mol` and `ratio` are reused. Ratio is no units / sin unidades. Prompts specify the required unit. Students enter only the number and select the unit; the existing engine performs no conversion and does not parse compound unit suffixes with parentheses or middle dots. The reference and individual explanations identify the J/kJ conversion error. A dedicated multiple-choice distractor diagnoses combining J/mol with kJ/mol. Coefficient-based potential errors have their own feedback.

All entropy-change, free-energy and potential answer displays have explicit + or − signs. Every signed numeric explanation says which sign is required and that the opposite sign is incorrect; independent tests ensure wrong-sign rejection. Positive inputs without a typed + retain the existing engine's mathematically equivalent behavior. The equilibrium zero potential is displayed +0.00 V. Absolute entropy and barrier magnitudes are distinct from signed entropy/free-energy changes.

Precision follows arithmetic: entropy sums and potential differences use decimal places; products, logarithmic thermodynamic calculations and electrolysis use significant figures as supported by their data. Mixed-unit ΔG° calculations retain guard digits and apply subtraction precision at the end. Precision notes are advisory under the existing engine. Tolerance follows the prior units' half-final-place convention with a 10% cushion.

## Interface and Spanish

Choose a six-question topic or Mixed review for all 66. Submit once, read feedback and continue. Results show topic scores and missed questions. Try again reshuffles questions and choices. Native controls support keyboards; question and result headings receive focus and feedback is announced. Header dialogs support Escape and focus return. Share uses a fresh URL; `from=` uses the validated lesson backlink. Embedded mode hides page chrome.

English: `/apchem-unit9-practice/`. Spanish: `/apchem-unit9-practice/?lang=es`. Mexican Spanish follows the supplied AP glossary, including entropía absoluta, energía libre de Gibbs, favorabilidad termodinámica, termodinámicamente favorable, control cinético, reacciones acopladas, celda galvánica (voltaica), celda electrolítica, ánodo, cátodo, puente salino, semirreacción, potencial estándar de reducción, potencial de celda, constante de Faraday, electrólisis and ley de Faraday. Additional wording is recorded in `../SPANISH_TERMS.md`. Decimal points, formulas and state symbols are preserved. Unit names follow the Style Kit, including ampere and coulomb.

## Changelog

1.0.1: Version bump for the shared practice engine, which gains opt-in options for generated question sets. This unit's questions and behavior are unchanged.

1.0.0: Added eleven topics, 66 worked bilingual questions, 132 individual distractor explanations, thermodynamics/electrochemistry reference, two accessible models, directory and translation entries, About/SEO/sitemap integration and question/browser audits.

ZornScience. CC BY-NC-SA 4.0.
