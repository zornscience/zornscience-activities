# Test Policy Checker checks

Version: 1.0.0

- `node --test tests/unit/test-policy-checker.test.js`: `data.js` is exactly what `tools/build-data.js` writes from `policies.csv`; 541 schools in all 50 states and DC, with the counts per state and per policy pinned to the Sheet of November 23, 2026; every school has an https source link on its own .edu site (one catalog host listed); every exception has Spanish; no en or em dashes; unverified rows are "Not confirmed" with no exception; the build stops with a message on a bad row; the map has 51 states, each with a path and a label point.
- `npx playwright test tests/e2e/test-policy-checker.spec.js`: every state, chosen from the State list, shows the same number of schools as the data; every state on the map and every small-state button opens its list; search across states; the policy filter, map shading and counts; the map's arrow keys, Enter and visible focus; deep links (`?state=`, `?policy=`, `?q=`) and the `from` back link; phone layout at 320 and 390 px with 44 px targets; Spanish with `?lang=es` (no leftover English outside school names and data); no network requests beyond the page and no storage; axe-core at laptop and phone sizes.

Source links: the build checks that each is a full https address. The research loaded 528 of the 541 pages on November 23, 2026; the yearly recheck loads every link again (the tests do not reach the internet).
