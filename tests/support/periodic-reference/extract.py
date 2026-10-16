# Builds the second, independent source the periodic table data is checked against (reference.json). It reads
# two packages that do not depend on mendeleev, as text, without importing their code:
#   periodictable 2.1.0 (public domain): CIAAW standard atomic weights, mass numbers in brackets for elements
#     with no standard atomic weight, and its transcription of the Pyykko 2009 single-bond covalent radii.
#   pymatgen-core 2026.10.2 (MIT): names, Pauling electronegativity, first ionization energy (NIST),
#     ground-state electron configurations and melting points.
#   pip download --no-deps periodictable==2.1.0 pymatgen-core==2026.9.24   (then unzip both wheels)
#   python3 -I tests/support/periodic-reference/extract.py path/to/periodictable path/to/pymatgen
# Standard library only.
import gzip, json, os, re, sys

EV_TO_KJ_PER_MOL = 96.48533212

def block(src, name):
    m = re.search(name + r' = """\\\n(.*?)"""', src, re.S)
    return m.group(1).replace("\\\n", "\n")

def main(pt_dir, pmg_dir):
    mass_src = open(os.path.join(pt_dir, "mass.py"), encoding="iso-8859-15").read()
    weights = {}
    for line in block(mass_src, "element_mass").splitlines():
        parts = line.split("\t")
        if len(parts) >= 4 and parts[0].strip().isdigit():
            weights[int(parts[0])] = float(re.match(r"\s*([\d.]+)", parts[3]).group(1))
    brackets = {}
    for m in re.finditer(r"^(\d+)-\w+-\d+,[^\n]*,\[(\d+)\]$", mass_src, re.M):
        brackets[int(m.group(1))] = int(m.group(2))
    radius_src = open(os.path.join(pt_dir, "covalent_radius.py"), encoding="latin-1").read()
    pyykko = {}
    for line in block(radius_src, "CorderoPyykko").splitlines():
        cols = line.split()
        if len(cols) >= 4 and cols[0].isdigit() and cols[3] != "-":
            pyykko[int(cols[0])] = round(float(cols[3]) * 100)
    pmg = json.load(gzip.open(os.path.join(pmg_dir, "core", "periodic_table.json.gz")))
    out = []
    for symbol, e in pmg.items():
        if symbol in ("_unit", "D", "T"):
            continue
        z = e["Atomic no"]
        conf = (e.get("Electronic structure") or {}).get("0")
        ies = e.get("Ionization energies") or []
        out.append({
            "z": z, "symbol": symbol, "name": e["Name"],
            "standardWeight": weights.get(z), "massNumber": brackets.get(z),
            "radiusPyykko": pyykko.get(z), "enPauling": e.get("X"),
            "ie1kJ": round(ies[0] * EV_TO_KJ_PER_MOL, 1) if ies and ies[0] else None,
            "config": conf.replace(".", " ") if conf else None, "meltingPointK": e.get("Melting point")
        })
    out.sort(key=lambda e: e["z"])
    target = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reference.json")
    with open(target, "w", encoding="utf-8") as f:
        f.write("[\n" + ",\n".join(json.dumps(e, ensure_ascii=False) for e in out) + "\n]\n")
    print("wrote", len(out), "elements to", target)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
