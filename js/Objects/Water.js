import * as THREE from "../../node_modules/three/build/three.module.js";
import { StaticBody } from "../CollisionSystem/StaticBody.js";
import { Level } from "../Level.js";

export class Water extends StaticBody {
	constructor(width, height) {
		super();

		const mat = new THREE.MeshStandardMaterial({ color: 0x679bf0 });

		const SCALE_FACTOR = Level.getScaleFactor;
		const waterWidth = width * SCALE_FACTOR;
		const waterHeight = 1;
		const waterDepth = height * SCALE_FACTOR;

		this.model = new THREE.Mesh(
			new THREE.BoxGeometry(
				waterWidth,
				waterHeight,
				waterDepth
			),
			mat
		);

		this.model.receiveShadow = true;
		this.model.position.x = waterDepth / 2 - SCALE_FACTOR / 2;
		this.model.position.y = -waterHeight * 1.2;
		this.model.position.z = waterWidth / 2 - SCALE_FACTOR / 2;

		this.model.name = "Water";

		this.calcExtents(this.model.geometry);
	}
}
