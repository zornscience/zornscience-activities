# AP Chemistry Unit 2 Practice

Version: 1.0.0

Original ZornScience practice for AP Chemistry Unit 2. Six questions per topic, 42 total, with multiple choice and numeric entry in every topic. Mixed review uses all 42 questions. Questions and choices are shuffled for each new set, including Try again.

## Files and conventions

- `index.html`: same layout, shared header dialogs, language controls, reference panel, and licensed footer as Unit 1. Includes a small accessible inline SVG potential energy curve.
- `data.js`: original English and Mexican Spanish questions, individual distractor feedback, worked reasoning, exact supplied topic titles, and interface and SVG translations.
- `model.js`: Unit 1 numeric checking, precision, shuffling, and restricted lesson links, with the Unit 2 activity selector and aliases for the new degrees / grados unit.
- `practice.js`: Unit 1 tab-only session and rendering pattern, with Unit 2 identifiers, topic and question counts, and visibility for the curve. Only authored `<sub>` and `<sup>` notation becomes markup.
- `practice.css`: copied Unit 1 layout with scoped Unit 2 names and curve styles using shared ZornScience tokens.
- `TESTING.md`: complete worked answer audit and verification.

The Unit 1 pattern is copied, with no shared engine extraction and no changes to Unit 1 activity files or shared assets. Its directory test now expects five Test prep entries after Unit 2 is added. There are no runtime dependencies, network requests, storage, accounts, or data collection. CSP prevents connections. Answers are discarded on reload. No WordPress or zornscience.org changes.

## Language and routing

English: `/apchem-unit2-practice/`. Spanish: `/apchem-unit2-practice/?lang=es`. Language links retain existing query parameters. A `from=` value is accepted only for the exact `https://zornscience.org` origin, without credentials. Invalid values fall back to the AP Chemistry course link. Spanish links select the `/es/` twin; English selects the English twin. The logo links home. Shared embed support and fresh-activity share URLs are preserved.

## CED coverage

Topic | Questions | Skills
--- | --- | ---
2.1 Types of Chemical Bonds | 6 (5 MC, 1 numeric) | Ionic, polar and nonpolar covalent, metallic and network models; electronegativity difference; bonds within polyatomic ions
2.2 Intramolecular Force and Potential Energy | 6 (3 MC, 3 numeric) | Curve minimum, equilibrium length, dissociation energy, amount of bonds, net force, size and bond order
2.3 Structure of Ionic Solids | 6 (4 MC, 2 numeric) | Coulomb charge and size reasoning, inverse-square force, melting, conduction and brittleness
2.4 Structure of Metals and Alloys | 6 (5 MC, 1 numeric) | Electron sea, conduction, malleability, interstitial and substitutional alloys, hardness
2.5 Lewis Diagrams | 6 (3 MC, 3 numeric) | Valence electron totals, lone and bonding pairs, octet exceptions, preferred connectivity and ion charge
2.6 Resonance and Formal Charge | 6 (3 MC, 3 numeric) | Signed formal charge, resonance bond order, delocalization, charge separation and electronegativity
2.7 VSEPR and Hybridization | 6 (3 MC, 3 numeric) | Electron domains versus pairs, electron and molecular geometry, angles, sp and sp<sup>2</sup> models, sigma and pi bonds

Alignment follows the College Board AP Chemistry Course and Exam Description Unit 2 topic sequence and learning scope. All questions are original practice, not official exam questions. No drawing is required. Counts, numeric entries and explicit structure descriptions test the representation skills. Curve data are identified as a model, rather than experimental values for a named molecule. Hybridization uses the usual localized bonding model.

## Scoring and feedback

Scoring matches Unit 1: one submitted answer per question, with corrections requested for missing or malformed input and missing units before scoring. Every wrong multiple-choice option has its own misconception explanation. Results include per-topic scores and expandable explanations for missed questions.

Numeric answers use exact equality for whole-number counts, signed formal charges and exact ratios. Other answers accept half of the final requested place plus a 10% rounding cushion, calculated from the unrounded value and requested significant figures or decimal places. Scientific notation with `e` is accepted. Correct values with incorrect units receive no point. Correct values and units receive a point even when precision differs; feedback states the precision issue and gives the rounded answer. Trailing integer zeros without a decimal point are nonsignificant. For three significant figures, enter `350.` or `3.50e2` rather than `350`.

Select count for electron and pair counts, no units for bond order and other dimensionless quantities, e for formal charges, and degrees for angles. Spanish shows cantidad, sin unidades and grados. The model accepts signed ASCII entries such as `-1` for formal charge. It also accepts a matching suffix such as `-1 e` or `109.5 grados` when the matching dropdown unit is selected.

ZornScience. CC BY-NC-SA 4.0.
