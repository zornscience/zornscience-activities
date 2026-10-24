(function () {
  "use strict";
  var LIMIT = 500;
  function number(value) {
    var text = String(value).trim().replace(/−/g, "-");
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)) return null;
    var n = Number(text);
    if (!Number.isFinite(n) || Math.abs(n) > 1e100) return null;
    if (n === 0 && /[1-9]/.test(text.split(/[eE]/)[0])) return null;
    return n === 0 || Math.abs(n) >= 1e-100 ? n : null;
  }
  function pairs(rows) {
    var points = [], errors = [];
    rows.forEach(function (r, i) {
      if (!r[0].trim() && !r[1].trim()) return;
      var x = number(r[0]), y = number(r[1]);
      if (x === null || y === null) errors.push(i + 1);
      else points.push({x:x, y:y, row:i + 1});
    });
    return {points:points, errors:errors};
  }
  // Center and scale both axes before least squares, so large offsets and small ranges stay usable.
  function fit(points) {
    if (points.length < 2) return {error:"Add at least two complete points for a best-fit line."};
    var x0 = points[0].x, y0 = points[0].y;
    var xs = Math.max.apply(null, points.map(function (p) { return Math.abs(p.x - x0); }));
    var ys = Math.max.apply(null, points.map(function (p) { return Math.abs(p.y - y0); }));
    if (!xs) return {error:"All x values are the same. A vertical set of points has no unique best-fit line y = mx + b."};
    var sy = ys || 1, n = points.length;
    var dx = points.map(function (p) { return (p.x - x0) / xs; });
    var dy = points.map(function (p) { return (p.y - y0) / sy; });
    var mx = dx.reduce(function (a, b) { return a + b; }, 0) / n;
    var my = dy.reduce(function (a, b) { return a + b; }, 0) / n;
    var xx = 0, yy = 0, xy = 0;
    dx.forEach(function (x, i) { xx += (x-mx)*(x-mx); yy += (dy[i]-my)*(dy[i]-my); xy += (x-mx)*(dy[i]-my); });
    var a = xy / xx, slope = a * sy / xs;
    var centerX = x0 + mx * xs, centerY = y0 + my * sy;
    var intercept = centerY - slope * centerX;
    var r2 = yy ? Math.min(1, Math.max(0, xy * xy / (xx * yy))) : null;
    if (![slope, intercept].every(Number.isFinite)) return {error:"This data range is too extreme for a reliable fit. Rescale the units and try again."};
    return {slope:slope, intercept:intercept, r2:r2, centerX:centerX, centerY:centerY, n:n,
      predict:function (x) { return centerY + slope * (x - centerX); }};
  }
  function format(n) {
    if (!Number.isFinite(n)) return "undefined";
    if (n === 0) return "0";
    return String(Number(n.toPrecision(5)));
  }
  function tickFormat(n, step) {
    var precision = n === 0 ? 5 : Math.min(16, Math.max(5, Math.ceil(Math.log10(Math.abs(n) / step)) + 3));
    return String(Number(n.toPrecision(precision)));
  }
  function axis(values, zero) {
    var lo = values.length ? Math.min.apply(null, values) : 0;
    var hi = values.length ? Math.max.apply(null, values) : 10;
    if (zero) { lo = Math.min(0, lo); hi = Math.max(0, hi); }
    if (lo === hi) { var pad = Math.abs(lo) * .1 || 1; lo -= pad; hi += pad; }
    var range = hi - lo;
    lo -= range * .06; hi += range * .06;
    if (zero && values.every(function (v) {return v >= 0;})) lo = 0;
    if (zero && values.some(function (v) {return v < 0;}) && values.every(function (v) {return v <= 0;})) hi = 0;
    var raw = (hi - lo) / 5;
    var power = Math.pow(10, Math.floor(Math.log10(raw)));
    var ratio = raw / power;
    var step = (ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 2.5 ? 2.5 : ratio <= 5 ? 5 : 10) * power;
    var min = Math.floor(lo / step) * step, max = Math.ceil(hi / step) * step;
    var ticks = [];
    for (var i = 0; i <= 12; i++) {
      var value = min + i * step;
      if (value > max + step * .01) break;
      ticks.push(Math.abs(value) < step * 1e-8 ? 0 : value);
    }
    return {min:min, max:max, ticks:ticks, step:step};
  }
  function splitLabel(text) {
    var m = text.trim().match(/^(.*?)\s*\(([^()]*)\)\s*$/);
    return m ? {name:m[1].trim().slice(0,50), unit:m[2].trim().slice(0,20)} : {name:text.trim().slice(0,50), unit:""};
  }
  // Quoted CSV and tab-separated spreadsheet data, including escaped quote characters.
  function parse(text) {
    text = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
    if (text.length > 1000000) throw Error("Choose a file smaller than 1 MB.");
    var delimiter = text.split("\n")[0].indexOf("\t") >= 0 ? "\t" : ",";
    var rows = [], row = [], cell = "", quoted = false, closed = false;
    function finishCell() { row.push(cell.trim()); cell = ""; closed = false; }
    function finishRow() { finishCell(); if (row.some(function (c) {return c !== "";})) rows.push(row); row = []; }
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (quoted) {
        if (c === '"' && text[i+1] === '"') {cell += '"'; i++;}
        else if (c === '"') {quoted = false; closed = true;}
        else cell += c;
      } else if (c === delimiter) finishCell();
      else if (c === "\n") finishRow();
      else if (c === '"' && !cell.trim() && !closed) {quoted = true; cell = "";}
      else if (closed && c.trim()) throw Error("Unexpected text after a quoted CSV value.");
      else cell += c;
    }
    if (quoted) throw Error("A quoted CSV value is missing its closing quote.");
    finishRow();
    if (!rows.length) throw Error("Paste or choose a table with two columns of data.");
    rows.forEach(function (r, i) {if (r.length !== 2) throw Error("Line " + (i+1) + ": expected exactly two columns, separated by commas or tabs.");});
    var labels = null;
    if (number(rows[0][0]) === null && number(rows[0][1]) === null && rows[0][0] && rows[0][1]) labels = rows.shift();
    if (!rows.length) throw Error("Add at least one data pair below the header.");
    if (rows.length > LIMIT) throw Error("Please import at most 500 points.");
    rows.forEach(function (r, i) { if (number(r[0]) === null || number(r[1]) === null) throw Error("Line " + (i+1+(labels?1:0)) + ": use numbers with magnitude from 1e-100 to 1e100, or zero."); });
    return {rows:rows, labels:labels};
  }
  function csv(points, labels) {
    function quote(s) {return '"' + String(s).replace(/"/g, '""') + '"';}
    return labels.map(quote).join(",") + "\r\n" + points.map(function (p) {return p.x + "," + p.y;}).join("\r\n") + "\r\n";
  }
  var api = {limit:LIMIT, number:number, pairs:pairs, fit:fit, format:format, tickFormat:tickFormat, axis:axis, parse:parse, csv:csv, splitLabel:splitLabel};
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="virtual-lab-graphing"]');
    if (root) root.addEventListener("zsa-vlg:request-model", function (e) {e.detail.receive(api);});
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
