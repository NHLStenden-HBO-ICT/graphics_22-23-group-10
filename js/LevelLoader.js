import * as THREE from "../node_modules/three/build/three.module.js";

const LEVELFOLDER = "../levels/";

const FLOOR = 0;
const WALL = 1;

const SCALE_FACTOR = 5;

export class LevelLoader {
	static #levelData;
	static level = new THREE.Object3D();
	static isLevelLoaded = false;
	static levelLoaded = new Event("levelLoaded");

	get getLevelData() {
		if (this.isLevelLoaded) return this.#levelData;
		else return [];
	}

	static load(levelName, add) {
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
						// Black
						tile = WALL;
						const wall = createWall(x, y);
						this.level.add(wall);
					} else if (equals(data, [255, 255, 255, 255])) {
						// White
						tile = FLOOR;
					} else if (equals(data, [255, 0, 0, 255])) {
						// Red
						tile = FLOOR;
						// set spawpoint
					}

					this.#levelData[x][y] = tile;
				}
			}
			this.isLevelLoaded = true;
			dispatchEvent(this.levelLoaded);
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
		new THREE.BoxGeometry(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR),
		new THREE.MeshPhongMaterial()
	);
	wall.receiveShadow = true;
	wall.castShadow = true;
	wall.position.x = x * SCALE_FACTOR;
	wall.position.z = y * SCALE_FACTOR;
	return wall;
}
