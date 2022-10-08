// const levels = import("./levels.js")
const levels = [
	{ name: "C2H60", maxTime: 0.0, molScore: 100 },
	{ name: "C3H8O", maxTime: 0.0, molScore: 100 },
	{ name: "C4H9Cl", maxTime: 0.0, molScore: 100 },
	{ name: "C4H10O", maxTime: 0.0, molScore: 60 },
	{ name: "C4H8", maxTime: 0.0, molScore: 150 },
	{ name: "C4H7Cl", maxTime: 0.0, molScore: 70 },
	{ name: "C5H10", maxTime: 0.0, molScore: 100 },
	{
		name: "C5H10O, containing a carbonyl group",
		maxTime: 0.0,
		molScore: 100,
	},
];

// game-wise variables
const bonusRate = 10;
const dupDeduct = 5;
const incorrectDeduct = 10;
var level = parseInt(localStorage.getItem("curLevel")) || 0;
var totalScore = parseInt(localStorage.getItem("curScore")) || 0;

//level-wise variables
var timeCounter = 0;
var correctAns = [];
var levelScore = 0;

// const  endPoint = "http://127.0.0.1:33507"
const endPoint = "https://chem120-game.up.railway.app/";
const correctMessage = "Correct answer";
const wrongMessage = "Incorrect answer";
const dupMessage = "Duplicated answer";
const levelIncomplete = "You haven't found all isomers. Keep going!";
const gameClear = "You cleared all level. Restart?";
const levelClear = () => `You cleared level ${level + 1}. Good job!`;

// Initiate the canvas
const options = {
	useService: true,
	oneMolecule: true,
	// isMobile: true
};

// Set up the ChemDoodle SketcherCanvas component
ChemDoodle.ELEMENT["H"].jmolColor = "black";
ChemDoodle.ELEMENT["S"].jmolColor = "#B9A130";
const sketcher = new ChemDoodle.SketcherCanvas("sketcher", 600, 400, options);

sketcher.styles.atoms_displayTerminalCarbonLabels_2D = true;
sketcher.styles.atoms_useJMOLColors = true;
sketcher.styles.bonds_clearOverlaps_2D = true;
sketcher.styles.shapes_color = "c10000";
sketcher.repaint();

/**
 * Change the level information shown to the players.
 */
const levelChange = () => {
	document.getElementById("level-header").textContent = `Current level: ${
		level + 1
	}`;
	document.getElementById(
		"level-content"
	).textContent = `Draw all the isomers of ${levels[level].name}`;

	document.getElementById("timer-display").textContent = "0:00:00";
	timeCounter = 0;

	const molLs = document.getElementById("duplicates");
	molLs.innerHTML = "";
};

const resetLevel = () => {
	timeLeft = 0;
	correctAns.length = 0;
	levelScore = 0;
};

const resetGame = () => {
	level = 0;
	totalScore = 0;
	resetLevel();
};

const startTimeButton = document.getElementById("start-time");
var counter;
startTimeButton.addEventListener("click", () => {
	function pad(value) {
		return value > 9 ? value : "0" + value;
	}
	counter = setInterval(() => {
		seconds = pad(++timeCounter % 60);
		document.getElementById("timer-display").textContent = `0:${pad(
			parseInt(timeCounter / 60, 10)
		)}:${seconds}`;
	}, 1000);
});

const setViewCanvas = (viewCanvas, molBlock, transform=false) => {
    if (transform) {
        viewCanvas.styles.set3DRepresentation('Ball and Stick');
        viewCanvas.styles.backgroundColor = 'black';
    } else {
        viewCanvas.styles.bonds_width_2D = 0.6;
        viewCanvas.styles.bonds_saturationWidthAbs_2D = 2.6;
        viewCanvas.styles.bonds_hashSpacing_2D = 2.5;
        viewCanvas.styles.atoms_font_size_2D = 10;
        viewCanvas.styles.atoms_font_families_2D = [
            "Helvetica",
            "Arial",
            "sans-serif",
        ];
        viewCanvas.styles.atoms_displayTerminalCarbonLabels_2D = true;
        // viewCanvas.styles.backgroundColor = 'grey';
    }
	let mol = ChemDoodle.readMOL(molBlock, transform?1.5:null);
	viewCanvas.loadMolecule(mol);
};

