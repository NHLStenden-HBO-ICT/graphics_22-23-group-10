import { Astar } from "./Astar/Astar.js";
import { Graph } from "./Astar/Graph.js";
import { Level } from "./Level.js";
import * as THREE from "../node_modules/three/build/three.module.js";
import { DynamicBody } from "./CollisionSystem/DynamicBody.js";
import { PacmanStatemachine } from "./PacmanStatemachine.js";

/**
 * This and other code regarding the pacman AI needs some serious refactoring
 * We unfortunatly didn't have time for that, so enjoy this spaghetti code :)
 */

export class Ai extends DynamicBody {
	raycastOrigin = new THREE.Vector3();
	raycastEnd = new THREE.Vector3();
	lastPos = new THREE.Vector3();

	astar = new Astar();
	graph = new Graph(Level.getLevelData);
	graphStart;
	graphEnd;

	hasDestination = false;
	switchCD = 0;

	intersectObjects = Level.cameraCollisionObjects.slice();

	closestCoin = null;

	raycaster = new THREE.Raycaster();

	pacmanState = new PacmanStatemachine();
	switchMovePattern = new Event("switchMovePattern");
	allCoinsFound = new Event("allCoinsFound");

	constructor(playerMesh) {
		super();
		this.intersectObjects.push(playerMesh);
	}

