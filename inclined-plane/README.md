# Inclined Plane & Friction

Version: 1.2.0

## Lab check (1.2.0)

Open **Lab check** below the ramp, its readings and legend, above "Explore the physics", for five questions a student answers while using the lab: Tilt the ramp; Friction at rest; Change the surface; Add mass to a sliding block; and Find the friction coefficient. It is closed by default and outside the controls. Link straight to it with `?check=1`; it also works with `?lang=es` and `embed=1` (for example `?check=1&lang=es&embed=1`). The question content is built only when the section opens. The controls, arrows, readings and physics are unchanged.

Each question's "Set up the lab" button sets the Ramp angle, the Contact surface, the Block + added mass and Slow motion, leaves Show force arrows and Resolve gravity on, clears a Pause the student left on, and resets the block exactly as a slider change does (the block returns to the top and the readouts, arrows and clock reset). It never makes the change the question asks for: the student moves the slider, changes the surface or presses the button. Slow motion is on only for question 4. A wrong pick shows that choice's own feedback, which never gives away the answer, two misses offer Show me, and Previous, Next and Start over work as in the other lab checks. Nothing is stored or sent.

When all five are done, the section shows the score in words ("4 of 5 right on the first try.") and an `ILC` completion code, for example `ILC-0378-SG02-2F0H-B0Q` (4 of 5, one Show me). It is registry id 11, setting `Lab check`, slug `inclined-plane`, in `../shared/zsa-codes.js`; the teacher checker shows the score and a 0 or 1 for each question.

Files: `lab.js` answers a `zsa-ip:request-lab` event on the activity root with `setup({angle, surface, mass, slow})`, `surfaces` (the lab's own static and kinetic coefficient table), `g` (9.81) and `format` (the readout formatters `fixed2` for forces and accelerations and `fixed1` for the angle). `data.js` holds the question data and every English sentence with its Mexican Spanish. `labcheck.js` fills every number from the formulas the lab uses (weight = mg, N = mg cos θ, downhill component = mg sin θ, static friction = mg sin θ while at rest, kinetic friction = μₖN, sliding acceleration = g(sin θ − μₖ cos θ)) and those formatters, so the page source marks no right choice and no coefficient is copied. It then calls the shared runner (`../shared/zsa-labcheck.js`, `../shared/zsa-labcheck.css`) with `activity: "ILC"`.

Decisions: the questions that need a sliding block say to read the acceleration while it slides, and the setup turns Slow motion on, so the end stop (which sets the acceleration to 0.00 m/s² and hides the arrows) is unchanged. Question 5 says "first slips" because the slider moves in 0.1° steps: on felt, 33.0° holds and 33.1° slides, and the adapter finds that angle with the lab's own slip test. The prefix is `ILC` (the lab's initial plus LC); it is not the start of any other prefix. The Spanish keeps the lab's words (plano inclinado, fricción estática, fricción cinética, fuerza normal, peso, rapidez).

1.2.0: Optional Lab check (five questions, `?check=1`) with an ILC completion code (registry id 11). The physics, controls and layout are unchanged; `lab.js` only adds the `zsa-ip:request-lab` event the check uses, a `G` constant and the `fixed2` and `fixed1` readout formatters, with the same output as before.

Version 1.1.3 improves keyboard and screen reader access. Section headings are now level 2 (they jumped from the page's heading 1 to level 3), with the same look. Every focusable element, including summaries, text areas and custom controls, now shows the same visible focus ring (`shared/zsa-lab-a11y.css`), a blue ring with a white gap that reads on light and dark panels and in high contrast mode. `tests/e2e/labs-a11y.spec.js` now checks this lab in English and Mexican Spanish with axe-core, the Tab order, a visible focus indicator on every stop, names and states of custom controls, and text alternatives for drawings. The science, scoring and any completion code are unchanged.

Version 1.1.2 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

Version 1.1.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

 Buildless, browser-local ramp simulation. Open index.html through a static server. Uses the shared ZornScience font, branding and embed behavior. No storage or data recording.

Illustrative dry-friction pairs (static, kinetic): wood (.45, .30), felt (.65, .48), plastic (.25, .16). Fixed 1.20 m travel and g = 9.81 m/s². Setup changes reset motion; pause freezes time; slow motion runs at quarter speed. Static friction matches downhill weight up to its maximum. Sliding uses a = g(sin θ − μₖ cos θ). The end stop terminates motion and hides the FBD. Gravity components are dashed and are not extra forces.

## Mexican Spanish

Use `?lang=es` or the EN / ES header links. English is the fallback. All student text, the instructions, controls and surface names, the state badge, explanations and readout labels, the legend, SVG title, description and labels, the physics note, the footer, accessible labels, and the share title, description, status messages and link use the activity's `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. In Spanish the share link carries `?lang=es`. Symbols (N, mg, fₛ, fₖ, μₛ, μₖ, θ), numeric values, units and decimal points stay unchanged. The language links reload the page, so a run in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.
