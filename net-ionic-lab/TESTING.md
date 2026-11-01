# Verification

Version: 1.1.0

- `npm run test:unit`: syntax, house rules, the one shared CSP, no en or em dashes, and matching version numbers.
- Chromium checks of all ten mixtures, resets, the settling states, dialogs and mobile overflow (see README).

## Spanish verification

`tests/e2e/i18n-net-ionic-lab.wip.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and walks the starting state, mixing, the zinc trial, settling of a precipitate, the revealed chemistry, a mixture with no reaction, the instructions dialog and the share panel. English page text, SVG markup and accessible labels were compared with version 1.0.6 through the same states and are identical, apart from the new language toggle in the header. The Spanish layout was checked at 320 px, 390 px and 1366 px without sideways scrolling.
