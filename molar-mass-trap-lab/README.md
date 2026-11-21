# The Molar Mass Trap Lab

Version: 0.1.1

A virtual investigation for Chemistry and Honors Chemistry Unit 4. This development build has the full wax-paper procedure and previews of the steel shot race and mixing rack.

## Run the bench

From the repository root, run `npm run serve` and open `http://127.0.0.1:8000/molar-mass-trap-lab/`. Add `?lang=es` for Mexican Spanish. The notebook holds editable measurements, shape choices and notes until the page is reloaded or closed. **Print notebook** sends the current entries to the browser's print or PDF dialog. **Reset sample** clears the selected wax-paper portion. **Start fresh** clears all portions and notebook entries after confirmation.

## Measurement model

Each box receives three drops of about 0.05 mL in one spot. The third landing starts a 30 s settling clock. The clock continues during station changes. The top and side views show the same spherical cap and use the same scale as the ruler. A tall cap can bulge wider above the wax than at its contact line. The ruler has 1 mm marks and its zero moves in 0.5 mm increments by drag or with the slider. **Read edges** reads the two edges relative to zero and gives the approximate side-view height.

These are the uncalibrated example dimensions at 0.15 mL. The initial width uses 93% of the settled width at the same volume, with the diameter of a sphere as the lower limit. Class measurements taken from above can replace the diameter inputs in `model.js`.

| Liquid | Settled diameter (mm) | Side-view height (mm) |
| --- | ---: | ---: |
| W, water | 10 | 3.33 |
| G, glycerin | 12 | 2.51 |
| O, 1-octanol | 20 | 0.95 |
| M, mineral oil | 22 | 0.79 |

The two preview stations have separate state for each sealed tube and each mixing tube. The shot notebook supports additional trials and separates the student's mean from the computed result or bound. The mixing notebook has per-tube layer and dye observations. The 0.5 s reporting threshold and mixing recipes come from the physical procedure. Shot travel times will be set in the shot milestone.

The public catalog listing and SEO entries belong to the release candidate, after the full classroom walkthrough in the handoff. See the physical lab procedure for the source setup. [English procedure](https://zornscience.org/teaching/physical-labs/molar-mass-trap-imf-lab/) · [Spanish procedure](https://zornscience.org/es/teaching/physical-labs/molar-mass-trap-imf-lab/)

ZornScience | CC BY-NC-SA 4.0
