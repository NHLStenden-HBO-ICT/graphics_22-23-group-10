import * as THREE from "../../node_modules/three/build/three.module.js";

export class Collision {
	model;
	boundingBox;

	ready = false;

	get isReady() {
		return this.ready;
	}

	constructor(pos) {
		// this.#position.x = pos.x;
		// this.#position.z = pos.z;
	}
}
