// Test Policy Checker: a map of the United States and a list of every public four-year university in the chosen state,
// with its ACT and SAT policy for fall 2027 entry, the tests it accepts, one exception line and the page that was checked.
// Students choose a state on the map (one Tab stop, arrow keys move between states), in the State list or with the
// small-state buttons; or search every state by school name; and can show one policy only. The view is kept in the
// address (?state=, ?policy=, ?q=) so a link reopens it. Schools come from data.js, the map from map.js and the words
// from copy.js through one-use events; nothing is stored or sent anywhere.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="test-policy-checker"]');
  if (!root) return;
  function ask(name) {
    var value;
    root.dispatchEvent(new CustomEvent(name, {detail: {receive: function (v) { value = v; }}}));
    return value;
  }
  var data = ask("zsa:request-data"), map = ask("zsa:request-map"), copy = ask("zsa:request-copy"), i18n = ask("zsa:request-i18n");
  if (!data || !map || !copy) return;
  if (i18n) i18n.configure(copy);
  var es = !!(i18n && i18n.lang === "es");
  function fill(text, values) { return text.replace(/\{(\w+)\}/g, function (m, k) { return values && values[k] !== undefined ? values[k] : m; }); }
  function t(text, values) { return i18n ? i18n.text(text, values || {}) : fill(text, values); }

  var SVG = "http://www.w3.org/2000/svg";
  var POLICIES = ["required", "optional", "free", "flexible", "varies", "unknown", "none"];
  var LABEL = {required: "Test required", optional: "Test optional", free: "Test free", flexible: "Test flexible",
    varies: "Varies", unknown: "Not confirmed", none: "No first-year admission"};
  var MEANING = {
    required: "Every first-year applicant sends an ACT or SAT score.",
    optional: "You choose whether to send a score. If you send one, the college looks at it.",
    free: "The college does not look at ACT or SAT scores for admission, even if you send them.",
    flexible: "A score is one way to qualify. A GPA or class rank can qualify you without one.",
    varies: "Whether you need a score depends on your GPA, your program or the kind of applicant you are.",
    unknown: "We could not confirm this policy on the college's own page. Check its admissions page.",
    none: "This university admits transfer students only, not first-year students."
  };
  var CYCLE = {"2027": "This page covers fall 2027.", "2026": "This page names fall 2026 only. Confirm the rule for fall 2027.",
    old: "This page names an earlier year only. Confirm the rule for fall 2027.", "": "This page does not name a year."};
  var ONLY = {"act-named": "The page names only the ACT. Ask the college whether it takes the SAT.",
    "act-preferred": "The page prefers the ACT but also takes the SAT.", "act-required": "The page requires the ACT.",
    "sat-preferred": "The page prefers the SAT but also takes the ACT.", "sat-required": "The page requires the SAT."};
  var MONTHS = {en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]};

  // One object per school, from the compact rows in data.js.
  var schools = data.schools.map(function (r) {
    return {state: r[0], name: r[1], campus: r[2], policy: r[3], tests: es ? r[5] : r[4], exception: es ? r[7] : r[6],
      url: r[8], checked: r[9], verified: r[10] === 1, cycle: r[11], only: r[12], key: fold(r[1])};
  });
  var byState = {};
  Object.keys(data.states).forEach(function (s) { byState[s] = []; });
  schools.forEach(function (s) { byState[s.state].push(s); });
  function stateName(code) { return data.states[code][es ? 1 : 0]; }
  var codes = Object.keys(data.states).sort(function (a, b) { return stateName(a).localeCompare(stateName(b), es ? "es" : "en"); });

  function fold(text) { return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
  function date(iso) {
    var p = iso.split("-").map(Number), m = MONTHS[es ? "es" : "en"][p[1] - 1];
    return es ? p[2] + " de " + m + " de " + p[0] : m + " " + p[2] + ", " + p[0];
  }
  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function $(id) { return root.querySelector("#zsa-tpc-" + id); }

  // ---------- State from the address ----------
  var params = new URLSearchParams(window.location.search);
  var view = {state: null, policy: "all", q: ""};
  var startState = (params.get("state") || "").toUpperCase();
  if (data.states[startState]) view.state = startState;
  if (POLICIES.indexOf(params.get("policy")) >= 0) view.policy = params.get("policy");
  view.q = (params.get("q") || "").slice(0, 80);
  function syncUrl() {
    var p = new URLSearchParams(window.location.search);
    ["state", "policy", "q"].forEach(function (k) { p.delete(k); });
    if (view.q) p.set("q", view.q); else if (view.state) p.set("state", view.state);
    if (view.policy !== "all") p.set("policy", view.policy);
    var query = p.toString();
    try { window.history.replaceState(null, "", window.location.pathname + (query ? "?" + query : "") + window.location.hash); } catch (err) { /* a sandboxed frame may refuse */ }
  }
  // ?from= adds a back link to the lesson, for https://zornscience.org/ pages only.
  (function () {
    var raw = params.get("from"), back = $("back");
    if (!raw || !back) return;
    try {
      var u = new URL(raw);
      if (u.protocol !== "https:" || u.hostname !== "zornscience.org" || u.port || u.username || u.password) return;
      back.href = u.href;
      if (!root.classList.contains("zsa--embedded")) back.hidden = false;
    } catch (err) { /* not a URL */ }
  }());

  // ---------- Controls ----------
  var select = $("state"), search = $("search"), filter = $("policy"), live = $("live");
  codes.forEach(function (c) {
    var o = node("option", "", stateName(c)); o.value = c; select.appendChild(o);
  });
  var totals = {};
  POLICIES.forEach(function (p) { totals[p] = 0; });
  schools.forEach(function (s) { totals[s.policy]++; });
  POLICIES.forEach(function (p) {
    if (!totals[p]) return;
    var o = node("option", "", t("{label} ({n})", {label: t(LABEL[p]), n: totals[p]})); o.value = p; filter.appendChild(o);
  });
  select.value = view.state || "";
  filter.value = view.policy;
  search.value = view.q;
  select.addEventListener("change", function () { choose(select.value || null, false); });
  filter.addEventListener("change", function () { view.policy = filter.value; render(true); });
  search.addEventListener("input", function () { view.q = search.value.trim().slice(0, 80); if (view.q) view.state = null; render(false); });
  root.querySelector("#zsa-tpc-controls").addEventListener("submit", function (e) { e.preventDefault(); });

  // ---------- Legend ----------
  var legend = $("legend");
  POLICIES.forEach(function (p) {
    var dt = node("dt"); dt.appendChild(badge(p));
    legend.appendChild(dt); legend.appendChild(node("dd", "", t(MEANING[p])));
  });
  function badge(p) {
    var b = node("span", "zsa-tpc-badge zsa-tpc-badge--" + p);
    var mark = node("span", "zsa-tpc-mark"); mark.setAttribute("aria-hidden", "true");
    b.appendChild(mark); b.appendChild(document.createTextNode(t(LABEL[p])));
    return b;
  }

  // ---------- Map ----------
  var svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", "0 0 " + map.width + " " + map.height);
  svg.setAttribute("class", "zsa-tpc-svg");
  svg.setAttribute("role", "group");
  svg.setAttribute("aria-label", t("Map of the United States. Choose a state to see its public universities."));
  svg.setAttribute("aria-describedby", "zsa-tpc-map-help");
  var shapes = {}, labels = {}, order = Object.keys(map.states).sort();
  var focusCode = view.state || "IL";
  order.forEach(function (code) {
    var s = map.states[code];
    var g = document.createElementNS(SVG, "g");
    g.setAttribute("class", "zsa-tpc-state");
    g.setAttribute("role", "button");
    g.setAttribute("tabindex", code === focusCode ? "0" : "-1");
    g.setAttribute("data-state", code);
    var path = document.createElementNS(SVG, "path");
    path.setAttribute("d", s.d);
    g.appendChild(path);
    if (!s.small) {
      var label = document.createElementNS(SVG, "text");
      label.setAttribute("x", s.label[0]); label.setAttribute("y", s.label[1]);
      label.setAttribute("aria-hidden", "true");
      label.textContent = code;
      g.appendChild(label);
      labels[code] = label;
    }
    g.addEventListener("click", function () { choose(code, true); });
    g.addEventListener("keydown", function (e) { mapKey(e, code); });
    shapes[code] = g;
    svg.appendChild(g);
  });
  $("map").appendChild(svg);
  // Hawaii's islands are too small to tap one by one: an invisible box around them takes the click.
  ["HI"].forEach(function (code) {
    var box = shapes[code].querySelector("path").getBBox(), hit = document.createElementNS(SVG, "rect");
    hit.setAttribute("class", "zsa-tpc-hit");
    hit.setAttribute("x", box.x - 6); hit.setAttribute("y", box.y - 6);
    hit.setAttribute("width", box.width + 12); hit.setAttribute("height", box.height + 12);
    shapes[code].insertBefore(hit, shapes[code].firstChild);
  });
  var smalls = $("small");
  order.filter(function (c) { return map.states[c].small; }).forEach(function (c) {
    var b = node("button", "zsa-btn zsa-tpc-small", c);
    b.type = "button"; b.setAttribute("data-state", c);
    b.addEventListener("click", function () { choose(c, false); });
    smalls.appendChild(b);
  });

  // Arrow keys move to the nearest state in that direction (by label point), Home and End to the first and last.
  function mapKey(e, code) {
    var dir = {ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1]}[e.key];
    var next = null;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(code, true); return; }
    if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    else if (dir) {
      var from = map.states[code].label, best = Infinity;
      order.forEach(function (c) {
        if (c === code) return;
        var to = map.states[c].label, dx = to[0] - from[0], dy = to[1] - from[1];
        var along = dx * dir[0] + dy * dir[1], across = Math.abs(dx * dir[1] - dy * dir[0]);
        if (along <= 0 || across > along * 1.5) return;
        var score = along + across * 2;
        if (score < best) { best = score; next = c; }
      });
    } else return;
    e.preventDefault();
    if (next) moveFocus(next);
  }
  function moveFocus(code) {
    Object.keys(shapes).forEach(function (c) { shapes[c].setAttribute("tabindex", c === code ? "0" : "-1"); });
    shapes[code].focus();
  }

  // ---------- Choosing and rendering ----------
  function choose(code, fromMap) {
    view.state = code;
    view.q = "";
    search.value = "";
    if (code && shapes[code] && !fromMap) Object.keys(shapes).forEach(function (c) { shapes[c].setAttribute("tabindex", c === code ? "0" : "-1"); });
    render(true);
    if (code && window.matchMedia && window.matchMedia("(max-width: 959px)").matches) {
      $("results-title").scrollIntoView({block: "start"});
    }
  }
  function matches(s) { return view.policy === "all" || s.policy === view.policy; }
  function shade(n) { return n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 10 ? 3 : 4; }

  function renderMap() {
    var filtering = view.policy !== "all";
    $("shade-note").hidden = !filtering;
    order.forEach(function (code) {
      var list = byState[code], g = shapes[code];
      var n = filtering ? list.filter(matches).length : list.length;
      g.setAttribute("aria-pressed", code === view.state ? "true" : "false");
      g.setAttribute("data-shade", filtering ? String(shade(n)) : "");
      var shown = filtering ? code + " " + n : code;
      // The spoken name starts with the visible label (for voice control), then says it in words.
      g.setAttribute("aria-label", shown + ", " + (filtering ? t("{state}, {n} with this policy", {state: stateName(code), n: n}) :
        t(n === 1 ? "{state}, 1 public university" : "{state}, {n} public universities", {state: stateName(code), n: n})));
      if (labels[code]) labels[code].textContent = shown;
    });
    smalls.querySelectorAll("button").forEach(function (b) {
      var c = b.getAttribute("data-state"), n = filtering ? byState[c].filter(matches).length : byState[c].length;
      b.textContent = filtering ? c + " " + n : c;
      b.setAttribute("aria-label", b.textContent + ", " + (filtering ? t("{state}, {n} with this policy", {state: stateName(c), n: n}) :
        t(n === 1 ? "{state}, 1 public university" : "{state}, {n} public universities", {state: stateName(c), n: n})));
      b.setAttribute("aria-pressed", c === view.state ? "true" : "false");
    });
  }

  function card(s, showState) {
    var li = node("li", "zsa-tpc-school");
    li.appendChild(node("h3", "", s.name));
    var tags = node("p", "zsa-tpc-tags");
    tags.appendChild(badge(s.policy));
    if (showState) tags.appendChild(node("span", "zsa-tpc-tag", stateName(s.state)));
    if (s.campus === "branch") tags.appendChild(node("span", "zsa-tpc-tag", t("Branch campus")));
    if (s.campus === "academy") tags.appendChild(node("span", "zsa-tpc-tag", t("Federal service academy")));
    li.appendChild(tags);
    if (s.policy === "unknown" || s.policy === "none") li.appendChild(node("p", "zsa-tpc-exception", t(MEANING[s.policy])));
    else {
      var tests = node("p", "zsa-tpc-tests");
      tests.appendChild(node("strong", "", t("Tests accepted:")));
      tests.appendChild(document.createTextNode(" " + s.tests));
      li.appendChild(tests);
      if (s.exception) li.appendChild(node("p", "zsa-tpc-exception", s.exception));
      if (s.only) li.appendChild(node("p", "zsa-tpc-note", t(ONLY[s.only])));
      li.appendChild(node("p", "zsa-tpc-note", t(CYCLE[s.cycle])));
    }
    var source = node("p", "zsa-tpc-source");
    var a = node("a", "", t("Admissions testing page"));
    a.href = s.url; a.target = "_blank"; a.rel = "noopener noreferrer";
    if (es) a.appendChild(document.createTextNode(t(" (in English)")));
    a.appendChild(node("span", "zsa-sr-only", t(" (opens in a new tab)")));
    source.appendChild(a);
    source.appendChild(node("span", "zsa-tpc-checked", t("Checked {date}", {date: date(s.checked)})));
    li.appendChild(source);
    return li;
  }

  function summary(list) {
    var counts = {};
    list.forEach(function (s) { counts[s.policy] = (counts[s.policy] || 0) + 1; });
    var p = node("p", "zsa-tpc-summary");
    p.appendChild(node("span", "zsa-tpc-summary-label", t("Schools by policy:")));
    POLICIES.forEach(function (k) {
      if (!counts[k]) return;
      var item = node("span", "zsa-tpc-summary-item");
      item.appendChild(badge(k));
      item.appendChild(document.createTextNode(" " + counts[k]));
      p.appendChild(item);
    });
    return p;
  }

  function render(announce) {
    select.value = view.state || "";
    renderMap();
    var title = $("results-title"), status = $("results-status"), list = $("list"), extra = $("results-summary");
    list.textContent = ""; extra.textContent = ""; status.textContent = "";
    var heading, shown;
    if (view.q) {
      var words = fold(view.q).split(" ").filter(Boolean);
      var found = schools.filter(function (s) { return words.every(function (w) { return s.key.indexOf(w) >= 0; }); });
      shown = found.filter(matches);
      heading = shown.length === 0 ? t("No school matches “{q}”. Try one word of the name, such as State or Tech.", {q: view.q}) :
        t(shown.length === 1 ? "1 school matches “{q}”" : "{n} schools match “{q}”", {n: shown.length, q: view.q});
      shown.forEach(function (s) { list.appendChild(card(s, true)); });
    } else if (view.state) {
      var all = byState[view.state], name = stateName(view.state);
      shown = all.filter(matches);
      heading = t(all.length === 1 ? "{state}: 1 public university" : "{state}: {n} public universities", {state: name, n: all.length});
      if (view.policy !== "all") {
        status.textContent = shown.length ? t("{shown} of {n} have this policy: {policy}.", {shown: shown.length, n: all.length, policy: t(LABEL[view.policy])}) :
          t("None of the public universities in {state} have this policy: {policy}.", {state: name, policy: t(LABEL[view.policy])});
      }
      extra.appendChild(summary(all));
      shown.forEach(function (s) { list.appendChild(card(s, false)); });
    } else {
      heading = t("Choose a state on the map or from the list, or search for a school.");
      status.textContent = t("{n} public universities in the 50 states and Washington, DC, checked {date}.", {n: schools.length, date: date(data.checked)});
      if (view.policy !== "all") {
        shown = schools.filter(matches);
        heading = t("{n} schools in all states have this policy: {policy}", {n: shown.length, policy: t(LABEL[view.policy])});
        shown.forEach(function (s) { list.appendChild(card(s, true)); });
      }
    }
    title.textContent = heading;
    list.hidden = !list.children.length;
    if (announce) live.textContent = heading + (status.textContent ? " " + status.textContent : "");
    syncUrl();
  }
  render(false);
}());
