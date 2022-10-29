// globalConfig.js
// ============================================================================
// ============================================================================

// Provides global variables used by the entire program.
// Most of this should be configuration.

// Score controls for the whole game
import levels from "./levels.js";
const bonusRate = 10;
const dupDeduct = 5;
const incorrectDeduct = 10;

// Game constants
const  endPoint = "http://127.0.0.1:5000/"
// const endPoint = "https://chem120-game.up.railway.app/";
const correctMessage = "Correct answer";
const wrongMessage = "Incorrect answer";
const dupMessage = "Duplicated answer";
const levelIncomplete = "You haven't found all isomers. Keep going!";

// Interaction state
let pointerIsDown = false;

// state.js
// ============================================================================
// ============================================================================

///////////////////
// Local Storage //
///////////////////

const highScoreKey = "__highScore";
const curLvlKey = "__curLvl";
const curScoreKey = "__curScore";

const getLocalStorage = (key) => {
	const raw = localStorage.getItem(key);
	return raw ? parseInt(raw, 10) : 0;
};

let _lastHighscore = getLocalStorage(highScoreKey);
const setHighScore = (score) => {
	_lastHighscore = getLocalStorage(highScoreKey);
	localStorage.setItem(highScoreKey, String(score));
};

const isNewHighScore = () => state.game.totalScore > _lastHighscore;

///////////
// Enums //
///////////

// Available Menus
const MENU_MAIN = Symbol("MENU_MAIN");
const MENU_PAUSE = Symbol("MENU_PAUSE");
const MENU_OVER = Symbol("MENU_OVER");
const MENU_NEXT = Symbol("MENU_NEXT");
const MENU_TUTORIAL_PAUSE = Symbol("MENU_TUTORIAL_PAUSE");
const MENU_TUTORIAL_MAIN = Symbol("MENU_TUTORIAL_MAIN");

//////////////////
// Global State //
//////////////////

const state = {
	game: {
		level: 0,
		// Run time of current game.
		time: 0,
        // List of the correct answers so far
        correctAns: [],
        // Score of the current level
		lvlScore: 0,
		// Score of all level
		totalScore: 0,
	},
	menus: {
		// Set to `null` to hide all menus
		active: MENU_MAIN,
	},
};

////////////////////////////
// Global State Selectors //
////////////////////////////

const isInGame = () => !state.menus.active;
const isMenuVisible = () => !!state.menus.active;
const isPaused = () => state.menus.active === MENU_PAUSE;

// canvas.js
// ============================================================================
// ============================================================================
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
	const sketcher = new ChemDoodle.SketcherCanvas("c", 600, 400, options);

	sketcher.styles.atoms_displayTerminalCarbonLabels_2D = true;
	sketcher.styles.atoms_useJMOLColors = true;
	sketcher.styles.bonds_clearOverlaps_2D = true;
	sketcher.styles.shapes_color = "c10000";
	sketcher.repaint();
    return sketcher
};

// index.js
// ============================================================================
// ============================================================================
const sketcher = setUpCanvas();

// utils.js
// ============================================================================
// ============================================================================

/////////
// DOM //
/////////

const $ = (selector) => document.querySelector(selector);
const handleClick = (element, handler) =>
	element.addEventListener("click", handler);
const handlePointerDown = (element, handler) => {
	element.addEventListener("touchstart", handler);
	element.addEventListener("mousedown", handler);
};

////////////////////////
// Formatting Helpers //
////////////////////////

// Converts a number into a formatted string with thousand separators.
const formatNumber = (num) => num.toLocaleString();

////////////////////
// Timing Helpers //
////////////////////

// hud.js
// ============================================================================
// ============================================================================

const hudContainerNode = $(".hud");

function setHudVisibility(visible) {
	const gameNode = $(".game");
	if (visible) {
		hudContainerNode.style.display = "flex";
		gameNode.classList.add("active");
		renderTimeHud();
	} else {
		hudContainerNode.style.display = "none";
		gameNode.classList.remove("active");
	}
}

////////////
//  Time  //
////////////
const timerNode = $(".timer");
var intervalId;
function renderTimeHud() {
	function pad(value) {
		return value > 9 ? value : "0" + value;
	}
	intervalId = setInterval(() => {
		const seconds = pad(++state.game.time % 60);
		timerNode.innerText = `0:${pad(
			parseInt(state.game.time / 60, 10)
		)}:${seconds}`;
	}, 1000);
}

///////////
// Score //
///////////
const levelNode = $(".level");
const scoreNode = $(".level-score");

function renderScoreHud() {
	levelNode.innerText = `LEVEL ${state.game.level+1}: ${
		levels[state.game.level].name
	}`;
	scoreNode.style.display = "block";
	scoreNode.style.opacity = 0.85;
    console.log(state.game)
	scoreNode.innerText = `SCORE: ${
		state.game.totalScore + state.game.lvlScore
	}`;
}


