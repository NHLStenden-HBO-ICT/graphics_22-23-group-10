import { GLTFLoader } from "../../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { StaticBody } from "../CollisionSystem/StaticBody.js";
import { Level } from "../Level.js";

/**
 * Coin class
 */
export class Coin extends StaticBody {
	#MODELPATH = "../../models/coin.glb";
	
	/**
	 * Position to spawn object at
	 * @param  {} posX
	 * @param  {} posZ
	 */
	constructor(posX, posZ) {
		super();

		const SCALE_FACTOR = Level.getScaleFactor;

		let self = this;
		new GLTFLoader().load(this.#MODELPATH, function (model){
			const mesh = model.scene;

			mesh.position.x = posX * SCALE_FACTOR;
			mesh.position.y = 2;
			mesh.position.z = posZ * SCALE_FACTOR;
			self.model = mesh;

			mesh.traverse(function (obj) {
				if (obj.isMesh) {
					self.calculateExtents(obj.geometry);
					obj.castShadow = true;
					obj.receiveShadow = true;
					// console.log(obj);
				}
			});

			Level.add(self.model);

			self.ready = true;

		});
	}

	
	/**
	 * Animate the coin
	 * @param  {} delta
	 * @param  {} elapsedTime
	 */
	update(delta, elapsedTime){
		this.model.rotation.y += 0.5 * delta;
		this.model.position.y = 100 * (Math.sin(elapsedTime) * delta) + 1.5;
	}
}
