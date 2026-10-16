"""Further check of the Lewis Structure and VSEPR Builder data with RDKit and mendeleev (development only).

    pip install rdkit mendeleev
    python3 tests/science/lewis_rdkit.py

Independent of the activity code: it reads lewis-vsepr/data.js through tests/support/load-data.js and checks
1. each element's group, valence electrons and Pauling electronegativity against the mendeleev database;
2. each accepted structure as an RDKit molecule: it sanitizes (valence rules) where RDKit allows the element's
   valence, has no radical electrons, carries the item's total charge, and its outer-shell electron count
   (RDKit's periodic table) minus the charge equals the item's total;
3. for information only, every structure RDKit can embed in 3D (ETKDG, then MMFF or UFF): the angle at the
   central atom and, for neutral molecules, a Gasteiger-charge dipole, compared with the item's angle and polarity.
   Force fields do not model lone pairs or expanded octets well, so these are listed, not failures.
It prints one line per item and a summary, and exits 1 on any disagreement in checks 1 and 2.
"""
import json
import math
import os
import subprocess
import sys

from rdkit import Chem, RDLogger
from rdkit.Chem import AllChem
from mendeleev import element

RDLogger.DisableLog("rdApp.*")
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
dump = subprocess.run(["node", "-e", "console.log(JSON.stringify(require('./tests/support/load-data').loadData('lewis-vsepr/data.js')))"],
                      cwd=ROOT, capture_output=True, text=True, check=True)
data = json.loads(dump.stdout)
pt = Chem.GetPeriodicTable()
problems = []
notes_el = []
geo_disagree = []

# 1. Elements
for symbol, group, period, en in data["elements"]:
    e = element(symbol)
    valence = group if group <= 2 else group - 10
    if e.group_id != group or e.period != period:
        problems.append(f"{symbol}: group/period {group}/{period}, mendeleev {e.group_id}/{e.period}")
    if symbol != "He" and pt.GetNOuterElecs(symbol) != valence:
        problems.append(f"{symbol}: valence {valence}, RDKit {pt.GetNOuterElecs(symbol)}")
    ref = e.electronegativity("pauling")
    if ref is None and en is not None:
        notes_el.append(f"{symbol}: data {en}, no Pauling value in mendeleev")
    elif (ref is None) != (en is None) or (ref is not None and abs(ref - en) > 0.005):
        problems.append(f"{symbol}: electronegativity {en}, mendeleev {ref}")
print(f"elements: {len(data['elements'])} checked against mendeleev" + ("; " + "; ".join(notes_el) if notes_el else ""))

# Angle ranges for each label (degrees), for the mean angle at the center of an embedded structure.
RANGES = {"180°": (170, 181), "120°": (114, 126), "less than 120°": (105, 121), "109.5°": (105, 114), "about 107°": (98, 111),
          "about 104.5°": (90, 110), "90°": (85, 95)}


def formal(valence_e, lone_pairs, bond_order_sum):
    return valence_e - 2 * lone_pairs - bond_order_sum


def build(item, form):
    mol = Chem.RWMol()
    c_lp, outer = form[0], form[1:]
    bsum = sum(p[0] for p in outer)
    center = Chem.Atom(item["center"])
    center.SetFormalCharge(formal(pt.GetNOuterElecs(item["center"]), c_lp, bsum))
    center.SetNoImplicit(True)
    ci = mol.AddAtom(center)
    for sym, (order, lp) in zip(item["outer"], outer):
        a = Chem.Atom(sym)
        a.SetFormalCharge(formal(pt.GetNOuterElecs(sym), lp, order))
        a.SetNoImplicit(True)
        i = mol.AddAtom(a)
        mol.AddBond(ci, i, {1: Chem.BondType.SINGLE, 2: Chem.BondType.DOUBLE, 3: Chem.BondType.TRIPLE}[order])
    return mol.GetMol()


