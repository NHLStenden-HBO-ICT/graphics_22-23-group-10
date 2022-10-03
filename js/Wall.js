import * as THREE from "../node_modules/three/build/three.module.js";
import { StaticBody } from "./CollisionSystem/StaticBody.js";
import { Level } from "./Level.js";

export class Wall extends StaticBody {
	constructor(posX, posZ) {
		super();

		const SCALE_FACTOR = Level.getScaleFactor;

		this.model = new THREE.Mesh(
			new THREE.BoxGeometry(SCALE_FACTOR, SCALE_FACTOR * 2, SCALE_FACTOR),
			new THREE.MeshPhongMaterial()
		);

		this.model.layers.enable(1);
		// this.model.layers.enable(1);
		this.model.receiveShadow = true;
		this.model.castShadow = true;
		this.model.position.x = posX * SCALE_FACTOR;
		this.model.position.y = SCALE_FACTOR;
		this.model.position.z = posZ * SCALE_FACTOR;
		// this.calculateExtents(this.model.geometry);
		this.calcExtents(this.model.geometry);
	}
}
