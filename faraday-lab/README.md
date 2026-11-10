# Faraday’s Law · Magnet Drop

Version: 1.2.3

Version 1.2.3 improves keyboard and screen reader access. Every focusable element, including summaries, text areas and custom controls, now shows the same visible focus ring (`shared/zsa-lab-a11y.css`), a blue ring with a white gap that reads on light and dark panels and in high contrast mode. `tests/e2e/labs-a11y.spec.js` now checks this lab in English and Mexican Spanish with axe-core, the Tab order, a visible focus indicator on every stop, names and states of custom controls, and text alternatives for drawings. The science, scoring and any completion code are unchanged.

Version 1.2.2 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

Version 1.2.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

Static HTML, CSS and Canvas; all assets are local. No accounts, network requests, storage, or student data entry.

Uses the metals-lab header, ZornScience logo, Inter font, Instructions dialog, and sharing controls. No introduction band.

The 1 m tube model integrates dv/dt = g − k(y)v using substeps no larger than 2 ms. k = 34 s⁻¹ for copper, 0.65 s⁻¹ for slotted copper, and zero for plastic, multiplied by relative magnetic moment squared. Entry and exit coupling ramps over 7 cm. The comparison magnet has identical mass and release height, with no magnetic drag. These qualitative coefficients are illustrative. Closed loops above and below the magnet have opposite conventional-current directions. Reversing the poles reverses both current and field directions without reversing braking. A cutaway is purely visual.

Controls: release/repeat, pause/resume, reset, ¼ speed, tube selection, magnetic moment, pole reversal, cutaway, current, induced-field and force overlays. Setting changes reset the drop. No saved measurements.

Version 1.1.0 adds Observe/Explain views, a fixed reference ring with flux/current explanations, deterministic replay scrubbing, exploration prompts, automatic pause when hidden, and a bench-first mobile layout.

## Learning design

Students should explain (1) why a changing flux, rather than just the presence of a magnetic field, induces current; (2) why closed conducting paths matter; (3) why reversing the poles reverses current but preserves upward braking; and (4) how balanced forces permit terminal speed and gravitational energy becomes thermal energy.

Observe starts without overlays to limit simultaneous representations. Explain connects the apparatus to a fixed ring, current direction, induced field and force vectors. Replay freezes simulated time without suggesting that a physically stationary magnet generates a current. Optional prediction prompts encourage controlled comparisons without quizzes, response fields or recorded data. Mobile shows the bench and visualization presets first. Labels, text equivalents and keyboard controls complement the canvas.

Design informed by PhET's research on engaged exploration: https://phet.colorado.edu/publications/prst-per-2010.pdf . The implementation has been checked functionally, not evaluated for learning gains in a classroom.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text uses the activity's `data.js`: instructions, labels, the tube menu and notes, buttons, run states, the replay time and its spoken value, the fixed ring's flux and current explanations, observations, exploration prompts, the canvas labels and the canvas's spoken description, the model note, the title and accessible labels, and the share title, description and status messages. Every sentence is one full template with placeholders, so Spanish keeps its own word order; the goal and the three instruction steps with a bold button name are each rebuilt from one template around the bold words. In Spanish the share link carries `?lang=es`. Symbols, equations, numbers, units, pole letters (N, S) and decimal points stay unchanged. Settings that are not physics quantities avoid velocidad and rapidez (Cámara lenta · ¼ del tiempo real). The language links reload the page, so a drop in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.
