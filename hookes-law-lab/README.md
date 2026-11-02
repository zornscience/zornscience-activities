# Hooke’s Law & Harmonic Motion

A browser-local simulation with an illustrated retort stand, extension spring, slotted brass masses, calibrated ruler and timer. No student data entry or storage.

Three ideal spring constants (10, 20, 30 N/m); 50 g hanger plus 0-500 g slotted masses; ±5 cm displacement. Models mÿ + bẏ + ky = 0 around mg/k using 1 ms velocity Verlet substeps and symmetric damping. Time speed changes simulation time, not physics. Mass, spring or damping changes settle the setup and reset the trace.

Use the controls or drag the hanger. Keyboard: focus hanger, arrow keys displace, Enter/Space release. Native modal instructions and existing ZornScience sharing behavior.

Version 1.2.0. Shared branding and top controls adapted from Metals Lab.

Version: 1.2.0

## Learning design in 1.1.0

Students can determine k from equilibrium force and extension, interpret the slope of F versus extension in meters, measure period from successive peaks, and test mass, amplitude, and damping one variable at a time. Optional investigation prompts ask for predictions before showing hints; there is no worksheet, score, or data entry. The graph switches to motion on release and back to equilibrium force on a setup change. The constant reveal includes unit conversion and a worked ratio.

Force arrows show weight and spring force, with net force in text (including damping). Peak times are interpolated from positive-to-negative velocity crossings; tiny peaks below 0.01 cm are excluded. The graph spans four ideal periods. Forces, units, keyboard access, and the hanger grab offset connect the visual model to measurable quantities. Motion remains off until the student acts; simulation time and real-time speed stay distinct. No introductory band is used.

## Mexican Spanish in 1.2.0

Use `?lang=es` or the EN / ES header links. English is the fallback. All student text uses the activity's `data.js`: the instructions, setup and transport controls, readouts, the bench state, the apparatus and graph labels, both graph titles, axes and descriptions, the measured period and load readouts, the force sentences, the status messages, investigation prompts and hints, the spring constant reveal, the hanger's spoken value, the model note, the page title and the share title, description, status messages and link. Every sentence is one full template with placeholders, so Spanish keeps its own word order; the two instruction steps that name a button in bold are each one template with the bold part marked. In Spanish the share link carries `?lang=es`. Symbols, equations, numbers, units and decimal points stay unchanged. The lab has no CSV export or print summary. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.
