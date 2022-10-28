// globalConfig.js
// ============================================================================
// ============================================================================

// Provides global variables used by the entire program.
// Most of this should be configuration.

// Timing multiplier for entire game engine.
let gameSpeed = 1;

// Colors
const BLUE = { r: 0x67, g: 0xd7, b: 0xf0 };
const GREEN = { r: 0xa6, g: 0xe0, b: 0x2c };
const PINK = { r: 0xfa, g: 0x24, b: 0x73 };
const ORANGE = { r: 0xfe, g: 0x95, b: 0x22 };
const allColors = [BLUE, GREEN, PINK, ORANGE];

// Gameplay
const getSpawnDelay = () => {
	const spawnDelayMax = 1400;
	const spawnDelayMin = 550;
	const spawnDelay = spawnDelayMax - state.game.cubeCount * 3.1;
	return Math.max(spawnDelay, spawnDelayMin);
};
const doubleStrongEnableScore = 2000;
// Number of cubes that must be smashed before activating a feature.
const slowmoThreshold = 10;
const strongThreshold = 25;
const spinnerThreshold = 25;

// Interaction state
let pointerIsDown = false;
// The last known position of the primary pointer in screen coordinates.`
let pointerScreen = { x: 0, y: 0 };
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
const makeTargetGlueColor = (target) => {
	// const alpha = (target.health - 1) / (target.maxHealth - 1);
	// return `rgba(170,221,255,${alpha.toFixed(3)})`;
	return "rgb(170,221,255)";
};
// Size of target fragments
const fragRadius = targetRadius / 3;

// Game canvas element needed in setup.js and interaction.js
const canvas = document.querySelector("#c");

// 3D camera config
// Affects perspective
const cameraDistance = 900;
// Does not affect perspective
const sceneScale = 1;
// Objects that get too close to the camera will be faded out to transparent over this range.
// const cameraFadeStartZ = 0.8*cameraDistance - 6*targetRadius;
const cameraFadeStartZ = 0.45 * cameraDistance;
const cameraFadeEndZ = 0.65 * cameraDistance;
const cameraFadeRange = cameraFadeEndZ - cameraFadeStartZ;

// Globals used to accumlate all vertices/polygons in each frame
const allVertices = [];
const allPolys = [];
const allShadowVertices = [];
const allShadowPolys = [];

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
const MENU_SCORE = Symbol("MENU_SCORE");

//////////////////
// Global State //
//////////////////

