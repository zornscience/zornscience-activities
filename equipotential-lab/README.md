# Equipotential & Electric Field Mapping

Version: 1.2.0

An offline-capable, buildless point-charge sandbox with ZornScience branding. Open `index.html` through a static server. Published at https://activities.zornscience.org/equipotential-lab/.

Drag up to twelve signed charges, move the virtual voltmeter probe, change charge magnitude, select presets, and toggle equipotentials, field vectors, and a potential color map. Keyboard arrow keys move focused charges and probe; Shift increases the step. Delete removes a focused charge. No student observations or data are collected or stored. Share links open a fresh lab.

`model.js` computes the three-dimensional Coulomb potential and field in a plane, with charge in nC and position in cm. The meter reference is infinity. Readouts are suppressed within 1.2 cm of point charges. This is not a numerical solution of finite conductive paper with fixed-voltage electrodes. Contours use triangular interpolation on a 0.4 cm mesh. The field arrow length scale is compressed, and color intensity is clamped for readability.

`lab.js` handles rendering and interaction. `instructions.js` and `share.js` preserve the reference Metals Lab header behavior. Styling is local; shared resources are unchanged.

Version 1.1.0 adds optional predict, explore, reveal sequences targeting distance scaling, equipotential geometry and zero-potential versus zero-field misconceptions. Each sequence resets a known configuration and hides visual explanations until requested. Editing the charge arrangement returns to free exploration. A live dashed contour passes through the probe's current voltage; a gold local field arrow indicates the direction of decreasing potential. Neither overlay records measurements. Field-map caching avoids recalculating the entire contour map during ordinary probe movement. Larger targets, tap placement, keyboard controls, text readouts and optional layers support accessible exploration.

## Mexican Spanish

Version 1.2.0 adds Mexican Spanish. Use `?lang=es` or the shared EN / ES header links; English is the fallback. All student text, the instructions, the four explorations and their explanations, control labels, voltmeter and field readouts, spoken labels for the charges and the probe, status messages, the model note and the share title, description and status messages come from `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. The opening instruction, which holds a bold section name, is rebuilt in Spanish from one template around that name. In Spanish the share link carries `?lang=es`. Symbols, formulas, units, numbers and decimal points stay unchanged, and the meter markings (V DC, COM, V Ω, OL) stay as printed on a real meter. The language links reload the page, so a charge arrangement starts over. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.
