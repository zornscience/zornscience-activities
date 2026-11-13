# Mitosis Detective testing

Version: 1.0.0

Run from the repository root:

```
node --test tests/unit/mitosis-lab.test.js
npx playwright test tests/e2e/mitosis-lab.spec.js
npx playwright test tests/e2e/labs-a11y.spec.js tests/e2e/activity-headers.spec.js tests/e2e/about.spec.js -g mitosis
node tools/build-about.js --check
node tools/build-seo.js --check
npm test
```

## Unit tests (`tests/unit/mitosis-lab.test.js`, Node only)

- Seed normalization, and the model run in a sandbox where the clock and `Math.random` throw: same output, no shared state.
- Over 150 seeds: 42 to 56 countable cells per field, 5 to 9 dividing (80 to 90 percent interphase), an average near
  86 percent; every phase in the three-field total, anaphase least, prophase the most common dividing phase; drawn
  progress inside each phase's range; non-countable cells near the field in interphase.
- Cell slots never overlap; cells outside the meristem are longer; root cap and elongation looks have at most one
  dividing cell and the mature zone none; the meristem look is field 1.
- Focus targets and the sharp window, keyboard neighbors in every direction (and staying put at an edge), checking a
  phase, field goals, counting the rest only when ready, tallies equal the model's counts.
- Percents to tenths, minutes from the shown percent (87.4% is 1,259 min), rounding totals within 3 minutes of 1,440,
  ties for most and least, equal minute cards, the wheel's angles, the shuffle and the tab-separated text.
- Every string in `data.js` has English and Mexican Spanish with the same placeholders and no dashes, no English key
  maps to two Spanish strings, every looked-up id exists, every listed string is used, and `FLAGS.spanishToggle` is off.

## Browser tests (`tests/e2e/mitosis-lab.spec.js`)

Every test fails on a console error or warning, a page error, a CSP violation, a request outside the site or any use
of storage, and the clipboard is a stand-in that records what was written.

- The whole lab in English at 1366 by 768: Next explains what is missing; all three wrong zones with their counts and
  messages; the meristem; cells hidden until high power and sharp; power by arrow keys and focus by the slider's keys;
  one Tab stop for cells and arrow keys that match the model; field 1 by keyboard with two wrong picks, a locked pick,
  Show me and every correct message; Count the rest; the tally table; fields 2 and 3 by mouse; the analysis table equal
  to the model; most and least with a wrong pick; a real mouse drag, a tap and a wrong placement; the wheel's text
  alternative; five questions with hints and explanations; the exact copied text; revisiting a step from the tracker.
- A phone walk-through at 360 by 640: no sideways scrolling and 44 px targets on every step (cell tiles excepted, at
  least 24 px and reported); the quick look takes focus; the eyepiece is over 330 px wide; the cell sheet keeps every
  phase and the feedback on screen, closes itself after a correct answer and returns focus to the cell.
- The laptop layout at 1366 by 768 on every step, with the eyepiece and cell panel side by side.
- axe-core (WCAG 2.0 to 2.2 A and AA plus best practices) in 9 states at 1366 and 360 px: tour, wrong zone, low power,
  cell view, analysis with wheel, question, copy, cell guide and Start over.
- Spanish: no toggle in English or Spanish while the flag is off; `?lang=es` gives `es-MX`, the Spanish title, Spanish
  feedback, a Spanish copy and no English interface words on four screens.
- Frame rate under a 4x CPU slowdown during auto focus, zooming in and out and a slider sweep (over 30 fps required,
  the measured values are recorded as annotations).
- Reduced motion: no transition on the zoom layers, no moving wheel marker or replay, no guide autoplay, and stepping
  through the guide still works.
- The tour (four tips, Got it, again from Instructions, Escape), the cell guide (five diagrams, the animation, focus
  return), Start over (cancel and confirm), lesson links with `?from=`, and embed mode.
- The copy fallback selects exactly the copied text, and the page has no typing fields.

The shared specs also cover this lab: `labs-a11y.spec.js` finds it through `lab.js` (axe in English and Spanish, the
Tab walk with visible focus, named controls, drawings with text alternatives, the Instructions dialog),
`activity-headers.spec.js`, `about.spec.js`, `seo.spec.js` and `tests/unit/static.test.js` (strict IIFEs, CSP, no HTML
injection, no storage, no inline styles, no dashes, versions). `i18n.spec.js` checks that the Spanish landing page lists
it in English with an English link while its Spanish is pending.

## Not automated

Real screen readers, Safari, Firefox, a physical Chromebook or phone, and the live site. Frame rates come from Chromium
with CPU throttling, not real hardware. The Spanish needs a proofreader before `FLAGS.spanishToggle` is turned on.
