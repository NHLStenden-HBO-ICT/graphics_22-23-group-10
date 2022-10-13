import * as THREE from "../node_modules/three/build/three.module.js";
import { Wall } from "./Wall.js";

const LEVELFOLDER = "../levels/";

const FLOOR = 1;
const WALL = 0;

const SCALE_FACTOR = 5;

export class Level {
	static #levelDataAi;
	static #levelGenData;
	static #level = new THREE.Object3D();
	static #isLevelLoaded = false;
	static #playerSpawn = new THREE.Vector3();
	static #pacmanSpawn = new THREE.Vector3();
	static collidableObjects = [];

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

	static load(levelName) {
		const level = LEVELFOLDER + levelName + ".png";

		let canvas = document.createElement("canvas");
		let context = canvas.getContext("2d");

		let img = new Image();
		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;

			this.#levelDataAi = this.initLevelData(img.width);
			this.#levelGenData = this.initLevelData(img.width);

			context.drawImage(img, 0, 0);
			// console.log(img.width, img.height, canvas.width, canvas.height);
			for (let y = 0; y < canvas.height; y++) {
				for (let x = 0; x < canvas.width; x++) {
					let data = context.getImageData(x, y, 1, 1).data;

					let tile;

					if (equals(data, [0, 0, 0, 255])) {
						// BLACK | Wall
						tile = WALL;
						const wall = new Wall(x, y);
						this.#level.add(wall.model);
					} else if (equals(data, [255, 255, 255, 255])) {
						// WHITE | Floor
						tile = FLOOR;
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
					}

					switch (tile) {
						case DEAD_SPACE:
							this.#levelDataAi[x][y] = WALL;
							this.#levelGenData[x][y] = FLOOR;
							break;
						case INVIS_WALL:
							this.#levelDataAi[x][y] = WALL;
							this.#levelGenData[x][y] = INVIS_WALL;
						default:
							this.#levelDataAi[x][y] = tile;
							this.#levelGenData[x][y] = tile;
							break;
					}
				}
			}

			// Add a ground
			const floorWidth = img.width * SCALE_FACTOR;
			const floorHeight = 0.1;
			const floorDepth = img.height * SCALE_FACTOR;

			// Create mesh
			const floor = new THREE.Mesh(
				new THREE.BoxGeometry(floorWidth, floorHeight, floorDepth, 1, 1),
				new THREE.MeshPhongMaterial({
					color: 0x336600,
				})
			);

			// Position mesh correctly
			floor.position.x = floorDepth / 2 - SCALE_FACTOR / 2;
			floor.position.y = -floorHeight;
			floor.position.z = floorWidth / 2 - SCALE_FACTOR / 2;

			floor.receiveShadow = true;
			this.#level.add(floor);

			this.#isLevelLoaded = true;
			dispatchEvent(this.levelLoaded);

			canvas.remove();
			// console.log(this.collidableObjects);
		};

		img.src = level;
	}

	static addToLevel(obj) {
		this.#level.add(obj);
	}

	static setCollisionList() {
		for (let i = 0; i < this.collisionObjects.length; i++) {
			this.cameraCollisionObjects.push(this.collisionObjects[i].model);
		}
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

	/** Will find rectangles in a matrix/2d array */
	static createWalls() {
		let map = this.#levelGenData;

		const WIDTH = map.length;
		const HEIGHT = map[0].length;

		const findLargestRect = (x, y) => {
			const rect = {
				x1: x,
				y1: y,
				x2: WIDTH - 1,
				y2: HEIGHT - 1,
				area: 0,
				invisible: false,
			};

			if (map[x][y] == FLOOR) {
				// Tile is a floor
				x += 1;
				if (x == WIDTH) {
					// Reached the right edge of the map
					x = 0;
					y += 1;

					if (y == HEIGHT) {
						// Reached the bottom right, thus the end of the loop
						return null;
					}
				}
				return findLargestRect(x, y);
			}

			if (map[x][y] == WALL) {
				// Tile is a wall, so we get the biggest rectangle possible from this location

				// Find bottom right corner
				// First we find largest possible X value
				for (let x = rect.x1; x < WIDTH; x++) {
					if (map[x][rect.y1] != WALL) {
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
						if (map[x][y] != WALL) {
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
						return null;
					}
				}

				const nextRect = findLargestRect(x, y);
				if (nextRect == null) return rect;
				if (nextRect.area > rect.area) {
					return nextRect;
				}
				return rect;
			}
		};

		while (this.containsWalls(map)) {
			const largestRect = findLargestRect(0, 0);

			// Remove rectangle from map so it doesn't get found again
			for (let y = largestRect.y1; y <= largestRect.y2; y++) {
				for (let x = largestRect.x1; x <= largestRect.x2; x++) {
					map[x][y] = FLOOR;
				}
			}

			const w = largestRect.x2 - largestRect.x1 + 1;
			const h = largestRect.y2 - largestRect.y1 + 1;
			const wall = new Wall(
				largestRect.x1 + w / 2,
				largestRect.y1 + h / 2,
				w,
				h
			);
			this.#level.add(wall.model);
			this.collisionObjects.push(wall);
		}
	}

	static containsWalls(map) {
		// console.log("Checking for walls");
		for (let x = 0; x < map.length; x++) {
			if (map[x].includes(WALL)) return true;
		}
		return false;
	}
}

const equals = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]); // Compares 2 objects

function createWall(x, y) {
	let wall = new THREE.Mesh(
		new THREE.BoxGeometry(SCALE_FACTOR, SCALE_FACTOR * 0.1, SCALE_FACTOR),
		new THREE.MeshPhongMaterial()
	);
	wall.receiveShadow = true;
	wall.castShadow = true;
	wall.position.x = x * SCALE_FACTOR;
	wall.position.y = 0;
	wall.position.z = y * SCALE_FACTOR;
	return wall;
}
