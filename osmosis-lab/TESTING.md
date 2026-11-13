# Testing

Version: 1.0.0

No build step. From the repository root:

```bash
npm ci
npm run test:unit
npx playwright test tests/e2e/osmosis-lab.spec.js
```

tests/unit/osmosis-lab.test.js (12 tests): seed handling; the isotonic point stays within 0.25 to 0.35 M over
2000 seeds and is centered on 0.30 M; the model never reads the clock or Math.random; core masses and films stay
in range; the percent change formula; water direction and both-way crossing at every concentration; three
blotted trials recover the hidden point within 0.03 M over 500 seeds; skipping the blot makes every final mass
heavier and moves the zero crossing right; best fit, line gap and feedback bands; tab-separated output; every
string has English and Spanish with matching placeholders and no dashes; every key used in lab.js exists, and all
static page text is in the dictionary.

tests/e2e/osmosis-lab.spec.js (8 tests): the full flow at 1366x768 and 360x640 with axe and a no-sideways-scroll
check on every step (prediction, bench rules, a tapped trial with an unblotted core, the hint and the fix, Show and
the formula example, two helper trials, keyboard-only graphing to "great fit" and "right where your data crosses
zero", the revealed hidden point, the zoom in three solutions with live counts, the four questions, and the exact
clipboard text checked against the model); a real pointer drag; redo and Start over; reduced motion; complete
Spanish at ?lang=es with no missing strings and no toggle; the landing page cards; Tab and a visible focus ring
on all nine graph handles. Every test fails on console errors or warnings, page errors or any request that
leaves the local server.

Shared specs that cover this lab: labs-a11y.spec.js (found through lab.js), about.spec.js, seo.spec.js,
activity-headers.spec.js, static.test.js, focus-css.test.js and seo.test.js.
