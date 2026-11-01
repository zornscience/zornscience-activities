# Verification
Version: 1.1.0

`tests/unit/gas-laws.test.js` verifies all four laws, both control directions, 16,000 legal settings, fixed variables, range limits, invalid inputs, particle count, temperature-dependent motion and wall collisions.

`tests/unit/i18n.test.js` verifies language selection, URL propagation and interpolation. `tests/e2e/i18n.spec.js` opens Spanish directly, checks interface text and accessible labels, changes laws and pauses, then switches to English and verifies the law and pause state survive.

Static checks require external local assets with matching versions, standard CSP, strict IIFEs, no storage or network calls, and no prohibited dashes. Real screen readers and school devices have not been tested for this version.
