# AP Chemistry Unit 2 Practice checks

Version: 1.0.4

## Original release automated checks (1.0.0)

Run `node --test tests/unit/apchem-unit1-practice.test.js tests/unit/apchem-unit2-practice.test.js tests/unit/static.test.js` and `npx playwright test tests/e2e/apchem-unit1-practice.spec.js tests/e2e/apchem-unit2-practice.spec.js`.

Coverage follows Unit 1: bank completeness, bilingual notation and number parity, independently worked numeric and multiple-choice keys, distinct feedback for every distractor, numeric tolerances and exactness, unit and precision feedback, immutable shuffling, validated backlinks, full correct and incorrect mixed sets in both languages, retry and topic switching, header and share dialogs, language parameters, keyboard flow, phone layout, WCAG scans, directory discovery, and operation with storage denied and zero outside requests. Unit 2 adds exact topic-title and glossary checks, signed formal charge, decimal precision for angles, and the translated accessible curve name and description.

Verified locally: all 8 Unit 2 unit checks, 7 Unit 1 unit checks, and 6 repository static checks pass. All 10 Unit 2 browser tests and all 8 Unit 1 browser tests pass. Browser checks include full correct and incorrect mixed sets in English and Spanish, translated accessible curve descriptions, WCAG scans at 320 px, and zero outside requests. All 40 JavaScript-only unit test files passed in the broader run. The two existing WordPress PHP-backed files could not run locally because the `php` executable is absent; no WordPress files were changed. Browser tests use the environment Chromium executable with a localhost-only test server.

## Numeric answer audit

All 42 answers were worked before `data.js` was authored. Counts and formal charges are exact. Noninteger ratios and measured model quantities use the requested precision. The supplied valence counts are H 1, B 3, C 4, N 5, O 6, F 7 and Cl 7. Add electrons for negative ion charge and subtract for positive ion charge. Formal charge is reported in units of the elementary charge, e. Bond order and ratios have no units.

Question | Calculation or count | Final answer
--- | --- | ---
2.1-4 | Electronegativity difference: 3.98 − 2.20 | 1.78, no units
2.2-1 | Horizontal coordinate of the model potential energy minimum | 154 pm
2.2-2 | Separated atoms minus minimum: 0 − (−350) | 350. kJ/mol, three significant figures
2.2-3 | 0.250 mol × 350 kJ/mol | 87.5 kJ
2.3-5 | Equal distance cancels: (2 × 2)/(1 × 1) | 4, exact ratio
2.3-6 | F is proportional to 1/r<sup>2</sup>; 1/2<sup>2</sup> | 0.250, no units
2.4-6 | 12 modeled Al atoms × 3 delocalized electrons per atom | 36 electrons
2.5-1 | CO<sub>3</sub><sup>2−</sup>: 4 + 3 × 6 + 2 | 24 valence electrons
2.5-2 | NH<sub>3</sub>: (5 + 3 − 3 × 2)/2 | 1 lone pair on N
2.5-3 | CO<sub>2</sub>: two double bonds × two electron pairs per double bond | 4 bonding pairs
2.6-1 | N in NH<sub>4</sub><sup>+</sup>: 5 − 0 − 8/2 | +1 e
2.6-2 | Singly bonded nitrate O: 6 − 6 − 2/2 | −1 e
2.6-3 | Carbonate equivalent contributors: (2 + 1 + 1)/3 = 4/3 | 1.33, no units
2.7-1 | CO<sub>2</sub>: each double bond counts as one domain, no lone pairs on C | 2 domains
2.7-2 | CH<sub>4</sub>: four equivalent domains, tetrahedral angle | 109.5 degrees
2.7-3 | C<sub>2</sub>H<sub>4</sub>: one double bond contains one sigma and one pi bond | 1 pi bond

The curve minimum is at 154 pm and −350 kJ/mol; separated atoms are at 0 kJ/mol. Its SVG title, description and axis labels are translated. The same quantities appear in text so no answer depends on extracting a small visual label. At very short separation the energy rises steeply, and at large separation it approaches zero. These are synthetic model values, not tabulated data for a named bond.

## Multiple-choice answer audit

