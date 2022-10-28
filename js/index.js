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

// Interaction state
let pointerIsDown = false;
// Same as `pointerScreen`, but converted to scene coordinates in rAF.
let pointerScene = { x: 0, y: 0 };
// Minimum speed of pointer before "hits" are counted.
const minPointerSpeed = 60;
// The hit speed affects the direction the target post-hit. This number dampens that force.
const hitDampening = 0.1;
// Backboard receives shadows and is the farthest negative Z position of entities.
const backboardZ = -400;
const shadowColor = "#262e36";
// How much air drag is applied to standard objects
const airDrag = 0.022;
const gravity = 0.3;
// Spark config
const sparkColor = "rgba(170,221,255,.9)";
const sparkThickness = 2.2;
const airDragSpark = 0.1;
// Track pointer positions to show trail
const touchTrailColor = "rgba(170,221,255,.62)";
const touchTrailThickness = 7;
const touchPointLife = 120;
const touchPoints = [];
// Size of in-game targets. This affects rendered size and hit area.
const targetRadius = 40;
const targetHitRadius = 50;
// Size of target fragments
const fragRadius = targetRadius / 3;

// state.js
// ============================================================================
// ============================================================================

///////////
// Enums //
///////////

// Game Modes
const GAME_MODE_RANKED = Symbol("GAME_MODE_RANKED");
const GAME_MODE_CASUAL = Symbol("GAME_MODE_CASUAL");

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
		// Player score.
		score: 0,
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

const isNewHighScore = () => state.game.score > _lastHighscore;

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

//////////////////
// Math Helpers //
//////////////////

// Linearly interpolate between numbers a and b by a specific amount.
// mix >= 0 && mix <= 1
const lerp = (a, b, mix) => (b - a) * mix + a;

////////////////////
// Random Helpers //
////////////////////

// Operates on an { r, g, b } color object.
// Returns string hex code.
// `lightness` must range from 0 to 1. 0 is pure black, 1 is pure white.
const shadeColor = (color, lightness) => {
	let other, mix;
	if (lightness < 0.5) {
		other = 0;
		mix = 1 - lightness * 2;
	} else {
		other = 255;
		mix = lightness * 2 - 1;
	}
	return (
		"#" +
		(lerp(color.r, other, mix) | 0).toString(16).padStart(2, "0") +
		(lerp(color.g, other, mix) | 0).toString(16).padStart(2, "0") +
		(lerp(color.b, other, mix) | 0).toString(16).padStart(2, "0")
	);
};

////////////////////
// Timing Helpers //
////////////////////

// hud.js
// ============================================================================
// ============================================================================

const hudContainerNode = $(".hud");

function setHudVisibility(visible) {
    const gameNode = $(".game")
	if (visible) {
		hudContainerNode.style.display = "flex";
        gameNode.classList.add("active")
        renderTimeHud()
	} else {
		hudContainerNode.style.display = "none";
        gameNode.classList.remove("active")
	}
}

////////////
//  Time  //
////////////
const timerNode = $(".timer")
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
	levelNode.innerText = `LEVEL ${state.game.level}: ${levels[state.game.level].name}`;
	scoreNode.style.display = "block";
	scoreNode.style.opacity = 0.85;

	scoreNode.innerText = `SCORE: ${state.game.score}`;
}

renderScoreHud();


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
			finalScoreLblNode.textContent = formatNumber(state.game.score);
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

// Main Menu
handleClick($(".start-btn"), () => {
	setLevel(0);
	setActiveMenu(null);
	resetGame();
});

handleClick($(".cont-btn"), () => {
	setLevel(getLocalStorage(curLvlKey));
	setActiveMenu(null);
	resetGame();
});

handleClick($(".tutorial-btn--main"), () => {
	setActiveMenu(MENU_TUTORIAL_MAIN);
});

// Pause Menu
handleClick($(".resume-btn"), () => resumeGame());
handleClick($(".restart-btn"), () => {
    setLevel(0);
	setActiveMenu(null);
	resetGame();
})
handleClick($(".menu-btn--pause"), () => setActiveMenu(MENU_MAIN));
handleClick($(".tutorial-btn--pause"), () => {
	setActiveMenu(MENU_TUTORIAL_PAUSE);
});

// Game Over Menu
handleClick($(".play-again-btn"), () => {
	setActiveMenu(null);
	resetGame();
});
handleClick($(".menu-btn--over"), () => setActiveMenu(MENU_MAIN));

// Next Level Menu


// Tutorial
handleClick($(".close-tutorial-btn--main"), () => {
    setActiveMenu(MENU_MAIN)
})

handleClick($(".close-tutorial-btn--pause"), () => {
    setActiveMenu(MENU_PAUSE)
})

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

function setScore(score) {
	state.game.score = score;
	renderScoreHud();
}

function incrementScore(inc) {
	if (isInGame()) {
		state.game.score += inc;
		if (state.game.score < 0) {
			state.game.score = 0;
		}
		renderScoreHud();
	}
}


function incrementCubeCount(inc) {
	if (isInGame()) {
		state.game.cubeCount += inc;
		renderScoreHud();
	}
}

//////////////////
// GAME ACTIONS //
//////////////////

function setLevel(level) {
	state.game.level = level;
}

function resetGame() {
	state.game.time = 0;
	setScore(getLocalStorage(curScoreKey));
}

function pauseGame() {
    clearInterval(intervalId)
	isInGame() && setActiveMenu(MENU_PAUSE);
}

function resumeGame() {
	isPaused() && setActiveMenu(null);
}

function endLevel() {
    handleCanvasPointerUp();
	setActiveMenu(MENU_NEXT);
}

function endGame() {
	handleCanvasPointerUp();
	if (isNewHighScore()) {
		setHighScore(state.game.score);
	}
	setActiveMenu(MENU_OVER);
}

////////////////////////
// KEYBOARD SHORTCUTS //
////////////////////////

window.addEventListener("keydown", (event) => {
	if (event.key === "p") {
		isPaused() ? resumeGame() : pauseGame();
	}
});

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
};

// index.js
// ============================================================================
// ============================================================================

setUpCanvas();
