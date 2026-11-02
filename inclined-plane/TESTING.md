# Verification

Version: 1.1.0

- `node --test tests/unit/static.test.js tests/unit/i18n.test.js`: versions, asset queries, markup and language module.
- `npx playwright test tests/e2e/activity-headers.spec.js tests/e2e/a11y.spec.js tests/e2e/layout.spec.js`: header, Instructions dialog, Share panel, accessibility and responsive layout.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and walks the states on a fake clock: at rest, the angle raised past the critical angle until the block slides, the end stop, Pause and Resume, each contact surface with its coefficients and critical angle, the force arrows and gravity components, the physics note, the Instructions dialog and the Share panel (share link and email with `?lang=es`), with full-sentence templates. English visible text, SVG text and accessible labels were compared with version 1.0.1 through the same states and are identical. The language toggle intentionally adds header controls. The Spanish layout was checked at 320 px and 390 px with no sideways scrolling and 44 px language toggles.
