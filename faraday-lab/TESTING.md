# Verification

Version: 1.1.0

Automated browser coverage: `tests/e2e/faraday-lab.spec.js`. Checks Instructions, sharing URL, pause/resume, copper drop completion, faster plastic completion, pole reversal, mobile overflow and runtime errors.

Manual checks: compare intact/slotted/plastic, repeat at both strength limits, switch overlays while paused, reverse poles (current and field arrows reverse while braking stays upward), close Instructions with Escape, copy/share fallback, 390 px and desktop layouts. The cutaway must not alter fall timing. Current and induced field overlays disappear at rest and for plastic. No introduction band or data-entry UI.

Version 1.1.0 adds Observe/Explain views, a fixed reference ring with flux/current explanations, deterministic replay scrubbing, exploration prompts, automatic pause when hidden, and a bench-first mobile layout.

Verified v1.1.0: both browser tests pass, covering replay pausing, increasing/decreasing flux, current reversal, unchanged replay timing after pole reversal, insulating plastic, broken copper loops, view presets, sharing, Instructions and mobile overflow. Chromium desktop and 390 px screenshots reviewed; axe WCAG A/AA audit has zero violations. Repository static checks pass page/CSP/version checks; the existing standing-waves strict-IIFE formatting failure remains outside this change.
