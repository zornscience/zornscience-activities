# Redox coach checks

Version: 1.1.1

Run `node --test tests/unit/redox-coach.test.js tests/unit/static.test.js` and `npx playwright test tests/e2e/redox-coach.spec.js`.

Unit tests use independently worked acidic and basic half-reactions and net equations, rather than a solver from the activity. They check formula parsing, atom and charge conservation, pair labels, skeleton coefficients, rejected splits, wrong mass/charge checks, electron additions to both sides, invalid and unequal multipliers, full acidic/basic flows, phase locks, OH− amounts, same-side merging, partial water cancellation and simplest ratios.

Browser tests play both problems through visible controls, exercise wrong checks and undo, phase locks, click and drag placement, keyboard focus, deep links, reduced motion, embed support, local-only asset requests, mobile layout from 320 px, 44 px control heights, and axe-core accessibility in each phase and on success.

Header checks cover logo/title layout, modal keyboard behavior and preserved work, share links and clipboard fallback, no outside requests on opening Share, mobile overflow, embed visibility and accessibility with each panel open.
