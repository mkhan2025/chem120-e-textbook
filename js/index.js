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
// const endPoint = "http://127.0.0.1:5000/";
const endPoint = "https://chem120-game.up.railway.app/";

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

const setHighScore = (score) => {
	localStorage.setItem(highScoreKey, String(score));
};

const isNewHighScore = () =>
	state.game.totalScore > getLocalStorage(highScoreKey);

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

// Answer Check
const CORRECT = "Correct!";
const INCORRECT = "Incorrect!";
const DUPLICATED = "Duplicated!";
const UNFINISHED = "Incomplete.\nKeep trying!";

///////////
// Icons //
///////////
const soundOn =
	"<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' fill='white' viewBox='0 0 16 16'><path d='M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z'/><path d='M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z'/><path d='M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z'/></svg>";
const soundOff =
	"<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' fill='white' class='bi bi-volume-mute-fill' viewBox='0 0 16 16'><path d='M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z'/></svg>";


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
	sound: true,
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
	return sketcher;
};

// index.js
// ============================================================================
// ============================================================================
const sketcher = setUpCanvas();
// const toolbar = new ChemDoodle.uis.gui.desktop.ToolbarManager(sketcher);

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

const bonusNodeNext = $(".time-bonus--next");
const bonusNodeOver = $(".time-bonus--over");
var bonusIntervalId;
function renderBonusEffect(timeNode, totalScoreNode) {
	function pad(value) {
		return value > 9 ? value : "0" + value;
	}
	const countingUpRate = 5;
	bonusIntervalId = setInterval(() => {
		if (state.game.time < levels[state.game.level].maxTime) {
			const seconds = pad(++state.game.time % 60);
			timeNode.innerText = `0:${pad(
				parseInt(state.game.time / 60, 10)
			)}:${seconds}`;
		} else {
			totalScoreNode.innerText = formatNumber(state.game.totalScore);
			if (isNewHighScore()) {
				highScoreLblNode.textContent = "New High Score!";
				setHighScore(state.game.totalScore);
				localStorage.setItem(highScoreKey, state.game.totalScore);
			} else {
				highScoreLblNode.textContent = `High Score: ${formatNumber(
					getLocalStorage(highScoreKey)
				)}`;
			}
			clearInterval(bonusIntervalId);
		}
	}, countingUpRate);
}

///////////
// Score //
///////////
const levelNode = $(".level");
const scoreNode = $(".level-score");

function renderScoreHud() {
	levelNode.innerText = `LEVEL ${state.game.level + 1}: ${
		levels[state.game.level].name
	}`;
	scoreNode.style.display = "block";
	scoreNode.style.opacity = 0.85;
	console.log(state.game);
	scoreNode.innerText = `SCORE: ${
		state.game.totalScore + state.game.lvlScore
	}`;
}

///////////
// Check //
///////////
const wrongIcon = $("#icon-wrong");
const correctIcon = $("#icon-correct");
const duplicateIcon = $("#icon-duplicate");
const unfinishIcon = $("#icon-unfinish");
const checkMessageNode = $(".alert");

const getMolAlert = (iconNode, alertMessage) => {
	iconNode.classList.add("active");
	checkMessageNode.innerText = alertMessage;
	checkMessageNode.classList.add("active");

	setTimeout(() => {
		iconNode.classList.remove("active");
		checkMessageNode.classList.remove("active");
	}, 1500);
};


///////////
// Sound //
///////////
const soundBtnNode = $(".sound-control");
function renderSoundIcon() {
	soundBtnNode.innerHTML = state.sound ? soundOn : soundOff;
}

renderSoundIcon();

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
			showMenu(menuOverNode);
			renderBonusEffect(bonusNodeOver, finalScoreLblNode);
			break;
		case MENU_NEXT:
			showMenu(menuNextNode);
			renderBonusEffect(bonusNodeNext, levelScoreLblNode);
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
	clearInterval(intervalId);
	$(".timer").innerText = "0:00:00";
	resetGame();
	setLevel(0);
	setActiveMenu(null);
};

const startLvl = () => {
	clearInterval(intervalId);
	$(".timer").innerText = "0:00:00";
	setLevel(getLocalStorage(curLvlKey));
	setTotalScore(getLocalStorage(curScoreKey));
	setActiveMenu(null);
};

