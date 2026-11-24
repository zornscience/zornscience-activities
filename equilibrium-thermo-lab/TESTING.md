# Verification

Version: 1.2.0

The browser test in `tests/e2e/equilibrium-thermo.spec.js` checks both links on this compatibility page.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the chooser with `?lang=es`, checks the title, the language toggle and the text for leftover English, checks that both lab links and the back link carry `?lang=es`, and follows a lab link into Spanish. English page text and links were compared with version 1.0.0 and are identical; the only addition is the EN / ES toggle.

## Layout verification (1.2.0)

Checked with Playwright screenshots in English and `?lang=es` at 1280x800 and 390x664: two cards side by side on desktop, stacked on the phone, no sideways scrolling, whole card clickable and keyboard focusable. Screenshots are not committed.
