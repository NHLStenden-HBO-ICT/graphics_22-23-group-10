import * as THREE from "../../node_modules/three/build/three.module.js";
import { StaticBody } from "../CollisionSystem/StaticBody.js";
import { Level } from "../Level.js";

export class Coin extends StaticBody {
	constructor(posX, posZ) {
		super();

		const SCALE_FACTOR = Level.getScaleFactor;

		const box = new THREE.BoxGeometry(1, 1);
		const mat = new THREE.MeshPhongMaterial({ Color: 0xffff00 });
		this.model = new THREE.Mesh(box, mat);
		Level.add(this.model);

		this.model.position.x = posX * SCALE_FACTOR;
		this.model.position.y = 0.5;
		this.model.position.z = posZ * SCALE_FACTOR;

		this.calcExtents(this.model.geometry);
	}
}
