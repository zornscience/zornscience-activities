# Osmosis: Potato Cores in Sucrose Solutions

Version: 1.0.0

Grade 9 Biology virtual lab. Students soak potato cores in 0, 0.2, 0.4, 0.6, 0.8 and 1.0 M sucrose, weigh them
before and after 24 simulated hours, calculate percent change in mass, graph it and estimate the isotonic point
where the best-fit line crosses zero. No completion code, no login, no storage, no network calls. Plain HTML,
classic deferred scripts, strict IIFEs, no runtime dependencies. Licensed CC BY-NC-SA 4.0.

## Files

| File | Purpose |
| --- | --- |
| index.html | Page shell, header, Share panel, Instructions dialog |
| data.js | Every student-facing string in one object, English and Mexican Spanish side by side, and the SPANISH_READY flag |
| model.js | Pure simulation: isotonic point, seeded masses and noise, percent change, averages, best fit, feedback scoring. Runs in Node through module.exports |
| lab.js | Interface for the six steps. Gets numbers only from model.js and text only from data.js |
| share.js | Share panel with a clean link (language only) |
| lab.css | Styles, prefixed zsa-os- |

## Flow

| Step | What students do |
| --- | --- |
| 1. Predict | Raisin and pickle phenomenon, then three tap-to-choose predictions (0 M, 1.0 M, where mass will not change) |
| 2. Lab bench | Up to 3 trials. Core to balance, record starting mass, core into a beaker; fast-forward 24 hours; core to paper towel (blot), balance, record final mass. The data table fills as they work |
| 3. Graph | Drag 6 points onto their averages, drag 2 handles to make a best-fit line, slide a mark to where it crosses 0% |
| 4. Zoom in | Animated membrane for any beaker or the isotonic point, net flow arrow and live crossing counts |
| 5. Check | 4 tap-to-answer questions with immediate feedback and explanations |
| 6. Copy my data | One button copies tab-separated text for Docs or Sheets |

Every interaction is a tap, a drag or a keyboard action. There are no text boxes. Students write their
explanations later on their worksheet or in their own document.

Bench rules: a core must be weighed and recorded before it goes in a beaker; all six cores soak before the
fast-forward; after soaking, a core goes to the towel or the balance. Taps and drags call the same function, so
both follow the same rules and give the same messages. A core on the balance or towel stays picked up, so the
next tap carries it on. Dragging near the top or bottom of the screen scrolls the page.

Skipping the blot weighs 0.06 to 0.12 g of clinging solution. The row is flagged "not blotted", a hint explains
why the mass is too high, and "Blot and reweigh this core" replaces the reading. After one trial by hand,
"Finish this step for me" can do the setup or the reweighing for the other trials (always blotting).

Percent change cells stay hidden behind Show buttons until the student checks a calculation or turns on
auto-calculate. "Show me the formula" gives the formula and a worked example from the student's own first row.
The copied text includes a percent change only where it is visible on the page.

Redo without penalty: Redo this trial (fresh cores), Clear my graph, changeable predictions and answers, and
Start over (two taps) in the header. Nothing is scored or recorded.

## Model (teacher and developer reference)

Illustrative teaching model, not measured potato data.

- Isotonic point: 0.30 M plus a uniform shift of up to 0.05 M either way, fixed for the page visit (seeded).
- Expected percent change: 40 x (isotonic point minus concentration). About +12% in water and -28% in 1.0 M.
- Each core: starting mass 2.20 to 3.20 g, its own deviation (normal, standard deviation 1.0 percentage point),
  and a surface film of 0.06 to 0.12 g if not blotted. The balance reads to 0.01 g.
- Water crossing rates in the zoom view: in = 1 + d, out = 1 - d, with d = 1.6 x (isotonic point minus
  concentration), limited to plus or minus 0.8. Both directions always continue; the net is zero at the
  isotonic point.
- Graph feedback: a point is "on your data" within 1 percentage point of the student's average. The line is
  compared with the least-squares line through the averages by the mean vertical gap over 0 to 1.0 M (great
  within 1.5, close within 4). The mark is compared with that line's zero crossing (great within 0.02 M, close
  within 0.06 M). Over 500 seeds, three blotted trials put the best-fit crossing within 0.03 M of the hidden point.

?seed=NUMBER fixes the session (used by the tests). Without it, the seed comes from crypto.getRandomValues.
A redo uses a new attempt number, so it gives new cores.

## Language

All strings live in data.js STRINGS as {en, es}. The shared zsa-i18n.js looks text up by its English, so static
text in index.html must equal an en value (a unit test checks this). Decimal points and units are the same in both
languages. No em or en dashes anywhere.

### Turning on Spanish

The Spanish is written but has not been proofread. Until it is:

- data.js has SPANISH_READY = false, which removes the EN / ES toggle from the page. ?lang=es still shows the
  Spanish, for the proofreader.
- home.js lists osmosis-lab/ in pendingSpanish, so the Spanish landing page opens this lab in English and marks
  the card "(en inglés)".
- Known gap: tools/seo-pages.js must have a Spanish description for any page that loads zsa-i18n.js (a unit test
  requires it), so the ?lang=es address already appears in hreflang tags and sitemap.xml.

After proofreading: set SPANISH_READY to true, remove osmosis-lab/ from pendingSpanish in home.js, update the
two landing page tests in tests/e2e/osmosis-lab.spec.js, add the lab to the labs list in tests/e2e/i18n.spec.js,
bump the version, and run the tests.

## Accessibility

Native buttons and radio inputs for the bench and questions. Graph points, line handles and the mark are SVG
role="slider" handles with arrow, Page Up/Down, Home and End keys and a visible focus ring. Touch targets are at
least 44 px (graph handles have 92-unit hit circles). Results are announced through a polite live region. Color is
never the only signal: icons, words, dashes and sugar dots carry the same meaning. The zoom animation has a
Pause button, stops when the tab is hidden and starts paused with prefers-reduced-motion, which also skips the
24 hour animation. Nothing flashes.

## Links

Back to the lesson and Related lessons point to the Biology course page (https://zornscience.org/science/biology/)
until the osmosis lesson's address is confirmed. ?from= accepts only an HTTPS zornscience.org address.

## Changelog

- 1.0.0: First version.
