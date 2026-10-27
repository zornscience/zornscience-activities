(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const svg = $('apparatus'), ns = 'http://www.w3.org/2000/svg', h = 1 / 240;
  let L, m, g, A, theta, w, t, running = false, started = false;
  let acc = 0, last = 0, dragging = false, side = 1, reference = null, experiment = '';
  function node(tag, attrs, text) {
    const n = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => n.setAttribute(key, value));
    if (text) n.textContent = text;
    return n;
  }
  for (let angle = -60; angle <= 60; angle += 10) {
    const r = angle * Math.PI / 180;
    $('scale').append(node('path', {d: `M${450 + 80 * Math.sin(r)} ${115 + 80 * Math.cos(r)}l${8 * Math.sin(r)} ${8 * Math.cos(r)}`, stroke: '#93aebb'}));
    $('scale').append(node('text', {x: 450 + 104 * Math.sin(r), y: 119 + 104 * Math.cos(r), fill: '#b5cbd6', 'font-size': 10, 'text-anchor': 'middle'}, Math.abs(angle) + '°'));
  }
  // The rule has physical 10 cm marks at the same 215 px/m scale as the string.
  $('ruler').append(node('rect', {x: 748, y: 223, width: 24, height: 215, rx: 2, fill: '#d6cda9'}));
  for (let i = 0; i <= 10; i++) {
    $('ruler').append(node('path', {d: `M748 ${223 + i * 21.5}h14`, stroke: '#635f50'}));
    if (i % 2 === 0) $('ruler').append(node('text', {x: 767, y: 226 + i * 21.5, fill: '#453f32', 'font-size': 8, 'text-anchor': 'end'}, String(i * 10)));
  }
  $('ruler').append(node('text', {x: 785, y: 340, fill: '#b5cbd6', 'font-size': 11}, 'cm'));
  function period(length, gravity, amplitude) {
    if (!gravity || !amplitude) return null;
    let a = 1, b = Math.cos(amplitude / 2);
    for (let i = 0; i < 8; i++) { const c = (a + b) / 2; b = Math.sqrt(a * b); a = c; }
    return 2 * Math.PI * Math.sqrt(length / gravity) / a;
  }
  function energy(mass, gravity, length, amplitude) { return mass * gravity * length * (1 - Math.cos(amplitude)); }
  function setRunning(value) {
    running = value;
    $('release').textContent = running ? 'Ⅱ Pause' : started ? '▶ Resume' : '▶ Release bob';
    $('step').disabled = running || !g || !A;
  }
  function reset() {
    started = false; theta = side * A; w = 0; t = 0; acc = 0;
    if (reference) { reference.theta = A; reference.w = 0; }
    setRunning(false); draw();
  }
  function clearComparison() {
    reference = null; experiment = '';
    $('reference').setAttribute('hidden', '');
    $('comparison-result').hidden = true;
    $('challenge').textContent = 'Free exploration: change one variable at a time. Predict, release, then compare.';
    document.querySelectorAll('.experiment-buttons button').forEach(button => button.setAttribute('aria-pressed', String(button.id === 'free-explore')));
  }
  function setup() {
    L = +$('length').value; m = +$('mass').value; g = +$('world').value; A = +$('angle').value * Math.PI / 180;
    $('length-value').textContent = L.toFixed(2) + ' m';
    $('mass-value').textContent = Math.round(m * 1000) + ' g';
    $('angle-value').textContent = $('angle').value + '°';
    ['length', 'mass', 'angle'].forEach(id => $(id).setAttribute('aria-valuetext', $(id + '-value').textContent));
    $('world-badge').textContent = $('world').selectedOptions[0].textContent.split(' ·')[0].toUpperCase() + ' LABORATORY';
    $('period').textContent = g ? (2 * Math.PI * Math.sqrt(L / g)).toFixed(3) + ' s' : 'No oscillation';
    const actual = period(L, g, A);
    $('actual').textContent = actual ? actual.toFixed(3) + ' s' : 'No oscillation';
    $('insight').textContent = !g ? 'Without gravity there is no restoring force. A bob released from rest stays where it is.' : !A ? 'The bob is at equilibrium. Choose a release angle to start an oscillation.' : 'Length is measured from the pivot to the center of the bob. Watch how long a full return trip takes.';
    $('status').textContent = 'Ready to release. Settings changes restart the motion.';
    reset();
  }
  function draw() {
    const len = L * 215, x = 450 + len * Math.sin(theta), y = 115 + len * Math.cos(theta);
    const radius = 18 + 10 * Math.cbrt(m / .5);
    $('cord').setAttribute('d', `M450 115L${x} ${y}`);
    $('bob').setAttribute('transform', `translate(${x} ${y}) scale(${radius / 23}) translate(0 -23)`);
    $('arc').setAttribute('d', `M${450 - len * Math.sin(A)} ${115 + len * Math.cos(A)} A${len} ${len} 0 0 0 ${450 + len * Math.sin(A)} ${115 + len * Math.cos(A)}`);
    if (reference) {
      const rx = 450 + reference.L * 215 * Math.sin(reference.theta), ry = 115 + reference.L * 215 * Math.cos(reference.theta);
      $('reference-cord').setAttribute('d', `M450 115L${rx} ${ry}`);
      $('reference-bob').setAttribute('cx', rx); $('reference-bob').setAttribute('cy', ry);
    }
    const E = energy(m, g, L, A), pe = m * g * L * (1 - Math.cos(theta)), ke = .5 * m * L * L * w * w;
    const refEnergy = reference ? energy(reference.m, reference.g, reference.L, A) : 0;
    const scale = Math.max(E, refEnergy) || 1;
    ['pe', 'ke'].forEach((id, i) => {
      $(id).max = scale; $(id).value = i ? ke : pe;
      $(id + '-value').textContent = (i ? ke : pe).toFixed(3) + ' J';
    });
    $('total').textContent = 'Total ' + E.toFixed(3) + ' J';
    $('energy-scale').textContent = reference ? 'Same scale for both setups. Dashed reference total: ' + refEnergy.toFixed(3) + ' J. Brass bob total: ' + E.toFixed(3) + ' J.' : 'Both bars use the same joule scale. Total mechanical energy stays constant.';
    $('energy-cue').textContent = !g ? 'Zero gravity: no gravitational potential energy and no motion from rest.' : !A ? 'At rest at the bottom: both energies are zero.' : Math.abs(theta) / A > .98 ? 'At a turning point: greatest height and potential energy; speed reaches zero.' : Math.abs(theta) / A < .12 ? 'At the bottom: lowest potential energy and greatest kinetic energy and speed.' : theta * w < 0 ? 'Moving down: potential energy transfers to kinetic energy. The bob speeds up.' : 'Moving up: kinetic energy transfers to potential energy. The bob slows down.';
    $('velocity').textContent = (Math.abs(w) * L).toFixed(3) + ' m/s';
    $('theta').textContent = (theta * 180 / Math.PI).toFixed(1) + '°';
    $('clock').textContent = t.toFixed(2) + ' s';
    $('state').textContent = running ? 'OSCILLATING' : started ? 'PAUSED' : 'READY TO RELEASE';
    const T = period(L, g, A), fraction = T ? t / T : 0, count = Math.floor(fraction);
    $('cycles').textContent = count + ' complete oscillation' + (count === 1 ? '' : 's');
    $('cycle').value = fraction - count;
    $('cycle-phase').textContent = !T ? 'No oscillation' : !started ? 'Release to start' : fraction % 1 < .5 ? 'Outbound: toward the opposite side' : 'Returning: toward the starting side';
    if (reference) {
      $('comparison-result').hidden = false;
      const labels = {mass: 'Only mass changes: 100 g → 200 g. Length, gravity and angle match. Predict: will the heavier bob swing faster?', length: 'Only length changes: 0.60 m → 1.20 m. Mass, gravity and angle match. Predict: will doubling length double the period?', moon: 'Only gravity changes: Earth → Moon. Mass, length and angle match. Predict: which pendulum will return first?'};
      $('comparison-result').textContent = started ? experiment === 'mass' ? 'Same period, twice the energy. The dashed reference and brass bob stay together: extra mass increases both inertia and gravitational force.' : experiment === 'length' ? 'Twice the length gives √2 ≈ 1.41 times the period. The longer brass pendulum takes longer to return.' : 'The brass bob on the Moon has about 2.46 times Earth’s period. Weaker gravity gives a weaker restoring effect.' : labels[experiment];
    }
  }
  function integrate(q, v, length, gravity, dt) {
    const f = angle => -gravity / length * Math.sin(angle);
    const a = v, b = f(q), c = v + dt * b / 2, d = f(q + dt * a / 2);
    const e = v + dt * d / 2, f2 = f(q + dt * c / 2), j = v + dt * f2, k = f(q + dt * e);
    return [q + dt * (a + 2 * c + 2 * e + j) / 6, v + dt * (b + 2 * d + 2 * f2 + k) / 6];
  }
  function step(dt) {
    [theta, w] = integrate(theta, w, L, g, dt);
    if (reference) [reference.theta, reference.w] = integrate(reference.theta, reference.w, reference.L, reference.g, dt);
    t += dt;
  }
  function frame(now) {
    const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now;
    if (running) { acc += dt * +$('speed').value; while (acc >= h) { step(h); acc -= h; } draw(); }
    requestAnimationFrame(frame);
  }
  ['length', 'mass', 'angle', 'world'].forEach(id => $(id).addEventListener('input', () => { clearComparison(); side = 1; setup(); }));
  $('settings-toggle').addEventListener('click', () => {
    const open = $('settings-toggle').getAttribute('aria-expanded') !== 'true';
    $('settings-toggle').setAttribute('aria-expanded', String(open));
    $('settings-toggle').textContent = open ? 'Hide apparatus settings' : 'Adjust apparatus';
  });
  $('release').addEventListener('click', () => {
    if (!g || !A) { $('status').textContent = !g ? 'No restoring force in zero gravity. The bob remains at rest.' : 'Choose an angle above 0° to make the bob swing.'; return; }
    started = true; setRunning(!running);
    $('status').textContent = running ? 'Released. Watch for a complete return trip.' : 'Motion paused. Step forward to inspect the swing.'; draw();
  });
  $('step').addEventListener('click', () => {
    if (running || !g || !A) return;
    started = true; for (let i = 0; i < 12; i++) step(h);
    setRunning(false); draw(); $('status').textContent = 'Advanced 0.05 seconds of simulation time.';
  });
  $('reset').addEventListener('click', () => { reset(); $('status').textContent = 'Returned to the starting position. Ready to repeat.'; });
  ['mass', 'length', 'moon'].forEach(kind => $('compare-' + kind).addEventListener('click', () => {
    experiment = kind; side = 1;
    reference = {L: .6, m: .1, g: 9.81, theta: 15 * Math.PI / 180, w: 0};
    $('length').value = kind === 'length' ? '1.2' : '.6'; $('mass').value = kind === 'mass' ? '.2' : '.1';
    $('world').value = kind === 'moon' ? '1.62' : '9.81'; $('angle').value = '15';
    $('reference').removeAttribute('hidden');
    document.querySelectorAll('.experiment-buttons button').forEach(button => button.setAttribute('aria-pressed', String(button.id === 'compare-' + kind)));
    $('challenge').textContent = 'Dashed outline: original Earth setup (0.60 m, 100 g, 15°). Brass bob: your changed setup. Both start together.';
    setup();
  }));
  $('free-explore').addEventListener('click', () => { clearComparison(); setup(); });
  function move(event) {
    const pt = svg.createSVGPoint(); pt.x = event.clientX; pt.y = event.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const angle = Math.atan2(p.x - 450, p.y - 115) * 180 / Math.PI;
    side = angle < 0 ? -1 : 1; $('angle').value = Math.round(Math.min(60, Math.abs(angle))); setup();
  }
  $('bob').addEventListener('pointerdown', event => { event.preventDefault(); clearComparison(); dragging = true; svg.setPointerCapture(event.pointerId); move(event); });
  svg.addEventListener('pointermove', event => { if (dragging) move(event); });
  svg.addEventListener('pointerup', () => { dragging = false; });
  svg.addEventListener('pointercancel', () => { dragging = false; });
  document.addEventListener('visibilitychange', () => {
    last = 0; acc = 0;
    if (document.hidden && running) { setRunning(false); draw(); $('status').textContent = 'Paused while this tab was hidden. Resume when ready.'; }
  });
  setup(); requestAnimationFrame(frame);
}());
