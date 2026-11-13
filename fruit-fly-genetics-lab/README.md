# Genetics Lab: Crossing Fruit Flies

Version: 1.0.0

Standalone Grade 9 Biology lab. Students breed virtual fruit flies (Drosophila melanogaster) to follow two traits, build Punnett squares, compare predicted ratios with seeded offspring counts at growing sample sizes, and use test crosses to infer hidden genotypes. Plain HTML, CSS and classic deferred scripts in strict IIFEs. No build step, no runtime dependencies, no network calls, no storage, no completion code. Licensed CC BY-NC-SA 4.0.

There are no typed answer boxes. Students tap, drag and choose; written work happens on the teacher's worksheet or document, using the Copy my data panel. The only text field is the read-only link in the shared Share panel.

## Files

| File | Contents |
| --- | --- |
| `model.js` | Pure genetics: gametes, Punnett squares, expected ratios, seeded offspring sampling, tallies, test-cross reasoning, mystery flies, checking a student's square. No DOM, clock or `Math.random`. Runs in Node (`module.exports`) and in the page through the `fruit-fly-model` event. |
| `data.js` | Every student-facing string, in one `I18N` object with `en` and `es` keyed by id, plus the `SPANISH_PUBLISHED` flag. Reaches the page through the `fruit-fly-data` event. |
| `lab.js` | Steps, fly and vial drawings (original SVG), the Punnett square (drag, tap-to-place, keyboard), charts, tables and the copy panel. |
| `share.js` | The shared Share panel: a clean link with no seed or answers. |
| `lab.css` | Styles, prefixed `zsa-ff-`. |
| `TEACHER_NOTES.md` | Seeds, answer keys and classroom notes. |

## The traits

| Gene | Dominant | Recessive |
| --- | --- | --- |
| Wing shape | N, normal wings | n, vestigial wings |
| Eye color | R, red eyes | r, sepia eyes |

**Why sepia and not white eyes.** The brief asked for white eyes. In real fruit flies, white (*w*) is on the X chromosome, so its crosses do not follow the autosomal Punnett squares taught here (Morgan's reciprocal crosses show this). Sepia (*se*) is an autosomal recessive eye color on chromosome 3, and vestigial (*vg*) is on chromosome 2, so both traits are inherited as taught and assort independently for the 9 : 3 : 3 : 1 bonus. The trait words live in `data.js` and the letters in `model.js` (`TRAITS`).

## Flow

| Step | What students do |
| --- | --- |
| 1. A family mystery | Normal × vestigial true-breeding parents give 12 offspring, all normal. Students choose an explanation (saved, not graded). Step 5 revisits it. |
| 2. Meet the traits | Allele cards switch each of four alleles. A fly drawing, genotype, zygosity and phenotype update together. Three goals, including "two genotypes that look the same". Word bank with all seven terms. |
| 3. Build a Punnett square | Choose a trait and two parent genotypes. Fill the 2 × 2 square by dragging allele tiles, or tap a tile then a box. Check marks boxes ✓ or ✗; Show me appears after two checks. Then predict, by tapping, how many of 4 boxes show the dominant trait. |
| 4. Run the cross | Raise 8, then 40, then 200 seeded offspring (each unlocks the next; any size can be raised again). The vial fills with flies. A table and a 100% stacked bar chart compare each sample with the prediction. A tap-to-choose reflection follows. |
| 5. From F1 to F2 | NN × nn gives Nn F1 flies. Students build the F1 × F1 square, predict, and raise 8, 40 and 200 F2 offspring. The page compares the F2 ratio with 3 : 1 and with the student's step 1 idea. |
| 6. Mystery parents | Three mystery flies with the dominant phenotype (seeded; always at least one homozygous, one heterozygous, and both traits). A test cross with the homozygous recessive partner gives 10 offspring at a time, up to 40. Students choose the genotype and get evidence-based feedback. |
| 7. Check questions | Four tap-to-answer questions: genotype and phenotype, the "next one must be recessive" misconception, reading a ratio, interpreting a test cross. Feedback for every choice; retry without penalty. |
| ★ Two traits at once | Optional, unlocked by finishing the checks. Choose both parents' genotypes for both genes, place each parent's 4 gametes in the 4 × 4 headers (drag or tap), check, then predict the 16-box ratio and raise 16, 80 and 400 offspring. |
| 9. Copy my data | Copies tab-separated rows: seed, each cross's parents, predicted ratio and counts at each sample size, the mystery flies with answers, the bonus cross if done, and three conclusion sentence starters. A preview shows exactly what is copied. If the clipboard is blocked, the text is selected for Ctrl+C. |

Every step has Redo this step. Start over (with a confirmation dialog) clears everything; the same seed gives the same mystery flies. Steps can be visited in any order, except the bonus. Nothing is scored.

## Seeds

`?seed=NUMBER` (normalized to an unsigned 32-bit integer; zero works) fixes everything for a visit. Without it, each visit draws one seed from `crypto.getRandomValues`. The seed is in the copied data, so a teacher can open the same flies. Each experiment has its own stream (`streamSeed(seed, label)`), so raising 40 offspring never changes the 8 or 200 sample, and Raise again gives a new sample.

## Accessibility

- Choices are native radio buttons in tappable cards. All buttons and cards are at least 44 px.
- Punnett tiles are toggle buttons (`aria-pressed`); boxes are buttons named by row, column and contents. Tap or Enter a tile, then tap or Enter a box. Tapping a filled box with no tile chosen empties it; Escape puts a chosen tile back. Dragging uses pointer events and works with touch and a mouse.
- Results and every placement are announced in one polite live region. Feedback is also shown as text with a ✓, ↻ or i mark, never by color alone.
- Phenotypes are always written out in words. In drawings, vestigial wings differ in shape; eye color is backed by text. Chart segments use solid, hatched, dotted and crossed fills with a legend, and the table beside each chart gives the exact numbers.
- Every drawing has a name (`role="img"` and a title). Nothing flashes. With reduced motion, flies appear all at once and scrolling is instant.
- Focus moves to the step heading only when a student changes step, never on first load.

## Publishing the Spanish

All Spanish is written in `data.js` but has not been proofread. Until it is:

- `SPANISH_PUBLISHED` is `false`, so there is no EN / ES toggle.
- `tools/seo-pages.js` has `es: null`, so there is no Spanish hreflang or sitemap entry.
- The Spanish landing page shows the card's Spanish title with "(en inglés)" and links to the English page (`home.js`).
- `?lang=es` still renders the page in Spanish for review.

To publish: set `SPANISH_PUBLISHED = true`; add the Spanish description to `tools/seo-pages.js` and load `../shared/zsa-i18n.js` (the SEO tests expect a page with Spanish to load it) or adjust that test; remove the folder from `pendingSpanish` in `home.js`; add the lab to `labs` in `tests/e2e/i18n.spec.js`; update the last unit test in `tests/unit/fruit-fly-genetics-lab.test.js`; run `node tools/build-seo.js`; bump the version.

## Links and embedding

The back link defaults to `https://zornscience.org/science/biology/` because no genetics lesson URL was available to verify. `?from=` accepts only HTTPS URLs on exactly zornscience.org with no port or credentials. The About section links the Biology course page for the same reason; add a genetics lesson to `shared/zsa-about.js` once one is published. `?embed=1` uses the shared embed script.

## Changelog

- 1.0.0: First version. Two traits (vestigial wings, sepia eyes), nine steps with an optional dihybrid bonus, seeded offspring at 8, 40 and 200, mystery parents, four check questions, Copy my data, English and unpublished Mexican Spanish.
