(function () {
  "use strict";
  // Typed formulas for the practice engine. A question with q.type "formula" asks the student to type a rearranged
  // equation (t = d/v); this file reads what was typed and decides whether it says the same thing as the key. It never
  // compares strings: the typed equation is parsed and both sides are evaluated with exact fractions at several
  // numbers, so d = vt, d = tv, d = v × t and d = v*t agree, and d = v/t does not.
  //
  // A question supplies q.formula:
  //   target     the name of the letter being solved for (a name from variables)
  //   variables  [{name, spellings}]: every letter of the problem and the ways it may be typed. A subscript is typed as
  //              vf or v_f, and the unit-style delta as ΔT, dT or deltaT. The longest spelling at each position wins, so
  //              vf is one letter (v sub f), not v times f. Case matters (P and p are different letters).
  //   answer     the key, the right-hand side written with those spellings: "(vf - vi)/t"
  //   traps      [{expr, note}]: known wrong right-hand sides with their feedback (a bilingual {en, es} pair)
  //
  // read(raw, variables) returns {ok:true, left, right} or {ok:false, reason, values}.
  // judge(q, raw) returns
  //   {valid:false, reason, values}               the answer could not be read or is not solved for the target:
  //                                               nothing is scored, the student fixes it (messages[reason] is the English)
  //   {valid:true, correct, notes:[{en, es}]}     scored; notes explain a wrong answer
  // What is read: letters side by side or with *, ×, · between them multiply; ÷ and / divide; + and minus (typed as - or the minus sign);
  // parentheses; decimals; one lowercase x between two things also multiplies when x is not one of the letters.
  // Left to right, so q/mΔT is (q/m)ΔT. A typed answer that is right only if that product is read as the bottom of the
  // fraction is marked wrong with a note to add parentheses.

  var MESSAGES = {
    empty: "Type your equation first.",
    equals: "Write one equation with a single equals sign, like t = d/v.",
    missing: "Something is missing next to an operator or on one side of the equals sign.",
    parens: "Check your parentheses: each ( needs a ).",
    letters: "The letter {letter} is not in this problem. Use only: {letters}.",
    symbol: "I could not read {symbol}. Use letters, numbers, + − × ÷ / * and parentheses.",
    long: "That is too long to be the answer. Check it and try again.",
    alone: "Get {x} alone on one side of the equals sign, and leave it out of the other side."
  };
  var NOTE_PARENS = {en:"Almost: write parentheses around what is on the bottom of the fraction, like q/(mΔT). Without them, letters after / are multiplied on top.",
    es:"Casi: escribe paréntesis alrededor de lo que está abajo de la fracción, como q/(mΔT). Sin ellos, las letras después de / se multiplican arriba."};
  var NOTE_WRONG = {en:"That is not the same as the answer. Check that you did the same step to both sides.",
    es:"Eso no es igual a la respuesta. Revisa que hayas hecho el mismo paso en ambos lados."};
  var LIMIT = 200;

  // ---- exact fractions (BigInt numerator and denominator, denominator positive) ----
  function gcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { var t = a % b; a = b; b = t; } return a; }
  function frac(n, d) {
    if (d === 0n) return null;
    if (d < 0n) { n = -n; d = -d; }
    var g = gcd(n, d) || 1n;
    return {n:n / g, d:d / g};
  }
  function decimal(text) {
    var parts = text.split("."), whole = parts[0] || "0", part = parts[1] || "";
    return frac(BigInt(whole + part), 10n ** BigInt(part.length));
  }
  function same(a, b) { return a.n === b.n && a.d === b.d; }

  // ---- reading ----
  function normalize(raw) {
    return String(raw).normalize("NFKC").replace(/[\u2212\u2013\u2014\u2012\uFE63\uFF0D]/g, "-").replace(/[\u00D7\u00B7\u2219\u22C5]/g, "*")
      .replace(/÷/g, "/").replace(/∆/g, "Δ").replace(/\s+/g, "");
  }
  function operandEnd(token) { return token && (token.t === "num" || token.t === "var" || token.v === ")"); }

  function tokenize(text, variables) {
    var spellings = [];
    variables.forEach(function (variable) { variable.spellings.forEach(function (s) { spellings.push({text:s, name:variable.name}); }); });
    spellings.sort(function (a, b) { return b.text.length - a.text.length; });
    var tokens = [], i = 0;
    while (i < text.length) {
      var rest = text.slice(i), spelling = spellings.find(function (s) { return rest.startsWith(s.text); }), m;
      if (spelling) { tokens.push({t:"var", v:spelling.name}); i += spelling.text.length; continue; }
      if ((m = /^(?:\d+(?:\.\d+)?|\.\d+)/.exec(rest))) { tokens.push({t:"num", v:m[0]}); i += m[0].length; continue; }
      var c = rest[0];
      if ("+-*/()=".indexOf(c) >= 0) { tokens.push({t:"op", v:c}); i++; continue; }
      if (c === "x" && operandEnd(tokens[tokens.length - 1])) { tokens.push({t:"op", v:"*"}); i++; continue; }
      if (/\p{L}/u.test(c)) {
        return {reason:"letters", values:{letter:c, letters:variables.map(function (v) { return v.spellings[0]; }).join(", ")}};
      }
      return {reason:"symbol", values:{symbol:c}};
    }
    return {tokens:tokens};
  }

  // A side is: sum := product (("+"|"-") product)*   product := factor (("*"|"/") factor)*   factor := "-" factor | atom
  // With tight true, letters written side by side bind tighter than "/": d/vt is d/(vt).
  function parseSide(tokens, tight) {
    var pos = 0, bad = null;
    function fail(reason) { if (!bad) bad = reason; return {n:"0"}; }
    function atom() {
      var k = tokens[pos++];
      if (!k) return fail("missing");
      if (k.t === "num") return {num:k.v};
      if (k.t === "var") return {name:k.v};
      if (k.v === "(") {
        var inner = sum();
        if (!tokens[pos] || tokens[pos].v !== ")") return fail("parens");
        pos++; return inner;
      }
      if (k.v === ")") return fail("parens");
      return fail("missing");
    }
    function factor() {
      var k = tokens[pos];
      if (k && k.t === "op" && k.v === "-") { pos++; return {op:"neg", a:factor()}; }
      if (k && k.t === "op" && k.v === "+") { pos++; return factor(); }
      return atom();
    }
    function starts(k) { return k && (k.t === "num" || k.t === "var" || k.v === "("); }
    function chain() { // letters side by side: one product
      var left = factor();
      while (starts(tokens[pos])) left = {op:"*", a:left, b:atom()};
      return left;
    }
    function product() {
      var left = tight ? chain() : factor();
      for (;;) {
        var k = tokens[pos];
        if (k && k.t === "op" && (k.v === "*" || k.v === "/")) { pos++; left = {op:k.v, a:left, b:tight ? chain() : factor()}; }
        else if (!tight && starts(k)) left = {op:"*", a:left, b:factor()};
        else return left;
      }
    }
    function sum() {
      var left = product();
      for (;;) {
        var k = tokens[pos];
        if (k && k.t === "op" && (k.v === "+" || k.v === "-")) { pos++; left = {op:k.v, a:left, b:product()}; } else return left;
      }
    }
    if (!tokens.length) return {reason:"missing"};
    var tree = sum();
    if (!bad && pos < tokens.length) bad = tokens[pos].v === ")" ? "parens" : "missing";
    return bad ? {reason:bad} : {tree:tree};
  }

  function readTokens(raw, variables) {
    // Normalizing would turn a superscript or subscript digit into a plain one (v² into v2) and change the meaning.
    var script = /[\u00B2\u00B3\u00B9\u2070-\u209F]/.exec(String(raw));
    if (script) return {ok:false, reason:"symbol", values:{symbol:script[0]}};
    var text = normalize(raw);
    if (!text) return {ok:false, reason:"empty", values:{}};
    if (text.length > LIMIT) return {ok:false, reason:"long", values:{}};
    var lexed = tokenize(text, variables);
    if (lexed.reason) return {ok:false, reason:lexed.reason, values:lexed.values};
    return {ok:true, tokens:lexed.tokens};
  }

  function split(tokens) {
    var at = [];
    tokens.forEach(function (k, i) { if (k.t === "op" && k.v === "=") at.push(i); });
    return at.length === 1 ? {left:tokens.slice(0, at[0]), right:tokens.slice(at[0] + 1)} : null;
  }

  function read(raw, variables, tight) {
    var lexed = readTokens(raw, variables);
    if (!lexed.ok) return lexed;
    var sides = split(lexed.tokens);
    if (!sides) return {ok:false, reason:"equals", values:{}};
    var left = parseSide(sides.left, tight), right = parseSide(sides.right, tight);
    var reason = left.reason || right.reason;
    if (reason) return {ok:false, reason:reason, values:{}};
    return {ok:true, left:left.tree, right:right.tree};
  }
  // A bare expression (the key and the traps): the right-hand side of "x = expr".
  function readExpression(text, variables, tight) {
    var lexed = readTokens(text, variables);
    if (!lexed.ok) throw new Error("cannot read " + JSON.stringify(text) + ": " + lexed.reason);
    var parsed = parseSide(lexed.tokens, tight);
    if (parsed.reason) throw new Error("cannot read " + JSON.stringify(text) + ": " + parsed.reason);
    return parsed.tree;
  }

  // ---- evaluating ----
  var TABLE = [[2n, 1n], [3n, 1n], [5n, 1n], [7n, 1n], [11n, 1n], [13n, 1n], [17n, 1n], [19n, 1n], [1n, 2n], [3n, 2n], [5n, 3n], [7n, 4n]];
  function points(names, count) {
    var seed = 20240611, out = [];
    function next() { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; }
    for (var k = 0; k < count; k++) {
      var pool = TABLE.slice(), values = {};
      names.forEach(function (name) { var pick = pool.splice(Math.floor(next() * pool.length), 1)[0]; values[name] = frac(pick[0], pick[1]); });
      out.push(values);
    }
    return out;
  }
  function evaluate(tree, values) {
    if (tree.num !== undefined) return decimal(tree.num);
    if (tree.name !== undefined) return values[tree.name];
    var a = evaluate(tree.a, values);
    if (!a) return null;
    if (tree.op === "neg") return {n:-a.n, d:a.d};
    var b = evaluate(tree.b, values);
    if (!b) return null;
    if (tree.op === "+") return frac(a.n * b.d + b.n * a.d, a.d * b.d);
    if (tree.op === "-") return frac(a.n * b.d - b.n * a.d, a.d * b.d);
    if (tree.op === "*") return frac(a.n * b.n, a.d * b.d);
    return frac(a.n * b.d, a.d * b.n); // null when b is zero
  }
  function names(tree, into) {
    if (tree.name !== undefined) into[tree.name] = true;
    if (tree.a) names(tree.a, into);
    if (tree.b) names(tree.b, into);
    return into;
  }
  // Do two expressions agree at every sample point where both are defined (and at least some are)?
  function agree(a, b, variables) {
    var all = variables.map(function (v) { return v.name; }), defined = 0;
    return points(all, 14).every(function (values) {
      var x = evaluate(a, values), y = evaluate(b, values);
      if (!x && !y) return true;
      if (!x || !y) return false;
      defined++;
      return same(x, y);
    }) && defined > 0;
  }
  function lone(tree, name) { return tree.name === name; }

  // ---- judging ----
  function judge(q, raw) {
    var spec = q.formula, vars = spec.variables;
    var typed = read(raw, vars, false);
    if (!typed.ok) return {valid:false, reason:typed.reason, values:typed.values};
    var target = vars.find(function (v) { return v.name === spec.target; });
    var leftIs = lone(typed.left, spec.target), rightIs = lone(typed.right, spec.target);
    var other = leftIs ? typed.right : rightIs ? typed.left : null;
    if (!other || names(other, {})[spec.target] || (leftIs && rightIs)) return {valid:false, reason:"alone", values:{x:target.spellings[0]}};
    var key = readExpression(spec.answer, vars, false);
    if (agree(other, key, vars)) return {valid:true, correct:true, notes:[]};
    var notes = [], hit = (spec.traps || []).find(function (trap) { return agree(other, readExpression(trap.expr, vars, false), vars); });
    if (hit) notes.push(hit.note);
    else {
      // Right only if letters side by side after a / belong to the bottom: ask for parentheses instead of guessing.
      var tight = read(raw, vars, true);
      var tightOther = tight.ok ? (lone(tight.left, spec.target) ? tight.right : tight.left) : null;
      notes.push(tightOther && agree(tightOther, key, vars) ? NOTE_PARENS : NOTE_WRONG);
    }
    return {valid:true, correct:false, notes:notes};
  }

  var api = {read:read, readExpression:readExpression, judge:judge, agree:agree, messages:MESSAGES};
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;
  document.querySelectorAll("[data-zsa-practice]").forEach(function (root) {
    root.addEventListener("zsa:request-formula", function (event) { event.detail.receive(api); });
  });
}());
