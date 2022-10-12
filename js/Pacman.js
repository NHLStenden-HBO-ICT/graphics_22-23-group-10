import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "../node_modules/three/build/three.module.js";
import { Ai } from "./AI.js";
import { Level } from "./Level.js";

export class Pacman extends Ai {
	//add code for pacman (movement related, model, animation)

	pacmanLoaded = new Event("pacmanLoaded");

	#MODELPATH = "../models/pacmanEvil.glb";

	#walkVelocity = 8;
	#walkDirection = new THREE.Vector3();
	#rotateAngle = new THREE.Vector3(0, 1, 0);
	#rotateQuaternion = new THREE.Quaternion();

	mixer;

	get getPacmanModel() {
		return this.model;
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
			mesh.position.y = 3;
			mesh.position.z = Level.getPacmanSpawn.z;
			self.model = mesh;

			mesh.scale.set(3, 3, 3);

			mesh.traverse(function (obj) {
				if (obj.isMesh) {
					obj.castShadow = true;
					obj.receiveShadow = true;
				}
			});

			// animation related
			self.mixer = new THREE.AnimationMixer(mesh);
			const clips = model.animations;
			const clip = THREE.AnimationClip.findByName(clips, "Walk.002");
			const action = self.mixer.clipAction(clip);
			action.play();

			self.ready = true;
			dispatchEvent(self.pacmanLoaded);
		});
	}

	update(delta, playerPos) {
		if (!this.ready) {
			return;
		}

		// this._movePacman(delta, playerPos);

		// update animations
		this.mixer.update(delta);
	}

	_movePacman(delta, playerPos) {
		// Calculate direction
		let p11 = playerPos;
		let p22 = this.model.position;
		this.#walkDirection = new THREE.Vector3(p11.x - p22.x, 0, p11.z - p22.z);
		this.#walkDirection.normalize();
		this.#rotateAngle.normalize();

		const velocity = this.#walkVelocity;

		const SF = Level.getScaleFactor;

		const pacmanPos = new THREE.Vector3(
			this.model.position.x / SF,
			0,
			this.model.position.z / SF
		);

		const ghostPos = new THREE.Vector3(playerPos.x / SF, 0, playerPos.z / SF);

		let path = this.getPath(pacmanPos.round(), ghostPos.round());
		if (path.length == 0) {
			return;
		}

		const nextPos = new THREE.Vector3(path[0].x, 0, path[0].y);

		const dir = new THREE.Vector3(
			nextPos.x - this.model.position.x / SF,
			0,
			nextPos.z - this.model.position.z / SF
		).normalize();

		let directionAngle = Math.atan2(dir.x, dir.z); // Get angle to next point

		// Rotate pacman
		this.#rotateQuaternion.setFromAxisAngle(this.#rotateAngle, directionAngle);

		this.model.quaternion.rotateTowards(this.#rotateQuaternion, 0.2);

		const movementVector = new THREE.Vector3(
			dir.x * velocity * delta,
			0,
			dir.z * velocity * delta
		);

		this.move(movementVector);
	}
}
