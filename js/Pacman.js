import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "../node_modules/three/build/three.module.js";
import { Ai } from "./AI.js";

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

            self.#PacmanModel.position.x = 2;
            self.#PacmanModel.position.z = 1;
		});
	}

    update(delta, playerPos){
        this._movePacman(delta, playerPos);
    }

    _movePacman(delta, playerPos){
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
            directionAngle
        );

        // console.log(this.#playerModel.quaternion);
        this.#PacmanModel.quaternion.rotateTowards(this.#rotateQuaternion, 0.2);

        // Calculate direction
        let p11 = playerPos;
        let p22 = this.#PacmanModel.position;
        this.#walkDirection = new THREE.Vector3(p11.x - p22.x, 0, p11.z - p22.z);
        this.#walkDirection.normalize();
        this.#rotateAngle.normalize();
        console.log(this.#walkDirection);

        let velocity = this.#walkVelocity;

        // Move pacman
        const moveX = this.#walkDirection.x * velocity * delta;
        const moveZ = this.#walkDirection.z * velocity * delta;
        this.#PacmanModel.position.x += moveX;
        this.#PacmanModel.position.z += moveZ;
    }
}