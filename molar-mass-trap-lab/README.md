# The Molar Mass Trap Lab

Version: 1.1.0

A virtual investigation for Chemistry and Honors Chemistry Unit 4. It opens with an intro screen that shows the four liquids, then has the wax-paper investigation, the steel shot race and the five-tube mixing rack. Students record their data, predictions and debrief on the printed lab worksheet, so the simulation uses the full width of the page. The steel shot stopwatch times each fall automatically.

## Intro screen

The intro shows each liquid's bottle code, dye, Lewis structure, formula and molar mass, with bars that compare the molar masses. The values come from the worksheet: water 18 g/mol, glycerin 92 g/mol, 1-octanol 130 g/mol and mineral oil roughly 300 g/mol or more. Mineral oil is a mixture of long alkanes from about C<sub>15</sub> to C<sub>40</sub>, so its drawing shows part of one chain. The lab is named for this contrast: the lightest molecule wins several tests. **Start the lab** opens the bench. The **Intro** button in the header returns to the intro without resetting anything.

The Lewis structures show the O-H groups and lone pairs, which is the evidence the worksheet's pre-lab asks students to find. Teachers who want students to draw the structures first can show the intro after the pre-lab.

## Run the bench

From the repository root, run `npm run serve` and open `http://127.0.0.1:8000/molar-mass-trap-lab/`. Add `?lang=es` for Mexican Spanish. The intro screen shows on load, and **Start the lab** opens the bench. Each station can empty or reset its selected apparatus.

On screens at least 1000 px wide, each station shows its scene on the left and its controls on the right, so the whole bench fits on a 1366 × 768 or 1280 × 720 laptop without scrolling. Narrower screens stack the controls below the scene.

The lab keeps no student entries. The apparatus starts fresh on a reload. **Start fresh** resets all three stations after confirmation.

## Measurement model

Each box receives three drops of about 0.05 mL in one spot. **Add a drop** shows an eyedropper icon. The third landing starts the settle, which runs on its own: the clock counts to 30 s in 2.5 s of real time, then the ruler appears. The clock continues during station changes. The top and side views show the same spherical cap and use the same scale as the ruler. A tall cap can bulge wider above the wax than at its contact line. The ruler has 1 mm marks and its zero moves in 0.5 mm increments by drag or with the slider. **Read edges** reads the two edges relative to zero and gives the approximate side-view height.

These are the uncalibrated example dimensions at 0.15 mL. The initial width uses 93% of the settled width at the same volume, with the diameter of a sphere as the lower limit. Class measurements taken from above can replace the diameter inputs in `model.js`.

| Liquid | Settled diameter (mm) | Side-view height (mm) |
| --- | ---: | ---: |
| W, water | 10 | 3.33 |
| G, glycerin | 12 | 2.51 |
| O, 1-octanol | 20 | 0.95 |
| M, mineral oil | 22 | 0.79 |

## Steel shot race

Select a sealed tube with its named button or by clicking it in the rack, tilt it, and turn it upright. The digital stopwatch is event-timed only: it starts the instant the shot leaves the stopper and stops at first contact with the bottom, so students read the time instead of clicking to start and stop it. A run indicator on the screen shows while it is timing. Tilting the tube again rolls the shot back to the stopper for another run, so the simulation has no magnet. Students copy each reading to the worksheet before tilting again, which clears the stopwatch.

The shot position and stopwatch use one elapsed-time clock. Switching tubes or stations, or hiding the tab, pauses the active trial. Resume explicitly on return. The short water and octanol replays are labeled as slow motion and report the original fall time. The stopwatch follows the worksheet's 0.5 s reporting threshold. The display shows **Timing** while the running clock is below 0.5 s. If the fall ends under that threshold, the display and the replay report less than 0.5 s. The animation uses the example travel times below.

Students record two trials in seconds on the worksheet and average them there. Repeated trials give the same simulated time, and water reads less than 0.5 s.

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

Choose any numbered tube and any two liquids. The rack does not show a recipe. The worksheet lists the pairs to test. The pipette always adds 1.0 mL, so the pipette button reads **Dispense liquid** and has the same eyedropper icon as the wax station. Both portions may be added in either order. Before inversion, the model puts the denser liquid below the lighter one. The approximate densities in `model.js` are 1.26 g/mL for glycerin, 1.00 for water, 0.86 for mineral oil and 0.83 for 1-octanol. A tube can be emptied into the waste beaker at any point and filled again.

Add the stopper and complete five gentle inversions, then choose **Set upright** to start the stand. The clock counts to 60 s in 10 s of real time and keeps running through tube and station changes. **Advance to 60 s** is a separate control that finishes just the selected tube's wait.

Count the liquid bands below the curved air-liquid surface. **Read layers** describes the unmixed bands, changes during settling, and the settled result. Students record the number of layers and where the dye went on the worksheet. Dye shows where a tint is visible. Two layers can still have limited mutual solubility.

The settled result depends only on the two liquids in the tube. Water with glycerin and mineral oil with 1-octanol form one layer, as in the teacher guide. Two portions of the same liquid also form one layer. Every other pair forms two layers, stacked by density. The teacher guide does not cover glycerin with 1-octanol. The model shows two clear layers with glycerin below, because glycerin is far more polar and is only slightly soluble in 1-octanol.

The worksheet's volumes for 1-octanol are 0.5 mL. The simulation uses 1.0 mL for every portion, so every tube holds 2.0 mL. The drawing uses a common scale for approximate volumes. The 420 ms transfer, 720 ms inversion, and 280 ms placement animations are illustrative.

| Liquids (1.0 mL each) | Settled bands, bottom to top |
| --- | --- |
| W + G | One blue-tinted band |
| W + M | Blue, red |
| W + O | Blue, clear |
| M + O | One red-tinted band |
| G + M | Clear, red |
| G + O | Clear, clear (model assumption) |
| Any liquid with itself | One band |

## Lab worksheet

Version 1.1.0 removed the on-screen notebook, predictions, debrief, notebook files and printout. Students use the printed lab worksheet for predictions, all three data tables and the debrief questions. The browser walkthrough covers all six station orders and a complete Spanish-to-English route. See the physical lab procedure for the source setup and the worksheet. [English procedure](https://zornscience.org/teaching/physical-labs/molar-mass-trap-imf-lab/) · [Spanish procedure](https://zornscience.org/es/teaching/physical-labs/molar-mass-trap-imf-lab/)

ZornScience | CC BY-NC-SA 4.0
