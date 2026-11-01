(function () {
  "use strict";
const $ = id => document.getElementById(id);
let model, i18n;
document.querySelector('.clock').dispatchEvent(new CustomEvent('zsa:request-i18n', {detail: {receive: api => { i18n = api; }}}));
// Every sentence is one full template from data.js, filled with values, so each language keeps its word order.
function t(text, values = {}) {
 if (i18n) return i18n.text(text, values);
 return text.replace(/\{(\w+)\}/g, (m, k) => values[k] === undefined ? m : values[k]);
}
if (i18n && i18n.lang === 'es') {
 // The challenge note has bold text inside one sentence, so it is rebuilt from one template.
 const note = $('challenge-note'), parts = t('Find a mixture that turns blue at {target} (within ±1.0 s). Try a recipe, observe, and adjust.').split('{target}');
 const strong = document.createElement('strong'); strong.textContent = t('20.0 seconds');
 note.replaceChildren(parts[0], strong, parts[1] || '');
}
document.querySelector('.clock').dispatchEvent(new CustomEvent('iodine-clock-model', {detail: {receive: api => { model = api; }}}));
let mode = 'concentration', stage = 'stock', stock = 4, targetTemp = 22, actualTemp = 22;
let busy = false, elapsed = 0, endTime = 0, paused = false, last = 0, frame = 0, runToken = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const svgNS = 'http://www.w3.org/2000/svg';
for (let n = 0; n <= 20; n++) {
 const line = document.createElementNS(svgNS, 'path');
 const y = 391 - n * 8;
 line.setAttribute('d', `M${n % 5 === 0 ? 306 : 312} ${y}H320`);
 $('cylinder-ticks').append(line);
}
function say(title, detail) { $('status').textContent = title; $('observation').textContent = detail; }
function liquid(volume, blue = false) {
 const height = volume * 3.5;
 $('a-liquid').setAttribute('y', 422 - height);
 $('a-liquid').setAttribute('height', height);
 $('a-liquid').setAttribute('fill', blue ? 'url(#blue)' : 'url(#clear)');
 $('a-meniscus').setAttribute('cy', 422 - height);
 $('a-meniscus').setAttribute('opacity', volume ? '1' : '0');
 $('a-meniscus').setAttribute('fill', blue ? '#293a86' : '#d5eaf0');
}
function temperature(t) {
 $('thermometer-out').textContent = t.toFixed(1) + ' °C';
 const y = 195 - (t - 5) * 3.5;
 $('mercury').setAttribute('y', y); $('mercury').setAttribute('height', 236 - y);
}
function renderControls() {
 $('stock-out').textContent = stock.toFixed(1);
 $('water-out').textContent = (16 - stock).toFixed(1) + ' mL';
 $('conc-out').textContent = model.concentration(stock).toFixed(4) + ' M';
 $('stock').value = stock;
 document.querySelectorAll('[data-volume]').forEach(b => { const selected = Number(b.dataset.volume) === stock; b.classList.toggle('selected', selected); b.setAttribute('aria-pressed', selected); });
 document.querySelectorAll('[data-temp]').forEach(b => { const selected = Number(b.dataset.temp) === targetTemp; b.classList.toggle('selected', selected); b.setAttribute('aria-pressed', selected); });
}
function lockConditions(locked) { $('volume-controls').disabled = locked || mode === 'temperature'; $('bath-controls').disabled = locked; }
function reset() {
 runToken++; cancelAnimationFrame(frame); busy = false; elapsed = 0; paused = false; stage = 'stock'; actualTemp = 22;
 $('stopwatch').textContent = '0.00'; $('action').textContent = t('Measure KIO₃'); $('action').disabled = false;
 $('phase').textContent = t('Ready to prepare'); $('pause').hidden = true; $('pause').textContent = t('Pause');
 $('clock-state').textContent = t('Not started'); $('a-temp').textContent = '22.0 °C'; $('a-volume').textContent = '0.0 mL'; $('mix-volume').textContent = '-';
 $('live-dot').className = 'live-dot'; $('beaker-label').textContent = t('SOLUTION A · empty');
 $('b-beaker').removeAttribute('transform'); $('b-beaker').setAttribute('opacity', '1'); $('b-liquid').setAttribute('opacity', '1');
 $('pour-stream').setAttribute('opacity', '0'); $('swirl').setAttribute('opacity', '0'); $('bath-visual').setAttribute('opacity', '0');
 $('cylinder').removeAttribute('transform'); $('cylinder-liquid').setAttribute('height', '0');
 liquid(0); temperature(22); lockConditions(false); renderControls();
 say(t('Measure the potassium iodate to begin.'), mode === 'challenge' ? t('Choose your recipe. Aim for a blue endpoint at 20.0 s.') : t('The beaker is empty. Both reagents are colorless.'));
}
// Preparation animations never advance the reaction clock. Token invalidates callbacks on reset/mode changes.
function animate(duration, draw, complete) {
 const token = runToken; const start = performance.now(); busy = true; $('action').disabled = true;
 function tick(now) {
  if (token !== runToken) return;
  const p = Math.min(1, (now - start) / duration); draw(p);
  if (p < 1) frame = requestAnimationFrame(tick);
  else { busy = false; $('action').disabled = false; complete(); }
 }
 frame = requestAnimationFrame(tick);
}
function measure(isWater) {
 lockConditions(true);
 const amount = isWater ? 16 - stock : stock, initial = isWater ? stock : 0;
 $('phase').textContent = isWater ? t('Adding DI water') : t('Measuring KIO₃');
 say(isWater ? t('Diluting Solution A to 16.0 mL.') : t('Measuring the KIO₃ stock.'), t('Read the graduated cylinder at the meniscus.'));
 animate(reducedMotion ? 200 : 1800, p => {
  const fill = p < .45 ? p / .45 : Math.max(0, 1 - (p - .55) / .4);
  $('cylinder-liquid').setAttribute('height', amount * 8 * fill); $('cylinder-liquid').setAttribute('y', 391 - amount * 8 * fill);
  if (p > .45 && !reducedMotion) { const q = Math.sin(Math.min(1, (p - .45) / .55) * Math.PI); $('cylinder').setAttribute('transform', `translate(${q * 70},${-q * 145}) rotate(${q * 26},309,290)`); }
  const transferred = Math.max(0, Math.min(1, (p - .55) / .4));
  liquid(initial + amount * transferred); $('a-volume').textContent = (initial + amount * transferred).toFixed(1) + ' mL';
 }, () => {
  $('cylinder').removeAttribute('transform'); $('cylinder-liquid').setAttribute('height', '0'); liquid(isWater ? 16 : stock);
  if (isWater) {
   stage = mode === 'temperature' ? 'condition' : 'mix'; $('action').textContent = stage === 'condition' ? t('Condition Solution A') : t('Add B & start clock');
   $('phase').textContent = t('Solution A prepared'); $('beaker-label').textContent = t('SOLUTION A · 16.0 mL');
   say(t('Solution A is ready.'), stage === 'condition' ? t('Condition the beaker before adding Solution B.') : t('Add 6.4 mL of Solution B to start the reaction.'));
  } else { stage = 'water'; $('action').textContent = t('Add DI water'); $('beaker-label').textContent = t('KIO₃ STOCK · {volume} mL', {volume: stock.toFixed(1)}); say(t('Potassium iodate measured.'), t('Add {water} mL DI water to make 16.0 mL of Solution A.', {water: (16 - stock).toFixed(1)})); }
 });
}
function condition() {
 $('phase').textContent = t('Conditioning Solution A');
 $('bath-visual').setAttribute('opacity', targetTemp === 22 ? '0' : '1'); $('ice').setAttribute('opacity', targetTemp === 5 ? '1' : '0');
 $('bath-label').textContent = targetTemp === 5 ? t('ICE WATER BATH') : t('WARM WATER BATH');
 say(t('Waiting for Solution A to reach temperature.'), t('Bath conditioning is accelerated; the thermometer measures Solution A.'));
 animate(reducedMotion ? 200 : 3200, p => { actualTemp = 22 + (targetTemp - 22) * p; temperature(actualTemp); $('a-temp').textContent = actualTemp.toFixed(1) + ' °C'; }, () => {
  actualTemp = targetTemp; stage = 'mix'; $('action').textContent = t('Add B & start clock'); $('phase').textContent = t('Temperature reached');
  say(t('Solution A is at {temp} °C.', {temp: targetTemp.toFixed(1)}), t('The bath is removed for mixing. Solution B starts at 22 °C.'));
 });
}
function finish() {
 busy = false; stage = 'done'; elapsed = endTime; $('stopwatch').textContent = elapsed.toFixed(2); liquid(22.4, true);
 $('swirl').setAttribute('opacity', '0'); $('pause').hidden = true; $('action').disabled = false; $('action').textContent = t('Prepare another trial');
 $('phase').textContent = t('Blue endpoint'); $('clock-state').textContent = t('Stopped'); $('live-dot').className = 'live-dot done'; $('beaker-label').textContent = t('IODINE-STARCH COMPLEX');
 const delta = elapsed - 20, miss = {delta: Math.abs(delta).toFixed(2)}, time = {time: elapsed.toFixed(2)};
 say(mode === 'challenge' ? (Math.abs(delta) <= 1 ? t('Challenge met! The clock turned blue near 20 s.') : (delta < 0 ? t('{delta} s early - adjust your next mixture.', miss) : t('{delta} s late - adjust your next mixture.', miss))) : t('The blue endpoint has appeared.'), mode === 'challenge' && Math.abs(delta) > 1 ? (delta > 0 ? t('Clock stopped at {time} s. Try more potassium iodate.', time) : t('Clock stopped at {time} s. Try less potassium iodate.', time)) : t('Clock stopped at {time} s. Iodine now persists and forms a dark blue complex with starch.', time));
}
function tick(now) {
 if (stage !== 'running') return;
 const dt = (now - last) / 1000; last = now;
 if (!paused) {
  elapsed = Math.min(endTime, elapsed + dt * Number($('speed').value)); $('stopwatch').textContent = elapsed.toFixed(2);
  if (!reducedMotion) $('swirl').setAttribute('transform', `translate(${Math.sin(elapsed * 3) * 3},0)`);
  if (elapsed >= endTime) { finish(); return; }
 }
 frame = requestAnimationFrame(tick);
}
function mix() {
 $('bath-visual').setAttribute('opacity', '0'); $('phase').textContent = t('Adding Solution B');
 say(t('Pouring in Solution B.'), t('The clock starts at first contact.'));
 let started = false, pourLast = 0;
 endTime = model.clockTime(stock, actualTemp);
 const mixedTemp = model.mixtureTemperature(actualTemp);
 animate(reducedMotion ? 400 : 2000, p => {
  if (!reducedMotion) {
   const lift = Math.sin(Math.min(1, p / .8) * Math.PI / 2);
   $('b-beaker').setAttribute('transform', `translate(${-lift * 155},${-lift * 145}) rotate(${-lift * 60},674,300)`);
   const angle = -lift * Math.PI / 3; const x = 674 - 39 * Math.cos(angle) + 12 * Math.sin(angle) - lift * 155; const y = 300 - 39 * Math.sin(angle) - 12 * Math.cos(angle) - lift * 145;
   $('pour-stream').setAttribute('d', `M${x} ${y}Q${x + 15} ${y + 30} 470 290`);
  }
  if (p >= .4) {
   if (!started) { started = true; pourLast = performance.now(); $('clock-state').textContent = t('Running'); $('live-dot').className = 'live-dot running'; }
   const pourNow = performance.now(); elapsed += (pourNow - pourLast) / 1000 * Number($('speed').value); pourLast = pourNow;
   $('stopwatch').textContent = elapsed.toFixed(2);
   const added = Math.min(1, (p - .4) / .4);
   liquid(16 + added * 6.4); $('mix-volume').textContent = (16 + added * 6.4).toFixed(1) + ' mL';
   $('pour-stream').setAttribute('opacity', p < .8 ? '.8' : '0'); $('b-liquid').setAttribute('opacity', 1 - added);
   temperature(actualTemp + (mixedTemp - actualTemp) * added);
  }
 }, () => {
  $('pour-stream').setAttribute('opacity', '0'); $('b-beaker').removeAttribute('transform'); $('b-liquid').setAttribute('opacity', '0');
  liquid(22.4); temperature(mixedTemp); $('mix-volume').textContent = '22.4 mL'; $('beaker-label').textContent = t('REACTION MIXTURE · 22.4 mL');
  stage = 'running'; busy = true; $('action').disabled = true; $('action').textContent = t('Reaction in progress'); $('pause').hidden = false; $('swirl').setAttribute('opacity', '.65');
  $('phase').textContent = t('Reaction running');
  say(t('Watch closely for the blue endpoint.'), t('The mixture is clear. Initial mixed temperature: {temp} °C.', {temp: mixedTemp.toFixed(1)}));
  last = performance.now(); frame = requestAnimationFrame(tick);
 });
}
$('action').addEventListener('click', () => { if (busy) return; if (stage === 'stock') measure(false); else if (stage === 'water') measure(true); else if (stage === 'condition') condition(); else if (stage === 'mix') mix(); else reset(); });
$('reset').addEventListener('click', reset);
$('stock').addEventListener('input', () => { stock = Number($('stock').value); renderControls(); });
document.querySelectorAll('[data-volume]').forEach(b => b.addEventListener('click', () => { stock = Number(b.dataset.volume); renderControls(); }));
document.querySelectorAll('[data-temp]').forEach(b => b.addEventListener('click', () => { targetTemp = Number(b.dataset.temp); renderControls(); }));
document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
 mode = b.dataset.mode; targetTemp = 22; if (mode === 'temperature') stock = 4;
 document.querySelectorAll('[data-mode]').forEach(t => { t.classList.toggle('active', t === b); t.setAttribute('aria-pressed', t === b); });
 $('bath-controls').hidden = mode !== 'temperature'; $('challenge-note').hidden = mode !== 'challenge';
 $('mode-title').textContent = t({concentration:'Change the concentration',temperature:'Change the temperature',challenge:'Beat the 20-second clock'}[mode]);
 $('mode-description').textContent = t({concentration:'Keep the volume constant. How does more potassium iodate change the wait?',temperature:'Keep the recipe constant. Compare chilled, room-temperature, and warmed Solution A.',challenge:'Use what you observed to choose a recipe. Can you time the sudden change?'}[mode]);
 reset();
}));
$('pause').addEventListener('click', () => { paused = !paused; $('pause').textContent = paused ? t('Resume') : t('Pause'); $('phase').textContent = paused ? t('Paused') : t('Reaction running'); $('clock-state').textContent = paused ? t('Paused') : t('Running'); });
$('zsa-th-instructions-open').setAttribute('aria-controls','instructions');
$('zsa-th-instructions-open').addEventListener('click', () => $('instructions').showModal());
$('close-instructions').addEventListener('click', () => $('instructions').close());
$('instructions').addEventListener('click', e => { if (e.target === $('instructions')) { const r = e.target.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close(); } });
// Hidden browser tabs suspend the clock rather than producing a surprise endpoint.
document.addEventListener('visibilitychange', () => { if (document.hidden && stage === 'running' && !paused) $('pause').click(); });
reset();
})();
