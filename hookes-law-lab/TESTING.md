# Validation

Version: 1.1.0

Three Chromium tests cover equilibrium extension and the 50 g hanger, spring-constant reveal, ideal oscillation period, synchronized pause and 20 ms stepping, settling, keyboard displacement, modal focus restoration, share URL, and mobile overflow. All pass using the installed system Chromium. Additional desktop and 390 px mobile screenshot checks, reset and mass controls passed without JavaScript errors.

The broader local unit suite reports existing Collision Carts strict-IIFE and version-documentation issues, and PHP tests require a PHP executable absent from this environment. Shared assets were not changed.

## 1.1.0 validation

Seven targeted Chromium tests pass: equilibrium and unit conversion, ideal motion and synchronized pause/step, keyboard/modal/share/mobile overflow, force-extension graph and prompts, measured period with mass and amplitude comparisons, hanger dragging without a jump, damping and zero-displacement release. Physics checks measure 0.628 s for 0.20 kg / 20 N/m and 0.889 s for 0.40 kg / 20 N/m; reducing amplitude to 2 cm preserves the period. Desktop and 390 px layout checks report no browser errors. System Chromium is selected using a checkout-local test configuration; the committed tests use the repository's normal runner.
