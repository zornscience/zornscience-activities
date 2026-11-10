// Decides whether two equations from the Rearranging Equations lesson say the same thing, by reading them (not by
// comparing strings) and testing them at random numbers. Handles what the lesson writes: letters side by side
// (mcΔT, nRT) or with ×, ·, * between them, ÷ and / for division, parentheses, plus and minus (− or -), decimals such as
// 1.8 and 32, subscripts (v<sub>f</sub>) and Δ in front of a letter. It reads nothing else, so an answer it cannot read
// is an error, never a silent "equal".
//
//   equivalent("d = vt", "d = tv")           true   (commutative order)
//   equivalent("t = d/v", "t = 1/v × d")     true   (fraction forms)
//   equivalent("v = d/t", "v = d ÷ t")       true   (division symbols)
//   equivalent("d = vt", "d = v/t")          false  (a different relationship)
//
// Two equations are equivalent when each one implies the other. An equation solved for one letter (d = vt, or the same
// turned around, vt = d) implies another when, at random numbers for the other letters, putting its value for that letter
// into the other equation makes both sides equal. An equation with no single letter alone on a side is compared by its
// "left minus right" differing from the other's by one constant factor.
"use strict";

// ---- reading ----
function tokens(text) {
  const src = String(text).replace(/<sub>([^<]*)<\/sub>/g, "_$1").replace(/\s+/g, "");
  const out = [];
  for (let i = 0; i < src.length;) {
    const c = src[i];
    let m;
    if ((m = /^\d+(?:\.\d+)?|^\.\d+/.exec(src.slice(i)))) { out.push({t: "num", v: Number(m[0])}); i += m[0].length; }
    else if ((m = /^Δ?[A-Za-z](?:_[A-Za-z0-9]+)?/.exec(src.slice(i)))) { out.push({t: "var", v: m[0]}); i += m[0].length; }
    else if ("+−-×·*÷/()=".indexOf(c) >= 0) { out.push({t: "op", v: c === "−" ? "-" : c === "×" || c === "·" ? "*" : c === "÷" ? "/" : c}); i++; }
    else throw new Error("cannot read " + JSON.stringify(c) + " in " + JSON.stringify(text));
  }
  return out;
}

// expr := term (("+"|"-") term)*   term := unary ((("*"|"/") | implicit) unary)*   unary := "-" unary | atom   atom := num | var | "(" expr ")"
function parseSide(list, text) {
  let pos = 0;
  const peek = () => list[pos];
  function atom() {
    const k = list[pos++];
    if (!k) throw new Error("unfinished expression in " + JSON.stringify(text));
    if (k.t === "num") return {n: k.v};
    if (k.t === "var") return {v: k.v};
    if (k.t === "op" && k.v === "(") {
      const e = expr();
      const close = list[pos++];
      if (!close || close.v !== ")") throw new Error("missing ) in " + JSON.stringify(text));
      return e;
    }
    throw new Error("unexpected " + JSON.stringify(k.v) + " in " + JSON.stringify(text));
  }
  function unary() {
    const k = peek();
    if (k && k.t === "op" && k.v === "-") { pos++; return {op: "neg", a: unary()}; }
    return atom();
  }
  function term() {
    let left = unary();
    for (;;) {
      const k = peek();
      if (!k) return left;
      if (k.t === "op" && (k.v === "*" || k.v === "/")) { pos++; left = {op: k.v, a: left, b: unary()}; }
      else if (k.t === "num" || k.t === "var" || (k.t === "op" && k.v === "(")) left = {op: "*", a: left, b: unary()}; // letters side by side
      else return left;
    }
  }
  function expr() {
    let left = term();
    for (;;) {
      const k = peek();
      if (k && k.t === "op" && (k.v === "+" || k.v === "-")) { pos++; left = {op: k.v, a: left, b: term()}; }
      else return left;
    }
  }
  const tree = expr();
  if (pos !== list.length) throw new Error("cannot finish reading " + JSON.stringify(text));
  return tree;
}

