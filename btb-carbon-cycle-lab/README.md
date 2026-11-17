# BTB Carbon Cycle Lab

Version: 1.0.0

Grade 9 Biology virtual lab. It turns the paper "BTB Carbon Cycle Lab" (spinach and bromothymol blue in light, foil
and no-spinach tubes) into a five step investigation: prepare green BTB by blowing through a straw, set up three
tubes, predict the color of each after 24 hours, watch a 24 hour time-lapse, and answer four checking questions.
English and Mexican Spanish (`?lang=es`). No completion code. Plain HTML, CSS and strict-IIFE JavaScript, no build
step, no runtime dependencies, no network calls, no storage, no cookies, no outside fonts or images (every drawing is
SVG made in the page). Licensed CC BY-NC-SA 4.0.

## Learning goals

- Spinach respires in the light and in the dark, and respiration adds CO2 to the water.
- In the light, photosynthesis also uses CO2. Whichever process is stronger sets the direction of change.
- BTB is an indicator of acidity. CO2 changes the acidity, so BTB color shows CO2 change. BTB does not measure oxygen.
- A control tube (no spinach) shows that the spinach caused the change.
- A green start lets the color move either way. A yellow or blue start hides part of the result.

## Files

- `index.html`: page, header and instructions.
- `model.js`: the pure chemistry model (also `require`d by the unit tests, and handed to the page through the `btb-model` event on the root).
- `data.js`: English title and the Mexican Spanish dictionary.
- `lab.js`: scene, steps, controls, results table and checking questions.
- `lab.css`, `share.js`, `TEACHER_NOTES.md`, `TESTING.md`.

## The model

A 10 mL tube at 25 C holds 25 micromolar bromothymol blue (pKa 7.10) and 250 micromolar net strong base. The state of
each tube is its total dissolved inorganic carbon (DIC). The page finds pH from the carbonate charge balance (50
bisection steps between pH 3.5 and 11.0), reads CO2 from the carbonic acid fraction, and steps DIC every 0.1 hour for
24 hours.

- Respiration adds 0.025 mM DIC per hour for a tube with two spinach strips, light or dark.
- In the light, photosynthesis removes DIC at a rate that saturates with CO2. The model includes an internal pool of
  CO2 recycled from respiration (18 micromolar), which is why a lit tube settles near pH 8.7 instead of running away.
- An open tube exchanges CO2 with air (about 420 ppm).
- Each tube gets a small seeded rate spread (plus or minus 5 percent). `?seed=NUMBER` makes a run repeatable.

The carbonate constants are standard. **The biology rates are fitted, not measured.** They were fitted so a green
start (pH 6.90) matches the reference table below. Calibrate against a real run if you need real timing (see
TEACHER_NOTES.md).

| Hour | 1 | 2 | 4 | 8 | 12 | 18 | 24 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Light, spinach (pH) | 6.98 | 7.08 | 7.30 | 7.85 | 8.31 | 8.62 | 8.76 |
| Foil, spinach (pH) | 6.78 | 6.68 | 6.53 | 6.33 | 6.19 | 6.04 | 5.93 |
| No spinach (pH) | 6.90 | 6.90 | 6.90 | 6.90 | 6.90 | 6.90 | 6.90 |

## What students see

- Color is never the only cue. Each tube has a color name, a relative CO2 meter (low, medium, high) and an optional
  pattern aid that overlays a different texture on each color class. pH numbers are never shown, because BTB cannot
  read them.
- The colors come from a hand tuned palette (yellow, yellow-green, green, blue-green, royal blue) set with SVG
  attributes, never inline styles.
- Setup mistakes are allowed: no control, no dark tube, no light tube, an open tube, or a yellow or blue start. The page
  names the problem and lets students revise before they lock predictions. After the 24 hours start, setup and
  predictions are locked.

## House rules

Same as the other activities: one fixed Content-Security-Policy, no `innerHTML`, no inline scripts or styles, no
globals, no storage, 44 by 44 px targets, visible focus, and no en or em dashes. `?embed=1` and `?from=` are handled by
the shared files. Spanish comes from `data.js` through `shared/zsa-i18n.js`.

## Not included on purpose

The hypothesis, variables table, discussion questions and CER conclusion stay on the paper worksheet, as in the Leaf
Disk Lab, because the repository does not allow student text to be stored or sent. There is no autosave for the same
reason. Points, badges, timers and leaderboards are not used.
