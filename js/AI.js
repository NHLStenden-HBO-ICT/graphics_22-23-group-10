import { Astar, Graph } from "./Astar.js";
import { Level } from "./Level.js";

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