function parseEquation(text) {
  const list = tokens(text);
  const eq = list.findIndex((k) => k.t === "op" && k.v === "=");
  if (eq < 0 || list.findIndex((k, i) => i > eq && k.t === "op" && k.v === "=") >= 0) throw new Error("not one equation: " + JSON.stringify(text));
  return {left: parseSide(list.slice(0, eq), text), right: parseSide(list.slice(eq + 1), text)};
}

function letters(tree, into = new Set()) {
  if (tree.v) into.add(tree.v);
  if (tree.a) letters(tree.a, into);
  if (tree.b) letters(tree.b, into);
  return into;
}

function evaluate(tree, values) {
  if (tree.n !== undefined) return tree.n;
  if (tree.v) return values[tree.v];
  const a = evaluate(tree.a, values);
  if (tree.op === "neg") return -a;
  const b = evaluate(tree.b, values);
  return tree.op === "+" ? a + b : tree.op === "-" ? a - b : tree.op === "*" ? a * b : a / b;
}

// ---- comparing ----
function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const close = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
const residual = (eq, values) => evaluate(eq.left, values) - evaluate(eq.right, values);

// A letter alone on one side that does not appear on the other: {name, value: the tree for it}, else null.
function solved(eq) {
  if (eq.left.v && !letters(eq.right).has(eq.left.v)) return {name: eq.left.v, value: eq.right};
  if (eq.right.v && !letters(eq.left).has(eq.right.v)) return {name: eq.right.v, value: eq.left};
  return null;
}

function points(names, count, random) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const values = {};
    names.forEach((n) => { values[n] = 0.5 + Math.round(random() * 90) / 10; }); // 0.5 to 9.5, never zero
    out.push(values);
  }
  return out;
}

// Does every solution of `from` satisfy `to`?
function implies(from, to, names, random, tries) {
  const s = solved(from);
  return points(names, tries, random).every((values) => {
    if (!s) return true; // handled by the proportional check
    values[s.name] = evaluate(s.value, values);
    const r = residual(to, values);
    return Number.isFinite(r) && close(r, 0);
  });
}

function equivalent(a, b, tries = 60) {
  const A = parseEquation(a), B = parseEquation(b);
  const names = [...new Set([...letters(A.left), ...letters(A.right), ...letters(B.left), ...letters(B.right)])];
  const random = seeded(12345);
  if (solved(A) || solved(B)) {
    // One of them is solved for a letter; the other must be satisfied by that solution, and the other way round.
    if (solved(A) && !implies(A, B, names, random, tries)) return false;
    if (solved(B) && !implies(B, A, names, random, tries)) return false;
    // A form that is not solved (DV = m) must not accept more than the solved one does: both must be solved, or the
    // unsolved one's solutions for the same letter must be unique (its value changes when the letter changes).
    const unsolved = solved(A) ? (solved(B) ? null : B) : A, other = unsolved === A ? B : A;
    if (unsolved) {
      const x = solved(other).name;
      return points(names, tries, random).every((values) => {
        values[x] = evaluate(solved(other).value, values);
        const here = residual(unsolved, values), moved = residual(unsolved, Object.assign({}, values, {[x]: values[x] + 1}));
        return Number.isFinite(here) && Number.isFinite(moved) && !close(here, moved);
      });
    }
    return true;
  }
  // Neither is solved for a letter: the same equation up to one constant factor.
  let ratio = null;
  return points(names, tries, random).every((values) => {
    const fa = residual(A, values), fb = residual(B, values);
    if (!Number.isFinite(fa) || !Number.isFinite(fb)) return true;
    if (close(fa, 0) || close(fb, 0)) return close(fa, 0) && close(fb, 0);
    const r = fa / fb;
    if (ratio === null) { ratio = r; return true; }
    return close(ratio, r);
  });
}

module.exports = {equivalent, parseEquation};
