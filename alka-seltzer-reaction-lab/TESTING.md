# The Alka-Seltzer Reaction review

Version: 1.0.0

## Screenshots

| View | Evidence |
| --- | --- |
| English, 1366 × 768 | [Whole tablet ready](../docs/alka-seltzer-reaction-lab/01-ready-whole-en.png), [reacting](../docs/alka-seltzer-reaction-lab/02-reacting-whole-en.png), [last visible fragment](../docs/alka-seltzer-reaction-lab/07-last-whole-fragment-en.png), [stopped](../docs/alka-seltzer-reaction-lab/03-stopped-whole-en.png) |
| Mexican Spanish, 360 × 800 | [Four quarters ready](../docs/alka-seltzer-reaction-lab/04-ready-quarters-es-mobile.png), [last powder grain](../docs/alka-seltzer-reaction-lab/05-last-powder-grain-es-mobile.png), [grain gone while the stopwatch is still running](../docs/alka-seltzer-reaction-lab/06-powder-endpoint-es-mobile.png) |
| Mexican Spanish at 200% Chromium zoom | [Beaker and Stop in the same view](../docs/alka-seltzer-reaction-lab/08-zoom-es.png) |

## Acceptance evidence

Chromium 154.0.8037.57 on Debian 13. The English and Mexican Spanish worksheet walkthroughs both covered the whole tablet, all four quarters, powder and a repeat. The test read the time and indicator colors from the student interface and mapped them to the original worksheet. The example values below were captured through Stop in the controlled-clock browser tests.

| Worksheet row | Elapsed time in English and Spanish | Starting BTB color | Final BTB color |
| --- | ---: | --- | --- |
| Whole tablet | 45.1 s | Light blue / Azul claro | Green / Verde |
| Quarter Tablet (all 4 pieces) | 28.1 s | Light blue / Azul claro | Green / Verde |
| Crushed powder | 15.1 s | Light blue / Azul claro | Green / Verde |

A separate 1× walkthrough without a test clock captured 45.1, 28.0 and 15.0 s with the same colors. The three readings fit the worksheet graph with the tablet preparations along the horizontal axis and a seconds scale on the vertical axis. The lab provides that prompt after three manual stops. The measurements and graph stay on the worksheet.

| Check | Result |
| --- | --- |
| Fill, dose and rinse | The beaker fills to 50 mL. Seven drops count up in each fresh preparation. Rinsing clears the solution, scene and stopwatch. A repeat can start with any of the three forms after the guided sequence. |
| Endpoint and stopwatch integrity | An early press freezes the fragment and current time. Resume continues from that instant. Around disappearance, rendered fragment pixels and text change together, the timer keeps running and bubbles remain. A late press retains the longer reading. Duplicate clicks on Drop or Stop leave one trial and one reading. |
| A11y and layout | Passed keyboard-only timing, reduced motion, one live announcement at the disappearance, dialog focus return and axe-core checks. The beaker and Stop fit at 1366 × 768, 360 × 800 in both languages, inside a 900 × 660 iframe, and at native 200% zoom on a 1366 × 768 content viewport. |
| Interruptions and load | Instructions and a simulated visibility change freeze the clock and scene. Both require explicit resume. Changing language preserves the trial. At 6× CPU throttling plus a 350 ms main-thread stall, the reading agreed with monotonic elapsed time to within 0.15 s. |
| Site integration | Biology card, bilingual metadata, sitemap, header, About, license, safe return links, Share URLs and email text passed. The related Carbon Cycle lesson and Biology fallback pages were verified in both languages. |

## Repository test results

- 744 unit tests passed with PHP 8.4.27 available.
- 122 browser regression checks passed across the lab, site headers, SEO, Molar Mass Trap, BTB Carbon Cycle and Kinetics. The final lab run passed all eight scenarios. The new About entry and registry coverage also passed.
- Quick parity against `origin/main` found no differences in 984 compared states and 936 screenshot pairs across five scenarios.
- The About and SEO generators reported current outputs. `git diff --check` passed.

## Reproduce

Run these commands from the repository root with the Node development dependencies and Chromium installed.

```sh
npm run test:unit
npm run test:browser -- alka-seltzer-reaction-lab.spec.js
node tools/build-about.js --check
node tools/build-seo.js --check
```

Set `ZSA_CHROMIUM_PATH` to an installed Chromium binary to use that browser. Set `ZSA_ALKA_SCREENSHOTS` to an output directory to regenerate the walkthrough screenshots. PHP with ctype, iconv, pdo and pdo_sqlite is required by the repository's unrelated WordPress unit tests.

## Classroom validation still needed

- Repeat all three physical preparations with the intended tablets, 50 mL of the classroom water at the usual temperature, the actual BTB stock and dropper, and steady gentle stirring. Record typical times and variation, initial and endpoint colors, and how long fizz remains visible. Check whether powder dispersal, residue or foam affects when observers agree the last solid has disappeared. Use those observations to calibrate the modeled durations, indicator colors and bubble tail.
- Observe a first-time Grade 9 student using the original worksheet and an entry-level Windows Lenovo or comparable school laptop. Check that they can transfer each reading to the right row, tell solids apart from bubbles, and stop at the endpoint without scrolling or prompting. Include a Mexican Spanish walkthrough and a screen-reader or assistive-technology check on classroom hardware when available.
- Check native tab switching on the school browser. The automated interruption check dispatched the visibility event, and the browser in this workspace did not report a hidden tab during the native exercise.

## Changed paths

- `alka-seltzer-reaction-lab/` contains the static lab, model, translations and preview and test notes.
- `index.html`, `home.js`, `README.md` and `SPANISH_TERMS.md` list the lab and its terminology.
- `shared/zsa-about.js`, `tools/seo-pages.js` and generated `sitemap.xml` register the new bilingual route.
- `tests/e2e/alka-seltzer-reaction-lab.spec.js`, `tests/unit/alka-seltzer-reaction-lab.test.js` and `tests/unit/locales.test.js` cover the lab and updated card count.
- `docs/alka-seltzer-reaction-lab/` holds the review screenshots.
