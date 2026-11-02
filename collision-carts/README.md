# Collision Carts
Version: 1.1.0

Ideal one-dimensional two-cart simulation. Adjustable total masses and signed initial velocities; elastic magnetic bumpers or perfectly inelastic hook-and-loop coupling. Live velocity and momentum overlays, pause, frame stepping, slow motion, four presets, instructions and sharing. No student data recording or storage.

Physics uses exact event timing for collisions and pauses before end stops. Vector scales are separate (velocity 58 SVG units per m/s; momentum 65 per kg·m/s). Collision response is instantaneous. Real rolling resistance and bumper energy losses are omitted.

Validation: `tests/unit/collision-carts.test.js` runs 2,000 randomized collisions (momentum conserved in both modes, kinetic energy conserved in elastic mode and never gained in inelastic mode) and checks the exact event timing; `tests/e2e/collision-carts.spec.js` runs the page in Chromium (launch, step, collision, vectors, presets, the end-stop pause, reset). Shared ZornScience assets remain unchanged.

House rules: every script is a strict IIFE with no globals. `physics.js` answers a `zsa-cc:request-physics` event on the activity root (and is `module.exports` in Node), and `lab.js` draws the carts and vectors with `createElementNS`, never HTML strings.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, the setup labels and menus, the track labels and cart plates in the drawing, the phase line, transport buttons, readout labels, observations, the instructions, the physics note, the title and description, accessible labels, and the share title, description, status messages and link use the activity's `data.js`, and every dynamic sentence is one full template with placeholders, so Spanish keeps its own word order. In Spanish the share link carries `?lang=es`, and the cart plates are wider to fit CARRITO A and CARRITO B. Symbols (vA, pB, p = mv), numbers, units and decimal points stay unchanged. Spanish uses cantidad de movimiento for momentum and keeps velocidad (signed) separate from rapidez. The language links reload the page, so a run in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.

## Changelog
1.1.0: Mexican Spanish with `?lang=es` and the shared EN / ES links. English text, drawing and behavior are unchanged.

1.0.2: Brought up to the house rules with no visible change: `physics.js` no longer sets a global, and `lab.js` builds the drawing with DOM calls instead of `innerHTML` (the drawing, readouts and screenshots were compared at eight moments and are identical). Added a Version line, and unit and browser tests.

1.0.1: First published version.
