# Verification record
Version: 1.0.1
Date: 2026-10-16
Reviewer: Claude (built and tested 1.0.0)

PASS means the check was run on version 1.0.0 as committed and passed. NOT TESTED rows say why. Unit tests run in Node (`tests/unit/gas-lab.test.js`); browser checks use Playwright 1.56 with Chromium over the repository's test server (`tests/e2e/gas-lab.spec.js`). Both run in CI with `npm test`.

## Physics (`tests/unit/gas-lab.test.js`)
| Check | Status | Evidence |
|---|---|---|
| Measured pressure vs nRT/V | PASS | 14 states (12 single gases from 0.10 to 2.00 mol, 100 to 1000 K, 1 to 10 L, all eight gases, plus two mixtures), each measured from wall impulses until about 4,000 hits: every state within 5% (largest difference 0.34%, mean 0.11%). The running gauge after 10 s of model time is within 5% too. |
| Boyle's law | PASS | P vs 1/V sweep of 10 measured points: R² > 0.99, slope nRT within 5%, intercept under 5% of the slope; P = k/V fit R² > 0.99; PV constant within 5% at every point. |
| Charles's law | PASS | V vs T at constant P: R² > 0.99, the line reaches V = 0 within 10 K of 0 K, V runs exactly 1 to 10 L, and the measured pressure stays within 5% of the held pressure at every point. |
| Gay-Lussac's law | PASS | P vs T at constant V from measured points: R² > 0.99, zero within 30 K of 0 K, slope nR/V within 5%. |
| Avogadro's law | PASS | V vs n at constant P and T: R² > 0.99, intercept under 0.05 L, measured pressure stays at the held value; a mixture keeps its mole fractions through the sweep. |
| 3D Maxwell-Boltzmann speeds | PASS | Chi-square goodness of fit (20 bins of equal probability, 19 degrees of freedom, critical value 43.8 at p = 0.001) on 10,000 dot speeds each, independent seeds: He 300 K 10.2, Ar 600 K 20.2, Xe 150 K 17.5, CO₂ 1000 K 16.5, N₂ 450 K 12.4. The same speeds against the curve for a 20% higher temperature give 430 to 460, so the test can fail. Sample mean speeds within 2% of √(8RT/πM). Also passes after heating (speeds scaled by √(T₂/T₁)) and after 4 s of real gas collisions, which change more than 100 velocities while keeping the total kinetic energy to 1 part in 10⁹. |
| Average kinetic energy | PASS | The dots' average is (3/2)RT for all 8 gases at 100, 300, 600 and 1000 K, and in a He + Xe mixture; ½M·v_rms² = (3/2)RT; 27 °C to 327 °C doubles it; speeds rise by √2; helium is 5.73 times faster than xenon; N₂ v_rms at 298 K is 515 m/s and He at 300 K 1,367 m/s. |
| Partial pressures | PASS | Measured partial pressures add up exactly to the measured total and each is within 5% of X·P; Ar 1.50 of 3.00 mol at 300 K in 10 L gives 3.69 atm. |
| Van der Waals | PASS | 12 states match `tests/science/gas_lab_vdw.py`, an independent Python calculation (explicit formula; coexistence by Newton's method on equal pressure and chemical potential, where `physics.js` uses the equal-area rule with bisection): P within 1 part in 10⁶, PV/nRT within 10⁻⁵. Reduced vapor pressures at Tr 0.95, 0.9, 0.85, 0.8, 0.7, 0.6, 0.5 agree to 6 figures (0.8119, 0.6470, 0.5045, 0.3834, 0.2005, 0.0869, 0.0278, matching published van der Waals values). Critical temperatures from a and b: CO₂ 304 K, N₂ 126 K. Deviations behave as taught: near 1 at low pressure, above 1 at high pressure and temperature, below 1 at lower temperature, Xe and CO₂ more than 3 times He's departure, condensation below the critical temperature. |
| Units | PASS | atm and kPa, K and °C, R in L·atm and J agree to 2 parts in 10⁴, the STP molar volume, a from bar to atm. |
| Hold rules | PASS | Boyle, Gay-Lussac, Charles and Avogadro changes, the held variable locked, a change past the top of the container stopping at 10 L (600 K), ranges enforced. The calibration constant is the same for every state; dot counts are 200 per mole. |

## Lab in the browser (`tests/e2e/gas-lab.spec.js`)
| Check | Status | Evidence |
|---|---|---|
| No sideways page scroll, 44 px targets | PASS | 320x568, 360x640, 390x664, 683x384, 768x1024, 1280x617, 1366x657, 1920x960, in 5 states each (start, real gas with PV/nRT graph, mixture with Speeds, Investigations, V vs T swept with the data table). Every visible button, link, summary, select, number box, range input and radio or checkbox label is at least 44 by 44 px. A data table wider than a phone scrolls inside its own focusable region. |
| Fit without scrolling | PASS | At 1366x657 and 390x664 the canvas (at least 190 px tall), the pressure gauge, the mode and mixture controls, the gas select, the moles, volume and temperature sliders and boxes, Hold constant, Pause and Step are all on screen with the page unscrolled. |
| Readouts | PASS | Gas law values, (3/2)RT, average speed and °C for each hold setting; the measured gauge within 5% of the gas law after 4 s; kPa shown. |
| Mixtures | PASS | Moles, mole fractions and partial pressures per gas and a total row; "P total = 2.46 + 1.48 + 0.98 = 4.92 atm"; shapes named in the canvas label; a used gas is not offered twice; real gas mode off. |
| Real gas mode | PASS | Van der Waals pressure, PV/nRT, both terms and the model note match `physics.js`; above 1 for N₂ at 1000 K and 0.25 L; xenon at 200 K condenses, with the warning and the canvas label; hold pressure off. |
| Graphs | PASS | All five sweeps (P vs V, P vs 1/V, V vs T, P vs T, V vs n) give 10 points and their fit (R² 0.99 or more), V vs T reaches zero near −273 °C on the °C axis, the chart's label, the data table (10 rows, 10 columns), Copy data (11 tab-separated lines, plain minus signs), Record point, and the PV/nRT vs P sweep in real gas mode. |
| Speeds | PASS | Labels and the summary for one curve, 300 K vs 600 K, He vs Ar, Ne vs Kr: legend text, "(solid)" and "(dashed)" labels on the chart, and the speed table values. |
| Keyboard | PASS | Volume and temperature sliders (arrows, Home, End), number boxes (type and Enter), Hold constant and model radios (arrows), moles, gas select, Mixture (Space), Pause and Step, the tabs (arrows, Home, End), the graph select, Run sweep, Record point, Show data table, Copy data, the focusable table region, the comparison select, the second temperature and a preset, all without the mouse. The focused element has a solid outline. |
| Deep links and back link | PASS | `gas`, `mode=real`, `mix=1` with `gas`, each `graph`, `mb=1`, bad values falling back, combined parameters, no focus move on load. `from` accepted for a zornscience.org lesson and refused for 8 bad values (other hosts, http, www, user name, port, javascript:, relative, a lookalike host). |
| Embed mode | PASS | Back link line and footer hidden, h1 visible, links `_top`, other parameters still apply. Framed in a simulated zornscience.org page: resize messages with integer heights, and answering a step or moving a slider in the frame does not scroll the host. |
| Reduced motion | PASS | Starts paused with the note, the drawing does not change while paused, Step moves it and starts the gauge, Play runs it. Without the preference it starts playing. |
| Live region | PASS | Nothing announced in 2.5 s of animation; five key presses on the volume slider give exactly one announcement ("Volume 5.50 L. Pressure 4.48 atm by the gas law.") and nothing after; holding pressure, a temperature change announces the new volume. |
| Frame rate | PASS | Chromium CPU throttled 4 times: the mixture at 1,200 dots and real gas mode at 400 dots in 0.25 L (collisions and attraction lines) both above 30 frames per second (about 56 to 60 when last measured). Headless Chromium on the build machine, not a school device. |
| axe-core 4.14 | PASS | Zero violations (WCAG 2.0, 2.1, 2.2 A and AA plus best practices) in 8 states: start, real gas condensed, mixture, speeds compared (390 px), graph with table (390 px), investigation, investigation with wrong feedback and a hint (390 px), embed mode. |
| Network, storage, console | PASS | Only local files, each script and stylesheet with `?v=1.0.0`; no storage or cookies. Every browser test fails on a console error or warning, page error or CSP violation. |
| HTML and CSS validation | PASS | W3C Nu checker (vnu-jar 26.10.12): no errors or warnings for `gas-lab/index.html`, `gas-lab/gas-lab.css` and the root `index.html` (only the usual info notes that the CSP blocks assets read from `file:`). `check/index.html` has one error that was there before this change (an empty header row filled by script). |
| No em or en dashes | PASS | `tests/unit/static.test.js` scans every published file. |
| Screenshots reviewed | PASS | Every graph, the Speeds tab, real gas mode (with condensation), mixtures and the investigation charts at 390x664 and 1366x657, viewed by Claude. Fixes made from them: a sr-only legend that widened the page, the gauge and tabs at 320 px, chart text too small on phones (charts are now drawn at the panel's width), axis tops that cut off a curve, a label over the extrapolated line, white boxes behind curve labels, and a larger two-curve chart in the investigations. |

## Investigations
| Check | Status | Evidence |
|---|---|---|
| Every wrong pick routes to its feedback | PASS | All 11 investigations from the picker, every choice in every step clicked: each wrong pick shows exactly its intended message (shared keys such as `celsius`, `heavierKE` and `pushing`, or the task's own), and exactly one choice per step is right. A test found and fixed one key (`idealOne`) that a second task used but only the first defined. |
| Answers match the lab's numbers | PASS | For all 11 test steps the right answer equals what the lab shows after Set up the lab and Make the change for me (gas law value, volume box, (3/2)RT, average speed, PV/nRT, the partial pressure table, or the ratio of the two speeds). For the 7 tasks with a change, setting the control by hand gives the same reading. |
| Completion code | PASS | A full seeded round played in the page (two hints, wrong answers, review items): the code has the GAS shape, decodes as Valid for gas-lab with this version, 6 items, 2 hints and the same first-try counts as the round summary; Copy code puts it on the clipboard; the checker page reads it as Valid, Gas Laws and KMT Lab. Single practice gives no code. `tests/unit/codes.test.js` covers the registry entry (round-trips, typo detection, labels equal to `data.js`). |
| Real screen readers (NVDA, VoiceOver, ChromeVox) | NOT TESTED | Not available here. Names, roles and live regions were checked in the DOM. |
| Firefox, Safari, school devices | NOT TESTED | Only Chromium is available. |
| Live URL, lesson links | NOT TESTED | After merging: https://activities.zornscience.org/gas-lab/ |
