# Inclined Plane & Friction

Version: 1.1.2

Version 1.1.2 adds search engine tags from `shared/zsa-seo.js`: hreflang links for English and Spanish, a canonical address that keeps `?lang=es` and drops every other parameter, and a description in each language. The activity itself is unchanged.

Version 1.1.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

 Buildless, browser-local ramp simulation. Open index.html through a static server. Uses the shared ZornScience font, branding and embed behavior. No storage or data recording.

Illustrative dry-friction pairs (static, kinetic): wood (.45, .30), felt (.65, .48), plastic (.25, .16). Fixed 1.20 m travel and g = 9.81 m/s². Setup changes reset motion; pause freezes time; slow motion runs at quarter speed. Static friction matches downhill weight up to its maximum. Sliding uses a = g(sin θ − μₖ cos θ). The end stop terminates motion and hides the FBD. Gravity components are dashed and are not extra forces.

## Mexican Spanish

Use `?lang=es` or the EN / ES header links. English is the fallback. All student text, the instructions, controls and surface names, the state badge, explanations and readout labels, the legend, SVG title, description and labels, the physics note, the footer, accessible labels, and the share title, description, status messages and link use the activity's `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. In Spanish the share link carries `?lang=es`. Symbols (N, mg, fₛ, fₖ, μₛ, μₖ, θ), numeric values, units and decimal points stay unchanged. The language links reload the page, so a run in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.