// Sound Control
const soundBtn = $(".sound-control");
const bgMusicNode = $("#bg-music");
bgMusicNode.volume = 0.2;
handleClick(soundBtn, () => {
	state.sound = !state.sound;
	bgMusicNode.muted = !bgMusicNode.muted;
	renderSoundIcon();
});

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
handleClick($(".next-level-btn"), startLvl);
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
	state.game.correctAns.length = 0;
	clearInterval(intervalId);
	setLevel(0);
	setLvlScore(0);
	setTotalScore(0);
	renderScoreHud();
	$(".duplicates").innerHTML = "<h2>You have found these isomers</h2>";
}

function pauseGame() {
	clearInterval(intervalId);
	isInGame() && setActiveMenu(MENU_PAUSE);
}

function resumeGame() {
	isPaused() && setActiveMenu(null);
}

function endLevel() {
	levelScoreLblNode.innerText = formatNumber(state.game.lvlScore);
	setActiveMenu(MENU_NEXT);
	state.game.time = 0;
	setLevel(state.game.level + 1);
	$(".duplicates").innerHTML = "<h2>You have found these isomers</h2>";
	clearInterval(intervalId);
	$(".timer").innerText = "0:00:00";
	state.game.correctAns.length = 0;
	localStorage.setItem(curLvlKey, state.game.level);
	localStorage.setItem(curScoreKey, state.game.totalScore);
	setLvlScore(0);
}

function endGame() {
	$(".final-score-lbl").innerText = formatNumber(state.game.lvlScore);
	setActiveMenu(MENU_OVER);
	state.game.time = 0;
	clearInterval(intervalId);
	$(".timer").innerText = "0:00:00";
	state.game.correctAns.length = 0;
	$(".duplicates").innerHTML = "<h2>You have found these isomers</h2>";
	localStorage.setItem(curLvlKey, 0);
	localStorage.setItem(curLvlScore, 0);
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
	span.style.display = "inline-block";
	molLs.appendChild(span);

	const canvas2dId = `canvas${state.game.correctAns.length}0`;
	canvas2d.setAttribute("id", canvas2dId);
	const viewCanvas2d = new ChemDoodle.ViewerCanvas(canvas2dId, 150, 150);
	setViewCanvas(viewCanvas2d, molBlock);

	const canvas3dId = `canvas${state.game.correctAns.length}1`;
	canvas3d.setAttribute("id", canvas3dId);
	const viewCanvas3d = new ChemDoodle.TransformCanvas3D(canvas3dId, 150, 150);
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
					changeScore(levels[state.game.level].molScore);
					displayCorrectAns(data["molBlock"]);
					clearCanvas();
					getMolAlert(correctIcon, CORRECT);
				} else if (!notDup) {
					changeScore(-dupDeduct);
					getMolAlert(duplicateIcon, DUPLICATED);
				} else {
					changeScore(-incorrectDeduct);
					getMolAlert(wrongIcon, INCORRECT);
				}
			});
		})
		.catch((e) => {
			console.log(e);
		});
};

const checkMolAndLvl = async () => {
	const molBlock = getMolBlockStr(sketcher);

	postData(endPoint + "/game_input", {
		molBlock: molBlock,
		level: state.game.level,
		correctAns: state.game.correctAns,
	})
		.then((data) => {
			console.log(data);

			getData(endPoint + "/level_result").then((response) => {
				let foundAll = response["foundAll"];
				let notDup = response["notDup"];
				let correct = response["correct"];

				console.log(response);
				if (correct && notDup)
					changeScore(levels[state.game.level].molScore);

				// assuming that for every 10 seconds early, add [bonusRate] points
				const timeEarly =
					levels[state.game.level].maxTime - state.game.time;
				state.game.totalScore +=
					state.game.lvlScore +
					(timeEarly > 0
						? parseInt(timeEarly / 10, 10) * bonusRate
						: 0);

				if (foundAll) {
					clearInterval(intervalId);
					clearCanvas();

					if (state.game.level == 7) {
						endGame();
					} else {
						endLevel();
					}
				} else getMolAlert(unfinishIcon, UNFINISHED);
			});
		})
		.catch((e) => {
			console.log(e);
		});
};

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
