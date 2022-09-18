from rdkit.Chem.rdmolfiles import MolFromMolFile as rdMol


test = "Molecule from ChemDoodle Web Components\n\nhttp://www.ichemlabs.com\n  2  1  0  0  0  0            999 V2000\n   -0.5000    0"

m = rdMol('test1.mol')
print(m)