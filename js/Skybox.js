import * as THREE from "../node_modules/three/build/three.module.js";
import { loadShader } from "./ShaderLoader.js";
import { Level } from "./Level.js";

export class Skybox {
	skyboxLoaded = new Event("skyboxLoaded");
	switchCycle = new Event("switchCycle");

	#ready = false;

	#SUNSPEED = 0.05;

	skyGeometry;

	#sunAxis = new THREE.Vector3(1, 0, 0);
	#sunVector = new THREE.Vector3(0, 100, -500);
	#isNight = false;
	#lightIntensity;

	get getLightIntensity() {
		return this.#lightIntensity;
	}

	constructor() {
		loadShader("skybox", onShaderLoaded);

		const mapSize = Level.getMapSize;
		this.#sunVector.x = (mapSize.x / 2) * Level.getScaleFactor;

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

			const geom = new THREE.SphereGeometry(1000);
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
		let clampedAngle = clamp(angle, -90, 90);

		let value = 1;

		if (angle > 75) {
			value = map(clampedAngle, 75, 90, 1, 0);
		} else if (angle < -75) {
			value = map(clampedAngle, -75, -90, 1, 0);
		}

		this.#lightIntensity = value;
		sun.intensity = value;

		if (angle > 90 && angle > 0 && !this.#isNight) {
			this.#isNight = true;
			dispatchEvent(this.switchCycle);
		} else if (angle > -90 && angle < 0 && this.#isNight) {
			this.#isNight = false;
			dispatchEvent(this.switchCycle);
		}
	}
}

const map = (value, x1, y1, x2, y2) =>
	((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

const clamp = (number, min, max) => {
	return Math.max(min, Math.min(number, max));
};
