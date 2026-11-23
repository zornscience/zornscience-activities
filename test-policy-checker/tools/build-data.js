// Builds test-policy-checker/data.js from test-policy-checker/policies.csv, the CSV download of the Google Sheet
// "ZornScience Test Policies" (one row per public university). Run from the repository root:
//   node test-policy-checker/tools/build-data.js
// Do not edit data.js by hand. The yearly recheck changes the Sheet, downloads it as CSV over policies.csv,
// and runs this script. Node only, no dependencies. The script stops with a message on any row it cannot use.
"use strict";
var fs = require("fs");
var path = require("path");

var SOURCE = path.join(__dirname, "..", "policies.csv");
var TARGET = path.join(__dirname, "..", "data.js");

var HEADER = ["State", "School", "Campus type", "Policy category", "Tests accepted", "Exceptions", "Source URL",
  "Date checked", "Status", "Notes", "Cycle", "Exceptions (Spanish)", "ACT or SAT only"];
var POLICIES = {"Test required": "required", "Test optional": "optional", "Test free": "free",
  "Test flexible": "flexible", "Varies by program or applicant": "varies", "Not confirmed": "unknown",
  "No first-year admission": "none"};
var CAMPUS = {"Main campus": "main", "Branch campus": "branch", "Federal service academy": "academy"};
var CYCLES = {"Fall 2027": "2027", "Fall 2026": "2026", "Earlier term": "old", "Not stated": ""};
// What the "ACT or SAT only" column may say, and the code data.js keeps.
var ONLY = {"No": "", "Only ACT named": "act-named", "ACT preferred": "act-preferred", "ACT required": "act-required",
  "SAT preferred": "sat-preferred", "SAT required": "sat-required"};
// State names in English and in Spanish (Fundéu and Style Kit section 6; the rest keep their English names).
var STATES = {
  AL: ["Alabama", "Alabama"], AK: ["Alaska", "Alaska"], AZ: ["Arizona", "Arizona"], AR: ["Arkansas", "Arkansas"],
  CA: ["California", "California"], CO: ["Colorado", "Colorado"], CT: ["Connecticut", "Connecticut"],
  DE: ["Delaware", "Delaware"], DC: ["District of Columbia", "Distrito de Columbia"], FL: ["Florida", "Florida"],
  GA: ["Georgia", "Georgia"], HI: ["Hawaii", "Hawái"], ID: ["Idaho", "Idaho"], IL: ["Illinois", "Illinois"],
  IN: ["Indiana", "Indiana"], IA: ["Iowa", "Iowa"], KS: ["Kansas", "Kansas"], KY: ["Kentucky", "Kentucky"],
  LA: ["Louisiana", "Luisiana"], ME: ["Maine", "Maine"], MD: ["Maryland", "Maryland"],
  MA: ["Massachusetts", "Massachusetts"], MI: ["Michigan", "Míchigan"], MN: ["Minnesota", "Minnesota"],
  MS: ["Mississippi", "Misisipi"], MO: ["Missouri", "Misuri"], MT: ["Montana", "Montana"],
  NE: ["Nebraska", "Nebraska"], NV: ["Nevada", "Nevada"], NH: ["New Hampshire", "Nuevo Hampshire"],
  NJ: ["New Jersey", "Nueva Jersey"], NM: ["New Mexico", "Nuevo México"], NY: ["New York", "Nueva York"],
  NC: ["North Carolina", "Carolina del Norte"], ND: ["North Dakota", "Dakota del Norte"], OH: ["Ohio", "Ohio"],
  OK: ["Oklahoma", "Oklahoma"], OR: ["Oregon", "Oregón"], PA: ["Pennsylvania", "Pensilvania"],
  RI: ["Rhode Island", "Rhode Island"], SC: ["South Carolina", "Carolina del Sur"], SD: ["South Dakota", "Dakota del Sur"],
  TN: ["Tennessee", "Tennessee"], TX: ["Texas", "Texas"], UT: ["Utah", "Utah"], VT: ["Vermont", "Vermont"],
  VA: ["Virginia", "Virginia"], WA: ["Washington", "Washington"], WV: ["West Virginia", "Virginia Occidental"],
  WI: ["Wisconsin", "Wisconsin"], WY: ["Wyoming", "Wyoming"]
};
// Tests accepted, as written in the Sheet, and the same words in Spanish (Style Kit section 6).
var TESTS = {"ACT or SAT": "ACT o SAT", "ACT, SAT or CLT": "ACT, SAT o CLT", "ACT": "ACT", "SAT": "SAT",
  "Not considered": "No se toman en cuenta", "Not named on page": "La página no los nombra",
  "Not confirmed": "Sin confirmar", "Not applicable": "No aplica"};
function testsEs(text) { return TESTS[text]; }

function parseCsv(text) {
  var rows = [], row = [], field = "", quoted = false;
  text = text.replace(/^﻿/, "");
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    if (quoted) {
      if (c === "\"" && text[i + 1] === "\"") { field += "\""; i++; }
      else if (c === "\"") quoted = false;
      else field += c;
    } else if (c === "\"") quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some(function (v) { return v !== ""; })) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// text: the CSV to build from (the tests pass their own); by default, policies.csv.
