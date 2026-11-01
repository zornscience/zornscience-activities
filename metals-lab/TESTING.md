# Verification

Version: 1.1.1

- `node --test tests/unit/static.test.js tests/unit/i18n.test.js`: versions, asset queries, markup and language module.
- `npx playwright test tests/e2e/metals-lab.spec.js`: all three unknowns through every station, acid → solid → observation → waste order, pause, locked sample switches during an acid test, cancelled stale animations, instructions and share focus, axe and a 390 px viewport.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and runs every station for the unknowns, including the full acid observation and waste disposal, plus the Instructions dialog and the Share panel (share link and email with `?lang=es`), with full-sentence templates. English page text, SVG text, accessible labels and the share link were compared with version 1.0.2 through the same 62 states and are identical. The language toggle intentionally adds header controls. In Spanish the page has no sideways scrolling at 320 px, 390 px or 1366 px, and SVG labels stay inside their drawings.

## Narrow screens (1.1.1)

At 320 px, in English and Spanish and with a wide fallback font (DejaVu Sans), the page has no sideways scrolling and every sample icon and caption stays inside its button. Element boxes at 360, 390, 768 and 1366 px in English, and at every width in Spanish, were compared with version 1.1.0 and are identical.
