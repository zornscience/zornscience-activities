# Circuit Builder
Version: 1.0.0

An electric circuits lab for Physics. Students drag batteries, wires, resistors, switches and bulbs onto a grid and build their own circuits, or start from series and parallel circuits. A digital multimeter probes the voltage between any two points and the current through any part, bulbs glow by the power they use, and moving dots show the current flowing. A readings table lists every part, an insight line explains what the circuit is doing (including short circuits and open loops), six questions check the main ideas, and a reflection prints with the lab.

## Assumptions and decisions
- Built from a one-paragraph request, not a handoff. Built on the house conventions of the Projectile Motion Vector Lab: plain JavaScript in strict IIFEs, classic deferred scripts, no globals (the page reaches the model through a `zsa-cb:request-model` event), every element built with `createElement`, `createElementNS` and `textContent`, the shared Content Security Policy, tokens and Inter font, embed mode, and no storage, cookies or outside requests. Nothing in `shared/` changed.
- Slug `circuit-builder`, class prefix `zsa-cb-`.
- Not an engine activity, and no completion code: the lab has no round or score.
- Built and browser-tested in Chromium by Claude. Real screen readers, Firefox, Safari, touch screens and school devices remain untested. See TESTING.md.

## Purpose
Lessons that link here: Physics, electric circuits: complete loops, Ohm's law (V = IR), power (P = VI), series and parallel circuits, why bulbs in series are dimmer and bulbs in parallel are as bright as one alone, current being the same everywhere in a series loop, voltages sharing in series, branches drawing their own current in parallel, switches and short circuits.

## Installation and local use
From the repository root run `npm run serve` (or `python3 -m http.server 8000`) and open `http://localhost:8000/circuit-builder/`. No build step or dependencies. Keep `shared/` beside `circuit-builder/`.

Live URL after merging: https://activities.zornscience.org/circuit-builder/

Embed mode (`?embed=1`) hides the back link line and the footer and sends `{type: "zsa:resize", activity: "circuit-builder", height}` to `https://zornscience.org` when framed.

## Links and deep links
| Parameter | Effect |
|---|---|
| `?circuit=series2` | Starts with a circuit: `one` (default), `series2`, `parallel2`, `series3`, `parallel3`, `sidebyside`, `mixed`, `pswitch`, `divider` or `empty`. |
| `?volts=9` | Sets every battery in the starting circuit to 1.5, 3, 4.5, 6, 9 or 12 V (default 6). |
| `?meter=current` | Starts the multimeter in current mode (default voltage). |
| `?flow=0` | Starts with the moving charge off; `?flow=1` on. Without it, the charge moves unless the device asks for reduced motion. |
| `?from=<url>` | Sets "Back to the lesson". Accepted only for `https://zornscience.org/` pages (no other host, http, port or user name), as in the other activities. The default is https://zornscience.org/science/physics/ |
| `?embed=1` | Embed mode. |

Unknown values are ignored. Parameters combine, for example `?circuit=sidebyside&meter=current`.

## Lesson callouts
The lessons are WordPress pages on zornscience.org, not files in this repository, so the links below still need to be added to them.

Heading: **Practice with the Circuit Builder**

Text: Build circuits from batteries, wires, resistors, switches and bulbs, probe them with a multimeter, and find out why bulbs in series and in parallel glow so differently.

Button: **Open the Circuit Builder**

