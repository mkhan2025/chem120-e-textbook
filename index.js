var curLevel = 1
var timeLeft = 0
var score = 0

// Initiate the canvas
const options = {
    useService: true,
    oneMolecule:true,
    // isMobile: true
}

ChemDoodle.ELEMENT['H'].jmolColor = 'black';
ChemDoodle.ELEMENT['S'].jmolColor = '#B9A130';
const sketcher = new ChemDoodle.SketcherCanvas('sketcher', 600, 400, options);

sketcher.styles.atoms_displayTerminalCarbonLabels_2D = true;
sketcher.styles.atoms_useJMOLColors = true;
sketcher.styles.bonds_clearOverlaps_2D = true;
sketcher.styles.shapes_color = 'c10000';
sketcher.repaint();




// button to check result upon click
const checkButton = document.getElementById("check-result")
checkButton.addEventListener("click", () => {
    // get the molecules structure for debugging
    console.log(getStructure(sketcher))
    console.log(getMolFile(sketcher))
})


const getStructure = (canvas) => {
    const mol = canvas.getMolecule()
    return mol.atoms
} 

const getMolFile = (canvas) => {
    const mol = canvas.getMolecule()
    return ChemDoodle.writeMOL(mol)
}

