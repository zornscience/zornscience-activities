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

test("all Periodic Trends questions, hints and feedback are Spanish and the science is unchanged", () => {
  const en = localizedData("periodic-trends", "en"), es = localizedData("periodic-trends", "es");
  assert.equal(es.document.title, "Práctica de tendencias periódicas | ZornScience");
  assert.deepEqual(es.data.items, en.data.items);
  assert.deepEqual(es.data.rule, en.data.rule);
  Object.keys(en.data.elements).forEach(symbol => {
    const a = en.data.elements[symbol], b = es.data.elements[symbol];
    for (const key of Object.keys(a).filter(key => key !== "name")) assert.equal(b[key], a[key], symbol + " " + key);
    if (a.name !== "Indium") assert.notEqual(b.name, a.name, symbol);
  });
  // Every English string in ui has a different Spanish string at the same place, except units and placeholders only.
  (function walk(x, y, at) {
    if (typeof x === "string") {
      if (/^( pm| kJ\/mol|)$/.test(x) || /^(\{\w+\}\s*)+$/.test(x) || /^[a-z]+$/.test(x) && at.endsWith(".0")) return;
      assert.equal(typeof y, "string", at);
      assert.notEqual(y, x, at);
      assert.doesNotMatch(y, /[\u2014\u2013]/, at);
      return;
    }
    Object.keys(x).forEach(key => { assert.ok(y && key in y, at + "." + key); walk(x[key], y[key], at + "." + key); });
  })(en.data.ui, es.data.ui, "ui");
  for (const key of ["codeLabel", "copyCode", "codeCopied", "codeReady", "codeSelected", "codeNote", "progress", "hint", "hint2", "show"]) assert.ok(es.data.ui.labels[key], key);
  assert.equal(es.data.ui.labels.progress, "{label} {number} de {total} · Paso {step} de {steps}");
});

test("Lewis builder Spanish translates every structure name and student string while keeping the chemistry and rule values", () => {
  const en = localizedData("lewis-vsepr", "en"), es = localizedData("lewis-vsepr", "es");
  assert.equal(es.document.documentElement.lang, "es-MX");
  assert.equal(es.document.title, "Constructor de estructuras de Lewis y VSEPR | ZornScience");
  assert.deepEqual(es.data.elements, en.data.elements);
  en.data.items.forEach((item, i) => {
    const t = es.data.items[i];
    for (const key of Object.keys(item).filter(k => k !== "name")) assert.deepEqual(t[key], item[key], item.id + " " + key);
    assert.notEqual(t.name, item.name, item.id);
    assert.equal(t.nameEn, item.name);
  });
  // Rule values the builder compares stay English; only shown text changes.
  for (const key of ["egChoices", "egChoicesAp", "mgFamily", "angleFamily", "ideal", "squeezed", "letters"]) assert.deepEqual(es.data.ui[key], en.data.ui[key], key);
  assert.deepEqual(es.data.ui.claims.map(c => c[0]), ["polar", "nonpolar"]);
  assert.deepEqual(es.data.ui.reasons.map(r => r[0]), en.data.ui.reasons.map(r => r[0]));
  Object.keys(es.data.ui.angles).forEach(k => assert.doesNotMatch(es.data.ui.angles[k], /,\d/, "decimal point " + k));
  const same = new Set(["{count} {symbol}", "{v} ({symbol})", "{count} × {v} ({symbol})", "{symbol}: {v}.", "{symbol}: {count} × {v} = {product}.",
    "{who} {value}", "{word} {symbol}", "{list}", "{value} en {atom}", "{a} {aEN} frente a {b} {bEN}", "{symbol} {value}", "{formula} ({name}): {detail}", "{mg}, {angle}",
    "{formula}, {name}", "{Mg}, {angle}", "{Claim}", "{BuildHint}", "Polar", "Polar.", ", polar", "Triple", "VSEPR", "", "A", "B", "C", "+", "−"]);
  (function walk(a, b, where) {
    if (typeof a === "string") { if (!same.has(a) && !/^[\d.°]+$/.test(a)) assert.notEqual(b, a, where); return; }
    if (Array.isArray(a)) { a.forEach((v, i) => walk(v, b[i], where + "." + i)); return; }
    if (a && typeof a === "object") Object.keys(a).forEach(k => {
      if (["egChoices", "egChoicesAp", "mgFamily", "angleFamily", "ideal", "squeezed", "letters", "claims", "reasons"].includes(k) && where === "ui") return;
      walk(a[k], b[k], where + "." + k);
    });
  })(en.data.ui, es.data.ui, "ui");
  const strings = JSON.stringify(es.data.ui) + JSON.stringify(es.data.items.map(x => x.name));
  assert.doesNotMatch(strings, /[\u2013\u2014]/);
  assert.doesNotMatch(strings, /\bión\b|\biones\b.*ión/);
});
