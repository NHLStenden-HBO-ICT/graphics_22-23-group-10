import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "../node_modules/three/build/three.module.js";
import { Ai } from "./AI.js";
import { Level } from "./Level.js";
import { PacmanStatemachine } from "./PacmanStatemachine.js";

export class Pacman extends Ai {
	pacmanLoaded = new Event("pacmanLoaded");

	#MODELPATH = "models/pacmanEvil3.glb";

	#walkVelocity = 25;
	#walkDirection = new THREE.Vector3();
	#rotateAngle = new THREE.Vector3(0, 1, 0);
	#rotateQuaternion = new THREE.Quaternion();

	mixer;

	teethObjectModel;
	bodyObjectModel;

	dayTimeMaterial = new THREE.MeshPhongMaterial({
		color: 0xffe100,
		opacity: 1,
	});
	nightTimeMaterial = new THREE.MeshPhongMaterial({
		color: 0xf20505,
		opacity: 1,
	});

	get getPacmanModel() {
		return this.model;
	}

	get getCycle() {
		return this.pacmanState.getCycleState();
	}

	constructor(playerModel) {
		super(playerModel);
		this._loadPacman();

		// Keeps track of day/night cycle
		addEventListener(
			"switchCycle",
			() => {
				this.teethObjectModel.visible = !this.teethObjectModel.visible;

				if (this.bodyObjectModel.material == this.dayTimeMaterial) {
					this.bodyObjectModel.material = this.nightTimeMaterial;
				} else this.bodyObjectModel.material = this.dayTimeMaterial;
			},
			false
		);
	}

	/**
	 * Loads the pacman model
	 */
	_loadPacman() {
		let self = this;
		new GLTFLoader().load(this.#MODELPATH, function (model) {
			const mesh = model.scene;

			mesh.position.x = Level.getPacmanSpawn.x;
			mesh.position.y = 3;
			mesh.position.z = Level.getPacmanSpawn.z;
			self.model = mesh;

			mesh.scale.set(6, 6, 6);

			mesh.traverse(function (obj) {
				if (obj.isMesh) {
					obj.castShadow = true;
					obj.receiveShadow = true;

					if (obj.name == "Sphere001") {
						self.teethObjectModel = obj;
						self.teethObjectModel.visible = false;

						// add red glow
						const light = new THREE.PointLight(0xff0000, 1, 100);
						light.position.set(0, mesh.position.y, 0);
						light.castShadow = true;
						obj.add(light);
					}
					if (obj.name == "BODY") {
						self.bodyObjectModel = obj;
						self.bodyObjectModel.material = self.dayTimeMaterial;
					}
				}
			});

			// Animations
			self.mixer = new THREE.AnimationMixer(mesh);
			const clips = model.animations;
			const clip = THREE.AnimationClip.findByName(clips, "walk strong big");
			const action = self.mixer.clipAction(clip);
			action.play();

			self.ready = true;
			dispatchEvent(self.pacmanLoaded);
		});
	}

	/**
	 * Gets called every frame update
	 * @param {*} delta 
	 * @param {*} playerPos 
	 * @param {*} playerModel 
	 */
	update(delta, playerPos, playerModel) {
		this._movePacman(delta, playerPos, playerModel);
		this.checkCoinPacmanCollision();

		// State switching cooldown
		this.switchCD += delta;

		// update animations
		this.mixer.update(delta);
	}

	/**
	 * Handles pacman movement
	 * @param {*} delta 
	 * @param {*} playerPos 
	 * @param {*} playerModel 
	 * @returns 
	 */
	_movePacman(delta, playerPos, playerModel) {
		// Calculate direction
		let p11 = playerPos;
		let p22 = this.model.position;
		this.#walkDirection = new THREE.Vector3(p11.x - p22.x, 0, p11.z - p22.z);
		this.#walkDirection.normalize();
		this.#rotateAngle.normalize();

		let velocity = this.#walkVelocity;
		if (this.pacmanState.getCycleState == PacmanStatemachine.Cycles.DAY) {
			velocity = this.#walkVelocity;
		} else {
			velocity = this.#walkVelocity / 1.2;
		}

		const SF = Level.getScaleFactor;

		const pacmanPos = new THREE.Vector3(
			this.model.position.x / SF,
			0,
			this.model.position.z / SF
		);

		const ghostPos = new THREE.Vector3(playerPos.x / SF, 0, playerPos.z / SF);

		let path = [];

		path = this.getPath(pacmanPos.round(), ghostPos.round(), playerModel);

		// when there is no specified path, move to random point
		if (path.length == 0) {
			this.hasDestination = false;
			return;
		}

		const nextPos = new THREE.Vector3(path[0].x, 0, path[0].y);

		const dir = new THREE.Vector3(
			nextPos.x - this.model.position.x / SF,
			0,
			nextPos.z - this.model.position.z / SF
		).normalize();

		// Get angle to next point
		let directionAngle = Math.atan2(dir.x, dir.z);

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

	/**
	 * Checks if pacman collides with the targeted coin
	 */
	checkCoinPacmanCollision() {
		if (this.closestCoin == null) {
			return;
		}
		if (this.closestCoin.boundingBox.intersectsBox(this.boundingBox)) {
			let index = Level.coins.indexOf(this.closestCoin);
			if (index > -1) {
				Level.coins.splice(index, 1);
				Level.remove(this.closestCoin.model);
				this.closestCoin = null;
			}
		}
	}
}
