# AP Chemistry Unit 7 Practice

Version: 1.0.2

Version 1.0.2 adds search engine tags from `shared/zsa-seo.js`: hreflang links for English and Spanish, a canonical address that keeps `?lang=es` and drops every other parameter, and a description in each language. The activity itself is unchanged.

Version 1.0.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

Original bilingual ZornScience practice aligned to College Board CED Unit 7, Equilibrium. Each of twelve topics has six questions: four multiple choice and two numeric entry. There are 72 questions, 48 multiple choice and 24 numeric, with individual bilingual explanations for all 144 distractors. Mixed review includes all 72. These are original aligned questions, not official College Board exam items.

## Shared engine contract

Follows “Add Unit 4 with two runtime files” in `../shared/README.md`, using Unit 6's index.html, data.js, README.md and TESTING.md as models. Prefix: `zsa-u7`. Activity: `apchem-unit7-practice`. Unit runtime content lives in `index.html` and `data.js`, plus scoped `diagrams.css`. The page preserves the CSP, original dialogs and footer, version 1.0.0 and shared asset order. The strict IIFE exports `{topics, questions, units, copy}` for Node and registers the existing i18n and data events in the browser.

All shared files and earlier activity runtime files are unchanged. No new engine, model, registry entry, build step, runtime dependencies, storage or network requests. No WordPress or zornscience.org changes. State stays in the current tab and resets on reload.

## Content and misconception map

Topic | MC | Numeric | Coverage and misconceptions
--- | --- | --- | ---
7.1 Introduction to Equilibrium | 4 | 2 | Equal nonzero rates, unequal concentration plateaus, rate versus time model, closed systems
7.2 Direction of Reversible Reactions | 4 | 2 | Starting from either side, net rate difference, Q and direction, coefficient exponents
7.3 Reaction Quotient and Equilibrium Constant | 4 | 2 | Law of mass action, Kc and Kp, pure solids and liquids, gaseous water, Kp conversion
7.4 Calculating the Equilibrium Constant | 4 | 2 | Equilibrium data, concentration from amounts, ICE changes, pure liquid exclusion
7.5 Magnitude of the Equilibrium Constant | 4 | 2 | Products or reactants favored, extent versus speed, unequal concentrations, catalyst
7.6 Properties of the Equilibrium Constant | 4 | 2 | Reverse, scale, add and combined operations on equations and K
7.7 Calculating Equilibrium Concentrations | 4 | 2 | Coefficient-weighted ICE rows, full quadratic, physical root, small-x check below 5%
7.8 Representations of Equilibrium | 4 | 2 | Word-described particle models, atom conservation, concentration scale, dynamic exchange
7.9 Introduction to Le Châtelier's Principle | 4 | 2 | Concentration graph, compression, temperature, catalyst, inert gas at constant volume
7.10 Reaction Quotient and Le Châtelier's Principle | 4 | 2 | Q after stresses, inert gas at constant pressure, remaining pure solid, Q versus K shifts
7.11 Introduction to Solubility Equilibria | 4 | 2 | Ksp, saturation, precipitation after mixing, molar solubility for salts with 1:1 and 1:2 ion ratios
7.12 Common-Ion Effect | 4 | 2 | Lower solubility at fixed Ksp, exact common-ion equation, noncommon ion, added solid, checked approximations

Full topic IDs remain strings: 7.1, 7.10, 7.11 and 7.12 are distinct. All supplied English and Spanish topic titles are exact. Each numeric question asks for one scored quantity; where direction or approximation checks are also requested, the explanation supplies that reasoning for self-checking.

The reference includes products over reactants with coefficient exponents, omission of pure solids and liquids, Q versus K and shifts, inverse/power/product rules, Kp = Kc(RT)<sup>Δn</sup> with R = 0.08206 L·atm/(mol·K), ICE guidance and the 5% check, Ksp patterns, precipitation and common ions. All equilibrium equations use ⇌ and chemistry uses real subscript and superscript tags. K and Q values use the established `ratio` unit ID, displayed as no units / sin unidades. Concentrations and molar solubilities use M, rates use M/s and modeled counts use count / conteo. Significant figures match the supplied data. Tolerance is the established half-final-place value with a 10% cushion; exact counts require equality. Precision feedback is advisory and does not remove a point for the correct value and unit.

Four small inline SVGs use the existing visual flags: `curve` for 7.1-2 and 7.1-6, `rates` for 7.1-3, `stress` for 7.9-1, and `particles` for 7.8-1. The concentration models distinguish curves by solid and dashed strokes. The particle figure shows only the initial mixture. All titles, descriptions, labels and captions are bilingual and explicitly call the drawings models. Every prompt also describes the model in words. The rate-versus-time model in 7.1-3 shows both curves reaching an equal nonzero plateau and repeats the initial and final rates in words.

Ideal gas and ideal dilute assumptions keep concentrations and pressures consistent with the stated dimensionless K convention. Solubility calculations exclude side reactions as stated in the prompts. Precipitation data are after mixing and before precipitation. Inert-gas questions explicitly distinguish constant volume from constant total pressure. Temperature changes can change K; concentration, volume, catalysts and inert gases at fixed temperature do not.

## Interface, Spanish and access

Choose one six-question topic or Mixed review. Submit once per question, read feedback and continue. Results show topic scores and missed questions. Try again reshuffles questions and choices. Native selectors, radio groups and buttons support keyboard use. Headings receive focus for questions and results; feedback is announced through the live region. Instructions and Share dialogs support Escape and return focus. Share opens a fresh set. `from=` uses the existing validated lesson backlink.

English: `/apchem-unit7-practice/`. Spanish: `/apchem-unit7-practice/?lang=es`. Mexican Spanish follows the supplied AP glossary, including tabla ICE (inicial, cambio, equilibrio), equilibrio dinámico, cociente de reacción, ley de acción de masas, desplazamiento, principio de Le Châtelier, producto de solubilidad, solubilidad molar, efecto del ion común and solución saturada. Ion has no accent. Additional wording is recorded in `../SPANISH_TERMS.md`.

## Changelog

1.0.0: Added twelve topics, 72 worked bilingual questions, individual distractor feedback, equilibrium reference, four accessible models and the directory entry after Unit 6.

ZornScience. CC BY-NC-SA 4.0.
