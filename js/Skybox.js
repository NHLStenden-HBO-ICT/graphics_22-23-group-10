import { clamp } from "three/src/math/MathUtils.js";
import * as THREE from "../node_modules/three/build/three.module.js";
import { loadShader } from "./ShaderLoader.js";

export class Skybox {
	skyboxLoaded = new Event("skyboxLoaded");

	#ready = false;

	#SUNSPEED = 0.1;

	skyGeometry;

	#sunAxis = new THREE.Vector3(1, 0, 0);
	#sunVector = new THREE.Vector3(0, 500, 0);

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
				sunPosition: { value: new THREE.Vector3(0, 1, 0) },
			};

			const geom = new THREE.SphereGeometry(200);
			self.skyGeometry = new THREE.Mesh(geom, material);
			dispatchEvent(self.skyboxLoaded);
			self.#ready = true;
		}
	}

	update(delta, sun) {
		if (!this.#ready) {
			return;
		}

		this.#sunVector.applyAxisAngle(this.#sunAxis, this.#SUNSPEED * delta);
		this.skyGeometry.material.uniforms.sunPosition.value = this.#sunVector;
		sun.position.set(this.#sunVector.x, this.#sunVector.y, this.#sunVector.z);

		let angle = THREE.MathUtils.radToDeg(
			Math.atan2(this.#sunVector.z, this.#sunVector.y)
		);
		angle = clamp(angle, -90, 90);

		let value = 1;

		if (angle > 75) {
			value = map(angle, 75, 90, 1, 0);
		} else if (angle < -75) {
			value = map(angle, -75, -90, 1, 0);
		}
		sun.intensity = value;
	}
}

const map = (value, x1, y1, x2, y2) =>
	((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
