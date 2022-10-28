import * as THREE from "../../node_modules/three/build/three.module.js";
import { StaticBody } from "../CollisionSystem/StaticBody.js";
import { Level } from "../Level.js";
import { loadShader } from "../ShaderLoader.js";

export class Water extends StaticBody {
	constructor(width, height) {
		super();

		const self = this;
		loadShader("water", shaderLoaded);

		function shaderLoaded(material) {
			const LOCAL_SCALE = 1.5;
			const mat = new THREE.MeshPhongMaterial({ color: 0x0000ff });

			const SCALE_FACTOR = Level.getScaleFactor;
			const waterWidth = width * SCALE_FACTOR * LOCAL_SCALE;
			const waterHeight = 0.1;
			const waterDepth = height * SCALE_FACTOR * LOCAL_SCALE;

			mat.onBeforeCompile = function (shader) {
				shader.uniforms.time = { value: 0 };
				shader.uniforms.width = { value: width * LOCAL_SCALE };
				shader.uniforms.height = { value: height * LOCAL_SCALE };
				shader.vertexShader = material.vertexShader;
				shader.fragmentShader = material.fragmentShader;
				mat.userData.shader = shader;
				self.ready = true;
			};
			mat.customProgramCacheKey = function () {
				return 1;
			};
			mat.transparent = true;

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
			self.model.position.x = (width * SCALE_FACTOR) / 2;
			// waterDepth / 2 - SCALE_FACTOR / 2 - LOCAL_SCALE * SCALE_FACTOR;
			self.model.position.y = -1.8;
			self.model.position.z = (height * SCALE_FACTOR) / 2;
			// waterWidth / 2 - SCALE_FACTOR / 2 - LOCAL_SCALE * SCALE_FACTOR;

			self.model.name = "Water";

			self.calcExtents(self.model.geometry);

			Level.add(self.model);
			// Level.cameraCollisionObjects.push(self.model);
		}
	}

	update(elapsedTime) {
		if (!this.ready) return;
		this.model.material.userData.shader.uniforms.time.value = elapsedTime;
		// console.log(this.model.material);
	}
}
