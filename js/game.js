import levels from "./levels.js";

// localStorage
const curLvlKey = "__curLvl";
const curScoreKey = "__curScore";
const highestScoreKey = "__highestScore";

const getLocalStorage = (key) => {
	const raw = localStorage.getItem(curLvlKey);
	return raw ? parseInt(raw, 10) : 0;
};

// Symbols
const MENU_MAIN = Symbol("MENU_MAIN");
const MENU_PAUSE = Symbol("MENU_PAUSE");
const MENU_OVER = Symbol("MENU_OVER");
const MENU_NEXT = Symbol("MENU_NEXT");
const IN_GAME = Symbol("IN_GAME");
const TUTORIAL = Symbol("TUTORIAL")
var status = MENU_MAIN;

// game-wise constants and variables
const bonusRate = 10;
const dupDeduct = 5;
const incorrectDeduct = 10;

var level = getLocalStorage(curLvlKey);
var totalScore = getLocalStorage(curScoreKey);

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

const $ = (selector) => document.querySelector(selector);
const eventHandler = (node, event, handler) => {
	node.addEventListener(event, handler);
};

const setUpCanvas = () => {
	// Initiate the canvas
	const options = {
		useService: true,
		oneMolecule: true,
		// isMobile: true,
	};

	// Set up the ChemDoodle SketcherCanvas component
	ChemDoodle.ELEMENT["H"].jmolColor = "black";
	ChemDoodle.ELEMENT["S"].jmolColor = "#B9A130";
	const sketcher = new ChemDoodle.SketcherCanvas(
		"sketcher",
		600,
		400,
		options
	);

	sketcher.styles.atoms_displayTerminalCarbonLabels_2D = true;
	sketcher.styles.atoms_useJMOLColors = true;
	sketcher.styles.bonds_clearOverlaps_2D = true;
	sketcher.styles.shapes_color = "c10000";
	sketcher.repaint();
};
setUpCanvas();

// console.log(ChemDoodle.uis.gui.desktop.ToolbarManager(sketcher))

const clearCanvasButton = $("#clear-canvas");
eventHandler(clearCanvasButton, "click", () => {
	ChemDoodle.uis.actions.ClearAction(sketcher);
});

/**
 * Change the level information shown to the players.
 */
const setNewLevel = () => {
	$(".level").textContent = `Level ${level + 1}: ${levels[level].name}`;

	$(".level-score").textContent = `Level Score: ${levelScore + totalScore}`;
	$(".timer").textContent = "0:00:00";
	timeCounter = 0;

	const molLs = $("#duplicates");
	molLs.innerHTML = "";
};
setNewLevel();

const resetLevel = () => {
	timeCounter = 0;
	correctAns.length = 0;
	levelScore = 0;
};

const resetGame = () => {
	level = 0;
	totalScore = 0;
	resetLevel();
};

// const startTimeButton = document.getElementById("start-time");
// TODO: Change this into the start-game resume-game button
// startTimeButton.addEventListener("click", playTimer)
var counter;
const playTimer = () => {
	function pad(value) {
		return value > 9 ? value : "0" + value;
	}
	counter = setInterval(() => {
		const seconds = pad(++timeCounter % 60);
		$(".timer").innerText = `0:${pad(
			parseInt(timeCounter / 60, 10)
		)}:${seconds}`;
	}, 1000);
};

const pauseBtn = $(".pause-btn");
eventHandler(pauseBtn, "click", () => {
	clearInterval(counter);
	// TODO: add set state to menu--pause or activate menu--pause
});

