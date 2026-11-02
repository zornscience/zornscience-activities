# Verification

Version: 1.1.0

- `node --test tests/unit/collision-carts.test.js tests/unit/static.test.js`: 2,000 random collisions, exact event timing, versions, asset queries and markup.
- `npx playwright test tests/e2e/collision-carts.spec.js tests/e2e/activity-headers.spec.js`: the carts, vectors, readouts, presets, the end-stop pause and reset, the header, Instructions dialog and Share panel.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and walks the initial setup, the Instructions dialog, the Share panel (share link and email with `?lang=es`), stepping through an elastic collision with momentum vectors, the inelastic heavy-light preset, the end-stop pause, reset, a launch and pause on a fake clock, and the physics note, with full-sentence templates. English visible text, SVG text, accessible labels and share links were compared with version 1.0.3 through the same states and are identical. The language toggle intentionally adds header controls. The Spanish layout was checked at 320 px, 390 px and 1366 px with no sideways scrolling, menu options that fit, and cart labels inside their plates.
