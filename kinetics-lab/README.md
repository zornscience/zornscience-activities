# Kinetics and Collision Theory Sandbox
Version: 1.0.0

A collision theory lab for AP Chemistry (Unit 5, Kinetics). A 2D box holds reactant particles A and B that bounce off each other and the walls. When an A hits a B hard enough, they react: A + B → C + D. Students change the temperature (how fast the particles move), the concentration (how many start in the box) and the activation energy, and can add a catalyst. They watch the collisions per second, the successful collisions per second and the success rate, a live concentration vs. time graph, and two energy charts (an energy profile and the distribution of collision energies with the share above Ea shaded). Earlier runs stay on the graph for comparison, four questions check the main ideas, and a reflection prints with the lab.

## Assumptions and decisions
- Built from a one-paragraph request, not a handoff. Built on the house conventions of the Virtual Titration Simulator and the Physics Graphing Lab: plain JavaScript in strict IIFEs, classic deferred scripts, no globals (the page reaches the model through a `zsa-kn:request-model` event), every element built with `createElement`, `createElementNS` and `textContent`, the shared Content Security Policy, tokens and Inter font, embed mode, and no storage, cookies or outside requests. Nothing in `shared/` changed.
- Named "Kinetics and Collision Theory Sandbox" (with "and", like the other activity names), slug `kinetics-lab`, class prefix `zsa-kn-`.
- Not an engine activity, and no completion code: the sandbox has no round or score. A code could be added later by registering it in `shared/zsa-codes.js`.
- Built and browser-tested in Chromium by Claude. Real screen readers, Firefox, Safari and school devices remain untested. See TESTING.md.

## Purpose
Lessons that link here: AP Chemistry Unit 5 (Kinetics): collision theory, the effect of temperature and concentration on rate, activation energy and energy profiles, catalysts, the Maxwell-Boltzmann picture of why temperature matters, and reading rate from a concentration vs. time graph. A Chemistry reaction rates lesson could link here too.

## Installation and local use
From the repository root run `npm run serve` (or `python3 -m http.server 8000`) and open `http://localhost:8000/kinetics-lab/`. No build step or dependencies. Keep `shared/` beside `kinetics-lab/`.

Live URL after merging: https://activities.zornscience.org/kinetics-lab/

Embed mode (`?embed=1`) hides the back link line and the footer and sends `{type: "zsa:resize", activity: "kinetics-lab", height}` to `https://zornscience.org` when framed.

## Links and deep links
| Parameter | Effect |
|---|---|
| `?temp=450` | Temperature: 200 to 600 K in steps of 10 (default 300). |
| `?conc=1` | Concentration of A and of B: 0.10 to 1.00 M in steps of 0.05 (default 0.50). |
| `?ea=4` | Activation energy: 2.0 to 16.0 kJ/mol in steps of 0.5 (default 8.0). |
| `?catalyst=1` | Starts with the catalyst in the box. |
| `?from=<url>` | Sets "Back to the lesson". Accepted only for `https://zornscience.org/` pages (no other host, http, port or user name), as in the other activities. The default is https://zornscience.org/science/ap-chemistry/ |
| `?embed=1` | Embed mode. |

Values off a slider (out of range or between steps) are ignored. Parameters combine, for example `?temp=500&catalyst=1`.

## Lesson callouts
The lessons are WordPress pages on zornscience.org, not files in this repository, so the links below still need to be added to them.

Heading: **Practice with the Kinetics and Collision Theory Sandbox**

Text: Watch particles collide, change the temperature, the concentration and the activation energy, add a catalyst, and see why only some collisions lead to a reaction.

Button: **Open the Kinetics and Collision Theory Sandbox**