//////////////////
// Pause Button //
//////////////////

handlePointerDown($(".pause-btn"), () => pauseGame());

// menus.js
// ============================================================================
// ============================================================================

// Top-level menu containers
const menuContainerNode = $(".menus");
const menuMainNode = $(".menu--main");
const menuPauseNode = $(".menu--pause");
const menuOverNode = $(".menu--over");
const menuNextNode = $(".menu--next");
const tutorialNodeMain = $(".menu--tutorial-main");
const tutorialNodePause = $(".menu--tutorial-pause");

const highScoreMainNode = $(".high-score-lbl--main");
const finalScoreLblNode = $(".final-score-lbl");
const highScoreLblNode = $(".high-score-lbl");
const levelScoreLblNode = $(".level-score-lbl");

function showMenu(node) {
	node.classList.add("active");
}

function hideMenu(node) {
	node.classList.remove("active");
}

function renderMenus() {
	hideMenu(menuMainNode);
	hideMenu(menuPauseNode);
	hideMenu(menuOverNode);
	hideMenu(menuNextNode);
	hideMenu(tutorialNodeMain);
	hideMenu(tutorialNodePause);

	switch (state.menus.active) {
		case MENU_MAIN:
			highScoreMainNode.innerText = getLocalStorage(highScoreKey);
			showMenu(menuMainNode);
			break;
		case MENU_PAUSE:
			showMenu(menuPauseNode);
			break;
		case MENU_OVER:
			finalScoreLblNode.textContent = formatNumber(state.game.totalScore);
			if (isNewHighScore()) {
				highScoreLblNode.textContent = "New High Score!";
			} else {
				highScoreLblNode.textContent = `High Score: ${formatNumber(
					getLocalStorage(highScoreKey)
				)}`;
			}
			showMenu(menuOverNode);
			break;
		case MENU_NEXT:
            levelScoreLblNode.innerText = formatNumber(state.game.totalScore)
			showMenu(menuNextNode);
			break;
		case MENU_TUTORIAL_MAIN:
			showMenu(tutorialNodeMain);
			break;
		case MENU_TUTORIAL_PAUSE:
			showMenu(tutorialNodePause);
			break;
	}

	setHudVisibility(!isMenuVisible());
	menuContainerNode.classList.toggle("has-active", isMenuVisible());
	menuContainerNode.classList.toggle(
		"interactive-mode",
		isMenuVisible() && pointerIsDown
	);
}

renderMenus();

////////////////////
// Button Actions //
////////////////////
const startGameLvl1 = () => {
    clearInterval(intervalId)
	resetGame();
	setLevel(0);
	setActiveMenu(null);
};

const startLvl = () => {
    clearInterval(intervalId)
	setLevel(getLocalStorage(curLvlKey));
    setTotalScore(getLocalStorage(curScoreKey))
	setActiveMenu(null);
}

// Main Menu
handleClick($(".start-btn"), startGameLvl1);

handleClick($(".cont-btn"), startLvl);

handleClick($(".tutorial-btn--main"), () => {
	setActiveMenu(MENU_TUTORIAL_MAIN);
});

// Pause Menu
handleClick($(".resume-btn"), () => resumeGame());
handleClick($(".restart-btn"), startGameLvl1);
handleClick($(".menu-btn--pause"), () => setActiveMenu(MENU_MAIN));
handleClick($(".tutorial-btn--pause"), () =>
	setActiveMenu(MENU_TUTORIAL_PAUSE)
);

// Game Over Menu
handleClick($(".play-again-btn"), startGameLvl1);
handleClick($(".menu-btn--over"), () => setActiveMenu(MENU_MAIN));

// Next Level Menu
handleClick($(".next-level-btn"), startLvl)
handleClick($(".menu-btn--next"), () => setActiveMenu(MENU_MAIN));

// Tutorial
handleClick($(".close-tutorial-btn--main"), () => {
	setActiveMenu(MENU_MAIN);
});
handleClick($(".close-tutorial-btn--pause"), () => {
	setActiveMenu(MENU_PAUSE);
});



// actions.js
// ============================================================================
// ============================================================================

//////////////////
// MENU ACTIONS //
//////////////////

function setActiveMenu(menu) {
	state.menus.active = menu;
	renderMenus();
}

/////////////////
// HUD ACTIONS //
/////////////////

function setLvlScore(score) {
    state.game.lvlScore = score;
	renderScoreHud();
}

function setTotalScore(score) {
    state.game.totalScore = score;
	renderScoreHud();
}

function changeScore(delta) {
	if (isInGame()) {
		state.game.lvlScore += delta;
		if (state.game.lvlScore < 0) {
			state.game.lvlScore = 0;
		}
		renderScoreHud();
	}
}

function setLevel(level) {
	state.game.level = level;
}

