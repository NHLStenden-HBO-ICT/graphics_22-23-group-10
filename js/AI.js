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
	lastPos = new THREE.Vector3();

	astar = new Astar();
	graph = new Graph(Level.getLevelData);
	graphStart;
	graphEnd;

	hasDestination = false;
	runningAwayCD = 0;

	intersectObjects = Level.cameraCollisionObjects.slice();

	closestCoin = null;

	raycaster = new THREE.Raycaster();

	pacmanState = new PacmanStatemachine();
	switchMovePattern = new Event("switchMovePattern");

	constructor(playerMesh){
		super();
		this.intersectObjects.push(playerMesh);
	}

	getPath(pacmanPos, playerPos, cycleState, moveState, playerModel) {
		if ((this.lastPos.x == pacmanPos.x || this.lastPos.z == pacmanPos.z) && this.hasDestination){
			// console.log(pacmanPos);
			return [];
		}
		else{
			// console.log(pacmanPos, this.lastPos);
			this.lastPos = pacmanPos;
		}

		this.graph.diagonal = true;
		this.graph.dontCrossCorners = true;

		this.InVisionRange(pacmanPos, playerPos, playerModel, moveState);

		if(!this.closestCoin){
			this.closestCoin = this.GetClosestCoin();
		}
		if(this.closestCoin == null){
			return [];
		}

		switch (cycleState) {
			case PacmanStatemachine.Cycles.DAY:
				switch (moveState) {
					case PacmanStatemachine.MovePattern.WANDER:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						const coinpos = new THREE.Vector3(this.closestCoin.getPosition.x / Level.getScaleFactor, 0, this.closestCoin.getPosition.z / Level.getScaleFactor);
						this.graphEnd = this.graph.grid[coinpos.x][coinpos.z];
						break;
		
					case PacmanStatemachine.MovePattern.RUN:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						this.graphEnd = this.RunGraphEnd(playerPos);
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
						const coinpos = new THREE.Vector3(this.closestCoin.getPosition.x / Level.getScaleFactor, 0, this.closestCoin.getPosition.z / Level.getScaleFactor);
						this.graphEnd = this.graph.grid[coinpos.x][coinpos.z];
						break;
		
					case PacmanStatemachine.MovePattern.RUN:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						this.graphEnd = this.RunGraphEnd(playerPos);
						break;
		
					case PacmanStatemachine.MovePattern.CHASE:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						this.graphEnd = this.graph.grid[playerPos.x][playerPos.z];
						break;
				}
				break;
		}
		
		var result = this.astar.search(this.graph, this.graphStart, this.graphEnd);
		this.hasDestination = true;

		return result;
	}

	RunGraphEnd(targetPos){
		const pacmanPos = this.model.position;
		let target = new THREE.Vector3(targetPos.x * Level.getScaleFactor, 0, targetPos.z * Level.getScaleFactor);
		// target.multiplyScalar(Level.getScaleFactor);
		let dir = new THREE.Vector3();
		dir.subVectors(target, pacmanPos).normalize();

		// Position away from player
		let pos = new THREE.Vector3(
			Math.round(pacmanPos.x * -dir.x),
			0,
			Math.round(pacmanPos.z * -dir.z)
		);

		pos.clamp(
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(this.graph.grid.length -1 , 0, this.graph.grid[0].length -1)
		);
		return this.graph.grid[pos.x][pos.z];
	}


	InVisionRange(_pacmanPos, targetPos, playerModel, moveState) {
		const pacmanPos = this.model.position;
		let target = new THREE.Vector3(targetPos.x * Level.getScaleFactor, 0, targetPos.z * Level.getScaleFactor);
		// this.raycaster.layers.set(2);
		let dir = new THREE.Vector3();
		dir.subVectors(target, pacmanPos).normalize();
		// console.log(dir);
		this.raycaster.set(pacmanPos, dir);

		this.raycastOrigin = pacmanPos;
		this.raycaster.ray.at(100, this.raycastEnd);
		this.raycastEnd.y = 2;

		const intersect = this.raycaster.intersectObject(playerModel);
		
		if (intersect.length > 0) {
			const isct = intersect[0];
			// console.log(isct);
			if (isct.distance < 500) {
				if(isct.object.name == "Ghost"){
					// console.log("inrange");
					if(moveState != PacmanStatemachine.MovePattern.RUN){
						this.runningAwayCD = 0;
						dispatchEvent(this.switchMovePattern);
					}
				}
			}
		}
		else if(moveState == PacmanStatemachine.MovePattern.RUN && this.runningAwayCD > 5){
			this.runningAwayCD = 0;
			dispatchEvent(this.switchMovePattern);
		}
	}

	GetClosestCoin(){
		let allExistingCoins = Level.coins;
		if(allExistingCoins.length == 0){
			return null; // pacman wins when there are no coins left	 TODO: switch to end screen, to be inplemented
		}

		let CoinPathResults = [];

		this.graphStart = this.graph.grid[this.getPosition.x][this.getPosition.z];

		for(let i = 0; i < allExistingCoins.length; i++){
			const coin = allExistingCoins[i];
			const coinpos = new THREE.Vector3(coin.getPosition.x / Level.getScaleFactor, 0, coin.getPosition.z / Level.getScaleFactor)
			this.graphEnd = this.graph.grid[coinpos.x][coinpos.z];
			var result = this.astar.search(this.graph, this.graphStart, this.graphEnd);
			CoinPathResults.push(result.length);
		}
		const lowestPath = Math.min(...CoinPathResults);

		return allExistingCoins[CoinPathResults.indexOf(lowestPath)]
	}
	getStateMachine(){
		return this.pacmanState;
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
