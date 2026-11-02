# Projectile Motion Vector Lab
Version: 1.1.0

A 2D dynamics lab for Physics. A cannon fires a ball from a launch height, angle and speed that students choose. The key feature is the vectors: students turn on live velocity, velocity component (vx and vy) and acceleration arrows on the ball, and can leave snapshots along the path. As the ball arcs, the vx arrow stays the same while the vy arrow shrinks, flips at the top and grows, and the acceleration arrow points down the whole time. A velocity components graph draws itself during the flight, results appear on landing, five questions check the main ideas, and a reflection prints with the lab.

## Assumptions and decisions
- Built from a one-paragraph request, not a handoff. Built on the house conventions of the Physics Graphing Lab and the Kinetics and Collision Theory Sandbox: plain JavaScript in strict IIFEs, classic deferred scripts, no globals (the page reaches the model through a `zsa-pj:request-model` event), every element built with `createElement`, `createElementNS` and `textContent`, the shared Content Security Policy, tokens and Inter font, embed mode, and no storage, cookies or outside requests. Nothing in `shared/` changed.
- Slug `projectile-lab`, class prefix `zsa-pj-`.
- Not an engine activity, and no completion code: the lab has no round or score.
- Built and browser-tested in Chromium by Claude. Real screen readers, Firefox, Safari and school devices remain untested. See TESTING.md.

## Purpose
Lessons that link here: Physics, two-dimensional motion: projectiles, independence of horizontal and vertical motion, velocity components, why the acceleration is g down the whole flight (including at the top), and launches from a height.

## Installation and local use
From the repository root run `npm run serve` (or `python3 -m http.server 8000`) and open `http://localhost:8000/projectile-lab/`. No build step or dependencies. Keep `shared/` beside `projectile-lab/`.

Live URL after merging: https://activities.zornscience.org/projectile-lab/

Embed mode (`?embed=1`) hides the back link line and the footer and sends `{type: "zsa:resize", activity: "projectile-lab", height}` to `https://zornscience.org` when framed.

## Links and deep links
| Parameter | Effect |
|---|---|
| `?scenario=ground` | Starts with a scenario: `ledge` (default), `ground`, `cliff`, `steep` or `low`. |
| `?h=20` | Launch height: 0 to 50 m in steps of 1. |
| `?angle=30` | Launch angle: 0 to 90° in steps of 1. |
| `?speed=25` | Launch speed: 2 to 30 m/s in steps of 1. |
| `?show=c,a,s` | Turns on exactly these: `v` velocity, `c` components, `a` acceleration, `s` snapshots; `none` for none. Default `v,c`. |
| `?slow=1` | Starts with slow motion on. |
| `?pausetop=1` | Starts with Pause at the top on. |
| `?from=<url>` | Sets "Back to the lesson". Accepted only for `https://zornscience.org/` pages (no other host, http, port or user name), as in the other activities. The default is https://zornscience.org/science/physics/ |
| `?embed=1` | Embed mode. |

Values off a slider (out of range or between steps) and unknown values are ignored. `h`, `angle` and `speed` change the scenario's values (and show Custom settings when they differ). Parameters combine, for example `?scenario=cliff&show=c,a,s&pausetop=1`.

## Lesson callouts
The lessons are WordPress pages on zornscience.org, not files in this repository, so the links below still need to be added to them.

Heading: **Practice with the Projectile Motion Vector Lab**

Text: Fire a cannon, turn on the velocity and acceleration vectors, and watch which part of the velocity changes during the flight.

Button: **Open the Projectile Motion Vector Lab**