const setViewCanvas = (viewCanvas, molBlock, transform = false) => {
	if (transform) {
		viewCanvas.styles.set3DRepresentation("Ball and Stick");
		viewCanvas.styles.backgroundColor = "black";
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
	let mol = ChemDoodle.readMOL(molBlock, transform ? 1.5 : null);
	viewCanvas.loadMolecule(mol);
};

const displayCorrectAns = (molBlock) => {
	molLs = document.getElementById("duplicates");
	const span = document.createElement("span");
	const canvas2d = document.createElement("canvas");
	const canvas3d = document.createElement("canvas");
	span.appendChild(canvas2d);
	span.appendChild(canvas3d);
	molLs.appendChild(span);

	const canvas2dId = `canvas${correctAns.length}0`;
	canvas2d.setAttribute("id", canvas2dId);
	const viewCanvas2d = new ChemDoodle.ViewerCanvas(canvas2dId, 200, 200);
	setViewCanvas(viewCanvas2d, molBlock);

	const canvas3dId = `canvas${correctAns.length}1`;
	canvas3d.setAttribute("id", canvas3dId);
	const viewCanvas3d = new ChemDoodle.TransformCanvas3D(canvas3dId, 200, 200);
	setViewCanvas(viewCanvas3d, molBlock, true);
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
checkOneMolButton.addEventListener("click", async () => {
	let correct = false;
	let notDup = false;
	const molBlock = getMolBlockStr(sketcher);

	await postData(endPoint + "/game_input", {
		molBlock: molBlock,
		level: level,
		correctAns: correctAns,
	})
		.then(async (data) => {
			console.log(data);

			await getData(endPoint + "/single_result").then((response) => {
				correct = response["correct"];
				notDup = response["notDup"];
				correctAns = response["correctAns"];

				console.log(response);

				if (correct && notDup) {
					levelScore += levels[level].molScore;
					$("#level-score").innerText = `Level Score: ${
						levelScore + totalScore
					}`;
					displayCorrectAns(data["molBlock"]);
					alert(correctMessage);
				} else if (!notDup) {
					levelScore -= dupDeduct;
					alert(dupMessage);
				} else {
					levelScore -= incorrectDeduct;
					alert(wrongMessage);
				}
			});
		})
		.catch((e) => {
			console.log(e);
		});
});

/**
 *
 * @param {ChemDoodle.SketcherCanvas} canvas
 * @returns {string}
 */
const getMolBlockStr = (canvas) => {
	return ChemDoodle.writeMOL(canvas.getMolecule());
};

// button to check the result of the whole level
const checkLevelButton = $("#check-level");
checkLevelButton.addEventListener("click", () => {
	postData(endPoint + "/game_input", {
		molBlock: "",
		level: level,
		correctAns: correctAns,
	})
		.then((data) => {
			console.log(data);

			getData(endPoint + "/level_result").then((response) => {
				let foundAll = response["foundAll"];

				console.log(response);

				if (foundAll) {
					clearInterval(counter);
					console.log(timeCounter);
					// assuming that for every 10 seconds early, add 5 points
					let timeEarly = levels[level].maxTime - timeCounter;
					levelScore +=
						timeEarly > 0 ? (timeEarly % 10) * bonusRate : 0;
					totalScore += levelScore;
					ChemDoodle.uis.actions.ClearAction(sketcher);

					if (level == 7) {
						alert(gameClear);
						setNewLevel();
						resetGame();
						prevHighest = getLocalStorage(highestScoreKey);
						localStorage.clear();
						localStorage.setItem(
							highestScoreKey,
							prevHighest && prevHighest >= totalScore
								? prevHighest
								: totalScore
						);
					} else {
						alert(levelClear());
						level++;
						resetLevel();
						setNewLevel();
						localStorage.setItem(curLvlKey, level);
						localStorage.setItem(curScoreKey, totalScore);
					}
				} else alert(levelIncomplete);
			});
		})
		.catch((e) => {
			console.log(e);
		});
});



/*/////////////////////
//       MENUS       //
/////////////////////*/

const restartGame = () => {
	playTimer();
	resetGame();
	setNewLevel();
	$(".game").classList.add("active")
	$(".menu--main").classList.remove("active")
	setUpCanvas();
};

const getTutorial = () => {
	status = TUTORIAL
};

const contGame = () => {
	playTimer();
	// TODO: remove all menu and reveal the game
};

const showMainMenu = () => {
	// TODO: set game to inactive and reveal the main menu
};

// menu--main
function setUpMainMenu() {
	const updateHighScore = () => {
		const highScoreNode = $(".high-score");
		highScoreNode.textContent = `Record: ${getLocalStorage(
			highestScoreKey
		)}`;
	};
	updateHighScore();

	const playGameBtn = $(".start-btn");
	eventHandler(playGameBtn, "click", restartGame);

	// TODO: show the continue-btn only when level in localStorage is not 0
	const contGameBtn = $(".continue-btn");
	eventHandler(contGameBtn, "click", contGame);

	const instrBtnMain = $(".instr-btn--main");
	eventHandler(instrBtnMain, "click", getTutorial);
};


// menu--pause
function getPauseMenu() {
	const resumeBtn = $(".resume-btn");
	eventHandler(resumeBtn, "click", contGame);

	const restartBtnPause = $(".restart-btn--pause");
	eventHandler(restartBtnPause, "click", resetGame);

	const instrBtnPause = $(".instr-btn--pause");
	eventHandler(instrBtnPause, "click", getTutorial);

	const mainMenuBtn = $(".menu-btn--pause");
	eventHandler(mainMenuBtn, "click", showMainMenu);
}

// menu--over
function getOverMenu() {
	$(".current-score--over").textContent = `This game: ${getLocalStorage(
		curScoreKey
	)}`;
	$(".highest-score--over").textContent = `Record: ${getLocalStorage(
		highestScoreKey
	)}`;

	const playAgainBtn = $(".play-again-btn");
	eventHandler(playAgainBtn, "click", contGame);

	const mainMenuBtn = $(".menu-btn--over");
	eventHandler(mainMenuBtn, "click", showMainMenu);
}

// menu--next
function getNextMenu() {
	$(".current-score--next").textContent = `This game: ${getLocalStorage(
		curScoreKey
	)}`;
	$(".highest-score--next").textContent = `Record: ${getLocalStorage(
		highestScoreKey
	)}`;

	const nextLvlBtn = $(".next-btn");
	eventHandler(nextLvlBtn, "click", contGame);

	const restartBtnNext = $(".restart-btn--next");
	eventHandler(restartBtnNext, "click", resetGame);

	const mainMenuBtn = $(".menu-btn--pause");
	eventHandler(mainMenuBtn, "click", showMainMenu);
}

(function renderMenus() {
	const menuContainerNode = $(".menus");
	const menuMainNode = $(".menu--main");
	const menuPauseNode = $(".menu--pause");
	const menuOverNode = $(".menu--over");
	const menuNextNode = $(".menu--next");
	const gameNode = $(".game");
	const tutorialNode = $(".tutorial")

	function showNode(node) {
		node.classList.add("active");
	}

	function hideNode(node) {
		node.classList.remove("active");
	}

	// hideNode(menuMainNode);
	// hideNode(menuPauseNode);
	// hideNode(menuOverNode);
	// hideNode(menuNextNode);
	
	switch (status) {
		case MENU_MAIN:
			showNode(menuMainNode);
			hideNode(gameNode)
			hideNode(tutorialNode)
			setUpMainMenu();
			break;
		case MENU_PAUSE:
			showNode(menuPauseNode);
			hideNode(gameNode)
			hideNode(tutorialNode)
			getPauseMenu();
			break;
		case MENU_OVER:
			showNode(menuOverNode);
			hideNode(gameNode)
			hideNode(tutorialNode)
			getOverMenu();
			break;
		case MENU_NEXT:
			showNode(menuNextNode);
			hideNode(gameNode)
			hideNode(tutorialNode)
			getNextMenu();
			break;
		case TUTORIAL:
			hideNode(menuContainerNode);
			hideNode(gameNode)
			showNode(tutorialNode)
			break;
		case IN_GAME:
			hideNode(menuContainerNode)
			hideNode(tutorialNode)
			showNode(gameNode)
			break;
	}
})();
