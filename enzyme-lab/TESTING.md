# Testing

Version: 1.0.0

- `tests/unit/enzyme-lab.test.js` (Node, `npm run test:unit`): seed handling, no clock or ambient randomness, the
  temperature and pH curves, the tested optimum over 500 seeds, foam growth with enzyme and substrate, the tube cap,
  seeded noise, playback foam, every fair test issue code, the 2 mm ruler tolerance, averages and the optimum, the
  smooth curve, the tab-separated copy text, the string table (English and Spanish for every key, matching
  placeholders, no en or em dashes, the Spanish flag) and that every key the page uses exists.
- `tests/e2e/enzyme-lab.spec.js` (Playwright): the full temperature and pH paths at 360x640 and 1366x768, from the
  hook to Copy my data, including the fair test checker catching unequal amounts and a second changed variable, a
  rejected ruler reading, three measured trials, table averages, graph point checks, curve choice, the optimum,
  the zoom view, all four questions and the exact clipboard text; repeated levels, the setup lock and Start over;
  keyboard access and gated steps; reduced motion; the hidden Spanish and the review switch; the clipboard fallback.
  Every test fails on a console error or warning, any request off the local server, storage use or a missing string.
  Axe runs on the finished laptop flows. Set `ZSA_EZ_SHOTS=<folder>` to save screenshots of every step.
- Shared specs that cover this lab automatically: `labs-a11y.spec.js` (axe, Tab order and focus, sliders, the
  Instructions dialog), `activity-headers.spec.js`, `about.spec.js`, `seo.spec.js`, and `static.test.js`.
