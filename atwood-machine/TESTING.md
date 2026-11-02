# Validation - v1.1.0

Passed Chromium checks at 1440 px and 390 px: no page errors, missing assets or horizontal mobile overflow; instructions dialog open/Escape; share URL; swap, equal masses and total-preserving transfer; slow motion; pause/resume and reset; correct travel-limit stop with arrows/readouts cleared; four Physics catalog cards including the new activity. Desktop and mobile screenshots reviewed. Physics checked over the full 50-500 g mass grid against both Newton equations: T−m1g=m1a and m2g−T=m2a, plus equal masses and the 200/300 g example (a=1.962 m/s²). No shared activity code changed.

Repeat manually: release each mass imbalance in both directions, run equal masses, enable/disable vectors, pause then resume, switch masses mid-run, reset after a travel limit, and use all controls by keyboard. Verify massless string stays tangent to the rotating pulley and the hangers clear the pulley and bench.

Version: 1.1.0

Version 1.0.2: verified the intro block is removed, header instructions/share controls are retained, and asset versions agree. The workspace uses a 24 px gap below the header; simulation behavior is unchanged.

## Spanish verification

`tests/e2e/i18n.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and covers the initial state and the spoken apparatus description, the instructions dialog (including the step built around the Release button), the share panel (share link with `?lang=es`, email subject and body), release, pause, resume and the travel limit with force arrows, reset, equal masses, transfer, swap, slow motion and the model note, with no sideways scrolling at 320 and 390 px. English visible text, SVG text, accessible labels and share links were compared with version 1.0.3 through the same states and are identical apart from frame-timed clock and speed readings. The language toggle intentionally adds header controls.
