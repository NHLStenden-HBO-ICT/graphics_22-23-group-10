import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "../node_modules/three/build/three.module.js";
import { Level } from "./Level.js";
import { DynamicBody } from "./CollisionSystem/DynamicBody.js";
import { Camera } from "./Camera.js";
import { loadShader } from "./ShaderLoader.js";

export class Player extends DynamicBody {
	Actions = Object.freeze({
		IDLE: Symbol(0),
		WALK: Symbol(1),
		RUN: Symbol(2),
	});

	playerLoaded = new Event("playerLoaded");

	#MODELPATH = "../models/ghost.glb";

	#walkVelocity = 30;
	#runVelocity = 12;
	#runCost = 0.5;
	#stamina = 100;

	ready = false;
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

	camera;

	lamp;
	eye;

	get getModel() {
		return this.model;
	}

	get getCameraBase() {
		return this.camera.rotY;
	}

	get getStaminaLevel() {
		return this.#stamina;
	}

	constructor() {
		super();
		this._loadPlayer();
		this._initListeners();
	}

	update(delta, timeElapsed, sunIntensity) {
		if (!this.ready) {
			return;
		}

		this._movePlayer(delta);
		this.camera.update(delta, this.getPosition);

		this.updateShader(timeElapsed);

		this.updateLamp(sunIntensity);
	}

	updateLamp(sunIntensity) {
		this.lamp.intensity = 1 - sunIntensity;

		const bloomIntensity = 1 - sunIntensity;
		this.eye.material.emissiveIntensity = bloomIntensity * 3;
	}

	updateShader(timeElapsed) {
		this.model.children[0].material.uniforms.u_time.value = timeElapsed;
	}

	_movePlayer(delta) {
		const directionPressed = this.DIRECTIONS.some(
			(key) => this.#keysPressed[key] == true
		);

		this.#currentAction = this.Actions.IDLE;

		// Set state
		if (directionPressed) {
			this.#currentAction = this.Actions.WALK;
		}
		if (this.#keysPressed.shift && directionPressed) {
			if (this.#stamina <= 0) this.#stamina = 0;
			else {
				this.#stamina -= this.#runCost;
				this.#currentAction = this.Actions.RUN;
			}
		} else {
			this.#stamina += this.#runCost;
			if (this.#stamina >= 100) this.#stamina = 100;
		}

		if (this.#currentAction != this.Actions.IDLE) {
			// Calculate camera direction vector
			this.camera.getWorldDirection(this.#walkDirection);

			// Calculate what direction player wants to go
			let directionOffset = this.directionOffset(this.#keysPressed);

			// Calculate camera direction angle
			let cameraDirection = Math.atan2(
				this.#walkDirection.x,
				this.#walkDirection.z
			);

			// Rotate player
			this.#rotateQuaternion.setFromAxisAngle(
				this.#rotateAngle,
				cameraDirection + directionOffset + Math.PI
			);
			this.model.quaternion.rotateTowards(this.#rotateQuaternion, 6 * delta);

			// Calculate walk direction based on input and camera angle
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
			const movementVector = new THREE.Vector3(
				this.#walkDirection.x * velocity * delta,
				0,
				this.#walkDirection.z * velocity * delta
			);
			this.moveAndCollide(movementVector, this.camera);
		}
	}

	_initCamera() {
		this.camera = new Camera(this.getPosition);
	}

	_loadPlayer() {
		let self = this;
		new GLTFLoader().load(this.#MODELPATH, function (model) {
			const mesh = model.scene;
			mesh.position.x = Level.getPlayerSpawn.x;
			mesh.position.z = Level.getPlayerSpawn.z;
			self.model = mesh;

			loadShader("ghost", shaderLoaded);

			function shaderLoaded(material) {
				material.transparent = true;
				material.lights = true;
				let lightTarget;
				mesh.traverse(function (obj) {
					if (obj.isMesh) {
						if (obj.name == "Ghost") {
							obj.castShadow = true;
							obj.receiveShadow = true;
							obj.material = material;
							self.calculateExtents(obj.geometry);
						}
					}
					if (obj.name == "LampPoint") {
						let light = new THREE.SpotLight(0xfcd08d);
						light.layers.enable(1);
						light.castShadow = true;
						light.angle = Math.PI / 6;
						light.distance = 50;
						light.position.set(0, 0, 0);
						light.intensity = 1.2;
						light.decay = 1;
						light.penumbra = 0.4;
						light.shadow.bias = -0.0001;

						self.lamp = light;
						obj.add(self.lamp);
					}
					if (obj.name == "LightTarget") {
						lightTarget = obj;
					}
					if (obj.name == "Eye") {
						obj.material.emissiveIntensity = 0;
						self.eye = obj;
					}
				});
				self.lamp.target = lightTarget;

				self.ready = true;
				self._initCamera();
				dispatchEvent(self.playerLoaded);
			}
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
