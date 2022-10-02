import * as THREE from "../../node_modules/three/build/three.module.js";

export class Collision {
	ready = false;
	model;
	#size = new THREE.Vector3();
	boundingBox = new THREE.Box3();

	get size() {
		return this.#size;
	}

	get isReady() {
		return this.ready;
	}

	get getPosition() {
		if (this.ready) return this.model.position;
		else return new THREE.Vector3(0, 0, 0);
	}

	constructor() {}

	calculateExtents(geometry) {
		geometry.computeBoundingBox();
		geometry.boundingBox.getSize(this.#size);
	}
}
