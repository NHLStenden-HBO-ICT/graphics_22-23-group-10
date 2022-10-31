import * as THREE from "../node_modules/three/build/three.module.js";
import { Wall } from "./Objects/Wall.js";
import { Water } from "./Objects/Water.js";
import { Floor } from "./Objects/Floor.js";
import { Coin } from "./Objects/Coin.js";
import { LoadingScreen } from "./LoadingScreen.js";

// Some constants
const LEVELFOLDER = "../levels/";

const NONE = -1;
const FLOOR = 0;
const WALL = 1;
const DEAD_SPACE = 2;
const WATER = 3;
const INVIS_WALL = 4;
const COIN = 5;

// Decides how much the map image gets scaled up
const SCALE_FACTOR = 2;

export class Level {
	// Variables for loading
	static #isLevelLoaded = false;
	static #isLoading = false;
	static #tileToScan = NONE;
	static #rectangles = [];
	static #count = 0;
	static #levelDataAi;

	// Variables that other classes can access via getters
	static #levelGenData;
	static #level = new THREE.Object3D();
	static #playerSpawn = new THREE.Vector3();
	static #pacmanSpawn = new THREE.Vector3();
	static #mapSize = new THREE.Vector2();

	// Public variables
	static collisionObjects = [];
	static cameraCollisionObjects = [];
	static coins = [];
	static water;
	static floors = [];
	static allCoinsFound = false;

	// Loaded event
	static levelLoaded = new Event("levelLoaded");

