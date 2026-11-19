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

The latest resumed verification uses main at fab4614, project Playwright 1.56.1,
system Chromium 154.0.8037.57, and a local PHP 8.4 runtime with SQLite for the
existing WordPress tests. These are test tools, not activity dependencies.

| Command | Completed result |
| --- | --- |
| `node --test tests/unit/natural-selection-lab.test.js tests/unit/static.test.js tests/unit/seo.test.js tests/unit/focus-css.test.js` | 27 passed, 0 failed |
| `npx playwright test tests/e2e/natural-selection-lab.spec.js tests/e2e/labs-a11y.spec.js tests/e2e/activity-headers.spec.js tests/e2e/about.spec.js --grep 'natural.selection' --workers=2` | 17 passed, 0 failed |
| `npm run test:unit` with the local PHP runtime on PATH | 704 passed, 0 failed |
| `node tools/build-about.js` and `node tools/build-seo.js` after rebasing | Completed; only this activity's generated registration changed |
| Both build tools with `--check` | Exit 0 |
| `node natural-selection-lab/tools/build-teacher-notes.js --check` | All 42 generated tables match |
| `git diff --check` | Exit 0 |

Full repository browser and parity results, including any earlier failed
attempts and their reruns, belong in the pull request evidence report. The full
browser command is `npm run test:browser -- --workers=2`; the full parity command
is `npm run parity`. Do not describe an unrun or interrupted check as passing.

Earlier completed development checks included 11 model tests, 9 activity browser
tests, and 16 shared static tests with no failures. Missing test prerequisites
initially caused 9 browser launch failures and 12 PHP failures; the prerequisites
were then supplied. A full browser run on the earlier base completed with 1173
passed and 8 failed. Its corrected header case and six resource-sensitive checks
passed in an isolated rerun. The remaining Leaf Disk clock assertion passed
following its upstream fix and rebase; that rebase's affected browser run had
62 passed and 0 failed. Its full unit run had 593 passed and 0 failed. A later
15-test flow and accessibility rerun passed after restricting graph label
connectors to completed runs.

The first full parity run completed with 11 scenarios, 3723 compared states,
3296 screenshot pairs and no differences. A later run on the updated base
reported one 300-pixel difference confined to the unchanged Ion Charge Trainer's
native select text, with no DOM, layout or computed-style difference. The
resumed task reruns the final parity check and reports its actual result in the
pull request. There are no workflow changes in this branch.

## Brief interpretation

The blocked-clipboard fallback uses a selected read-only pre panel. This resolves
the conflicting request for a selectable text area and the explicit ban on all
textareas. The fallback contains exactly the same TSV and worksheet prompts.
The Spanish lesson twin is provisional and not yet published, as documented in
README.md. These publication and wording notes do not change the science model.
