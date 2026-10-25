# Gas Laws and KMT Lab
Version: 1.0.1

A particle simulation of a gas in a container with a movable piston, linked to a live pressure gauge, readouts, graphs of the gas laws, Maxwell-Boltzmann speed distributions, gas mixtures and a real gas mode. An Investigations tab adds guided predict, test and explain tasks with a completion code.

## Assumptions and departures
- Built on the house conventions: plain JavaScript in strict IIFEs, classic deferred scripts, no globals, the shared Content Security Policy (no inline scripts, styles or style attributes; the canvas and SVG are drawn by script), shared tokens and Inter, embed mode, no storage, cookies, analytics or outside requests. The only file changed in `shared/` is `zsa-codes.js` (to register the activity).
- The lab is not an engine activity. The Investigations tab uses the shared engine (`shared/zsa-engine.js`, `shared/zsa-activity.css`). The engine always draws a periodic table, which this activity does not need, so it draws into a hidden holder (`#zsa-gl-table`).
- Scripts: `physics.js` is the model (constants, gas law, van der Waals, Maxwell-Boltzmann, the simulation) and has no page text; `data.js` holds every string the scripts show; `lab.js` runs the container, controls, readouts, tabs and deep links; `charts.js` draws the Graphs and Speeds tabs; `investigations.js` is the engine activity. They talk through one-use-style events on the root (`zsa:request-data`, `zsa-gl:request-physics`, `zsa-gl:request-lab`), never through globals.
- When pressure is held, the piston is placed where the ideal gas law puts it (V = nRT/P) and the gauge then confirms the pressure; the piston itself is not simulated as a moving mass.
- Built and browser-tested in Chromium by Claude. Real screen readers, Firefox, Safari and school devices remain untested. See TESTING.md.

## Purpose
Lessons that link here: AP Chemistry 3.4 Ideal Gas Law, 3.5 Kinetic Molecular Theory, 3.6 Deviation from Ideal Gas Law. Students see that pressure comes from particles hitting the walls, that kelvin temperature measures average kinetic energy, that lighter particles move faster at the same temperature, how the gas laws follow, how partial pressures add, and when and why real gases depart from ideal behavior.

## Installation and local use
From the repository root run `npm run serve` (or `python3 -m http.server 8000`) and open `http://localhost:8000/gas-lab/`. No build step or dependencies. Keep `shared/` beside `gas-lab/`.

Live URL after merging: https://activities.zornscience.org/gas-lab/

Embed mode (`?embed=1`) hides the back link line and the footer and sends `{type: "zsa:resize", activity: "gas-lab", height}` to `https://zornscience.org` when framed.

## Links and deep links
| Parameter | Effect |
|---|---|
| `?gas=He` | Starts with that gas: He, Ne, Ar, Kr, Xe, N2, O2 or CO2 (any case). |
| `?mode=real` | Real gas mode (CO₂ at 1.00 L unless `gas` is given). |
| `?mix=1` | Mixture of three gases (He, Ar, Kr; `gas` sets the first). |
| `?graph=pv` | Opens Graphs on P vs V; also `p1v`, `vt`, `pt`, `vn`, and `z` (PV/nRT vs P). |
| `?mb=1` | Opens the Speeds tab. |
| `?tab=investigate` | Opens the Investigations tab; `&task=boyle` (or any task id) starts that investigation. |
| `?from=<url>` | Sets "Back to the lesson". Accepted only for `https://zornscience.org/` pages (no other host, http, port or user name), as in the Periodic Table. The default is https://zornscience.org/science/ap-chemistry/unit-3-properties-of-substances-and-mixtures/ |
| `?embed=1` | Embed mode. |

Parameters combine, for example `?mode=real&graph=z&from=...&embed=1`. Nothing moves focus on load.

## Lesson callouts
Heading: **Explore gas behavior**

Text: Move the piston, heat the gas and add particles, and watch how pressure, volume and temperature respond.

Button: **Open the Gas Laws and KMT Lab**

