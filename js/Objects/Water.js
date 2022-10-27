import * as THREE from "../../node_modules/three/build/three.module.js";
import { StaticBody } from "../CollisionSystem/StaticBody.js";
import { Level } from "../Level.js";
import { loadShader } from "../ShaderLoader.js";

export class Water extends StaticBody {
	constructor(width, height) {
		super();

		const self = this;
		loadShader("water", shaderLoaded);

		function shaderLoaded(mat) {
			mat.transparent = true;
			mat.lights = true;

			const SCALE_FACTOR = Level.getScaleFactor;
			const waterWidth = width * SCALE_FACTOR;
			const waterHeight = 0.1;
			const waterDepth = height * SCALE_FACTOR;

			self.model = new THREE.Mesh(
				new THREE.BoxGeometry(
					waterWidth,
					waterHeight,
					waterDepth,
					waterWidth,
					1,
					waterDepth
				),
				mat
			);

			self.model.layers.enable(1);
			self.model.receiveShadow = true;
			self.model.position.x = waterDepth / 2 - SCALE_FACTOR / 2;
			self.model.position.y = -1.2;
			self.model.position.z = waterWidth / 2 - SCALE_FACTOR / 2;

			self.model.name = "Water";

			self.calcExtents(self.model.geometry);

			Level.add(self.model);
			// Level.cameraCollisionObjects.push(self.model);
		}
	}

	update(elapsedTime) {
		this.model.material.uniforms.u_time.value = elapsedTime;
	}
}
