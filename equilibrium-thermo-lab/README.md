# Chemistry lab chooser

Version: 1.2.0

Version 1.2.0 restyles the page to match the cards on the Practice Activities index: one card per lab with a small drawn preview (a particle box for the Equilibrium Sandbox, a flask with a thermometer for the Calorimetry lab), the existing description and an "Open lab" button, plus the CC BY-NC-SA 4.0 footer. Each card is one link (its title, stretched over the card), so every URL, link name and test selector is unchanged; "Open lab" is the visible button for that link. The drawings are inline SVG colored by classes in `chooser.css`. Spanish adds "Abrir laboratorio".

Version 1.1.1 adds search engine tags to the page head: a canonical link to the clean activity address, English and Spanish hreflang links (Spanish is ?lang=es), and a English and Mexican Spanish meta description from `tools/seo-pages.js`. Run `node tools/build-seo.js` after changing them.

The previously published combined lab URL remains available as a chooser. The standalone labs are now at `../equilibrium-lab/` and `../calorimetry-lab/`. No simulations run on this page.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES links next to the logo. English is the fallback. The heading, the lab names and descriptions, "Open lab", the back link and the logo's accessible name come from `data.js`. In Spanish the links to both labs and the back link carry `?lang=es`, so students stay in Spanish; in English they keep their relative form.
