# AP Chemistry Unit 1 Practice checks

Version: 1.0.1

## Original release automated checks (1.0.0)

Run `node --test tests/unit/apchem-unit1-practice.test.js tests/unit/static.test.js` and `npx playwright test tests/e2e/apchem-unit1-practice.spec.js`. The tests cover bank coverage and bilingual notation parity; independently calculated answers; all numeric tolerances, units and precision; all multiple-choice distractor explanations; complete English and Spanish sets; scoring; shuffling; validation; restricted backlinks; header and share dialogs; keyboard flow; phone layout; accessibility; directory discovery; and blocked storage.

Verified: all 7 activity unit checks, 6 repository static checks, and 8 activity browser tests pass. Browser tests include full 48-question correct and incorrect runs in both languages, WCAG accessibility scans at 320 px, and zero outside requests. All 39 JavaScript unit test files pass in the broader run. The two separate WordPress PHP unit test files cannot run in this environment because the `php` executable is absent. No WordPress files were changed. Local browser tests use the environment's Chromium executable and permit a localhost-only test server.

## Numeric answer audit

All questions were worked before their answers were authored. Atomic masses are H 1.01, C 12.01, N 14.01, O 16.00, Na 22.99, Mg 24.31, Al 26.98, S 32.06, Cl 35.45, K 39.10, Ca 40.08, and Fe 55.85, in g/mol. Avogadro constant used: 6.022 × 10<sup>23</sup> mol<sup>−1</sup>. Given model isotope masses supersede standard average atomic masses.

Question | Calculation or count | Final answer
--- | --- | ---
1.1-1 | 18.02 / (2 × 1.01 + 16.00) | 1.000 mol
1.1-2 | 0.250 × (12.01 + 2 × 16.00) | 11.0 g
1.1-3 | 0.125 × 6.022 × 10<sup>23</sup> × 2 | 1.51 × 10<sup>23</sup> atoms
1.2-1 | 62.00 × 0.700 + 64.00 × 0.300 | 62.60 u
1.2-2 | 10.00x + 11.00(1 − x) = 10.20; 100x | 80.0%
1.2-3 | 1.00 / (3.00 + 1.00) × 100 | 25.0%
1.3-1 | 32.00 / 44.01 × 100 | 72.7%
1.3-4 | 0.100 × 3 × 16.00 | 4.80 g
1.3-6 | 0.200 × 35.45 | 7.09 g
1.4-1 | 6.00 / (6.00 + 14.00) × 100 | 30.0%
1.4-2 | 25.0 × 0.120 | 3.00 g
1.4-3 | (10.00 − 4.00) / (39.10 + 35.45) | 0.0805 mol
1.5-1 | 15 + 3 | 18
1.5-2 | 3p<sup>4</sup>: one pair and two single electrons | 2
1.5-5 | Four orbitals in n = 2, two electrons each | 8
1.6-2 | 125.0 − 40.0 | 85.0 eV
1.6-5 | 6 / 2 | 3
1.7-5 | Large jump after the second ionization | 2
1.7-6 | 11 − 10 | 1
1.8-2 | Three sulfate ions balance two aluminum ions | 3
1.8-3 | 0.250 × 2 | 0.500 mol

## Multiple-choice answer audit

