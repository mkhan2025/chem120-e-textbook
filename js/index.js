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
        clearInterval(intervalId)
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
handleClick($(".menu-btn--pause"), () => setActiveMenu(MENU_MAIN));
handleClick($(".tutorial-btn--pause"), () => {
	setActiveMenu(MENU_TUTORIAL_PAUSE);
});

// Score Menu
handleClick($(".play-again-btn"), () => {
	setActiveMenu(null);
	resetGame();
});

handleClick($(".menu-btn--score"), () => setActiveMenu(MENU_MAIN));

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

// tick.js
// ============================================================================
// ============================================================================

let spawnTime = 0;
const maxSpawnX = 450;
const pointerDelta = { x: 0, y: 0 };
const pointerDeltaScaled = { x: 0, y: 0 };

// Temp slowmo state. Should be relocated once this stabilizes.
const slowmoDuration = 1500;
let slowmoRemaining = 0;
let spawnExtra = 0;
const spawnExtraDelay = 300;
let targetSpeed = 1;

// draw.js
// ============================================================================
// ============================================================================

function draw(ctx, width, height, viewScale) {
	PERF_START("draw");

	const halfW = width / 2;
	const halfH = height / 2;

	// 3D Polys
	// ---------------
	ctx.lineJoin = "bevel";

	PERF_START("drawShadows");
	ctx.fillStyle = shadowColor;
	ctx.strokeStyle = shadowColor;
	allShadowPolys.forEach((p) => {
		if (p.wireframe) {
			ctx.lineWidth = 2;
			ctx.beginPath();
			const { vertices } = p;
			const vCount = vertices.length;
			const firstV = vertices[0];
			ctx.moveTo(firstV.x, firstV.y);
			for (let i = 1; i < vCount; i++) {
				const v = vertices[i];
				ctx.lineTo(v.x, v.y);
			}
			ctx.closePath();
			ctx.stroke();
		} else {
			ctx.beginPath();
			const { vertices } = p;
			const vCount = vertices.length;
			const firstV = vertices[0];
			ctx.moveTo(firstV.x, firstV.y);
			for (let i = 1; i < vCount; i++) {
				const v = vertices[i];
				ctx.lineTo(v.x, v.y);
			}
			ctx.closePath();
			ctx.fill();
		}
	});
	PERF_END("drawShadows");

	PERF_START("drawPolys");

	allPolys.forEach((p) => {
		if (!p.wireframe && p.normalCamera.z < 0) return;

		if (p.strokeWidth !== 0) {
			ctx.lineWidth =
				p.normalCamera.z < 0 ? p.strokeWidth * 0.5 : p.strokeWidth;
			ctx.strokeStyle =
				p.normalCamera.z < 0 ? p.strokeColorDark : p.strokeColor;
		}

		const { vertices } = p;
		const lastV = vertices[vertices.length - 1];
		const fadeOut = p.middle.z > cameraFadeStartZ;

		if (!p.wireframe) {
			const normalLight = p.normalWorld.y * 0.5 + p.normalWorld.z * -0.5;
			const lightness =
				normalLight > 0
					? 0.1
					: ((normalLight ** 32 - normalLight) / 2) * 0.9 + 0.1;
			ctx.fillStyle = shadeColor(p.color, lightness);
		}

		// Fade out polys close to camera. `globalAlpha` must be reset later.
		if (fadeOut) {
			// If polygon gets really close to camera (outside `cameraFadeRange`) the alpha
			// can go negative, which has the appearance of alpha = 1. So, we'll clamp it at 0.
			ctx.globalAlpha = Math.max(
				0,
				1 - (p.middle.z - cameraFadeStartZ) / cameraFadeRange
			);
		}

		ctx.beginPath();
		ctx.moveTo(lastV.x, lastV.y);
		for (let v of vertices) {
			ctx.lineTo(v.x, v.y);
		}

		if (!p.wireframe) {
			ctx.fill();
		}
		if (p.strokeWidth !== 0) {
			ctx.stroke();
		}

		if (fadeOut) {
			ctx.globalAlpha = 1;
		}
	});
	PERF_END("drawPolys");

	PERF_START("draw2D");

	// 2D Sparks
	// ---------------
	ctx.strokeStyle = sparkColor;
	ctx.lineWidth = sparkThickness;
	ctx.beginPath();
	sparks.forEach((spark) => {
		ctx.moveTo(spark.x, spark.y);
		// Shrink sparks to zero length as they die.
		// Speed up shrinking as life approaches 0 (root curve).
		// Note that sparks already get smaller over time as their speed slows
		// down from damping. So this is like a double scale down. To counter this
		// a bit and keep the sparks larger for longer, we'll also increase the scale
		// a bit after applying the root curve.
		const scale = (spark.life / spark.maxLife) ** 0.5 * 1.5;
		ctx.lineTo(spark.x - spark.xD * scale, spark.y - spark.yD * scale);
	});
	ctx.stroke();

	// Touch Strokes
	// ---------------

	ctx.strokeStyle = touchTrailColor;
	const touchPointCount = touchPoints.length;
	for (let i = 1; i < touchPointCount; i++) {
		const current = touchPoints[i];
		const prev = touchPoints[i - 1];
		if (current.touchBreak || prev.touchBreak) {
			continue;
		}
		const scale = current.life / touchPointLife;
		ctx.lineWidth = scale * touchTrailThickness;
		ctx.beginPath();
		ctx.moveTo(prev.x, prev.y);
		ctx.lineTo(current.x, current.y);
		ctx.stroke();
	}

	PERF_END("draw2D");

	PERF_END("draw");
	PERF_END("frame");

	// Display performance updates.
	PERF_UPDATE();
}

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
