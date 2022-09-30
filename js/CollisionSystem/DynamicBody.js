import { Collision } from "./Collision.js";

export class DynamicBody extends Collision {
	constructor() {
		super();
	}

	get getPosition() {
		if (this.ready) return this.model.position;
		else return new THREE.Vector3();
	}

	setBoundingBox(mesh) {
		const geometry = mesh.children[0].children[0].geometry;
		geometry.computeBoundingBox();
		this.size = geometry.boundingBox;
	}

	moveAndCollide(movement) {
		this.model.position.x += movement.x;
		this.model.position.z += movement.z;
	}
}
