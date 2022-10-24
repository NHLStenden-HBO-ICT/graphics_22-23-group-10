import * as THREE from "../node_modules/three/build/three.module.js";
import { Wall } from "./Objects/Wall.js";
import { Water } from "./Objects/Water.js";
import { Floor } from "./Objects/Floor.js"
import { Coin } from "./Objects/Coin.js";

const LEVELFOLDER = "../levels/";

const NONE = -1;
const FLOOR = 0;
const WALL = 1;
const DEAD_SPACE = 2;
const WATER = 3;
const INVIS_WALL = 4;
const COIN = 5;

const SCALE_FACTOR = 2;

export class Level {
	static #levelDataAi;
	static #levelGenData;
	static #level = new THREE.Object3D();
	static #isLevelLoaded = false;
	static #playerSpawn = new THREE.Vector3();
	static #pacmanSpawn = new THREE.Vector3();
	static collisionObjects = [];
	static cameraCollisionObjects = [];
	static coins = [];
	static water;

	static levelLoaded = new Event("levelLoaded");

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

	static get getPlayerSpawn() {
		if (this.#isLevelLoaded) return this.#playerSpawn;
		else return undefined;
	}

	static get getPacmanSpawn() {
		if (this.#isLevelLoaded) return this.#pacmanSpawn;
		else return undefined;
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

	static load(levelName) {
		const level = LEVELFOLDER + levelName + ".png";

		let canvas = document.createElement("canvas");
		let context = canvas.getContext("2d", { willReadFrequently: true });

		let img = new Image();
		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;

			this.#levelDataAi = this.initLevelData(img.width);
			this.#levelGenData = this.initLevelData(img.width);

			context.drawImage(img, 0, 0);
			for (let y = 0; y < canvas.height; y++) {
				for (let x = 0; x < canvas.width; x++) {
					let data = context.getImageData(x, y, 1, 1).data;

					let tile;

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
						this.coins.push(new Coin(x,y));
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

			this.generateLevel(img.width, img.height);

			this.addHelpers();

			this.#isLevelLoaded = true;
			dispatchEvent(this.levelLoaded);

			canvas.remove();
		};

		img.src = level;
	}

	static generateLevel(width, height) {
		// Add the water
		this.water = new Water(width, height);
		
		// Get invisible walls
		const invisibleWalls = this.getRectangles(INVIS_WALL);
		for (let i = 0; i < invisibleWalls.length; i++) {
			const rect = invisibleWalls[i];
			const w = rect.x2 - rect.x1 + 1;
			const h = rect.y2 - rect.y1 + 1;

			const wall = new Wall(rect.x1 + w / 2, rect.y1 + h / 2, w, h, true);
			this.#level.add(wall.model);
			this.collisionObjects.push(wall);
		}

		// Get walls
		const walls = this.getRectangles(WALL);
		for (let i = 0; i < walls.length; i++) {
			const rect = walls[i];
			const w = rect.x2 - rect.x1 + 1;
			const h = rect.y2 - rect.y1 + 1;
			
			const wall = new Wall(rect.x1 + w / 2, rect.y1 + h / 2, w, h);
			this.#level.add(wall.model);
			this.collisionObjects.push(wall);
			this.cameraCollisionObjects.push(wall.model)
		}

		// Get floor
		const floors = this.getRectangles(FLOOR);
		for (let i = 0; i < floors.length; i++) {
			const rect = floors[i];
			const w = rect.x2 - rect.x1 + 1;
			const h = rect.y2 - rect.y1 + 1;
			
			const floor = new Floor(rect.x1 + w / 2, rect.y1 + h / 2, w, h);
			this.#level.add(floor.model);
			this.collisionObjects.push(floor);
			this.cameraCollisionObjects.push(floor.model)
		}
	}

	/** Will find rectangles in a matrix/2d array */
	static getRectangles(tileID) {
		let map = this.#levelGenData;
		// for (var i = 0; i < this.#levelGenData.length; i++)
		// 	map[i] = this.#levelGenData[i].slice();

		let rectangles = [];

		const WIDTH = map.length;
		const HEIGHT = map[0].length;

		const findLargestRect = () => {
			let x = 0;
			let y = 0;
			
			// let mapCopy = [];
			// for (var i = 0; i < map.length; i++)
			// 	mapCopy[i] = map[i].slice();

			let biggestRect = {area: 0};

			while (this.containsTile(map, tileID)){
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
							break;;
						}
					}

					if (rect.area > biggestRect.area){
						biggestRect = rect;
					}
				}
			}

			return biggestRect;
		};

		while (this.containsTile(map, tileID)) {
			const largestRect = findLargestRect();

			rectangles.push(largestRect);

			let newTile;
			
			switch (tileID){
				case FLOOR:
					newTile = NONE;
					break;
				case INVIS_WALL:
					newTile = WATER;
					break;
				case WALL:
					newTile = FLOOR;
					break;
				default:
					newTile = FLOOR;
					break;
			}

			// Remove rectangle from map so it doesn't get found again
			for (let y = largestRect.y1; y <= largestRect.y2; y++) {
				for (let x = largestRect.x1; x <= largestRect.x2; x++) {
					map[x][y] = newTile;
				}
			}
		}
		return rectangles;
	}

	static containsTile(map, tileID) {
		// console.log("Checking for walls");
		for (let x = 0; x < map.length; x++) {
			if (map[x].includes(tileID)) return true;
		}
		return false;
	}

	static addToLevel(obj) {
		this.#level.add(obj);
	}

	static initLevelData(n) {
		let array = [];
		for (let i = 0; i < n; i++) {
			array[i] = [];
		}
		return array;
	}

	static addHelpers() {
		for (let i = 0; i < this.collisionObjects.length; i++) {
			let helper = new THREE.Box3Helper(
				this.collisionObjects[i].boundingBox,
				0xff0000
			);

			this.#level.add(helper);
		}
	}
}

const equals = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]); // Compares 2 objects