const displayCorrectAns = (molBlock) => {
	molLs = document.getElementById("duplicates");
	const span = document.createElement("span");
	const canvas2d = document.createElement("canvas");
    const canvas3d = document.createElement('canvas')
	span.appendChild(canvas2d);
    span.appendChild(canvas3d)
	molLs.appendChild(span);

	const canvas2dId = `canvas${correctAns.length}0`;
	canvas2d.setAttribute("id", canvas2dId);
	const viewCanvas2d = new ChemDoodle.ViewerCanvas(canvas2dId, 200, 200);
	setViewCanvas(viewCanvas2d, molBlock);

    const canvas3dId = `canvas${correctAns.length}1`;
    canvas3d.setAttribute('id', canvas3dId)
    const viewCanvas3d = new ChemDoodle.TransformCanvas3D(canvas3dId, 200, 200)
    setViewCanvas(viewCanvas3d, molBlock, true)
};

// functions to communicate with the backend code
async function postData(url = "", data = {}) {
	await fetch(url, {
		method: "POST",
		mode: "cors",
		cache: "no-cache",
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
		},
		referrerPolicy: "no-referrer",
		body: JSON.stringify(data),
	});

	return data;
}

async function getData(url = "") {
	const response = await fetch(url, {
		method: "GET",
		mode: "cors",
		cache: "no-cache",
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
		},
		referrerPolicy: "no-referrer",
	});

	return response.json();
}

// button to check result upon click
const checkOneMolButton = document.getElementById("check-single");
checkOneMolButton.addEventListener("click", () => {
	let correct = false;
	let notDup = false;
	const molBlock = getMolBlockStr(sketcher);

	postData(
		(url = endPoint + "/game_input"),
		(data = {
			molBlock: molBlock,
			level: level,
			correctAns: correctAns,
		})
	)
		.then((data) => {
			console.log(data);

			getData((url = endPoint + "/single_result")).then((response) => {
				correct = response["correct"];
				notDup = response["notDup"];
				correctAns = response["correctAns"];

				console.log(response);

				if (correct && notDup) {
					levelScore += levels[level].molScore;
					document.getElementById(
						"level-score"
					).textContent = `Level Score: ${levelScore}`;
					displayCorrectAns(data["molBlock"]);
					alert(correctMessage);
				} else if (!notDup) alert(dupMessage);
				else alert(wrongMessage);
			});
		})
		.catch((e) => {
			console.log(e);
		});
});

/**
 *
 * @param {ChemDoodle.SketcherCanvas} canvas
 * @returns {array}
 */
const getStructure = (canvas) => {
	return canvas.getMolecule().atoms;
};

/**
 *
 * @param {ChemDoodle.SketcherCanvas} canvas
 * @returns {string}
 */
const getMolBlockStr = (canvas) => {
	return ChemDoodle.writeMOL(canvas.getMolecule());
};

// button to check the result of the whole level
const checkLevelButton = document.getElementById("check-level");
checkLevelButton.addEventListener("click", () => {
	postData(
		(url = endPoint + "/game_input"),
		(data = {
			molBlock: "",
			level: level,
			correctAns: correctAns,
		})
	)
		.then((data) => {
			console.log(data);

			getData((url = endPoint + "/level_result")).then((response) => {
				foundAll = response["foundAll"];

				console.log(response);

				if (foundAll) {
					clearInterval(counter);
					console.log(timeCounter);
					// assuming that for every 10 seconds early, add 5 points
					levelScore += (timeCounter % 10) * bonusRate;
					totalScore += levelScore;
					document.getElementById(
						"total-score"
					).textContent = `Total Score: ${totalScore}`;

					if (level == 7) {
						alert(gameClear);
						levelChange();
						resetGame();
						prevHighest = localStorage.getItem("highestScore");
                        localStorage.clear()
						localStorage.setItem(
							"highestScore",
							(prevHighest && prevHighest >= totalScore) ? prevHighest : totalScore
						);
					} else {
						alert(levelClear());
						level++;
						resetLevel();
						levelChange();
						localStorage.setItem("curLevel", level + 1);
						localStorage.setItem("curScore", totalScore);
					}
				} else alert(levelIncomplete);
			});
		})
		.catch((e) => {
			console.log(e);
		});
});
