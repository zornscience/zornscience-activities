# Inclined Plane & Friction

Version: 1.1.3

Version 1.1.3 improves keyboard and screen reader access. Section headings are now level 2 (they jumped from the page's heading 1 to level 3), with the same look. Every focusable element, including summaries, text areas and custom controls, now shows the same visible focus ring (`shared/zsa-lab-a11y.css`), a blue ring with a white gap that reads on light and dark panels and in high contrast mode. `tests/e2e/labs-a11y.spec.js` now checks this lab in English and Mexican Spanish with axe-core, the Tab order, a visible focus indicator on every stop, names and states of custom controls, and text alternatives for drawings. The science, scoring and any completion code are unchanged.

Version 1.1.2 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

Version 1.1.1 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson.

 Buildless, browser-local ramp simulation. Open index.html through a static server. Uses the shared ZornScience font, branding and embed behavior. No storage or data recording.

Illustrative dry-friction pairs (static, kinetic): wood (.45, .30), felt (.65, .48), plastic (.25, .16). Fixed 1.20 m travel and g = 9.81 m/s². Setup changes reset motion; pause freezes time; slow motion runs at quarter speed. Static friction matches downhill weight up to its maximum. Sliding uses a = g(sin θ − μₖ cos θ). The end stop terminates motion and hides the FBD. Gravity components are dashed and are not extra forces.

## Mexican Spanish

Use `?lang=es` or the EN / ES header links. English is the fallback. All student text, the instructions, controls and surface names, the state badge, explanations and readout labels, the legend, SVG title, description and labels, the physics note, the footer, accessible labels, and the share title, description, status messages and link use the activity's `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. In Spanish the share link carries `?lang=es`. Symbols (N, mg, fₛ, fₖ, μₛ, μₖ, θ), numeric values, units and decimal points stay unchanged. The language links reload the page, so a run in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the Style Kit glossary.
