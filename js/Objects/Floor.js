import * as THREE from "../../node_modules/three/build/three.module.js";
import { StaticBody } from "../CollisionSystem/StaticBody.js";
import { Level } from "../Level.js";

/**
 * Floor class
 */
export class Floor extends StaticBody {
	constructor(posX, posZ, width, height) {
		super();

		const SCALE_FACTOR = Level.getScaleFactor;

		// Load textures and set UV ratio 
		const grassTexture = new THREE.TextureLoader().load( './textures/Grass_01_512.png' );
		grassTexture.wrapS = THREE.RepeatWrapping;
		grassTexture.wrapT = THREE.RepeatWrapping;
		grassTexture.repeat.set( width / 10, height / 10);
		const mat = new THREE.MeshStandardMaterial({map: grassTexture});
		
		const floorWidth = width * SCALE_FACTOR;
		const floorHeight = SCALE_FACTOR;
		const floorDepth = height * SCALE_FACTOR;

		this.model = new THREE.Mesh(
			new THREE.BoxGeometry(floorWidth, floorHeight, floorDepth),
			mat
		);
		
		// Position mesh correctly
		this.model.layers.enable(1);
		this.model.receiveShadow = true;
		this.model.castShadow = true;
		this.model.position.x = posX * SCALE_FACTOR - 0.5 * SCALE_FACTOR;
		this.model.position.y = SCALE_FACTOR * -0.5;
		this.model.position.z = posZ * SCALE_FACTOR - 0.5 * SCALE_FACTOR;

		this.calcExtents(this.model.geometry);
	}
}
