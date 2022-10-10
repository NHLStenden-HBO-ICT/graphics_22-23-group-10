import { Astar } from "./Astar/Astar.js";
import { Graph } from "./Astar/Graph.js";
import { Level } from "./Level.js";
import * as THREE from "../node_modules/three/build/three.module.js";
import { DynamicBody } from "./CollisionSystem/DynamicBody.js";

const THRESHOLD = 0.2;

export class Ai extends DynamicBody {
	//add general code for the AI (pathfinding etc)

	astar = new Astar();
	graph = new Graph(Level.getLevelData);

	getPath(pacmanPos, playerPos) {
		// console.log(pacmanPos);

		// let graph = new Graph(Level.getLevelData);
		// graph.diagonal = true;

		var start = this.graph.grid[pacmanPos.x][pacmanPos.z];
		var end = this.graph.grid[playerPos.x][playerPos.z];
		// console.log(graph.grid[0].length);

		// graph.diagonal = true;
		// graph.dontCrossCorners = true;
		var result = this.astar.search(this.graph, start, end);

		return result;
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
