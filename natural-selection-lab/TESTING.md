# Natural Selection Lab testing

Version: 1.0.0

## Model checks

`node --test tests/unit/natural-selection-lab.test.js` runs 11 tests:

- Seed normalization including zero, separate investigation and run streams,
  settings sensitivity, immutable state, and stepped versus run-to agreement.
- Whole, nonnegative adult counts sum to N at every recorded generation.
- Natural extinction fixture: seed 148, investigation 3, index 0, N = 10,
  start 0% dark. Hunting after generation 4 leaves no survivors.
- Expected-value recursion for mutation 0 at strengths 0.1, 0.3 and 0.5.
  Twelve fixed seeds at N = 100,000 agree at every generation through 15
  within 0.5 percentage points of the deterministic recursion.
- Neutral strength and mutation 0: 1,000 seeds, N = 100, generation 20 mean
  change within 1.5 percentage points of zero.
- Without initial variation and without mutation, no new color appears.
- The ground changes at generation 10 before that generation's hunt;
  across 400 seeds, mean percent dark falls by more than 40 points by 30.
- Under weak selection, across 600 seeds, final percent-dark standard deviation
  at N = 10 is more than twice that at N = 200.
- Invalid settings, seed, run index and generation rejection.

## Browser checks

`npx playwright test tests/e2e/natural-selection-lab.spec.js --workers=2`
runs 9 tests, including complete guided flows in English and Mexican Spanish.
It exercises generation 0, stepping, finishing, predictions, locked settings,
all five guided Investigation 3 comparisons and the sixth run limit, six
simultaneous graph encodings, all understanding questions and instant feedback.

Further checks cover exact displayed counts against seeded model runs, no
future data, advance drought announcement and graph marker, headered TSV copy,
blank lines between run tables, prediction inclusion, all stable prompt numbers,
clipboard denial and text selection, absence of text inputs and textareas,
keyboard operation, native modal Escape and focus return, seeded reloads,
language reload clearing work, reduced motion and hidden documents, no runtime
requests or storage access, clean Spanish Share, embed behavior and safe back
links, 360 px no overflow and 44 px targets, and the natural extinction fixture.

The shared labs-a11y spec discovers this folder through lab.js, including axe,
Tab focus, named drawings and modal checks in both languages. The shared i18n
lab list includes it. Shared about and SEO tests cover both registrations.

## Regeneration checks

- `node tools/build-about.js` and `node tools/build-seo.js` generate the about
  block, canonical links, bilingual descriptions and sitemap registration.
- Their `--check` forms detect stale output.
- `node natural-selection-lab/tools/build-teacher-notes.js` computes all 42
  guided run tables for seeds 1 to 6. Its `--check` form detects stale keys.
- `git diff --check` checks whitespace.

## Execution evidence

Final command results are recorded in the pull request description. The first
activity-only model run completed with 11 passed and 0 failed. The first browser
attempt had 9 launch failures because the bundled Playwright executable was
missing. Using the existing system Chromium, all 9 activity browser tests ran
and passed with 0 failed. The initial full unit run had 571 passed and 12 failed,
all 12 from missing PHP in the environment. A local PHP runtime supplies the
existing WordPress test prerequisite. No workflow files are changed.

## Brief interpretation

The blocked-clipboard fallback uses a selected read-only pre panel. This resolves
the conflicting request for a selectable text area and the explicit ban on all
textareas. The fallback contains exactly the same TSV and worksheet prompts.
The Spanish lesson twin is provisional and not yet published, as documented in
README.md. These publication and wording notes do not change the science model.
