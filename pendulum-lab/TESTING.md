# Verification

Version: 1.2.0

- `tests/e2e/pendulum-lab.spec.js`: periods on Earth, the Moon and in zero gravity, mass and length changes, energy conservation, the three controlled comparisons, cycle counting, paused stepping, dragging and the mobile settings disclosure.
- `node --test tests/unit/static.test.js tests/unit/i18n.test.js`: versions, asset queries, markup and language module.
- `npx playwright test tests/e2e/activity-headers.spec.js tests/e2e/a11y.spec.js tests/e2e/layout.spec.js`: header, Instructions dialog, Share panel, accessibility and responsive layout.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and tests the three comparisons with their predictions and results, releasing, pausing, stepping and resetting on a fake clock, the energy cues, cycle progress, zero gravity and a zero release angle, the mobile settings toggle, the Instructions dialog and the Share panel (share link with `?lang=es` and the email subject and body), with full sentence templates. English visible text, SVG text and accessible labels were compared with version 1.1.1 through the same states and are identical. The language toggle intentionally adds header controls. The Spanish layout was checked at 320 px and 390 px with no sideways scrolling.
