(function () {
  "use strict";

  const root = document.querySelector('[data-zsa-activity="molar-mass-trap-lab"]');
  const $ = (id) => document.getElementById(id);
  root.addEventListener("zsa:molar-mass-shot", (event) => event.detail(createShotStation));

  function createShotStation({model, t, svg, element, setText, setAvailability, clock, getState, refresh}) {
    const {shot, liquids} = model;
    const codes = Object.keys(liquids);
    const racks = {}, tubeButtons = {};
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

    function code() { return getState().shot.liquid; }
    function tube() { return getState().shot.tubes[code()]; }
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

    // The stopwatch reads to the worksheet's 0.5 s threshold, so a faster fall reads "<0.5".
    function belowThreshold(trial, elapsedMs) {
      return trial.startedAt !== null && elapsedMs < shot.fastFallThresholdS * 1000;
    }

    function readingText(trial, elapsedMs) {
      return belowThreshold(trial, elapsedMs) ? "<0.5" : (elapsedMs / 1000).toFixed(2);
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
        case "falling": return t("The shot left the stopper. The stopwatch is running.");
        case "replaying": return t(slowReplay ? "Slow-motion replay. Watch for departure and first contact." :
          "Replay. The shot leaves the stopper. Watch for first contact.");
        case "at-bottom":
          if (justReplayed) {
            if (shot.travelMs[key] < shot.fastFallThresholdS * 1000) {
              return t(slowReplay ? "Slow-motion replay complete. The original fall took less than 0.5 s." :
                "Replay complete. First contact came less than 0.5 s after departure.");
            }
            return t(slowReplay ? "Slow-motion replay complete. The original fall took {seconds} s." :
              "Replay complete. First contact came {seconds} s after departure.", {seconds: (shot.travelMs[key] / 1000).toFixed(2)});
          }
          if (trial.contactedAt === null) return t("Tilt the selected tube to bring the shot to the stopper.");
          return t("The shot touched the bottom. Record the time on your lab worksheet, then use the magnet for another trial.");
      }
    }

    function updateControls(sample, key, view, justReplayed) {
      const trial = sample.trial;
      const paused = trial.pausedAt !== null;
      const atBottom = sample.phase === "at-bottom";
      const atStopper = sample.phase === "at-stopper";
      const hasFall = atBottom && trial.contactedAt !== null;
      setText($("bench-instruction"), instruction(sample, view, justReplayed, key));
      let operation = trial.departedAt !== null || sample.phase === "magnet-return" ? "Use magnet" : "Tilt tube";
      if (sample.phase === "uprighting" || (atStopper && sample.orientation === "tilted")) operation = "Turn upright";
      else if (sample.phase === "releasing" || atStopper) operation = "Release shot";
      setText($("shot-operate"), t(operation));
      $("shot-resume").hidden = !paused;
      setAvailability("shot-operate", !paused && (atStopper || (atBottom && !view.running)));
      setAvailability("shot-replay", hasFall && !view.running && !paused);
      setAvailability("shot-reset", paused || !atBottom || trial.contactedAt !== null || trial.startedAt !== null);
      $("shot-top-marker").dataset.active = String(atStopper || ["falling", "replaying"].includes(sample.phase));
      $("shot-bottom-marker").dataset.active = String(hasFall);
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
      const starting = view.running && belowThreshold(sample.trial, view.stopwatchMs);
      setText($("shot-time"), starting ? t(paused ? "Paused" : "Timing") : readingText(sample.trial, view.stopwatchMs) + " s");
      // The face shows whether the stopwatch is ready, running, paused or holding a reading.
      $("shot-stopwatch").dataset.state = paused ? "paused" : view.running ? "running" :
        sample.trial.stoppedAt !== null ? "stopped" : "ready";
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
    });
    action("shot-operate", () => model.operateShot(tube(), code(), clock()));
    action("shot-resume", () => {
      model.resumeShot(tube(), clock());
      return $("shot-time");
    });
    action("shot-reset", () => { getState().shot.tubes[code()] = model.createShotTube(); });
    action("shot-replay", () => model.playShotReplay(tube(), code(), clock()));
    return {paint, pause};
  }
}());
