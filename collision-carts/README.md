# Collision Carts
Version: 1.2.0

## Lab check (1.2.0)

Open **Lab check** below the track and its readouts, above "Physics behind the simulation", for five questions a student answers while using the lab: Equal masses, one at rest; Carts that stick; Heavy cart meets light cart; Head-on, equal and opposite; and Predict, then launch. It is closed by default and outside the controls. Link straight to it with `?check=1`; it also works with `?lang=es` and `embed=1` (for example `?check=1&lang=es&embed=1`). The question content is built only when the section opens. The setup controls, vectors and readouts are unchanged.

Each question's "Set up the lab" button sets the Bumper type, both Total mass sliders and both Starting velocity sliders, turns Playback to 1x, leaves Show vectors on Velocity only, and resets the track exactly as a slider change does. It never launches the carts: the student presses Launch and reads the readouts after the collision (the phase line starts with AFTER COLLISION). The Try a setup menu is left alone. A wrong pick shows that choice's own feedback, two misses offer Show me, and Previous, Next and Start over work as in the other lab checks. Nothing is stored or sent.

When all five are done, the section shows the score in words ("4 of 5 right on the first try.") and a `CLC` completion code, for example `CLC-02R2-SG02-2F0H-CRZ` (4 of 5, one Show me). It is registry id 12, setting `Lab check`, slug `collision-carts`, in `../shared/zsa-codes.js`; the teacher checker shows the score and a 0 or 1 for each question. Id 11 is reserved for the Inclined Plane lab check (`ILC`), which is not built yet.

Files: `lab.js` answers a `zsa-cc:request-lab` event on the activity root with `setup({mode, mass, velocity})` (mode is the Bumper type option value, mass the two Total mass values in kg, velocity the two Starting velocity values in m/s) and `format`, the lab's own readout formatter `fmt(v, d)`. `data.js` holds the question data and every English sentence with its Mexican Spanish. `labcheck.js` reads `collide()` from `physics.js` (through `zsa-cc:request-physics`) and fills every number from it and the readout formatter, so the page source marks no right choice and no formula is copied. It then calls the shared runner (`../shared/zsa-labcheck.js`, `../shared/zsa-labcheck.css`) with `activity: "CLC"`.

Decisions: the questions ask for the readout after the collision, which the lab keeps on screen even when the run pauses before an end stop, so the end-stop behavior is unchanged. The Spanish keeps the lab's own words (cantidad de movimiento, colisión, parachoques magnéticos), not momento or choque. The prefix is `CLC` (the lab's initials plus LC); it is not the start of any other prefix.

Version 1.1.3 improves keyboard and screen reader access. The small step labels are slightly darker to reach 4.5:1 contrast. Every focusable element, including summaries, text areas and custom controls, now shows the same visible focus ring (`shared/zsa-lab-a11y.css`), a blue ring with a white gap that reads on light and dark panels and in high contrast mode. `tests/e2e/labs-a11y.spec.js` now checks this lab in English and Mexican Spanish with axe-core, the Tab order, a visible focus indicator on every stop, names and states of custom controls, and text alternatives for drawings. The science, scoring and any completion code are unchanged.

Version 1.1.2 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

Version 1.1.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

Ideal one-dimensional two-cart simulation. Adjustable total masses and signed initial velocities; elastic magnetic bumpers or perfectly inelastic hook-and-loop coupling. Live velocity and momentum overlays, pause, frame stepping, slow motion, four presets, instructions and sharing. No student data recording or storage.

Physics uses exact event timing for collisions and pauses before end stops. Vector scales are separate (velocity 58 SVG units per m/s; momentum 65 per kg·m/s). Collision response is instantaneous. Real rolling resistance and bumper energy losses are omitted.

Validation: `tests/unit/collision-carts.test.js` runs 2,000 randomized collisions (momentum conserved in both modes, kinetic energy conserved in elastic mode and never gained in inelastic mode) and checks the exact event timing; `tests/e2e/collision-carts.spec.js` runs the page in Chromium (launch, step, collision, vectors, presets, the end-stop pause, reset). Shared ZornScience assets remain unchanged.

House rules: every script is a strict IIFE with no globals. `physics.js` answers a `zsa-cc:request-physics` event on the activity root (and is `module.exports` in Node), and `lab.js` draws the carts and vectors with `createElementNS`, never HTML strings.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, the setup labels and menus, the track labels and cart plates in the drawing, the phase line, transport buttons, readout labels, observations, the instructions, the physics note, the title and description, accessible labels, and the share title, description, status messages and link use the activity's `data.js`, and every dynamic sentence is one full template with placeholders, so Spanish keeps its own word order. In Spanish the share link carries `?lang=es`, and the cart plates are wider to fit CARRITO A and CARRITO B. Symbols (vA, pB, p = mv), numbers, units and decimal points stay unchanged. Spanish uses cantidad de movimiento for momentum and keeps velocidad (signed) separate from rapidez. The language links reload the page, so a run in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.

## Changelog
1.2.0: Optional Lab check (five questions, `?check=1`) with a CLC completion code (registry id 12). The lab's readouts, physics and layout are unchanged; `lab.js` only adds the `zsa-cc:request-lab` event the check uses.

1.1.0: Mexican Spanish with `?lang=es` and the shared EN / ES links. English text, drawing and behavior are unchanged.

1.0.2: Brought up to the house rules with no visible change: `physics.js` no longer sets a global, and `lab.js` builds the drawing with DOM calls instead of `innerHTML` (the drawing, readouts and screenshots were compared at eight moments and are identical). Added a Version line, and unit and browser tests.

1.0.1: First published version.