	// Getters
	static get getLevelData() {
		if (this.#isLevelLoaded) return this.#levelDataAi;
		else return [];
	}

	static get getLevel() {
		if (this.#isLevelLoaded) return this.#level;
		else return undefined;
	}

	static get isLevelLoaded() {
		return this.#isLevelLoaded;
	}

	static get isLoading() {
		return this.#isLoading;
	}

	static get getPlayerSpawn() {
		if (this.#isLevelLoaded) return this.#playerSpawn;
		else return undefined;
	}

	static get getPacmanSpawn() {
		if (this.#isLevelLoaded) return this.#pacmanSpawn;
		else return undefined;
	}

	static get getMapSize() {
		return this.#mapSize;
	}

	static get getScaleFactor() {
		return SCALE_FACTOR;
	}

	static get FLOOR() {
		return FLOOR;
	}

	static get WALL() {
		return WALL;
	}

	static get COIN() {
		return COIN;
	}

	/**
	 * @param  {} levelName
	 *
	 * Loads the map which is passed in by name
	 */
	static load(levelName) {
		LoadingScreen.set("Reading map data...");

		const level = LEVELFOLDER + levelName + ".png";

		// Create a canvas from which to read the image data
		let canvas = document.createElement("canvas");
		let context = canvas.getContext("2d", { willReadFrequently: true });

		let img = new Image();
		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;

			this.#mapSize.x = img.width;
			this.#mapSize.y = img.height;

			// Initialize the arrays
			this.#levelDataAi = this.initLevelData(img.width);
			this.#levelGenData = this.initLevelData(img.width);

			context.drawImage(img, 0, 0);
			for (let y = 0; y < canvas.height; y++) {
				for (let x = 0; x < canvas.width; x++) {
					let data = context.getImageData(x, y, 1, 1).data;

					let tile;

					// Check what colour the pixel is

					if (equals(data, [0, 0, 0, 255])) {
						// BLACK | Wall
						tile = WALL;
					} else if (equals(data, [125, 125, 125, 255])) {
						// GRAY | Dead wall -> Won't spawn a wall but won't be walkable for the AI
						tile = DEAD_SPACE;
					} else if (equals(data, [0, 0, 255, 255])) {
						// BLUE | Water -> Not walkabale for player and AI
						tile = WATER;
					} else if (equals(data, [255, 255, 255, 255])) {
						// WHITE | Floor
						tile = FLOOR;
					} else if (equals(data, [50, 50, 50, 255])) {
						// DARK GRAY | Invisible wall
						tile = INVIS_WALL;
					} else if (equals(data, [255, 255, 0, 255])) {
						// YELLOW | Coin
						tile = FLOOR;
						this.coins.push(new Coin(x, y));
					} else if (equals(data, [255, 0, 0, 255])) {
						// RED | Player spawnpoint
						tile = FLOOR;
						this.#playerSpawn = new THREE.Vector3(
							x * SCALE_FACTOR,
							0,
							y * SCALE_FACTOR
						);
					} else if (equals(data, [0, 255, 0, 255])) {
						// GREEN | Pacman spawnpoint
						tile = FLOOR;
						this.#pacmanSpawn = new THREE.Vector3(
							x * SCALE_FACTOR,
							0,
							y * SCALE_FACTOR
						);
					} else {
						console.log("Color not found at ", x, y);
						tile = FLOOR;
					}

					// In case of 'double' or special tiles (i.e. coin) set what other tile is below it
					switch (tile) {
						case DEAD_SPACE:
							this.#levelDataAi[x][y] = WALL;
							this.#levelGenData[x][y] = FLOOR;
							break;
						case WATER:
							this.#levelDataAi[x][y] = WALL;
							this.#levelGenData[x][y] = WATER;
						case INVIS_WALL:
							this.#levelDataAi[x][y] = WALL;
							this.#levelGenData[x][y] = INVIS_WALL;
						case COIN:
							this.#levelDataAi[x][y] = WALL;
							this.#levelGenData[x][y] = COIN;
						default:
							this.#levelDataAi[x][y] = tile;
							this.#levelGenData[x][y] = tile;
							break;
					}
				}
			}

			// Once done scanning image start the loading process
			canvas.remove();
			this.addWater();
			this.#tileToScan = INVIS_WALL;
			this.#isLoading = true;
		};

		img.src = level;
	}

	/**
	 * Finds/places one rectangle each time called
	 */
	static update() {
		// Check if there's still tiles of the current tile we're checking for left
		if (this.containsTile(this.#levelGenData, this.#tileToScan)) {
			// Find largest possible rectangle
			const rect = this.findLargestRect();
			this.#rectangles.push(rect);

			this.#count++;
			let loadingMSG = "";

			let newTile;

			// Get the new tile at this location. A wall becomes a floor for example, to minimize different floor meshes by filling in holes below the walls
			switch (this.#tileToScan) {
				case FLOOR:
					newTile = NONE;
					loadingMSG = "Finding floors... [$]";
					break;
				case INVIS_WALL:
					newTile = WATER;
					loadingMSG = "Finding edges... [$]";
					break;
				case WALL:
					newTile = FLOOR;
					loadingMSG = "Finding walls... [$]";
					break;
				default:
					newTile = FLOOR;
					break;
			}

			LoadingScreen.set(loadingMSG.replace("$", this.#count));

			// Fill the rect with the new tile
			for (let y = rect.y1; y <= rect.y2; y++) {
				for (let x = rect.x1; x <= rect.x2; x++) {
					this.#levelGenData[x][y] = newTile;
				}
			}

			return;
		}

		// If no more rectangles are found, start placing them

		// Checks if there's still rectangles left to place
		if (this.#rectangles.length > 0) {
			let loadingMSG = "";
			this.#count++;

			const rect = this.#rectangles.pop();
			const w = rect.x2 - rect.x1 + 1;
			const h = rect.y2 - rect.y1 + 1;

			// Spawn the corresponding object
			switch (this.#tileToScan) {
				case INVIS_WALL:
					loadingMSG = "Placing edges... [$]";

					const wallI = new Wall(rect.x1 + w / 2, rect.y1 + h / 2, w, h, true);

					this.#level.add(wallI.model);
					this.collisionObjects.push(wallI);
					break;

				case WALL:
					loadingMSG = "Placing walls... [$]";

					const wall = new Wall(rect.x1 + w / 2, rect.y1 + h / 2, w, h);

					this.#level.add(wall.model);
					this.collisionObjects.push(wall);
					this.cameraCollisionObjects.push(wall.model);
					break;

				case FLOOR:
					loadingMSG = "Placing floors... [$]";

					const floor = new Floor(rect.x1 + w / 2, rect.y1 + h / 2, w, h);

					this.#level.add(floor.model);
					this.floors.push(floor);
					break;
			}

			LoadingScreen.set(loadingMSG.replace("$", this.#count));

			return;
		}

		// If no more rectangles found, set next tile to scan for
		switch (this.#tileToScan) {
			case INVIS_WALL:
				this.#tileToScan = WALL;
				break;
			case WALL:
				this.#tileToScan = FLOOR;
				break;
			case FLOOR:
				this.#tileToScan = NONE;
				this.#isLoading = false;
				this.#isLevelLoaded = true;
				dispatchEvent(this.levelLoaded);
				break;
		}
	}

	/**
	 * Adds water to the level
	 */
	static addWater() {
		// Add the level's defined water
		this.water = new Water(this.#mapSize.x, this.#mapSize.y);

		// Add the distant water
		const waterWidth = this.#mapSize.x * 5 * SCALE_FACTOR;
		const waterDepth = this.#mapSize.y * 5 * SCALE_FACTOR;
		const waterGeometry = new THREE.BoxGeometry(waterWidth, 0.1, waterDepth);
		const waterMaterial = new THREE.MeshBasicMaterial({ color: 0x0062ff });
		const water = new THREE.Mesh(waterGeometry, waterMaterial);
		water.position.y = -5;
		this.add(water);
	}

	/**
	 * Finds the largest possible rectangle in a matrix
	 * Can still use optimizing
	 */
	static findLargestRect() {
		const map = this.#levelGenData;
		const tileID = this.#tileToScan;
		const WIDTH = this.#mapSize.x;
		const HEIGHT = this.#mapSize.y;

		let x = 0;
		let y = 0;

		let biggestRect = { area: 0 };

		while (this.containsTile(map, tileID)) {
			if (map[x][y] != tileID) {
				x += 1;
				if (x == WIDTH) {
					// Reached the right edge of the map
					x = 0;
					y += 1;

					if (y == HEIGHT) {
						// Reached the bottom right, thus the end of the loop
						break;
					}
				}
				continue;
			}

			if (map[x][y] == tileID) {
				// Tile is what we're looking for, so we get the biggest rectangle possible from this location

				const rect = {
					x1: x,
					y1: y,
					x2: WIDTH - 1,
					y2: HEIGHT - 1,
					area: 0,
					invisible: false,
				};

				// Find bottom right corner
				// First we find largest possible X value
				for (let x = rect.x1; x < WIDTH; x++) {
					if (map[x][rect.y1] != tileID) {
						// If a floor is encountered on the horizonal axis
						rect.x2 = x - 1;
						break;
					}
				}

				// Find smallest Y value
				let yValues = [];
				for (let x = rect.x1; x <= rect.x2; x++) {
					for (let y = rect.y1; y < HEIGHT; y++) {
						if (y == HEIGHT - 1) {
							yValues.push(HEIGHT - 1);
							break;
						}
						if (map[x][y] != tileID) {
							yValues.push(y - 1);
							break;
						}
					}
				}

				const lowestY = Math.min(...yValues);
				rect.y2 = lowestY;

				// Calculate area
				rect.area = (rect.x2 - rect.x1 + 1) * (rect.y2 - rect.y1 + 1);

				// Move to next rectangle
				x += 1;
				if (x == WIDTH) {
					// Reached the right edge of the map
					x = 0;
					y += 1;

					if (y == HEIGHT) {
						// Reached the bottom right, thus the end of the loop
						break;
					}
				}

				if (rect.area > biggestRect.area) {
					biggestRect = rect;
				}
			}
		}

		return biggestRect;
	}

	/**
	 * Returns whether the tile is still present in the given matrix
	 * @param  {} map - Matrix to check in
	 * @param  {} tileID - Tile to check for
	 */
	static containsTile(map, tileID) {
		for (let x = 0; x < map.length; x++) {
			if (map[x].includes(tileID)) return true;
		}
		return false;
	}

	/**
	 * Adds an object to the level
	 * @param  {} obj - Object to add to the level
	 */
	static add(obj) {
		this.#level.add(obj);
	}

	/**
	 * Removes an object from the level
	 * @param {} obj - Object to remove from the level
	 */
	static remove(obj) {
		this.#level.remove(obj);
	}

	/**
	 * Returns an array with N empty arrays
	 * @param  {} n - Amount of arrays to add into an array
	 */
	static initLevelData(n) {
		let array = [];
		for (let i = 0; i < n; i++) {
			array[i] = [];
		}
		return array;
	}

	/**
	 * Adds debug shapes to the level
	 */
	static addHelpers() {
		for (let i = 0; i < this.collisionObjects.length; i++) {
			let helper = new THREE.Box3Helper(
				this.collisionObjects[i].boundingBox,
				0xff0000
			);
			this.add(helper);
		}

		for (let i = 0; i < this.floors.length; i++) {
			let helper = new THREE.Box3Helper(this.floors[i].boundingBox, 0xff0000);
			this.add(helper);
		}
	}
}

/**
 * Compares two arrays
 * @param  {} a
 * @param  {} b
 */
const equals = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
