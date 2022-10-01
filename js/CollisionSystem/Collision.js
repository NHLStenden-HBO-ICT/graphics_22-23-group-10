import * as THREE from "../../node_modules/three/build/three.module.js";

export class Collision {
	model;
	#size = new THREE.Vector3();

	get size() {
		return this.#size;
	}

	ready = false;

	get isReady() {
		return this.ready;
	}

	constructor() {}

	setBoundingBox(geometry) {
		geometry.computeBoundingBox();
		geometry.boundingBox.getSize(this.#size);
	}
}