const state = {
	game: {
		mode: GAME_MODE_RANKED,
		// Run time of current game.
		time: 0,
		// Player score.
		score: 0,
		// Total number of cubes smashed in game.
		cubeCount: 0,
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
const isCasualGame = () => state.game.mode === GAME_MODE_CASUAL;
const isPaused = () => state.menus.active === MENU_PAUSE;

///////////////////
// Local Storage //
///////////////////

const highScoreKey = "__menja__highScore";
const getHighScore = () => {
	const raw = localStorage.getItem(highScoreKey);
	return raw ? parseInt(raw, 10) : 0;
};

let _lastHighscore = getHighScore();
const setHighScore = (score) => {
	_lastHighscore = getHighScore();
	localStorage.setItem(highScoreKey, String(score));
};

const isNewHighScore = () => state.game.score > _lastHighscore;

// utils.js
// ============================================================================
// ============================================================================

const invariant = (condition, message) => {
	if (!condition) throw new Error(message);
};

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
// Math Constants //
////////////////////

const PI = Math.PI;
const TAU = Math.PI * 2;
const ETA = Math.PI * 0.5;

//////////////////
// Math Helpers //
//////////////////

// Clamps a number between min and max values (inclusive)
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// Linearly interpolate between numbers a and b by a specific amount.
// mix >= 0 && mix <= 1
const lerp = (a, b, mix) => (b - a) * mix + a;

////////////////////
// Random Helpers //
////////////////////

// Generates a random number between min (inclusive) and max (exclusive)
const random = (min, max) => Math.random() * (max - min) + min;

// Generates a random integer between and possibly including min and max values
const randomInt = (min, max) => ((Math.random() * (max - min + 1)) | 0) + min;

// Returns a random element from an array
const pickOne = (arr) => arr[(Math.random() * arr.length) | 0];

///////////////////
// Color Helpers //
///////////////////

// Converts an { r, g, b } color object to a 6-digit hex code.
const colorToHex = (color) => {
	return (
		"#" +
		(color.r | 0).toString(16).padStart(2, "0") +
		(color.g | 0).toString(16).padStart(2, "0") +
		(color.b | 0).toString(16).padStart(2, "0")
	);
};

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

const _allCooldowns = [];

const makeCooldown = (rechargeTime, units = 1) => {
	let timeRemaining = 0;
	let lastTime = 0;

	const initialOptions = { rechargeTime, units };

	const updateTime = () => {
		const now = state.game.time;
		// Reset time remaining if time goes backwards.
		if (now < lastTime) {
			timeRemaining = 0;
		} else {
			// update...
			timeRemaining -= now - lastTime;
			if (timeRemaining < 0) timeRemaining = 0;
		}
		lastTime = now;
	};

	const canUse = () => {
		updateTime();
		return timeRemaining <= rechargeTime * (units - 1);
	};

	const cooldown = {
		canUse,
		useIfAble() {
			const usable = canUse();
			if (usable) timeRemaining += rechargeTime;
			return usable;
		},
		mutate(options) {
			if (options.rechargeTime) {
				// Apply recharge time delta so change takes effect immediately.
				timeRemaining -= rechargeTime - options.rechargeTime;
				if (timeRemaining < 0) timeRemaining = 0;
				rechargeTime = options.rechargeTime;
			}
			if (options.units) units = options.units;
		},
		reset() {
			timeRemaining = 0;
			lastTime = 0;
			this.mutate(initialOptions);
		},
	};

	_allCooldowns.push(cooldown);

	return cooldown;
};

const resetAllCooldowns = () =>
	_allCooldowns.forEach((cooldown) => cooldown.reset());

const makeSpawner = ({ chance, cooldownPerSpawn, maxSpawns }) => {
	const cooldown = makeCooldown(cooldownPerSpawn, maxSpawns);
	return {
		shouldSpawn() {
			return Math.random() <= chance && cooldown.useIfAble();
		},
		mutate(options) {
			if (options.chance) chance = options.chance;
			cooldown.mutate({
				rechargeTime: options.cooldownPerSpawn,
				units: options.maxSpawns,
			});
		},
	};
};

////////////////////
// Vector Helpers //
////////////////////

const normalize = (v) => {
	const mag = Math.hypot(v.x, v.y, v.z);
	return {
		x: v.x / mag,
		y: v.y / mag,
		z: v.z / mag,
	};
};

// Curried math helpers
const add = (a) => (b) => a + b;
// Curried vector helpers
const scaleVector = (scale) => (vector) => {
	vector.x *= scale;
	vector.y *= scale;
	vector.z *= scale;
};

////////////////
// 3D Helpers //
////////////////

// Clone array and all vertices.
function cloneVertices(vertices) {
	return vertices.map((v) => ({ x: v.x, y: v.y, z: v.z }));
}

// Copy vertex data from one array into another.
// Arrays must be the same length.
function copyVerticesTo(arr1, arr2) {
	const len = arr1.length;
	for (let i = 0; i < len; i++) {
		const v1 = arr1[i];
		const v2 = arr2[i];
		v2.x = v1.x;
		v2.y = v1.y;
		v2.z = v1.z;
	}
}

// Compute triangle midpoint.
// Mutates `middle` property of given `poly`.
function computeTriMiddle(poly) {
	const v = poly.vertices;
	poly.middle.x = (v[0].x + v[1].x + v[2].x) / 3;
	poly.middle.y = (v[0].y + v[1].y + v[2].y) / 3;
	poly.middle.z = (v[0].z + v[1].z + v[2].z) / 3;
}

// Compute quad midpoint.
// Mutates `middle` property of given `poly`.
function computeQuadMiddle(poly) {
	const v = poly.vertices;
	poly.middle.x = (v[0].x + v[1].x + v[2].x + v[3].x) / 4;
	poly.middle.y = (v[0].y + v[1].y + v[2].y + v[3].y) / 4;
	poly.middle.z = (v[0].z + v[1].z + v[2].z + v[3].z) / 4;
}

function computePolyMiddle(poly) {
	if (poly.vertices.length === 3) {
		computeTriMiddle(poly);
	} else {
		computeQuadMiddle(poly);
	}
}

// Compute distance from any polygon (tri or quad) midpoint to camera.
// Sets `depth` property of given `poly`.
// Also triggers midpoint calculation, which mutates `middle` property of `poly`.
function computePolyDepth(poly) {
	computePolyMiddle(poly);
	const dX = poly.middle.x;
	const dY = poly.middle.y;
	const dZ = poly.middle.z - cameraDistance;
	poly.depth = Math.hypot(dX, dY, dZ);
}

// Compute normal of any polygon. Uses normalized vector cross product.
// Mutates `normalName` property of given `poly`.
function computePolyNormal(poly, normalName) {
	// Store quick refs to vertices
	const v1 = poly.vertices[0];
	const v2 = poly.vertices[1];
	const v3 = poly.vertices[2];
	// Calculate difference of vertices, following winding order.
	const ax = v1.x - v2.x;
	const ay = v1.y - v2.y;
	const az = v1.z - v2.z;
	const bx = v1.x - v3.x;
	const by = v1.y - v3.y;
	const bz = v1.z - v3.z;
	// Cross product
	const nx = ay * bz - az * by;
	const ny = az * bx - ax * bz;
	const nz = ax * by - ay * bx;
	// Compute magnitude of normal and normalize
	const mag = Math.hypot(nx, ny, nz);
	const polyNormal = poly[normalName];
	polyNormal.x = nx / mag;
	polyNormal.y = ny / mag;
	polyNormal.z = nz / mag;
}

// Apply translation/rotation/scale to all given vertices.
// If `vertices` and `target` are the same array, the vertices will be mutated in place.
// If `vertices` and `target` are different arrays, `vertices` will not be touched, instead the
// transformed values from `vertices` will be written to `target` array.
function transformVertices(
	vertices,
	target,
	tX,
	tY,
	tZ,
	rX,
	rY,
	rZ,
	sX,
	sY,
	sZ
) {
	// Matrix multiplcation constants only need calculated once for all vertices.
	const sinX = Math.sin(rX);
	const cosX = Math.cos(rX);
	const sinY = Math.sin(rY);
	const cosY = Math.cos(rY);
	const sinZ = Math.sin(rZ);
	const cosZ = Math.cos(rZ);

	// Using forEach() like map(), but with a (recycled) target array.
	vertices.forEach((v, i) => {
		const targetVertex = target[i];
		// X axis rotation
		const x1 = v.x;
		const y1 = v.z * sinX + v.y * cosX;
		const z1 = v.z * cosX - v.y * sinX;
		// Y axis rotation
		const x2 = x1 * cosY - z1 * sinY;
		const y2 = y1;
		const z2 = x1 * sinY + z1 * cosY;
		// Z axis rotation
		const x3 = x2 * cosZ - y2 * sinZ;
		const y3 = x2 * sinZ + y2 * cosZ;
		const z3 = z2;

		// Scale, Translate, and set the transform.
		targetVertex.x = x3 * sX + tX;
		targetVertex.y = y3 * sY + tY;
		targetVertex.z = z3 * sZ + tZ;
	});
}

// 3D projection on a single vertex.
// Directly mutates the vertex.
const projectVertex = (v) => {
	const focalLength = cameraDistance * sceneScale;
	const depth = focalLength / (cameraDistance - v.z);
	v.x = v.x * depth;
	v.y = v.y * depth;
};

// 3D projection on a single vertex.
// Mutates a secondary target vertex.
const projectVertexTo = (v, target) => {
	const focalLength = cameraDistance * sceneScale;
	const depth = focalLength / (cameraDistance - v.z);
	target.x = v.x * depth;
	target.y = v.y * depth;
};

// hud.js
// ============================================================================
// ============================================================================

const hudContainerNode = $(".hud");

function setHudVisibility(visible) {
	if (visible) {
		hudContainerNode.style.display = "block";
	} else {
		hudContainerNode.style.display = "none";
	}
}

///////////
// Score //
///////////
const scoreNode = $(".level");
const cubeCountNode = $(".level-score");

function renderScoreHud() {
	scoreNode.innerText = `SCORE: ${state.game.score}`;
	scoreNode.style.display = "block";
	cubeCountNode.style.opacity = 0.65;

	cubeCountNode.innerText = `CUBES SMASHED: ${state.game.cubeCount}`;
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
const menuScoreNode = $(".menu--score");

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
	hideMenu(menuScoreNode);

	switch (state.menus.active) {
		case MENU_MAIN:
			showMenu(menuMainNode);
			break;
		case MENU_PAUSE:
			showMenu(menuPauseNode);
			break;
		case MENU_SCORE:
			finalScoreLblNode.textContent = formatNumber(state.game.score);
			if (isNewHighScore()) {
				highScoreLblNode.textContent = "New High Score!";
			} else {
				highScoreLblNode.textContent = `High Score: ${formatNumber(
					getHighScore()
				)}`;
			}
			showMenu(menuScoreNode);
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
handleClick($(".play-normal-btn"), () => {
	setGameMode(GAME_MODE_RANKED);
	setActiveMenu(null);
	resetGame();
});

handleClick($(".play-casual-btn"), () => {
	setGameMode(GAME_MODE_CASUAL);
	setActiveMenu(null);
	resetGame();
});

// Pause Menu
handleClick($(".resume-btn"), () => resumeGame());
handleClick($(".menu-btn--pause"), () => setActiveMenu(MENU_MAIN));

// Score Menu
handleClick($(".play-again-btn"), () => {
	setActiveMenu(null);
	resetGame();
});

handleClick($(".menu-btn--score"), () => setActiveMenu(MENU_MAIN));

////////////////////
// Button Actions //
////////////////////

// Main Menu
handleClick($(".play-normal-btn"), () => {
	setGameMode(GAME_MODE_RANKED);
	setActiveMenu(null);
	resetGame();
});

handleClick($(".play-casual-btn"), () => {
	setGameMode(GAME_MODE_CASUAL);
	setActiveMenu(null);
	resetGame();
});

// Pause Menu
handleClick($(".resume-btn"), () => resumeGame());
handleClick($(".menu-btn--pause"), () => setActiveMenu(MENU_MAIN));

// Score Menu
handleClick($(".play-again-btn"), () => {
	setActiveMenu(null);
	resetGame();
});

handleClick($(".menu-btn--score"), () => setActiveMenu(MENU_MAIN));

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

function setCubeCount(count) {
	state.game.cubeCount = count;
	renderScoreHud();
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

function setGameMode(mode) {
	state.game.mode = mode;
}

function resetGame() {
	resetAllTargets();
	state.game.time = 0;
	resetAllCooldowns();
	setScore(0);
	setCubeCount(0);
	spawnTime = getSpawnDelay();
}

function pauseGame() {
	isInGame() && setActiveMenu(MENU_PAUSE);
}

function resumeGame() {
	isPaused() && setActiveMenu(null);
}

function endGame() {
	handleCanvasPointerUp();
	if (isNewHighScore()) {
		setHighScore(state.game.score);
	}
	setActiveMenu(MENU_SCORE);
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

function tick(width, height, simTime, simSpeed, lag) {
	PERF_START("frame");
	PERF_START("tick");

	state.game.time += simTime;

	if (slowmoRemaining > 0) {
		slowmoRemaining -= simTime;
		if (slowmoRemaining < 0) {
			slowmoRemaining = 0;
		}
		targetSpeed = pointerIsDown ? 0.075 : 0.3;
	} else {
		const menuPointerDown = isMenuVisible() && pointerIsDown;
		targetSpeed = menuPointerDown ? 0.025 : 1;
	}

	renderSlowmoStatus(slowmoRemaining / slowmoDuration);

	gameSpeed += ((targetSpeed - gameSpeed) / 22) * lag;
	gameSpeed = clamp(gameSpeed, 0, 1);

	const centerX = width / 2;
	const centerY = height / 2;

	const simAirDrag = 1 - airDrag * simSpeed;
	const simAirDragSpark = 1 - airDragSpark * simSpeed;

	// Pointer Tracking
	// -------------------

	// Compute speed and x/y deltas.
	// There is also a "scaled" variant taking game speed into account. This serves two purposes:
	//  - Lag won't create large spikes in speed/deltas
	//  - In slow mo, speed is increased proportionately to match "reality". Without this boost,
	//    it feels like your actions are dampened in slow mo.
	const forceMultiplier = 1 / (simSpeed * 0.75 + 0.25);
	pointerDelta.x = 0;
	pointerDelta.y = 0;
	pointerDeltaScaled.x = 0;
	pointerDeltaScaled.y = 0;
	const lastPointer = touchPoints[touchPoints.length - 1];

	if (pointerIsDown && lastPointer && !lastPointer.touchBreak) {
		pointerDelta.x = pointerScene.x - lastPointer.x;
		pointerDelta.y = pointerScene.y - lastPointer.y;
		pointerDeltaScaled.x = pointerDelta.x * forceMultiplier;
		pointerDeltaScaled.y = pointerDelta.y * forceMultiplier;
	}
	const pointerSpeed = Math.hypot(pointerDelta.x, pointerDelta.y);
	const pointerSpeedScaled = pointerSpeed * forceMultiplier;

	// Track points for later calculations, including drawing trail.
	touchPoints.forEach((p) => (p.life -= simTime));

	if (pointerIsDown) {
		touchPoints.push({
			x: pointerScene.x,
			y: pointerScene.y,
			life: touchPointLife,
		});
	}

	while (touchPoints[0] && touchPoints[0].life <= 0) {
		touchPoints.shift();
	}

	// Entity Manipulation
	// --------------------
	PERF_START("entities");

	// Spawn targets
	spawnTime -= simTime;
	if (spawnTime <= 0) {
		if (spawnExtra > 0) {
			spawnExtra--;
			spawnTime = spawnExtraDelay;
		} else {
			spawnTime = getSpawnDelay();
		}
		const target = getTarget();
		const spawnRadius = Math.min(centerX * 0.8, maxSpawnX);
		target.x = Math.random() * spawnRadius * 2 - spawnRadius;
		target.y = centerY + targetHitRadius * 2;
		target.z = Math.random() * targetRadius * 2 - targetRadius;
		target.xD = Math.random() * ((target.x * -2) / 120);
		target.yD = -20;
		targets.push(target);
	}

	// Animate targets and remove when offscreen
	const leftBound = -centerX + targetRadius;
	const rightBound = centerX - targetRadius;
	const ceiling = -centerY - 120;
	const boundDamping = 0.4;

	targetLoop: for (let i = targets.length - 1; i >= 0; i--) {
		const target = targets[i];
		target.x += target.xD * simSpeed;
		target.y += target.yD * simSpeed;

		if (target.y < ceiling) {
			target.y = ceiling;
			target.yD = 0;
		}

		if (target.x < leftBound) {
			target.x = leftBound;
			target.xD *= -boundDamping;
		} else if (target.x > rightBound) {
			target.x = rightBound;
			target.xD *= -boundDamping;
		}

		if (target.z < backboardZ) {
			target.z = backboardZ;
			target.zD *= -boundDamping;
		}

		target.yD += gravity * simSpeed;
		target.rotateX += target.rotateXD * simSpeed;
		target.rotateY += target.rotateYD * simSpeed;
		target.rotateZ += target.rotateZD * simSpeed;
		target.transform();
		target.project();

		// Remove if offscreen
		if (target.y > centerY + targetHitRadius * 2) {
			targets.splice(i, 1);
			returnTarget(target);
			if (isInGame()) {
				if (isCasualGame()) {
					incrementScore(-25);
				} else {
					endGame();
				}
			}
			continue;
		}

		// If pointer is moving really fast, we want to hittest multiple points along the path.
		// We can't use scaled pointer speed to determine this, since we care about actual screen
		// distance covered.
		const hitTestCount = Math.ceil((pointerSpeed / targetRadius) * 2);
		// Start loop at `1` and use `<=` check, so we skip 0% and end up at 100%.
		// This omits the previous point position, and includes the most recent.
		for (let ii = 1; ii <= hitTestCount; ii++) {
			const percent = 1 - ii / hitTestCount;
			const hitX = pointerScene.x - pointerDelta.x * percent;
			const hitY = pointerScene.y - pointerDelta.y * percent;
			const distance = Math.hypot(
				hitX - target.projected.x,
				hitY - target.projected.y
			);

			if (distance <= targetHitRadius) {
				// Hit! (though we don't want to allow hits on multiple sequential frames)
				if (!target.hit) {
					target.hit = true;

					target.xD += pointerDeltaScaled.x * hitDampening;
					target.yD += pointerDeltaScaled.y * hitDampening;
					target.rotateXD += pointerDeltaScaled.y * 0.001;
					target.rotateYD += pointerDeltaScaled.x * 0.001;

					const sparkSpeed = 7 + pointerSpeedScaled * 0.125;

					if (pointerSpeedScaled > minPointerSpeed) {
						target.health--;
						incrementScore(10);

						if (target.health <= 0) {
							incrementCubeCount(1);
							createBurst(target, forceMultiplier);
							sparkBurst(hitX, hitY, 8, sparkSpeed);
							if (target.wireframe) {
								slowmoRemaining = slowmoDuration;
								spawnTime = 0;
								spawnExtra = 2;
							}
							targets.splice(i, 1);
							returnTarget(target);
						} else {
							sparkBurst(hitX, hitY, 8, sparkSpeed);
							glueShedSparks(target);
							updateTargetHealth(target, 0);
						}
					} else {
						incrementScore(5);
						sparkBurst(hitX, hitY, 3, sparkSpeed);
					}
				}
				// Break the current loop and continue the outer loop.
				// This skips to processing the next target.
				continue targetLoop;
			}
		}

		// This code will only run if target hasn't been "hit".
		target.hit = false;
	}

	// Animate fragments and remove when offscreen.
	const fragBackboardZ = backboardZ + fragRadius;
	// Allow fragments to move off-screen to sides for a while, since shadows are still visible.
	const fragLeftBound = -width;
	const fragRightBound = width;

	for (let i = frags.length - 1; i >= 0; i--) {
		const frag = frags[i];
		frag.x += frag.xD * simSpeed;
		frag.y += frag.yD * simSpeed;
		frag.z += frag.zD * simSpeed;

		frag.xD *= simAirDrag;
		frag.yD *= simAirDrag;
		frag.zD *= simAirDrag;

		if (frag.y < ceiling) {
			frag.y = ceiling;
			frag.yD = 0;
		}

		if (frag.z < fragBackboardZ) {
			frag.z = fragBackboardZ;
			frag.zD *= -boundDamping;
		}

		frag.yD += gravity * simSpeed;
		frag.rotateX += frag.rotateXD * simSpeed;
		frag.rotateY += frag.rotateYD * simSpeed;
		frag.rotateZ += frag.rotateZD * simSpeed;
		frag.transform();
		frag.project();

		// Removal conditions
		if (
			// Bottom of screen
			frag.projected.y > centerY + targetHitRadius ||
			// Sides of screen
			frag.projected.x < fragLeftBound ||
			frag.projected.x > fragRightBound ||
			// Too close to camera
			frag.z > cameraFadeEndZ
		) {
			frags.splice(i, 1);
			returnFrag(frag);
			continue;
		}
	}

	// 2D sparks
	for (let i = sparks.length - 1; i >= 0; i--) {
		const spark = sparks[i];
		spark.life -= simTime;
		if (spark.life <= 0) {
			sparks.splice(i, 1);
			returnSpark(spark);
			continue;
		}
		spark.x += spark.xD * simSpeed;
		spark.y += spark.yD * simSpeed;
		spark.xD *= simAirDragSpark;
		spark.yD *= simAirDragSpark;
		spark.yD += gravity * simSpeed;
	}

	PERF_END("entities");

	// 3D transforms
	// -------------------

	PERF_START("3D");

	// Aggregate all scene vertices/polys
	allVertices.length = 0;
	allPolys.length = 0;
	allShadowVertices.length = 0;
	allShadowPolys.length = 0;
	targets.forEach((entity) => {
		allVertices.push(...entity.vertices);
		allPolys.push(...entity.polys);
		allShadowVertices.push(...entity.shadowVertices);
		allShadowPolys.push(...entity.shadowPolys);
	});

	frags.forEach((entity) => {
		allVertices.push(...entity.vertices);
		allPolys.push(...entity.polys);
		allShadowVertices.push(...entity.shadowVertices);
		allShadowPolys.push(...entity.shadowPolys);
	});

	// Scene calculations/transformations
	allPolys.forEach((p) => computePolyNormal(p, "normalWorld"));
	allPolys.forEach(computePolyDepth);
	allPolys.sort((a, b) => b.depth - a.depth);

	// Perspective projection
	allVertices.forEach(projectVertex);

	allPolys.forEach((p) => computePolyNormal(p, "normalCamera"));

	PERF_END("3D");

	PERF_START("shadows");

	// Rotate shadow vertices to light source perspective
	transformVertices(
		allShadowVertices,
		allShadowVertices,
		0,
		0,
		0,
		TAU / 8,
		0,
		0,
		1,
		1,
		1
	);

	allShadowPolys.forEach((p) => computePolyNormal(p, "normalWorld"));

	const shadowDistanceMult = Math.hypot(1, 1);
	const shadowVerticesLength = allShadowVertices.length;
	for (let i = 0; i < shadowVerticesLength; i++) {
		const distance = allVertices[i].z - backboardZ;
		allShadowVertices[i].z -= shadowDistanceMult * distance;
	}
	transformVertices(
		allShadowVertices,
		allShadowVertices,
		0,
		0,
		0,
		-TAU / 8,
		0,
		0,
		1,
		1,
		1
	);
	allShadowVertices.forEach(projectVertex);

	PERF_END("shadows");

	PERF_END("tick");
}

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
