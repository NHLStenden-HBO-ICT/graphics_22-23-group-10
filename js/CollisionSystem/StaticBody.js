import { Level } from "../Level.js";
import { Collision } from "./Collision.js";

export class StaticBody extends Collision {
	constructor() {
		super();

		Level.collidableObjects.push(this);
	}

	setBoundingBox(mesh) {
		mesh.geometry.computeBoundingBox();
		this.boundingBox = mesh.geometry.boundingBox;
	}
}
