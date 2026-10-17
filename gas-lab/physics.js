// Gas Laws and KMT Lab: the model. Gas constants, the ideal gas law, the van der Waals equation (with its
// liquid-vapor coexistence from the equal-area rule), the 3D Maxwell-Boltzmann distribution, unit conversions and
// the particle simulation that measures pressure from momentum given to the walls. No drawing and no page text:
// lab.js draws it and data.js holds every word. Investigations read their numbers from here too.
//
// No globals: page scripts ask for this module with a "zsa-gl:request-physics" event on the activity root.
// (In Node, for the unit tests, it is module.exports.)
(function () {
  "use strict";

  // ---------- Constants ----------
  var R_ATM = 0.08206;     // L·atm/(mol·K), for the gas law values students calculate
  var R_SI = 8.314;        // J/(mol·K), for speeds and kinetic energy
  var KPA_PER_ATM = 101.325;
  var BAR_PER_ATM = 1.01325;
  var ZERO_C = 273.15;
  var DOTS_PER_MOL = 200;  // each dot stands for 1/200 mol, about 3 × 10^21 molecules
  var SCALE = 6e-4;        // animation: container widths per second for each m/s of real speed (same for every particle)

  // Molar masses (g/mol): IUPAC standard atomic weights. Van der Waals a (bar·L²/mol²) and b (L/mol): CRC
  // Handbook of Chemistry and Physics, as tabulated in the README. a is converted to atm·L²/mol² where it is used.
  var GASES = {
    He: {M:4.0026, a:0.0346, b:0.0238},
    Ne: {M:20.180, a:0.2135, b:0.01709},
    Ar: {M:39.948, a:1.355, b:0.03201},
    Kr: {M:83.798, a:2.349, b:0.03978},
    Xe: {M:131.29, a:4.250, b:0.05105},
    N2: {M:28.014, a:1.370, b:0.0387},
    O2: {M:31.998, a:1.382, b:0.03186},
    CO2: {M:44.009, a:3.640, b:0.04267}
  };
  var GAS_IDS = ["He", "Ne", "Ar", "Kr", "Xe", "N2", "O2", "CO2"];

  // Control ranges. Real gas mode allows smaller volumes (higher pressures), drawn at 4 times the scale.
  var RANGES = {
    ideal: {V:[1, 10], Vfull:10, Vstep:0.1},
    real: {V:[0.25, 2.5], Vfull:2.5, Vstep:0.05},
    T: [100, 1000], n: [0.10, 2.00], nExtra: [0, 2.00]
  };

  // ---------- Units ----------
  function kelvinToCelsius(k) {return k - ZERO_C;}
  function celsiusToKelvin(c) {return c + ZERO_C;}
  function atmToKpa(p) {return p * KPA_PER_ATM;}
  function kpaToAtm(p) {return p / KPA_PER_ATM;}
  function aAtm(gas) {return GASES[gas].a / BAR_PER_ATM;}

  // ---------- Ideal gas law (atm, L, mol, K) ----------
  function idealP(n, T, V) {return n * R_ATM * T / V;}
  function idealV(n, T, P) {return n * R_ATM * T / P;}
  function idealT(P, V, n) {return P * V / (n * R_ATM);}
  function idealN(P, V, T) {return P * V / (R_ATM * T);}

  // ---------- Kinetic molecular theory ----------
  // M in g/mol. Speeds in m/s; kinetic energy per mole in J/mol (and per molecule from N_A).
  var N_A = 6.02214076e23;
  function kg(M) {return M / 1000;}
  function vmp(T, M) {return Math.sqrt(2 * R_SI * T / kg(M));}
  function vavg(T, M) {return Math.sqrt(8 * R_SI * T / (Math.PI * kg(M)));}
  function vrms(T, M) {return Math.sqrt(3 * R_SI * T / kg(M));}
  function keMolar(T) {return 1.5 * R_SI * T;}
  function keMolecule(T) {return keMolar(T) / N_A;}
  // 3D Maxwell-Boltzmann speed distribution: f(v) = 4π v² (m/2πkT)^{3/2} exp(-mv²/2kT), with s = sqrt(kT/m).
  function mbPdf(v, T, M) {
    var s2 = R_SI * T / kg(M);
    return Math.sqrt(2 / Math.PI) * v * v / Math.pow(s2, 1.5) * Math.exp(-v * v / (2 * s2));
  }
  function erf(x) {
    // Abramowitz and Stegun 7.1.26 is too coarse for goodness-of-fit tests; this series and continued fraction is
    // accurate to about 1e-14.
    var sign = x < 0 ? -1 : 1; x = Math.abs(x);
    if (x < 3) {
      var sum = x, term = x, x2 = x * x;
      for (var k = 1; k < 200; k++) {term *= -x2 / k; var add = term / (2 * k + 1); sum += add; if (Math.abs(add) < 1e-17) break;}
      return sign * 2 / Math.sqrt(Math.PI) * sum;
    }
    var f = 0;
    for (var j = 60; j >= 1; j--) f = j / 2 / (x + f);
    return sign * (1 - Math.exp(-x * x) / Math.sqrt(Math.PI) / (x + f));
  }
  function mbCdf(v, T, M) {
    var s = Math.sqrt(R_SI * T / kg(M)), u = v / s;
    return erf(u / Math.SQRT2) - Math.sqrt(2 / Math.PI) * u * Math.exp(-u * u / 2);
  }

  // ---------- Random numbers ----------
  // Seeded generator (mulberry32) for the tests; the page uses Math.random.
  function seeded(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(rand) {
    var u = 0;
    while (u === 0) u = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  }
  // A velocity drawn from the 3D Maxwell-Boltzmann distribution: each component is normal with variance RT/M, so the
  // direction is uniformly random and the speed follows f(v) above.
  function sampleVelocity(T, M, rand) {
    var s = Math.sqrt(R_SI * T / kg(M));
    return [s * gauss(rand), s * gauss(rand), s * gauss(rand)];
  }

  // ---------- Van der Waals ----------
  // Reduced form: Pr = 8Tr/(3Vr - 1) - 3/Vr², with Tc = 8a/(27Rb), Pc = a/(27b²), Vc = 3b.
  function critical(gas) {
    var a = aAtm(gas), b = GASES[gas].b;
    return {T:8 * a / (27 * R_ATM * b), P:a / (27 * b * b), V:3 * b};
  }
  function reducedP(Vr, Tr) {return 8 * Tr / (3 * Vr - 1) - 3 / (Vr * Vr);}
  function bisect(f, lo, hi, iterations) {
    var flo = f(lo);
    for (var i = 0; i < (iterations || 200); i++) {
      var mid = (lo + hi) / 2, fm = f(mid);
      if ((fm > 0) === (flo > 0)) {lo = mid; flo = fm;} else hi = mid;
    }
    return (lo + hi) / 2;
  }
  // Liquid-vapor coexistence of the van der Waals fluid at Tr < 1 from Maxwell's equal-area rule:
  // {P, Vl, Vg} in reduced units, or null at or above the critical temperature.
  var satCache = {};
  function saturation(Tr) {
    if (!(Tr < 1) || Tr <= 0.05) return null;
    var key = Tr.toFixed(6);
    if (satCache[key]) return satCache[key];
    // Spinodals, where dP/dV = 0: 4Tr V³ = (3V - 1)². The isotherm has a minimum at V1 < 1 and a maximum at V2 > 1.
    var g = function (V) {return 4 * Tr * V * V * V - (3 * V - 1) * (3 * V - 1);};
    var V1 = bisect(g, 1 / 3 + 1e-12, 1), hi = 2;
    while (g(hi) < 0) hi *= 2;
    var V2 = bisect(g, 1, hi);
    var pMin = reducedP(V1, Tr), pMax = reducedP(V2, Tr);
    function roots(p) {
      var Vl = bisect(function (V) {return reducedP(V, Tr) - p;}, 1 / 3 + 1e-15, V1);
      var top = V2 * 2;
      while (reducedP(top, Tr) > p) top *= 2;
      var Vg = bisect(function (V) {return reducedP(V, Tr) - p;}, V2, top);
      return [Vl, Vg];
    }
    // Area between the isotherm and the line P = p, from Vl to Vg; it decreases as p rises and is zero at saturation.
    function area(p) {
      var r = roots(p), Vl = r[0], Vg = r[1];
      return 8 * Tr / 3 * Math.log((3 * Vg - 1) / (3 * Vl - 1)) + 3 * (1 / Vg - 1 / Vl) - p * (Vg - Vl);
    }
    var lo = Math.max(pMin, 0) * (1 + 1e-12) + 1e-300, top2 = pMax * (1 - 1e-12);
    // Search on a log scale: at low Tr the saturation pressure is many orders of magnitude below Pc.
    var llo = Math.log(Math.max(lo, 1e-200)), lhi = Math.log(top2);
    for (var i = 0; i < 200; i++) {
      var mid = (llo + lhi) / 2;
      if (area(Math.exp(mid)) > 0) llo = mid; else lhi = mid;
    }
    var p = Math.exp((llo + lhi) / 2), r = roots(p);
    satCache[key] = {P:p, Vl:r[0], Vg:r[1]};
    return satCache[key];
  }
  // The van der Waals state of n mol of a gas at T (K) in V (L). P in atm. Z = PV/nRT. In one phase Z is the
  // particle volume term Vm/(Vm - b) minus the attraction term a/(RT·Vm). Inside the coexistence curve the model
  // splits into liquid and vapor at the saturation pressure, and liquid is the fraction of the moles that condensed.
  function vdw(gas, n, T, V) {
    var a = aAtm(gas), b = GASES[gas].b, Vm = V / n, c = critical(gas);
    var ideal = idealP(n, T, V);
    var volumeTerm = Vm / (Vm - b), attractionTerm = a / (R_ATM * T * Vm);
    var out = {ideal:ideal, volumeTerm:volumeTerm, attractionTerm:attractionTerm, Tc:c.T, condensed:false, liquid:0};
    var sat = saturation(T / c.T), Vr = Vm / c.V;
    if (sat && Vr > sat.Vl && Vr < sat.Vg) {
      out.condensed = true;
      out.liquid = (sat.Vg - Vr) / (sat.Vg - sat.Vl);
      out.P = sat.P * c.P;
    } else {
      out.P = n * R_ATM * T / (V - n * b) - a * n * n / (V * V);
    }
    out.Z = out.P * V / (n * R_ATM * T);
    return out;
  }

  // ---------- States and changes ----------
  // A lab state: {mode: "ideal"|"real", gases: [{gas, n}], V, T, hold: "T"|"V"|"P", P}. P is the held pressure
  // (hold P); otherwise it follows from the others. Mixtures (more than one gas) are ideal only.
  function totalMoles(state) {return state.gases.reduce(function (sum, g) {return sum + g.n;}, 0);}
  function pressure(state) {
    if (state.mode === "real") return vdw(state.gases[0].gas, state.gases[0].n, state.T, state.V).P;
    return idealP(totalMoles(state), state.T, state.V);
  }
  function clone(state) {
    return {mode:state.mode, gases:state.gases.map(function (g) {return {gas:g.gas, n:g.n};}), V:state.V, T:state.T, hold:state.hold, P:state.P};
  }
  function clamp(x, lo, hi) {return Math.min(hi, Math.max(lo, x));}
  // Change one variable ("V", "T", or "n0", "n1", "n2" for a gas's moles) as the hold setting allows. Holding P,
  // the volume responds to T and n; if it would leave its range, the change stops where the piston reaches the end
  // and `limited` is set. Returns {state, limited}.
  function change(state, key, value) {
    var s = clone(state), range = RANGES[s.mode], limited = false;
    if (key === "V") {
      if (s.hold === "V" || s.hold === "P") return {state:s, limited:true};
      s.V = clamp(value, range.V[0], range.V[1]);
    } else if (key === "T" || key.charAt(0) === "n") {
      if (key === "T" && s.hold === "T") return {state:s, limited:true};
      var i = key === "T" ? -1 : Number(key.slice(1));
      var lo = key === "T" ? RANGES.T[0] : (i === 0 ? RANGES.n[0] : RANGES.nExtra[0]);
      var hi = key === "T" ? RANGES.T[1] : RANGES.n[1];
      value = clamp(value, lo, hi);
      if (s.hold === "P") {
        // V = n_total·R·T / P must stay in range: find the value where it reaches the end.
        var others = i < 0 ? totalMoles(s) : totalMoles(s) - s.gases[i].n;
        var Vfor = function (x) {return i < 0 ? idealV(others, x, s.P) : idealV(others + x, s.T, s.P);};
        var Vnew = Vfor(value);
        if (Vnew > range.V[1] || Vnew < range.V[0]) {
          var Vend = Vnew > range.V[1] ? range.V[1] : range.V[0];
          value = i < 0 ? idealT(s.P, Vend, others) : idealN(s.P, Vend, s.T) - others;
          value = clamp(value, lo, hi);
          limited = true;
        }
        if (i < 0) s.T = value; else s.gases[i].n = value;
        s.V = clamp(idealV(totalMoles(s), s.T, s.P), range.V[0], range.V[1]);
      } else if (i < 0) s.T = value; else s.gases[i].n = value;
    }
    if (s.hold !== "P") s.P = pressure(s);
    return {state:s, limited:limited};
  }

  // ---------- Particle simulation ----------
  // Point particles in a 2D container: width 1, height V/Vfull, the top wall is the piston. Each particle carries a
  // 3D velocity (vx, vy, vz) in real m/s and moves on screen with (vx, vy) × SCALE, so its speed is the 3D speed and
  // the speeds follow the 3D Maxwell-Boltzmann distribution. Walls are elastic. The gauge adds up the momentum
  // given to the walls, 2·m·|v_normal| per hit, where m is the mass of the moles one dot stands for.
  //
  // Pressure from the walls: for one particle the force on a side wall per unit length is m·vx²·SCALE/(W·H). Summed
  // and divided by the perimeter this gives N·m·<vx²>·SCALE/A for every wall. The 3D pressure is N·m·<vx²>/V, so
  // P = (impulse per time per perimeter) × A/(SCALE·V): the calibration constant A/(SCALE·V) is the same for every
  // state in a mode, because the container's area is proportional to its volume.
  //
  // Real gas mode draws the particles as disks whose total area is the fraction n·b/V of the container, and lets
  // them collide (equal masses swap the velocity component along the line between centers, which keeps the
  // Maxwell-Boltzmann distribution). The gauge then shows the van der Waals pressure; the disks only illustrate.
  function createSim(options) {
    options = options || {};
    var rand = options.rand || Math.random;
    var sim = {
      state:null, n:0, x:[], y:[], vx:[], vy:[], vz:[], comp:[], liquid:[], H:1, Htarget:1, r:0,
      moles:[], counts:[], floor:0, t:0
    };
    var BIN = 0.25, MAXBINS = 40; // the gauge averages over at most 10 s of model time
    var bins = [], current = null;
    function resetGauge() {bins = []; current = {t:0, impulse:[0, 0, 0], hits:0};}
    resetGauge();
    function calibration() {
      var Vfull = RANGES[sim.state.mode].Vfull;
      return 1 / (SCALE * Vfull * 1e-3); // A/(SCALE·V) with A = 1·H and V = H·Vfull litres
    }
    function geometry(state) {return state.V / RANGES[state.mode].Vfull;}
    function massOf(c) {return sim.counts[c] ? sim.moles[c] / sim.counts[c] * kg(GASES[sim.state.gases[c].gas].M) : 0;}
    function addParticle(c, T) {
      var v = sampleVelocity(T, GASES[sim.state.gases[c].gas].M, rand);
      sim.x.push(sim.r + rand() * (1 - 2 * sim.r));
      sim.y.push(sim.floor + sim.r + rand() * Math.max(0, sim.H - sim.floor - 2 * sim.r));
      sim.vx.push(v[0]); sim.vy.push(v[1]); sim.vz.push(v[2]); sim.comp.push(c); sim.liquid.push(false);
    }
    function removeAt(i) {
      ["x", "y", "vx", "vy", "vz", "comp", "liquid"].forEach(function (k) {sim[k].splice(i, 1);});
    }
    function radius(state) {
      if (state.mode !== "real") return 0;
      var g = state.gases[0], N = Math.max(1, Math.round(g.n * DOTS_PER_MOL));
      var fraction = g.n * GASES[g.gas].b / state.V; // the share of the volume the molecules themselves take up
      return Math.sqrt(fraction * geometry(state) / (N * Math.PI));
    }
    // Apply a new state. Temperature changes scale every speed by sqrt(T2/T1); a new gas scales speeds by
    // sqrt(M1/M2) (both keep the Maxwell-Boltzmann shape); moles add or remove particles. `animate` moves the piston
    // over the next few frames instead of at once.
    sim.set = function (state, animate) {
      var old = sim.state;
      sim.state = clone(state);
      if (!old) {
        sim.H = sim.Htarget = geometry(state);
      } else {
        sim.Htarget = geometry(state);
        if (!animate || old.mode !== state.mode) sim.H = sim.Htarget;
        if (old.T !== state.T) {
          var f = Math.sqrt(state.T / old.T);
          for (var i = 0; i < sim.x.length; i++) {sim.vx[i] *= f; sim.vy[i] *= f; sim.vz[i] *= f;}
        }
        state.gases.forEach(function (g, c) {
          var before = old.gases[c];
          if (!before || before.gas === g.gas) return;
          var k = Math.sqrt(GASES[before.gas].M / GASES[g.gas].M);
          for (var i = 0; i < sim.x.length; i++) if (sim.comp[i] === c) {sim.vx[i] *= k; sim.vy[i] *= k; sim.vz[i] *= k;}
        });
      }
      sim.r = radius(state);
      sim.moles = state.gases.map(function (g) {return g.n;});
      sim.counts = state.gases.map(function (g) {return g.n > 0 ? Math.max(1, Math.round(g.n * DOTS_PER_MOL)) : 0;});
      for (var i = sim.x.length - 1; i >= 0; i--) if (sim.comp[i] >= state.gases.length) removeAt(i);
      sim.counts.forEach(function (want, c) {
        var have = [];
        for (var j = 0; j < sim.x.length; j++) if (sim.comp[j] === c) have.push(j);
        for (var k = have.length - 1; k >= want; k--) removeAt(have[k]);
        for (var m = have.length; m < want; m++) addParticle(c, state.T);
      });
      sim.n = sim.x.length;
      sim.counts.forEach(function (want, c) {normalize(c, state.T);});
      sim.real = state.mode === "real" ? vdw(state.gases[0].gas, state.gases[0].n, state.T, state.V) : null;
      // Condensed particles (real gas mode, inside the coexistence curve) gather in a layer on the floor.
      var nLiquid = sim.real ? Math.round(sim.real.liquid * sim.n) : 0;
      for (var q = 0; q < sim.n; q++) sim.liquid[q] = q < nLiquid;
      sim.liquidCount = nLiquid;
      sim.floor = nLiquid ? Math.min(sim.Htarget * 0.9, Math.max(sim.r * 4, nLiquid * Math.PI * sim.r * sim.r / 0.7)) : 0;
      contain();
      resetGauge();
    };
    // With a few hundred dots a random draw has an average kinetic energy a few percent away from (3/2)RT, and with
    // no collisions in ideal mode it would stay off. So each velocity component of each gas is scaled to make its
    // mean square exactly RT/M: the dots' average kinetic energy is then exactly (3/2)RT, and the gauge averages to
    // nRT/V. The speeds keep the Maxwell-Boltzmann shape.
    function normalize(c, T) {
      var want = R_SI * T / kg(GASES[sim.state.gases[c].gas].M), sums = [0, 0, 0], count = 0, i;
      for (i = 0; i < sim.x.length; i++) if (sim.comp[i] === c) {sums[0] += sim.vx[i] * sim.vx[i]; sums[1] += sim.vy[i] * sim.vy[i]; sums[2] += sim.vz[i] * sim.vz[i]; count++;}
      if (!count) return;
      var f = sums.map(function (x) {return x > 0 ? Math.sqrt(want * count / x) : 1;});
      for (i = 0; i < sim.x.length; i++) if (sim.comp[i] === c) {sim.vx[i] *= f[0]; sim.vy[i] *= f[1]; sim.vz[i] *= f[2];}
    }
    // Keep every particle inside after the walls move: a particle past a wall is reflected back (its speed is kept,
    // so the temperature stays the same, as for a container held at constant temperature).
    function contain() {
      var top = sim.H - sim.r, bottom = sim.floor + sim.r, left = sim.r, right = 1 - sim.r;
      for (var i = 0; i < sim.x.length; i++) {
        if (sim.liquid[i]) continue;
        if (sim.y[i] > top || sim.y[i] < bottom) sim.y[i] = bottom + rand() * Math.max(0, top - bottom);
        if (sim.x[i] > right || sim.x[i] < left) sim.x[i] = left + rand() * Math.max(0, right - left);
      }
    }
    // Advance by dt seconds of model time.
    sim.step = function (dt) {
      if (sim.H !== sim.Htarget) {
        var move = dt * 0.8; // the piston moves 0.8 container widths per second
        sim.H = Math.abs(sim.Htarget - sim.H) <= move ? sim.Htarget : sim.H + (sim.Htarget > sim.H ? move : -move);
        contain();
        if (sim.H === sim.Htarget) resetGauge();
      }
      var top = sim.H - sim.r, bottom = sim.floor + sim.r, left = sim.r, right = 1 - sim.r;
      var w = right - left, h = top - bottom, imp = current.impulse;
      var masses = sim.state.gases.map(function (g, c) {return massOf(c);});
      for (var i = 0; i < sim.n; i++) {
        if (sim.liquid[i]) continue;
        var m2 = 2 * masses[sim.comp[i]];
        var x = sim.x[i] + sim.vx[i] * SCALE * dt, y = sim.y[i] + sim.vy[i] * SCALE * dt;
        // Fold the motion back into the box, counting every wall hit (a fast particle can hit more than once).
        while (x < left || x > right) {
          if (x < left) x = 2 * left - x; else x = 2 * right - x;
          sim.vx[i] = -sim.vx[i]; imp[sim.comp[i]] += m2 * Math.abs(sim.vx[i]); current.hits++;
          if (w <= 0) {x = left; break;}
        }
        while (y < bottom || y > top) {
          if (y < bottom) y = 2 * bottom - y; else y = 2 * top - y;
          sim.vy[i] = -sim.vy[i]; imp[sim.comp[i]] += m2 * Math.abs(sim.vy[i]); current.hits++;
          if (h <= 0) {y = bottom; break;}
        }
        sim.x[i] = x; sim.y[i] = y;
      }
      if (sim.r > 0) collide();
      current.t += dt; sim.t += dt;
      if (current.t >= BIN - 1e-9) {
        current.perimeter = 2 * (w + h);
        bins.push(current); if (bins.length > MAXBINS) bins.shift();
        current = {t:0, impulse:[0, 0, 0], hits:0};
      }
    };
    // Hard-disk collisions on a grid (real gas mode only).
    function collide() {
      var size = Math.max(2 * sim.r, 0.02), cols = Math.max(1, Math.floor(1 / size)), grid = {};
      for (var i = 0; i < sim.n; i++) {
        if (sim.liquid[i]) continue;
        var key = Math.floor(sim.x[i] / size) * 100000 + Math.floor(sim.y[i] / size);
        (grid[key] = grid[key] || []).push(i);
      }
      var d2 = 4 * sim.r * sim.r;
      Object.keys(grid).forEach(function (k) {
        var cx = Math.floor(k / 100000), cy = k - cx * 100000, list = grid[k];
        for (var ox = 0; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) {
          if (ox === 0 && oy < 0) continue;
          if (cx + ox > cols) continue;
          var other = ox === 0 && oy === 0 ? list : grid[(cx + ox) * 100000 + cy + oy];
          if (!other) continue;
          for (var a = 0; a < list.length; a++) for (var b = (other === list ? a + 1 : 0); b < other.length; b++) {
            var p = list[a], q = other[b], dx = sim.x[q] - sim.x[p], dy = sim.y[q] - sim.y[p], dd = dx * dx + dy * dy;
            if (dd >= d2 || dd === 0) continue;
            var d = Math.sqrt(dd), nx = dx / d, ny = dy / d;
            var rel = (sim.vx[q] - sim.vx[p]) * nx + (sim.vy[q] - sim.vy[p]) * ny;
            if (rel < 0) {sim.vx[p] += rel * nx; sim.vy[p] += rel * ny; sim.vx[q] -= rel * nx; sim.vy[q] -= rel * ny;}
            var push = (2 * sim.r - d) / 2;
            sim.x[p] -= nx * push; sim.y[p] -= ny * push; sim.x[q] += nx * push; sim.y[q] += ny * push;
          }
        }
      });
    }
    // The measured pressure in atm, averaged over the bins since the last change (at most 10 s): {total, parts, time,
    // hits}, or null before the first quarter second.
    sim.gauge = function () {
      if (!bins.length) return null;
      var t = 0, imp = [0, 0, 0], hits = 0, per = 0;
      bins.forEach(function (b) {t += b.t; hits += b.hits; per += b.perimeter * b.t; for (var c = 0; c < 3; c++) imp[c] += b.impulse[c];});
      per /= t;
      var k = calibration() / 101325;
      var parts = imp.slice(0, sim.state.gases.length).map(function (x) {return x / (t * per) * k;});
      return {total:parts.reduce(function (s, x) {return s + x;}, 0), parts:parts, time:t, hits:hits};
    };
    // Average kinetic energy of the dots, in J/mol, and each gas's mean speed.
    sim.kinetic = function () {
      var e = 0, w = 0, speedSum = [0, 0, 0], count = [0, 0, 0];
      for (var i = 0; i < sim.n; i++) {
        var c = sim.comp[i], v2 = sim.vx[i] * sim.vx[i] + sim.vy[i] * sim.vy[i] + sim.vz[i] * sim.vz[i];
        var share = sim.moles[c] / sim.counts[c];
        e += share * 0.5 * kg(GASES[sim.state.gases[c].gas].M) * v2; w += share;
        speedSum[c] += Math.sqrt(v2); count[c]++;
      }
      return {ke:w ? e / w : 0, mean:speedSum.map(function (s, c) {return count[c] ? s / count[c] : 0;})};
    };
    sim.speeds = function (c) {
      var out = [];
      for (var i = 0; i < sim.n; i++) if (c === undefined || sim.comp[i] === c) out.push(Math.sqrt(sim.vx[i] * sim.vx[i] + sim.vy[i] * sim.vy[i] + sim.vz[i] * sim.vz[i]));
      return out;
    };
    sim.resetGauge = resetGauge;
    sim.calibration = calibration;
    if (options.state) sim.set(options.state);
    return sim;
  }

  // Measure the pressure of a state by running the simulation without drawing it: fresh particles, then model time
  // until the walls have taken at least `hits` hits (default 4000) or 120 s have passed. Ideal states only; in real gas
  // mode the reading is the van der Waals pressure. Returns {P (atm), parts, time, hits}.
  function measure(state, opts) {
    opts = opts || {};
    if (state.mode === "real") {
      var r = vdw(state.gases[0].gas, state.gases[0].n, state.T, state.V);
      return {P:r.P, parts:[r.P], time:0, hits:0, model:true};
    }
    var sim = createSim({rand:opts.rand, state:state});
    var dt = 1 / 120, want = opts.hits || 4000, limit = opts.maxTime || 120;
    var t = 0, hits = 0, imp = [0, 0, 0], per = 0;
    // Run in blocks so the 10 s gauge window never limits the average.
    while (t < limit && hits < want) {
      sim.resetGauge();
      for (var k = 0; k < 30; k++) sim.step(dt); // one quarter-second bin
      var g = sim.gauge();
      var w = g.time;
      for (var c = 0; c < 3; c++) imp[c] += (g.parts[c] || 0) * w;
      t += w; hits += g.hits;
    }
    var parts = imp.slice(0, state.gases.length).map(function (x) {return x / t;});
    return {P:parts.reduce(function (s, x) {return s + x;}, 0), parts:parts, time:t, hits:hits};
  }

  // ---------- Sweeps ----------
  // The states an automatic sweep visits for each graph. Each sweep holds two variables and changes one.
  //   pv, p1v, z: V from the bottom of its range to the top (10 points), T and n held
  //   vt: T 100 to 1000 K at a pressure chosen so V runs from 1 L to 10 L, n held
  //   pt: T 100 to 1000 K, V and n held
  //   vn: n 0.20 to 2.00 mol at a pressure chosen so V runs from 1 L to 10 L, T held
  // A mixture is swept with its mole fractions kept.
  function sweepStates(kind, state) {
    var range = RANGES[state.mode], out = [], s, i;
    var total = totalMoles(state);
    function withTotal(base, nTotal) {
      var b = clone(base);
      b.gases.forEach(function (g) {g.n = total ? g.n / total * nTotal : nTotal / b.gases.length;});
      return b;
    }
    if (kind === "pv" || kind === "p1v" || kind === "z") {
      for (i = 0; i < 10; i++) {
        s = clone(state); s.hold = "T";
        s.V = Math.round((range.V[0] + (range.V[1] - range.V[0]) * i / 9) * 1000) / 1000;
        s.P = pressure(s); out.push(s);
      }
    } else if (kind === "vt" || kind === "pt") {
      var P = idealP(total, 1000, range.V[1]);
      for (i = 0; i < 10; i++) {
        s = clone(state); s.T = 100 * (i + 1);
        if (kind === "vt") {s.hold = "P"; s.P = P; s.V = idealV(total, s.T, P);} else {s.hold = "V"; s.P = pressure(s);}
        out.push(s);
      }
    } else if (kind === "vn") {
      var Pn = idealP(2, state.T, range.V[1]);
      for (i = 0; i < 10; i++) {
        s = withTotal(state, 0.2 * (i + 1)); s.hold = "P"; s.P = Pn; s.V = idealV(totalMoles(s), s.T, Pn);
        out.push(s);
      }
    }
    return out;
  }

  // ---------- Fits ----------
  function linearFit(xs, ys) {
    var n = xs.length, mx = 0, my = 0;
    for (var i = 0; i < n; i++) {mx += xs[i]; my += ys[i];}
    mx /= n; my /= n;
    var sxy = 0, sxx = 0, syy = 0;
    for (var j = 0; j < n; j++) {sxy += (xs[j] - mx) * (ys[j] - my); sxx += (xs[j] - mx) * (xs[j] - mx); syy += (ys[j] - my) * (ys[j] - my);}
    var slope = sxx ? sxy / sxx : 0, intercept = my - slope * mx;
    return {slope:slope, intercept:intercept, r2:syy && sxx ? sxy * sxy / (sxx * syy) : 1};
  }
  // y = k/x fitted by least squares on y; R² against the mean of y.
  function inverseFit(xs, ys) {
    var num = 0, den = 0, my = 0;
    for (var i = 0; i < xs.length; i++) {num += ys[i] / xs[i]; den += 1 / (xs[i] * xs[i]); my += ys[i];}
    var k = num / den, ssr = 0, sst = 0;
    my /= xs.length;
    for (var j = 0; j < xs.length; j++) {ssr += Math.pow(ys[j] - k / xs[j], 2); sst += Math.pow(ys[j] - my, 2);}
    return {k:k, r2:sst ? 1 - ssr / sst : 1};
  }

  var api = {
    R_ATM:R_ATM, R_SI:R_SI, KPA_PER_ATM:KPA_PER_ATM, BAR_PER_ATM:BAR_PER_ATM, ZERO_C:ZERO_C, N_A:N_A,
    DOTS_PER_MOL:DOTS_PER_MOL, SCALE:SCALE, GASES:GASES, GAS_IDS:GAS_IDS, RANGES:RANGES,
    kelvinToCelsius:kelvinToCelsius, celsiusToKelvin:celsiusToKelvin, atmToKpa:atmToKpa, kpaToAtm:kpaToAtm, aAtm:aAtm,
    idealP:idealP, idealV:idealV, idealT:idealT, idealN:idealN,
    vmp:vmp, vavg:vavg, vrms:vrms, keMolar:keMolar, keMolecule:keMolecule, mbPdf:mbPdf, mbCdf:mbCdf, erf:erf,
    seeded:seeded, sampleVelocity:sampleVelocity,
    critical:critical, saturation:saturation, vdw:vdw,
    totalMoles:totalMoles, pressure:pressure, clone:clone, change:change,
    createSim:createSim, measure:measure, sweepStates:sweepStates, linearFit:linearFit, inverseFit:inverseFit
  };
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="gas-lab"]');
    if (root) root.addEventListener("zsa-gl:request-physics", function (event) {event.detail.receive(api);});
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
