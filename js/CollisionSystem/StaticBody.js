import { Level } from "../Level.js";
import { Collision } from "./Collision.js";

export class StaticBody extends Collision {
	left; // Positive X
	right; // Negative X
	front; // Positive Z
	back; // Negative Z

	constructor() {
		super();

		Level.collidableObjects.push(this);
	}

	calcExtents() {
		this.left = this.model.position.x + this.size.x / 2; // Positive X
		this.right = this.model.position.x - this.size.x / 2; // Negative X
		this.front = this.model.position.z + this.size.z / 2; // Positive Z
		this.back = this.model.position.z - this.size.z / 2; // Negative Z
	}
}
