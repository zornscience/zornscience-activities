"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const i18n = require("../../shared/zsa-i18n.js");

test("language is selected only by the supported explicit URL value", () => {
  for (const query of ["", "?lang=en", "?lang=fr", "?lang=ES", "?other=es", "?lang="]) assert.equal(i18n.language(query), "en");
  assert.equal(i18n.language("?embed=1&lang=es&el=Na"), "es");
});

test("activity links retain language and existing parameters, paths and fragments", () => {
  const base = "https://activities.zornscience.org/ion-charge-trainer/?lang=es";
  assert.equal(i18n.link("../periodic-table/?el=Na#details", base, "es"), "https://activities.zornscience.org/periodic-table/?el=Na&lang=es#details");
  assert.equal(i18n.link("?embed=1&lang=es", base, "en"), "https://activities.zornscience.org/ion-charge-trainer/?embed=1");
  assert.equal(i18n.link("../gas-laws/", "https://example.github.io/zornscience-activities/periodic-table/", "es"), "https://example.github.io/zornscience-activities/gas-laws/?lang=es");
  for (const href of ["https://zornscience.org/science/", "https://example.com/periodic-table/", "mailto:teacher@example.com", "javascript:void(0)"]) assert.equal(i18n.link(href, base, "es"), href);
});

test("interpolation preserves decimal points, formulas and missing slots", () => {
  assert.equal(i18n.fill("{name}: {value} {unit}, {unknown}", {name:"Na", value:"35.45", unit:"g/mol"}), "Na: 35.45 g/mol, {unknown}");
  assert.equal(i18n.fill("{count} de {total}", {count:0, total:17}), "0 de 17");
});

function localizedData(slug, lang) {
  const fs = require("node:fs"), vm = require("node:vm"), path = require("node:path");
  const handlers = {};
  const root = {
    tagName:"MAIN", childNodes:[], hasAttribute:() => false,
    querySelector:() => null, querySelectorAll:() => [],
    addEventListener:(name, fn) => { handlers[name] = fn; },
    dispatchEvent:event => { if (handlers[event.type]) handlers[event.type](event); }
  };
  const context = {
    URL, URLSearchParams, location:{search:"?lang=" + lang, href:"https://activities.zornscience.org/" + slug + "/?lang=" + lang},
    document:{querySelector:() => root, documentElement:{}},
    CustomEvent:function (type, options) { this.type = type; this.detail = options.detail; }
  };
  vm.createContext(context);
  for (const file of ["shared/zsa-i18n.js", slug + "/data.js"]) vm.runInContext(fs.readFileSync(path.join(__dirname, "../..", file), "utf8"), context);
  let data;
  root.dispatchEvent(new context.CustomEvent("zsa:request-data", {detail:{receive:value => { data = value; }}}));
  return {data:JSON.parse(JSON.stringify(data)), document:context.document};
}

test("Spanish data translates all 118 names and science notes while preserving chemistry", () => {
  const english = localizedData("periodic-table", "en"), spanish = localizedData("periodic-table", "es");
  assert.equal(spanish.document.documentElement.lang, "es-MX");
  assert.equal(spanish.document.title, "Tabla periódica | ZornScience");
  assert.equal(spanish.data.ui.share.title, "Tabla periódica | ZornScience");
  english.data.elements.forEach((element, index) => {
    const translated = spanish.data.elements[index];
    for (const key of Object.keys(element).filter(key => !["name", "notes", "ions"].includes(key))) assert.deepEqual(translated[key], element[key], element.symbol + " " + key);
    if (element.name !== "Zinc") assert.notEqual(translated.name, element.name, element.name);
    element.notes.forEach((note, n) => assert.notEqual(translated.notes[n], note, note));
    element.ions.forEach((ion, n) => {
      assert.doesNotMatch(translated.ions[n][1], /\b[a-z]+ide\b/, ion[1]);
      assert.equal(translated.ions[n][0], ion[0]);
      assert.notEqual(translated.ions[n][1], ion[1], ion[1]);
    });
  });
  assert.equal(spanish.data.elements[16].mass, "35.45");
});

test("all Ion Charge Trainer hints and misconception feedback are Spanish and science is unchanged", () => {
  const en = localizedData("ion-charge-trainer", "en").data, es = localizedData("ion-charge-trainer", "es").data;
  en.elements.forEach((element, index) => {
    const translated = es.elements[index];
    for (const key of ["symbol", "z", "group", "period", "valence", "charge", "electrons", "direction", "moved", "metal", "chargeLabel"]) assert.equal(translated[key], element[key], element.symbol + " " + key);
    for (const key of ["summary", "reminder", "spoken"]) assert.notEqual(translated[key], element[key]);
    element.hints.forEach((step, n) => step.forEach((hint, level) => assert.notEqual(translated.hints[n][level], hint)));
    element.correct.forEach((text, n) => assert.notEqual(translated.correct[n], text));
    Object.keys(element.feedback).forEach(key => assert.notEqual(translated.feedback[key], element.feedback[key]));
  });
  for (const key of Object.keys(en.ui)) if (typeof en.ui[key] === "string") assert.notEqual(es.ui[key], en.ui[key], key);
  assert.equal(es.ui.codeLabel, "Código de finalización");
});
