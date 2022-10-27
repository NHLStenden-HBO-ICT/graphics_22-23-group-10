import { DefaultLoadingManager } from "three";
import * as THREE from "../node_modules/three/build/three.module.js";
import { Pacman } from "./Pacman.js";

export class PacmanStatemachine {
	static Cycles = Object.freeze({
		DAY: "day",
		NIGHT: "night",
	});
	static MovePattern = Object.freeze({
		WANDER: "wander",
		RUN: "run",
		CHASE: "chase",
	});

	constructor() {
		addEventListener("switchMovePattern", () => {
			this.dispatch("switchMovePattern");
		});

		addEventListener("switchCycle", () => {
			this.dispatch("switchCycle");
		});
	}

	#state = PacmanStatemachine.Cycles.DAY;
	#moveState = PacmanStatemachine.MovePattern.WANDER;

	transitions = {
		night: {
			wander: {
				switchMovePattern() {
					this.#moveState = PacmanStatemachine.MovePattern.CHASE;
				},
				switchCycle() {
					this.#state = PacmanStatemachine.Cycles.DAY;
				},
			},
			run: {
				switchMovePattern() {
					this.#moveState = PacmanStatemachine.MovePattern.WANDER;
				},
				switchCycle() {
					this.#state = PacmanStatemachine.Cycles.DAY;
				},
			},
			chase: {
				switchMovePattern() {
					this.#moveState = PacmanStatemachine.MovePattern.WANDER;
				},
				switchCycle() {
					this.#state = PacmanStatemachine.Cycles.DAY;
				},
			},
		},
		day: {
			wander: {
				switchMovePattern() {
					this.#moveState = PacmanStatemachine.MovePattern.RUN;
				},
				switchCycle() {
					this.#state = PacmanStatemachine.Cycles.NIGHT;
				},
			},
			run: {
				switchMovePattern() {
					this.#moveState = PacmanStatemachine.MovePattern.WANDER;
				},
				switchCycle() {
					this.#state = PacmanStatemachine.Cycles.NIGHT;
				},
			},
			chase: {
				switchMovePattern() {
					this.#moveState = PacmanStatemachine.MovePattern.WANDER;
				},
				switchCycle() {
					this.#state = PacmanStatemachine.Cycles.NIGHT;
				},
			},
		},
	};
	dispatch(actionName) {
		const action = this.transitions[this.#state][this.#moveState][actionName];

		if (action) {
			action.call(this);
		} else {
			console.log("invalid action");
		}		
	}

	getCycleState() {
		return this.#state;
	}
	setCycleState(state) {
		this.#state = state;
	}

	getMoveState() {
		return this.#moveState;
	}
	setMoveState(moveState) {
		this.#moveState = moveState;
	}
}