Suggested links (add `&from=` with the lesson's own URL):
- Circuits: https://activities.zornscience.org/circuit-builder/
- Series and parallel: https://activities.zornscience.org/circuit-builder/?circuit=sidebyside
- Current in parallel branches: https://activities.zornscience.org/circuit-builder/?circuit=parallel3&meter=current
- Ohm's law and voltage sharing: https://activities.zornscience.org/circuit-builder/?circuit=divider

## How it works
- **The board** is a grid of 7 by 5 points (columns A to G, rows 1 to 5). Each of the 58 spots between two neighboring points holds one part. A part placed on a spot that already has one replaces it.
- **Building.** Drag a part from the palette onto a spot, or pick a part and tap spots. Wire and Erase paint along the spots the pointer passes. With Select and move, tap a part to select it, drag it to an empty spot to move it, or drag it off the board to remove it. Undo (up to 100 steps) and Clear board. Parts are numbered by type (Bulb 1, Battery 1, Resistor 1...) with the lowest free number, so Bulb 1 stays Bulb 1 when Bulb 2 is removed.
- **Parts.** Batteries are ideal (1.5 to 12 V, default 6 V) with a long plate and a + sign at the + end; Flip battery swaps the ends. Resistors are 5 to 100 Ω (default 10 Ω). Bulbs are 10 Ω and ohmic; 100% brightness is 3.6 W, what one bulb gets alone on a 6 V battery, and the glow grows with the power. Switches start open. Wires and closed switches have no resistance.
- **The solver** (in `model.js`) is exact: wires and closed switches merge their points into one node, and each separate circuit with a battery is solved by modified nodal analysis. A battery whose two ends are joined by wires alone is a short circuit, and batteries joined in a loop of wires cannot be solved; both are flagged in red with an explanation instead of numbers. Currents in wires come from sharing each node's current among its wires as if each had the same tiny resistance, so every wire has a reading.
- **The multimeter.** Voltage mode reads the red probe minus the black probe, so it can be negative; place probes from the selects or with Tap board. It says when the probes sit across one part, and gives a reason when there is no reading (a probe on a point no part touches, probes on separate circuits, or a short circuit). Current mode reads the current through the part chosen in the select or tapped on the board, without breaking the circuit (like a clamp meter), and draws an arrow for the direction of conventional current.
- **The selected part** shows its readings and its settings: battery voltage and Flip battery, resistance, Close or Open switch, Measure voltage across it, Measure current through it and Remove.
- **Moving charge.** Dots move along each part from + to − at a speed that grows with the current (60 px per second per ampere, from 4 to 180 px per second). One animation loop at most, only while charge flows and the tab is visible.
- **Readings** for every part except wires: where it is, its setting, voltage, current, power and brightness. The insight line under the board gives the battery current and total resistance, checks that the power used equals the power supplied, and names the brightest and dark bulbs.
- **Questions.** Six multiple choice questions: a series bulb's brightness, a parallel bulb's brightness, the current in a series loop, opening one parallel branch, voltages in series, and the battery current with a second parallel bulb. Every choice has its own feedback that suggests a test to run.
- **Reflection, printing and data.** The reflection stays in the tab. Print lab prints a line with the circuit, the insight and the meter reading, then the board, the meter, the readings, the questions and the whole reflection, without the controls. Download readings (CSV) saves `zornscience-circuit-readings.csv`: every part, wires included, with its ends, setting, voltage (From minus To), current (From to To), power and brightness.

## Decisions for the teacher to confirm
- **Default back link**: the Physics page, because the circuits lesson's address was not known. Set the default in `index.html` and `DEFAULT_BACK` in `tests/e2e/circuit-builder.spec.js` once it is, or give each lesson its own `?from=`.
- **Ideal batteries and ohmic bulbs**: a real bulb's resistance rises as it heats, and a real battery has internal resistance, so a short circuit is shown as a warning rather than a current. Both keep the numbers clean (0.300 A, 3.00 V) for the series and parallel comparisons.
- **Conventional current** for the moving dots and the current direction, not electron flow.
- **The ammeter reads a part without being wired in**, so students do not have to break the circuit to measure current. Wiring an ammeter in series is not modeled.
- **Starting circuit**: One bulb, the reference for 100% brightness.
- **No completion code** for now.

## Files
| File | What it holds |
|---|---|
| `index.html` | Page shell: the starting circuits, the parts palette, the board, the toolbar, the multimeter, the selected part, the insight, the readings table, the questions, the reflection and the live region. |
| `model.js` | The model: points and spots, parts, the solver, measuring, the starting circuits, the text, the questions and the CSV. No page code. |
| `lab.js` | The page: drawing the board and parts, the palette, dragging and tapping, the keyboard on the board, moving charge, the multimeter, the selected part, the table, undo, the questions, printing, the download and deep links. |
| `lab.css` | Layout, colors and print styles, prefixed `zsa-cb-`. |

## Keyboard and screen readers
- Every part, tool and setting is a native button, select, checkbox, radio button or text area. The palette buttons say which tool is picked (`aria-pressed`).
- The board is a group with one tab stop. Each of its 58 spots is a button named by its ends and what it holds, for example "D2 to E2: Bulb 1, 10 Ω bulb, 3.00 V, 0.300 A, 25% brightness". The arrow keys move between spots, Enter or Space places the picked part (or selects the part with Select and move, or removes it with Erase), Delete or Backspace removes a part and Escape goes back to Select and move.
- The probes are placed from selects, so the meter needs no pointer. The readings table repeats every part's numbers.
- One polite live region announces each change with the meter's new reading, warnings for short circuits, selections, starting circuits, checked answers and the download.
- Focus moves only when the part it was on goes away: Remove sends focus to the spot the part was on.
- Moving charge starts off when the device asks for reduced motion.

## Layout
- 1100 px and wider: the circuits and parts in a 280 px column, the work beside it.
- Narrower: one column, with the parts palette just above the board. From 600 to 1099 px the circuit and the parts sit side by side.
- From 760 px the multimeter sits beside the board.
- The board is drawn at its real width so its labels keep their size on phones; its spots are at least 30 px apart at 320 px.
- No sideways scrolling from 320 px (the readings table scrolls inside its own box), and every button, select, checkbox and radio label is at least 44 px.

## Changelog
- 1.0.0: first version.
