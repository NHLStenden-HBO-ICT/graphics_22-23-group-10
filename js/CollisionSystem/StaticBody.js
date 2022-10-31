import { Collision } from "./Collision.js";

/**
 * Collision object that doesn't move
 */
export class StaticBody extends Collision {
	left; // Positive X
	right; // Negative X
	front; // Positive Z
	back; // Negative Z

	constructor() {
		super();
	}

	/**
	 * Calculates the bounding box from the given geometry.
	 * It's a step inbetween the super's function to also calculate the objects extents
	 * @param  {} geometry
	 */
	calcExtents(geometry) {
		this.calculateExtents(geometry);
		this.left = this.model.position.x + this.size.x / 2; // Positive X
		this.right = this.model.position.x - this.size.x / 2; // Negative X
		this.front = this.model.position.z + this.size.z / 2; // Positive Z
		this.back = this.model.position.z - this.size.z / 2; // Negative Z
	}
}
