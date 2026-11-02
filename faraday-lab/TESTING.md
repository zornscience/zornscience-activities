# Verification

Version: 1.2.0

Automated browser coverage: `tests/e2e/faraday-lab.spec.js`. Checks Instructions, sharing URL, pause/resume, copper drop completion, faster plastic completion, pole reversal, mobile overflow and runtime errors.

Manual checks: compare intact/slotted/plastic, repeat at both strength limits, switch overlays while paused, reverse poles (current and field arrows reverse while braking stays upward), close Instructions with Escape, copy/share fallback, 390 px and desktop layouts. The cutaway must not alter fall timing. Current and induced field overlays disappear at rest and for plastic. No introduction band or data-entry UI.

Version 1.1.0 adds Observe/Explain views, a fixed reference ring with flux/current explanations, deterministic replay scrubbing, exploration prompts, automatic pause when hidden, and a bench-first mobile layout.

Verified v1.1.0: both browser tests pass, covering replay pausing, increasing/decreasing flux, current reversal, unchanged replay timing after pole reversal, insulating plastic, broken copper loops, view presets, sharing, Instructions and mobile overflow. Chromium desktop and 390 px screenshots reviewed; axe WCAG A/AA audit has zero violations. Repository static checks pass page/CSP/version checks; the existing standing-waves strict-IIFE formatting failure remains outside this change.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es` on a fake clock and checks page text, accessible attributes (including the replay slider's spoken value) and every word drawn on the canvas for leftover English. It covers the initial state, the instructions dialog (the goal and the three steps built around a bold button name), the share panel (share link with `?lang=es`, email subject and body, Copy link), the Explain view, a copper drop while falling, paused, resumed, in slow motion and caught, replay at increasing and decreasing flux, reversed poles, plastic while falling and after both magnets land, the slotted tube, the Observe view, the model note and Reset, with no sideways scrolling at 320 and 390 px. English visible text, accessible labels, canvas text and share links were compared with version 1.1.0 through 17 states and are identical apart from one frame-timed replay reading. The noscript message is now bilingual. The language toggle intentionally adds header controls.
