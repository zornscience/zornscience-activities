# Snell’s Law & Refraction
Version: 1.1.0

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

- 1.1.0: Mexican Spanish with `?lang=es` and the shared EN / ES header links.
