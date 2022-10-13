import * as THREE from "../node_modules/three/build/three.module.js";
import { Pacman } from "./Pacman.js";

export class PacmanStatemachine {
	static Cycles = Object.freeze({
		DAY: "day",
		NIGHT: "night",
	});

	constructor() {
		addEventListener("nightTimeStart", () => {
			// console.log(this.#state);
			this.dispatch("switch");
			// console.log(this.#state);
		});

		addEventListener("dayTimeStart", () => {
			// console.log(this.#state);
			this.dispatch("switch");
			// console.log(this.#state);
		});
	}

	#state = PacmanStatemachine.Cycles.DAY;

	transitions = {
		night: {
			switch() {
				this.#state = PacmanStatemachine.Cycles.DAY;
			},
		},
		day: {
			switch() {
				this.#state = PacmanStatemachine.Cycles.NIGHT;
			},
		},
	};
	dispatch(actionName) {
		const action = this.transitions[this.#state][actionName];

		if (action) {
			action.call(this);
		} else {
			console.log("invalid action");
		}
	}

	getState() {
		return this.#state;
	}
	setState(state) {
		this.#state = state;
	}
}
