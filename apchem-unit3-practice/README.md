# AP Chemistry Unit 3 Practice

Version: 1.0.1

Original bilingual ZornScience practice for AP Chemistry CED Unit 3. Thirteen topics contain six original questions each, 78 total: 51 multiple-choice and 27 numeric entry. Every topic has both formats. Mixed review includes all 78. All wrong choices have individual misconception feedback. Every answer was worked before question authoring and recorded in `TESTING.md`.

## Files and shared practice engine

- `index.html`: unit page, accessible inline SVG, reference panel, header dialogs, language controls, and footer.
- `data.js`: unchanged bilingual questions, topic titles, units, explanations, and authored translations.
- `diagrams.css`: only scoped Unit 3 SVG styles.
- `README.md` and `TESTING.md`: unit documentation and the complete worked answer audit.

The common model, session, interface text, rendering, scoring, results, retries, and responsive layout live in `../shared/zsa-practice-model.js`, `../shared/zsa-practice.js`, and `../shared/zsa-practice.css`. See `../shared/README.md` for the page contract and how to add another unit. Only authored `<sub>` and `<sup>` notation becomes markup. SVGs stay inline in the unit page with their accessible labels and descriptions.

The topic helper uses the complete ID before the question separator so topics 3.10 through 3.13 stay distinct. Units must match the requested output unit. Automatic conversion of an alternative unit is not performed.

No runtime dependencies, storage, accounts, data collection or network requests. State stays in the tab and is discarded on reload. CSP blocks connections. All scripts and assets are local. No WordPress or zornscience.org changes.

## Language and routing

English: `/apchem-unit3-practice/`. Spanish: `/apchem-unit3-practice/?lang=es`. Language links retain other query parameters. A `from=` backlink is accepted only for the exact `https://zornscience.org` origin without credentials. Invalid inputs fall back to the AP Chemistry course. Spanish selects the `/es/` twin and English selects the English twin. The logo links home. Shared embed support and fresh-activity share links are preserved.

## CED coverage

Topic | MC | Numeric | Skills
--- | --- | --- | ---
3.1 Intermolecular and Interparticle Forces | 5 | 1 | Dispersion, dipole-dipole, hydrogen bonding, ion-dipole, boiling order, vaporization energy
3.2 Properties of Solids | 5 | 1 | Molecular, network, ionic and metallic properties; graphite exception; formula units
3.3 Solids, Liquids, and Gases | 4 | 2 | Word-based particle models, spacing, compressibility, phase change energy, density, conservation
3.4 Ideal Gas Law | 2 | 4 | PV = nRT, partial pressures, mole fraction, gas collected over water, kelvin ratios
3.5 Kinetic Molecular Theory | 4 | 2 | Equal average kinetic energy, mass and speed, Maxwell-Boltzmann curves, ideal assumptions, molar energy
3.6 Deviation from Ideal Gas Law | 5 | 1 | High pressure, low temperature, attractions versus excluded volume, comparative forces, pressure ratios
3.7 Solutions and Mixtures | 3 | 3 | Molarity, mass-to-moles, dilution, homogeneous mixtures, final solution volume
3.8 Representations of Solutions | 4 | 2 | Word-based ion and molecular models, hydration orientation, charge balance, ion counts and concentrations
3.9 Separation of Solutions and Mixtures | 4 | 2 | Chromatography, phases, retention factor, distillation, filtration, solvent evaporation
3.10 Solubility | 5 | 1 | Like dissolves like, miscibility, interaction balance, gas pressure and temperature, saturation mass ratios
3.11 Spectroscopy and the Electromagnetic Spectrum | 5 | 1 | Rotational, vibrational and electronic transitions, frequency order, allowed gaps, infrared wavelength
3.12 Properties of Photons | 2 | 4 | E = hν, c = λν, energy per photon versus per mole, inverse wavelength, universal h
3.13 Beer-Lambert Law | 3 | 3 | A = εbc, molarity from absorbance, calibration slope and intercept, path length, blank, matching conditions

The inline Maxwell-Boltzmann SVG is labeled as a schematic model, with a translated accessible title, description, labels and caption. Its full meaning is also stated in the question. Topics 3.3 and 3.8 use complete particle descriptions in words, so neither depends on interpreting a drawing. Synthetic complete-dissociation models explicitly identify their assumptions. Questions are original aligned practice, not official College Board exam items.

## Scoring and reference

One submitted answer per question, one point for a correct value with correct units. Missing or malformed input and missing units request correction before scoring. Precision feedback does not remove a point. Nonexact tolerance is half the final requested place plus a 10% rounding cushion, calculated from the unrounded answer and requested significant figures or decimal places. Discrete model particle counts are exact. Scientific notation using `e` is accepted, including very small photon energies. Trailing integer zeros without a decimal point are nonsignificant, matching Unit 2. Results show per-topic scores and expandable explanations for missed questions. Try again reshuffles both questions and choices.

The reference panel shows both requested R values, pressure equivalences, h, c, the Avogadro constant, the two-decimal atomic masses from Unit 1, and core equations. Gas law calculations use kelvin. Select count for particle counts and no units for mole fraction, ratios, absorbance and Rf. Spanish shows cantidad and sin unidades. Concentration uses M (mol/L); a matching typed mol/L suffix with M selected is accepted.

ZornScience. CC BY-NC-SA 4.0.
