import { Astar } from "./Astar/Astar.js";
import { Graph } from "./Astar/Graph.js";
import { Level } from "./Level.js";
import * as THREE from "../node_modules/three/build/three.module.js";
import { DynamicBody } from "./CollisionSystem/DynamicBody.js";
import { PacmanStatemachine } from "./PacmanStatemachine.js";

const THRESHOLD = 0.2;

export class Ai extends DynamicBody {
	//add general code for the AI (pathfinding etc)

	astar = new Astar();
	graph = new Graph(Level.getLevelData);
	graphStart;
	graphEnd;

	raycaster = new THREE.Raycaster();

	getPath(pacmanPos, playerPos, state, playerModel) {
		this.graph.diagonal = true;
		this.graph.dontCrossCorners = true;

		switch (state) {
			case PacmanStatemachine.Cycles.DAY:
				this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
				this.graphEnd = this.graph.grid[playerPos.x][playerPos.z];
				//this.DayEndPath(pacmanPos, playerPos, playerModel);
				break;

			case PacmanStatemachine.Cycles.NIGHT:
				this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
				this.graphEnd = this.graph.grid[playerPos.x][playerPos.z];
				break;
		}

		var result = this.astar.search(this.graph, this.graphStart, this.graphEnd);

		return result;
	}

	// DayEndPath(pacmanPos, playerPos, playerModel){
	// 	this.raycaster.layers.set(2);
	// 	let dir = new THREE.Vector3(playerPos.x - pacmanPos.x, 0, playerPos.z - pacmanPos.z).normalize();
	// 	this.raycaster.set(pacmanPos, dir);

	// 	// Position away from player
	// 	let pos = new THREE.Vector3(Math.round(pacmanPos.x * -dir.x * 4), 0, Math.round(pacmanPos.z * -dir.x * 4));

	// 	const intersect = this.raycaster.intersectObject(playerModel)
	// 	console.log(playerModel);
	// 	if (intersect.length > 0) {
	// 		const isct = intersect[0];
	// 		console.log(isct);
	// 		if (isct.distance < 100) {

	// 			this.graphEnd = this.graph.grid[pos.x][pos.z];
	// 		}
	// 	}
	// }

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
