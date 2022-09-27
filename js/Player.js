import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "../node_modules/three/build/three.module.js";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "../node_modules/three/examples/jsm/controls/PointerLockControls.js";
import { Level } from "./Level.js";

export class Player {
	Actions = Object.freeze({
		IDLE: Symbol(0),
		WALK: Symbol(1),
		RUN: Symbol(2),
	});

	playerLoaded = new Event("playerLoaded");

	#MODELPATH = "../models/ghost.gltf";

	#walkVelocity = 6;
	#runVelocity = 50;

	#ready = false;
	#currentAction = this.Actions.IDLE;
	#walkDirection = new THREE.Vector3();
	#rotateAngle = new THREE.Vector3(0, 1, 0);
	#rotateQuaternion = new THREE.Quaternion();

	#keysPressed = { w: false, a: false, s: false, d: false, shift: false };
	W = "w";
	A = "a";
	S = "s";
	D = "d";
	SHIFT = "shift";
	DIRECTIONS = [this.W, this.A, this.S, this.D];

	#playerModel;
	camera;
	#orbitControls;
	// #lockControls;

	get getPlayerModel() {
		return this.#playerModel;
	}

	get isReady() {
		return this.#ready;
	}

	constructor(rendererDomElement) {
		this._loadPlayer(rendererDomElement);
		this._initListeners();
	}

	setPosition(x, y, z) {
		this.#playerModel.position.set(x, y, z);
	}

	update(delta) {
		this._movePlayer(delta);
	}

	_movePlayer(delta) {
		if (!this.#ready) {
			return;
		}

		const directionPressed = this.DIRECTIONS.some(
			(key) => this.#keysPressed[key] == true
		);

		this.#currentAction = this.Actions.IDLE;

		// Set state
		if (directionPressed) {
			this.#currentAction = this.Actions.WALK;
		}
		if (this.#keysPressed.shift) {
			this.#currentAction = this.Actions.RUN;
		}

		if (this.#currentAction != this.Actions.IDLE) {
			// Calculate camera direction
			let cameraDirection = Math.atan2(
				this.camera.position.x - this.#playerModel.position.x,
				this.camera.position.z - this.#playerModel.position.z
			);

			// console.log(cameraDirection);

			// Diagonal movement offset
			let directionOffset = this.directionOffset(this.#keysPressed);

			// Rotate player
			this.#rotateQuaternion.setFromAxisAngle(
				this.#rotateAngle,
				cameraDirection + directionOffset
			);
			// console.log(this.#playerModel.quaternion);
			this.#playerModel.quaternion.rotateTowards(this.#rotateQuaternion, 0.2);

			// Calculate direction
			this.camera.getWorldDirection(this.#walkDirection);
			this.#walkDirection.y = 0;
			this.#walkDirection.normalize();
			this.#walkDirection.applyAxisAngle(this.#rotateAngle, directionOffset);

			// Set velocity
			let velocity;
			switch (this.#currentAction) {
				case this.Actions.WALK:
					velocity = this.#walkVelocity;
					break;
				case this.Actions.RUN:
					velocity = this.#runVelocity;
					break;
			}

			// Move player
			const moveX = this.#walkDirection.x * velocity * delta;
			const moveZ = this.#walkDirection.z * velocity * delta;
			this.#playerModel.position.x += moveX;
			this.#playerModel.position.z += moveZ;

			// Move camera
			this._updateCamera(moveX, moveZ);
		}
	}

	_updateCamera(moveX, moveZ) {
		this.camera.position.x += moveX;
		this.camera.position.z += moveZ;
		this.#orbitControls.target = this.#playerModel.position;
	}

	_initCamera(rendererDomElement) {
		const fov = 80;
		const aspect = 2;
		const near = 0.1;
		const far = 1500.0;
		this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

		this.camera.position.y = 15;

		// console.log(Level.getPlayerSpawn);

		this.#orbitControls = new OrbitControls(this.camera, rendererDomElement);
		this.#orbitControls.enableDamping = true;
		this.#orbitControls.dampingFactor = 0.9;
		this.#orbitControls.enablePan = false;
		this.#orbitControls.enableZoom = false;

		let pos = Level.getPlayerSpawn;
		this._updateCamera(pos.x, pos.z);

		// this.#lockControls = new PointerLockControls(this.camera, document.body);
	}

	_loadPlayer(rendererDomElement) {
		let self = this;
		new GLTFLoader().load(this.#MODELPATH, function (model) {
			const mesh = model.scene;
			mesh.position.x = Level.getPlayerSpawn.x;
			mesh.position.z = Level.getPlayerSpawn.z;
			self.#playerModel = mesh;

			mesh.scale.set(0.1, 0.1, 0.1); // TEMPORARY

			mesh.traverse(function (obj) {
				if (obj.isMesh) {
					obj.castShadow = true;
					obj.receiveShadow = true;
				}
			});

			self.#ready = true;
			self._initCamera(rendererDomElement);
			dispatchEvent(self.playerLoaded);
		});
	}

	_initListeners() {
		document.addEventListener(
			"keydown",
			(event) => {
				this.#keysPressed[event.key.toLowerCase()] = true;
			},
			false
		);
		document.addEventListener(
			"keyup",
			(event) => {
				this.#keysPressed[event.key.toLowerCase()] = false;
			},
			false
		);
	}

	directionOffset(keysPressed) {
		// Get direction vector
		let dir = new THREE.Vector2(
			keysPressed.a - keysPressed.d,
			keysPressed.w - keysPressed.s
		);

		// Convert to radians
		let directionOffset = Math.atan2(dir.x, dir.y);

		return directionOffset;
	}
}
