# Feed the Yeast: Fermentation and Energy

Version: 1.0.0

Grade 9 Biology virtual lab. Students feed yeast different foods, measure the carbon dioxide they make with balloons
and a virtual tape, test how much glucose yeast can use, and zoom into a yeast cell to connect fermentation with
cellular respiration. No completion code. Plain HTML, CSS and strict-IIFE JavaScript, no build step, no runtime
dependencies, no network calls, no storage, no outside fonts or images (system fonts; every drawing is SVG made in
the page). Licensed CC BY-NC-SA 4.0.

## Learning goals

- Cells need energy from food molecules. Yeast breaking down sugar without oxygen (fermentation) releases carbon
  dioxide, ethanol and a small amount of ATP.
- Different sugars are used differently: glucose fastest, table sugar a little slower (it must be split first),
  starch barely (no enzyme to cut it), artificial sweetener not at all.
- Rate rises with food supply until it levels off (saturation).
- Practice: fair testing, repeated trials and averages, plotting a bar graph and a line graph, and reading where a
  curve plateaus.

## Flow

A progress tracker (Hook, Part A, Part B, Zoom, Check, Copy) runs across the top. A sticky guide bar at the bottom
always says what to do next, with at most one coral button. A three-tip tour shows on each fresh visit (storage is
not allowed by the house rules, so it cannot remember a previous visit) and can be skipped. `?tour=0` hides it.

| Step | Work |
| --- | --- |
| Hook | Dough rises and a balloon fills on a bottle of yeast and sugar water. Prediction: what fills the balloon? |
| Part A: which food? | Predict. Check a lab partner's draft setup (two seeded mistakes in temperature, yeast or food amount). The fair test checker names each mistake kindly and blocks the run until it is fixed. Measure five limp balloons, fast-forward 30 minutes, measure again. Plot a bar graph of the change. |
| Part B: how much food? | Predict the graph shape. Glucose at 0, 2, 5, 10 and 20 g, everything else equal. Three trials, with averages. Plot a line graph and slide a marker to where it levels off. |
| Zoom | An animated yeast cell: glucose enters through a transport protein, splits (2 ATP), and without oxygen leaves as carbon dioxide and ethanol; with oxygen the pieces go into the mitochondria (about 30 more ATP, carbon dioxide and water). Table sugar is split by invertase first; sweetener bounces off; starch is too big. The Hook prediction is revealed here. |
| Check | Five tap-to-answer questions (sweetener, saturation, source of CO2, bread dough, an unfair setup) with immediate feedback for every choice and no penalty for retries. |
| Copy | A preview and a Copy my data button: predictions, both data tables, the plateau estimate and three conclusion sentence starters, tab-separated so they paste as tables. If the clipboard is blocked, the data are selected for Ctrl+C. |

Reset Part A and Reset Part B (and Start the whole lab over) can each be undone for 20 seconds. Predictions can be
changed until testing starts.

## Files

| File | Role |
| --- | --- |
| `index.html` | Page skeleton, shared header, Instructions dialog, Share panel, model details. Static text carries `data-fy-t` keys. |
| `data.js` | Every student-facing string in one object, `{en: {...}, es: {...}}`, plus the question and prediction lists and `spanishReady`. |
| `model.js` | Pure simulation (no DOM, clock or `Math.random`): substrates, temperature, saturation, seeded variation and tape noise, balloon size, fair test checker, plateau check, plot matching, copy text. Runs in Node for the unit tests. |
| `lab.js` | Screens, drawings, animation, graphs, guide bar, tour. One `requestAnimationFrame` loop that runs only while something moves. |
| `share.js` | Share panel (clean link, copy, email). |
| `lab.css` | Palette, layout, drawings. |

## Illustrative teaching model

Developer and teacher calibration, never shown to students as formulas. Gas volumes are mL over 30 simulated minutes.

