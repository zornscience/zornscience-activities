// Completion code checker for teachers. Reads pasted codes with shared/zsa-codes.js and shows one row per pasted
// line. Everything stays in the page: nothing is stored or sent.
(function () {
  "use strict";
  var root = document.querySelector("[data-zsa-checker]");
  if (!root) return;
  var codes;
  root.dispatchEvent(new CustomEvent("zsa:request-codes", {detail:{receive:function (value) {codes = value;}}}));
  if (!codes) return;

  var STATUS = {valid:"Valid", typo:"Typo or edited", unknown:"Unknown activity", future:"Future date", none:"No code found"};
  var ORDER = ["valid", "typo", "unknown", "future", "none"];
  // Status comes right after the code so it stays in view when a wide table scrolls.
  var COLUMNS = ["Line", "Code", "Status", "Activity", "Version", "Date completed", "Items", "First-try correct", "Show me uses", "Hints used"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function byId(id) {return root.querySelector("#zsa-chk-" + id);}
  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  var input = byId("input"), live = byId("live"), section = byId("results"), body = byId("body");
  var count = byId("count"), copyStatus = byId("copy-status"), message = byId("message"), rows = [];

  function readableDate(iso) {
    var p = iso.split("-");
    return MONTHS[Number(p[1]) - 1] + " " + Number(p[2]) + ", " + p[0];
  }
  // The activity's name, with its setting for an activity that records one: "Lewis Structure and VSEPR Builder (AP setting)".
  function activityName(spec) {return spec.name + (spec.setting ? " (" + spec.setting + ")" : "");}
  function capped(n, top) {return n + (top ? " or more" : "");}
  // One row's cells as text: line, code, status, activity, version, date (shown and copied), items, steps (a list), show, hints.
  function cells(row) {
    var r = row.result, ok = r.status === "valid" || r.status === "future";
    var steps = ok ? r.stats.filter(function (s) {return s.total > 0;}).map(function (s) {return s.label + ": " + s.correct + " / " + s.total;}) : [];
    return {
      line:String(row.line), code:r.code, activity:ok ? activityName(r.activity) : "", version:ok ? r.version : "",
      date:ok ? readableDate(r.date) : "", iso:ok ? r.date : "", items:ok ? String(r.items) : "", steps:steps,
      show:ok ? capped(r.show, r.showMax) : "", hints:ok ? capped(r.hints, r.hintsMax) : "", status:STATUS[r.status], key:r.status
    };
  }
  function render() {
    rows = codes.checkText(input.value, codes.dayNumber(new Date()));
    body.replaceChildren();
    var tally = {};
    rows.forEach(function (row) {
      var c = cells(row), tr = node("tr", "zsa-chk-row--" + c.key);
      tally[c.key] = (tally[c.key] || 0) + 1;
      var th = node("th", "", c.line); th.scope = "row"; tr.appendChild(th);
      tr.appendChild(node("td", "zsa-chk-code", c.code));
      var status = node("td"); status.appendChild(node("span", "zsa-chk-status-tag zsa-chk-status-tag--" + c.key, c.status));
      tr.appendChild(status);
      [c.activity, c.version, c.date, c.items].forEach(function (t) {tr.appendChild(node("td", "", t));});
      var stepCell = node("td");
      if (c.steps.length) {
        var list = node("ul", "zsa-chk-steps");
        c.steps.forEach(function (s) {list.appendChild(node("li", "", s));});
        stepCell.appendChild(list);
      }
      tr.appendChild(stepCell);
      tr.appendChild(node("td", "", c.show)); tr.appendChild(node("td", "", c.hints));
      body.appendChild(tr);
    });
    var summary = rows.length ? (rows.length === 1 ? "Checked 1 line: " : "Checked " + rows.length + " lines: ") +
      ORDER.filter(function (k) {return tally[k];}).map(function (k) {return tally[k] + " " + STATUS[k].toLowerCase();}).join(", ") + "."
      : "Nothing to check. Paste at least one code.";
    count.textContent = summary; copyStatus.textContent = ""; message.textContent = rows.length ? "" : summary;
    section.hidden = !rows.length;
    live.textContent = summary;
  }
  // Tab-separated text with a header row: one row per pasted line, for Google Sheets.
  function tsv() {
    function clean(t) {return String(t).replace(/[\t\r\n]+/g, " ");}
    var out = [COLUMNS.join("\t")];
    rows.forEach(function (row) {
      var c = cells(row);
      out.push([c.line, c.code, c.status, c.activity, c.version, c.iso, c.items, c.steps.join("; "), c.show, c.hints].map(clean).join("\t"));
    });
    return out.join("\n") + "\n";
  }
  function done(message) {copyStatus.textContent = message; live.textContent = message;}
  // Clipboard API first; otherwise copy from a visually hidden text box with the browser's own copy command.
  function copy() {
    var text = tsv();
    function fallback() {
      var box = node("textarea", "zsa-sr-only"); box.value = text; box.setAttribute("readonly", ""); box.setAttribute("aria-hidden", "true"); box.tabIndex = -1;
      root.appendChild(box); box.select();
      var ok = false;
      try {ok = document.execCommand("copy");} catch (e) {ok = false;}
      root.removeChild(box); byId("copy").focus();
      done(ok ? "Results copied. Paste them into Google Sheets." : "Copying did not work in this browser. Select the table and copy it instead.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () {done("Results copied. Paste them into Google Sheets.");}, fallback);
    else fallback();
  }

  var head = byId("head");
  COLUMNS.forEach(function (name) {var th = node("th", "", name); th.scope = "col"; head.appendChild(th);});
  byId("check").addEventListener("click", render);
  byId("clear").addEventListener("click", function () {
    input.value = ""; rows = []; body.replaceChildren(); section.hidden = true;
    count.textContent = ""; copyStatus.textContent = ""; message.textContent = "";
    live.textContent = "Cleared."; input.focus();
  });
  byId("copy").addEventListener("click", copy);
}());