ui_angles = data["ui"]["angles"]
checked_geo = 0
skipped_geo = []
sanitized = 0
partial = []
for item in data["items"]:
    forms = item["forms"] + item.get("apForms", [])
    notes = []
    for form in forms:
        m = build(item, form)
        try:
            Chem.SanitizeMol(m)
            sanitized += 1
        except Exception:
            # Hypervalent halogen centers (Cl, Br) are outside RDKit's valence list; check the rest without it.
            m.UpdatePropertyCache(strict=False)
            Chem.SanitizeMol(m, Chem.SanitizeFlags.SANITIZE_ALL ^ Chem.SanitizeFlags.SANITIZE_PROPERTIES)
            partial.append(item["id"])
        if Chem.GetFormalCharge(m) != item["charge"]:
            problems.append(f"{item['id']}: RDKit charge {Chem.GetFormalCharge(m)}")
        if any(a.GetNumRadicalElectrons() for a in m.GetAtoms()):
            problems.append(f"{item['id']}: radical electrons")
        outer_e = sum(pt.GetNOuterElecs(a.GetSymbol()) for a in m.GetAtoms()) - item["charge"]
        if outer_e != item["total"]:
            problems.append(f"{item['id']}: RDKit valence electrons {outer_e}, data {item['total']}")
    # 3. Geometry and polarity from the first accepted structure.
    if not item.get("domains"):
        print(f"{item['id']:7} structure ok; two atoms, no angle")
        continue
    m = Chem.AddHs(build(item, item["forms"][0]), explicitOnly=True)
    try:
        m.UpdatePropertyCache(strict=False)
        Chem.SanitizeMol(m, Chem.SanitizeFlags.SANITIZE_ALL ^ Chem.SanitizeFlags.SANITIZE_PROPERTIES)
        params = AllChem.ETKDGv3()
        params.randomSeed = 7
        if AllChem.EmbedMolecule(m, params) != 0:
            raise ValueError("embed failed")
        if AllChem.MMFFHasAllMoleculeParams(m):
            AllChem.MMFFOptimizeMolecule(m)
        else:
            AllChem.UFFOptimizeMolecule(m)
    except Exception as e:
        skipped_geo.append(item["id"])
        print(f"{item['id']:7} structure ok; geometry not checked ({e})")
        continue
    conf = m.GetConformer()
    p = [conf.GetAtomPosition(i) for i in range(m.GetNumAtoms())]
    angles = []
    for i in range(1, m.GetNumAtoms()):
        for j in range(i + 1, m.GetNumAtoms()):
            a, b = p[i] - p[0], p[j] - p[0]
            angles.append(math.degrees(math.acos(max(-1, min(1, a.DotProduct(b) / (a.Length() * b.Length()))))))
    label = ui_angles[item["angle"]]
    low, high = RANGES.get(label, (0, 181))
    # A linear center is checked by its largest angle; the others by the mean of the angles between bonds.
    mean = max(angles) if label == "180°" else sum(angles) / len(angles)
    ok_angle = label not in RANGES or low <= mean <= high
    if not ok_angle:
        geo_disagree.append(item["id"])
        notes.append(f"embedded angle outside the range for {label}")
    dip = ""
    if item["polar"] is not None:
        AllChem.ComputeGasteigerCharges(m)
        q = [a.GetDoubleProp("_GasteigerCharge") for a in m.GetAtoms()]
        if all(math.isfinite(x) for x in q):
            mu = [sum(q[i] * p[i][k] for i in range(len(q))) for k in range(3)]
            size = math.sqrt(sum(x * x for x in mu))
            polar = size > 0.02
            dip = f", dipole {size:.3f} e·Å ({'polar' if polar else 'nonpolar'})"
            if polar != item["polar"]:
                geo_disagree.append(item["id"])
                notes.append(f"Gasteiger dipole says {'polar' if polar else 'nonpolar'}")
        else:
            dip = ", no Gasteiger charges"
    checked_geo += 1
    print(f"{item['id']:7} structure ok; center angle {mean:.1f} for {label}{dip}" + ("; NOTE " + "; ".join(notes) if notes else ""))

print(f"\n{len(data['items'])} items, {sanitized} structures fully sanitized, partial sanitize for {sorted(set(partial))}")
print(f"geometry embedded for {checked_geo}; not embedded: {skipped_geo}")
# Force-field geometry and Gasteiger dipoles do not model lone pairs or expanded octets well, so they are reported,
# not counted as failures; the written reference table and the unit tests are the check for shapes.
print(f"embedded angle or dipole disagrees with the data (information only): {sorted(set(geo_disagree))}")
if problems:
    print("\nDISAGREEMENTS:")
    for p in problems:
        print("  " + p)
    sys.exit(1)
print("No disagreements.")
