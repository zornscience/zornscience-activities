# Physics Graphing Lab
Version: 1.0.1

A lab for one-dimensional motion with constant acceleration. A cart moves along a labeled track for 10 seconds while its position, velocity and acceleration graphs grow together. Students explore the model, or sketch their own predictions first and then reveal and compare. The page ends with an explanation prompt that prints with the graphs.

## Assumptions and departures
- Ported from the Physics Graphing Lab handoff (a standalone HTML, CSS and ES module build). The scientific model, the slider ranges, the six scenarios, the linked graphs and animated cart, predictions by sketch or keyboard, the comparison feedback, the insight text, the reflection, printing and CSV export are kept. The page was rebuilt on the house conventions: plain JavaScript in strict IIFEs, classic deferred scripts, no globals, every element built with `createElement`, `createElementNS` and `textContent` (no `innerHTML`), the shared Content Security Policy, the shared tokens and Inter font from `shared/zsa-base.css` (the handoff's Google Fonts, own colors and "Zs" header are gone), embed mode, and no storage, cookies or outside requests. The private ChatGPT review URL is not used anywhere. Nothing in `shared/` changed.
- Not an engine activity, and no completion code: the lab has no round or score. A code could be added later by registering the activity in `shared/zsa-codes.js`.
- Changes from the handoff, all found in review or browser testing:
  - **One animation loop.** In the handoff, each press of Run motion asked for a new frame without checking for one already pending, so pressing Run motion and Pause several times between two frames left several loops running together (7 after 12 quick presses, measured in Chromium). They shared one timestamp, so the cart kept real time, but every loop redrew the track and all three graphs on every frame. The pending frame is now tracked: Pause, Reset, the scrubber and every setting change cancel it, and Play only asks for a frame when none is pending. A frame advances at most 0.1 s, so a stalled or hidden tab does not jump ahead. The browser tests check that 12 quick presses leave one callback per frame, and with a fake clock that one second moves the cart one second.
  - **Predictions off the scale.** In the handoff a typed value outside the graph's range was drawn outside the plot, over the labels or out of sight. Now a typed value outside the scale stretches it (to nice ticks) and a note says so; a value beyond twice the largest the sliders can reach (240 m, 30 m/s, 2 m/s²) is drawn at the edge with an arrowhead and listed in a note ("Off the scale: 500 m/s at 6 s. Shown at the edge."). Drawing on a graph never stretches it. The model line stays inside the plot either way, and the feedback still measures error against the model's own span, as in the handoff.
  - **Axes.** Ticks are rounded (1, 2 or 5 times a power of ten, always including 0) instead of four equal steps with values like 3.7.
  - **The track on phones.** The handoff drew the track at a fixed 900 units, so its labels were under 4 px tall on a 390 px phone. The track is now drawn at its real width (labeling every other tick when they would crowd) and redrawn when the width changes.
  - **Touch scrolling.** The handoff set `touch-action: none` on every graph, so a phone could not scroll the page by dragging over a graph even in Explore. It is set only while a prediction can be drawn.
  - **Sketch and typed points.** Typing a value replaces a drawn point within 0.12 s of that time, and a drawn stroke that crosses a typed value empties its box, so the graph and the boxes always agree. Dragging past the edge of the plot clamps to the edge instead of stopping the stroke.
  - **Custom settings.** Moving a slider selects a new "Custom settings" choice in the scenario list, so choosing the previous scenario again restores it. In the handoff the list still showed the old scenario and choosing it did nothing.
  - **Printing a long reflection.** A text area prints only the lines in view, so a long reflection was cut off. Printing now shows the full text in a print-only copy, plus a line with the scenario, settings and mode.
  - **Accessibility.** Mode buttons use `aria-pressed`. Each graph's spoken name describes its scale and the model (values at 0, 5 and 10 s, the turning point and the shape), or says the model is hidden, and counts the prediction's points. The track's name says where the cart is and how it moves. Sliders and the scrubber have spoken values with units. Keyboard prediction boxes are grouped by graph and named ("Predicted velocity at 6 s, in m/s"). Reveal and compare moves focus to the feedback. One polite live region announces scenario and mode changes, the end of a run, the reveal, clearing and the download.
  - **Text.** Buttons say Run motion, Pause, Replay and Reset rather than using ▶, Ⅱ and ↻ symbols that Inter does not have. Numbers use a minus sign (−) on screen and never show −0.00; the CSV keeps plain hyphens for spreadsheets.
- Built and browser-tested in Chromium by Claude. Real screen readers, Firefox, Safari and school devices remain untested. See TESTING.md.

## Purpose
Lessons that link here: Physics Unit 1 (Linear Motion): Position-Time Graphs, Velocity-Time Graphs, Acceleration and Kinematic Equations. The Quantitative Skills lesson Slope and Rate of Change could link here too.

## Installation and local use
From the repository root run `npm run serve` (or `python3 -m http.server 8000`) and open `http://localhost:8000/physics-graphing-lab/`. No build step or dependencies. Keep `shared/` beside `physics-graphing-lab/`.

Live URL after merging: https://activities.zornscience.org/physics-graphing-lab/

Embed mode (`?embed=1`) hides the back link line and the footer and sends `{type: "zsa:resize", activity: "physics-graphing-lab", height}` to `https://zornscience.org` when framed.

## Links and deep links
| Parameter | Effect |
|---|---|
| `?scenario=turn` | Starting scenario: `cruise` (the default), `speed`, `stop`, `turn`, `left` or `rest`. |
| `?mode=predict` | Opens in Predict and compare. |
| `?from=<url>` | Sets "Back to the lesson". Accepted only for `https://zornscience.org/` pages (no other host, http, port or user name), as in the other activities. The default is https://zornscience.org/science/physics/unit-1-linear-motion/velocity-time-graphs/ |
| `?embed=1` | Embed mode. |

Unknown values are ignored. Parameters combine, for example `?scenario=turn&mode=predict&from=...`.

## Lesson callouts
The lessons are WordPress pages on zornscience.org, not files in this repository, so the links below still need to be added to them.

Heading: **Practice with the Physics Graphing Lab**

Text: Predict the position, velocity and acceleration graphs for a moving cart, then run it and compare your prediction with the model.

Button: **Open the Physics Graphing Lab**

Suggested links (add `&from=` with the lesson's own URL):
- Position-Time Graphs: https://activities.zornscience.org/physics-graphing-lab/?scenario=cruise&mode=predict
- Velocity-Time Graphs: https://activities.zornscience.org/physics-graphing-lab/?scenario=turn&mode=predict
- Acceleration: https://activities.zornscience.org/physics-graphing-lab/?scenario=stop
- Kinematic Equations: https://activities.zornscience.org/physics-graphing-lab/?scenario=speed

## How it works
- **The model.** x = x₀ + v₀t + ½at², v = v₀ + at, a constant, from 0 to 10 s. Right is positive. The cart is a point object on a straight track; friction is not modeled.
- **Settings.** Initial position −20 to 20 m (steps of 1), initial velocity −5 to 5 m/s (steps of 0.5), acceleration −1 to 1 m/s² (steps of 0.1). Any change stops the run, returns to 0 s and clears predictions.
- **Scenarios.**

| Scenario | x₀ (m) | v₀ (m/s) | a (m/s²) | What happens |
|---|---|---|---|---|
| Cruise to the right | 0 | 2 | 0 | Steady velocity to the right |
| Speed up to the right | 0 | 0 | 0.6 | Starts at rest, 30 m at 10 s |
| Slow to a stop | −10 | 4 | −0.4 | At rest exactly at 10 s, 10 m |
| Turn around | 0 | 3 | −0.6 | Reverses at 5 s at 7.5 m, back at 0 m at 10 s |
| Speed up to the left | 10 | −1 | −0.5 | Moving left faster, −25 m at 10 s |
| Stay at rest | 5 | 0 | 0 | Stays at 5 m |

- **Track and readouts.** The track's scale fits this experiment's positions; the origin is marked and an arrow shows the direction of motion. Readouts show time, position, velocity and acceleration to two decimals.
- **Playback.** Run motion plays the 10 s in real time; Pause, Replay at the end, Reset to 0 s, and a Time slider (steps of 0.1 s with the arrow keys) that pauses the run.
- **Graphs.** Position, velocity and acceleration against the same time axis, each with a dashed cursor and dot at the current time. Vertical scales come from the model's values at 0 s, 10 s and any turning point, with 0 included and 16% padding (as in the handoff), rounded out to nice ticks.
- **Predict and compare.** The model lines are hidden. Students drag across each graph (mouse, pen or touch) or type values at 0, 2, 4, 6, 8 and 10 s. Reveal and compare shows the model and, for each graph, one of: closely follows the model, approaching the model, or compare the starting value, sign and curvature; plus a note when the prediction covers less than 8 s, or a request to sketch next time when a graph has fewer than two points. The comparison is the root mean square difference at the predicted times as a fraction of the graph's span (under 0.08 close, under 0.2 approaching), unchanged from the handoff. It is a rough guide, not a grade. Clear predictions hides the model again. The cart can run before the reveal.
- **Insight.** A short explanation of the graphs for the current settings (hidden in Predict until the reveal), including the reversal time when there is one.
- **Reflection.** A text box that stays in the tab only. A reload clears it.
- **Print lab.** Prints the title, a line with the scenario, settings and mode, the track and readouts, the three graphs side by side, the feedback, the insight and the whole reflection. Controls are not printed.
- **Download motion data (CSV).** `zornscience-motion-data.csv`: time, position, velocity and acceleration every 0.1 s (101 rows), four decimals, plain minus signs.

## Decisions for the teacher to confirm
- **Default back link**: the Velocity-Time Graphs lesson, where position, velocity and acceleration graphs meet. Lessons can set their own with `?from=`.
- **Scales in Predict mode** come from the model, as in the handoff, so the axis numbers hint at the answer (for example, a velocity axis that goes below zero). Fixed axes from the slider ranges would hide that but make most graphs very flat. Kept as the handoff had it.
- **Changing a setting clears predictions**, as in the handoff.
- **No completion code** for now.

## Files
| File | What it holds |
|---|---|
| `index.html` | Page shell: mode bar, settings, track and playback, prediction bar, graphs, keyboard predictions, reflection and the live region. |
| `physics.js` | The model, scenarios, slider ranges, graph scales, the comparison, insight text, spoken descriptions, number formatting and the CSV. No page code. |
| `lab.js` | The page: drawing the track and graphs, playback, predictions, reveal, printing, the download and deep links. |
| `lab.css` | Layout, graph colors and print styles, prefixed `zsa-pg-`. |

## Keyboard and screen readers
- Every control is a native button, select, range, number box, text area or details summary. The graphs are images with full spoken descriptions; drawing on them is pointer only, and the keyboard boxes give the same predictions.
- Colors: position blue, velocity teal, acceleration purple, predictions amber and dashed with open circles at typed points, so a prediction is never shown by color alone.
- Focus never moves on its own except to the feedback after Reveal and compare.

## Layout
- 1100 px and wider: settings in a 280 px column, the work beside them.
- Narrower: one column, settings first (in two columns from 600 px), then the track, graphs and reflection.
- The graphs sit three across wherever each can be 250 px wide, otherwise they wrap.
- No sideways scrolling from 320 px, and every button, select, slider, box and summary is at least 44 px.

## Changelog
- 1.0.0: first version in the repository, ported from the handoff build with the changes above.
