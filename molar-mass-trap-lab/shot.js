(function () {
  "use strict";

  const root = document.querySelector('[data-zsa-activity="molar-mass-trap-lab"]');
  const $ = (id) => document.getElementById(id);
  root.addEventListener("zsa:molar-mass-shot", (event) => event.detail(createShotStation));

  function createShotStation({model, t, svg, element, setText, setAvailability, clock, getState, refresh}) {
    const {shot, liquids} = model;
    const codes = Object.keys(liquids);
    const racks = {}, tubeButtons = {}, cards = {};
    const top = -65, bottom = 77, tilt = 112;
    const scale = (bottom - top) / shot.travelMm;
    const radius = shot.diameterMm * scale / 2;
    const stopper = top - radius;
    const gap = shot.airGapMm * scale;
    const fill = stopper + gap;
    const innerBend = bottom + radius - 12;
    const outerBend = bottom + radius + 1 - 14;
    const tubeSelector = $("shot-tubes");
    const magnet = $("shot-magnet");
    const activeTube = $("shot-active-tube");
    const artLiquid = $("shot-art-liquid");
    // A reading the station saved for the student, shown until their next action.
    let notice = null;

    function code() { return getState().shot.liquid; }
    function tube() { return getState().shot.tubes[code()]; }
    function record(key) { return getState().notebook.shot[key]; }
    function liquidName(key) { return key + " " + t(liquids[key]); }

    function makeTube(host) {
      const upright = `M-12 ${fill}Q0 ${fill - 3} 12 ${fill}V${innerBend}a12 12 0 0 1-24 0Z`;
      const highEnd = bottom + radius - gap;
      const inverted = `M-12 ${stopper}H12V${highEnd}Q0 ${highEnd + 3} -12 ${highEnd}Z`;
      const liquid = svg("path", {
        d: upright,
        class: "zsa-mmt-shot-liquid"
      });
      const ball = svg("circle", {cx: 0, cy: bottom, r: radius, fill: "url(#mmt-steel)", stroke: "#233c4c", "stroke-width": ".6"});
      host.append(
        liquid,
        svg("path", {d: `M-14-72V${outerBend}a14 14 0 0 0 28 0V-72Z`, fill: "url(#mmt-glass)", stroke: "#bedde6", "stroke-width": "1.1"}),
        svg("path", {d: "M-10-59v124m20-49v50", stroke: "#ecfbff", "stroke-opacity": ".4", fill: "none"}),
        ball,
        svg("rect", {x: -15, y: stopper - 11, width: 30, height: 11, rx: 1.7, fill: "url(#mmt-cork)", stroke: "#cfac77"}),
        svg("path", {d: "M-15-72h30v8h-30Z", fill: "#d7e4eb", "fill-opacity": ".24", stroke: "#a2b8c5", "stroke-width": ".6"})
      );
      return {liquid, ball, upright, inverted};
    }

    function addRackTube(key, index) {
      const x = 43 + index * 44;
      const group = svg("g", {transform: `translate(${x} 127) scale(.79)`});
      const outline = svg("rect", {x: -22, y: -90, width: 44, height: 179, rx: 7, class: "zsa-mmt-shot-rack-outline"});
      const drawing = svg("g", {});
      group.append(outline, drawing);
      const {liquid, ball} = makeTube(drawing);
      liquid.dataset.liquid = key;
      const label = svg("text", {x, y: 222, "text-anchor": "middle", class: "zsa-mmt-scene-label"});
      label.textContent = key;
      $("shot-rack-content").append(group, label);
      racks[key] = {group, drawing, ball};
    }

    function action(id, perform) {
      const button = $(id);
      button.addEventListener("click", () => {
        if (button.getAttribute("aria-disabled") === "true") return;
        notice = null;
        const focus = perform();
        refresh();
        if (focus instanceof HTMLElement) focus.focus();
      });
      button.addEventListener("keydown", (event) => {
        if (event.repeat && event.key === "Enter") event.preventDefault();
      });
    }

    function chooseTube(key) {
      if (key === code()) return;
      pause(clock());
      getState().shot.liquid = key;
      refresh();
    }

    function addTubeButton(key) {
      const button = element("button");
      button.type = "button";
      button.dataset.shotTube = key;
      button.dataset.liquid = key;
      const chip = element("span", "zsa-mmt-bottle-code", key);
      const name = element("span", "", t(liquids[key]));
      button.append(chip, " ", name);
      button.addEventListener("click", () => chooseTube(key));
      tubeSelector.append(button);
      tubeButtons[key] = {button, name};
    }

    function labeledInput() {
      const label = element("label", "zsa-mmt-shot-field");
      const caption = element("span");
      const input = element("input");
      input.type = "text";
      input.autocomplete = "off";
      const printed = element("span", "zsa-mmt-print-only");
      label.append(caption, input, printed);
      return {label, caption, input, printed};
    }

    function tableLabel(field, column, title) {
      field.caption.hidden = true;
      field.input.setAttribute("aria-labelledby", column + " " + title.id);
    }

    function showSource(field, source) {
      const instrumentTimed = source === "event";
      field.source.hidden = !instrumentTimed;
      setText(field.source, instrumentTimed ? t("Instrument-timed") : "");
      if (instrumentTimed) field.input.setAttribute("aria-describedby", field.source.id);
      else field.input.removeAttribute("aria-describedby");
    }

    function addTrialField(key) {
      const card = cards[key];
      const index = card.fields.length;
      const field = labeledInput();
      field.source = element("span", "zsa-mmt-shot-source");
      field.source.id = "shot-source-" + key + "-" + index;
      field.source.hidden = true;
      field.label.append(field.source);
      if (index < 2) {
        tableLabel(field, "shot-trial-" + (index + 1) + "-heading", card.title);
        card.cells[index].append(field.label);
      } else {
        card.trials.append(field.label);
      }
      field.input.addEventListener("input", () => {
        const entry = record(key);
        if (entry.trials[index] !== field.input.value) entry.sources[index] = null;
        entry.trials[index] = field.input.value;
        entry.computed = null;
        setText(field.printed, field.input.value);
        showSource(field, entry.sources[index]);
        updateSummary(key);
      });
      card.fields.push(field);
    }

    function addCard(key) {
      const row = element("tr");
      row.dataset.shotCard = key;
      const title = element("th");
      title.id = "shot-liquid-" + key;
      title.scope = "row";
      title.dataset.liquid = key;
      const name = element("span");
      title.append(element("span", "zsa-mmt-liquid-letter", key), " ", name);
      const cells = [element("td"), element("td")];
      const mean = labeledInput();
      tableLabel(mean, "shot-average-heading", title);
      const average = element("td");
      const result = element("p", "zsa-mmt-shot-result");
      average.append(mean.label, result);
      row.append(title, ...cells, average);
      $("shot-entries").append(row);

      const detail = element("div", "zsa-mmt-shot-details");
      detail.dataset.shotExtra = key;
      const detailTitle = element("h4");
      const trials = element("div", "zsa-mmt-shot-trials");
      const add = element("button", "zsa-btn zsa-mmt-quiet");
      add.type = "button";
      const summary = element("p", "zsa-mmt-shot-summary");
      summary.setAttribute("role", "status");
      detail.append(detailTitle, trials, add, summary);
      $("shot-extras").append(detail);
      cards[key] = {title, name, cells, detail, detailTitle, trials, fields: [], add, mean, result, summary};

      add.addEventListener("click", () => {
        if (add.getAttribute("aria-disabled") === "true") return;
        const entry = record(key);
        const index = cards[key].fields.length;
        entry.trials[index] = "";
        renderCard(key);
        cards[key].fields[index].input.focus();
      });
      mean.input.addEventListener("input", () => {
        const entry = record(key);
        entry.studentMean = mean.input.value;
        entry.computed = null;
        setText(mean.printed, mean.input.value);
        updateSummary(key);
      });
    }

    const seconds = (value) => String(Number(value.toFixed(4)));

    function updateSummary(key) {
      const {add, result, summary, fields} = cards[key];
      const entry = record(key);
      const checked = entry.computed;
      const lastTrial = entry.trials[fields.length - 1];
      const canAdd = [entry.trials[0], entry.trials[1], lastTrial].every((value) => model.parseShotReading(value));
      add.setAttribute("aria-disabled", String(!canAdd));
      if (!checked) {
        setText(result, "");
        setText(summary, "");
        return;
      }
      if (checked.kind === "needed") {
        setText(result, t("Check trials"));
        setText(summary, t("Enter two times in seconds with a decimal point, or use <0.5 for a fall too fast to time."));
        return;
      }

      const [first, second] = checked.trials;
      const values = {first, second};
      let message, compact;
      if (checked.kind === "exact") {
        const rounded = model.formatShotAverage(checked);
        compact = rounded + " s";
        message = t("Trials {first} and {second} give an average of {seconds} s.", {...values, seconds: rounded});
      } else if (checked.kind === "below") {
        compact = "<0.5 s";
        message = t("The average of trials {first} and {second} is less than 0.5 s.", values);
      } else {
        const bounds = {lower: seconds(checked.lower), upper: seconds(checked.upper)};
        compact = t("{lower} to <{upper} s", bounds);
        message = t("For trials {first} and {second}, the average is at least {lower} s and less than {upper} s.", {...values, ...bounds});
      }
      if (first !== 1 || second !== 2) compact += " · " + t("Trials {first}, {second}", values);
      if (entry.studentMean?.trim() && checked.kind !== "bound") {
        message += " " + t(model.shotMeanMatches(checked, entry.studentMean) ?
          "Your average matches." : "Check your average against these two trials.");
      }
      // Label the computed value so the notebook and printout never pass it off as the student's own average.
      setText(result, t("Lab's average: {value}", {value: compact}));
      setText(summary, message);
    }

    function renderCard(key) {
      const card = cards[key];
      const entry = record(key);
      const fieldCount = Math.max(2, entry.trials.length);
      while (card.fields.length > fieldCount) card.fields.pop().label.remove();
      while (card.fields.length < fieldCount) addTrialField(key);
      card.detail.dataset.hasTrials = String(fieldCount > 2);
      setText(card.name, t(liquids[key]));
      setText(card.detailTitle, liquidName(key));
      setText(card.add, t("Add trial"));
      card.mean.input.value = entry.studentMean ?? "";
      setText(card.mean.printed, entry.studentMean ?? "");
      card.fields.forEach((field, index) => {
        setText(field.caption, t("Fall time, trial {number} (s)", {number: index + 1}));
        field.input.value = entry.trials[index] ?? "";
        setText(field.printed, entry.trials[index] ?? "");
        showSource(field, entry.sources[index]);
      });
      updateSummary(key);
    }

    function renderNotebook() {
      for (const key of codes) renderCard(key);
    }

    function checkAverages() {
      const hasEntry = (entry) => entry.trials.some((trial) => trial?.trim()) || entry.studentMean?.trim();
      const empty = !codes.some((key) => hasEntry(record(key)));
      for (const key of codes) {
        const entry = record(key);
        if (hasEntry(entry) || (empty && key === code())) {
          entry.computed = model.summarizeShotTrials(entry.trials) ?? {kind: "needed"};
        }
        updateSummary(key);
      }
    }

    // Event timing reads to the same 0.5 s floor as a hand-held stopwatch, so a fast fall gives the worksheet's "<0.5".
    function belowEventFloor(trial, elapsedMs) {
      return trial.mode === "event" && trial.startedAt !== null && elapsedMs < shot.manualThresholdS * 1000;
    }

    function readingText(trial, elapsedMs) {
      return belowEventFloor(trial, elapsedMs) ? "<0.5" : (elapsedMs / 1000).toFixed(2);
    }

    function appendReading(value) {
      const live = tube();
      if (live.trial.recorded) return;
      const entry = record(code());
      let index = 0;
      while (entry.trials[index]?.trim()) index++;
      entry.trials[index] = value;
      entry.sources[index] = live.trial.mode === "event" && value !== "<0.5" ? "event" : null;
      entry.computed = null;
      live.trial.recorded = true;
      renderCard(code());
      return index + 1;
    }

    // Keep a finished, unflagged stopwatch reading before the magnet or a reset clears the trial.
    function saveUnrecordedReading() {
      const live = tube();
      const trial = live.trial;
      if (live.phase !== "at-bottom" || trial.contactedAt === null || trial.recorded || trial.pausedAt !== null) return;
      if (trial.startedAt === null || trial.stoppedAt === null || model.manualTimingIssue(trial)) return;
      const elapsedMs = trial.stoppedAt - trial.startedAt;
      if (elapsedMs < 5) return;
      const reading = readingText(trial, elapsedMs);
      notice = {key: code(), reading, number: appendReading(reading)};
    }

    function position(sample, progress) {
      switch (sample.phase) {
        case "tilting": return 1 - Math.max(0, (progress - .35) / .65);
        case "magnet-return": return 1 - progress;
        case "falling":
        case "replaying": return progress;
        case "at-bottom": return 1;
        default: return 0;
      }
    }

    function paintArt(sample, key, view, motion, force, now) {
      const p = motion ? view.progress : 0;
      let angle = sample.orientation === "tilted" ? tilt : 0;
      if (sample.phase === "tilting") angle = tilt * p;
      if (sample.phase === "uprighting") angle = tilt * (1 - p);
      const y = top + (bottom - top) * position(sample, p);
      activeTube.setAttribute("transform", `translate(195 119) rotate(${angle})`);
      activeArt.ball.setAttribute("cy", y);
      const liquidPath = angle > 90 ? activeArt.inverted : activeArt.upright;
      if (activeArt.liquid.getAttribute("d") !== liquidPath) activeArt.liquid.setAttribute("d", liquidPath);
      racks[key].drawing.setAttribute("visibility", angle > 1 ? "hidden" : "visible");
      racks[key].ball.setAttribute("cy", y);
      $("shot-markers").setAttribute("visibility", angle > 1 ? "hidden" : "visible");
      const near = sample.phase === "magnet-return" || (sample.phase === "at-stopper" && sample.orientation === "upright");
      const retract = sample.phase === "releasing" ? p : 1;
      const magnetX = near ? 240 : 240 + 111 * retract;
      const magnetY = near ? 119 + y : 119 + top + (155 - 119 - top) * retract;
      magnet.setAttribute("transform", `translate(${magnetX} ${magnetY})`);

      if (force) {
        setText(artLiquid, liquidName(key));
        activeArt.liquid.dataset.liquid = key;
        for (const other of codes) {
          setText(tubeButtons[other].name, t(liquids[other]));
          tubeButtons[other].button.setAttribute("aria-pressed", String(other === key));
          cards[other].detail.hidden = other !== key;
          racks[other].group.dataset.selected = String(other === key);
          if (other === key) continue;
          const inactive = getState().shot.tubes[other];
          const outOfRack = inactive.orientation === "tilted" || inactive.phase === "tilting";
          racks[other].drawing.setAttribute("visibility", outOfRack ? "hidden" : "visible");
          const snapshot = model.shotSnapshot(inactive, other, now);
          racks[other].ball.setAttribute("cy", top + (bottom - top) * position(inactive, snapshot.progress));
        }
      }
    }

    function instruction(sample, view, justReplayed, key) {
      const trial = sample.trial;
      const slowReplay = shot.travelMs[key] < shot.minimumReplayMs;
      if (trial.pausedAt !== null) return t("Trial paused. Resume when you are ready.");
      switch (sample.phase) {
        case "tilting": return t("The shot is moving toward the stopper.");
        case "magnet-return": return t("The magnet is moving the shot toward the stopper.");
        case "at-stopper": return t(sample.orientation === "tilted" ?
          "The shot is at the stopper. Turn the tube upright." : "The shot is at the stopper. Release it by moving the magnet away.");
        case "uprighting":
        case "releasing": return t("Watch for the shot to leave the stopper.");
        case "falling":
          if (trial.mode === "event") return t("The shot left the stopper. The stopwatch is running.");
          if (trial.startedAt === null) return t("The shot left the stopper. Start timing now.");
          return t("Watch for the shot to touch the bottom.");
        case "replaying": return t(slowReplay ? "Slow-motion replay. Watch for departure and first contact." :
          "Replay. The shot leaves the stopper. Watch for first contact.");
        case "at-bottom":
          if (justReplayed) {
            // Only the event-timed instrument reports the interval. A manual replay leaves the measurement to the student.
            if (trial.mode !== "event") return t(slowReplay ?
              "Slow-motion replay complete. The markers show when to start and stop timing." :
              "Replay complete. Compare the marked departure and first contact with your stopwatch.");
            if (shot.travelMs[key] < shot.manualThresholdS * 1000) {
              return t(slowReplay ? "Slow-motion replay complete. The original fall took less than 0.5 s." :
                "Replay complete. First contact came less than 0.5 s after departure.");
            }
            return t(slowReplay ? "Slow-motion replay complete. The original fall took {seconds} s." :
              "Replay complete. First contact came {seconds} s after departure.", {seconds: (shot.travelMs[key] / 1000).toFixed(2)});
          }
          if (trial.contactedAt === null) return t("Tilt the selected tube to bring the shot to the stopper.");
          if (view.running) return t("The shot touched the bottom. Stop timing.");
          return t("The shot touched the bottom. Record a reading or return it with the magnet.");
      }
    }

    function updateControls(sample, key, view, justReplayed) {
      const trial = sample.trial;
      const paused = trial.pausedAt !== null;
      const atBottom = sample.phase === "at-bottom";
      const atStopper = sample.phase === "at-stopper";
      const hasFall = atBottom && trial.contactedAt !== null;
      const readyToRecord = hasFall && !trial.recorded && !paused && !view.running;
      const shortFall = hasFall && trial.contactedAt - trial.departedAt < shot.manualThresholdS * 1000;
      const canChooseMode = !paused && !view.running && trial.departedAt === null &&
        (atBottom || atStopper);
      setText($("bench-instruction"), instruction(sample, view, justReplayed, key));
      let operation = trial.departedAt !== null || sample.phase === "magnet-return" ? "Use magnet" : "Tilt tube";
      if (sample.phase === "uprighting" || (atStopper && sample.orientation === "tilted")) operation = "Turn upright";
      else if (sample.phase === "releasing" || atStopper) operation = "Release shot";
      setText($("shot-operate"), t(operation));
      $("shot-resume").hidden = !paused;
      setAvailability("shot-operate", !paused && (atStopper || (atBottom && !view.running)));
      setAvailability("shot-replay", hasFall && !view.running && !paused);
      setAvailability("shot-reset", paused || !atBottom || trial.contactedAt !== null || trial.startedAt !== null);
      $("shot-mode-manual").setAttribute("aria-pressed", String(trial.mode === "manual"));
      $("shot-mode-event").setAttribute("aria-pressed", String(trial.mode === "event"));
      setAvailability("shot-mode-manual", canChooseMode);
      setAvailability("shot-mode-event", canChooseMode);
      setText($("shot-stopwatch"), t(view.running ? "Stop timing" : "Start timing"));
      setAvailability("shot-stopwatch", !paused && trial.mode === "manual" &&
        (view.running || model.canStartStopwatch(sample)));
      setAvailability("shot-clear", !paused && trial.mode === "manual" && trial.startedAt !== null && sample.phase !== "replaying");
      setAvailability("shot-record", readyToRecord && trial.stoppedAt !== null && view.stopwatchMs >= 5);
      // In manual mode the student judges whether a fall was too fast to time.
      setAvailability("shot-record-below", readyToRecord && (trial.mode === "manual" || shortFall));
      $("shot-top-marker").dataset.active = String(atStopper || ["falling", "replaying"].includes(sample.phase));
      $("shot-bottom-marker").dataset.active = String(hasFall);
      const issue = model.manualTimingIssue(trial);
      const issues = {
        "early-stop": "The stopwatch stopped before contact. Try another run.",
        "late-stop": "The stopwatch stopped after first contact. Try another run.",
        start: "The stopwatch missed departure from the stopper. Try another run."
      };
      let feedback = "";
      if (notice && notice.key === key) {
        feedback = t("Reading {seconds} s saved as trial {number}.", {seconds: notice.reading, number: notice.number});
      } else if (trial.recorded) feedback = t("Reading recorded in your notebook.");
      else if (issue) feedback = t(issues[issue]);
      else if (hasFall && trial.mode === "manual" && trial.startedAt === null) {
        feedback = t("A fall too fast to time can be recorded as less than 0.5 s.");
      }
      setText($("shot-feedback"), feedback);
    }

    function paint(now, motion, force) {
      const sample = tube();
      const key = code();
      const phase = sample.phase;
      model.updateShot(sample, key, now);
      const view = model.shotSnapshot(sample, key, now);
      const paused = sample.trial.pausedAt !== null;
      if (force || phase !== sample.phase) {
        updateControls(sample, key, view, phase === "replaying" && sample.phase === "at-bottom");
      }
      paintArt(sample, key, view, motion, force, now);
      setText($("shot-time"), readingText(sample.trial, view.stopwatchMs) + " s");
      return {
        moving: !paused && Number.isFinite(view.remaining),
        next: paused ? Infinity : Math.min(view.remaining, view.running ? 100 : Infinity)
      };
    }

    function pause(now) {
      model.pauseShot(tube(), code(), now);
    }

    const activeArt = makeTube(activeTube);
    codes.forEach((key, index) => {
      addRackTube(key, index);
      addTubeButton(key);
      addCard(key);
    });
    $("shot-check-averages").addEventListener("click", checkAverages);
    action("shot-operate", () => {
      saveUnrecordedReading();
      model.operateShot(tube(), code(), clock());
    });
    action("shot-stopwatch", () => model.toggleStopwatch(tube(), code(), clock()));
    action("shot-resume", () => {
      const sample = tube();
      const now = clock();
      model.resumeShot(sample, now);
      const manualControl = sample.trial.mode === "manual" &&
        (model.shotSnapshot(sample, code(), now).running || model.canStartStopwatch(sample));
      return $(manualControl ? "shot-stopwatch" : "shot-time");
    });
    action("shot-clear", () => {
      Object.assign(tube().trial, {startedAt: null, stoppedAt: null});
    });
    action("shot-reset", () => {
      saveUnrecordedReading();
      getState().shot.tubes[code()] = model.createShotTube();
    });
    action("shot-replay", () => model.playShotReplay(tube(), code(), clock()));
    action("shot-mode-manual", () => { tube().trial.mode = "manual"; });
    action("shot-mode-event", () => {
      Object.assign(tube().trial, {mode: "event", startedAt: null, stoppedAt: null});
    });
    action("shot-record", () => {
      const now = clock();
      const view = model.shotSnapshot(tube(), code(), now);
      appendReading(readingText(tube().trial, view.stopwatchMs));
    });
    action("shot-record-below", () => appendReading("<0.5"));
    return {paint, pause, renderNotebook};
  }
}());
