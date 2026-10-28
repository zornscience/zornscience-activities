# Electrochemistry verification

Version: 1.3.0

`npm run test:unit`
`npx playwright test tests/e2e/electrochemistry.spec.js`

Unit tests verify all three metal-pair potentials in both orientations and modes, balanced silver reactions, event-level atom/charge conservation for every pair and mode, finite sample bounds, and readiness for missing components, mismatched/identical half-cells and driving-voltage thresholds.

Browser tests verify ready initial setup, step/run/pause/restart, silver atom ratios, swapped orientation, powered threshold feedback, disconnected-bridge feedback, keyboard placement and focus retention, dialog focus, narrow-screen overflow, reduced motion, sample completion, and display switches.

Visual/teaching review: ensure electrons follow the load/source leads rather than the dashed meter branch; K⁺ goes toward the cathode and NO₃⁻ toward the anode; no electron crosses the bridge; charged solution markers are distinct from neutral electrode deposits; supply voltage and calculated E° are separate. Verify the removed banner, standalone reaction section and prediction section remain absent. At 390 px, controls stack without horizontal page scrolling.

Verification completed for 1.3.0: all 20 repository unit-test files passed; all four activity browser scenarios passed in Chromium. Electron marker positions were confirmed to change during playback. Desktop and 390 px screenshots were inspected; no horizontal page overflow was detected. The optional custom builder follows the apparatus on narrow screens and opens automatically for powered mode. Live GitHub Pages deployment verification is separate from these local browser checks.
