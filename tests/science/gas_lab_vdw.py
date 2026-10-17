"""Independent van der Waals numbers for the Gas Laws and KMT Lab tests (Python standard library only).

Written separately from gas-lab/physics.js with a different method: single-phase pressures straight from
P = nRT/(V - nb) - a n^2/V^2, and liquid-vapor coexistence from equal pressure and equal chemical potential solved
with Newton's method (physics.js uses Maxwell's equal-area rule with bisection). The output is pasted into
tests/unit/gas-lab.test.js. Run: python3 tests/science/gas_lab_vdw.py
"""
import math

R = 0.08206          # L atm / (mol K)
BAR_PER_ATM = 1.01325
# CRC Handbook values (bar L^2/mol^2, L/mol), as in gas-lab/README.md
GASES = {"He": (0.0346, 0.0238), "Ne": (0.2135, 0.01709), "Ar": (1.355, 0.03201), "Kr": (2.349, 0.03978),
         "Xe": (4.250, 0.05105), "N2": (1.370, 0.0387), "O2": (1.382, 0.03186), "CO2": (3.640, 0.04267)}

def z_single(gas, n, T, V):
    a, b = GASES[gas]
    a /= BAR_PER_ATM
    P = n * R * T / (V - n * b) - a * n * n / (V * V)
    return P, P * V / (n * R * T)

# Reduced vdW fluid: p = 8t/(3v-1) - 3/v^2. Chemical potential (up to a function of t):
# mu(v) = -(8t/3) ln(3v - 1) + (8t/3) / (3v - 1) - 6/v    [from mu = f + p v, f = -(8t/3) ln(3v-1) - 3/v]
def p_red(v, t): return 8 * t / (3 * v - 1) - 3 / (v * v)
def mu_red(v, t): return -(8 * t / 3) * math.log(3 * v - 1) + (8 * t / 3) / (3 * v - 1) - 6 / v

def spinodals(t):
    # dp/dv = 0  <=>  4 t v^3 = (3v - 1)^2 ; roots v1 in (1/3, 1) and v2 > 1 for t < 1, found by bisection
    g = lambda v: 4 * t * v ** 3 - (3 * v - 1) ** 2
    def root(lo, hi):
        for _ in range(200):
            mid = (lo + hi) / 2
            if (g(mid) > 0) == (g(lo) > 0): lo = mid
            else: hi = mid
        return (lo + hi) / 2
    hi = 2.0
    while g(hi) < 0: hi *= 2
    return root(1.0 / 3 + 1e-12, 1.0), root(1.0, hi)

def coexist(t):
    # Newton's method on (ln vl, ln vg) for p(vl) = p(vg) and mu(vl) = mu(vg), keeping vl on the liquid branch
    # (below the first spinodal) and vg on the vapor branch (above the second).
    s1, s2 = spinodals(t)
    vl, vg = (1.0 / 3 + s1) / 2, s2 * 3
    for _ in range(500):
        f1 = p_red(vl, t) - p_red(vg, t)
        f2 = mu_red(vl, t) - mu_red(vg, t)
        # analytic derivatives: dp/dv = -24t/(3v-1)^2 + 6/v^3 ; dmu/dv = v dp/dv (Gibbs-Duhem at constant t)
        dpl = -24 * t / (3 * vl - 1) ** 2 + 6 / vl ** 3
        dpg = -24 * t / (3 * vg - 1) ** 2 + 6 / vg ** 3
        j11, j12, j21, j22 = dpl, -dpg, vl * dpl, -vg * dpg
        det = j11 * j22 - j12 * j21
        dl = (f1 * j22 - f2 * j12) / det
        dg = (j11 * f2 - j21 * f1) / det
        step = 1.0
        while True:
            nl, ng = vl - step * dl, vg - step * dg
            if 1.0 / 3 < nl < s1 and ng > s2:
                break
            step /= 2
        vl, vg = nl, ng
        if abs(dl) < 1e-15 * vl and abs(dg) < 1e-15 * vg:
            break
    return p_red(vg, t), vl, vg

if __name__ == "__main__":
    print("// single phase: [gas, n, T, V, P (atm), Z]")
    for gas, n, T, V in [("CO2", 1, 300, 1), ("CO2", 2, 500, 0.25), ("N2", 2, 1000, 0.25), ("N2", 1, 300, 1),
                         ("He", 2, 300, 0.25), ("Xe", 1, 400, 0.5), ("Ar", 2, 200, 1), ("O2", 1.5, 300, 0.5),
                         ("Kr", 1, 600, 0.3), ("Ne", 2, 100, 0.5), ("CO2", 0.5, 1000, 2.5), ("Xe", 2, 1000, 0.25)]:
        P, Z = z_single(gas, n, T, V)
        print('  ["%s", %s, %s, %s, %.6f, %.6f],' % (gas, n, T, V, P, Z))
    print("// coexistence: [Tr, Pr_sat, Vr_liquid, Vr_vapor]")
    for t in [0.95, 0.9, 0.85, 0.8, 0.7, 0.6, 0.5]:
        p, vl, vg = coexist(t)
        print("  [%s, %.6g, %.6g, %.6g]," % (t, p, vl, vg))