Suggested deep links (add `&from=` with the lesson's own URL):
- 3.4 Ideal Gas Law: https://activities.zornscience.org/gas-lab/?graph=pv (mixtures and partial pressures: https://activities.zornscience.org/gas-lab/?mix=1)
- 3.5 Kinetic Molecular Theory: https://activities.zornscience.org/gas-lab/?mb=1&gas=He
- 3.6 Deviation from Ideal Gas Law: https://activities.zornscience.org/gas-lab/?mode=real&graph=z

## The model
- **Units.** Temperature is in kelvins for every calculation, with °C beside it. Pressure in atm and kPa, volume in L, moles in mol. R = 0.08206 L·atm/(mol·K) for the gas law and 8.314 J/(mol·K) for speeds and energy.
- **Ideal mode.** Point particles with no particle-particle collisions. Each speed is drawn from the 3D Maxwell-Boltzmann distribution for the gas and temperature (real molar masses): each velocity component is normal with variance RT/M, so directions are random. With a few hundred dots a random draw has an average kinetic energy a few percent from (3/2)RT, so each component of each gas is then scaled to make its mean square exactly RT/M; the speeds keep the Maxwell-Boltzmann shape (tested). Walls are elastic, so speeds stay the same. A temperature change scales every speed by √(T₂/T₁); a new gas scales them by √(M₁/M₂).
- **Dots.** Each dot stands for 1/200 mol (about 3.0 × 10²¹ molecules); the page says so. 0.10 to 2.00 mol gives 20 to 400 dots, and a three-gas mixture up to 1,200.
- **Animation speed.** Dots move on screen in proportion to their real speed, about 8,000 times slower than real molecules in a 10 L box (12,000 in real gas mode, which is drawn at 4 times the scale). Speeds are shown in real m/s. The page says this.
- **Pressure gauge.** Measured from momentum given to the walls (2m·|v| per hit, m the mass one dot stands for), averaged over the time since the last change (at most 10 s). The container is drawn in 2D with each particle's 3D velocity; force per length of wall divided by the 2D area gives N·m·⟨vₓ²⟩/A, so P = (impulse per time per perimeter) × A/(SCALE·V). That calibration constant is the same for every state in a mode because the drawn area is proportional to the volume. The ideal gas law value is shown beside it.
- **Hold constant.** Temperature (V and n change, P responds), Volume (T and n change, P responds) or Pressure (T and n change, the piston moves). The held variable's controls are locked. If the piston would leave the container, the change stops where it reaches the end and a note says so.
- **Graphs.** Record point measures the current state by running the same simulation without drawing it until the walls have taken about 4,000 hits. Run sweep measures 10 states (see `sweepStates` in `physics.js`: V across its range; T from 100 to 1000 K at a pressure chosen so V runs from 1 to 10 L; T at constant V; n from 0.20 to 2.00 mol). Fits: P = k/V, straight lines with R², and for V vs T and P vs T the line extended (dashed) to where it reaches zero, with absolute zero marked. A °C axis option, a data table and Copy data (tab-separated, plain minus signs) for Google Sheets.
- **Speeds.** A histogram of the dots' speeds over the 3D Maxwell-Boltzmann curve scaled to the number of dots, with a second temperature or a second gas as a dashed curve, presets for 300 K vs 600 K, He vs Ar and Ne vs Kr, labels at each peak, and a table of most probable, average and root mean square speeds.
- **Mixtures.** Up to three gases, each with its own moles; circles, squares and triangles as well as colors. A table shows moles, mole fraction and partial pressure (n_iRT/V) and that the partial pressures add up to the total. Real gas mode uses one gas at a time.
- **Real gas mode.** The pressure and PV/nRT come from the van der Waals equation, P = nRT/(V − nb) − an²/V², and the page says the numbers come from the model. Volume range 0.25 to 2.50 L for pressures up to several hundred atm. PV/nRT is split into its two parts, the particle volume term Vm/(Vm − b) and the attraction term a/(RT·Vm). Below the critical temperature 8a/(27Rb), inside the model's liquid-vapor coexistence curve (Maxwell's equal-area rule), part of the gas condenses: the pressure stays at the model's vapor pressure and that share of the dots gathers as liquid on the floor. The model does not include freezing, and the page says so. The animation illustrates the two causes: dots are disks whose total area is the share n·b/V of the container and they collide (equal masses swap the velocity component along the line between centers, which keeps the Maxwell-Boltzmann distribution, tested), and faint lines join dots close enough to attract, darker when the attraction term is larger. Hold pressure is not offered in real gas mode.
- **Motion.** Pause and Play, and Step (a quarter second of model time, one gauge reading). A device that asks for reduced motion starts paused with a note. The live region speaks only after the student changes something (once, 0.9 s after the last change), never continuously.

