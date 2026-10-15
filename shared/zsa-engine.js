// ZornScience activity engine. Shared by every activity: rounds and the review queue, one step at a time with
// tap-to-check answer buttons, feedback, hints, Show me, the answer trail, the item and round summaries, and the
// main-group periodic table. An activity supplies its data and a small spec of hooks; see shared/README.md.
//
// No globals: an activity script asks for the engine with a one-use "zsa:request-engine" event on its root, the
// same way it asks for its data. (In Node, for the unit tests, the engine is module.exports.)
(function () {
  "use strict";

  // ---------- Small helpers ----------

  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function button(text, callback, primary) {
    var el = node("button", "zsa-btn" + (primary ? " zsa-btn--primary" : ""), text);
    el.type = "button";
    el.addEventListener("click", callback);
    return el;
  }
  function cap(s) {return s.charAt(0).toUpperCase() + s.slice(1);}
  function shuffle(items) {
    var list = items.slice();
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var value = list[i]; list[i] = list[j]; list[j] = value;
    }
    return list;
  }
  // Charges are written number first with a true minus sign: 2+, 3−.
  function chargeLabel(n) {return Math.abs(n) + (n > 0 ? "+" : "−");}

  // ---------- Rich text ----------
  // Text is a list of segments. A segment is a string or a token {visual(), spoken}: a token shows one thing
  // (a formula with real subscripts, a charge sum) and gives screen readers a spoken version instead.
  function token(build, spoken) {return {visual:build, spoken:spoken};}
  function segments(value) {return Array.isArray(value) ? value : [value];}
  // Fill a template's {key} slots from ctx. {Key} with a capital is the {key} slot with a capital letter.
  function fill(template, ctx) {
    var out = [];
    template.split(/(\{\w+\})/).forEach(function (piece) {
      var m = /^\{(\w+)\}$/.exec(piece);
      if (!m) {if (piece) out.push(piece); return;}
      var key = m[1], value = ctx[key];
      if (value === undefined) value = cap(ctx[key.charAt(0).toLowerCase() + key.slice(1)]);
      out.push(value);
    });
    return out;
  }
  // Join several segment lists with a space between them.
  function join(lists) {
    var out = [];
    lists.forEach(function (list, i) {if (i) out.push(" "); out.push.apply(out, segments(list));});
    return out;
  }
  function render(el, list) {
    segments(list).forEach(function (seg) {
      if (typeof seg === "string") {el.appendChild(document.createTextNode(seg)); return;}
      var wrap = node("span", "zsa-token"), visual = seg.visual();
      visual.setAttribute("aria-hidden", "true");
      wrap.appendChild(visual); wrap.appendChild(node("span", "zsa-sr-only", seg.spoken));
      el.appendChild(wrap);
    });
    return el;
  }
  // A prefix ("✓ Correct. ") and one or more messages. Plain-string messages become one string (one text node);
  // segment lists stay separate segments.
  function compose(prefix, parts) {
    if (parts.every(function (part) {return typeof part === "string";})) return [prefix + parts.join(" ")];
    return [prefix].concat(join(parts));
  }
  function speak(list) {return segments(list).map(function (seg) {return typeof seg === "string" ? seg : seg.spoken;}).join("");}

  // ---------- Rounds ----------

  // A mixed round with constraints. Quotas run in order: each shuffles the items that pass its test and are not
  // chosen yet, and takes enough of them that at least `min` chosen items pass the test (a quota with no test
  // counts every chosen item). Then the round is filled to `size` at random from the items left over. With
  // `variants` ([[name, count], ...]), items without a fixed variant get one, in that order, until each variant
  // has its count. Returns a shuffled list of {item, variant}.
  function buildRound(pool, spec) {
    var chosen = [], leftover = [];
    function has(item) {return chosen.some(function (c) {return c.item === item;});}
    (spec.quotas || []).forEach(function (q) {
      var have = chosen.filter(function (c) {return !q.test || q.test(c.item);}).length;
      var need = Math.max(0, q.min - have);
      var list = shuffle(pool.filter(function (item) {return (!q.test || q.test(item)) && !has(item);}));
      list.slice(0, need).forEach(function (item) {chosen.push({item:item, variant:q.variant || null});});
      leftover = leftover.concat(list.slice(need));
    });
    var room = (spec.size || 0) - chosen.length;
    if (room > 0) {
      var rest = [];
      leftover.concat(pool).forEach(function (item) {if (!has(item) && rest.indexOf(item) < 0) rest.push(item);});
      shuffle(rest).slice(0, room).forEach(function (item) {chosen.push({item:item, variant:null});});
    }
    if (spec.variants) {
      var left = spec.variants.map(function (v) {return [v[0], v[1] - chosen.filter(function (c) {return c.variant === v[0];}).length];});
      shuffle(chosen.filter(function (c) {return !c.variant;})).forEach(function (c) {
        var slot = left.find(function (v) {return v[1] > 0;}) || left[left.length - 1];
        c.variant = slot[0]; slot[1]--;
      });
    }
    return shuffle(chosen);
  }

  // The queue for one round: the original items, then any review items. A step answered wrong twice, or shown
  // with Show me, schedules one repeat of that item with at least `gap` other items in between, adding filler
  // items when the round is about to end, never more than `maxExtra` extra items in all. Single-item practice and
  // review items never schedule a repeat. Every missed item is remembered for the round summary.
  function createQueue(entries, type, rules) {
    var maxExtra = rules.maxExtra === undefined ? 3 : rules.maxExtra, gap = rules.gap === undefined ? 2 : rules.gap;
    var q = {
      type: type, originals: entries.length, extra: 0,
      items: entries.map(function (e) {return {item:e.item, variant:e.variant === undefined ? null : e.variant, review:false};}),
      misses: new Map(), scheduled: new Set()
    };
    // Remember a miss (the variant it was missed in; a later miss of the same item replaces it).
    q.miss = function (entry) {q.misses.set(rules.key(entry.item), entry.variant);};
    q.schedule = function (position) {
      var entry = q.items[position], key = rules.key(entry.item);
      q.miss(entry);
      if (type === "single" || entry.review || q.extra >= maxExtra || q.scheduled.has(key)) return false;
      var target = Math.max(q.items.length, position + gap + 1);
      if (target - q.items.length + 1 > maxExtra - q.extra) return false;
      var used = new Set(q.items.map(function (it) {return rules.key(it.item);}));
      var fillers = shuffle(rules.pool.filter(function (item) {return !used.has(rules.key(item));}));
      while (q.items.length < target) {
        var filler = fillers.pop();
        q.items.push({item:filler, variant:rules.fillerVariant ? rules.fillerVariant(filler) : null, review:true}); q.extra++;
      }
      q.items.push({item:entry.item, variant:entry.variant, review:true}); q.extra++; q.scheduled.add(key);
      return true;
    };
    q.missed = function () {return rules.pool.filter(function (item) {return q.misses.has(rules.key(item));});};
    return q;
  }

  // ---------- Periodic table ----------
  // The main-group table, always visible. `marked` symbols are filled navy and read as t.currentMark; `hint` groups
  // are highlighted and read as t.hintMark; with t.charges, `charges` ({group: signed charge}) are shown above
  // their group columns on a line that is always reserved, so the table never changes height.
  function periodicTable(holder, t, marked, hint, charges) {
    holder.replaceChildren();
    var lit = hint || [];
    charges = charges || {};
    var table = node("table", "zsa-table" + (t.charges ? " zsa-table--charges" : ""));
    if (t.noteId) table.setAttribute("aria-describedby", t.noteId);
    table.appendChild(node("caption", "", t.caption));
    var head = node("thead"), row = node("tr");
    var period = node("th", "", t.periodLabel); period.scope = "col"; row.appendChild(period);
    t.groups.forEach(function (g) {
      var isLit = lit.indexOf(g) >= 0, th;
      if (t.charges) {
        th = node("th", isLit ? "zsa-highlight" : ""); th.scope = "col";
        var mark = node("span", "zsa-colcharge", charges[g] ? chargeLabel(charges[g]) : "");
        mark.setAttribute("aria-hidden", "true");
        th.appendChild(mark); th.appendChild(document.createTextNode(String(g)));
        if (charges[g]) th.appendChild(node("span", "zsa-sr-only", ", " + t.chargeMark + " " + chargeLabel(charges[g])));
      } else {
        th = node("th", isLit ? "zsa-highlight" : "", g); th.scope = "col";
      }
      if (isLit) th.appendChild(node("span", "zsa-sr-only", t.hintMark));
      row.appendChild(th);
    });
    head.appendChild(row); table.appendChild(head);
    var body = node("tbody");
    t.rows.forEach(function (symbols, index) {
      var r = node("tr"), th = node("th", "", String(index + 1)); th.scope = "row"; r.appendChild(th);
      symbols.forEach(function (symbol, col) {
        var cls = lit.indexOf(t.groups[col]) >= 0 ? "zsa-highlight" : "";
        var isCurrent = !!symbol && (marked || []).indexOf(symbol) >= 0;
        if (isCurrent) cls += " zsa-current";
        var td = node("td", cls.trim(), symbol);
        if (isCurrent) td.appendChild(node("span", "zsa-sr-only", t.currentMark));
        r.appendChild(td);
      });
      body.appendChild(r);
    });
    table.appendChild(body); holder.appendChild(table);
  }

  // ---------- Labels ----------
  // Every word the engine shows. Activities pass their own from data.js; these are the shared defaults.
  var LABELS = {
    hint:"Hint", hint2:"Another hint", hintsDone:"Both hints shown", show:"Show me", hintPrefix:"Hint: ",
    correct:"✓ Correct. ", wrong:"↻ Not yet. ", revealed:"→ Answer shown. ", general:"Use a hint and try again.",
    next:"Next item", finish:"See round summary", complete:"Item complete", roundComplete:"Round complete",
    singleDone:"Chosen item complete", firstTry:"First-try correct on original items", review:"Keep practicing",
    none:"You completed every original step on the first try.", again:"Practice again", misses:"Practice my misses",
    repeatNote:"Review items do not change the first-try counts.", itemLabel:"Item", reviewLabel:"Review",
    singleLabel:"Chosen item", of:"of", stepLabel:"Step", trailLabel:"Your answers so far", correctMark:"Correct: ",
    shownMark:"Shown: ", triedMark:" (tried, not correct)", currentMark:" (current)", hintMark:" (hint)",
    chargeMark:"ion charge", tableCaption:"Main-group elements by group (column) and period (row)", periodLabel:"Period"
  };

  // ---------- The activity ----------
  // create(root, spec) builds the activity in root and returns {start, mixed, labels}. spec (see shared/README.md):
  //   prefix        id prefix, such as "zsa-ict": the page has #<prefix>-work, -live, -table, -table-note, -options
  //   strip         id of the element strip (the item's name, progress line and any picture)
  //   labels        words, merged over LABELS
  //   pool, key     every item, and a function giving each item's unique key
  //   round         buildRound spec for a mixed round ({quotas, size, variants}), or a function returning entries
  //   fillerVariant optional function(item) giving a review filler its variant
  //   table         {groups, rows, charges}; marks(entry, stepsDone) returns {marked, charges} for the table
  //   renderStrip(entry, stripEl)   fills the strip and returns {heading, progress} (both elements)
  //   steps or stepCount(entry)     how many steps an item has (stepCount is read when each item loads)
  //   step(entry, s)                {question, parts:[{name, values:[[value, label]], modifier, legend}], pair,
  //                                  build:{node, update(picks)}, hintGroups}; called when the step is shown
  //   classify(entry, s, picks)     null when right, else {keys, wrong:[part names], slots}
  //   message(entry, key, result)   the feedback for one key (text or segments); missing keys use labels.general
  //   hint(entry, s, level)         hint 0 (general) or 1 (specific)
  //   trail(entry, s), explain(entry, s)  the answer chip and the explanation for a finished step
  //   summary(entry)                nodes for the item summary card
  //   statKey(entry, s), stats      first-try count keys, and [[key, label], ...] for the round summary
  //   reminder(item)                the line for an item under Keep practicing
  //   missesRound(items, variantOf) entries for Practice my misses
  function create(root, spec) {
    var labels = {};
    Object.keys(LABELS).forEach(function (k) {labels[k] = LABELS[k];});
    Object.keys(spec.labels || {}).forEach(function (k) {labels[k] = spec.labels[k];});
    var prefix = spec.prefix;
    function byId(suffix) {return root.querySelector("#" + prefix + "-" + suffix);}
    var work = byId("work"), live = byId("live"), options = byId("options"), tableHolder = byId("table");
    var strip = root.querySelector("#" + spec.strip);
    var tableSpec = {
      caption:labels.tableCaption, periodLabel:labels.periodLabel, groups:spec.table.groups, rows:spec.table.rows,
      charges:!!spec.table.charges, noteId:prefix + "-table-note", currentMark:labels.currentMark, hintMark:labels.hintMark,
      chargeMark:labels.chargeMark
    };
    var rules = {pool:spec.pool, key:spec.key, fillerVariant:spec.fillerVariant, maxExtra:spec.maxExtra, gap:spec.gap};
    var queue, position = 0, results, totals;
    var entry, step, stepCount, stepsDone, mistakes, hints, attempts, progressEl;
    // trail: one entry per finished step of the current item; lastFeedback: the explanation for the step just finished.
    var trail = [], lastFeedback = null;

    function announce(text) {live.textContent = text;}
    function statKey(e, s) {return spec.statKey ? spec.statKey(e, s) : String(s);}
    function mixed() {return typeof spec.round === "function" ? spec.round() : buildRound(spec.pool, spec.round);}

    function start(entries, type, quiet) {
      queue = createQueue(entries, type, rules);
      position = 0; results = {}; totals = {};
      if (options) options.open = false;
      load(quiet);
    }
    function drawTable(hint) {
      var marks = entry ? spec.marks(entry, stepsDone) : {};
      periodicTable(tableHolder, tableSpec, marks.marked, hint, marks.charges);
    }
    function load(quiet) {
      if (position >= queue.items.length) {finish(); return;}
      entry = queue.items[position]; step = 0; stepsDone = 0;
      stepCount = spec.stepCount ? spec.stepCount(entry) : spec.steps;
      mistakes = []; hints = []; attempts = [];
      for (var s = 0; s < stepCount; s++) {
        mistakes.push(0); hints.push(0); attempts.push(0);
        if (!entry.review) totals[statKey(entry, s)] = (totals[statKey(entry, s)] || 0) + 1;
      }
      trail = []; lastFeedback = null;
      announce("");
      strip.replaceChildren();
      var made = spec.renderStrip(entry, strip);
      progressEl = made.progress;
      drawTable(); renderStep();
      // No focus move on the first automatic load: it would skip the page title and, when embedded, scroll the host page.
      if (!quiet) {anchor(); made.heading.focus({preventScroll:true});}
    }
    // On narrow screens, line the strip up with the top of the screen when the step would not fit, so the table and
    // the whole step stay in view without manual scrolling. Never in embed mode (it would scroll the host page).
    var narrow = window.matchMedia("(max-width: 899px)");
    function anchor() {
      if (!narrow.matches || root.classList.contains("zsa--embedded")) return;
      var main = work.querySelector(".zsa-step .zsa-actions, .zsa-summary .zsa-btn");
      var stripTop = strip.getBoundingClientRect().top;
      if (stripTop < 0 || (main && main.getBoundingClientRect().bottom > window.innerHeight)) strip.scrollIntoView({block:"start"});
    }
    // Bring new feedback or a hint into view if it landed below the bottom of the screen (no-op in embed mode).
    function bringIntoView(el) {
      if (root.classList.contains("zsa--embedded")) return;
      if (el.getBoundingClientRect().bottom > window.innerHeight) el.scrollIntoView({block:"nearest"});
    }
    function progressText() {
      var label = queue.type === "single" ? labels.singleLabel : (entry.review ? labels.reviewLabel : labels.itemLabel);
      return label + " " + (position + 1) + " " + labels.of + " " + queue.items.length + " · " + labels.stepLabel + " " + Math.min(step + 1, stepCount) + " " + labels.of + " " + stepCount;
    }
    // Progress (in the strip), the answers already given for this item, and the explanation for the last step.
    function header(showLast) {
      progressEl.textContent = progressText();
      if (trail.length) {
        var list = node("ul", "zsa-trail"); list.setAttribute("aria-label", labels.trailLabel);
        trail.forEach(function (t) {
          var li = node("li", t.reveal ? "zsa-trail--shown" : "");
          var icon = node("span", "", t.reveal ? "→ " : "✓ "); icon.setAttribute("aria-hidden", "true");
          li.appendChild(icon); li.appendChild(node("span", "zsa-sr-only", t.reveal ? labels.shownMark : labels.correctMark));
          render(li, t.segments); list.appendChild(li);
        });
        work.appendChild(list);
      }
      if (showLast && lastFeedback) {
        work.appendChild(render(node("p", "zsa-feedback zsa-last " + (lastFeedback.reveal ? "zsa-feedback--shown" : "zsa-feedback--correct")), lastFeedback.segments));
      }
    }
    // Answer choices are buttons: a click, tap, Enter or Space picks one and the step checks itself as soon as every
    // part is picked. Arrow keys, Home and End only move focus within the group (one Tab stop per group), so moving
    // through the choices never submits an answer by accident.
    function choices(target, part, onPick) {
      var grid = node("div", "zsa-choices" + (part.modifier ? " zsa-choices--" + part.modifier : ""));
      grid.setAttribute("data-zsa-part", part.name);
      part.values.forEach(function (pair, i) {
        var b = node("button", "zsa-choice", String(pair[1]));
        b.type = "button"; b.id = prefix + "-" + part.name + "-" + i; b.value = String(pair[0]); b.tabIndex = i === 0 ? 0 : -1;
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () {if (b.getAttribute("aria-disabled") !== "true") onPick(part, pair[0], b);});
        grid.appendChild(b);
      });
      grid.addEventListener("keydown", function (ev) {
        var list = [].slice.call(grid.querySelectorAll(".zsa-choice")), i = list.indexOf(document.activeElement);
        if (i < 0) return;
        var n = {ArrowRight:i + 1, ArrowDown:i + 1, ArrowLeft:i - 1, ArrowUp:i - 1, Home:0, End:list.length - 1}[ev.key];
        if (n === undefined) return;
        ev.preventDefault(); n = (n + list.length) % list.length;
        list.forEach(function (x, k) {x.tabIndex = k === n ? 0 : -1;}); list[n].focus();
      });
      target.appendChild(grid);
    }
    function sub(target, legend) {
      var f = node("fieldset", "zsa-sub"); f.appendChild(node("legend", "", legend)); target.appendChild(f); return f;
    }
    function renderStep() {
      var s = step, e = entry, def = spec.step(e, s);
      work.replaceChildren(); header(true);
      var field = node("fieldset", "zsa-step"); field.id = prefix + "-step-" + s;
      // The question itself is the group's label, which saves a line over a separate step title.
      field.appendChild(node("legend", "", (s + 1) + ". " + def.question));
      // picked: the button picked in each part; picks: its value. A step checks itself once every part is picked.
      var names = def.parts.map(function (p) {return p.name;}), picked = {}, picks = {};
      function current() {
        var out = {};
        names.forEach(function (n) {out[n] = picked[n] ? picks[n] : null;});
        return out;
      }
      function onPick(part, value, btn) {
        [].forEach.call(btn.parentNode.querySelectorAll(".zsa-choice"), function (x) {x.setAttribute("aria-pressed", String(x === btn));});
        picked[part.name] = btn; picks[part.name] = value;
        if (def.build) def.build.update(current());
        if (names.every(function (n) {return picked[n];})) evaluate();
      }
      if (def.build) field.appendChild(def.build.node);
      var holder = field;
      if (def.pair) {holder = node("div", "zsa-pair"); field.appendChild(holder);}
      def.parts.forEach(function (part) {choices(part.legend ? sub(holder, part.legend) : holder, part, onPick);});
      if (def.build) def.build.update(current());
      // Hint and Show me sit right under the choices; feedback and hints appear below them.
      var actions = node("div", "zsa-actions");
      var feedback = node("p", "zsa-feedback"); feedback.hidden = true;
      var hintBox = node("p", "zsa-panel zsa-hint"); hintBox.hidden = true;
      function evaluate() {
        var answer = current();
        attempts[s]++;
        var result = spec.classify(e, s, answer);
        if (!result) {complete(false); return;}
        // Mark each wrong pick as tried (it can't be picked again) and clear it; a right part stays picked.
        result.wrong.forEach(function (p) {
          var x = picked[p]; x.classList.add("zsa-tried"); x.setAttribute("aria-pressed", "false"); x.setAttribute("aria-disabled", "true");
          x.appendChild(node("span", "zsa-sr-only", labels.triedMark)); delete picked[p];
        });
        queue.miss(e); mistakes[s]++;
        if (mistakes[s] >= 2) {show.hidden = false; queue.schedule(position);}
        showFeedback(compose(labels.wrong, result.keys.map(function (k) {
          var m = spec.message(e, k, result);
          return m === undefined || m === null ? labels.general : m;
        })));
      }
      var hint = button(labels.hint, function () {
        if (hint.getAttribute("aria-disabled") === "true") return;
        var text = segments(spec.hint(e, s, hints[s]));
        hintBox.hidden = false; hintBox.replaceChildren(); render(hintBox, text);
        announce(labels.hintPrefix + speak(text)); hints[s]++;
        if (def.hintGroups) drawTable(def.hintGroups);
        // aria-disabled keeps keyboard focus on the button; a disabled button would drop focus to the page.
        hint.textContent = hints[s] === 1 ? labels.hint2 : labels.hintsDone; if (hints[s] >= 2) hint.setAttribute("aria-disabled", "true");
        bringIntoView(hintBox); // last, after every change that can shift the layout
      });
      var show = button(labels.show, function () {complete(true);}); show.hidden = true;
      actions.appendChild(hint); actions.appendChild(show);
      field.appendChild(actions); field.appendChild(feedback); field.appendChild(hintBox); work.appendChild(field);
      function showFeedback(text) {
        feedback.hidden = false; feedback.className = "zsa-feedback zsa-feedback--wrong";
        feedback.replaceChildren(); render(feedback, text); announce(speak(text)); bringIntoView(feedback);
      }
      function complete(reveal) {
        if (!reveal && attempts[s] === 1 && !e.review) results[statKey(e, s)] = (results[statKey(e, s)] || 0) + 1;
        if (reveal) queue.schedule(position);
        trail.push({segments:segments(spec.trail(e, s)), reveal:reveal});
        lastFeedback = {segments:compose(reveal ? labels.revealed : labels.correct, [spec.explain(e, s)]), reveal:reveal};
        announce(speak(lastFeedback.segments));
        stepsDone = s + 1; drawTable(); // clears any hint columns; the activity may show more after a step
        step++;
        if (step < stepCount) {renderStep(); anchor(); work.querySelector("#" + prefix + "-step-" + step + " .zsa-choice").focus({preventScroll:true});}
        else summary();
      }
    }
    function summary() {
      work.replaceChildren(); header(false);
      var card = node("section", "zsa-card zsa-summary"), title = node("h3", "", labels.complete); title.tabIndex = -1; card.appendChild(title);
      spec.summary(entry).forEach(function (n) {card.appendChild(n);});
      card.appendChild(button(position + 1 === queue.items.length ? labels.finish : labels.next, function () {position++; load();}, true));
      work.appendChild(card); anchor(); title.focus({preventScroll:true});
    }
    function finish() {
      entry = null; strip.replaceChildren(); drawTable();
      work.replaceChildren();
      var heading = node("h2", "zsa-finish-title", queue.type === "single" ? labels.singleDone : labels.roundComplete); heading.tabIndex = -1; work.appendChild(heading);
      work.appendChild(node("p", "zsa-note", labels.firstTry));
      spec.stats.forEach(function (stat) {
        var total = totals[stat[0]] || 0; if (!total) return; // only steps that were in the round
        var line = node("div", "zsa-stat"); line.appendChild(node("span", "", stat[1])); line.appendChild(node("strong", "", (results[stat[0]] || 0) + " / " + total)); work.appendChild(line);
      });
      work.appendChild(node("p", "zsa-note", labels.repeatNote));
      var missed = queue.missed();
      if (missed.length) {
        work.appendChild(node("h3", "", labels.review)); var list = node("ul", "zsa-review");
        missed.forEach(function (item) {list.appendChild(render(node("li"), spec.reminder(item)));}); work.appendChild(list);
      } else work.appendChild(node("p", "zsa-panel", labels.none));
      var actions = node("div", "zsa-actions"); actions.appendChild(button(labels.again, function () {start(mixed(), "mixed");}, true));
      var variants = queue.misses;
      if (missed.length) actions.appendChild(button(labels.misses, function () {
        start(spec.missesRound(missed, function (item) {return variants.get(spec.key(item));}), "misses");
      }));
      work.appendChild(actions); heading.focus(); announce(labels.roundComplete);
    }
    return {start:start, mixed:mixed, labels:labels};
  }

  var api = {
    create:create, buildRound:buildRound, createQueue:createQueue, periodicTable:periodicTable, LABELS:LABELS,
    node:node, button:button, cap:cap, shuffle:shuffle, chargeLabel:chargeLabel,
    token:token, fill:fill, join:join, compose:compose, render:render, speak:speak
  };
  if (typeof document !== "undefined") {
    document.querySelectorAll("[data-zsa-activity]").forEach(function (root) {
      root.addEventListener("zsa:request-engine", function (event) {event.detail.receive(api);}, {once:true});
    });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
