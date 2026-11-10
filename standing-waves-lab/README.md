# Standing Waves on a String - v1.1.0

Virtual standing-wave lab. A function generator drives a mechanical vibrator, and a string runs over a pulley to a hanging mass. Students adjust the frequency, drive amplitude, hanging mass, vibrating length and string density, tune the first six harmonics exactly, switch on a synchronized strobe lock with an adjustable phase, label nodes and antinodes, show the motion envelope, track one string point, and measure node spacing with two ruler cursors (λ = 2Δx). Three optional investigations guide finding harmonics, measuring wavelength and changing tension. No student data entry, records, tracking, dependencies or external requests.

The model uses tension T = mg, wave speed v = √(T/μ), harmonics fₙ = nv/(2L) and wavelengths λₙ = 2L/n. Within 0.5% of a resonance a single ideal harmonic gives exactly stationary nodes; away from resonance a lightly damped modal sum gives the forced response. Normal playback is 1/40 of real time, and the generator shows the physical frequency.

Version: 1.1.3

Version 1.1.3 improves keyboard and screen reader access. Section headings are now level 2 (they jumped from the page's heading 1 to level 3), with the same look. The frequency buttons are named with the same "0.1 Hz" they show (speech control users can say what they see), and the ruler cursors show a white and dark ring when focused. Every focusable element, including summaries, text areas and custom controls, now shows the same visible focus ring (`shared/zsa-lab-a11y.css`), a blue ring with a white gap that reads on light and dark panels and in high contrast mode. `tests/e2e/labs-a11y.spec.js` now checks this lab in English and Mexican Spanish with axe-core, the Tab order, a visible focus indicator on every stop, names and states of custom controls, and text alternatives for drawings. The science, scoring and any completion code are unchanged.

Version 1.1.2 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

Version 1.1.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, instructions, labels, buttons, menu options, investigations and their explanations, tuning feedback, run states, readout labels, measurement feedback, SVG labels, the spoken apparatus description, cursor labels and spoken values, title and accessible labels, the model note and the share title, description and status messages use the activity's `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. The two instruction steps with bold text (the Strobe lock button and the formula λ = 2Δx) are rebuilt from one template each around the bold text. Count sentences put the count after a label (Nodos: 4. Antinodos: 3.), so one template is correct for every harmonic. In Spanish the share link carries `?lang=es`. Symbols, equations, numbers, units and decimal points stay unchanged, and settings that are not physics quantities avoid velocidad and rapidez (CÁMARA LENTA · 1/40 DEL TIEMPO REAL). The language links reload the page, so the apparatus starts over. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.

## Changelog

- 1.1.0: Mexican Spanish with `?lang=es` and the shared EN / ES header links.
