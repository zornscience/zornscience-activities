# Electrochemistry verification

Version: 1.4.0

`npm run test:unit`
`npx playwright test tests/e2e/electrochemistry.spec.js`

Unit tests verify all three metal-pair potentials in both orientations and modes, balanced silver reactions, event-level atom/charge conservation for every pair and mode, finite sample bounds, and readiness for missing components, mismatched/identical half-cells and driving-voltage thresholds.

Browser tests verify ready initial setup, step/run/pause/restart, silver atom ratios, swapped orientation, powered threshold feedback, disconnected-bridge feedback, keyboard placement and focus retention, dialog focus, narrow-screen overflow, reduced motion, sample completion, and display switches.

Visual/teaching review: ensure electrons follow the load/source leads rather than the dashed meter branch; K⁺ goes toward the cathode and NO₃⁻ toward the anode; no electron crosses the bridge; charged solution markers are distinct from neutral electrode deposits; supply voltage and calculated E° are separate. Verify the removed banner, standalone reaction section and prediction section remain absent. At 390 px, controls stack without horizontal page scrolling.

Verification completed for 1.3.0: all 20 repository unit-test files passed; all four activity browser scenarios passed in Chromium. Electron marker positions were confirmed to change during playback. Desktop and 390 px screenshots were inspected; no horizontal page overflow was detected. The optional custom builder follows the apparatus on narrow screens and opens automatically for powered mode. Live GitHub Pages deployment verification is separate from these local browser checks.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and walks the ready cell, single steps for zinc/copper and zinc/silver, running and pausing, electrolytic mode below and above the required voltage, a disconnected bridge and circuit, a cleared bench, placed metals, identical and mismatched half-cells, a completed 12-event sample, the instructions dialog and the share panel. English page text, SVG markup, accessible labels and share links were compared with version 1.3.0 through 22 states and are identical. The language toggle intentionally adds header controls. Spanish was checked at 320 px, 390 px and 1366 px: no horizontal page scrolling, SVG labels stay inside their drawing boxes and select options fit their controls.
