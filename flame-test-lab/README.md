# Virtual Flame Test Lab

Version: 1.1.1

Version 1.1.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson. It also adds search engine tags from `shared/zsa-seo.js`: hreflang links for English and Spanish, a canonical address that keeps `?lang=es` and drops every other parameter, and a description in each language.

Standalone static lab at `flame-test-lab/`. No runtime dependencies, accounts, tracking, storage or outside requests. Supports `?embed=1` via the existing embed helper.

## Flame tests
Eight known metal chlorides (LiCl, NaCl, KCl, CaCl₂, SrCl₂, BaCl₂, CuCl₂, CsCl) and one unknown sample chosen at random from them. Clicking or tapping a bottle places its sample in the Bunsen burner flame and shows an idealized flame color with a written observation. The tray counts how many known samples have been tested. Clear flame returns to the clean blue flame, and New investigation picks a new unknown and clears the tested marks.

The branded header provides a keyboard-accessible Instructions dialog and Share panel (copy, email, and native sharing when supported). Share links always open a fresh investigation, without the unknown or tested samples.

Open investigations do not issue completion codes.

## Files
| File | What it holds |
|---|---|
| `index.html` | Page shell: header, workbench, sample tray, footer and instructions dialog. |
| `data.js` | Every English string and its Mexican Spanish translation, for the shared language module. |
| `lab.js` | The salts, the flame display, the tray and the readout. |
| `instructions.js` | The Instructions dialog. |
| `share.js` | The Share panel. |
| `lab.css` | Layout, colors and the burner illustration. |

## Changelog
- 1.1.0: Mexican Spanish with `?lang=es` and the shared EN / ES header links. Every sentence is one full template in `data.js`.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, observations, accessible labels, the instructions and share text use the activity's `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. Formulas, symbols and numbers stay unchanged. In Spanish the share link carries `?lang=es`. See `../SPANISH_TERMS.md` for choices beyond the supplied glossary.
