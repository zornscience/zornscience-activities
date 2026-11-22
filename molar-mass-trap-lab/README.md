# The Molar Mass Trap Lab

Version: 1.1.0

A virtual investigation for Chemistry and Honors Chemistry Unit 4. It includes the wax-paper investigation, the steel shot race and the five-tube mixing rack. Students record their data, predictions and debrief on the printed lab worksheet, so the simulation uses the full width of the page.

## Run the bench

From the repository root, run `npm run serve` and open `http://127.0.0.1:8000/molar-mass-trap-lab/`. Add `?lang=es` for Mexican Spanish. The bench is ready on load. Each station can empty or reset its selected apparatus.

On screens at least 1000 px wide, each station shows its scene on the left and its controls on the right, so the whole bench fits on a 1366 × 768 or 1280 × 720 laptop without scrolling. Narrower screens stack the controls below the scene.

The lab keeps no student entries. The apparatus starts fresh on a reload. **Start fresh** resets all three stations after confirmation.

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

Select a sealed tube, tilt it, and turn it upright. Start the manual stopwatch when the shot leaves the stopper and stop it on first contact with the bottom. Event timing marks those same instants automatically. A manual reading preserves the time between the student's clicks. The feedback flags an early stop or a start or late stop more than 0.35 s from its event. The external magnet returns the shot to the stopper for another run. Students copy each reading to the worksheet before using the magnet, which clears the stopwatch.

The shot position and stopwatch use one elapsed-time clock. Switching tubes or stations, or hiding the tab, pauses the active trial. Resume explicitly on return. The short water and octanol replays are labeled as slow motion so students can use the event markers. In manual mode, the student decides whether to record `<0.5`. Event mode follows the worksheet's 0.5 s reporting threshold. The display shows **Timing** while the running clock is below 0.5 s. If the fall ends under that threshold, the display and the event replay report less than 0.5 s. The animation uses the example travel times below.

Students record two trials in seconds on the worksheet and average them there. For a fall too fast to time manually, the feedback reminds them to record less than 0.5 s.

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

Choose any numbered tube. Select the liquid and volume in the graduated pipette, then dispense each of the two aliquots. Both may be added in either order. Before inversion, the model puts the denser aliquot below the lighter one. The approximate densities in `model.js` are 1.26 g/mL for glycerin, 1.00 for water, 0.86 for mineral oil and 0.83 for 1-octanol. A wrong liquid or volume can be emptied into the waste beaker and the same tube filled again.

Add the stopper and complete five gentle inversions, then choose **Set upright** to start the 60 s clock. The clock continues through tube and station changes. **Advance to 60 s** is a separate control that finishes just the selected tube's wait.

Count the liquid bands below the curved air-liquid surface. **Read layers** describes the unmixed bands, changes during settling, and the settled result. Students record the number of layers and where the dye went on the worksheet. Dye shows where a tint is visible. Two layers at these amounts can still have limited mutual solubility.

The recipes and bottom-to-top appearances come from the handoff and teacher guide. The drawing uses a common scale for approximate volumes. The 420 ms transfer, 720 ms inversion, and 280 ms placement animations are illustrative.

| Tube | Aliquots (mL) | Total (mL) | Settled bands, bottom to top |
| --- | --- | ---: | --- |
| 1 | W 1.0 + G 1.0 | 2.0 | One blue-tinted band |
| 2 | W 1.0 + M 1.0 | 2.0 | Blue, red |
| 3 | W 1.0 + O 0.5 | 1.5 | Blue, smaller clear band |
| 4 | M 1.0 + O 0.5 | 1.5 | One red-tinted band |
| 5 | G 1.0 + M 1.0 | 2.0 | Clear, red |

## Lab worksheet

Version 1.1.0 removed the on-screen notebook, predictions, debrief, notebook files and printout. Students use the printed lab worksheet for predictions, all three data tables and the debrief questions. The browser walkthrough covers all six station orders and a complete Spanish-to-English route. See the physical lab procedure for the source setup and the worksheet. [English procedure](https://zornscience.org/teaching/physical-labs/molar-mass-trap-imf-lab/) · [Spanish procedure](https://zornscience.org/es/teaching/physical-labs/molar-mass-trap-imf-lab/)

ZornScience | CC BY-NC-SA 4.0
