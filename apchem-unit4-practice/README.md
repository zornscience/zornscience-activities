# AP Chemistry Unit 4 Practice

Version: 1.0.3

Version 1.0.2 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

Version 1.0.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

Original bilingual ZornScience practice for College Board CED Unit 4, Chemical Reactions. Each of nine topics has six questions, 54 total: 36 multiple choice and 18 numeric entry. Every topic uses both formats. Mixed review includes all 54. Every wrong choice has its own explanation. These are aligned original practice questions, not official College Board exam items.

## Shared engine contract

Follows “Add Unit 4 with two runtime files” in `../shared/README.md`. The only runtime scripts/content owned by the unit are `index.html` and `data.js`. The optional scoped `diagrams.css` handles the particle SVG. Unit 1's page supplies the markup template, header dialogs, language controls, reference layout and licensed footer. The page loads shared base, practice, optional diagram and header styles, then deferred embed, i18n, data, practice model, practice controller and header scripts in that order. All version strings are 1.0.0.

The strict IIFE exports `{topics, questions, units, copy}` for Node tests and registers the existing data/i18n events in the browser. No shared engine files, other unit banks, WordPress files or zornscience.org pages are changed. No registry entry or build step. No runtime dependencies, accounts, data collection, storage or network requests. CSP blocks connections; state stays in the tab and disappears on reload.

## Content and misconception map

Topic | MC | Numeric | Coverage and common misconceptions
--- | --- | --- | ---
4.1 Introduction for Reactions | 5 | 1 | Evidence of a reaction, boiling bubbles versus new substances, mass and atom conservation, energy release, coefficient ratios
4.2 Net Ionic Equations | 5 | 1 | Net ionic, complete ionic and molecular equations, spectator ions, solubility, strong versus weak electrolytes, no net reaction
4.3 Representations of Reactions | 4 | 2 | Particle models described in words, atom conservation, limiting reactant, leftover particles, precipitation pictures
4.4 Physical and Chemical Changes | 5 | 1 | Molecular identity, intermolecular attractions versus covalent bonds, crushing, dissolving molecular sugar, electrolysis
4.5 Stoichiometry | 1 | 5 | Mole ratio orientation, mass-to-mass, limiting reactant, theoretical yield, actual yield and percent yield
4.6 Introduction to Titration | 2 | 4 | Buret, titrant and analyte, equivalence versus endpoint, molarity and volume, non-1:1 coefficients, delivered volume, overshoot error
4.7 Types of Chemical Reactions | 5 | 1 | Precipitation, acid-base and redox, gas evolution without redox, combustion and oxidation numbers
4.8 Introduction to Acid-Base Reactions | 5 | 1 | Brønsted-Lowry acids/bases, conjugate pairs, proton transfer, strength versus concentration, neutralization
4.9 Oxidation-Reduction (Redox) Reactions | 4 | 2 | Oxidation numbers, oxidation/reduction, oxidizing/reducing agents, balanced half-reaction, electrons transferred

The 4.3-1 inline SVG shows the initial particle model, with different sizes and fill patterns for H and O. Its title, description, labels and model caption are translated. The prompt gives all counts in words, so interpreting a picture is not required. The engine's `data-zsa-practice-visual="particles"` flag shows it only for that question. Model counts are exact. The models assume complete reaction and omit solvent where stated. Acid-base and redox are analyzed separately; bubbles alone do not establish redox.

## Language, scoring and keyboard

English: `/apchem-unit4-practice/`. Spanish: `/apchem-unit4-practice/?lang=es`. Language links retain other query parameters. `from=` is accepted only for the exact `https://zornscience.org` origin without credentials and selects the correct language twin. Other inputs fall back to the AP Chemistry course. Share links open a fresh set. The logo links home. Embed mode uses the existing shared support.

One scored submission per question. Missing or malformed values and missing units request correction before scoring. Correct value plus correct unit earns one point; precision feedback is advisory. The bank supplies the existing half-final-place tolerance with a 10% cushion, computed from unrounded values. Exact counts and oxidation numbers require equality. Numeric input accepts scientific notation and compatible optional unit suffixes, including mol/L for M. Units do not convert automatically. Use count for modeled particles, bonds or electrons, no units for oxidation numbers, and % for percent yield. The same two-decimal masses as Units 1 to 3 and short solubility rules are shown in the reference panel.

Tab moves through native controls; arrow keys operate radios and selects. New questions focus their heading, checked answers focus Next question, results focus their heading and topic switching returns focus to the selector. The feedback is a polite live region and validation is an alert. Results include topic scores and expandable missed-question explanations. Try again reshuffles questions and choices.

## Changelog

1.0.3: Version bump for the shared practice engine, which gains opt-in options for generated question sets. This unit's questions and behavior are unchanged.

1.0.0: Added 54 original questions and complete Mexican Spanish translations using the existing shared practice engine, worked answer audit, reference rules, particle model and directory entry.

ZornScience. CC BY-NC-SA 4.0.
