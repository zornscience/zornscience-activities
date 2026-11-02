# Verification

Version: 1.1.0

- `node --test tests/unit/static.test.js`: versions, asset queries, markup and no en or em dashes.
- `npx playwright test tests/e2e/standing-waves-lab.spec.js tests/e2e/activity-headers.spec.js`: harmonics against tension and length, the strobe lock and phase, transverse motion of one string point, node cursor measurements, fine tuning, zero drive, reset, the header, Instructions dialog, Share panel and the phone layout.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes (including the cursors' spoken values) for leftover English, and walks the initial state, the Instructions dialog with both rebuilt steps, the Share panel (share link and email with `?lang=es`), starting the oscillator, tuning harmonic 3 with nodes labeled, the strobe lock with a tracked string point, placing the cursors on adjacent nodes and then off them, detuning, zero drive, all three investigations, the fundamental, stopping the oscillator and reset, with full-sentence templates. English visible text, SVG text, accessible labels and share links were compared with version 1.0.4 through the same states and are identical. The language toggle intentionally adds header controls. The Spanish layout was checked at 320 px, 390 px and 1366 px with no sideways scrolling and a 44 px ES toggle.
