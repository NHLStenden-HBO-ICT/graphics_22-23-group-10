import * as THREE from "../node_modules/three/build/three.module.js";

const LEVELFOLDER = "../levels/";

const FLOOR = 1;
const WALL = 0;

const SCALE_FACTOR = 5;

export class Level {
	static #levelData;
	static #level = new THREE.Object3D();
	static #isLevelLoaded = false;
	static #playerSpawn = new THREE.Vector3();
	static #pacmanSpawn = new THREE.Vector3();

	static levelLoaded = new Event("levelLoaded");

	static get getLevelData() {
		if (this.#isLevelLoaded) return this.#levelData;
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

			this.#levelData = initLevelData(img.width);

			context.drawImage(img, 0, 0);
			// console.log(img.width, img.height, canvas.width, canvas.height);
			for (let y = 0; y < canvas.height; y++) {
				for (let x = 0; x < canvas.width; x++) {
					let data = context.getImageData(x, y, 1, 1).data;

					let tile;

					if (equals(data, [0, 0, 0, 255])) {
						// BLACK | Wall
						tile = WALL;
						const wall = createWall(x, y);
						this.#level.add(wall);
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

					this.#levelData[x][y] = tile;
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
		};

		img.src = level;
	}
}

function initLevelData(n) {
	let array = [];
	for (let i = 0; i < n; i++) {
		array[i] = [];
	}
	return array;
}

const equals = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]); // Compares 2 objects

function createWall(x, y) {
	let wall = new THREE.Mesh(
		new THREE.BoxGeometry(SCALE_FACTOR, SCALE_FACTOR * 2, SCALE_FACTOR),
		new THREE.MeshPhongMaterial()
	);
	wall.receiveShadow = true;
	wall.castShadow = true;
	wall.position.x = x * SCALE_FACTOR;
	wall.position.y = SCALE_FACTOR;
	wall.position.z = y * SCALE_FACTOR;
	return wall;
}
