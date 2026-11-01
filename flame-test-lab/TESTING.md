# Verification

Version: 1.1.0

- `node --test tests/unit/static.test.js tests/unit/i18n.test.js`: versions, asset queries, markup and language module.
- `npx playwright test tests/e2e/activity-headers.spec.js tests/e2e/a11y.spec.js tests/e2e/layout.spec.js`: header, Instructions dialog, Share panel, accessibility and responsive layout.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and tests known samples, the unknown, Clear flame, New investigation, the Instructions dialog and the Share panel (share link with `?lang=es`), with full-sentence templates. English visible text and accessible labels were compared with version 1.0.5 through the same states and are identical. The language toggle intentionally adds header controls.
