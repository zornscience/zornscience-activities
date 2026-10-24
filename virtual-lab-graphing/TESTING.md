# Virtual Lab Graphing Tool checks

Version: 1.1.0

Run `node --test tests/unit/virtual-lab-graphing.test.js tests/unit/static.test.js` and `npx playwright test tests/e2e/virtual-lab-graphing.spec.js`.

Unit coverage: known noisy-data least-squares coefficients and R², negative/zero slope, constant y, identical x, scientific notation, tiny and large ranges, negative and single-valued axis scales, quoted CSV/TSV, malformed imports, input limits and CSV round trips.

Browser coverage: blank state, lesson examples, typed pairs and validation, live labels, fit/zero controls, interpolation/extrapolation, import atomicity, add/remove focus, downloads (actual PNG dimensions, SVG content and CSV pairs), phone layouts, embed mode, print styling, CSP and automated accessibility scanning.

Manual review: confirm that downloaded graphics are readable when placed in a lab write-up and that labels/units match the variables. Test file downloads in the school's managed browser; browser or classroom device policy can restrict downloads. CSV saves the table; closing the tab does not save it automatically.
