import * as THREE from "../node_modules/three/build/three.module.js";

const shaderFolder = "../shaders/";

export function loadShader(shaderName, onLoad) {
	let vertex_url = shaderFolder + shaderName + ".vert";
	let fragment_url = shaderFolder + shaderName + ".frag";
	const loader = new THREE.FileLoader();

	loader.load(vertex_url, function (vertex_text) {
		loader.load(fragment_url, function (fragment_text) {
			const material = new THREE.ShaderMaterial();
			material.vertexShader = vertex_text;
			material.fragmentShader = fragment_text;
			material.uniforms = {
				...THREE.UniformsLib.lights,
				u_time: {
					type: "f",
					value: 0,
				},
			};
			onLoad(material);
		});
	});
}
