# Validation

Version: 1.0.0

Run `npm ci`, `npm run test:unit` and the browser specs below. There is no build step. After any change to the About or SEO registration, run `node tools/build-about.js` and `node tools/build-seo.js`; both `--check` modes must pass.

## Unit: tests/unit/fruit-fly-genetics-lab.test.js

The model is imported directly in Node. Expected ratios come from a separate allele-by-allele enumeration in the test, not from the model.

- Gametes, genotype normalization and rejection of bad genotypes; zygosity words.
- All 9 monohybrid crosses for each trait and all 81 dihybrid crosses against the reference; 3 : 1, 1 : 1, 9 : 3 : 3 : 1 and 1 : 1 : 1 : 1.
- Seeds: unsigned 32-bit normalization including zero and negatives; bad seeds and offspring counts throw; the same seed repeats, streams differ; the model never calls `Math.random`, the clock or `crypto`.
- Convergence over 3,000 seeds for Nn × Nn, Nn × nn and Rr × Rr: the average share equals the Punnett fraction (within 1 point); the average distance from the prediction matches the binomial value and falls from 8 to 40 to 200 (to under a third); an 8-fly sample matches exactly at the binomial rate (about 31% for 3 : 1); 200 beats 8 in over 60% of seeds.
- Dihybrid over 1,000 seeds: distance falls from 16 to 80 to 400; 200,000 pooled offspring are within half a point of 9, 3, 3 and 1 sixteenths; the genes assort independently.
- Test crosses: certain only with a recessive offspring, otherwise 0.5 to the power n; NN parents never give recessive offspring; Rr × rr gives half.
- Mystery flies over 5,000 seeds: always 3, repeatable, at least one homozygous and one heterozygous and both traits, each about half overall.
- Checking: any allele order in a box, any gamete order in the headers.
- Text: identical keys and `{slots}` in English and Spanish, no en or em dashes, no untranslated Spanish, every key used by the page exists, and the page's static English equals `data.js`.
- The Spanish stays unpublished: `SPANISH_PUBLISHED` is false, the page loads no `zsa-i18n.js` and has no Spanish hreflang, and `tools/seo-pages.js` has `es: null`.

## Browser: tests/e2e/fruit-fly-genetics-lab.spec.js

Every test fails on console errors, warnings, page errors or CSP violations.

1. The whole lab by tapping at 1366x768 with `?seed=7`: hook, the three trait goals, a wrong Punnett box then right, a wrong prediction then right, sample sizes unlocking in order with counts equal to the seeded model, 200 flies in the vial, the reflection, F1 to F2 with the hook callback, a wrong mystery verdict, Redo, all three mystery flies decided from the evidence, wrong and right check answers, the bonus unlock, gametes wrong then right, the 4 × 4 square, the ratio, 16/80/400 runs, then Copy my data: the clipboard equals the preview and holds the seed, every count, the predicted ratios, each mystery genotype and the three starters, as tab-separated rows. Only local requests, every asset at `?v=1.0.0`.
2. Dragging every tile into the square with a mouse, a drag that misses, and a touch drag.
3. Keyboard only: Enter and Space on tiles and boxes with focus kept through re-renders, spoken box names, Escape, arrow keys in radio groups, the Start over dialog (Escape and confirm).
4. The locked bonus, the "finish step 3 first" message, Show me after two checks, Redo, and the same mystery flies for the same seed.
5. Every step at 360x640 and 1366x768: no sideways scrolling and every button and choice at least 44 px.
6. axe-core (WCAG 2.0, 2.1 and 2.2 A and AA, best practices) on every step at 360x640 and 1366x768 with results, ✓ and ✗ marks, feedback, charts and the 4 × 4 square showing.
7. Reduced motion shows all 200 flies at once; normal motion adds them over about a second.
8. `?lang=es`: Spanish title, `lang="es-MX"`, no EN / ES toggle, the `/es/` back link, a clean English share link, and no leftover English or dashes on any step.
9. Copy fallback without the Clipboard API (the text is selected), the Share link without the seed, `?from=` accepted only for zornscience.org, and `?embed=1`.

## Shared specs that cover this lab

`labs-a11y.spec.js` finds it through `lab.js` (axe at two sizes, Tab walk with visible focus, custom controls, drawings, live region, Instructions dialog; English and Spanish). `activity-headers.spec.js`, `about.spec.js`, `seo.spec.js`, `integration.spec.js` and the landing page test in `i18n.spec.js` also run on it. `static.test.js` checks the house rules and versions.

## Results for 1.0.0 (November 13, 2026)

```
npm run test:unit                                  601 passed, 0 failed
fruit-fly-genetics-lab, seo, integration,
  about and activity-headers specs                 162 passed, 0 failed
labs-a11y (fruit-fly, leaf-disk, population)        18 passed, 0 failed
i18n landing page test                               1 passed, 0 failed
node tools/build-about.js --check                  up to date
node tools/build-seo.js --check                    up to date
```

The browser runs used the session's preinstalled Chromium through a temporary config outside the repository (Playwright 1.56.1 could not find its own browser build there). The committed configuration is unchanged. CI runs the same specs with its own Chromium.

Fixed during validation: a nested list in the trait readout, the bonus table overflowing at 360 px (rows now become cards), flies overlapping the vial's food, and allele cards whose accessible name did not include their visible text (WCAG 2.5.3, found by axe).

## Not automated

Real screen readers (ChromeVox, NVDA, VoiceOver), real Chromebook touchpads and touch screens, Firefox and Safari, and the live site. A Spanish proofread is still needed before publishing the Spanish.
