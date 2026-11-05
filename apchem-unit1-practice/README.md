# AP Chemistry Unit 1 Practice

Version: 1.0.0

Original ZornScience practice for students catching up on AP Chemistry Unit 1. Six questions per topic, 48 total. Each topic mixes multiple choice with numeric entry. Mixed review uses all 48 questions. Questions and choices are shuffled for each new set, including Try again.

## Files and conventions

- `index.html`: activity, shared header dialogs, language controls, reference, and licensed footer.
- `data.js`: original English and Mexican Spanish questions, choice-specific feedback, worked reasoning, exact official topic titles, and interface translations.
- `model.js`: pure numeric checking, significant figures, shuffling, and validated lesson links.
- `practice.js`: tab-only session state and accessible rendering. Only authored `<sub>` and `<sup>` notation becomes markup.
- `practice.css`: responsive layout using shared ZornScience design tokens.
- `TESTING.md`: verification and numerical answer audit.

Matches the structures and shared chrome of Stoichiometry Coach and Polyatomic Ion Trainer, plus Periodic Table's restricted lesson backlink. No changes to shared assets. No runtime dependencies, network requests, storage, account, or data collection. CSP prevents connections. All work is discarded on reload.

## Language and routing

English: `/apchem-unit1-practice/`. Spanish: `/apchem-unit1-practice/?lang=es`. Language links retain existing URL parameters. A `from=` value is accepted only for the exact `https://zornscience.org` origin, with no credentials. Spanish sends lesson links to the `/es/` twin; English uses the English twin. Invalid values use the AP Chemistry course link. The logo always links home. Shared embed support is preserved.

## CED coverage

Topic | Questions | Skills
--- | --- | ---
1.1 Moles and Molar Mass | 6 (3 MC, 3 numeric) | Mass, mole and particle conversions; molar mass; formula-unit ratios
1.2 Mass Spectra of Elements | 6 (3 MC, 3 numeric) | Isotopes; peak intensities; relative abundance; weighted atomic mass
1.3 Elemental Composition of Pure Substances | 6 (3 MC, 3 numeric) | Elemental mass percent; empirical and molecular formulas; fixed composition
1.4 Composition of Mixtures | 6 (3 MC, 3 numeric) | Component masses and moles; variable composition; dilution by mass
1.5 Atomic Structure and Electron Configuration | 6 (3 MC, 3 numeric) | Atomic and ionic electron counts; ground states; Hund and Pauli rules; orbital capacity
1.6 Photoelectron Spectroscopy | 6 (4 MC, 2 numeric) | Integrated peak areas and binding energy; subshell assignments; nuclear attraction
1.7 Periodic Trends | 6 (4 MC, 2 numeric) | Atomic and ionic radii; effective nuclear charge; ionization exceptions and successive energies
1.8 Valence Electrons and Ionic Compounds | 6 (4 MC, 2 numeric) | Common ions; charge neutrality; formula units and ionic lattices

Alignment uses the College Board AP Chemistry Course and Exam Description topic sequence and learning scope. These are original practice questions, not official exam questions. Synthetic isotope data are identified as model data. Simplified PES questions explicitly assume integrated area is proportional to electron count.

## Scoring and feedback

One submitted answer per question. Empty or malformed input and a missing unit prompt correction before scoring. Incorrect choices receive feedback for that specific misconception plus the correct answer and reasoning. Results include per-topic scores and expandable explanations for missed questions.

Numeric answers accept half of the last requested place, with a 10% cushion for rounding, and exact equality for integer counts and ratios. Tolerance is calculated from the unrounded result and the requested significant figures or decimal places, so the displayed rounded answer always qualifies. All masses use the reference values rounded to two decimal places. Scientific notation with `e` is accepted. A correct value with a wrong unit earns no point, with explicit unit feedback. Correct values and units earn a point even if the requested significant figures or decimal places are wrong; the feedback states the precision issue and displays the properly rounded answer. Integer trailing zeros without a decimal point are treated as nonsignificant; use a decimal point or scientific notation to state precision explicitly.

ZornScience. CC BY-NC-SA 4.0.
