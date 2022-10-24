import { Astar } from "./Astar/Astar.js";
import { Graph } from "./Astar/Graph.js";
import { Level } from "./Level.js";
import * as THREE from "../node_modules/three/build/three.module.js";
import { DynamicBody } from "./CollisionSystem/DynamicBody.js";
import { PacmanStatemachine } from "./PacmanStatemachine.js";

const THRESHOLD = 0.2;

export class Ai extends DynamicBody {
	//add general code for the AI (pathfinding etc)
	raycastOrigin = new THREE.Vector3();
	raycastEnd = new THREE.Vector3();

	astar = new Astar();
	graph = new Graph(Level.getLevelData);
	graphStart;
	graphEnd;

	raycaster = new THREE.Raycaster();

	nightTimeWander = new Event("nightTimeWander");

	getPath(pacmanPos, playerPos, cycleState, moveState, playerModel) {
		this.graph.diagonal = true;
		this.graph.dontCrossCorners = true;

		switch (cycleState) {
			case PacmanStatemachine.Cycles.DAY:
				switch (moveState) {
					case PacmanStatemachine.MovePattern.WANDER:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						this.graphEnd = this.graph.grid[playerPos.x][playerPos.z];
						// this.graphEnd = POINT TO CHOSEST COIN --CoinGraphEnd()
						break;

					case PacmanStatemachine.MovePattern.RUN:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						this.graphEnd = this.RunGraphEnd(pacmanPos, playerPos, playerModel);
						break;

					case PacmanStatemachine.MovePattern.CHASE:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						this.graphEnd = this.graph.grid[playerPos.x][playerPos.z];
						break;
				}
				break;

			case PacmanStatemachine.Cycles.NIGHT:
				switch (moveState) {
					case PacmanStatemachine.MovePattern.WANDER:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						// this.graphEnd = POINT TO CHOSEST COIN --CoinGraphEnd()
						break;

					case PacmanStatemachine.MovePattern.RUN:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						this.graphEnd = this.RunGraphEnd(pacmanPos, playerPos, playerModel);
						break;

					case PacmanStatemachine.MovePattern.CHASE:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						this.graphEnd = this.graph.grid[playerPos.x][playerPos.z];
						break;
				}
				break;
		}

		var result = this.astar.search(this.graph, this.graphStart, this.graphEnd);

		return result;
	}

	RunGraphEnd(_pacmanPos, playerPos, playerModel) {
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

		// Position away from player
		let pos = new THREE.Vector3(
			Math.round(pacmanPos.x * -dir.x),
			0,
			Math.round(pacmanPos.z * -dir.z)
		);

		pos.clamp(
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(
				this.graph.grid.length - 1,
				0,
				this.graph.grid[0].length - 1
			)
		);

		const intersect = this.raycaster.intersectObject(playerModel);
		// console.log(playerModel);
		if (intersect.length > 0) {
			const isct = intersect[0];
			console.log(isct);
			if (isct.distance < 500) {
				return this.graph.grid[pos.x][pos.z];
			} else {
				// switch to wander if pacman is too far away
				return dispatchEvent(this.nightTimeWander);
			}
		}
	}

	CoinGraphEnd() {
		let allExistingCoins = Level.coins;
		// ToDo: graphEnd = closest coin
	}

	// not used atm
	// isPositionReached(pos, targetpos) {
	// 	let deltaPos = new THREE.Vector3(
	// 		pos.x - targetpos.x,
	// 		0,
	// 		pos.z - targetpos.z
	// 	);

	// 	if (deltaPos.x > THRESHOLD || deltaPos.x < -THRESHOLD) {
	// 		return false;
	// 	}
	// 	if (deltaPos.z > THRESHOLD || deltaPos.z < -THRESHOLD) {
	// 		return false;
	// 	}
	// 	return true;
	// }
}
