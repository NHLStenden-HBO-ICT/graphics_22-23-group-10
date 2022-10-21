import * as THREE from "../../node_modules/three/build/three.module.js";
import { StaticBody } from "../CollisionSystem/StaticBody.js";
import { Level } from "../Level.js";

export class Coin extends StaticBody {
	constructor(posX, posZ) {
		super();

		const SCALE_FACTOR = Level.getScaleFactor;

		this.calcExtents(this.model.geometry);
	}
}
