# AP Chemistry Unit 6 Practice

Version: 1.0.2

Version 1.0.2 adds search engine tags from `shared/zsa-seo.js`: hreflang links for English and Spanish, a canonical address that keeps `?lang=es` and drops every other parameter, and a description in each language. The activity itself is unchanged.

Version 1.0.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

Original bilingual ZornScience practice aligned to College Board CED Unit 6, Thermochemistry. Each of nine topics has six questions: four multiple choice and two numeric entry. There are 54 questions, 36 multiple choice and 18 numeric, with individual bilingual feedback for all 108 distractors. Mixed review includes all 54. These are original aligned questions, not official College Board exam items.

## Shared engine contract

Follows “Add Unit 4 with two runtime files” in `../shared/README.md`, with Unit 5's index.html, data.js, README.md and TESTING.md as models. Prefix: `zsa-u6`. Activity: `apchem-unit6-practice`. Runtime content lives in `index.html` and `data.js`, plus scoped `diagrams.css`. The page preserves the original CSP, dialogs, footer, version 1.0.0 and shared CSS/script order. The strict IIFE exports `{topics, questions, units, copy}` for Node and uses the existing one-use i18n/data events in the browser.

All shared files and existing activity runtime files are unchanged. No new engine, model, registry entry, build step, runtime dependency, storage or network calls. No WordPress or zornscience.org changes. Answers stay in the current tab and reset on reload.

## Content and misconception map

Topic | MC | Numeric | Coverage and misconceptions
--- | --- | --- | ---
6.1 Endothermic and Exothermic Processes | 4 | 2 | System boundary, surroundings, first law, heat versus temperature, signs and thermostat control
6.2 Energy Diagrams | 4 | 2 | Endpoint differences, reverse sign, endothermic and exothermic models, catalyst peak versus ΔH
6.3 Heat Transfer and Thermal Equilibrium | 4 | 2 | Direction of heat flow, equal temperatures versus equal thermal energy, heat-capacity-weighted mixing, cooling water
6.4 Heat Capacity and Calorimetry | 4 | 2 | Whole-sample, specific and molar capacities, coffee-cup sign flip, per-mole ΔH, heat-loss bias
6.5 Energy of Phase Changes | 4 | 2 | Heating curve slopes and plateaus, kinetic versus potential energy, fusion, vaporization and their reverses
6.6 Introduction to Enthalpy of Reaction | 4 | 2 | Constant-pressure heat, scaling and reversing coefficients, moles of reaction, state function
6.7 Bond Enthalpies | 4 | 2 | Breaking minus forming, gas-phase estimates, bond counts, phase changes versus covalent-bond breaking
6.8 Enthalpy of Formation | 4 | 2 | Standard-state zero, one mole formed from elements, physical states, coefficient-weighted sums
6.9 Hess's Law | 4 | 2 | Equation addition, scaling and reversal, species and state cancellation, path independence

The reference gives q = mcΔT, water c = 4.18 J/(g·°C), calorimeter heat balance, per-mole ΔH, formation and bond enthalpy equations, all seven bond values, all six nonzero formation values used, elemental zeros and both phase-change values. Every value also appears in its question. Gas-phase bond values give estimates. Water phase-change values apply at normal transition temperatures; formation values apply at 298 K.

ΔH in kJ/mol means per mole of reaction as written unless a named substance is specified. Scaling an equation changes that reaction basis. Heat q is extensive and uses J or kJ; temperature uses °C. The shared unit dropdown accepts no automatic unit conversion. Every numeric q or ΔH answer displays an explicit + or − sign, and its authored explanation states which sign is required and why the opposite sign is incorrect. The existing numeric parser accepts typed ASCII + and -; displayed negative answers use the typographic minus. A missing explicit + is accepted for a positive number, as in the existing engine. The numeric value still has the correct positive sign, and every opposite-sign entry is rejected.

The three unit-owned SVG models use flags `exo`, `endo` and `curve`. All six energy-diagram prompts restate the model's values. Heating-curve questions specify all five segments. SVG titles, descriptions, visible labels and captions are translated. Models are schematic and labeled as models; no drawing or CSS was added to shared files.

## Interface and access

Choose one six-question topic or Mixed review. Submit once per question, read feedback and continue. Precision notes do not remove a point for a correct value and unit. Results show topic scores and missed questions; Try again shuffles questions and answer choices. Native selectors, radio groups and buttons support keyboard use. Question and result headings receive focus as in Unit 5. Instructions and Share dialogs preserve Escape and return focus. Language selection uses `?lang=es`, Mexican Spanish and the existing validated lesson backlink.

## Spanish

Uses the exact supplied topic titles and AP glossary terms, including sistema, alrededores, equilibrio térmico, capacidad calorífica específica (calor específico), capacidad calorífica molar, calorímetro de vaso de espuma, entalpía de reacción, entalpía de enlace, entalpía estándar de formación, estado estándar, función de estado and primera ley de la termodinámica. Units, decimal points and state symbols are preserved. Additional wording is recorded in `../SPANISH_TERMS.md`.

## Changelog

- 1.0.0: Added nine topics, 54 worked questions, individual distractor feedback, signed numeric answers, thermochemistry reference, three accessible models and directory entry. ZornScience, CC BY-NC-SA 4.0.
