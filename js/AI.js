import { Astar } from "./Astar/Astar.js";
import { Graph } from "./Astar/Graph.js";
import { Level } from "./Level.js";
import * as THREE from "../node_modules/three/build/three.module.js";
import { DynamicBody } from "./CollisionSystem/DynamicBody.js";

const THRESHOLD = 0.2;

export class Ai extends DynamicBody {
	//add general code for the AI (pathfinding etc)
	raycastOrigin = new THREE.Vector3();
	raycastEnd = new THREE.Vector3();

	astar = new Astar();

	getPath(pacmanPos, playerPos) {
		// console.log(pacmanPos);

		let graph = new Graph(Level.getLevelData);
		graph.diagonal = true;

		switch (state) {
			case PacmanStatemachine.Cycles.DAY:
				this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
				this.graphEnd = this.graph.grid[playerPos.x][playerPos.z];
				this.DayEndPath(pacmanPos, playerPos, playerModel);
				break;

		graph.diagonal = true;
		graph.dontCrossCorners = true;
		var result = this.astar.search(graph, start, end);

		return result;
	}

	DayEndPath(_pacmanPos, playerPos, playerModel) {
		const pacmanPos = this.model.position;
		playerPos.multiplyScalar(Level.getScaleFactor);
		// this.raycaster.layers.set(2);
		let dir = new THREE.Vector3();
		dir.subVectors(playerPos, pacmanPos).normalize();
		// console.log(dir);
		this.raycaster.set(pacmanPos, dir);

		this.raycastOrigin = pacmanPos;
		this.raycaster.ray.at(100, this.raycastEnd);
		this.raycastEnd.y = 2;
		this.raycastOrigin.y = 2;

		// Position away from player
		let pos = new THREE.Vector3(
			Math.round(pacmanPos.x * -dir.x * 4),
			0,
			Math.round(pacmanPos.z * -dir.x * 4)
		);

		const intersect = this.raycaster.intersectObject(playerModel);
		// console.log(playerModel);
		if (intersect.length > 0) {
			const isct = intersect[0];
			console.log(isct);
			// if (isct.distance < 100) {
			// 	this.graphEnd = this.graph.grid[pos.x][pos.z];
			// }
		}
	}

	// not used atm
	isPositionReached(pos, targetpos) {
		let deltaPos = new THREE.Vector3(
			pos.x - targetpos.x,
			0,
			pos.z - targetpos.z
		);

		if (deltaPos.x > THRESHOLD || deltaPos.x < -THRESHOLD) {
			return false;
		}
		if (deltaPos.z > THRESHOLD || deltaPos.z < -THRESHOLD) {
			return false;
		}
		return true;
	}
}
