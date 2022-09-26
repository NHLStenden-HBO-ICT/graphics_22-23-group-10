import * as THREE from "../node_modules/three/build/three.module.js";
import { loadShader } from "./ShaderLoader.js";

export class Skybox {
	skyboxLoaded = new Event("skyboxLoaded");

	object3d;

	constructor() {
		loadShader("skybox", onShaderLoaded);

		const self = this;
		function onShaderLoaded(material) {
			material.side = THREE.BackSide;
			material.uniforms = {
				luminance: { value: 1 },
				turbidity: { value: 2 },
				rayleigh: { value: 1 },
				mieCoefficient: { value: 0.005 },
				mieDirectionalG: { value: 0.8 },
				sunPosition: { value: new THREE.Vector3(30, 20, 0) },
			};

			const geom = new THREE.SphereGeometry(200);
			self.object3d = new THREE.Mesh(geom, material);
			dispatchEvent(self.skyboxLoaded);
		}
	}

	update() {}
}
