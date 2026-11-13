# Enzyme Activity Lab

Version: 1.0.0

Grade 9 Biology: "What makes catalase work best?" Students set up a fair test of temperature or pH, measure oxygen
foam with a virtual ruler over three trials, graph the averages, find the optimum and see the active site denature.
Plain HTML, CSS and classic deferred scripts in strict IIFEs. No build step, runtime dependencies, network calls,
storage, accounts or images: every drawing is inline SVG. No typed answer boxes; students tap, drag and choose,
and write later on a worksheet or document. Licensed CC BY-NC-SA 4.0.

## Files

| File | Purpose |
| --- | --- |
| index.html | Page shell, header, Instructions dialog, Share panel (a link and a Copy button, no text box) |
| i18n.js | Every student-facing string in one object, `{key: {en, es}}`, plus the `SPANISH_ENABLED` flag |
| model.js | Pure simulation logic, also loaded in Node by the unit tests |
| lab.js | The seven steps and all drawing and interaction |
| lab.css | Styles, prefixed `zsa-ez-` |
| share.js | Clean share link only, never data or seed |
| TEACHER_NOTES.md | Classroom notes and the science behind the model |
| TESTING.md | How the lab is tested |

## Flow

| Step | Work |
| --- | --- |
| 1. Hook | Peroxide sits still in the bottle and foams on a scrape. Tap-to-choose prediction, then the catalase reveal |
| 2. Bench | Choose temperature (0, 20, 37, 55, 80 °C) or pH (3, 5, 7, 9, 11), a liver or potato extract, and a predicted optimum. Droppers, water bath and pH buffer tools are applied by tapping tubes |
| Fair test checker | Check my setup lists missing liquids, unequal amounts, a second changed variable and repeated levels, each with a short reason. Running stays locked until the setup is fair |
| 3. Run and measure | 60 s timer at 10× speed (Skip to 60 s). Foam rises. Students drag or tap the ruler marker (or use arrow keys and Up/Down buttons) and Record; readings within 2 mm are accepted. 3 trials; the table and averages fill as they go |
| 4. Graph | Drag each point to its average (within 3 mm), Check my points, choose the smooth curve over a zigzag or straight line, and mark the optimum. The predicted optimum is a dashed line |
| 5. Zoom in | Animated catalase and H₂O₂. Optimum, cold (slow but intact), 80 °C, pH 3 and pH 11 (active site loses its shape). Pause button; reduced motion starts paused with a clear still frame |
| 6. Check | Four tap-to-answer questions with immediate feedback and explanations |
| 7. Copy data | Copy my data puts a tab-separated block on the clipboard: data table, hook prediction, predicted and measured optimum, and three conclusion sentence starters. If the clipboard is blocked, the text is shown and selected |

Every step can be revisited at any time without penalty. Once trials exist the bench locks, and Change my setup asks
before it clears that variable's trials. Start over asks before it clears everything. Temperature and pH data are kept
separately, so a student can do both paths; Copy my data then includes both.

## Model (illustrative, not measured data)

- Each session hides an optimum of 37 ± 3 °C and pH 7 ± 0.3 (seeded; `?seed=N` repeats a session).
- Temperature factor: exponential slowdown below the optimum (about 12% at 0 °C, never zero); a steep Gaussian
  drop above it (width 12 °C), about 10% at 55 °C and effectively zero at 80 °C.
- pH factor: Gaussian around the optimum (width 1.8), about 1 to 2% at pH 3 and 11.
- Foam after 60 s = 40 mm per mL peroxide × (1 − e^(−k·60)), k = 0.008 s⁻¹ per mL extract × source × activity
  (potato 0.45 of liver), capped at 100 mm.
- Seeded noise per trial and tube: 6% relative plus 0.8 mm absolute, never below 0.
- For every seed the tested optimum is 37 °C and pH 7 (checked over 500 seeds in the unit tests).

## Spanish

All strings have Mexican Spanish drafts in `i18n.js`. `SPANISH_ENABLED` is `false` until they are proofread, so the
page stays English (even with `?lang=es`) and shows no language toggle. Reviewers can see the Spanish in context at
`?lang=es&es-review=1`. To publish Spanish: set the flag to `true`, add a Spanish description in
`tools/seo-pages.js` (the SEO test currently expects `es: null` because the page does not load `shared/zsa-i18n.js`;
update that check or load it), run `node tools/build-seo.js`, and confirm the Spanish lesson title in
`shared/zsa-about.js`.

## Links

The back link and About section point to the Biology course page (`/science/biology/`) until the enzymes lesson
address is confirmed. It uses the shared `bio-lessons` entry in `shared/zsa-about.js`; give it its own lesson key
and update the back link in index.html together.

## Changelog

- 1.0.0: Initial lab.
