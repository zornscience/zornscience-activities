# The Simple Pendulum
Buildless ZornScience simulation. Open index.html through a static web server.
Adjust mass, pivot-to-center length, release angle, gravity and playback speed. Live energy bars and period predictions; no data recording or storage. An optional Lab check gives a completion code (see below).
Physics: fixed-step RK4 for the full nonlinear pendulum; actual period computed by arithmetic-geometric mean. Zero gravity releases from rest with no motion.

Version: 1.3.0

## Lab check (1.3.0)

Open **Lab check** below the apparatus and above "About this model" for five questions a student answers while using the lab: Four times the length, A heavier bob, Take it to the Moon, A big release angle, and Speed at the bottom. It is closed by default and outside the controls. Link straight to it with `?check=1`; it also works with `?lang=es` and `embed=1` (for example `?check=1&lang=es&embed=1`). The question content is built only when the section opens. The three comparison buttons and free exploration are unchanged.

Each question has **Set up the lab**. It does what Free exploration does (clears any comparison), sets the Length, Bob mass and Release angle sliders and the Gravity menu to the question's starting state, starts the swing from the right (side 1), sets Playback speed to Real time, then runs the lab's own setup, so the readouts, energy bars and clock reset exactly as a slider change does. On a phone, where the apparatus settings are collapsed behind "Adjust apparatus", setup opens them so the sliders can be reached; on a laptop the hidden toggle is left alone. Setup never makes the question's change or presses Release or Step. Previous and Next move freely. A wrong answer shows that choice's feedback and the student tries again. After two wrong tries, Show me marks the right choice and shows the explanation, and the question counts as missed. A right answer shows the explanation. Start over clears every answer. Choices are shuffled each time a question is shown.

When all five are done, the section shows the score in words ("4 of 5 right on the first try.") and a `PLC` completion code, for example `PLC-02R2-SG02-2F0S-9CD` (4 of 5, one Show me). It is registry id 9, setting `Lab check`, slug `pendulum-lab`, in `../shared/zsa-codes.js`; the teacher checker shows the score and a 0 or 1 for each question. Nothing is stored or sent: answers live in memory, and the code is the record.

Files: `physics.js` (new) holds the lab's own `period`, `small` (2π√(L/g)), `energy` and RK4 `integrate`, plus the fixed step `h = 1/240` s and the 12 steps one Step press takes, moved out of `lab.js` unchanged. `lab.js` asks for them with a `zsa-pl:request-physics` event and answers a `zsa-pl:request-lab` event with `setup({L, m, angle, world})` (m in grams), those functions, and `format` (`fixed3` for the periods, energies and bob speed, `fixed1` for the current angle and percents, `clock` for the clock), the formatters its readouts use. `data.js` holds the question data and every English sentence with its Mexican Spanish. `labcheck.js` fills every number from those functions and formatters, so the page source holds no answer. For question 5 it reproduces Step exactly: 10 presses of 12 RK4 steps of 1/240 s from rest at +40°. It then calls the shared runner (`../shared/zsa-labcheck.js`, `../shared/zsa-labcheck.css`) with `activity: "PLC"`.

Decisions: question 4's percent is worked out from the two periods as the lab shows them (2.307 s and 2.198 s), as a student would. The "about 50%" distractor is that displayed percent times 10 (5.0 × 10 = 50). Question 5's explanation gives v = √(2gh) to two decimals (2.03 m/s), as the brief writes it; that is the one number not shown by a lab readout. Every value matched the brief. The current angle readout after 10 Steps shows `-1.2°` with a plain hyphen, because the lab formats it with `toFixed(1)`; the brief writes −1.2° with a minus sign. The lab's formatting is unchanged.

Version 1.2.4 improves keyboard and screen reader access. The drawn bob, which can only be dragged, is hidden from assistive technology; the Release angle slider is the keyboard and screen reader control for the same angle. Every focusable element, including summaries, text areas and custom controls, now shows the same visible focus ring (`shared/zsa-lab-a11y.css`), a blue ring with a white gap that reads on light and dark panels and in high contrast mode. `tests/e2e/labs-a11y.spec.js` now checks this lab in English and Mexican Spanish with axe-core, the Tab order, a visible focus indicator on every stop, names and states of custom controls, and text alternatives for drawings. The science, scoring and any completion code are unchanged.

Version 1.2.3 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

Version 1.2.2 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

Learning goals: identify the effects of mass, length and gravity on period; distinguish a half swing from a complete oscillation; explain kinetic/potential energy transfer and conservation.

One-variable comparisons use a dashed reference pendulum (0.60 m, 100 g, Earth, 15 degrees) and a changed brass pendulum released together. Predictions precede explanations. Energy bars retain a common scale across each comparison; no student responses or data are recorded. Free exploration clears the reference.

Accessibility: keyboard sliders with units, paused step control, motion only on request, pause when hidden, no live announcements of frame-by-frame readouts, mobile settings disclosure.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, the instructions, comparison buttons and predictions, slider labels, gravity and playback options, SVG labels and description, energy cues, status messages, cycle progress, readouts, the explanation, the model note, accessible labels and the share title, description, status and link use the activity's `data.js`. Every sentence is one full template with placeholders, so Spanish keeps its own word order. In Spanish the share link carries `?lang=es`. Symbols, numbers, units and decimal points stay unchanged. Speed is rapidez (the bob speed readout), never velocidad. The language links reload the page, so a swing in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.

In 1.2.1 the Spanish instructions heading is a noun phrase, Exploración de las oscilaciones y la energía, following the Style Kit's title rule.