Question | Correct result and worked reasoning
--- | ---
2.1-1 | Ionic attraction between Na<sup>+</sup> and Cl<sup>−</sup> holds solid NaCl together. Electron transfer explains formation of the ions, not the subsequent force holding the lattice.
2.1-2 | HCl is polar covalent. Cl attracts the shared electrons more strongly than H, producing partial charges rather than complete electron transfer in the molecule.
2.1-3 | Cl<sub>2</sub> is nonpolar covalent because the identical atoms have equal electronegativity and share equally.
2.1-5 | Diamond is a network covalent solid. Covalent connections extend through the solid rather than between discrete molecules.
2.1-6 | NH<sub>4</sub>Cl has covalent N−H bonds within NH<sub>4</sub><sup>+</sup> and ionic attraction between NH<sub>4</sub><sup>+</sup> and Cl<sup>−</sup>.
2.2-4 | Much shorter separation than equilibrium gives net repulsion. The steep rise in potential energy corresponds to a force pushing the atoms apart.
2.2-5 | A typical C≡C bond is shorter and stronger than C−C, placing its minimum farther left and deeper relative to separated atoms.
2.2-6 | I is larger than F, so H−I has a longer equilibrium bond length and a minimum farther right than H−F. Size alone does not fix the depth.
2.3-1 | At the stated equal distance, Mg<sup>2+</sup>/O<sup>2−</sup> has charge-product magnitude 4, while Na<sup>+</sup>/F<sup>−</sup> has 1. The former attracts more strongly.
2.3-2 | LiF has shorter distances between ions than LiI at comparable charges, supporting stronger attraction and generally a higher melting temperature.
2.3-3 | Both solid and molten NaCl contain ions. Only the melt permits substantial long-distance ion motion and electrical conduction.
2.3-4 | Shifting ionic planes can align like charges. Their repulsion fractures the brittle crystal.
2.4-1 | Delocalized electrons carry charge through solid copper while metal cores remain near lattice sites.
2.4-2 | Layers may shift while metal cores remain attracted to the electron sea, explaining malleability and ductility.
2.4-3 | Small C atoms in gaps between Fe atoms form an interstitial alloy model. They do not replace Fe lattice sites.
2.4-4 | Zn atoms replacing similar-sized Cu atoms at regular sites form a substitutional alloy model.
2.4-5 | Different-sized atoms distort the metal lattice and impede layer slip, which can increase hardness. No universal claim about all alloys is made.
2.5-4 | H−C≡N with one lone pair on N uses 1 + 4 + 5 = 10 electrons. H has a duet, C and N have octets, and all formal charges are zero.
2.5-5 | BF<sub>3</sub> has 3 + 3 × 7 = 24 electrons: 6 in B−F bonds and 18 in F lone pairs. B has six surrounding electrons, an accepted incomplete octet, with zero formal charge.
2.5-6 | NH<sub>4</sub><sup>+</sup> has 5 + 4 − 1 = 8 electrons, all in four N−H single bonds. N has no lone pair.
2.6-4 | Nitrate has equivalent delocalized N−O bonds. Contributors are drawings of electron placement, not distinct structures occupied in succession or moving atoms.
2.6-5 | In O=C=O, C has formal charge 4 − 8/2 = 0, and each O has 6 − 4 − 4/2 = 0. In O−C≡O, the single-bonded O has 6 − 6 − 2/2 = −1 and the triple-bonded O has 6 − 2 − 6/2 = +1. With octets in both, zero formal charges favor O=C=O.
2.6-6 | For cyanate, O−C≡N places formal charge −1 on O with C and N zero. O=C=N places −1 on N with O and C zero. Both have octets and the same connectivity; negative charge on more electronegative O favors the former contributor without excluding the latter.
2.7-4 | NH<sub>3</sub> has three bond domains and one lone pair: tetrahedral electron geometry and trigonal pyramidal molecular geometry.
2.7-5 | BF<sub>3</sub> has three bond domains and no lone pairs: trigonal planar, 120°, and sp<sup>2</sup> in the localized model.
2.7-6 | CO<sub>2</sub> has two electron domains and no lone pairs on C: linear, 180°, and sp. Four bonding pairs do not imply four VSEPR domains.

## Original release manual review (1.0.0)

Inspect both languages at a narrow phone viewport and a desktop viewport. Complete a topic, check correct and wrong feedback, expand a missed-question solution, retry, and switch topics. Inspect the curve and its accessible description. Check formal-charge signs and unit e, count versus no units, scientific notation, and angle precision. Test keyboard navigation and both header dialogs. Confirm real subscript and superscript elements, ZornScience branding, the CC BY-NC-SA 4.0 footer, no horizontal overflow, and no outside requests. The model curve is schematic and uses labeled values rather than a detailed experimental scale. No sitemap exists in this repository.

ZornScience. CC BY-NC-SA 4.0.

## Shared engine refactor, 1.0.1

The question bank and translation table are byte-for-byte unchanged. The unit now loads the shared practice model, controller and stylesheet. The existing unit tests change only their model imports; existing browser tests are unchanged.

The full unit suite passes all 322 checks, including the PHP-backed checks and eight new shared-model checks. Two new browser checks verify another unit with only a page and data file, in English and Spanish, including a custom SVG flag.

Original-versus-refactored comparisons pass in both languages at 320 px and 1366 px widths. Across all three units, 12 scenarios compare 1,416 states and 136 screenshot pairs with zero differences. Compared states include setup, reference, every question and submitted feedback, validation, results, missed review, and retries. DOM, focus, live text, scroll, title, computed layout and styles match; only added shared styling classes and engine metadata are normalized.

Full browser coverage completed across the initial and resumed runs: 641 of 642 unique cases pass, including all 28 existing Unit 1, 2 and 3 browser checks and both new shared-engine checks. The 84 cases interrupted in the original run and nine retries all pass in a 93-case run on port 4173 with one worker. Initial ACT, periodic-trends and frame-rate failures pass when run alone; the free-energy and redox request checks pass on their hardcoded port 4173. No test assertion, timeout, helper or existing browser test was changed.

One unrelated failure remains: the unchanged Lewis AP routing group 2 test exceeded its declared 400-second timeout, returning after 18.5 minutes while recursively enumerating SF6 reference structures. Its test, reference helper and activity files match main. This result is reported rather than changing another activity or its tests.

The full repository parity check also passes: 11 scenarios, 3,723 states and 3,296 screenshot pairs, with zero differences.
