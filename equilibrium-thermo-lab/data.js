(function () {
  "use strict";
  // Chemistry lab chooser: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback.
  var root = document.querySelector('[data-zsa-activity="equilibrium-thermo-lab"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  if (!i18n) return;
  var copy = {title:"Choose a Chemistry Lab", es:{
  "Choose a Chemistry Lab": "Selección de un laboratorio de química",
  "ZornScience home": "Inicio de ZornScience",
  "ZornScience · AP Chemistry": "ZornScience · Química AP",
  "Choose your chemistry lab": "Selección de tu laboratorio de química",
  "These experiments now have their own pages. Choose a lab to get started.": "Estos experimentos ahora tienen sus propias páginas. Elige un laboratorio para empezar.",
  "Equilibrium Sandbox": "Explorador del equilibrio",
  "Explore Le Chatelier’s principle with concentration, volume and temperature changes.": "Explora el principio de Le Châtelier con cambios de concentración, volumen y temperatura.",
  "Calorimetry & Enthalpy Lab": "Laboratorio de calorimetría y entalpía",
  "Investigate heated metals and acid-base neutralization with live temperature traces.": "Investiga metales calientes y la neutralización ácido-base con curvas de temperatura en tiempo real.",
  "← All activities": "← Todas las actividades"
}};
  // configure() rewrites links to absolute URLs; the lab links and the back link keep their relative form, with ?lang=es in Spanish.
  var links = Array.from(root.querySelectorAll('a[href^="../"]')).map(function (a) { return [a, a.getAttribute("href")]; });
  i18n.configure(copy);
  links.forEach(function (pair) { pair[0].setAttribute("href", i18n.lang === "es" ? pair[1] + "?lang=es" : pair[1]); });
}());
