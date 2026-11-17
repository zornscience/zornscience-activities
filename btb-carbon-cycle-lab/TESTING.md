# BTB Carbon Cycle Lab: testing

Version: 1.0.0

Automated: `npm run test:unit` (tests/unit/btb-carbon-cycle-lab.test.js) checks the solver against the reference
table, seed determinism, expected colors, the open and yellow start cases, house rules and Spanish coverage.
`npx playwright test tests/e2e/btb-carbon-cycle-lab.spec.js` drives the page (steps, locking, results, quiz, Spanish,
axe, layout from 320 to 1920 px, keyboard, no network requests). The shared labs-a11y and layout specs also pick up
this folder because it contains `lab.js`.

Manual checks:

1. Blow until green, set up the default three tubes, predict, start. At hour 24 the tubes read blue, yellow, green.
2. Turn on the pattern aid. Each color class has a different texture.
3. Use `?seed=42` to repeat a run, and `?lang=es` for Spanish.
4. Simulate color blindness (deuteranopia and protanopia) in browser dev tools. Names, meters and patterns still tell
   the tubes apart.
5. Tab through every step with the keyboard only, including the time slider (arrow keys).
