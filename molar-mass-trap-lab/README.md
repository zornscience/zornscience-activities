# The Molar Mass Trap Lab

Version: 1.2.3

A virtual investigation for Chemistry and Honors Chemistry Unit 4. It opens with an intro screen that shows the four liquids, then has the wax-paper investigation, the steel shot race and the five-tube mixing rack. Students record their data, predictions and debrief on the printed lab worksheet, so the simulation uses the full width of the page. The steel shot stopwatch times each fall automatically.

## Intro screen

The intro shows each liquid's bottle code, dye, Lewis structure, formula and molar mass. Each molar mass row has a bar, and all four bars use the same scale, with mineral oil's roughly 300 g/mol as the full width. The values come from the worksheet: water 18 g/mol, glycerin 92 g/mol, 1-octanol 130 g/mol and mineral oil roughly 300 g/mol or more. Mineral oil is a mixture of long alkanes from about C<sub>15</sub> to C<sub>40</sub>. Its drawing shows a whole molecule with the CH<sub>2</sub> unit in brackets and a subscript n, and a caption says the unit repeats about 13 to 38 times. The lab is named for this contrast: the lightest molecule wins several tests.

**Start the lab** sits beside the heading at the top of the intro and opens the bench. The **Intro** button in the header returns to the intro without resetting anything. On the intro, **Instructions** shows getting-started steps. On the bench it shows the open station's steps.

The Lewis structures show the O-H groups and lone pairs, which is the evidence the worksheet's pre-lab asks students to find. Teachers who want students to draw the structures first can show the intro after the pre-lab.

## Run the bench

From the repository root, run `npm run serve` and open `http://127.0.0.1:8000/molar-mass-trap-lab/`. Add `?lang=es` for Mexican Spanish. The intro screen shows on load, and **Start the lab** opens the bench. Each station can empty or reset its selected apparatus.

### Reduced motion

When the device asks for reduced motion (ChromeOS's accessibility setting does this in Chrome), the lab skips the falling drop, the steel shot's fall and the tube turns by default. Gentle changes stay smooth: the puddle spreading, the streaks fading and the running clocks. The intro then shows a notice with **Show full animations**, which turns every animation on. The choice is added to the address as `motion=full`, so it survives a reload or a language switch, and **Use less motion** turns it back off. A teacher can post the lab link with `?motion=full` to turn full animations on for every student. The lab stores nothing in the browser. The notice appears only on the intro, so the bench keeps its full height. Firefox on a Chromebook does not receive the ChromeOS setting, so it animates fully either way.

On screens at least 1000 px wide, each station shows its scene on the left and its controls on the right, so the whole bench fits on a 1366 × 768 or 1280 × 720 laptop without scrolling. Narrower screens stack the controls below the scene.

The lab keeps no student entries. The apparatus starts fresh on a reload. **Start fresh** resets all three stations after confirmation.

## Measurement model

Each box receives three drops of about 0.05 mL in one spot. **Add a drop** shows an eyedropper icon. The third landing starts the settle, which runs on its own. A mini stopwatch shows the elapsed settling time from 0:00 to 0:30, which takes 2.5 s of real time, then the ruler appears. The puddle redraws every frame while it settles, so the spreading looks smooth. Each frame writes only the attributes that changed. The clock continues during station changes. The top and side views show the same spherical cap. The top view uses the ruler's scale, and the side view is the same shape at twice that size. A tall cap can bulge wider above the wax than at its contact line. The ruler has 1 mm marks and its zero moves in 0.5 mm increments by drag or with the slider. **Read edges** reads the two edges relative to zero and gives the approximate side-view height. The eye-level view is enlarged 2× in both directions and labeled, so puddle shapes stay true while heights are easier to read. A fixed upright ruler stands on the wax there, numbered 0 to 4 mm with half-millimeter marks, at the enlarged scale, so it reads real millimeters. The tallest puddle, water, is about 3.3 mm. A dashed line carries the top of the puddle across to the ruler.

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

Choose any numbered tube and any two liquids. The rack does not show a recipe. The worksheet lists the pairs to test. The pipette adds 0.5 mL of 1-octanol and 1.0 mL of each other liquid, as on the worksheet. Each liquid's option in the pipette list shows its volume. The note under the list says 1-octanol is 0.5 mL, and while 1-octanol is chosen the note is highlighted and the drawn pipette is half full. The tube label shows each portion's volume. The pipette button reads **Dispense liquid** and has the same eyedropper icon as the wax station. Both portions may be added in either order. Before inversion, the model puts the denser liquid below the lighter one. The approximate densities in `model.js` are 1.26 g/mL for glycerin, 1.00 for water, 0.86 for mineral oil and 0.83 for 1-octanol. A tube can be emptied into the waste beaker at any point and filled again.

Add the stopper and complete five gentle inversions. After the fifth inversion the tube returns upright to the rack on its own and its mini stopwatch starts. The stopwatch shows elapsed stand time from 0:00 to 1:00, which takes 10 s of real time, and keeps running through tube and station changes. **Advance to 60 s** is a separate control that finishes just the selected tube's wait.

Count the liquid bands below the curved air-liquid surface. **Read layers** describes the unmixed bands, changes during settling, and the settled result. A 0.5 mL band is described as smaller. Students record the number of layers and where the dye went on the worksheet. Dye shows where a tint is visible. Two layers can still have limited mutual solubility.

The settled result depends only on the two liquids in the tube. Water with glycerin and mineral oil with 1-octanol form one layer, as in the teacher guide. Two portions of the same liquid also form one layer. Every other pair forms two layers, stacked by density. The teacher guide does not cover glycerin with 1-octanol. The model shows two clear layers with glycerin below, because glycerin is far more polar and is only slightly soluble in 1-octanol.

Tubes with 1-octanol hold 1.5 mL, or 1.0 mL for 1-octanol with itself. The others hold 2.0 mL. The drawing uses a common scale for approximate volumes. The 420 ms transfer, 720 ms inversion, and 280 ms placement animations are illustrative.

| Liquids | Total (mL) | Settled bands, bottom to top |
| --- | ---: | --- |
| W 1.0 + G 1.0 | 2.0 | One blue-tinted band |
| W 1.0 + M 1.0 | 2.0 | Blue, red |
| W 1.0 + O 0.5 | 1.5 | Blue, smaller clear band |
| M 1.0 + O 0.5 | 1.5 | One red-tinted band |
| G 1.0 + M 1.0 | 2.0 | Clear, red |
| G 1.0 + O 0.5 | 1.5 | Clear, smaller clear band (model assumption) |
| Any liquid with itself | 2.0, or 1.0 for O | One band |

## Lab worksheet

Version 1.1.0 removed the on-screen notebook, predictions, debrief, notebook files and printout. Students use the printed lab worksheet for predictions, all three data tables and the debrief questions. The browser walkthrough covers all six station orders and a complete Spanish-to-English route. See the physical lab procedure for the source setup and the worksheet. [English procedure](https://zornscience.org/teaching/physical-labs/molar-mass-trap-imf-lab/) · [Spanish procedure](https://zornscience.org/es/teaching/physical-labs/molar-mass-trap-imf-lab/)

ZornScience | CC BY-NC-SA 4.0