- Gas = variation × (stored-food gas × t + food rate × max(0, t − lag)).
- Food rate = gasMax / 30 × (yeast / 5 g) × temperature factor × substrate use × saturation(amount).
- Substrate use and lag: glucose 1 and 0 min, table sugar 0.92 and 2 min, starch 0.03, sweetener 0, no sugar 0.
  Stored-food gas is 6 mL per 30 min at the standard setup, so the no-sugar and sweetener balloons grow about 1 cm.
- Temperature factor: exp(−((T − 37)/s)²) with s = 15 below 37 °C and 8 above (50 °C gives about 0.07).
- Saturation: x / (1 + x⁵)^(1/5) with x = amount / saturation. It rises almost in a straight line and levels off
  near the saturation amount.
- Each visit: saturation uniform in 9 to 11 g and gasMax 400 mL × 0.92 to 1.08, from the session seed.
- Each bottle in each trial: variation N(1, 0.04) clamped to 0.9 to 1.1. Each tape reading: N(0, 0.12) cm clamped to
  ±0.4, rounded to 0.1 cm.
- Balloon: a sphere holding 20 mL of air plus the gas. C = 2πr with V = 4/3 πr³. A limp balloon is about 10.6 cm.
  Circumference grows with the cube root of the gas, so the line graph bends a little more than the gas does; the
  place where it levels off is the same.
- Plateau check: the first dose whose average reaches 85% of the total rise is where the graph levels off (10 g on
  every one of 1,000 seeded visits in the unit test). A marker counts as right from halfway to the previous dose to
  halfway to the next (8 to 15 g).

Real yeast saturate at much lower sugar concentrations than this; the plateau near 10 g was chosen so students can
see it with five familiar amounts. Real yeast also ferment when some oxygen is present (and a sealed bottle soon runs
out of oxygen anyway). The model details panel and TEACHER_NOTES.md say this is an illustrative model.

`?seed=NUMBER` repeats a visit exactly (the partner's mistakes, the plateau and every reading). Without it, each
visit gets a seed from `crypto.getRandomValues`.

## Languages

All strings live in `data.js` in English and Mexican Spanish. **The Spanish is written but not yet proofread**, so
`spanishReady` is `false`: the EN / ES toggle in the header is removed, `?lang=es` opens the lab in English, the SEO
entry has no Spanish (`es: null`, no hreflang, not in the sitemap in Spanish), and the landing page marks the card
"(en inglés)". Reviewers can see the Spanish with `?lang=es&preview=1`.

To publish the Spanish after proofreading:

1. Set `spanishReady: true` in `data.js`.
2. Add a Spanish description in `tools/seo-pages.js` and run `node tools/build-seo.js`.
3. Remove the "(en inglés)" lines for this lab in `home.js`.
4. Add `"yeast-fermentation-lab"` to the `labs` list in `tests/e2e/i18n.spec.js` and flip the Spanish assertions in
   `tests/e2e/yeast-fermentation-lab.spec.js` and `tests/unit/yeast-fermentation-lab.test.js`.
5. Bump the version.

## Accessibility

WCAG AA contrast for every text color pair (see TESTING.md), 44 px targets, native radios for choices, buttons for
answers and steppers, `role="slider"` graph bars, points and marker with arrow, Page, Home and End keys and spoken
values, visible focus everywhere, a polite live region for results, and text alternatives for every drawing. Color is
never the only signal: checks, crosses, warning triangles, dashed borders and text carry the same meaning. With
`prefers-reduced-motion`, nothing tweens: balloons jump to their sizes, the cell shows each stage in turn, and results
are identical.

## Links

The back link goes to the Unit 8 lesson Rates of Photosynthesis (the related lesson already in the registry);
`?from=` accepts any HTTPS zornscience.org page without credentials or a port, so a respiration lesson can link here
and get its own back link. With Spanish, the default back link uses the `/es/` twin. `?embed=1` uses the shared embed
behavior and hides the tour.

## Changelog

- 1.0.0: First version.