function build(text) {
  var rows = parseCsv(text === undefined ? fs.readFileSync(SOURCE, "utf8") : text);
  var header = rows.shift().map(function (h) { return h.trim(); });
  if (header.join("|") !== HEADER.join("|")) throw new Error("policies.csv header must be: " + HEADER.join(", "));
  var seen = new Set(), latest = "", schools = [];
  rows.forEach(function (r, i) {
    var line = "policies.csv row " + (i + 2) + " (" + (r[1] || "?") + "): ";
    var v = {};
    HEADER.forEach(function (h, j) { v[h] = (r[j] || "").trim(); });
    function fail(msg) { throw new Error(line + msg); }
    if (!STATES[v.State]) fail("unknown state " + v.State);
    if (!v.School) fail("no school name");
    if (seen.has(v.State + "|" + v.School)) fail("listed twice");
    seen.add(v.State + "|" + v.School);
    if (!CAMPUS[v["Campus type"]]) fail("campus type must be one of " + Object.keys(CAMPUS).join(", "));
    var policy = POLICIES[v["Policy category"]];
    if (!policy) fail("policy category must be one of " + Object.keys(POLICIES).join(", "));
    var tests = v["Tests accepted"];
    if (!Object.hasOwn(TESTS, tests)) fail("tests accepted must be one of " + Object.keys(TESTS).join(", "));
    if ((policy === "free") !== (tests === "Not considered")) fail("Test free rows, and only they, say Not considered");
    if ((policy === "unknown") !== (v.Status === "unverified")) fail("Not confirmed goes with unverified, and only with it");
    if ((policy === "unknown") !== (tests === "Not confirmed")) fail("Not confirmed rows, and only they, say Not confirmed for tests");
    if ((policy === "none") !== (tests === "Not applicable")) fail("No first-year admission rows, and only they, say Not applicable");
    if (v.Status === "unverified" && v.Exceptions) fail("leave the exception empty on an unverified row");
    if (v.Exceptions.length > 120) fail("exception is longer than 120 characters");
    if (!/^https:\/\/[^\s"'<>]+$/.test(v["Source URL"])) fail("source URL must be a full https address");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v["Date checked"])) fail("date checked must be YYYY-MM-DD");
    if (v.Status !== "verified" && v.Status !== "unverified") fail("status must be verified or unverified");
    if (!(v.Cycle in CYCLES)) fail("cycle must be one of " + Object.keys(CYCLES).join(", "));
    if (v.Exceptions && !v["Exceptions (Spanish)"]) fail("exception has no Spanish");
    if (!v.Exceptions && v["Exceptions (Spanish)"]) fail("Spanish exception with no English");
    var only = v["ACT or SAT only"];
    if (!Object.hasOwn(ONLY, only)) fail("ACT or SAT only must be one of " + Object.keys(ONLY).join(", "));
    [v.School, v.Exceptions, v["Exceptions (Spanish)"]].forEach(function (t) { if (/[\u2013\u2014]/.test(t)) fail("en or em dash"); });
    if (v["Date checked"] > latest) latest = v["Date checked"];
    schools.push([v.State, v.School, CAMPUS[v["Campus type"]], policy, tests, testsEs(tests),
      v.Exceptions, v["Exceptions (Spanish)"], v["Source URL"], v["Date checked"], v.Status === "verified" ? 1 : 0,
      CYCLES[v.Cycle], ONLY[only]]);
  });
  schools.sort(function (a, b) { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1].localeCompare(b[1], "en"); });
  Object.keys(STATES).forEach(function (s) {
    if (!schools.some(function (x) { return x[0] === s; })) throw new Error("no schools for " + s);
  });
  var states = {};
  Object.keys(STATES).sort().forEach(function (s) { states[s] = STATES[s]; });
  var out = [
    "// Generated by tools/build-data.js from policies.csv (the Google Sheet \"ZornScience Test Policies\"). Do not edit by hand.",
    "// One school per line: state, school, campus (main, branch, academy), policy (required, optional, free, flexible,",
    "// varies, unknown, none), tests accepted in English and Spanish, exception in English and Spanish, source URL,",
    "// date checked, verified (1) or not (0), cycle (2027, 2026, old, or empty when not stated), and a note when the page",
    "// names or prefers one test (act-named, act-preferred, act-required, sat-preferred, sat-required, or empty).",
    "(function () {",
    "  \"use strict\";",
    "  var root = document.querySelector('[data-zsa-activity=\"test-policy-checker\"]');",
    "  if (!root) return;",
    "  var data = {checked: " + JSON.stringify(latest) + ", states: " + JSON.stringify(states) + ", schools: [",
    schools.map(function (s) { return "    " + JSON.stringify(s); }).join(",\n"),
    "  ]};",
    "  root.addEventListener(\"zsa:request-data\", function (event) { event.detail.receive(data); }, {once: true});",
    "}());",
    ""
  ].join("\n");
  return {text: out, count: schools.length};
}

if (require.main === module) {
  var result = build();
  fs.writeFileSync(TARGET, result.text);
  console.log("wrote " + TARGET + " (" + result.count + " schools)");
}
module.exports = {build: build, parseCsv: parseCsv, HEADER: HEADER, STATES: STATES, POLICIES: POLICIES, TESTS: TESTS, ONLY: ONLY, CYCLES: CYCLES};
