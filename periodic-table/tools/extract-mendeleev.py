# Copies the values the periodic table uses out of the mendeleev package's SQLite database into a small JSON
# snapshot (sources/mendeleev-1.3.0.json), so the build needs no Python and no network.
#   pip download --no-deps mendeleev==1.3.0 && unzip mendeleev-1.3.0-py3-none-any.whl
#   python3 -I periodic-table/tools/extract-mendeleev.py path/to/mendeleev/elements.db
# mendeleev is MIT licensed (see sources/LICENSE-mendeleev.txt). Standard library only.
import json, os, sqlite3, sys

EV_TO_KJ_PER_MOL = 96.48533212  # CODATA: 1 eV per particle = 96.485 kJ/mol

def main(db_path):
    con = sqlite3.connect(db_path)
    ie = {z: v for z, v in con.execute("select atomic_number, ionization_energy from ionizationenergies where ion_charge = 0")}
    phases = {}
    for z, mp, bp in con.execute("select atomic_number, melting_point, boiling_point from phasetransitions order by id"):
        # Where several allotropes are listed, keep the highest melting point: gray tin's 286 K entry is its change
        # to white tin, not melting.
        if z not in phases or (mp or 0) > (phases[z][0] or 0):
            phases[z] = (mp, bp)
    out = []
    rows = con.execute("select atomic_number, symbol, name, atomic_weight, group_id, period, block, electronic_configuration, "
                       "en_pauling, covalent_radius_pyykko from elements order by atomic_number")
    for z, symbol, name, weight, group, period, block, econf, en, radius in rows:
        mp, bp = phases.get(z, (None, None))
        out.append({
            "z": z, "symbol": symbol, "name": name, "atomicWeight": weight, "group": group, "period": period, "block": block,
            "econf": econf, "enPauling": en, "covalentRadiusPyykko": None if radius is None else round(radius, 1),
            "ie1kJ": None if ie.get(z) is None else round(ie[z] * EV_TO_KJ_PER_MOL, 1),
            "meltingPointK": None if mp is None else round(mp, 2), "boilingPointK": None if bp is None else round(bp, 2)
        })
    target = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sources", "mendeleev-1.3.0.json")
    with open(target, "w", encoding="utf-8") as f:
        f.write("[\n" + ",\n".join(json.dumps(e, ensure_ascii=False) for e in out) + "\n]\n")
    print("wrote", len(out), "elements to", target)

if __name__ == "__main__":
    main(sys.argv[1])
