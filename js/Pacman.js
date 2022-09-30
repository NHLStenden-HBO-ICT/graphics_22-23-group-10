import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "../node_modules/three/build/three.module.js";
import { Ai } from "./AI.js";
import { Level } from "./Level.js";

export class Pacman extends Ai {
	//add code for pacman (movement related, model, animation)

	pacmanLoaded = new Event("pacmanLoaded");

	#MODELPATH = "../models/Duck.glb";
	#PacmanModel;

	#ready = false;
	#walkVelocity = 8;
	#walkDirection = new THREE.Vector3();
	#rotateAngle = new THREE.Vector3(0, 1, 0);
	#rotateQuaternion = new THREE.Quaternion();

	get getPacmanModel() {
		return this.#PacmanModel;
	}

	constructor() {
		super();
		this._loadPacman();
	}

	_loadPacman() {
		let self = this;
		new GLTFLoader().load(this.#MODELPATH, function (model) {
			const mesh = model.scene;
			mesh.position.x = Level.getPacmanSpawn.x;
			mesh.position.z = Level.getPacmanSpawn.z;
			self.#PacmanModel = mesh;

			mesh.scale.set(1, 1, 1); // TEMPORARY

			mesh.traverse(function (obj) {
				if (obj.isMesh) {
					obj.castShadow = true;
					obj.receiveShadow = true;
				}
			});

			self.#ready = true;
			dispatchEvent(self.pacmanLoaded);
		});
	}

	update(delta, playerPos) {
		this._movePacman(delta, playerPos);
	}

	_movePacman(delta, playerPos) {
		if (!this.#ready) {
			return;
		}
		//console.log(this.#PacmanModel.position);

		// direction to player in radians
		let p1 = playerPos;
		let p2 = this.#PacmanModel.position;
		let directionAngle = Math.atan2(p1.x - p2.x, p1.z - p2.z);

		// Rotate pacman
		this.#rotateQuaternion.setFromAxisAngle(
			this.#rotateAngle,
			directionAngle + Math.PI * -0.5
		);

		// console.log(this.#playerModel.quaternion);
		this.#PacmanModel.quaternion.rotateTowards(this.#rotateQuaternion, 0.2);

		// Calculate direction
		let p11 = playerPos;
		let p22 = this.#PacmanModel.position;
		this.#walkDirection = new THREE.Vector3(p11.x - p22.x, 0, p11.z - p22.z);
		this.#walkDirection.normalize();
		this.#rotateAngle.normalize();
		// console.log(this.#walkDirection);

		const velocity = this.#walkVelocity;

		const SF = Level.getScaleFactor;

		const pacmanPos = new THREE.Vector3(
			this.#PacmanModel.position.x / SF,
			0,
			this.#PacmanModel.position.z / SF
		);

		const ghostPos = new THREE.Vector3(playerPos.x / SF, 0, playerPos.z / SF);

		let path = this.getPath(pacmanPos.round(), ghostPos.round());
		if (path.length == 0) {
			return;
		}

		const nextPos = new THREE.Vector3(path[0].x, 0, path[0].y);

		if (this.isPositionReached(pacmanPos, nextPos)) {
			console.log("Position reached");
			// path.shift()
		}

		const dir = new THREE.Vector3(
			nextPos.x - this.#PacmanModel.position.x / SF,
			0,
			nextPos.z - this.#PacmanModel.position.z / SF
		).normalize();
		// console.log(this.#PacmanModel.position);

		const moveX = dir.x * velocity * delta;
		const moveZ = dir.z * velocity * delta;
		// const moveX = 0;
		// const moveZ = 0;
		this.#PacmanModel.position.x += moveX;
		this.#PacmanModel.position.z += moveZ;
	}
}
