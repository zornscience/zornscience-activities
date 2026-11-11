# Population Sampling Lab testing

Version: 1.0.0

Run from the repository root:

```
node --test tests/unit/population-sampling-lab.test.js
npx playwright test tests/e2e/population-sampling-lab.spec.js --workers=2
npx playwright test tests/e2e/labs-a11y.spec.js --grep population-sampling-lab --workers=2
node tools/build-about.js --check
node tools/build-seo.js --check
npm test
npm run parity
```

The model suite covers seed normalization, clock and ambient-randomness independence, cluster geometry, population bounds, unique quadrats, estimation and whole percent errors, zero recaptures, exact distinct draws, a hypergeometric expectation check, and statistical comparisons over fixed seeds. Larger-catch central spread is measured with the interquartile range of finite estimates divided by each pond's true size. Undefined counts are checked separately. A raw range comparison can mislead because a finite estimate from 20 fish cannot exceed 400 while one from 40 fish can reach 1600. We preserve these outliers rather than modify the scientific draws.

Browser coverage includes all guided paths in English and Mexican Spanish, exact model counts, 3/10/20 cumulative samples, both placement methods, both catch sizes, four problem series, prediction locking, reveal gates, worksheet content and TSV structure, click-only clipboard writes, blocked-copy selection, duplicate prevention, numeric steppers, keyboard placement, all knowledge checks, native dialog focus, reload and language reset, seed zero and repeat loads, no writing fields, no runtime network or storage, reduced motion, embed mode, 360 px fit and 44 px targets, safe lesson links and clean Share URLs. Every exercised dictionary lookup must have a Spanish translation. The shared About module owns its own translated catalog text.

The shared lab accessibility spec discovers this activity automatically through lab.js. The i18n lab list includes its Spanish title. Shared tests provide axe checks at laptop and phone sizes, visible keyboard focus, named controls, drawings, modal behavior, generated About/SEO consistency and house-rule checks.

This file describes coverage, not a claim that a command ran. Actual command results, environment preparation, failures and reruns are recorded in the PR evidence report.

Not tested manually: real screen readers, Safari, Firefox, a physical Chromebook or phone, and the live published page. Spanish terms marked needs review await a teacher's review. The `/es/` lesson page is unpublished.