Question | Correct result and reasoning
--- | ---
1.1-4 | CH<sub>4</sub>, smallest molar mass (16.05 g/mol), most molecules per gram
1.1-5 | 40.08 + 2(14.01) + 6(16.00) = 164.10 g/mol
1.1-6 | Two chloride ions per formula unit, so 2.00 mol
1.2-4 | Same element and charge: isotope masses differ by neutron counts
1.2-5 | 79.90 lies below midpoint 79.92; lighter isotope has abundance 51.0%
1.2-6 | Isotopes have identical atomic number
1.3-2 | 3.60/12.01 ≈ 4.80/16.00; simplest mole ratio 1:1, CO
1.3-3 | Empirical mass 30.03; 180.18/30.03 = 6; C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>
1.3-5 | Pure MgO always has mass ratio Mg:O = 24.31:16.00
1.4-4 | Components retain chemical identities and proportions may vary
1.4-5 | Iron-to-sulfur mass ratio may vary in a mixture; FeS ratio is fixed
1.4-6 | Salt mass unchanged; total mass increases; mass percent decreases
1.5-3 | Fe<sup>2+</sup> loses occupied 4s electrons first, leaving [Ar]3d<sup>6</sup>
1.5-4 | Ground-state 2p<sup>3</sup> has three singly occupied orbitals and parallel spins
1.5-6 | Two electrons sharing an orbital have opposite spins
1.6-1 | Areas sum to 11 electrons, neutral Na
1.6-3 | Na outer 3s electron is least tightly bound
1.6-4 | Mg has greater nuclear charge and similar shielding for 1s electrons
1.6-6 | Areas 2:2:4 give 1s<sup>2</sup>2s<sup>2</sup>2p<sup>4</sup>
1.7-1 | Na largest; effective nuclear charge increases across the period
1.7-2 | Al removes a higher-energy, more shielded 3p electron; Mg removes 3s
1.7-3 | Paired-electron repulsion in O makes its first removal easier than in N
1.7-4 | Mg<sup>2+</sup> has 12 protons attracting the same 10 electrons as the other choices
1.8-1 | Three Ca<sup>2+</sup> balance two N<sup>3−</sup>, giving Ca<sub>3</sub>N<sub>2</sub>
1.8-4 | Br gains one electron to complete its octet
1.8-5 | NaCl gives a 1:1 ion ratio in an extended lattice
1.8-6 | K loses 4s<sup>1</sup>, giving K<sup>+</sup> with configuration [Ar]

## Original release manual review (1.0.0)

Use a narrow phone viewport and test both languages. Complete a topic with correct and wrong responses, inspect numeric unit and precision feedback, review a missed question, restart, and choose another topic. Use keyboard navigation and open both header dialogs. Confirm formulas, charges, and exponents use actual subscript and superscript elements. Confirm no horizontal page overflow and no requests to outside services. No sitemap exists in this repository.

ZornScience. CC BY-NC-SA 4.0.

## Shared engine refactor, 1.0.1

The question bank and translation table are byte-for-byte unchanged. The unit now loads the shared practice model, controller and stylesheet. The existing unit tests change only their model imports; existing browser tests are unchanged.

The full unit suite passes all 322 checks, including the PHP-backed checks and eight new shared-model checks. Two new browser checks verify another unit with only a page and data file, in English and Spanish, including a custom SVG flag.

Original-versus-refactored comparisons pass in both languages at 320 px and 1366 px widths. Across all three units, 12 scenarios compare 1,416 states and 136 screenshot pairs with zero differences. Compared states include setup, reference, every question and submitted feedback, validation, results, missed review, and retries. DOM, focus, live text, scroll, title, computed layout and styles match; only added shared styling classes and engine metadata are normalized.

Full browser coverage completed across the initial and resumed runs: 641 of 642 unique cases pass, including all 28 existing Unit 1, 2 and 3 browser checks and both new shared-engine checks. The 84 cases interrupted in the original run and nine retries all pass in a 93-case run on port 4173 with one worker. Initial ACT, periodic-trends and frame-rate failures pass when run alone; the free-energy and redox request checks pass on their hardcoded port 4173. No test assertion, timeout, helper or existing browser test was changed.

One unrelated failure remains: the unchanged Lewis AP routing group 2 test exceeded its declared 400-second timeout, returning after 18.5 minutes while recursively enumerating SF6 reference structures. Its test, reference helper and activity files match main. This result is reported rather than changing another activity or its tests.

The full repository parity check also passes: 11 scenarios, 3,723 states and 3,296 screenshot pairs, with zero differences.