Suggested links (add `&from=` with the lesson's own URL):
- Collision theory: https://activities.zornscience.org/kinetics-lab/
- Temperature and rate: https://activities.zornscience.org/kinetics-lab/?temp=500
- Concentration and rate laws: https://activities.zornscience.org/kinetics-lab/?conc=1
- Activation energy and catalysts: https://activities.zornscience.org/kinetics-lab/?ea=12&catalyst=1

## How it works
- **The particles.** Equal disks (radius 8 in a 600 by 400 box, mass 1) move in straight lines and bounce elastically off the walls and each other, in substeps of at most 1/240 s with a grid so only neighbors are checked. Each particle of A (and of B) stands for 0.01 M, so 0.50 M is 50 A and 50 B. Speeds start from the 2D Maxwell-Boltzmann distribution with no net drift, scaled so the kinetic temperature is exactly the set temperature (the root-mean-square speed is 150 units/s at 300 K). The box is in a water bath: changing the temperature scales every speed at once, and elastic collisions keep it there.
- **Reacting.** Only a collision between an A and a B can react. Its energy is the kinetic energy along the line of centers, ½μv², with μ = m/2 and v the closing speed along the line between the centers, converted to kJ/mol. If it is at least Ea, A and B become C and D (they keep their speeds); otherwise they just bounce. A reaction is drawn as an amber burst, a bounce between A and B as a gray ring. A and C are solid disks and B and D are rings, so the kinds differ by shape as well as color.
- **Collision theory.** Collision energies along the line of centers follow an exponential distribution with mean RT (in 2D as in 3D), so the fraction of collisions with at least Ea is e^(−Ea/RT). The unit tests check that the simulated collisions follow it. Rate = (collisions per second) × e^(−Ea/RT): doubling both concentrations gives about 4 times the collisions; a higher temperature gives slightly more collisions (√T) and a much larger fraction over the barrier.
- **Scaled energies.** Ea runs from 2 to 16 kJ/mol so a box of 200 particles reacts within seconds to minutes. Real activation energies are often 50 to 100 kJ/mol, with billions of collisions per second, but the trends are the same. The note under the title says so.
- **The catalyst** offers a pathway with half the activation energy. It is not drawn as particles and is not used up. The energy profile shows the lower dashed path.
- **Readouts.** Time, [A] = [B], A-B collisions per second, successful collisions per second, the success rate and the reaction rate (M/s), all over the last 5 s.
- **The graph.** [A] = [B] and [C] = [D] against time, logged every 0.25 s, the time axis growing in 30 s steps. A change of temperature, Ea or the catalyst during a run is a dashed line with a label (changes of the same kind less than 1 s apart, such as a dragged slider, share one). New run, or a new concentration, keeps the run on the graph as a gray dashed [A] line labeled "Run n" (up to 3, oldest dropped), listed under the graph with its conditions and the time half of A was used up. A run shorter than 1 s is not kept. Clear earlier runs removes them.
- **Energy charts.** The energy profile shows A + B, the barrier Ea (and the catalyst's lower path), and C + D 10 kJ/mol lower (ΔH is shown only; the box is held at its temperature). The collision energy chart draws e^(−E/RT)/RT from 0 to 20 kJ/mol on a fixed scale, shades the share at or above Ea, and draws this run's measured collision energies as bars in 1 kJ/mol bins. A sentence gives the predicted and measured success percentages.
- **Ending.** A run ends when no A is left or at 10 minutes; Play then starts a new run. Half of A used up is announced and listed.
- **Questions.** Four multiple choice questions on temperature, concentration (rate = k[A][B]), catalysts, and why the curve levels off. Every choice has its own feedback, and each wrong answer suggests a test to run in the box.
- **Reflection, printing and data.** The reflection stays in the tab. Print lab prints a line with the run's conditions and results, the box, the graph, the energy charts, the questions and the whole reflection, without the controls. Download run data (CSV) saves `zornscience-kinetics-data.csv`: time, the four concentrations and the running counts of collisions and successful collisions.

## Decisions for the teacher to confirm
- **Default back link**: the AP Chemistry page, because the Unit 5 kinetics lesson's address was not known. Set the default in `index.html` and `DEFAULT_BACK` in `tests/e2e/kinetics-lab.spec.js` once it is, or give each lesson its own `?from=`.
- **Scaled activation energies** (see above). Change `EA` in `sim.js` to use other values.
- **The catalyst halves Ea.** Change `CATALYST` in `sim.js` for another factor.
- **Starts running** on load, except when the device asks for reduced motion.
- **No completion code** for now.

## Files
| File | What it holds |
|---|---|
| `index.html` | Page shell: conditions, the box with its readouts, the graph, the energy charts, the questions, the reflection and the live region. |
| `sim.js` | The model: runs, elastic collisions, reacting, changes during a run, the log, rates, collision theory, the questions, spoken descriptions, number formatting and the CSV. No page code. |
| `lab.js` | The page: sliders and the catalyst, the animation loop, drawing the box, the graph with earlier runs, the energy charts, the questions, printing, the download and deep links. |
| `lab.css` | Layout, colors and print styles, prefixed `zsa-kn-`. |

## Keyboard and screen readers
- Every control is a native button, range slider, radio button or text area. The sliders speak their values in words ("300 kelvin", "0.50 molar, 50 particles each of A and B"). The catalyst is a toggle with `aria-pressed`.
- The box, the graph and both energy charts are images with spoken descriptions: the particle counts and recent collision rates (updated twice a second while running), the concentrations, half-life, changes and earlier runs, the barriers, and the share of collisions over Ea.
- One polite live region announces Play and Pause (with a summary), settled slider values with the share over the barrier, the catalyst, new runs, half of A used up, the end of a run, clearing earlier runs, checked answers and the download.
- Focus moves only when Clear earlier runs hides itself (to New run).

## Layout
- 1100 px and wider: the conditions in a 280 px column, the work beside it.
- 760 px and wider: the box and the graph side by side.
- Narrower: one column. From 600 to 1099 px the conditions are in three columns.
- The graph is drawn at its real width so its labels keep their size on phones.
- No sideways scrolling from 320 px, and every button, slider and box is at least 44 px (a radio button's whole label is the target).

## Changelog
- 1.0.0: first version.
