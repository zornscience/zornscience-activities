(function () {
  "use strict";
  function shuffle(items, random) {
    var result = items.slice(), rng = random || Math.random;
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), old = result[i];
      result[i] = result[j]; result[j] = old;
    }
    return result;
  }
  function makeSet(bank, topic, random) {
    return shuffle(bank.filter(function (q) { return topic === "mixed" || q.topic === topic; }), random).map(function (q) {
      return {question:q, order:q.type === "mc" ? shuffle(q.choices.map(function (_, i) { return i; }), random) : []};
    });
  }
  function parse(raw) {
    // No partial parsing: reject commas, arithmetic, non-finite values, and trailing junk.
    var match = String(raw).trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)(?:\s+([\p{L}%/]+))?$/u);
    if (!match) return null;
    var value = Number(match[1]);
    if (!Number.isFinite(value)) return null;
    var mantissa = match[1].split(/[eE]/)[0].replace(/^[+-]/, "");
    var digits = mantissa.replace(".", "").replace(/^0+/, "");
    if (mantissa.indexOf(".") < 0) digits = digits.replace(/0+$/, "");
    var decimals = Math.max(0, (mantissa.split(".")[1] || "").length - Number((match[1].split(/[eE]/)[1] || "0")));
    return {value:value, sf:digits.length || 1, decimals:decimals, suffix:match[2] || ""};
  }
  function unitMatches(raw, expected) {
    var aliases = {M:["M", "mol/L"], K:["K", "kelvin"], atoms:["atoms", "atom", "átomos", "átomo"], count:["count", "cantidad", "electrons", "electrones"], ratio:["ratio"], degrees:["degrees", "degree", "grados", "grado"]};
    return raw === expected || !!(aliases[expected] && aliases[expected].indexOf(raw) >= 0);
  }
  function inspect(q, raw, unit) {
    var parsed = parse(raw);
    if (!parsed) return {valid:false, reason:"number"};
    if (!unit) return {valid:false, reason:"unit"};
    var valueOK = q.precision.exact ? parsed.value === q.value : Math.abs(parsed.value - q.value) <= q.tolerance + Math.abs(q.value) * Number.EPSILON * 4;
    var unitOK = unit === q.unit && (!parsed.suffix || unitMatches(parsed.suffix, q.unit));
    var precisionOK = q.precision.exact ? Number.isInteger(parsed.value) : q.precision.sf ? parsed.sf === q.precision.sf : parsed.decimals === q.precision.decimals;
    return {valid:true, correct:valueOK && unitOK, valueOK:valueOK, unitOK:unitOK, precisionOK:precisionOK};
  }
  function lessonLink(raw, lang) {
    var fallback = "https://zornscience.org/science/ap-chemistry/";
    try {
      var url = new URL(raw || fallback);
      if (url.origin !== "https://zornscience.org" || url.username || url.password) url = new URL(fallback);
      if (lang === "es" && !url.pathname.startsWith("/es/")) url.pathname = "/es" + url.pathname;
      if (lang !== "es" && url.pathname.startsWith("/es/")) url.pathname = url.pathname.slice(3);
      return url.href;
    } catch (_) { return lang === "es" ? "https://zornscience.org/es/science/ap-chemistry/" : fallback; }
  }
  var api = {shuffle:shuffle, makeSet:makeSet, parse:parse, inspect:inspect, lessonLink:lessonLink};
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="apchem-unit3-practice"]');
  if (root) root.addEventListener("zsa:request-model", function (event) { event.detail.receive(api); });
}());