Suggested links (add `&from=` with the lesson's own URL):
- Projectile motion: https://activities.zornscience.org/projectile-lab/
- Horizontal launches: https://activities.zornscience.org/projectile-lab/?scenario=cliff&show=c,a,s
- Velocity at the top of the path: https://activities.zornscience.org/projectile-lab/?scenario=ground&show=v,c,a&pausetop=1

## How it works
- **The model.** No air resistance and g = 9.80 m/s² down. vx = v₀ cos θ never changes; vy = v₀ sin θ − gt; x = vx·t; y = h₀ + v₀ sin θ · t − ½gt². The ball starts at the cannon's pivot, so the launch height is the height of the launch point. The flight ends when y = 0. Launched along the ground (0 m at 0°) there is no flight: Launch is disabled and the page says why.
- **The scene** is drawn at its own width with one scale across and up, so every arrow points the true way. It fits the whole flight with all its arrows and labels, crops unused sky and centers the flight. Distance ticks run along the ground from the launch point; the ledge is labeled with h₀; a dashed line marks the highest point once the ball passes it, and a dotted path shows where the ball has been.
- **The vectors.** Velocity (navy), vx (teal) and vy (purple) share one scale in a launch: the fastest moment, the landing, gets the longest arrow, and the note under the scene gives that speed. The acceleration arrow (orange) is a fixed length on its own scale, because it never changes. Snapshots, every 0.1 to 1 s (at most 12 and the landing), leave faded balls with the arrows that are on, so even spacing across shows vx constant and the growing gaps down show vy changing.
- **Playback.** Launch, Pause, Resume and Launch again run the flight in real time (at most 0.1 s per frame). Slow motion runs at a quarter speed. Pause at the top stops exactly where vy = 0. The Time slider moves through the flight in 0.05 s steps.
- **Readouts** show time, x, y, speed, vx, vy (with right, left, up or down), the acceleration (9.80 m/s² down) and the direction of motion in degrees above or below horizontal. A line under them explains what the vectors are doing now: ready, rising, at the top, falling or landed.
- **The graph** draws vx and vy against time as the flight goes, with a dashed line at the landing time.
- **Results** (time in the air, highest point, range and landing velocity) stay hidden as "?" until the ball lands, so students can predict first.
- **Questions.** Five multiple choice questions: velocity at the top, acceleration at the top, what vx does, how vy changes each second, and vy at landing for a ground to ground launch. Every choice has its own feedback that suggests a test to run with the vectors.
- **Reflection, printing and data.** The reflection stays in the tab. Print lab prints a line with the launch settings and results, the scene, the graph, the results, the questions and the whole reflection, without the controls. Download flight data (CSV) saves `zornscience-projectile-data.csv`: time, x, y, vx, vy, speed, ax and ay every 0.05 s and at landing.

## Decisions for the teacher to confirm
- **Default back link**: the Physics page, because the projectile lesson's address was not known. Set the default in `index.html` and `DEFAULT_BACK` in `tests/e2e/projectile-lab.spec.js` once it is, or give each lesson its own `?from=`.
- **Default arrows**: velocity and components on, acceleration and snapshots off, so the first launch already shows vx and vy and the acceleration is something to turn on. Change the `checked` attributes in `index.html` (and `shown` in `lab.js`) or use `?show=`.
- **g = 9.80 m/s²** and no air resistance.
- **No completion code** for now.

## Files
| File | What it holds |
|---|---|
| `index.html` | Page shell: settings, the vector toggles, the scene, playback, readouts, the graph, results, the questions, the reflection and the live region. |
| `model.js` | The model: the motion, the top and landing, scenarios, snapshot times, fitting the scene, phases, spoken descriptions, the questions and the CSV. No page code. |
| `lab.js` | The page: settings and sliders, drawing the scene and arrows, the animation loop, the graph, results, the questions, printing, the download and deep links. |
| `lab.css` | Layout, colors and print styles, prefixed `zsa-pj-`. |
| `data.js` | Every English sentence template with its Mexican Spanish translation, for `../shared/zsa-i18n.js`. |

## Keyboard and screen readers
- Every control is a native button, select, range slider, checkbox, radio button or text area. The sliders speak their values in words ("15 meters", "50 degrees above horizontal", "18.0 meters per second"), and the Time slider adds "top of the path" or "landed".
- The scene and the graph are images with spoken descriptions: the setup, where the ball is, its speed and direction, and the values of the arrows that are on; the graph's lines and where vy crosses zero.
- One polite live region announces launches, the top of the path (and pausing there), the landing, Reset, scenario changes, checked answers and the download.
- Focus never moves on its own.

## Layout
- 1100 px and wider: the settings in a 280 px column, the work beside it.
- Narrower: one column. From 600 to 1099 px the settings are in three columns.
- The scene is drawn at its real width so its labels keep their size on phones.
- No sideways scrolling from 320 px, and every button, slider, select, checkbox and radio label is at least 44 px.

## Changelog
- 1.1.0: Mexican Spanish with `?lang=es` and the shared EN / ES header links. Every sentence is one full template in `data.js`.
- 1.0.0: first version.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, scenario names and descriptions, readouts, the insight line, the scene and graph labels and spoken descriptions, flight results, the questions and their feedback, live announcements, the print line, the CSV header row and the download announcement use the activity's `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. Sentences that contain v<sub>x</sub> or v<sub>y</sub> are rebuilt from one template in Spanish, so they are never pieced together. The Spanish title is "Laboratorio de vectores del movimiento de proyectiles". Speed is "rapidez" and velocity is "velocidad", always kept separate; the ball is "el proyectil", a ledge is "cornisa" and the highest point is "el punto más alto". The noscript message is bilingual, since it shows before any script runs. Symbols, numbers, units and decimal points stay unchanged, and the CSV file name stays `zornscience-projectile-data.csv`. The toggle reloads the page, so a flight in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the supplied glossary.
