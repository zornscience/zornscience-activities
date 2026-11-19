# Test coverage report

Last updated 2026-11-19, `main` at `0f71c53` (pull request #140 merged).

This report lists only what was run and observed. Anything not listed here was not verified. There are two sets of
results: a local pass (below) and the GitHub Actions run on pull request #140. The local environment was a
2-core Linux machine with Node 22.23.5, PHP 8.3.6, Playwright 1.56.1 (the version pinned in `package.json`, installed by `npm ci`), and the system Google Chrome
153 (Playwright's own browser download was blocked, HTTP 403/download failure), selected with `ZSA_CHROMIUM_PATH`.
Specs were run one worker at a time.

## Verified locally

| Check | Result |
| --- | --- |
| `tests/unit/*.test.js` | 704 passed, 0 failed |
| `tests/unit/act-history.test.js` with PHP `ctype`, `iconv`, `pdo`, `pdo_sqlite` loaded | 3 passed, including the new extension check |
| ACT platform: full-section English countdown (`act-platform.spec.js`) | Passes. The page clock is paused before the section starts, so it reads 35:00, then 34:59 after a 1 s tick, then 34:00 |
| ACT platform: Math tests (5 tests, including every draft-bank question) | 5 passed in 47 s; the draft-bank case took 34.5 s alone |
| Lewis builder routing (`lewis-routing.spec.js`, octet and AP) | 16 passed in 1.8 min; the longest test took 12 s |
| Equilibrium K lab (`equilibrium-k-lab.spec.js`) | 10 passed in 36 s; no tracked screenshot changed |
| Mitosis fps at 4x CPU slowdown, run alone 3 times | 56.7 to 60.0 fps in every scenario (threshold: above 30) |
| Yeast fast-forward fps at 4x CPU slowdown, run alone 3 times | 60.0 fps each time (threshold: above 30) |

## Verified in CI (GitHub Actions, pull request #140, head `a2bac18`)

Runner `ubuntu-24.04`, Playwright 1.56.1 with its own pinned Chromium (the workflow runs `npx playwright install
--with-deps chromium`), Chromium project only.

| Check | Result |
| --- | --- |
| Unit and browser tests job | Passed in 25 min 39 s |
| Unit tests (`npm run test:unit`) | 705 passed, 0 failed |
| Browser suite (`npx playwright test`, Chromium) | 1,354 passed, 0 failed, 23.5 min |
| PHP extension step (`ctype`, `iconv`, `pdo`, `pdo_sqlite`) | Passed on the runner, and the matching unit test passed |
| Behavior parity with the base branch job | Passed in 5 min 29 s |
| `Tests` workflow on `main` after the merge (`0f71c53`) | Passed |

The earlier lost-workspace run reported 1,300 passed and 5 failed. All five of those failures are covered by the
changes above and none occurred in CI: the PHP encoding, the countdown, the Math draft-bank timeout, the Lewis group 2
timeout, and the Mitosis and Yeast fps checks. The pass count is higher because the Lewis tests are now split into more
tests; the two counts are not from the same set of tests.

## What changed and why

- **PHP encoding.** The ACT history test needs `iconv` (UTF-8 to Windows-1252 for accented letters and curly quotes in
  the PDF). A PHP without it failed deep inside the test. The suite now checks `ctype`, `iconv`, `pdo` and `pdo_sqlite`
  first and names any that are missing. `TESTING.md` lists the requirement, and the CI workflow fails with the missing
  extension's name before the unit tests run.
- **ACT countdown race.** The page clock kept running after it was installed, so the first reading could already be
  34:59. The test now pauses it first and advances it with `runFor`.
- **Lewis routing time.** The slow part was node-side: `enumerate()` in `tests/support/lewis-reference.js` walked every
  electron placement for SF6 again on every accepted-structure and feedback lookup. It is now cached per item, which
  took the slowest group from 132 s to under 12 s. The tests are split into 8 groups by item index, so every item is
  still checked. The sanity floors scale with the group count.
- **Screenshots.** `equilibrium-k-lab.spec.js` writes its captures to Playwright's test output directory instead of the
  tracked `equilibrium-k-lab/screenshots/` folder.
- **Performance thresholds.** The Mitosis (29.17 fps) and Yeast (11.84 fps) failures reported earlier did not reproduce
  on an idle machine, so neither the application nor the 30 fps threshold was changed. Those were measured during a
  full parallel run, and CPU throttling measures only what is left for the page. Run the two performance specs by
  themselves (or with fewer workers) when a failure needs to be told apart from contention.

## Not verified (remaining gaps)

- **Firefox and WebKit.** Never run. The workflow installs and runs Chromium only, and Playwright's browser download was
  blocked in the local environment. Running them means adding projects to `playwright.config.js` and installing the
  pinned browsers in the workflow, which is a CI change that has not been made.
- **CI report artifacts.** The workflow uploads `test-results/` and the parity report only when a job fails, so the
  passing run has none to inspect. The failure path of those uploads has not been exercised.
- **Workflow linting.** `actionlint` has not been run on the workflow edits. The CI run itself shows they execute.
- **Coverage measurement.** `npm run test:coverage` does not exist on `main`, so no line, branch or function coverage
  figures are reported. Earlier figures (98.58% lines, 92.76% branches, 92.58% functions) belong to the lost
  workspace and are not claimed here.
- **Catalog smoke and representative workflows.** The earlier catalog run (78 routes, 71 Spanish variants) and the
  four representative compatibility workflows are not in `main` and were not re-run. Neither establishes complete
  activity coverage: the catalog checks entry pages, and the compatibility checks cover four workflows.
- **Performance thresholds under load.** Mitosis and Yeast pass alone and in the CI run, but CPU throttling measures
  only what the machine has left, so a heavily loaded runner can still fail them. Run those two specs by themselves to
  tell a real regression from contention.
- **Real devices.** Chromebook and iOS Safari accessibility checks remain on the backlog.
