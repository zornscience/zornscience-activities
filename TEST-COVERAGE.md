# Test coverage report

Last updated 2026-11-19, branch `test-stabilization` (based on `main` at `49c3e9f`).

This report lists only what was run and observed. Anything not listed here was not verified. The environment was a
2-core Linux machine with Node 22.23.5, PHP 8.3.6, Playwright 1.56.1 (the version pinned in `package.json`, installed by `npm ci`), and the system Google Chrome
153 (Playwright's own browser download was blocked, HTTP 403/download failure), selected with `ZSA_CHROMIUM_PATH`.
Specs were run one worker at a time.

## Verified in this pass

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

- **Full Chromium suite.** Not re-run in this pass. The earlier 1,300 passed and 5 failed result came from a workspace
  that is no longer available, and its logs were lost. The five failures are accounted for as follows: the PHP
  encoding, countdown, Math draft-bank timeout, Lewis group 2 timeout and the two fps measurements are addressed above,
  but no new full-suite run confirms it.
- **Firefox and WebKit.** Not run. Playwright's browser download failed here, so the Firefox and WebKit projects need
  an environment that can download the pinned browsers (the GitHub Actions runner).
- **CI.** The workflow edit (PHP extension check) is validated as YAML only. It has not run on a runner, and
  `actionlint` was not available here. The pull request workflow and its report artifacts are unverified.
- **Coverage measurement.** `npm run test:coverage` does not exist on this branch, so no line, branch or function
  coverage figures are reported. Earlier figures (98.58% lines, 92.76% branches, 92.58% functions) belong to the lost
  workspace and are not claimed here.
- **Catalog smoke and representative workflows.** The earlier catalog run (78 routes, 71 Spanish variants) and the
  four representative compatibility workflows were not part of the code available for this pass, so they are not in
  this branch and not re-run. Neither establishes complete activity coverage: the catalog checks entry pages, and the
  compatibility checks cover four workflows.
- **Real devices.** Chromebook and iOS Safari accessibility checks remain on the backlog.