## Data sources
| Data | Source |
|---|---|
| Molar masses (g/mol): He 4.0026, Ne 20.180, Ar 39.948, Kr 83.798, Xe 131.29, N₂ 28.014, O₂ 31.998, CO₂ 44.009 | IUPAC (CIAAW) standard atomic weights |
| Van der Waals a (bar·L²/mol²) and b (L/mol): He 0.0346, 0.0238; Ne 0.2135, 0.01709; Ar 1.355, 0.03201; Kr 2.349, 0.03978; Xe 4.250, 0.05105; N₂ 1.370, 0.0387; O₂ 1.382, 0.03186; CO₂ 3.640, 0.04267 | CRC Handbook of Chemistry and Physics (R. C. Weast, ed.), table of van der Waals constants for gases, as tabulated in the widely used "Van der Waals constants (data page)" compilation. a is divided by 1.01325 to give atm·L²/mol². |
| R = 0.08206 L·atm/(mol·K), 8.314 J/(mol·K); 1 atm = 101.325 kPa | CODATA values, rounded as in the AP Chemistry reference sheet |

The van der Waals values were entered from memory of that standard table and could not be re-checked online from this environment; please compare them with the class textbook's table (see Decisions).

## Decisions for the teacher to confirm
- **Van der Waals constants** above (and that recent CRC editions list slightly different values for some gases, for example CO₂ a = 3.658, b = 0.04286). Each is one line in `physics.js`.
- **R values**: 0.08206 and 8.314, as on the AP reference sheet.
- **Each dot is 1/200 mol**, and the mixture can hold up to 2.00 mol of each of three gases (6.00 mol in all).
- **Speed normalization**: the dots' kinetic energy is set to exactly (3/2)RT after the speeds are drawn, so the gauge averages to nRT/V even with 20 dots.
- **Real gas mode** uses 0.25 to 2.50 L (drawn at 4 times the scale) and shows the van der Waals model's condensation below the critical temperature. It does not model freezing (CO₂ at 1 atm would be solid below 195 K).
- **Hold pressure** places the piston by the ideal gas law rather than simulating a moving piston.
- **Investigation wording** (data.js), especially "Kinetic energy is proportional to the kelvin temperature" and the statement that attractions soften the hits on the walls.
- **Round**: 6 investigations, at least 2 gas laws, 1 kinetic molecular theory, 1 speed distribution and 1 mixture or real gas task.

## Investigations
Eleven tasks, each with three steps: predict, test in the lab (Set up the lab, then make the change or press Make the change for me, and read the lab), explain in particle terms. The engine gives tap to check, the answer trail, two hints, Show me after two wrong attempts, the review queue and the round summary. A full mixed round of 6 gives a completion code (prefix GAS, registered as id 3 in `shared/zsa-codes.js`; stats Predict, Test in the lab, Explain with particles). Test step answers come from `physics.js` with the same formatting as the lab's readouts, and the button values are the shown numbers, so the page source does not mark the right one.

