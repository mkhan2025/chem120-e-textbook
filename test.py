from rdkit.Chem.rdmolfiles import MolFromMolFile, MolToSmiles


m1 = MolFromMolFile('test1.mol')
m2 = MolFromMolFile('test2.mol')

smileStr1 = MolToSmiles(m1)
smileStr2 = MolToSmiles(m2)

print(smileStr1, smileStr2, smileStr1==smileStr2)