# Iodine Clock Lab · v1.0.1

Self-contained simulation of the supplied U8.A1 Summative Lab Iodine Clock handout. Uses existing shared ZornScience branding, local font, logo, embed support, and a copy of the equilibrium lab's share behavior. No student data entry, storage, accounts, network requests, export, or completion codes.

## Investigations

- Concentration: 2.0, 4.0, and 8.0 mL stock presets, plus 1.0-12.0 mL in 0.1 mL increments. DI water keeps Solution A at 16.0 mL.
- Temperature: 4.0 mL stock + 12.0 mL water (0.025 M Solution A); condition A at 5, 22, or 45 °C. Bath conditioning is accelerated.
- Challenge: find a recipe with a blue endpoint at 20.0 ± 1.0 simulated seconds.

Students measure stock, add water, condition A when applicable, and add 6.4 mL of Solution B. The stopwatch begins at first contact during pouring, includes pouring time, and stops at the endpoint. Pause and 4× playback do not change the target simulated time. New trial and mode changes cancel in-flight animations. Hidden tabs pause an already-running reaction. Reduced-motion users get shortened preparation and no glassware movement.

## Scientific limits

The handout supplies reagent stocks and volumes but no experimental clock times or exact Solution B recipe. This activity therefore uses an explicitly illustrative model, not empirical calibration. At 22 °C, 4.0 mL of stock produces a 32 s delay; delay varies inversely with iodate concentration and follows an Arrhenius factor with Ea = 45 kJ/mol. Solution B starts at 22 °C. Equal heat capacities and densities give an initial volume-weighted mixed temperature; no heat exchange is modeled after mixing. Handout concentration is for Solution A before addition of B; final mixture concentration is smaller by 16/22.4. The displayed thermometer follows Solution A during conditioning and the mixture after mixing; the Solution A metric retains the pre-mixing value.

The 2% starch and 0.20 M sodium metabisulfite in the handout describe stocks used for Solution B, not asserted final concentrations. Blue indicates iodine persisting after bisulfite depletion and complexing with starch. No fabricated measured data are represented as real observations.

## Files

`index.html`, `lab.css`, `lab.js`, `model.js`, and `share.js`. Reuses `../shared/zsa-base.css`, `../shared/zsa-embed.js`, and the equilibrium lab header stylesheet. No shared files are changed. Deploy by committing the activity folder and homepage link to the existing GitHub Pages `main` branch.

Version: 1.0.2