//////////////////
// GAME ACTIONS //
//////////////////
function resetGame() {
	state.game.time = 0;
    clearInterval(intervalId)
    setLevel(0)
	setLvlScore(0);
    setTotalScore(0);
    renderScoreHud();
}

function pauseGame() {
	clearInterval(intervalId);
	isInGame() && setActiveMenu(MENU_PAUSE);
}

function resumeGame() {
	isPaused() && setActiveMenu(null);
}

function endLevel() {
	$(".final-score-lbl").innerText = state.game.totalScore;
    $(".duplicates").innerHTML = ""
    setLevel(state.game.level+1)
    state.game.correctAns.length = 0
    clearInterval(intervalId)
    localStorage.setItem(curLvlKey, state.game.level)
    localStorage.setItem(curScoreKey, state.game.totalScore)
    setLvlScore(0)
	setActiveMenu(MENU_NEXT);
}

function endGame() {
	if (isNewHighScore()) {
		setHighScore(state.game.totalScore);
        localStorage.clear()
        localStorage.setItem(highScoreKey, state.game.totalScore)
	}
    clearInterval(intervalId)
    state.game.correctAns.length = 0
    $(".duplicates").innerHTML = ""
	setActiveMenu(MENU_OVER);
    localStorage.setItem(curLvlKey, 0)
    localStorage.setItem(curLvlScore, 0)
}

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
	const molLs = $(".duplicates");
	const span = document.createElement("span");
	const canvas2d = document.createElement("canvas");
	const canvas3d = document.createElement("canvas");
	span.appendChild(canvas2d);
	span.appendChild(canvas3d);
	molLs.appendChild(span);

	const canvas2dId = `canvas${state.game.correctAns.length}0`;
	canvas2d.setAttribute("id", canvas2dId);
	const viewCanvas2d = new ChemDoodle.ViewerCanvas(canvas2dId, 200, 200);
	setViewCanvas(viewCanvas2d, molBlock);

	const canvas3dId = `canvas${state.game.correctAns.length}1`;
	canvas3d.setAttribute("id", canvas3dId);
	const viewCanvas3d = new ChemDoodle.TransformCanvas3D(canvas3dId, 200, 200);
	setViewCanvas(viewCanvas3d, molBlock, true);
};

const getMolBlockStr = (canvas) => {
	return ChemDoodle.writeMOL(canvas.getMolecule());
};

const clearCanvas = () => {
    ChemDoodle.uis.actions.ClearAction(sketcher);
    sketcher.repaint();
};

//////////////////
//      API     //
//////////////////

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

const checkOneMol = async () => {
	let correct = false;
	let notDup = false;
	const molBlock = getMolBlockStr(sketcher);

	await postData(endPoint + "/game_input", {
		molBlock: molBlock,
		level: state.game.level,
		correctAns: state.game.correctAns,
	})
		.then(async (data) => {
			console.log(data);

			await getData(endPoint + "/single_result").then((response) => {
				correct = response["correct"];
				notDup = response["notDup"];
				state.game.correctAns = response["correctAns"];

				console.log(response);

				if (correct && notDup) {
                    changeScore(levels[state.game.level].molScore)
					displayCorrectAns(data["molBlock"]);
                    clearCanvas();
					alert(correctMessage);
				} else if (!notDup) {
					changeScore(-dupDeduct);
					alert(dupMessage);
				} else {
					changeScore(-incorrectDeduct);
					alert(wrongMessage);
				}
			});
		})
		.catch((e) => {
			console.log(e);
		});
};

const checkMolAndLvl = async () => {
    postData(endPoint + "/game_input", {
		molBlock: "",
		level: state.game.level,
		correctAns: state.game.correctAns,
	})
		.then((data) => {
			console.log(data);

			getData(endPoint + "/level_result").then((response) => {
				let foundAll = response["foundAll"];

				console.log(response);

				if (foundAll) {
					clearInterval(intervalId);
					console.log(state.game.time);
					// assuming that for every 10 seconds early, add 5 points
					const timeEarly = levels[state.game.level].maxTime - state.game.time;
					state.game.lvlScore +=
						timeEarly > 0 ? (timeEarly % 10) * bonusRate : 0;
					state.game.totalScore += state.game.lvlScore;
					clearCanvas();

					if (state.game.level == 7) {
						endGame();
					} else {
						endLevel()
					}
				} else alert(levelIncomplete);
			});
		})
		.catch((e) => {
			console.log(e);
		});
}

// Game Buttons
handleClick($("#check-single"), checkOneMol);
handleClick($("#check-level"), checkMolAndLvl);

////////////////////////
// KEYBOARD SHORTCUTS //
////////////////////////

window.addEventListener("keydown", (event) => {
	if (event.key === "p") {
		isPaused() ? resumeGame() : pauseGame();
	}
});


