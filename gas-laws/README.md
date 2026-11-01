# Gas Laws Sandbox
Version: 1.1.0

Four ideal gas law modes share the same full-precision PV = nRT model, coupled control limits, particle illustration and live graph. English and Mexican Spanish copy is in `data.js`. `?lang=es` selects Spanish; the shared EN / ES header toggle changes language without resetting the law, values or paused state.

## Change in 1.1.0: separate files

Version 1.0.0 was a single self-contained `index.html` with its CSS and JavaScript embedded and authorized by CSP hashes. Nick approved splitting it into separate files: `activity.css`, `activity.js` and `data.js` are now local versioned files, so this activity can load the shared `shared/zsa-i18n.js` and use the standard self-only CSP like the other activities. The static tests check it with the same rules as every other page. No runtime dependencies or outside requests. Chemical notation, units, decimal points, controls and model calculations are unchanged.

ZornScience. CC BY-NC-SA 4.0.
