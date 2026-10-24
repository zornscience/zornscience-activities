# Snell’s Law & Refraction
Version: 1.0.0

A buildless, browser-local optical bench using the same ZornScience branding and header controls as Metals Lab. Published at https://activities.zornscience.org/snells-law-lab/.

Choose a rectangular block for two-interface refraction or a semicircular block for radial entry and total internal reflection. Drag the laser or use its keyboard controls and incidence slider. Drag the virtual protractor toward the entry point to snap its zero line onto the normal; Enter or the Snap button also aligns it. Toggle the normal, protractor and angle labels.

Materials: air, water, acrylic, glass, diamond, and custom indices from 1 to 3. A fixed red laser uses approximate refractive indices; water represents an ideal cell with negligible walls. See the page’s model note for assumptions. No student records, persistence, data submission or network requests.

Run `node --test tests/unit/snells-law.test.js` and `npx playwright test tests/e2e/snells-law.spec.js` from the repository root. No build step or new runtime dependencies.
