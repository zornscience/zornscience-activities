# The Simple Pendulum
Buildless ZornScience simulation. Open index.html through a static web server.
Adjust mass, pivot-to-center length, release angle, gravity and playback speed. Live energy bars and period predictions; no data recording or storage.
Physics: fixed-step RK4 for the full nonlinear pendulum; actual period computed by arithmetic-geometric mean. Zero gravity releases from rest with no motion.

Version: 1.2.0

Learning goals: identify the effects of mass, length and gravity on period; distinguish a half swing from a complete oscillation; explain kinetic/potential energy transfer and conservation.

One-variable comparisons use a dashed reference pendulum (0.60 m, 100 g, Earth, 15 degrees) and a changed brass pendulum released together. Predictions precede explanations. Energy bars retain a common scale across each comparison; no student responses or data are recorded. Free exploration clears the reference.

Accessibility: keyboard sliders with units, paused step control, motion only on request, pause when hidden, no live announcements of frame-by-frame readouts, mobile settings disclosure.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, the instructions, comparison buttons and predictions, slider labels, gravity and playback options, SVG labels and description, energy cues, status messages, cycle progress, readouts, the explanation, the model note, accessible labels and the share title, description, status and link use the activity's `data.js`. Every sentence is one full template with placeholders, so Spanish keeps its own word order. In Spanish the share link carries `?lang=es`. Symbols, numbers, units and decimal points stay unchanged. Speed is rapidez (the bob speed readout), never velocidad. The language links reload the page, so a swing in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.
