(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="metals-lab"]');
  if (!root) return;
  function el(id) { return root.querySelector('#' + id); }
  // Student text goes through t(): full templates from data.js, with English as the fallback.
  var i18n;
  root.dispatchEvent(new CustomEvent('zsa:request-i18n', {detail:{receive:function (api) { i18n = api; }}}));
  function t(text, values) { return i18n ? i18n.text(text, values) : text.replace(/\{(\w+)\}/g, function (m, k) { return values && values[k] !== undefined ? values[k] : m; }); }
  var NS = 'http://www.w3.org/2000/svg';
  var sample = 'A', station = 'appearance', strikes = 0, contact = false;
  var acid = 'empty', elapsed = 0, paused = false, lastFrame = 0, generation = 0, timer = null;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var samples = {
    A: {appearance: 'Silvery gray with a bright metallic reflection as the light moves across the surface.', mechanical: 'The solid spreads into a flatter piece under pressure. It bends and flattens instead of shattering.', current: 'STRONG', led: '#9ae6a2', conductivity: 'The tester detects strong current through the solid. Both probes are in direct contact with the sample.'},
    B: {appearance: 'Yellow with a dull surface. Moving the light produces little metallic reflection.', mechanical: 'The solid fractures into smaller yellow pieces. More pressure breaks those pieces further; it does not form a sheet.', current: 'NONE', led: '#3b4637', conductivity: 'No current is detected by this tester. Both probes are touching the solid, but the current indicator stays dark.'},
    C: {appearance: 'Dark gray with shiny, reflective crystal faces. Look for the flash on individual faces as the light moves.', mechanical: 'The shiny solid fractures into sharp, smaller pieces. It is brittle even though its surface has metallic luster.', current: 'WEAK', led: '#668b58', conductivity: 'The sensitive tester detects weak current, much less than for Unknown A. This sample shows semiconductor behavior; real readings depend strongly on purity, doping, and probe contact.'}
  };
  var titles = {appearance: 'Appearance', malleability: 'Malleability', conductivity: 'Conductivity', acid: 'Reaction with HCl'};
  var equipment = {appearance: 'WATCH GLASS / INSPECTION LIGHT', malleability: 'PORCELAIN MORTAR / PESTLE', conductivity: 'SOLID CONDUCTIVITY TESTER / PROBES', acid: 'TEST TUBE / PIPETTE / HCl WASTE'};
  function setHidden(node, hidden) { node.toggleAttribute('hidden', hidden); }
  function say(text) { el('observation').textContent = text; }
  function cloneSolid(holder) { holder.replaceChildren(el('solid-' + sample).cloneNode(true)); holder.firstChild.removeAttribute('id'); }
  function cleanAnimation() { ['pressing','contacted','pipetting','adding-solid','disposing'].forEach(function (c) { root.classList.remove(c); }); }
  function defer(fn, ms) { var current = generation; clearTimeout(timer); timer = setTimeout(function () { if (generation === current) fn(); }, ms); }
  function acidBusy() { return station === 'acid' && acid !== 'empty' && acid !== 'disposed'; }
  function setAcidLocks() {
    root.querySelectorAll('[data-sample],[data-station]').forEach(function (b) { b.disabled = acidBusy(); });
  }
  function updateAcid() {
    el('add-acid').disabled = acid !== 'empty';
    el('add-solid').disabled = acid !== 'ready';
    el('dispose').disabled = acid !== 'complete';
    setHidden(el('fresh-tube'), acid !== 'disposed');
    setHidden(el('pause'), acid !== 'running');
    el('pause').textContent = t(paused ? 'Resume observation' : 'Pause observation');
    setHidden(el('acid-liquid'), !['ready','adding','running','complete','disposing'].includes(acid));
    setHidden(el('meniscus'), el('acid-liquid').hasAttribute('hidden'));
    setHidden(el('tube-solid'), !['running','complete','disposing'].includes(acid));
    setHidden(el('pipette'), !['empty','pipetting'].includes(acid));
    setHidden(el('spatula'), acid !== 'adding');
    setHidden(el('acid-drop'), acid !== 'pipetting');
    setHidden(el('waste-liquid'), acid !== 'disposed');
    setHidden(el('waste-stream'), acid !== 'disposing');
    setHidden(el('bubbles'), !(sample === 'A' && elapsed >= 35 && ['running','complete'].includes(acid)));
    el('reaction-progress').value = elapsed;
    var seconds = Math.min(300, Math.floor(elapsed));
    el('clock').textContent = String(Math.floor(seconds / 60)).padStart(2,'0') + ':' + String(seconds % 60).padStart(2,'0') + ' / 05:00 · 20×';
    var warming = sample === 'A' ? Math.max(0, Math.min(1, (elapsed - 35) / 220)) * 2.6 : 0;
    el('temperature').textContent = (22 + warming).toFixed(1) + ' °C';
    el('tube-solid').setAttribute('transform','translate(406 338) scale(' + (sample === 'A' ? .31 - .1 * Math.min(elapsed / 300, 1) : .31) + ')');
    var states = {empty:'EMPTY TUBE',pipetting:'PIPETTING ACID',ready:'3 mL HCl / READY FOR SOLID',adding:'ADDING FRESH SOLID',running:paused ? 'OBSERVATION PAUSED' : 'OBSERVING / 20× TIME',complete:'OBSERVATION COMPLETE',disposing:'POURING INTO WASTE',disposed:'WASTE COLLECTED'};
    el('scene-state').textContent = t(states[acid]);
    setAcidLocks();
  }
  function acidObservation() {
    if (sample === 'A') {
      if (elapsed < 35) return t('The solid sits in clear acid. There is little visible change at first while the surface oxide layer is attacked.');
      if (elapsed < 180) return t('Small bubbles form on the solid and rise through the liquid. Gas formation is evidence of a chemical reaction; the tube begins to warm.');
      return t('Persistent gas bubbles rise from the shrinking solid. The temperature has risen; the liquid remains clear, with no new precipitate. The original solid is not a precipitate.');
    }
    return t(sample === 'B' ? 'The yellow solid remains in the clear acid. No persistent bubbles, new color, warming, or new precipitate appear during this observation.' : 'The gray solid remains in the clear acid. No persistent bubbles, new color, warming, or new precipitate appear during this observation.');
  }
  function buildFragments() {
    el('fragments').replaceChildren();
    for (var i = 0; i < 9; i++) {
      var g = document.createElementNS(NS,'g');
      g.setAttribute('transform','translate(' + (387 + i % 3 * 48 + (i % 2) * 8) + ' ' + (280 + Math.floor(i / 3) * 11) + ') rotate(' + (i * 41) + ') scale(' + (.2 + (i % 3) * .045) + ')');
      cloneSolid(g); el('fragments').appendChild(g);
    }
  }
  for (var i = 0; i < 16; i++) {
    var b = document.createElementNS(NS,'circle'); b.setAttribute('r', String(1.8 + i % 4 * .7)); b.setAttribute('class','bubble'); el('bubbles').appendChild(b);
  }
  function restore() {
    generation++; clearTimeout(timer); cleanAnimation(); strikes = 0; contact = false; acid = 'empty'; elapsed = 0; paused = false; lastFrame = 0;
    root.querySelectorAll('.solid-holder').forEach(cloneSolid); cloneSolid(el('tube-solid')); cloneSolid(el('falling-solid')); buildFragments();
    setHidden(el('fragments'), true); setHidden(el('flattened'), true); setHidden(el('mortar-solid'), false);
    el('press').disabled = false; el('press').textContent = t('Press with pestle'); el('fresh-mortar').disabled = false;
    el('meter-value').textContent = t('OPEN'); el('meter-led').setAttribute('fill','#3b4637'); el('contact').textContent = t('Touch probes to solid');
    ['appearance','malleability','conductivity','acid'].forEach(function (key) { setHidden(el(key + '-scene'), key !== station); setHidden(el(key + '-controls'), key !== station); });
    el('station-title').textContent = t(titles[station]); el('sample-badge').textContent = t('UNKNOWN {sample}', {sample:sample}); el('equipment').textContent = t(equipment[station]);
    el('scene-title').textContent = t({appearance:'Appearance station, Unknown {sample}',malleability:'Malleability station, Unknown {sample}',conductivity:'Conductivity station, Unknown {sample}',acid:'Reaction with HCl station, Unknown {sample}'}[station], {sample:sample});
    el('scene-desc').textContent = t({appearance:'A solid on a glass watch glass under an inspection lamp.',malleability:'A solid inside a porcelain mortar with a pestle above it.',conductivity:'Two probes and a sensitive solid conductivity tester next to a solid sample.',acid:'A test tube in a wooden rack, a pipette, dilute hydrochloric acid, and a waste beaker.'}[station]);
    root.querySelectorAll('[data-sample]').forEach(function (btn) { btn.setAttribute('aria-pressed',String(btn.dataset.sample === sample)); });
    root.querySelectorAll('[data-station]').forEach(function (btn) { btn.setAttribute('aria-pressed',String(btn.dataset.station === station)); });
    el('scene-state').textContent = t({appearance:'READY TO INSPECT',malleability:'FRESH SOLID IN MORTAR',conductivity:'PROBES DISCONNECTED',acid:'EMPTY TUBE'}[station]);
    el('clock').textContent = t('FRESH PORTION');
    if (station === 'appearance') { el('light-angle').value = '50'; light(); }
    if (station === 'malleability') say(t('A fresh portion of Unknown {sample} is in the mortar. Press with the pestle and watch whether it flattens or fractures.', {sample:sample}));
    if (station === 'conductivity') say(t('The circuit is open. Bring both probes into direct contact with Unknown {sample} to test the solid itself.', {sample:sample}));
    if (station === 'acid') { updateAcid(); say(t('Start with a clean test tube. Use the pipette to add 3 mL of 0.65 M hydrochloric acid before adding the solid.')); }
    else setAcidLocks();
  }
  function light() {
    var value = Number(el('light-angle').value);
    el('lamp').setAttribute('transform','translate(' + (value - 50) * 1.5 + ' 0)');
    el('light-pool').setAttribute('cx',String(330 + value * 2.1));
    var solid = el('appearance-scene').querySelector('.solid-holder');
    solid.setAttribute('opacity',String(sample === 'B' ? .95 : .72 + .28 * (1 - Math.abs(value - (sample === 'A' ? 42 : 62)) / 100)));
    say(t(samples[sample].appearance));
  }
  root.querySelectorAll('[data-sample]').forEach(function (btn) { btn.addEventListener('click',function () { if (acidBusy()) return; sample = btn.dataset.sample; restore(); }); });
  root.querySelectorAll('[data-station]').forEach(function (btn) { btn.addEventListener('click',function () { if (acidBusy()) return; station = btn.dataset.station; restore(); }); });
  el('light-angle').addEventListener('input',light);
  el('fresh-mortar').addEventListener('click',restore);
  el('press').addEventListener('click',function () {
    strikes++; root.classList.add('pressing'); el('press').disabled = true; el('fresh-mortar').disabled = true;
    say(t('Applying pressure with the porcelain pestle…')); el('scene-state').textContent = t('TESTING MALLEABILITY');
    defer(function () {
      root.classList.remove('pressing'); setHidden(el('mortar-solid'), true);
      setHidden(el('flattened'), sample !== 'A'); setHidden(el('fragments'), sample === 'A');
      el('flattened').setAttribute('rx',String(65 + Math.min(strikes,3) * 10));
      el('flattened').setAttribute('ry',String(16 - Math.min(strikes,3) * 2));
      if (strikes > 1 && sample !== 'A') el('fragments').querySelectorAll('g > g').forEach(function (g) { g.setAttribute('transform','scale(.7)'); });
      say(t(samples[sample].mechanical)); el('scene-state').textContent = t(sample === 'A' ? 'SOLID FLATTENS' : 'SOLID FRACTURES');
      el('press').disabled = strikes >= 3; el('press').textContent = t(strikes >= 3 ? 'Test complete' : 'Press again'); el('fresh-mortar').disabled = false;
    },reduced.matches ? 100 : 1950);
  });
  el('contact').addEventListener('click',function () {
    contact = !contact; root.classList.toggle('contacted',contact);
    el('meter-value').textContent = t(contact ? samples[sample].current : 'OPEN'); el('meter-led').setAttribute('fill',contact ? samples[sample].led : '#3b4637');
    el('contact').textContent = t(contact ? 'Lift probes' : 'Touch probes to solid');
    el('scene-state').textContent = t(contact ? 'BOTH PROBES TOUCHING SOLID' : 'PROBES DISCONNECTED');
    say(t(contact ? samples[sample].conductivity : 'The probes are lifted. The circuit is open and the tester no longer detects current.'));
  });
  el('add-acid').addEventListener('click',function () {
    if (acid !== 'empty') return;
    acid = 'pipetting'; root.classList.add('pipetting'); updateAcid(); say(t('Pipetting 3 mL of 0.65 M HCl into the test tube.'));
    defer(function () { acid = 'ready'; root.classList.remove('pipetting'); updateAcid(); say(t('The test tube contains 3 mL of clear 0.65 M HCl. Add a small, fresh portion of Unknown {sample}.', {sample:sample})); },reduced.matches ? 100 : 1300);
  });
  el('add-solid').addEventListener('click',function () {
    if (acid !== 'ready') return;
    acid = 'adding'; root.classList.add('adding-solid'); updateAcid(); say(t('Adding a small portion of Unknown {sample} to the acid.', {sample:sample}));
    defer(function () { acid = 'running'; root.classList.remove('adding-solid'); lastFrame = 0; updateAcid(); say(acidObservation()); },reduced.matches ? 100 : 1100);
  });
  el('pause').addEventListener('click',function () { paused = !paused; lastFrame = 0; updateAcid(); });
  el('dispose').addEventListener('click',function () {
    if (acid !== 'complete') return;
    acid = 'disposing'; root.classList.add('disposing'); updateAcid(); say(t('Pouring the acid and remaining solid into the beaker labeled HCl Waste.'));
    defer(function () { acid = 'disposed'; root.classList.remove('disposing'); updateAcid(); say(t('The acid and remaining solid are in HCl Waste. The tube is empty. You can start a fresh tube, choose another test, or investigate another unknown.')); },reduced.matches ? 100 : 1700);
  });
  el('fresh-tube').addEventListener('click',restore);
  function frame(now) {
    if (station === 'acid' && acid === 'running' && !paused && !document.hidden) {
      if (lastFrame) elapsed = Math.min(300, elapsed + Math.min((now - lastFrame) / 1000, .1) * 20);
      lastFrame = now;
      var oldStage = el('observation').textContent; var newStage = acidObservation();
      if (oldStage !== newStage) say(newStage);
      updateAcid();
      if (sample === 'A' && elapsed >= 35) el('bubbles').querySelectorAll('circle').forEach(function (b, j) {
        var phase = reduced.matches ? (j / 16) : ((elapsed / 32 + j / 16) % 1);
        b.setAttribute('cx',String(389 + (j * 13 % 34) + Math.sin(j + phase * 5) * 3)); b.setAttribute('cy',String(339 - phase * 66)); b.setAttribute('opacity',String(1 - phase * .7));
      });
      if (elapsed >= 300) { acid = 'complete'; updateAcid(); say(t('Five-minute observation complete. {observation} Dispose of the mixture in HCl Waste.', {observation:acidObservation()})); }
    } else lastFrame = 0;
    window.requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange',function () { lastFrame = 0; });
  restore(); window.requestAnimationFrame(frame);
}());
