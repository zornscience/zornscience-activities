# AP Chemistry Unit 5 Practice

Version: 1.0.2

Version 1.0.2 adds search engine tags from `shared/zsa-seo.js`: hreflang links for English and Spanish, a canonical address that keeps `?lang=es` and drops every other parameter, and a description in each language. The activity itself is unchanged.

Version 1.0.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

Original bilingual ZornScience practice aligned to College Board CED Unit 5, Kinetics. Each of eleven topics has six questions, 66 total: 44 multiple choice and 22 numeric entry. Every topic has four multiple-choice and two numeric questions. Each of the 132 distractors has its own bilingual explanation. Mixed review includes all 66. These are original aligned questions, not official College Board exam items.

## Shared engine contract

Follows “Add Unit 4 with two runtime files” in `../shared/README.md`, using Unit 4's page, data events, documentation and testing as models. The two runtime files are `index.html` and `data.js`, with optional scoped `diagrams.css`. Prefix: `zsa-u5`. Activity: `apchem-unit5-practice`. The page loads shared base, practice, diagram and header styles, then deferred embed, i18n, data, practice model, practice controller and header scripts. Every version is 1.0.0. No new engine, model, registry or build step.

The strict IIFE exports `{topics, questions, units, copy}` for Node and registers the existing i18n/data events in the browser. Full string IDs preserve 5.1, 5.10 and 5.11 as distinct topics. All shared files and all existing activity runtime files are unchanged. No WordPress or zornscience.org changes. No accounts, runtime dependencies, data collection, storage or network calls. State stays in the current tab and resets on reload.

## Content and misconception map

Topic | MC | Numeric | Coverage and common misconceptions
--- | --- | --- | ---
5.1 Reaction Rates | 4 | 2 | Average versus instantaneous velocity, tangent versus secant, positive disappearance and coefficient ratios
5.2 Introduction to Rate Law | 4 | 2 | Initial-rate table, independent comparisons, individual versus overall order, units of k, zero order
5.3 Concentration Changes Over Time | 4 | 2 | Zero-, first- and second-order linear plots, first-order half-life, integrated second-order calculation
5.4 Elementary Reactions | 4 | 2 | Molecularity counts reacting particles, elementary exponents, rarity of three-particle encounters
5.5 Collision Model | 4 | 2 | Energy and orientation, concentration versus temperature, qualitative Arrhenius equation, exact collision-count model
5.6 Reaction Energy Profile | 4 | 2 | Activated complex and transition state, forward/reverse activation energy, signed ΔH, reaction coordinate versus time
5.7 Introduction to Reaction Mechanisms | 4 | 2 | Sum and cancel steps, intermediate versus catalyst, stoichiometric and kinetic consistency
5.8 Reaction Mechanism and Rate Law | 4 | 2 | Slow first elementary step, rate-determining step, overall coefficients versus measured orders
5.9 Pre-Equilibrium Approximation | 4 | 2 | Fast reversible balance, eliminate intermediate, extra concentration factor, free equilibrium concentrations
5.10 Multistep Reaction Energy Profile | 4 | 2 | Peaks and valleys, local forward barriers, explicit assumptions for slower-step inference, overall ΔH
5.11 Catalysis | 4 | 2 | Alternative pathways, unchanged ΔH and equilibrium, heterogeneous surface sites, barrier differences

The reference panel supplies all three integrated rate laws and linear plots, first-order t½ = 0.693/k, rate = k[A]<sup>m</sup>[B]<sup>n</sup>, overall order and the general units-of-k pattern with examples. Rate laws assume constant temperature and volume where needed. Initial-rate data are written as compact rows in the prompt because the engine accepts subscript and superscript markup, not arbitrary table HTML.

Four inline SVG models use `data-zsa-practice-visual` flags `linear`, `single`, `multi` and `catalysis`. The existing engine shows only a current question's flagged figure. Each has a translated title, description, axis labels and model caption. All numerical information also appears in the prompts. Catalyzed and uncatalyzed paths use dashed and solid strokes. No scientific drawing or style was added to the shared engine.

Single-step levels are reactants 20, peak 80, products 0. Multistep levels are reactants 20, first peak 70, intermediate 40, second peak 100, products 10. Catalysis levels are reactants 20, products 0, uncatalyzed peak 90 and catalyzed peak 55. Energies are schematic kJ/mol model values. Multistep rate inference explicitly assumes comparable prefactors and use of local barriers. A peak alone cannot determine a complete real-world mechanism. The pre-equilibrium questions use free equilibrium concentrations; the concentration-form K has the stated inverse-concentration units. Mechanism agreement is necessary evidence, not proof of a unique mechanism.

## Language, scoring and keyboard

English: `/apchem-unit5-practice/`. Mexican Spanish: `/apchem-unit5-practice/?lang=es`. Exact user-supplied topic titles and AP terms are retained. Reaction rate is velocidad. The rate-determining step is paso determinante de la velocidad. Extra vocabulary is recorded in `../SPANISH_TERMS.md`.

One scored submission per question. Invalid values or missing units request correction before scoring. Correct value and unit earn one point; significant-figure and decimal-place feedback is advisory. Approximate answers use half a final place plus a 10% cushion around the unrounded result. Exact model counts and ratios require equality. Native unit selectors use reciprocal notation, for example 1/(M M s), because option elements cannot contain semantic superscripts. Prompts, choices, explanations and the reference use real subscript and superscript tags. Enter the number and choose its unit; the unchanged parser also accepts simple compatible suffixes such as M/s, kJ/mol and mol/L. Compound inverse-unit expressions should be selected from the unit menu. Units do not convert automatically.

Tab moves through native controls; arrows operate radios and selects. New questions focus their heading, checked answers focus Next question, results focus their heading and topic switching focuses the selector. Feedback uses a polite live region; validation uses an alert. Results show topic scores and expandable missed-question explanations. Try again reshuffles questions and choices. Header dialogs, fresh Share links, EN/ES controls, validated lesson backlinks and embed support follow Unit 4.

## Changelog

1.0.0: Added 66 worked bilingual questions, four accessible models, kinetics reference, independent answer audits, browser coverage and the directory entry after Unit 4. Shared engine unchanged.

ZornScience. CC BY-NC-SA 4.0.
