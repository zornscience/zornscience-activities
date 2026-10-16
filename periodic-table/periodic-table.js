// Periodic Table reference: the 18-column table with the f-block rows below, five color modes (category, block and
// heatmaps of atomic radius, electronegativity and first ionization energy) with a legend and trend arrows, search,
// an element details panel, a keyboard grid with one Tab stop, and views linkable with URL parameters.
// Data and every word on the page come from data.js through a one-use "zsa:request-data" event.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="periodic-table"]');
  if (!root) return;
  var data;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  if (!data) return;
  var ui = data.ui, els = data.elements;

  function $(id) { return root.querySelector("#zsa-pt-" + id); }
  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function fill(template, ctx) { return template.replace(/\{(\w+)\}/g, function (m, k) { return ctx[k]; }); }
  // Charges number first with a true minus sign: 2+, 1−.
  function chargeLabel(q) { return Math.abs(q) + (q > 0 ? "+" : "−"); }

  var ALIASES = {aluminium: "Al", caesium: "Cs", sulphur: "S"}; // British spellings students may type
  var byZ = {}, at = {};
  els.forEach(function (e) { byZ[e.z] = e; at[e.row + "," + e.col] = e; });
  var modes = {};
  ui.modes.forEach(function (m) { modes[m.id] = m; });
  var grid = $("grid"), scroller = $("scroll"), details = $("details"), detailsBody = $("details-body"), detailsTitle = $("details-title");
  var trendsBox = $("trend-text"), status = $("status"), query = $("query");
  var state = {mode: "category", trends: true, active: 1, selected: null, open: false, from: null};
  var cells = {};

  // ---------- URL parameters (the only way a view is remembered) ----------
  var params = new URLSearchParams(window.location.search);
  if (modes[params.get("mode")]) state.mode = params.get("mode");
  if (params.get("trends") === "0") state.trends = false;
  var start = find(params.get("el") || "");
  // ?from= sets the back link, for https://zornscience.org/ pages only.
  (function () {
    var raw = params.get("from");
    if (!raw) return;
    try {
      var u = new URL(raw);
      if (u.protocol !== "https:" || u.hostname !== "zornscience.org" || u.port || u.username || u.password) return;
      state.from = u.href;
      var back = $("back");
      back.href = u.href; back.textContent = ui.backToLesson;
    } catch (err) { /* not a URL: keep the default link */ }
  }());
  function syncUrl() {
    var p = new URLSearchParams(window.location.search);
    p.set("mode", state.mode);
    if (state.selected && state.open) p.set("el", byZ[state.selected].symbol); else p.delete("el");
    if (!state.trends) p.set("trends", "0"); else p.delete("trends");
    var url = window.location.pathname + "?" + p.toString();
    try { window.history.replaceState(null, "", url); } catch (err) { /* a sandboxed frame may refuse; the view still works */ }
  }

  // ---------- The table ----------
  function buildGrid() {
    grid.setAttribute("aria-label", ui.gridLabel);
    var head = node("thead"), hr = node("tr");
    var corner = node("td", "zsa-pt-corner"); hr.appendChild(corner);
    for (var g = 1; g <= 18; g++) { var th = node("th", "zsa-pt-colhead", String(g)); th.scope = "col"; th.appendChild(node("span", "zsa-sr-only", " " + ui.details.group.toLowerCase())); hr.appendChild(th); }
    head.appendChild(hr); grid.appendChild(head);
    var body = node("tbody");
    for (var r = 1; r <= 9; r++) {
      if (r === 8) {
        var gap = node("tr", "zsa-pt-gaprow"); gap.setAttribute("aria-hidden", "true");
        var gapCell = node("td"); gapCell.colSpan = 19; gap.appendChild(gapCell); body.appendChild(gap);
      }
      var tr = node("tr", r >= 8 ? "zsa-pt-frow" : "");
      var rh;
      if (r <= 7) { rh = node("th", "zsa-pt-rowhead", String(r)); rh.appendChild(node("span", "zsa-sr-only", " " + ui.details.period.toLowerCase())); }
      else { rh = node("th", "zsa-pt-rowhead zsa-pt-flabel", r === 8 ? ui.lanthanides : ui.actinides); rh.colSpan = 3; }
      rh.scope = "row"; tr.appendChild(rh);
      for (var c = r >= 8 ? 3 : 1; c <= 18; c++) {
        var e = at[r + "," + c], td;
        if (e) td = elementCell(e);
        else if (r <= 7 && c === 3 && ui.placeholder[r]) {
          td = node("td", "zsa-pt-placeholder");
          var span = node("span", "", ui.placeholder[r][0]); span.setAttribute("aria-hidden", "true");
          td.appendChild(span); td.appendChild(node("span", "zsa-sr-only", ui.placeholder[r][1]));
        } else td = node("td", "zsa-pt-empty");
        tr.appendChild(td);
      }
      body.appendChild(tr);
    }
    grid.appendChild(body);
  }
  function elementCell(e) {
    var td = node("td", "zsa-pt-el");
    td.id = "zsa-pt-el-" + e.z; td.tabIndex = -1; td.setAttribute("role", "gridcell");
    var visual = node("span", "zsa-pt-cell"); visual.setAttribute("aria-hidden", "true");
    visual.appendChild(node("span", "zsa-pt-num", String(e.z)));
    visual.appendChild(node("span", "zsa-pt-sym", e.symbol));
    var value = node("span", "zsa-pt-val");
    visual.appendChild(value);
    var spoken = node("span", "zsa-sr-only");
    td.appendChild(visual); td.appendChild(spoken);
    td.addEventListener("click", function () { activate(e.z, false); openDetails(e.z, true); });
    cells[e.z] = {td: td, value: value, spoken: spoken};
    return td;
  }
  function binOf(m, v) {
    for (var i = 0; i < m.bins.length - 1; i++) if (v < m.bins[i + 1]) return i;
    return m.bins.length - 2;
  }
  function format(m, v) { return m.key === "en" ? v.toFixed(2).replace(/0$/, "") : String(v); }
  function valuePhrase(m, e) {
    var v = e[m.key];
    if (v === null) return m.label + ": " + ui.noDataSpoken;
    return m.label + " " + format(m, v) + (m.spokenUnit ? " " + m.spokenUnit : "");
  }
  function paint() {
    var m = modes[state.mode];
    root.setAttribute("data-zsa-pt-mode", state.mode);
    els.forEach(function (e) {
      var c = cells[e.z], cls = "zsa-pt-el", text = "", phrase;
      if (state.mode === "category") { cls += " zsa-pt-cat-" + e.category; phrase = ui.categoryName[e.category]; }
      else if (state.mode === "block") { cls += " zsa-pt-blk-" + e.block; text = e.block; phrase = e.block + "-block"; }
      else {
        var v = e[m.key];
        if (v === null) { cls += " zsa-pt-none"; text = "n/a"; }
        else { cls += " zsa-pt-h" + binOf(m, v); text = format(m, v); }
        phrase = valuePhrase(m, e);
      }
      if (e.z === state.selected) cls += " zsa-pt-selected";
      c.td.className = cls;
      c.value.textContent = text;
      c.spoken.textContent = e.name + ", " + e.symbol + ", " + ui.atomicNumber + " " + e.z + ", " + phrase;
      if (e.z === state.selected) c.td.setAttribute("aria-selected", "true"); else c.td.removeAttribute("aria-selected");
    });
    legend(m);
    var heat = !!m.bins;
    $("trends-label").hidden = !heat;
    var arrows = heat && state.trends;
    root.classList.toggle("zsa-pt--arrows", arrows);
    $("across").hidden = !arrows; $("down").hidden = !arrows;
    trendsBox.replaceChildren();
    if (heat) {
      $("across-text").textContent = ui.across + ": " + ui.trendWord[m.across];
      $("down-text").textContent = ui.down + ": " + ui.trendWord[m.down];
      root.setAttribute("data-zsa-pt-across", m.across); root.setAttribute("data-zsa-pt-down", m.down);
      if (state.trends) [m.acrossText, m.downText, m.extra].forEach(function (t) { if (t) trendsBox.appendChild(node("p", "", t)); });
    }
    root.querySelectorAll("#zsa-pt-mode-list input").forEach(function (input) { input.checked = input.value === state.mode; });
  }
  function legend(m) {
    var list = $("legend"), title = $("key-title");
    list.replaceChildren();
    function item(cls, text) {
      var li = node("li"), sw = node("span", "zsa-pt-swatch " + cls); sw.setAttribute("aria-hidden", "true");
      li.appendChild(sw); li.appendChild(node("span", "", text)); list.appendChild(li);
    }
    if (state.mode === "category") { title.textContent = m.label; ui.categories.forEach(function (c) { item("zsa-pt-cat-" + c[0], c[1]); }); return; }
    if (state.mode === "block") { title.textContent = m.label; ui.blocks.forEach(function (b) { item("zsa-pt-blk-" + b[0], b[1]); }); return; }
    title.textContent = m.label + " (" + (m.unit || ui.paulingScale) + ")";
    for (var i = 0; i < m.bins.length - 1; i++) item("zsa-pt-h" + i, fill(ui.range, {low: format(m, m.bins[i]), high: format(m, m.bins[i + 1])}));
    item("zsa-pt-none", ui.noData);
  }

  // ---------- Keyboard grid: one Tab stop, arrows skip the gaps ----------
  function activate(z, focus) {
    if (cells[state.active]) cells[state.active].td.tabIndex = -1;
    state.active = z; cells[z].td.tabIndex = 0;
    if (focus) { cells[z].td.focus({preventScroll: true}); reveal(z, true); }
  }
  // Scroll the table region (never the page sideways) so the cell is visible.
  function reveal(z, page) {
    var td = cells[z].td, box = scroller.getBoundingClientRect(), r = td.getBoundingClientRect();
    if (r.left < box.left + 4) scroller.scrollLeft -= box.left - r.left + 40;
    else if (r.right > box.right - 4) scroller.scrollLeft += r.right - box.right + 40;
    r = td.getBoundingClientRect();
    if (page && !root.classList.contains("zsa--embedded") && (r.top < 0 || r.bottom > window.innerHeight)) td.scrollIntoView({block: "nearest", inline: "nearest"});
  }
  var ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  function rowCols(r) { var out = []; for (var c = 1; c <= 18; c++) if (at[r + "," + c]) out.push(c); return out; }
  function move(e, key, ctrl) {
    var r = e.row, c = e.col, cols = rowCols(r), target = null;
    if (key === "ArrowRight") { var right = cols.filter(function (x) { return x > c; }); if (right.length) target = at[r + "," + right[0]]; }
    else if (key === "ArrowLeft") { var left = cols.filter(function (x) { return x < c; }); if (left.length) target = at[r + "," + left[left.length - 1]]; }
    else if (key === "Home") target = ctrl ? byZ[1] : at[r + "," + cols[0]];
    else if (key === "End") target = ctrl ? byZ[118] : at[r + "," + cols[cols.length - 1]];
    else if (key === "ArrowDown" || key === "ArrowUp") {
      var step = key === "ArrowDown" ? 1 : -1, i;
      // The next row in that direction with an element in this column; failing that, the nearest element in the
      // next row (from beryllium up to hydrogen, from radium down to lanthanum).
      for (i = r + step; i >= 1 && i <= 9 && !target; i += step) target = at[i + "," + c] || null;
      if (!target && ROWS.indexOf(r + step) >= 0) {
        var next = rowCols(r + step), best = null;
        next.forEach(function (x) { if (best === null || Math.abs(x - c) < Math.abs(best - c)) best = x; });
        if (best !== null) target = at[(r + step) + "," + best];
      }
    }
    return target;
  }
  grid.addEventListener("keydown", function (ev) {
    var td = ev.target.closest && ev.target.closest(".zsa-pt-el");
    if (!td) return;
    var e = byZ[Number(td.id.split("-").pop())];
    if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openDetails(e.z, true); return; }
    if (ev.key === "Escape") { if (state.open) { ev.preventDefault(); closeDetails(); } return; }
    var target = move(e, ev.key, ev.ctrlKey || ev.metaKey);
    if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"].indexOf(ev.key) < 0) return;
    ev.preventDefault();
    if (target) activate(target.z, true);
  });
  grid.addEventListener("focusin", function (ev) {
    var td = ev.target.closest && ev.target.closest(".zsa-pt-el");
    if (td) activate(Number(td.id.split("-").pop()), false);
  });

  // ---------- Details panel ----------
  function row(dl, label, value) {
    dl.appendChild(node("dt", "", label));
    var dd = node("dd");
    if (typeof value === "string") dd.textContent = value; else dd.appendChild(value);
    dl.appendChild(dd);
  }
  // "1s2 2s2 2p6" with real superscripts. Screen readers read "1s2" either way.
  function configNode(text) {
    var span = node("span", "zsa-pt-config");
    text.split(" ").forEach(function (tok, i) {
      if (i) span.appendChild(document.createTextNode(" "));
      var m = /^(\d[spdf])(\d+)$/.exec(tok);
      if (!m) { span.appendChild(document.createTextNode(tok)); return; }
      span.appendChild(document.createTextNode(m[1])); span.appendChild(node("sup", "", m[2]));
    });
    return span;
  }
  function measure(m, e) {
    var v = e[m.key];
    return v === null ? ui.noData : format(m, v) + (m.unit ? " " + m.unit : "");
  }
  function openDetails(z, focus) {
    var e = byZ[z], d = ui.details;
    state.selected = z; state.open = true;
    detailsTitle.textContent = e.name;
    detailsBody.replaceChildren();
    var tile = node("p", "zsa-pt-tile zsa-pt-cat-" + e.category);
    tile.setAttribute("aria-hidden", "true");
    tile.appendChild(node("span", "zsa-pt-num", String(e.z))); tile.appendChild(node("span", "zsa-pt-sym", e.symbol)); tile.appendChild(node("span", "zsa-pt-val", e.mass));
    detailsBody.appendChild(tile);
    var dl = node("dl", "zsa-pt-facts");
    row(dl, d.z, String(e.z));
    row(dl, d.symbol, e.symbol);
    row(dl, d.mass, e.mass);
    row(dl, d.group, e.group === null ? d.noGroup : String(e.group));
    row(dl, d.period, String(e.period));
    row(dl, d.block, e.block + "-block");
    row(dl, d.category, ui.categoryName[e.category]);
    row(dl, d.state, ui.states[e.state]);
    row(dl, d.config, configNode(e.config));
    row(dl, d.noble, configNode(e.noble));
    row(dl, d.valence, e.valence === null ? d.noValence : String(e.valence));
    var ions = node("span");
    if (!e.ions.length) ions.textContent = d.noIons;
    e.ions.forEach(function (ion, i) {
      if (i) ions.appendChild(document.createTextNode(", "));
      ions.appendChild(node("strong", "", chargeLabel(ion[0])));
      ions.appendChild(document.createTextNode(" " + ion[1]));
    });
    row(dl, d.ions, ions);
    row(dl, d.en, measure(modes.electronegativity, e));
    row(dl, d.radius, measure(modes.radius, e));
    row(dl, d.ie, measure(modes.ionization, e));
    detailsBody.appendChild(dl);
    var notes = e.notes.slice();
    if (/^\[/.test(e.mass)) notes.push(d.massNote);
    if (notes.length) {
      var list = node("ul", "zsa-pt-notes");
      notes.forEach(function (t) { list.appendChild(node("li", "", t)); });
      detailsBody.appendChild(list);
    }
    var close = node("button", "zsa-btn", d.close); close.type = "button";
    close.addEventListener("click", closeDetails);
    detailsBody.appendChild(close);
    details.classList.add("zsa-pt-details--open");
    paint(); syncUrl();
    if (focus) {
      detailsTitle.focus({preventScroll: true});
      var r = details.getBoundingClientRect();
      if (!root.classList.contains("zsa--embedded") && (r.top < 0 || r.top > window.innerHeight - 80)) details.scrollIntoView({block: "start"});
    }
  }
  function closeDetails() {
    var z = state.selected;
    state.open = false; state.selected = null;
    detailsTitle.textContent = ui.details.title;
    detailsBody.replaceChildren(node("p", "zsa-pt-hint", ui.details.empty));
    details.classList.remove("zsa-pt-details--open");
    paint(); syncUrl();
    if (z) activate(z, true);
  }
  details.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && state.open) { ev.preventDefault(); closeDetails(); } });

  // ---------- Search ----------
  function find(text) {
    var q = String(text).trim().toLowerCase();
    if (!q) return null;
    if (/^\d+$/.test(q)) return byZ[Number(q)] || null;
    if (ALIASES[q]) q = ALIASES[q].toLowerCase();
    return els.find(function (e) { return e.symbol.toLowerCase() === q; }) ||
      els.find(function (e) { return e.name.toLowerCase() === q; }) ||
      els.find(function (e) { return e.name.toLowerCase().indexOf(q) === 0; }) ||
      els.find(function (e) { return e.name.toLowerCase().indexOf(q) > 0; }) || null;
  }
  function search() {
    var text = query.value.trim();
    if (!text) { status.textContent = ui.empty; return; }
    var e = find(text);
    if (!e) { status.textContent = fill(ui.notFound, {query: text}); return; }
    if (state.open && state.selected !== e.z) closeDetailsQuiet();
    state.selected = e.z; paint();
    status.textContent = fill(ui.found, {name: e.name + " (" + e.symbol + ")"});
    activate(e.z, true);
  }
  function closeDetailsQuiet() {
    state.open = false;
    detailsTitle.textContent = ui.details.title;
    detailsBody.replaceChildren(node("p", "zsa-pt-hint", ui.details.empty));
    details.classList.remove("zsa-pt-details--open");
    syncUrl();
  }
  $("find").addEventListener("click", search);
  query.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); search(); } });
  els.forEach(function (e) { var o = node("option"); o.value = e.name; $("names").appendChild(o); });

  // ---------- Modes ----------
  ui.modes.forEach(function (m) {
    var label = node("label", "zsa-pt-mode"), input = node("input");
    input.type = "radio"; input.name = "zsa-pt-mode"; input.value = m.id; input.id = "zsa-pt-mode-" + m.id;
    input.addEventListener("change", function () { if (input.checked) { state.mode = m.id; paint(); syncUrl(); } });
    label.appendChild(input); label.appendChild(document.createTextNode(" " + m.short));
    $("mode-list").appendChild(label);
  });
  $("trends").checked = state.trends;
  $("trends").addEventListener("change", function () { state.trends = $("trends").checked; paint(); syncUrl(); });

  // The arrows repeat the trend sentences below the legend, so screen readers skip them.
  $("across").setAttribute("aria-hidden", "true"); $("down").setAttribute("aria-hidden", "true");
  buildGrid();
  activate(start ? start.z : 1, false);
  paint();
  // A deep link opens that element's details without moving focus (it would skip the page title).
  if (start) { openDetails(start.z, false); reveal(start.z, false); }
}());
