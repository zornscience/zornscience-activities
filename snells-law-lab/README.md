# Snell’s Law & Refraction
Version: 1.2.0

## Lab check (1.2.0)

Open **Lab check** below the optical bench and its readings, above "The physics behind the bench", for five questions a student answers while using the lab: Air into glass; Diamond bends the most; Matching indices; Critical angle, glass to air; and Glass in water. It is closed by default and outside the controls. Link straight to it with `?check=1`; it also works with `?lang=es` and `embed=1` (for example `?check=1&lang=es&embed=1`). The question content is built only when the section is opened.

Each question's "Set up the lab" button does what the Try an investigation buttons do: it sets the block geometry, the Optical block and Surrounding medium menus (custom index fields hidden) and the angle of incidence, turns the laser on, turns on Show measurements, Protractor, Normal and Angles, snaps the protractor to the normal and zooms out. It never touches the investigation prompt or its buttons. The student then reads the Refraction θ₂ readout (or the Critical angle readout in question 4). A wrong pick shows that choice's own feedback, two misses offer Show me, and Previous, Next and Start over move through the questions. The score is the number right on the first try.

When all five are done, the section shows the score in words ("4 of 5 right on the first try.") and an `SLC` completion code, for example `SLC-0378-SG02-2F0H-ECX` (4 of 5, one Show me). It is registry id 14, setting `Lab check`, slug `snells-law-lab`, in `../shared/zsa-codes.js`; the teacher checker shows the score and a 0 or 1 for each question. Standing Waves cannot use `SLC` and will register `STLC`.

Files: `lab.js` answers a `zsa-snell:request-lab` event on the activity root with `setup({mode, block, surrounding, angle})` (mode is `slab` or `tir`; block and surrounding are the menu option values), `format` (one decimal and a degree sign, as the readouts are written) and `noRay`, the Refraction readout's own text past the critical angle in the page language. `data.js` holds the question data and every English sentence with its Mexican Spanish. `labcheck.js` reads `interfaceRay` and the indices from `physics.js` (through `zsa-snell:physics`) and fills every number from them, so the page source does not mark the right choice, then starts the shared runner (`../shared/zsa-labcheck.js`, with `../shared/zsa-codes.js` and `../shared/zsa-labcheck.css`). `values` and `resolve` are exported for Node, so `tests/unit/snells-labcheck.test.js` runs without a page. The mount is `#zsa-sl-check`.

Decisions:
- **Prefix `SLC`, registry id 14**, the next free id after Projectile Motion (13).
- **Question 3's "zero" feedback** says the beam is not along the normal instead of naming the 45.0° the beam keeps, because naming it gives away the answer.
- The Spanish is in the `es` table but has not been proofread by a native speaker.

Version 1.2.0 adds the Lab check above. The science and the investigations are unchanged.

Version 1.1.3 improves keyboard and screen reader access. Section headings are now level 2 (they jumped from the page's heading 1 to level 3), with the same look. Every focusable element, including summaries, text areas and custom controls, now shows the same visible focus ring (`shared/zsa-lab-a11y.css`), a blue ring with a white gap that reads on light and dark panels and in high contrast mode. `tests/e2e/labs-a11y.spec.js` now checks this lab in English and Mexican Spanish with axe-core, the Tab order, a visible focus indicator on every stop, names and states of custom controls, and text alternatives for drawings. The science, scoring and any completion code are unchanged.

Version 1.1.2 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

Version 1.1.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

A buildless, browser-local optical bench using the same ZornScience branding and header controls as Metals Lab. Published at https://activities.zornscience.org/snells-law-lab/.

Choose a rectangular block for two-interface refraction or a semicircular block for radial entry and total internal reflection. Drag the laser or use its keyboard controls and incidence slider. Drag the virtual protractor toward the entry point to snap its zero line onto the normal; Enter or the Snap button also aligns it. Toggle the normal, protractor and angle labels.

Materials: air, water, acrylic, glass, diamond, and custom indices from 1 to 3. A fixed red laser uses approximate refractive indices; water represents an ideal cell with negligible walls. See the page’s model note for assumptions. No student records, persistence, data submission or network requests.

Run `node --test tests/unit/snells-law.test.js` and `npx playwright test tests/e2e/snells-law.spec.js` from the repository root. No build step or new runtime dependencies.

## Learning design (v1.1)

- Measure incidence and refraction from the normal; contrast this with measuring from the surface.
- Predict refraction when changing only refractive index, and use matching indices as a counterexample to "every boundary bends light".
- Explain the two conditions for total internal reflection: decreasing refractive index and incidence beyond the critical angle.

Optional investigations set controlled starting points and use prediction/observation prompts without grading, forced completion or student response fields. Show measurements can hide calculated refraction and critical angles while retaining the protractor. Numerical Snell’s-law substitution is disclosed on demand. Direction arrows, dashed reflection, explicit n₁/n₂ labels and a ray key connect the visual and mathematical representations. Below/above-critical controls hold materials fixed. A mobile-first bench order, adjacent aiming controls and entry-point zoom make the apparatus usable on phones. Free exploration remains available throughout.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text uses the activity's `data.js`: the instructions, controls, material names, bench and SVG labels, readouts, critical-angle notes, the Snell's law substitution, explanations, investigation prompts, the spoken bench description and laser angle, the model note and the share title, description and status messages. Every sentence is one full template with placeholders, so Spanish keeps its own word order; the instructions paragraph with five bold control names is rebuilt from one template around those names. In Spanish the share link carries `?lang=es`. Symbols, indices, angles, units and decimal points stay unchanged. The language links reload the page, so the bench starts over. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.

## Changelog

- 1.2.0: Lab check with five questions and an `SLC` completion code (registry id 14), opened with `?check=1`. New `zsa-snell:request-lab` event, `labcheck.js`, and the shared runner loaded on the page.
- 1.1.0: Mexican Spanish with `?lang=es` and the shared EN / ES header links.
