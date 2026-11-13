# The Atwood Machine - v1.1.0

Ideal Newton's second-law simulation. Two adjustable 50-500 g total masses (including 50 g hangers), realistic SVG brass weights, support stand, string, rotating pulley, travel ruler, signed acceleration and driving force, tension and speed. Mass swaps, equal masses, fixed-total 25 g transfer, pause/resume, reset, slow motion, optional acceleration and force arrows. Instructions and sharing use the Metals Lab header pattern. Shared local fonts, logo and embed support. No student data entry, records, tracking, dependencies or external requests.

Mass changes reset the system. Free motion uses a=(m2-m1)g/(m1+m2), T=2m1m2g/(m1+m2), x=at²/2, g=9.81 m/s². Ends at ±0.6 m from the starting position, without modeling impact forces; free-motion arrows and numeric readouts clear then. All controls support keyboard operation, and the SVG description reflects the mass configuration.

The simulation itself records nothing. The optional Lab check below the apparatus gives a completion code (see below). Arrow colors: mint acceleration, gold gravity, blue tension, each also labeled. The SVG equipment is illustrative, with enlarged hanger geometry.

Version: 1.2.0

## Lab check (1.2.0)

Open **Lab check** below the apparatus, after the bench card and before "About the ideal model", for five questions a student answers while using the lab: Double the difference, Add mass to both sides, Tension in the string, Equal masses, and Time the fall. It is closed by default and outside the controls. Link straight to it with `?check=1`; it also works with `?lang=es` and `embed=1` (for example `?check=1&lang=es&embed=1`). The question content is built only when the section opens.

Each question has **Set up the lab**, which puts both hangers at the question's starting masses and does what a slider change does: time 0, not running, readouts and the Transfer button updated. It also sets Playback speed to Real time, turns Acceleration arrows on and turns Gravity and tension arrows off (question 3 asks the student to turn them on). It never makes the question's change: the student presses Transfer, moves the sliders, presses Equal masses or Release masses. Previous and Next move freely. A wrong answer shows that choice's feedback and the student tries again. After two wrong tries, Show me marks the right choice and shows the explanation, and the question counts as missed. A right answer shows the explanation. Start over clears every answer. Choices are shuffled each time a question is shown.

When all five are done, the section shows the score in words ("4 of 5 right on the first try.") and an `ALC` completion code, for example `ALC-03EV-SG02-2F0H-8A9` (4 of 5, one Show me). It is registry id 8, setting `Lab check`, slug `atwood-machine`, in `../shared/zsa-codes.js`; the teacher checker shows the score and a 0 or 1 for each question. Nothing is stored or sent: answers live in memory, and the code is the record.

Files: `data.js` holds the question data and every English sentence with its Mexican Spanish. `lab.js` answers a `zsa-at:request-lab` event on the activity root with `setup({m1, m2})`, `physics` (the `AtwoodPhysics` model) and `format` (`fixed3`, the acceleration, force, tension and speed readouts, and `clock`, the clock), the same formatters its readouts use. `labcheck.js` fills every number in the question data from `physics.system()` and those formatters, so the page source holds no answer, then calls the shared runner (`../shared/zsa-labcheck.js`, `../shared/zsa-labcheck.css`, see "Reusable lab checks" in `../shared/README.md`) with `activity: "ALC"`.

Decisions: the hanger weights in question 3 (1.47 N and 3.92 N) and in question 4's explanation are shown to 3 significant figures, as the brief asks; no lab readout shows a weight, so `labcheck.js` formats them with `toPrecision(3)`. Weights and free-fall g come from the model itself (`system(0, m)`), not from a second copy of 9.81. The 1.2 m scale in question 5's distractor is twice `physics.limit`. Every value matched the brief.

Version 1.1.3 improves keyboard and screen reader access. Section headings are now level 2 (they jumped from the page's heading 1 to level 3), with the same look. Every focusable element, including summaries, text areas and custom controls, now shows the same visible focus ring (`shared/zsa-lab-a11y.css`), a blue ring with a white gap that reads on light and dark panels and in high contrast mode. `tests/e2e/labs-a11y.spec.js` now checks this lab in English and Mexican Spanish with axe-core, the Tab order, a visible focus indicator on every stop, names and states of custom controls, and text alternatives for drawings. The science, scoring and any completion code are unchanged.

Version 1.1.2 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

Version 1.1.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

Version 1.0.2 removes the introductory banner so the simulation follows the header directly.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, instructions, labels, buttons, the playback menu, readout labels, run states, direction and explanation messages, SVG labels, the spoken apparatus description, title and accessible labels, the model note and the share title, description and status messages use the activity's `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. The instruction step that names the Release button is rebuilt from one template around the bold button name. In Spanish the share link carries `?lang=es`. Symbols, equations, numbers, units and decimal points stay unchanged. The language links reload the page, so a run in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.
