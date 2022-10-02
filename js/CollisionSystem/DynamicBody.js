import { Collision } from "./Collision.js";
import { Level } from "../Level.js";
import { clamp } from "three/src/math/MathUtils.js";

const cTHRESHOLD = 0.2;

export class DynamicBody extends Collision {
	constructor() {
		super();
	}

	move(movement) {
		this.model.position.x += movement.x;
		this.model.position.z += movement.z;
	}

	moveAndCollide(movement, camera) {
		let objects = Level.collidableObjects;

		const pLeft = this.model.position.x + this.size.x / 2; // Positive X
		const pRight = this.model.position.x - this.size.x / 2; // Negative X
		const pFront = this.model.position.z + this.size.z / 2; // Positive Z
		const pBack = this.model.position.z - this.size.z / 2; // Negative Z

		let moveX = movement.x;
		let moveZ = movement.z;

		for (let i = 0; i < objects.length; i++) {
			const obj = objects[i];

			// Difference as seen from the player
			const deltaLeft = obj.right - pLeft;
			const deltaRight = obj.left - pRight;
			const deltaFront = obj.back - pFront;
			const deltaBack = obj.front - pBack;

			if (
				deltaLeft <= cTHRESHOLD &&
				deltaLeft >= -cTHRESHOLD &&
				pBack <= obj.front &&
				pFront >= obj.back
			) {
				// console.log("Colliding left (X)");
				moveX = clamp(moveX, -Infinity, 0);
			}
			if (
				deltaRight <= cTHRESHOLD &&
				deltaRight >= -cTHRESHOLD &&
				pBack <= obj.front &&
				pFront >= obj.back
			) {
				// console.log("Colliding right (-X)");
				moveX = clamp(moveX, 0, Infinity);
			}
			if (
				deltaFront <= cTHRESHOLD &&
				deltaFront >= -cTHRESHOLD &&
				pRight <= obj.left &&
				pLeft >= obj.right
			) {
				// console.log("Colliding front (Z)");
				moveZ = clamp(moveZ, -Infinity, 0);
			}
			if (
				deltaBack <= cTHRESHOLD &&
				deltaBack >= -cTHRESHOLD &&
				pRight <= obj.left &&
				pLeft >= obj.right
			) {
				// console.log("Colliding back (-Z)");
				moveZ = clamp(moveZ, 0, Infinity);
			}
		}
		this.model.position.x += moveX;
		this.model.position.z += moveZ;
		// camera.position.x += moveX;
		// camera.position.z += moveZ;
	}
}
