// The one list of which activities open in Spanish. The landing page (home.js) builds every card's link, badge and
// notice from it, and tests/unit/locales.test.js checks it against the activity pages themselves.
//   "es"      Spanish is published: the card links to ?lang=es and shows the EN / ES badge. This is the default for
//             any activity not listed below.
//   "review"  Spanish is written but waits for a bilingual educator to review the whole workflow (instructions,
//             feedback, graphs, exports). The page opens in English, the card says so, and there is no ES toggle.
//             To publish one: turn on its flag (SPANISH_READY in osmosis-lab/data.js, SPANISH_PUBLISHED in
//             fruit-fly-genetics-lab/data.js, spanishReady in yeast-fermentation-lab/data.js, FLAGS.spanishToggle
//             in mitosis-lab/data.js), add its Spanish description to tools/seo-pages.js, and delete its line here.
//   "en"      There is no Spanish version.
(function () {
  "use strict";
  var NOT_PUBLISHED = {
    "osmosis-lab": "review",
    "mitosis-lab": "review",
    "fruit-fly-genetics-lab": "review",
    "yeast-fermentation-lab": "review",
    "enzyme-lab": "en",
    "act": "en",
    "act-question-generator": "en"
  };
  function slug(href) { return String(href).replace(/[?#].*$/, "").replace(/^\.?\//, "").replace(/\/+$/, ""); }
  function status(href) { return Object.hasOwn(NOT_PUBLISHED, slug(href)) ? NOT_PUBLISHED[slug(href)] : "es"; }
  // Link for the Spanish page of an activity, or the plain link when there is no published Spanish.
  function link(href, lang) {
    if (lang !== "es" || status(href) !== "es") return href;
    return href + (href.indexOf("?") >= 0 ? "&" : "?") + "lang=es";
  }
  // The badge on a card: what the student can open, as visible text and as words for a screen reader.
  var BADGES = {
    en: {es: {text: "EN / ES", words: "Available in English and Spanish"}, none: {text: "English only", words: "English only"}},
    es: {es: {text: "EN / ES", words: "Disponible en inglés y español"}, none: {text: "Solo en inglés", words: "Solo en inglés"}}
  };
  function badge(href, lang) { return BADGES[lang === "es" ? "es" : "en"][status(href) === "es" ? "es" : "none"]; }
  var api = {slug: slug, status: status, link: link, badge: badge, NOT_PUBLISHED: NOT_PUBLISHED, EN_NOTE: " (en inglés)"};
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;
  // Same hand-off as shared/zsa-i18n.js: the page asks for the list with an event.
  var root = document.querySelector("[data-zsa-activity]");
  if (root) root.addEventListener("zsa:request-locales", function (event) { event.detail.receive(api); });
}());
