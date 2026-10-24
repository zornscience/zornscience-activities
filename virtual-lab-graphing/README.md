# Virtual Lab Graphing Tool

Version: 1.1.0

An open-ended lab-report tool for the [Reading Graphs lesson](https://zornscience.org/science/quantitative-skills/graphs-and-change/reading-graphs/). Students enter their own x/y measurements, label variables and units, and download a graph. This tool uses the shared design tokens and embed shell; it does not use quiz rounds or issue completion codes.

## Features

- Up to 500 editable pairs, including decimals, negative numbers and scientific notation.
- Two-column CSV/TSV paste and file import, with optional headers, quoted cells and atomic validation. Import replaces existing data only after a confirmation when the table contains values.
- Live SVG scatter plot with automatic evenly spaced scales, an include-zero toggle, and accessible descriptions plus the editable data table.
- Optional ordinary least-squares line over the measured x range; slope, intercept and R². All points receive equal weight; no points are silently removed as outliers and the intercept is not forced to zero.
- Read a fitted y value at x, with an extrapolation reminder outside the measured range.
- 2400 × 1680 PNG, standalone SVG, CSV and graph-only printing. Graph exports include the title, labels, measurements and the displayed fit equation/R². CSV preserves complete numeric pairs and axis headers, but not the title or fit settings.
- Heating-water and burning-candle examples from the lesson, plus a gas-production curve that starts with linear fitting off. Example values are teaching data, not collected measurements.
- No accounts, persistence, analytics, dependencies, outside requests or student data uploads. Data disappears on reload; download CSV before leaving. Download and re-import CSV to resume the measurements.

## Files and math

`model.js` implements numeric validation, import/export, axis ticks and regression. `graphing.js` owns DOM input, SVG rendering and downloads. The model is exposed through a scoped request event in the browser and CommonJS for unit tests. No browser globals are added.

Regression centers and scales both axes before computing covariance/variance. R² is squared correlation for this free-intercept simple linear regression. Constant y has a horizontal fitted line and undefined R²; repeated x values are allowed unless every x is identical. At least two distinct x values are necessary. Invalid/incomplete rows remain editable, visibly marked and excluded from both plotting and exports. Inputs must be zero or finite decimal numbers with magnitude from 1e-100 to 1e100; more extreme values are rejected rather than rounded to zero.

Numbers displayed in results use five significant digits; this is display rounding, not an assessment of experimental uncertainty. The model and CSV preserve full input numeric precision. The tool does not assess the physical validity of student measurements or whether a straight line is scientifically appropriate.

## Keyboard and embedding

Tab follows labels, data cells and actions; Enter/Space activates buttons, checkboxes and disclosure panels. Add row focuses the new x input. Removing a row moves focus to the nearest remaining row. Each input and delete button has a row-specific accessible label. Validation and updates are announced without moving focus.

Open `/virtual-lab-graphing/?embed=1` to hide site logo, lesson link and footer and use the existing `zsa:resize` protocol, with messages sent only to `https://zornscience.org`. The supplied `wordpress-block.txt` is one editable Gutenberg group for placement before Worked Examples. Its iframe has a useful fixed height with internal scrolling, and an ordinary link opens the full tool. It is ready to insert after the PR is merged and the activity is deployed. No WordPress page is changed by committing the file.

## Activity header

The compact header names the activity beside the ZornScience logo. Instructions opens a keyboard-accessible dialog with the workflow and data-saving reminders. Share copies the canonical activity URL, without measurements or query parameters; if clipboard access fails, it selects the URL for manual copying. Both controls remain available in embedded lessons. Escape closes the dialog and focus returns to the opening button.

## Changelog

- 1.1.0: Replace the intro banner with an activity header, instructions and link sharing.
- 1.0.0: Initial student graphing tool and Reading Graphs integration block.
