import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { Ai } from "./AI.js";

export class Pacman extends Ai {
    //add code for pacman (movement related, model, animation)

    pacmanLoaded = new Event("pacmanLoaded");
    #ready = false;

    #MODELPATH = "../models/ghost.gltf";
    #PacmanModel;
    

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

			mesh.scale.set(0.1, 0.1, 0.1); // TEMPORARY

			mesh.traverse(function (obj) {
				if (obj.isMesh) {
					obj.castShadow = true;
					obj.receiveShadow = true;
				}
			});

			self.#ready = true;
			dispatchEvent(self.pacmanLoaded);

            self.#PacmanModel.position.x = 20;
            self.#PacmanModel.position.z = 10;
		});
	}
}