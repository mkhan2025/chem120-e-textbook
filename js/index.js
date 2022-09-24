var level = 0
var correctAns = []
var timeLeft = 0
var score = 0

const endPoint = "https://chem120.herokuapp.com"
const correctMessage = "Correct answer"
const wrongMessage = "Incorrect or duplicated answer"

// Initiate the canvas
const options = {
    useService: true,
    oneMolecule:true,
    // isMobile: true
}

// Set up the ChemDoodle SketcherCanvas component
ChemDoodle.ELEMENT['H'].jmolColor = 'black';
ChemDoodle.ELEMENT['S'].jmolColor = '#B9A130';
const sketcher = new ChemDoodle.SketcherCanvas('sketcher', 600, 400, options);

sketcher.styles.atoms_displayTerminalCarbonLabels_2D = true;
sketcher.styles.atoms_useJMOLColors = true;
sketcher.styles.bonds_clearOverlaps_2D = true;
sketcher.styles.shapes_color = 'c10000';
sketcher.repaint();

// functions to communicate with the backend code
async function postData(url = "", data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer', 
        body: JSON.stringify(data)
    });

    return data
};


async function getData(url = "") {
    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer'
    });

    return response.json();
};


// button to check result upon click
const checkOneMolButton = document.getElementById("check-single");
checkOneMolButton.addEventListener("click", () => {
    let correct = false;
    let notDup = false;
    const molBlock = getMolBlockStr(sketcher);

    postData(
        url=endPoint+"/game_input", 
        data={
            'molBlock' : molBlock,
            'level' : level,
            'correctAns' : correctAns
        }
    ).then((data) => {
        console.log(data)

        getData(
            url=endPoint+"/single_result"
        ).then((response) => {
            correct = response['correct']
            notDup = response['notDup']
            correctAns = response['correctAns']
    
            console.log(response)
    
            // TODO: Handle the correct/incorrect message
            if (correct && notDup) alert(correctMessage)
            else alert(wrongMessage)
        })

    }).catch((e) => {
        console.log(e)
    });

    
});

/**
 * 
 * @param {ChemDoodle.SketcherCanvas} canvas 
 * @returns {array}
 */
const getStructure = (canvas) => {
    const mol = canvas.getMolecule()
    return mol.atoms
} 

/**
 * 
 * @param {ChemDoodle.SketcherCanvas} canvas
 * @returns {string}
 */
const getMolBlockStr = (canvas) => {
    const mol = canvas.getMolecule()
    return ChemDoodle.writeMOL(mol)
}

// button to check the result of the whole level
const checkLevelButton = document.getElementById('check-level')
checkLevelButton.addEventListener("click", () => {
    console.log('test')
})

