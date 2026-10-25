# Verification

Version: 1.0.1

Automated browser coverage: `tests/e2e/faraday-lab.spec.js`. Checks Instructions, sharing URL, pause/resume, copper drop completion, faster plastic completion, pole reversal, mobile overflow and runtime errors.

Manual checks: compare intact/slotted/plastic, repeat at both strength limits, switch overlays while paused, reverse poles (current and field arrows reverse while braking stays upward), close Instructions with Escape, copy/share fallback, 390 px and desktop layouts. The cutaway must not alter fall timing. Current and induced field overlays disappear at rest and for plastic. No introduction band or data-entry UI.
