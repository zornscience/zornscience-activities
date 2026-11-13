# Validation

Version: 1.0.0

Run `npm ci`, `npm run test:unit` and the Playwright specs below. No build step. After any change to registrations,
run `node tools/build-seo.js` and `node tools/build-about.js`; both `--check` modes must pass.

## Unit tests (`tests/unit/yeast-fermentation-lab.test.js`, 13 tests)

The model and the strings load directly in Node.

- Seeds: finite numbers become unsigned 32-bit integers; anything else is rejected.
- Purity: the model runs in a sandbox whose `Math.random` and `Date` throw, and gives identical sessions, trials and
  drafts.
- Substrates: glucose > table sugar (which lags 2 minutes) > starch > no sugar, and sweetener equals no sugar. With
  living variation and tape noise, the expected order holds on at least 980 of 1,000 seeded visits (993 when written).
  Glucose always grows at least 8 times as much as sweetener.
- Temperature and yeast: peak near 37 °C, 50 °C below 0.1, 20 °C slowed but not stopped; yeast scales linearly.
- Saturation: over 300 seeds the plateau sits between 9 and 11 g, gas never falls as glucose rises, 10 to 20 g adds
  less than a quarter of the 0 to 10 g rise, and the 2 to 5 g climb is far steeper per gram than 10 to 20 g.
- Time: gas starts at 0, rises at every step and stops at 30 minutes.
- Noise: readings within 0.45 cm of the truth, rounded to 0.1 cm, change equals end minus start, the same seed
  repeats exactly, and repeated trials differ by under 2 cm.
- Balloon: sphere volume and circumference, about 10.6 cm when limp, monotonic, and the inverse round-trips.
- Fair test checker: the standard setup is fair. On 500 seeded drafts there are exactly two issues, in different
  bottles and fields, each naming the wrong value and the standard one, and fixing them makes the test fair. No clear
  majority flags the whole field with its values. Empty food bottles are flagged. Equal cool or hot water is fair, with
  a kind tip.
- Plateau rule: on 1,000 noisy three-trial visits the averages level off at 10 g (at least 990 required; 1,000 when
  written). Markers at 8, 10, 12 and 15 g are right, 4 and 7 g are early, 16 and 20 g are late, and a flat line is
  "flat".
- Averages, snapping to 0.5 cm and the ±0.5 cm plot match.
- Copy text in English and Spanish: title, predictions with "(not answered)", both tables with headers, blank cells
  for missing data, the plateau line and three numbered starters, 19 tab-separated lines, no dashes.
- Strings: `spanishReady` is false; English and Spanish have the same keys and placeholders, nothing empty and no en
  or em dash; every key used by `lab.js`, `share.js` and `index.html` exists; five questions with four options and an
  explanation each, with the right answer in different positions; the page's static English equals `data.js`.

## Browser tests (`tests/e2e/yeast-fermentation-lab.spec.js`, 10 tests)

Every test fails on any console error or warning, page error or CSP violation.

1. The whole lab with `?seed=42`: the hook, the prediction, the partner's two seeded mistakes named exactly in the
   checker, the run blocked until both are fixed with Fix bottle and the steppers, the setup locking, every start and
   end reading and change equal to the model, predictions locking once the yeast start, the bar graph plotted from
   the keyboard, three Part B trials with every trial value and average equal to the model, the line graph, an early
   marker with its kind feedback then a right one, fermentation (2 ATP, 2 CO₂, 2 ethanol) and the revealed prediction,
   respiration (34 ATP, 6 water), sweetener, a wrong check answer marked tried with its explanation, all five right
   answers, and the clipboard text equal to `model.copyText` for this visit. axe-core (WCAG 2.0 to 2.2 A and AA plus
   best practices) passes on the fair test checker, both finished graphs, the zoom after respiration, check feedback
   and the copy screen at 1366 and 360 px.
2. At 360x640 and 1366x768, on all six steps: no sideways scrolling, every button, link, label and summary at least
   44 by 44 px, at most one coral button, and the guide bar on screen.
3. `?lang=es` stays English with no language toggle; `?lang=es&preview=1` shows the Spanish title, Instructions,
   guide text and the `/es/` back link.
4. The tour shows without taking focus, steps through three tips, ends on the guide button, and Skip removes it.
5. With motion, the fast-forward runs for over 2.5 seconds with a live clock; with reduced motion it finishes at once
   with the same readings.
6. The balloon fast-forward runs above 30 fps under a 4x CPU slowdown.
7. Reset Part A clears the prediction and checker, and Undo restores them; the reset button is hidden until there is
   work.
8. With the clipboard blocked, Copy my data selects the preview and says how to copy it.
9. The back link accepts only HTTPS zornscience.org pages through `?from=`; Share gives a clean link and Escape
   returns focus; embed mode hides the chrome and the tour.
10. The landing page lists the lab, and in Spanish marks it "(en inglés)".

The shared specs also cover this lab automatically: `labs-a11y.spec.js` (axe at 1366x900 and 390x664, the Tab walk
with a visible focus change at every stop, sliders and their keys, the Instructions dialog, in English and with
`?lang=es`), `activity-headers.spec.js`, `about.spec.js`, `seo.spec.js`, the landing page test in `i18n.spec.js`, and
`static.test.js`, `seo.test.js` and `focus-css.test.js` in the unit suite.

## Contrast (WCAG AA)

| Text | Background | Ratio |
| --- | --- | --- |
| ink #1F2D30 | cream #FBF3E2 / surface #FFFCF5 | 12.9 / 13.9 |
| muted #4B5A5C | cream / surface | 6.5 / 7.0 |
| teal #0D5C63 | cream / surface / teal tint #D7ECE9 | 7.0 / 7.5 / 6.3 |
| white | coral #C4432B (call to action) | 5.0 |
| white | teal | 7.7 |
| ink | yellow #F6C445 / yellow tint #FCEBB5 / coral tint #F9D9CF | 8.7 / 12.0 / 10.7 |
| yellow (ATP count) | ink | 8.7 |

## Results for 1.0.0

Run in this container with Node 22, Playwright 1.56.1 and the preinstalled Chromium (Chrome for Testing 153) through
a temporary config that sets `executablePath`; the committed Playwright config is unchanged.

- `npm run test:unit`: 601 tests, 601 passed, 0 failed (including the 13 above).
- `tests/e2e/yeast-fermentation-lab.spec.js`: 10 passed.
- `labs-a11y.spec.js`, `activity-headers.spec.js` and `about.spec.js` filtered to this lab and the registry check:
  all passed.
- Full browser suite: see the commit message of the 1.0.0 commit for the run.
- Frame timing during the fast-forward and the cell animation at 1366x768, by DevTools CPU throttling: 60 fps at 1x
  and 4x, 57 fps at 6x (95th percentile frame 33 ms). This is an emulation in a fast container, not a real Chromebook.

Manual review: walk the lab on a real Chromebook and a phone, by touch and by keyboard only, with a screen reader on
the graphs and the cell, and have the Spanish proofread before turning it on.