| Task | Group | Setup and change | Test reading |
|---|---|---|---|
| Squeeze the gas (boyle) | Gas laws | 0.50 mol N₂, 300 K, 6.0 L, hold T; to 3.0 L | Gas law pressure 4.10 atm |
| Heat the gas, piston free (charles) | Gas laws | 0.20 mol O₂, 27 °C, hold P at 1.00 atm; to 600 K | Volume 9.85 L |
| Heat the gas, walls fixed (gaylussac) | Gas laws | 1.00 mol Ar, 27 °C, 8.0 L, hold V; to 450 K | Gas law pressure 4.62 atm |
| Add more gas (avogadro) | Gas laws | 0.40 mol He, 300 K, hold P at 2.00 atm; to 0.80 mol | Volume 9.85 L |
| Kinetic energy and temperature (ke) | KMT | 1.00 mol N₂, 27 °C; to 327 °C | (3/2)RT = 7.48 kJ/mol |
| Helium and xenon at the same temperature (hexe) | KMT | 1.00 mol He + 1.00 mol Xe, 300 K | Speed ratio 5.7 times |
| Read the curves: temperature (mbT) | Speeds | N₂ curves at 300 K and 600 K; then 600 K | Average speed 673 m/s |
| Read the curves: mass (mbM) | Speeds | Ne and Kr curves at 300 K | Kr average speed 275 m/s |
| Partial pressures (dalton) | Mixtures and real gases | 0.50 mol He + 1.50 mol Ar, 300 K, 10.0 L | Ar partial pressure 3.69 atm |
| When real gases deviate (realP) | Mixtures and real gases | 1.00 mol CO₂, 300 K, 2.50 L, real; to 0.50 L | PV/nRT 0.801 |
| Which gas is least ideal? (realGas) | Mixtures and real gases | 2.00 mol Xe, 300 K, 1.00 L, real | PV/nRT 0.773 |

### Misconception map
| Misconception | Where | Feedback (key) |
|---|---|---|
| Using °C instead of K | Charles, Gay-Lussac and KE predictions and tests (27 °C to 327 °C gives "about 12 times"), KE explanation | `celsius`, `celsiusKE` |
| Heavier particles have more KE at the same T | He vs Xe, both curve tasks, Dalton, real gases | `heavierKE` |
| Pressure comes from particles pushing on each other | Every explanation step with a "push" or "repel" choice | `pushing` |
| Particles change size when heated or squeezed | Boyle, Charles, Gay-Lussac, Avogadro, KE | `sizeConst` |
| Speed doubles when T doubles; KE rises by √2 | KE, curves | `speedDouble`, `speedNotKE` |
| Reading before making the change | Every test step with a change | `notRun` |
| Faster particles exert more pressure per mole | Dalton | `fasterPressure` |
| The taller curve is the hotter or the heavier gas | Curve tasks | `tallIsHot`, `heavyFast` |
| Low pressure or high temperature causes deviation | Real gases | `realReverse`, `realHighT`, `realLowP` |

## Keyboard and screen readers
- Every control is a native element: range inputs (arrow keys, Home, End, Page Up and Down) with number boxes (type a value and press Enter), radio groups for the model and Hold constant (arrow keys), a checkbox for Mixture, selects for gases and graphs, and buttons. Held controls are disabled.
- The tabs follow the ARIA tabs pattern: one Tab stop, arrow keys, Home and End. Each panel is focusable.
- The canvas is an image with a label that changes with the state ("Container with a piston at 5.0 L holding 200 helium dots at 300 K."). Every chart is an SVG image with a summary label, and every graph has a data table alternative. Speed curves differ by line style and a text label at each peak, not color alone; mixture particles differ by shape.
- The lab's live region announces readouts once after the student stops changing something. The investigation steps use the engine's live region.

## Layout
- 1200 px and wider: container, controls and the tools panel in three columns. At 1366x657 the container, every control and the gauge fit without scrolling.
- 900 to 1199 px: container and controls side by side, the tools below.
- Narrower: one column. The container and its gauge sit side by side, then the controls; at 390x664 the container, every control and the gauge fit without scrolling. Charts are drawn at the panel's width so their text stays readable.

## Changelog
- 1.0.0: first version, with the lab (ideal, mixture and real gas modes), graphs, speed distributions and 11 investigations with completion codes.
