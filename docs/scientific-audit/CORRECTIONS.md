# Scientific corrections

## ZA-001 · Beer's Law Spectrophotometer Lab · Medium

- **Original problem and cause.** `check()` could score against the hidden concentration before it had a usable calibration. It also accepted the hidden value when the student's measured line implied a different answer.
- **Change.** Score against `(A − b)/m` from distinct standards with a positive finite slope and a finite, nonnegative estimate. Equal readings produce zero slope and undefined R², including when roundoff in the regression sums would otherwise leave a positive residual. Retain the fitted estimate tolerance of 1% or 0.001 M, whichever is larger. The modeled concentration is available for comparison. The existing extrapolation guidance remains applicable.
- **Files.** `beers-law-lab/{model.js,lab.js,data.js,README.md}`.
- **Regression and result.** Unit and Playwright tests cover zero and duplicate standards, invalid slopes, unknown reading, nonzero intercept, correct numerical inference, score count, Spanish feedback and CSV. The existing valid calibration and answer-reveal flows passed. [Activity](https://activities.zornscience.org/beers-law-lab/)

## ZA-002 · Osmosis · Medium

- **Original problem and cause.** Static activity and homepage descriptions and their localization sources described water as stopping. The simulation's isotonic model already treats the two opposing rates as equal and positive.
- **Change.** The English and Spanish descriptions identify the concentration with no net water movement. Preserved the intentionally incorrect quiz choice that distinguishes the misconception from the correct answer.
- **Files.** `shared/zsa-about.js`, generated `osmosis-lab/index.html`, `index.html`, and `home.js`.
- **Regression and result.** Node checks confirm zero mean change, positive equal rates, and signs on either side. Playwright verifies both entry points and languages. The existing zoom, graph and export flows passed. [Activity](https://activities.zornscience.org/osmosis-lab/)

## ZA-005 · Equilibrium Constant Lab · Medium for the helper

- **Original problem and cause.** The helper used extent divided by the smallest initial reactant concentration. This omitted the stoichiometric coefficient and implicitly applied a forward-only expression even with unsupported initial concentrations.
- **Change.** Compute the maximum percentage change over the active reactants held at their initial concentrations. Reject use of this particular shortcut with absent active reactants or initially present active products. Pure solids and liquids are omitted from the test. The existing strict under-5% lesson criterion still applies.
- **Files.** `equilibrium-k-lab/{chem.js,lab.js,data.js,README.md}`.
- **Regression and result.** The ammonia case now rejects 7.12% hydrogen depletion. Existing NO and N₂O₄ examples and the exactly 5% case passed. The coefficient appears in the guided solve step, and English and Spanish mode tests passed. [Activity](https://activities.zornscience.org/equilibrium-k-lab/)

## ZA-006 · AP Chemistry Unit 8 Practice · Low

- **Original problem and cause.** Item 8.4-6 used a three-significant-figure scoring rule for subtraction and referred ambiguously to complete neutralization with excess acid.
- **Change.** Ask how much HA remains once the added hydroxide reacts. In 1:1 neutralization, 0.0100 mol minus 0.00400 mol yields 0.0060 mol to four decimal places. The unrounded numerical target remains 0.006 mol. The practice engine treats extra precision as advisory and uses a tolerance based on the last reported decimal place.
- **Files.** `apchem-unit8-practice/{data.js,TESTING.md}`.
- **Regression and result.** The independent item test verifies the retained value, unit, display, precision feedback and bilingual prompt. Existing Unit 8 key checks were updated for the subtraction rule. The focused mobile Playwright test submits 0.0060 mol in both languages. [Activity](https://activities.zornscience.org/apchem-unit8-practice/)

## ZA-007 · ACT Practice Science · Low

- **Original problem and cause.** The explanation of the catalase table incorrectly said each increase was smaller than the last. The table shows +9, +9, +5 and +2 mL.
- **Change.** State the differences and explain that the most recent increases suggest a modest further rise. The preferred choice remains the near-plateau estimate of 37 to 40 mL. The wording presents the conclusion as an extrapolation.
- **Files.** `act/bank-science.js`.
- **Regression and result.** Independently subtracted consecutive rows, checked the keyed range, and asserted the revised explanation describes the last two increments as smaller. [Activity](https://activities.zornscience.org/act/)

## ZA-008 · Chemical Bonding Lab · Medium, accessibility

- **Original problem and cause.** Every solvent observation tick called the full renderer, replacing the Advance to 5:00 button while it had keyboard focus. The existing Playwright click also timed out when the node repeatedly detached.
- **Change.** Update the timer's progress and text in place while the test runs. The existing five-minute simulated endpoint and violet iodine observation still follow the same phase transition.
- **Files.** `chemical-bonding-lab/lab.js`.
- **Regression and result.** The new Playwright case advances the clock, checks that focus remains on the action, and submits with Enter to reach the violet endpoint. It reproduced the focus loss and all four Chemical Bonding Playwright cases passed after the correction. [Activity](https://activities.zornscience.org/chemical-bonding-lab/)

## ZA-010 · Fruit Fly Genetics Lab · Low

- **Original problem and cause.** Several strings called the offspring counts real even though the model generates every sample from a seed. The homepage also tied raw counts to a predicted ratio.
- **Change.** Label the observations as simulated and compare observed proportions with predicted ratios. Preserve the current preview status for Spanish.
- **Files.** `fruit-fly-genetics-lab/{data.js,index.html}`, `home.js`, `index.html`, and `tools/seo-pages.js`.
- **Regression and result.** Assertions cover the sampling, model and share text in both languages along with the home and SEO descriptions. Existing seed, Punnett ratio and translation checks were rerun. [Activity](https://activities.zornscience.org/fruit-fly-genetics-lab/)

## ZA-003 and ZA-004 · Iodine Clock Lab · Terminology and precision

- The local explanation now identifies `1/t` as a relative clock rate in s⁻¹ at a fixed endpoint. The nominal pre-mixing model concentrations retain guard digits. Their display is distinct from the precision of a measured concentration.
- Files `iodine-clock-lab/{index.html,data.js,README.md}`. Independent dilution and inverse-time model tests passed. Bilingual Playwright checks exercise the 2.0 and 8.0 mL presets and confirm the rate and precision notes. The published materials are listed in [REMAINING_ISSUES.md](REMAINING_ISSUES.md). [Activity](https://activities.zornscience.org/iodine-clock-lab/)

## Q11 · Population Sampling Lab · Model limitation

- The recapture setup explains the sensitivity of `MC/R` to small recapture counts and the case of zero recaptures. Teacher notes give a hypergeometric example. No estimator change was needed to teach the scope of the classroom model.
- Files `population-sampling-lab/{lab.js,data.js,TEACHER_NOTES.md}`. Both Playwright recapture flows now assert the explanation before testing the trial data. [Activity](https://activities.zornscience.org/population-sampling-lab/)

The new regression cases are in `tests/unit/scientific-audit-regressions.test.js`, `tests/e2e/scientific-audit.spec.js` `tests/e2e/apchem-unit8-practice.spec.js` and `tests/e2e/chemical-bonding-lab.spec.js`. Existing checks were also updated in the Beer’s Law, Equilibrium Constant, Unit 8 and Population Sampling suites.
