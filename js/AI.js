import { Astar } from "./Astar/Astar.js";
import { Graph } from "./Astar/Graph.js";
import { Level } from "./Level.js";
import * as THREE from "../node_modules/three/build/three.module.js";

export class Ai {
	//add general code for the AI (pathfinding etc)

	pathfinding() {
		let astar = new Astar();
		let data = Level.getLevelData;
		let graph = new Graph(Level.getLevelData);
		//console.log(graph);

		var start = graph.grid[13][6];
		var end = graph.grid[2][3];
		//console.log(start + end)
		// var result = astar.search(graph, start, end);

		// console.log(result[0].x);
	}
}
