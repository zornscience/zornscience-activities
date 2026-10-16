// ZornScience completion codes. A full mixed round ends with a short code such as ICT-1A2B-3C4D-5E6F-7G that holds
// the result: the activity and its version, the day, the first-try counts per step, and how many times Show me and
// Hint were used. The teacher code checker (check/) reads it back. Nothing is stored or sent: the code is the record.
//
// The check characters depend on a key written in this file. They catch typos and casual editing. They do not stop
// someone who reads this source, so a code is not secure proof of anything. See shared/README.md.
//
// No globals: the engine and the checker ask for this module with a one-use "zsa:request-codes" event on their root.
// (In Node, for the unit tests, it is module.exports.)
(function () {
  "use strict";

  // Crockford base 32: digits and capital letters without I, L, O and U.
  var ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  var ALIASES = {I:"1", L:"1", O:"0"};
  var EPOCH = Date.UTC(2026, 0, 1), DAY = 86400000, ZONE = "America/Chicago";
  var KEY = "zornscience-completion-code-1";
  var GROUP = 4;

  // Every activity that gives codes. An entry never changes once its codes are in use: the id, prefix, stat keys,
  // totals and maxItems decide how a code is read. To change any of them, register a new id.
  //   id        1 to 31, unique, never reused
  //   prefix    2 to 4 capital letters, unique; the start of every code
  //   slug      the activity folder and data-zsa-activity value (two entries can share one: see setting)
  //   setting   optional: the activity's setting, for an activity that writes its codes under one entry per setting
  //   maxItems  the most original items a mixed round can have
  //   stats     [key, label] for each first-try count, in the order of the round summary (labels as in data.js)
  //   totals    groups of stat keys that always have the same total; one total is stored per group
  //   items     the groups whose totals add up to the number of original items
  var LEWIS_STATS = [["total", "Total valence electrons"], ["center", "Central atom"], ["build", "Lewis structure"],
    ["fc", "Formal charge"], ["domains", "Domains and electron geometry"], ["shape", "Shape and bond angle"], ["polarity", "Polar or nonpolar"]];
  // Every structure has the total and build steps; the others depend on the structure (and fc on the AP setting).
  var LEWIS_TOTALS = [["total", "build"], ["center"], ["fc"], ["domains"], ["shape"], ["polarity"]];
  var ACTIVITIES = [
    {id:1, prefix:"ICT", slug:"ion-charge-trainer", name:"Predicting Ion Charge Trainer", maxItems:10,
      stats:[["0", "Valence electrons"], ["1", "Gain or lose"], ["2", "Ion charge"], ["3", "Name the ion"]],
      totals:[["0", "1", "2"], ["3"]], items:[0]},
    {id:2, prefix:"IFB", slug:"ionic-formula-builder", name:"Ionic Formula Builder", maxItems:10,
      stats:[["n2f0", "Name to formula: ion charges"], ["n2f1", "Name to formula: subscripts"],
        ["f2n0", "Formula to name: which ions"], ["f2n1", "Formula to name: name it"]],
      totals:[["n2f0", "n2f1"], ["f2n0", "f2n1"]], items:[0, 1]},
    {id:3, prefix:"PTR", slug:"periodic-trends", name:"Periodic Trends Practice", maxItems:9,
      stats:[["0", "Same group or period"], ["1", "Trend direction"], ["2", "Which element"]],
      totals:[["0", "1", "2"]], items:[0]},
    // The Lewis and VSEPR Builder writes octet-rule rounds as LVB and AP rounds as LVA, so the code records the
    // setting. Found by slug, "lewis-vsepr" is the octet-rule entry; the AP copy of the activity asks for "LVA".
    {id:4, prefix:"LVB", slug:"lewis-vsepr", setting:"Octet rule", name:"Lewis Structure and VSEPR Builder", maxItems:6,
      stats:LEWIS_STATS, totals:LEWIS_TOTALS, items:[0]},
    {id:5, prefix:"LVA", slug:"lewis-vsepr", setting:"AP setting", name:"Lewis Structure and VSEPR Builder", maxItems:6,
      stats:LEWIS_STATS, totals:LEWIS_TOTALS, items:[0]}
  ];
  // The fixed fields, least significant first: [name, how many values]. Then one total per totals group (0 to
  // maxItems) and one first-try count per stat (0 to its total). Show me and Hint counts stop at their top value.
  var FIELDS = [["activity", 32], ["major", 8], ["minor", 32], ["day", 8192], ["show", 64], ["hints", 128]];
  var LIMIT = {show:63, hints:127};

  function find(list, test) {for (var i = 0; i < list.length; i++) if (test(list[i])) return list[i]; return null;}
  function activity(ref) {return find(ACTIVITIES, function (a) {return a.id === ref || a.slug === ref || a.prefix === ref;});}

  // ---------- Dates ----------
  // The completion day is the calendar day in America/Chicago, counted from 2026-01-01 (day 0).
  function dayNumber(date) {
    var y, m, d;
    try {
      var parts = new Intl.DateTimeFormat("en-US", {timeZone:ZONE, year:"numeric", month:"numeric", day:"numeric"}).formatToParts(date);
      var get = function (type) {return Number(find(parts, function (p) {return p.type === type;}).value);};
      y = get("year"); m = get("month"); d = get("day");
    } catch (e) {
      y = date.getFullYear(); m = date.getMonth() + 1; d = date.getDate(); // no time zone data: the device's own day
    }
    return Math.round((Date.UTC(y, m - 1, d) - EPOCH) / DAY);
  }
  function isoDate(day) {return new Date(EPOCH + day * DAY).toISOString().slice(0, 10);}

  // ---------- Numbers in base 32 ----------
  // The payload is one whole number built from the fields in mixed radix, written in base 32. Numbers are lists of
  // base 32 digits, least significant first, so no field size is limited by JavaScript's number precision.
  function mulAdd(digits, m, a) {
    var carry = a;
    for (var i = 0; i < digits.length; i++) {var v = digits[i] * m + carry; digits[i] = v % 32; carry = Math.floor(v / 32);}
    while (carry) {digits.push(carry % 32); carry = Math.floor(carry / 32);}
    return digits;
  }
  function divMod(digits, m) {
    var rem = 0;
    for (var i = digits.length - 1; i >= 0; i--) {var v = rem * 32 + digits[i]; digits[i] = Math.floor(v / m); rem = v % m;}
    return rem;
  }
  // How many base 32 digits the largest payload of an activity needs.
  function payloadLength(spec) {
    var digits = [1];
    FIELDS.forEach(function (f) {mulAdd(digits, f[1], 0);});
    for (var i = 0; i < spec.totals.length + spec.stats.length; i++) mulAdd(digits, spec.maxItems + 1, 0);
    while (digits.length > 1 && digits[digits.length - 1] === 0) digits.pop();
    // The largest payload is one less than the product: one digit fewer when the product is a power of 32.
    var power = digits[digits.length - 1] === 1 && digits.slice(0, -1).every(function (d) {return d === 0;});
    return power ? digits.length - 1 : digits.length;
  }

  // ---------- Check characters ----------
  // Two characters over the prefix and payload. The first is a weighted sum in GF(32) with weights from the key:
  // every weight is 2 or more and differs from its neighbor, so any one changed character and any swap of two
  // neighbors changes it. The second is a hash of the key and the characters, which catches most other edits.
  function gmul(a, b) {
    var out = 0;
    for (var i = 0; i < 5; i++) {
      if (b & 1) out ^= a;
      b >>= 1; a <<= 1;
      if (a & 32) a ^= 37; // x^5 + x^2 + 1
    }
    return out;
  }
  function fnv(h, value) {return Math.imul(h ^ value, 16777619);}
  var keyHash = 2166136261;
  for (var k = 0; k < KEY.length; k++) keyHash = fnv(keyHash, KEY.charCodeAt(k));
  var WEIGHTS = [], START = keyHash >>> 27;
  (function () {
    var h = keyHash;
    for (var i = 0; i < 64; i++) {
      h = fnv(h, i + 1);
      var w = 2 + ((h >>> 8) % 30);
      if (i && w === WEIGHTS[i - 1]) w = w === 31 ? 2 : w + 1;
      WEIGHTS.push(w);
    }
  }());
  function checks(values) {
    var c1 = START, h = keyHash;
    values.forEach(function (v, i) {c1 ^= gmul(WEIGHTS[i], v); h = fnv(h, v + 1);});
    h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12;
    return [c1, (h >>> 7) & 31];
  }
  // Prefix letters count as A = 0 to Z = 25 in the check.
  function prefixValues(prefix) {return prefix.split("").map(function (c) {return c.charCodeAt(0) - 65;});}

  // ---------- Writing and reading codes ----------
  function format(prefix, symbols) {
    var groups = [];
    for (var i = 0; i < symbols.length; i += GROUP) groups.push(symbols.slice(i, i + GROUP));
    return prefix + "-" + groups.join("-");
  }
  // The code read one character at a time, a pause between groups: "I C T, 1 A 2 B, ..."
  function spoken(code) {return code.split("-").map(function (g) {return g.split("").join(" ");}).join(", ");}

  // r: {activity (slug or id), version ("1.4.0"), day, items, totals {statKey: n}, results {statKey: n}, show, hints}.
  // `spec` replaces the registered entry (the tests use it to make codes for an unknown activity). Returns the code,
  // or null when the result does not fit the activity's layout (then no code is shown).
  function encode(r, spec) {
    spec = spec || activity(r.activity);
    if (!spec) return null;
    var v = /^(\d+)\.(\d+)/.exec(String(r.version || ""));
    if (!v) return null;
    var fields = [[spec.id, 32], [Number(v[1]), 8], [Number(v[2]), 32], [r.day, 8192],
      [Math.min(r.show || 0, LIMIT.show), 64], [Math.min(r.hints || 0, LIMIT.hints), 128]];
    var totals = r.totals || {}, results = r.results || {}, items = 0, ok = true;
    spec.totals.forEach(function (group, g) {
      var t = totals[group[0]] || 0;
      group.forEach(function (key) {if ((totals[key] || 0) !== t) ok = false;});
      if (spec.items.indexOf(g) >= 0) items += t;
      fields.push([t, spec.maxItems + 1]);
    });
    if (items !== r.items) ok = false;
    spec.stats.forEach(function (stat) {
      var t = totals[stat[0]] || 0;
      fields.push([results[stat[0]] || 0, t + 1]);
    });
    if (!ok || !fields.every(function (f) {return Number.isInteger(f[0]) && f[0] >= 0 && f[0] < f[1];})) return null;
    var digits = [0];
    for (var i = fields.length - 1; i >= 0; i--) mulAdd(digits, fields[i][1], fields[i][0]);
    var length = payloadLength(spec);
    while (digits.length < length) digits.push(0);
    var payload = digits.reverse();
    var all = prefixValues(spec.prefix).concat(payload);
    if (all.length > WEIGHTS.length) return null;
    return format(spec.prefix, payload.concat(checks(all)).map(function (d) {return ALPHABET.charAt(d);}).join(""));
  }

  // Reads one code (as found by `find`). today: the checker's day number. Returns {status, code, ...}:
  //   "valid"    the check characters match and every field is in range
  //   "typo"     a character is wrong, missing or swapped, or the code was edited
  //   "unknown"  a well-formed code from an activity this checker does not know
  //   "future"   a valid code dated after today
  function decode(text, today) {
    var out = {status:"typo", code:String(text).trim().toUpperCase()};
    // With hyphens the prefix is everything before the first one; without, it must be a registered prefix.
    var m = /^([A-Z]{2,4})-([0-9A-Z-]+)$/.exec(out.code);
    if (!m) {
      var spec0 = find(ACTIVITIES, function (a) {return out.code.indexOf(a.prefix) === 0;});
      m = spec0 && /^[0-9A-Z]+$/.test(out.code) ? [null, spec0.prefix, out.code.slice(spec0.prefix.length)] : null;
    }
    if (!m) return out;
    var prefix = m[1], chars = m[2].replace(/-/g, "").split(""), values = [];
    for (var i = 0; i < chars.length; i++) {
      var d = ALPHABET.indexOf(ALIASES[chars[i]] || chars[i]);
      if (d < 0) return out;
      values.push(d);
    }
    if (values.length < 3) return out;
    var payload = values.slice(0, -2), all = prefixValues(prefix).concat(payload);
    if (all.length > WEIGHTS.length) return out;
    var c = checks(all);
    if (c[0] !== values[values.length - 2] || c[1] !== values[values.length - 1]) return out;
    out.code = format(prefix, values.map(function (x) {return ALPHABET.charAt(x);}).join(""));
    out.prefix = prefix;
    // The activity id is the least significant field, which is exactly the last payload character.
    var spec = activity(payload[payload.length - 1]);
    if (!spec) {out.status = "unknown"; return out;}
    if (spec.prefix !== prefix || payload.length !== payloadLength(spec)) return out;
    var digits = payload.slice().reverse();
    function take(radix) {return divMod(digits, radix);}
    var f = {};
    FIELDS.forEach(function (field) {f[field[0]] = take(field[1]);});
    var totals = spec.totals.map(function () {return take(spec.maxItems + 1);});
    var items = 0;
    spec.items.forEach(function (g) {items += totals[g];});
    var stats = spec.stats.map(function (stat) {
      var g = spec.totals.findIndex(function (group) {return group.indexOf(stat[0]) >= 0;});
      return {key:stat[0], label:stat[1], total:totals[g], correct:take(totals[g] + 1)};
    });
    if (digits.some(function (x) {return x !== 0;}) || items > spec.maxItems) return out;
    if (totals.some(function (t) {return t > items;})) return out;
    out.activity = spec; out.version = f.major + "." + f.minor; out.day = f.day; out.date = isoDate(f.day);
    out.items = items; out.stats = stats;
    out.show = f.show; out.hints = f.hints; out.showMax = f.show === LIMIT.show; out.hintsMax = f.hints === LIMIT.hints;
    out.status = today !== undefined && f.day > today ? "future" : "valid";
    return out;
  }

  // The first thing on a line that looks like a code, or null. A code has 2 to 4 letters, a hyphen and at least 8
  // more characters in hyphen-separated groups. Without hyphens it must start with a registered prefix. Anything
  // else on the line (a name, a date, a score) is ignored.
  function findCode(line) {
    var re = /(^|[^A-Za-z0-9])([A-Za-z]{2,4}(?:-[0-9A-Za-z]{1,8}){2,})(?![A-Za-z0-9])/g, m;
    while ((m = re.exec(line))) {
      if (m[2].replace(/^[A-Za-z]+-/, "").replace(/-/g, "").length >= 8) return m[2];
    }
    var words = line.split(/[^A-Za-z0-9]+/);
    for (var i = 0; i < words.length; i++) {
      var w = words[i].toUpperCase();
      var spec = find(ACTIVITIES, function (a) {return w.indexOf(a.prefix) === 0 && w.length === a.prefix.length + payloadLength(a) + 2;});
      if (spec) return words[i];
    }
    return null;
  }
  // Every line of pasted text, in order, without the blank lines at the start and end: {line, text, result}.
  // A line without a code has the status "none", so the results keep one row for each pasted row.
  function checkText(text, today) {
    var lines = String(text).split(/\r\n|\r|\n/);
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    var first = 0;
    while (first < lines.length && !lines[first].trim()) first++;
    return lines.slice(first).map(function (line, i) {
      var found = findCode(line);
      return {line:first + i + 1, text:line, result:found ? decode(found, today) : {status:"none", code:""}};
    });
  }

  var api = {
    ALPHABET:ALPHABET, ACTIVITIES:ACTIVITIES, LIMIT:LIMIT, activity:activity, dayNumber:dayNumber, isoDate:isoDate,
    payloadLength:payloadLength, encode:encode, decode:decode, findCode:findCode, checkText:checkText, spoken:spoken
  };
  if (typeof document !== "undefined") {
    document.querySelectorAll("[data-zsa-activity], [data-zsa-checker]").forEach(function (root) {
      root.addEventListener("zsa:request-codes", function (event) {event.detail.receive(api);}, {once:true});
    });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
