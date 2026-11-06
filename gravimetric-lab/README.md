Version: 1.1.2

Version 1.1.2 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

Version 1.1.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

Realistic illustrated bench simulation of U6.A2 gravimetric analysis. No data-entry fields, persistence, or network requests. The simulation starts with sodium carbonate, identified as sample A. Uses the existing shared ZornScience branding and header controls. Heat, cool, precipitate, settle, filter, wash, and dry to constant mass. Model assumes quantitative recovery; residual moisture adds 0.032 g to the first precipitate weighing.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, step titles, instructions, action buttons, observations, SVG labels, title and description, accessible labels, the result and the share title, description and link use the activity's `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. In Spanish the share link carries `?lang=es`. Formulas, numeric values, units and decimal points stay unchanged. The language links reload the page, so a procedure in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the supplied glossary.
