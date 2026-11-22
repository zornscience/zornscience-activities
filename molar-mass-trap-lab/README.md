# The Molar Mass Trap Lab

Version: 0.3.0

A virtual investigation for Chemistry and Honors Chemistry Unit 4. This development build has the wax-paper investigation, the steel shot race and the five-tube mixing rack.

## Run the bench

From the repository root, run `npm run serve` and open `http://127.0.0.1:8000/molar-mass-trap-lab/`. Add `?lang=es` for Mexican Spanish. The notebook holds editable measurements, shape choices and notes until the page is reloaded or closed. **Print notebook** sends all three tests to the browser's print or PDF dialog. Each station can empty or reset the selected apparatus. **Start fresh** clears the bench and notebook after confirmation.

## Measurement model

Each box receives three drops of about 0.05 mL in one spot. The third landing starts a 30 s settling clock. The clock continues during station changes. The top and side views show the same spherical cap and use the same scale as the ruler. A tall cap can bulge wider above the wax than at its contact line. The ruler has 1 mm marks and its zero moves in 0.5 mm increments by drag or with the slider. **Read edges** reads the two edges relative to zero and gives the approximate side-view height.

These are the uncalibrated example dimensions at 0.15 mL. The initial width uses 93% of the settled width at the same volume, with the diameter of a sphere as the lower limit. Class measurements taken from above can replace the diameter inputs in `model.js`.

| Liquid | Settled diameter (mm) | Side-view height (mm) |
| --- | ---: | ---: |
| W, water | 10 | 3.33 |
| G, glycerin | 12 | 2.51 |
| O, 1-octanol | 20 | 0.95 |
| M, mineral oil | 22 | 0.79 |

## Steel shot race

Select a sealed tube, tilt it, and turn it upright. Start the manual stopwatch when the shot leaves the stopper and stop it on first contact with the bottom. Event timing marks those same instants automatically. The notebook labels saved event readings as instrument-timed and retains their simulated intervals, including values under 0.5 s. A manual reading preserves the time between the student's clicks. The feedback flags an early stop or a start or late stop more than 0.35 s from its event. The external magnet returns the shot to the stopper for another run. The magnet or **Reset tube** saves an unrecorded, unflagged reading to the next empty trial. Students can keep a flagged reading with **Record reading** before they retry.

The shot position and stopwatch use one elapsed-time clock. Switching tubes or stations, or hiding the tab, pauses the active trial. Resume explicitly on return. The short water and octanol replays are labeled as slow motion so students can use the event markers without timing the replay. Only an event-timed run reports the original interval. In manual mode, the student decides whether to record `<0.5`.

Record two trials in seconds. For a fall too fast to time manually, record `<0.5`. Two readings below 0.5 s give a mean below 0.5 s. One such reading and one measured time give a lower and upper bound. Students can add another trial and check the average of the first two measured times, with both trial numbers shown. **Check averages** shows all four checked results in the table alongside the editable readings. Exact means display to the precision of the less precise trial. The check accepts a student's rounding to the last decimal place they entered. Both the wax-paper and shot entries are available from the shot station and print together.

### Example calibration

The demonstration assumes identical tubes, a 90 mm shot travel, an 8 mm air gap, a 4 mm steel shot and a room temperature of 22 °C. Values in `model.js` reproduce the order described by the teacher guide. The times and apparatus dimensions are illustrative. Class measurements, tube dimensions, temperature and the mineral oil grade can replace this calibration.

| Liquid | Example fall time (s) |
| --- | ---: |
| W, water | 0.27 |
| G, glycerin | 6.40 |
| O, 1-octanol | 0.98 |
| M, mineral oil | 2.25 |

The comparison uses the same geometry and shot for each liquid. Density and drag also affect the measured fall time.

## Mixing rack

Choose any numbered tube. Select the liquid and volume in the graduated pipette, then dispense each of the two aliquots. Both may be added in either order. A wrong liquid or volume can be emptied into the waste beaker and the same tube filled again. After adding the stopper, complete five gentle inversions and set the tube upright. The 60 s clock continues through tube and station changes. **Advance to 60 s** finishes just the selected tube's wait.

Count the liquid bands below the curved air-liquid surface. **Read layers** describes their visible order and tint after the full wait. The notebook retains the student's editable observations when the tube is emptied or refilled. Dye shows where a tint is visible. Two layers at these amounts can still have limited mutual solubility.

The recipes and bottom-to-top appearances come from the handoff and teacher guide. The drawing uses a common scale for approximate volumes. The 420 ms transfer, 720 ms inversion, and 280 ms placement animations are illustrative.

| Tube | Aliquots (mL) | Total (mL) | Settled bands, bottom to top |
| --- | --- | ---: | --- |
| 1 | W 1.0 + G 1.0 | 2.0 | One blue-tinted band |
| 2 | W 1.0 + M 1.0 | 2.0 | Blue, red |
| 3 | W 1.0 + O 0.5 | 1.5 | Blue, smaller clear band |
| 4 | M 1.0 + O 0.5 | 1.5 | One red-tinted band |
| 5 | G 1.0 + M 1.0 | 2.0 | Clear, red |

## Classroom release

The public catalog listing and SEO entries belong to the release candidate, after the full classroom walkthrough in the handoff. See the physical lab procedure for the source setup. [English procedure](https://zornscience.org/teaching/physical-labs/molar-mass-trap-imf-lab/) · [Spanish procedure](https://zornscience.org/es/teaching/physical-labs/molar-mass-trap-imf-lab/)

ZornScience | CC BY-NC-SA 4.0
