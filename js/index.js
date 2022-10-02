const levels = import("js/levels.js")



// game-wise variables
var level = 0
var totalScore = 0

//level-wise variables
var timeCounter = 0
var correctAns = []
var levelScore = 0


// const  endPoint = "http://127.0.0.1:33507"
// const endPoint = "https://chem120.herokuapp.com"
const endPoint = "https://chem120-game.up.railway.app/"
const correctMessage = "Correct answer"
const wrongMessage = "Incorrect answer"
const dupMessage = "Duplicated answer"
const levelIncomplete = "You haven't found all isomers. Keep going!"
const gameClear = "You cleared all level. Restart?"
const levelClear = () => `You cleared level ${level+1}. Good job!`


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


/**
 * Change the level information shown to the players.
 */
const levelChange = () => {
    document.getElementById("level-header").textContent = `Current level: ${level+1}`
    document.getElementById('level-content').textContent = `Draw all the isomers of ${levels[level].name}`
}


const resetLevel = () => {
    timeLeft = 0
    correctAns.length = 0
    levelScore = 0
}

const resetGame = () => {
    level = 0
    totalScore = 0
    resetLevel()
};


// functions to communicate with the backend code
async function postData(url = "", data = {}) {
    await fetch(url, {
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
    
            if (correct && notDup) {
                alert(correctMessage)
            }
            else if (!notDup) alert(dupMessage)
            else alert(wrongMessage)
        })

    }).catch((e) => { console.log(e) });
});

/**
 * 
 * @param {ChemDoodle.SketcherCanvas} canvas 
 * @returns {array}
 */
const getStructure = (canvas) => {
    return canvas.getMolecule().atoms
} 

/**
 * 
 * @param {ChemDoodle.SketcherCanvas} canvas
 * @returns {string}
 */
const getMolBlockStr = (canvas) => {
    return ChemDoodle.writeMOL(canvas.getMolecule())
}

// button to check the result of the whole level
const checkLevelButton = document.getElementById('check-level')
checkLevelButton.addEventListener("click", () => {
    postData(
        url=endPoint+"/game_input", 
        data={
            'molBlock' : "",
            'level' : level,
            'correctAns' : correctAns
        }
    ).then((data) => {
        console.log(data)

        getData(
            url=endPoint+"/level_result"
        ).then((response) => {
            foundAll = response['foundAll']
    
            console.log(response)
    
            if (foundAll) {
                if (level == 7) {
                    alert(gameClear)
                    levelChange()
                    resetGame()
                } else {
                    alert(levelClear())
                    level++
                    resetLevel()
                    levelChange()
                }
            } else alert(levelIncomplete)
        })

    }).catch((e) => { console.log(e) });
});


const startTimeButton = document.getElementById('start-time')
var counter
startTimeButton.addEventListener('click', () => {
    function pad ( value ) { return value > 9 ? value : "0" + value; }
    counter = setInterval( () => {
        seconds = pad(++timeCounter%60)
        document.getElementById("timer-display").textContent = `0:${pad(parseInt(timeCounter/60,10))}:${seconds}`
    }, 1000);
})

const stopTimeButton = document.getElementById('stop-time')
stopTimeButton.addEventListener("click", () => {
    clearInterval(counter)
    console.log(timeCounter)
    // TODO: extract the time counted to calculate bonus scores
})