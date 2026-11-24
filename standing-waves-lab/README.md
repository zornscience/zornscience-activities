# Standing Waves on a String

Virtual standing-wave lab. A function generator drives a mechanical vibrator, and a string runs over a pulley to a hanging mass. Students adjust the frequency, drive amplitude, hanging mass, vibrating length and string density, tune the first six harmonics exactly, switch on a synchronized strobe lock with an adjustable phase, label nodes and antinodes, show the motion envelope, track one string point, and measure node spacing with two ruler cursors (λ = 2Δx). Three optional investigations guide finding harmonics, measuring wavelength and changing tension. No student data entry, records, tracking, dependencies or external requests.

The model uses tension T = mg, wave speed v = √(T/μ), harmonics fₙ = nv/(2L) and wavelengths λₙ = 2L/n. Within 0.5% of a resonance a single ideal harmonic gives exactly stationary nodes; away from resonance a lightly damped modal sum gives the forced response. Normal playback is 1/40 of real time, and the generator shows the physical frequency.

Version: 1.2.0

## Lab check (1.2.0)

Open **Lab check** below the apparatus and its readouts, above "About this model", for five questions a student answers while using the lab: Three loops; Wavelength from the nodes; The same speed; More tension; and A heavier cord. It is closed by default and outside the controls. Link straight to it with `?check=1`; it also works with `?lang=es` and `embed=1` (for example `?check=1&lang=es&embed=1`). Without `?check=1` the lab looks as it did, with the oscillator off: the check does nothing to the lab until a student presses "Set up the lab". The question content is built only when the section is opened.

Each question's "Set up the lab" button sets the generator frequency, the hanging mass, the vibrating length and the string density, sets the drive amplitude to 65%, switches the oscillator on, and (for question 2) turns on Label nodes & antinodes, then updates the lab exactly as a control change does. It leaves strobe lock, the measurement cursors and the investigation as they are. The student then reads the Fundamental f₁, Wave speed or Measure the string readouts (question 2 starts with Place cursors on adjacent nodes; question 3 with the 2 harmonic button). A wrong pick shows that choice's own feedback, two misses offer Show me, and Previous, Next and Start over move through the questions. The score is the number right on the first try.

When all five are done, the section shows the score in words ("4 of 5 right on the first try.") and an `STLC` completion code, for example `STLC-0378-SG02-2F0H-F6K` (4 of 5, one Show me). It is registry id 15, setting `Lab check`, slug `standing-waves-lab`, in `../shared/zsa-codes.js`; the teacher checker shows the score and a 0 or 1 for each question. The prefix is `STLC` because `SLC` is the Snell's Law check.

Files: this lab has no `physics.js`, so `lab.js` now keeps its model in one `compute(L, mass, mu, f)` (the same formulas as before; `model()` reads the controls and calls it) and answers a `zsa-sw:request-lab` event on the activity root with `model(setup)` (the lab's model for a setup without touching the controls), `setup({frequency, mass, length, density, nodes})` and `format(v, d)` (two decimals for Hz, m/s and N, three for metres). `data.js` holds the question data and every English sentence with its Mexican Spanish. `labcheck.js` fills every number from `model(setup)`, so the page source does not mark the right choice, then starts the shared runner (`../shared/zsa-labcheck.js`, with `../shared/zsa-codes.js` and `../shared/zsa-labcheck.css`). `values` and `resolve` are exported for Node, so `tests/unit/standing-waves-labcheck.test.js` runs without a page. The mount is `#zsa-sw-check`.

Decisions:
- **Prefix `STLC`, registry id 15**, the next free id after Snell's Law (14).
- **`model(setup)` instead of setting the controls to read them.** The check works out all five questions when the page loads, so it uses the pure model for each setup. Setting the real controls then would switch the oscillator on and leave the lab in question 5's state before the student pressed anything.
- **Strobe lock is left as it is**, so Setup does not override a reduced-motion preference, which starts the lab with strobe lock on.
- **The multiplications show √2**, not 1.41, because 13.05 × 1.41 = 18.40 and 31.32 / 1.41 = 22.21, which are not the readouts (18.46 and 22.15).
- The Spanish is in the `es` table but has not been proofread by a native speaker.

Version 1.2.0 adds the Lab check above. The physics and the investigations are unchanged.

Version 1.1.3 improves keyboard and screen reader access. Section headings are now level 2 (they jumped from the page's heading 1 to level 3), with the same look. The frequency buttons are named with the same "0.1 Hz" they show (speech control users can say what they see), and the ruler cursors show a white and dark ring when focused. Every focusable element, including summaries, text areas and custom controls, now shows the same visible focus ring (`shared/zsa-lab-a11y.css`), a blue ring with a white gap that reads on light and dark panels and in high contrast mode. `tests/e2e/labs-a11y.spec.js` now checks this lab in English and Mexican Spanish with axe-core, the Tab order, a visible focus indicator on every stop, names and states of custom controls, and text alternatives for drawings. The science, scoring and any completion code are unchanged.

Version 1.1.2 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

Version 1.1.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, instructions, labels, buttons, menu options, investigations and their explanations, tuning feedback, run states, readout labels, measurement feedback, SVG labels, the spoken apparatus description, cursor labels and spoken values, title and accessible labels, the model note and the share title, description and status messages use the activity's `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. The two instruction steps with bold text (the Strobe lock button and the formula λ = 2Δx) are rebuilt from one template each around the bold text. Count sentences put the count after a label (Nodos: 4. Antinodos: 3.), so one template is correct for every harmonic. In Spanish the share link carries `?lang=es`. Symbols, equations, numbers, units and decimal points stay unchanged, and settings that are not physics quantities avoid velocidad and rapidez (CÁMARA LENTA · 1/40 DEL TIEMPO REAL). The language links reload the page, so the apparatus starts over. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.

## Changelog

- 1.2.0: Lab check with five questions and an `STLC` completion code (registry id 15), opened with `?check=1`. `lab.js` keeps its model in `compute()` and answers a new `zsa-sw:request-lab` event; new `labcheck.js`; the shared runner loaded on the page.
- 1.1.0: Mexican Spanish with `?lang=es` and the shared EN / ES header links.
