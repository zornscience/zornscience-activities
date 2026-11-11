# Validation

Version: 1.0.0

Run npm ci, npm run test:unit, and the relevant Playwright specs. This activity
has no production build step. Regenerate registrations with node tools/build-seo.js
and node tools/build-about.js; both --check modes must then pass.

tests/unit/leaf-disk-lab.test.js checks ten-disk calibration across 1000 seeds,
the green/white ratio, no floating in dark, 0% bicarbonate and 45 °C, every
required monotonic trend, exact same-seed repeatability, independent factor
arithmetic and rejected invalid inputs. The model is imported directly in Node.

tests/e2e/leaf-disk-lab.spec.js covers the full guided conditions in both
languages, prediction locking and comparisons, preparation and cancellation,
pause/speed/skip invariant results, custom settings and the eight-trial limit,
per-investigation CER, successful and blocked clipboard writes, questions and
feedback, language reload, clean sharing, safe back links, embed and local-only
assets. Layout checks use 320, 390 and 1366 px. Drawings have bilingual names,
titles, visible axis labels and table or prose alternatives.

The shared labs-a11y spec automatically discovers lab.js and runs axe, focus
and keyboard checks in English and Spanish. i18n.spec.js includes this activity
in the shared lab header/layout checks. about.spec.js and seo.spec.js discover
the registrations. static.test.js covers strict IIFEs, URLs, CSP, versions,
prohibited APIs, inline styles and dash characters.

Stage 1: seven model tests and an English/Spanish browser smoke check of a
finished trial, Instructions, Share and 320/390/1366 px layouts passed.
Stage 2: all guided condition values, predictions, the eight-trial custom limit
and three widths passed in both languages; all seven model tests passed.
Stage 3: all 12 activity browser tests passed in Chromium. They cover both
languages, every guided condition, predictions, custom settings, playback,
CER copying and fallback, all questions, language reload and back-link rules.

## Final executed results

- npm ci --cache /workspace/work/npm-cache: passed. The workspace cache avoids
  the unavailable default home cache.
- npm run test:unit: 572 passed, 0 failed, 0 skipped. This includes seven model
  tests, all static rules, focus CSS and SEO generation checks. The initial
  run had 560 passes and 12 failures because PHP was absent. A local Debian
  PHP CLI with SQLite and iconv resolved those environment failures. No system
  or repository dependencies were changed.
- Playwright labs-a11y, i18n, layout, about, seo, integration and leaf-disk-lab
  specs: 336 passed, 0 failed, 0 skipped. Two subsequently added checks for a
  lesson iframe and every step at 320/390/1366 px in both languages also passed.
  Total: 338 distinct browser tests passed, 0 failed, 0 skipped.
- Static and focus CSS checks run separately after the UI refinements:
  11 passed, 0 failed. Static is a Node spec; the repository has no separate
  browser static spec.
- Both generator --check commands and git diff --check passed. Existing
  activity pages were unchanged by generation.
- Published activity source audit: no en or em dashes, inline styles, HTML
  injection, persistence APIs or unexpected HTTP(S) URLs. The SVG namespace is
  an identifier and generates no request. Invalid-host URLs appear only in
  the browser test's negative back-link fixtures.
- Browser instrumentation found no missing translation keys across static
  text and exercised dynamic states. All English/Spanish placeholder sets
  match. The requested provisional lesson title retains its needs review note.
- Desktop and 320 px Spanish screenshots were visually inspected. Narrow
  tables present readable trial cards; graphs redraw to keep labels readable.

The browser runs used system Chromium at /usr/bin/chromium through a temporary
Playwright config under work/. The committed configuration is unchanged.

Manual review: inspect the scene and both graphs after several trials. Use
keyboard-only air removal, radios, selects, Instructions, Share and Copy my
answers. Switch steps during preparation and playback. Confirm counts and
tables agree. Verify real Spanish lesson wording and the /es/ destination with
the teacher before publishing a final translated lesson title.