	// Returns 2D array with x and z coordinates rounded to intergers,
	// This is used by pacman to navigate to a point in a certain way
	/**
	 * Gets a path for the pacman
	 * @param {*} pacmanPos 
	 * @param {*} playerPos 
	 * @param {*} playerModel 
	 * @returns array of points
	 */
	getPath(pacmanPos, playerPos, playerModel) {
		if (
			(this.lastPos.x == pacmanPos.x || this.lastPos.z == pacmanPos.z) &&
			this.hasDestination
		) {
			return [];
		} else {
			this.lastPos = pacmanPos;
		}

		this.graph.diagonal = true;
		this.graph.dontCrossCorners = true;

		this.checkForPlayer(pacmanPos, playerPos, playerModel);

		// Search for closest coin to AI when none are found yet
		if (!this.closestCoin) {
			this.closestCoin = this.getClosestCoin();
		}
		if (this.closestCoin == null) {
			Level.allCoinsFound = true;
			dispatchEvent(this.allCoinsFound);
			return [];
		}

		switch (this.pacmanState.getCycleState()) {
			case PacmanStatemachine.Cycles.DAY:
				switch (this.pacmanState.getMoveState()) {
					case PacmanStatemachine.MovePattern.WANDER:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						const coinpos = new THREE.Vector3(
							this.closestCoin.getPosition.x / Level.getScaleFactor,
							0,
							this.closestCoin.getPosition.z / Level.getScaleFactor
						);
						this.graphEnd = this.graph.grid[coinpos.x][coinpos.z];
						break;

					case PacmanStatemachine.MovePattern.RUN:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						this.graphEnd = this.getPosAwayFromPlayer(playerPos);
						break;

					case PacmanStatemachine.MovePattern.CHASE:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						this.graphEnd = this.graph.grid[playerPos.x][playerPos.z];
						break;
				}
				break;

			case PacmanStatemachine.Cycles.NIGHT:
				switch (this.pacmanState.getMoveState()) {
					case PacmanStatemachine.MovePattern.WANDER:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						const coinpos = new THREE.Vector3(
							this.closestCoin.getPosition.x / Level.getScaleFactor,
							0,
							this.closestCoin.getPosition.z / Level.getScaleFactor
						);
						this.graphEnd = this.graph.grid[coinpos.x][coinpos.z];
						break;

					case PacmanStatemachine.MovePattern.RUN:
						this.graphStart = this.graph.grid[pacmanPos.x][pacmanPos.z];
						this.graphEnd = this.getPosAwayFromPlayer(playerPos);
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

	/**
	 * Tries to find a position that leads pacman away from the player
	 * @param {*} targetPos 
	 * @returns position
	 */
	getPosAwayFromPlayer(targetPos) {
		const pacmanPos = this.model.position;
		let target = new THREE.Vector3(
			targetPos.x * Level.getScaleFactor,
			0,
			targetPos.z * Level.getScaleFactor
		);
		let dir = new THREE.Vector3();
		dir.subVectors(target, pacmanPos).normalize();

		// Position away from player
		let pos = new THREE.Vector3(
			Math.round(pacmanPos.x * -dir.x),
			0,
			Math.round(pacmanPos.z * -dir.z)
		);

		// Max and min posible position
		pos.clamp(
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(
				this.graph.grid.length - 1,
				0,
				this.graph.grid[0].length - 1
			)
		);
		return this.graph.grid[pos.x][pos.z];
	}

	/**
	 * Checks if pacman is in range of the player
	 * @param {*} _pacmanPos 
	 * @param {*} targetPos 
	 * @param {*} playerModel 
	 */
	checkForPlayer(_pacmanPos, targetPos, playerModel) {
		const pacmanPos = this.model.position;
		let target = new THREE.Vector3(
			targetPos.x * Level.getScaleFactor,
			0,
			targetPos.z * Level.getScaleFactor
		);

		let dir = new THREE.Vector3();
		dir.subVectors(target, pacmanPos).normalize();
		this.raycaster.set(pacmanPos, dir);

		this.raycastOrigin = pacmanPos;
		this.raycaster.ray.at(100, this.raycastEnd);
		this.raycastEnd.y = 2;

		const intersect = this.raycaster.intersectObject(playerModel);

		// Check if AI has intersects with player
		if (intersect.length > 0) {
			const isct = intersect[0];
			if (isct.distance < 800) {
				// Only detect player (Ghost) within a certain range
				if (isct.object.name == "Ghost") {
					if (
						this.pacmanState.getCycleState() == PacmanStatemachine.Cycles.DAY
					) {
						if (
							this.pacmanState.getMoveState() !=
							PacmanStatemachine.MovePattern.RUN
						) {
							this.switchCD = 0; // Reset switch cooldown
							dispatchEvent(this.switchMovePattern);
						}
					} else if (
						this.pacmanState.getCycleState() == PacmanStatemachine.Cycles.NIGHT
					) {
						if (
							this.pacmanState.getMoveState() !=
							PacmanStatemachine.MovePattern.CHASE
						) {
							this.switchCD = 0; // Reset switch cooldown
							dispatchEvent(this.switchMovePattern);
						}
					}
				}
			}
			// Switch to wandering and search for new coin
			// only when there are no intersects and switching is possible while pacman is not wandering
		} else if (
			this.pacmanState.getMoveState() !=
				PacmanStatemachine.MovePattern.WANDER &&
			this.switchCD > 5
		) {
			this.switchCD = 0;
			this.closestCoin = this.getClosestCoin();
			dispatchEvent(this.switchMovePattern);
		}
	}

	/**
	 * Finds the coin closes to pacman
	 * @returns coin
	 */
	getClosestCoin() {
		let allExistingCoins = Level.coins;
		if (allExistingCoins.length == 0) {
			return null; // pacman wins when there are no coins left	 TODO: switch to end screen, to be inplemented
		}

		let CoinPathResults = [];

		// Get position of AI relative to level
		let pos = new THREE.Vector3(
			this.getPosition.x / Level.getScaleFactor,
			0,
			this.getPosition.z / Level.getScaleFactor
		).round();

		this.graphStart = this.graph.grid[pos.x][pos.z];

		// Go trough all existing coins and calculate their current distance to AI
		for (let i = 0; i < allExistingCoins.length; i++) {
			const coin = allExistingCoins[i];
			const coinpos = new THREE.Vector3(
				coin.getPosition.x / Level.getScaleFactor,
				0,
				coin.getPosition.z / Level.getScaleFactor
			);
			this.graphEnd = this.graph.grid[coinpos.x][coinpos.z];
			var result = this.astar.search(
				this.graph,
				this.graphStart,
				this.graphEnd
			);
			CoinPathResults.push(result.length);
		}
		// Take the closest coin object
		const lowestPath = Math.min(...CoinPathResults);

		// And return the closest coin
		return allExistingCoins[CoinPathResults.indexOf(lowestPath)];
	}

	getStateMachine() {
		return this.pacmanState;
	}
}
