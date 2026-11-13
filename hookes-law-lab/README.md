# Hooke’s Law & Harmonic Motion

A browser-local simulation with an illustrated retort stand, extension spring, slotted brass masses, calibrated ruler and timer. No student data entry or storage. An optional Lab check gives a completion code (see below).

Three ideal spring constants (10, 20, 30 N/m); 50 g hanger plus 0-500 g slotted masses; ±5 cm displacement. Models mÿ + bẏ + ky = 0 around mg/k using 1 ms velocity Verlet substeps and symmetric damping. Time speed changes simulation time, not physics. Mass, spring or damping changes settle the setup and reset the trace.

Use the controls or drag the hanger. Keyboard: focus hanger, arrow keys displace, Enter/Space release. Native modal instructions and existing ZornScience sharing behavior.

Version 1.2.0. Shared branding and top controls adapted from Metals Lab.

Version: 1.3.0

## Lab check (1.3.0)

Open **Lab check** below the workspace and above "Physics behind the bench" for five questions a student answers while using the lab: A stiffer spring, Double the weight, Mass and period, A bigger pull, and Net force on the mass. It is closed by default and outside the controls. Link straight to it with `?check=1`; it also works with `?lang=es` and `embed=1` (for example `?check=1&lang=es&embed=1`). The question content is built only when the section opens. The Investigate menu, both graphs and the Show spring constant box are unchanged.

Each question has **Set up the lab**. It sets the Spring menu, the Slotted masses slider, the Release displacement slider and the Damping menu to the question's starting state, sets Time speed to 1×, sets Show forces as the question needs (off for all five), unchecks and hides Show spring constant, then runs the lab's own `configure()` and `amp()`, so the readouts, graph and status reset exactly as a control change does, with the mass at rest at equilibrium. Setup never makes the question's change or presses Pull & release. Previous and Next move freely. A wrong answer shows that choice's feedback and the student tries again. After two wrong tries, Show me marks the right choice and shows the explanation, and the question counts as missed. A right answer shows the explanation. Start over clears every answer. Choices are shuffled each time a question is shown.

When all five are done, the section shows the score in words ("4 of 5 right on the first try.") and an `HLC` completion code, for example `HLC-0378-SG02-2F0S-AGV` (4 of 5, one Show me). It is registry id 10, setting `Lab check`, slug `hookes-law-lab`, in `../shared/zsa-codes.js`; the teacher checker shows the score and a 0 or 1 for each question. Nothing is stored or sent: answers live in memory, and the code is the record.

Files: `lab.js` answers a `zsa-hl:request-lab` event on the activity root with `setup({k, added, amplitude, damping, forces})` (k is the Spring option value, added the slotted masses in grams, amplitude in cm) and `format` (`fixed2` for the extension in cm, `fixed3` for periods and forces), the formatters its readouts now use. `data.js` holds the question data and every English sentence with its Mexican Spanish. `labcheck.js` fills every number from the lab's own formulas (g = 9.81 m/s², a 50 g hanger, extension mg/k, ideal period 2π√(m/k), spring force mg + ky, net force ky toward equilibrium with no damping) and those formatters, so the page source holds no answer. It then calls the shared runner (`../shared/zsa-labcheck.js`, `../shared/zsa-labcheck.css`) with `activity: "HLC"`.

Decisions: question 5's setup gives no release displacement, so it keeps the lab's default of 4.0 cm; the question never releases. Question 3's title, "Mass and period", is also an Investigate menu option, so its Spanish is the menu's existing "Masa y periodo". The answers to questions 3 and 4 are the ideal period; the browser tests release at 1× and read the lab's measured period (from successive peaks) to confirm it shows the same value. Every value matched the brief.

Rounding note (not changed here): the lab rounds an extension of 14.715 cm to "14.71 cm" (`toFixed(2)` on a binary value just below 14.715) but shows the same extension as "0.1472 m". Question 2 uses the cm readout, as the brief says.


Version 1.2.3 improves keyboard and screen reader access. Section headings are now level 2 (they jumped from the page's heading 1 to level 3), with the same look. The footer text is darker to reach 4.5:1 contrast. Every focusable element, including summaries, text areas and custom controls, now shows the same visible focus ring (`shared/zsa-lab-a11y.css`), a blue ring with a white gap that reads on light and dark panels and in high contrast mode. `tests/e2e/labs-a11y.spec.js` now checks this lab in English and Mexican Spanish with axe-core, the Tab order, a visible focus indicator on every stop, names and states of custom controls, and text alternatives for drawings. The science, scoring and any completion code are unchanged.

Version 1.2.2 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

Version 1.2.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

## Learning design in 1.1.0

Students can determine k from equilibrium force and extension, interpret the slope of F versus extension in meters, measure period from successive peaks, and test mass, amplitude, and damping one variable at a time. Optional investigation prompts ask for predictions before showing hints; there is no worksheet, score, or data entry. The graph switches to motion on release and back to equilibrium force on a setup change. The constant reveal includes unit conversion and a worked ratio.

Force arrows show weight and spring force, with net force in text (including damping). Peak times are interpolated from positive-to-negative velocity crossings; tiny peaks below 0.01 cm are excluded. The graph spans four ideal periods. Forces, units, keyboard access, and the hanger grab offset connect the visual model to measurable quantities. Motion remains off until the student acts; simulation time and real-time speed stay distinct. No introductory band is used.

## Mexican Spanish in 1.2.0

Use `?lang=es` or the EN / ES header links. English is the fallback. All student text uses the activity's `data.js`: the instructions, setup and transport controls, readouts, the bench state, the apparatus and graph labels, both graph titles, axes and descriptions, the measured period and load readouts, the force sentences, the status messages, investigation prompts and hints, the spring constant reveal, the hanger's spoken value, the model note, the page title and the share title, description, status messages and link. Every sentence is one full template with placeholders, so Spanish keeps its own word order; the two instruction steps that name a button in bold are each one template with the bold part marked. In Spanish the share link carries `?lang=es`. Symbols, equations, numbers, units and decimal points stay unchanged. The lab has no CSV export or print summary. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.
