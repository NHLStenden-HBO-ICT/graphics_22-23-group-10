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
	#walkVelocity = 6;
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

			mesh.scale.set(5, 5, 5); // TEMPORARY

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
		this.#rotateQuaternion.setFromAxisAngle(this.#rotateAngle, directionAngle + Math.PI * -0.5);

		// console.log(this.#playerModel.quaternion);
		this.#PacmanModel.quaternion.rotateTowards(this.#rotateQuaternion, 0.2);

		// Calculate direction
		let p11 = playerPos;
		let p22 = this.#PacmanModel.position;
		this.#walkDirection = new THREE.Vector3(p11.x - p22.x, 0, p11.z - p22.z);
		this.#walkDirection.normalize();
		this.#rotateAngle.normalize();
		// console.log(this.#walkDirection);

		let velocity = this.#walkVelocity;

		// Move pacman
		// const moveX1 = this.#walkDirection.x * velocity * delta;
		// const moveZ1 = this.#walkDirection.z * velocity * delta;
		// this.#PacmanModel.position.x += moveX1;
		// this.#PacmanModel.position.z += moveZ1;
        
		const ScaleF = Level.getScaleFactor;

		// position of the pacman object
		// let pacmanPos = new THREE.Vector3();
		// pacmanPos.copy(this.#PacmanModel.position);
		let pacmanPos = this.#PacmanModel.position;
		
		// scale player and pacman acording to real coordinates
		pacmanPos = new THREE.Vector3(pacmanPos.x / ScaleF, 0, pacmanPos.z / ScaleF)
		playerPos = new THREE.Vector3(playerPos.x / ScaleF, 0, playerPos.z / ScaleF)

		// returns current path from pacman to player in gridnodes
        let result = this.pathfinding(pacmanPos, playerPos);
		console.log(result.length)

		if (result.length == 0){
			return;
		}

		let nextNode = result[0];
		let nodeVector = new THREE.Vector3(nextNode.x, 0, nextNode.y);
		//console.log(nodeVector);

		let dir = new THREE.Vector3(nodeVector.x - pacmanPos.x, 0, nodeVector.z - pacmanPos.z)
		dir.normalize();
		//let dir = nodeVector.sub(pacmanPos).normalize();
		
		// check if pacman has reached a node 
		if(this.isPositionReached(this.#PacmanModel.position, nodeVector)){
			console.log("Position reached");
			result.shift();
		}
		this.#PacmanModel.position.divideScalar(ScaleF);
		console.log("Pacman pos", this.#PacmanModel.position)
		
		console.log("Direcion", dir);
		const moveX = dir.x * velocity * delta;
		const moveZ = dir.z * velocity * delta;
		this.#PacmanModel.position.x += moveX;
		this.#PacmanModel.position.z += moveZ;
	}
}
