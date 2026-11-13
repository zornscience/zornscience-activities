# Mitosis Detective: Inside an Onion Root Tip

Version: 1.0.0

Grade 9 Biology virtual lab. Students find the part of an onion root where cells divide, focus a microscope, identify
and tally cells in each phase of mitosis across three fields, turn counts into percents and minutes, answer five
questions and copy their data into a lab document. No completion code, no login, no storage and no network requests.
Plain HTML, CSS and classic deferred scripts in strict IIFEs, with no runtime dependencies. Licensed CC BY-NC-SA 4.0.

## Files

| File | Role |
| --- | --- |
| `index.html` | Shared header, Share panel, Instructions, the step frame, the cell guide and Start over dialogs |
| `data.js` | Every student-facing string in one object, `STRINGS` (`{id: {en, es}}`), the quiz and `FLAGS` |
| `model.js` | Pure functions: seeded fields, phase mixes, focus, keyboard neighbors, scoring, percents, minutes, wheel, copy text. Also runs in Node |
| `cells.js` | Canvas drawing: one routine draws any cell at a point on the cycle, so field, zoom, icons and guide match |
| `lab.js` | The six steps, the microscope, tally, analysis, drag and drop, questions, copy, tour, guide and Start over |
| `share.js` | Share panel: a clean link to a fresh lab |
| `lab.css` | Dark microscope room for Sample and Microscope, light panels elsewhere; system fonts only |

Scripts talk through events on the activity root (`mitosis-model`, `mitosis-cells`, `mitosis-strings`), never globals.

## Flow

| Step | What the student does |
| --- | --- |
| 1 Predict | Reads the ink-mark root story (animated root growth) and picks a prediction. Predictions are not graded |
| 2 Sample | Taps a root zone. Root cap, elongation and mature zones show a quick look with almost no dividing cells and a kind explanation; the meristem is the sample |
| 3 Microscope | Focuses at low power (whole root tip), switches to high power (animated zoom), refocuses, then identifies cells inside the reticle ring in three fields |
| 4 Analyze | Reads the auto-built table, picks the longest and shortest phase, matches minute cards to phases by drag or tap, and watches the cycle wheel |
| 5 Check | Five tap questions with a hint after a miss and an explanation after a correct answer |
| 6 Copy | Copies the table, percents, minutes, prediction and three sentence starters as tab-separated text |

A progress tracker, a Cell guide button and Start over sit above every step; one Next button with a note about what is
missing sits at the bottom. Next stays focusable while a step is unfinished and explains what to do. A short tour runs
on each visit (nothing is stored); Skip tour, Escape or `?tour=0` dismiss it, and Instructions can show it again.

## The microscope and the tally

Each field is the square [-1, 1] in field units; the eyepiece is the circle of radius 1 and the reticle ring has radius
0.86. Cells tile the tissue in files along the root axis (about 0.2 by 0.24 units), so slots never overlap. About 48
cells (42 to 56) have centers inside the ring; only those count. Low power shows the same slide 4 times smaller with the
root outline and cap.

Each field must have 5 to 9 dividing cells (80 to 90 percent interphase), drawn from a meristem mix of 86% interphase,
6.5% prophase, 3% metaphase, 2% anaphase and 2.5% telophase. The three fields together always have every phase,
anaphase strictly least and prophase the most common dividing phase, so the conclusion is clear. Rejection sampling
uses fixed streams, so a seed always gives the same cells. Cells outside the ring near the field are interphase.

Per field, students find every dividing cell and identify 3 interphase cells. A wrong pick locks that choice and shows
what the chosen phase looks like plus what to look for; after two misses, Show me reveals the answer. When the goals are
met, Count the other cells as interphase completes the field. No answer is ever penalized.

Focus: the slider runs 0 to 100, and each field and power has its own sharp point (high power is 9 to 15 steps from
low). Within 3 steps counts as sharp. Blur is three pre-rendered layers (sharp, soft, heavy) crossfaded by opacity, and
the zoom is a CSS transform, so both stay on the compositor. Auto focus animates to the sharp point.

Minutes use the percent students see: minutes = round(percent to one decimal / 100 x 1,440). Rounded minutes can add up
to a few minutes more or less than 1,440, and the page says so. The wheel uses exact shares.

## Seeds and options

`?seed=NUMBER` (finite numbers become unsigned 32-bit integers, zero works) repeats the same three fields and the same
quick looks. Without it, each visit and each Start over draws a seed from `crypto.getRandomValues`. `?tour=0` skips the
tour; `?embed=1` uses the shared embed mode (no chrome, no tour); `?from=` accepts only an HTTPS zornscience.org lesson.

## Spanish (written, not yet published)

All Spanish strings are in `data.js`. They have not been proofread, so `FLAGS.spanishToggle` is `false`: the EN / ES
toggle is removed from the page, `tools/seo-pages.js` lists the page as English only (`es: null, spanishPending: true`)
and the Spanish landing page shows it in English, like the ACT activities (`SPANISH_PENDING` in `home.js`). `?lang=es`
still shows the whole lab in Spanish so a reviewer can read it in place.

Publishing the Spanish version:

1. Set `FLAGS.spanishToggle` to `true` in `data.js`.
2. In `tools/seo-pages.js`, give `mitosis-lab` a Spanish description (110 to 160 characters) and remove `spanishPending`.
3. Remove `"mitosis-lab/"` from `SPANISH_PENDING` in `home.js`, add its Spanish title to the landing page map there, and
   add the slug to the `labs` list in `tests/e2e/i18n.spec.js` (and take it out of that file's "(en inglés)" list).
4. Update the test in `tests/unit/mitosis-lab.test.js` that pins the flag, run `node tools/build-seo.js`, bump the version.

## Accessibility

Native controls throughout (radios, range input, buttons, dialogs). The cells inside the ring are one Tab stop: arrow
keys move to the nearest cell in that direction, Home and End jump to the first and last, Enter opens the zoomed cell.
Each cell button is named "Cell n, not identified yet" or "Cell n, Metaphase". The zoomed view has a text description of
what the cell shows for screen reader users. Time cards work by drag, by tap then tap, or by keyboard. Results are
announced in one polite live region. Identified cells get a ring, a letter badge and a label, so color is never the only
signal; the wheel has letter tags and an ordered legend. Reduced motion removes transitions, the moving wheel marker and
the guide's autoplay (Previous and Next phase still step through). No flashing.

## Known limits

- At 360 px the eyepiece is about 350 px wide, so cell tap areas are about 34 px wide and 39 px tall (smallest side
  33 px in testing): they tile the field with no gaps and meet WCAG 2.5.8 (24 px), but not the house 44 px. Tapping
  opens a zoomed sheet that shows which cell was chosen, so a near miss is easy to see and fix.
- The lesson link points to the Biology course page until the cell division lesson's address is confirmed
  (`bio-course` in `shared/zsa-about.js` and the back link in `index.html`).
- The tour shows on every visit because the site stores nothing.
- The cells are a stylized model (6 chromosome pairs, not an onion's 8), not photographs.

## Changelog

- 1.0.0: First release. Six steps, three seeded fields, keyboard tally, drag and drop minutes, cycle wheel, cell guide
  with an animated division, five questions, tab-separated copy, English and unpublished Mexican Spanish.
