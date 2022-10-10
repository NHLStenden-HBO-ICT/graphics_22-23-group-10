import { Level } from "../Level.js";
import { GridNode } from "./Gridnode.js";
import { Astar } from "./Astar.js";

export class Graph {
	level = [];
	constructor(gridIn) {
		this.level = gridIn;
		this.nodes = [];
		this.rotationToNextNode = 0;
		// this.diagonal = !!this.diagonalOption;
		// this.dontCrossCorners = !!this.dontCrossCornersOption;
		this.diagonal = false;
		this.dontCrossCorners = false;
		this.grid = [];
		for (var x = 0; x < gridIn.length; x++) {
			this.grid[x] = [];

			for (var y = 0, row = gridIn[x]; y < row.length; y++) {
				var node = new GridNode(x, y, row[y]);
				this.grid[x][y] = node;
				this.nodes.push(node);
			}
		}
		this.init();
	}
	init() {
		this.dirtyNodes = [];
		for (var i = 0; i < this.nodes.length; i++) {
			Astar.cleanNode(this.nodes[i]);
		}
	}
	cleanDirty() {
		for (var i = 0; i < this.dirtyNodes.length; i++) {
			Astar.cleanNode(this.dirtyNodes[i]);
		}
		this.dirtyNodes = [];
	}
	markDirty(node) {
		this.dirtyNodes.push(node);
	}
	//returns true when node is a floor
	isWalkableAt(x, y) {
		// console.log(x, y);
		if (x >= this.level.length || x < 0) return false;
		if (y >= this.level[0].length || y < 0) return false;
		return this.level[x][y] == Level.FLOOR;
	}
	neighbors(node) {
		var x = node.x,
			y = node.y,
			neighbors = [],
			grid = this.grid,
			s0 = false,
			d0 = false,
			s1 = false,
			d1 = false,
			s2 = false,
			d2 = false,
			s3 = false,
			d3 = false;

		// North
		if (this.isWalkableAt(x, y - 1)) {
			neighbors.push(grid[x][y - 1]);
			s0 = true;
		}
		// East
		if (this.isWalkableAt(x + 1, y)) {
			neighbors.push(grid[x + 1][y]);
			s1 = true;
		}
		// South
		if (this.isWalkableAt(x, y + 1)) {
			neighbors.push(grid[x][y + 1]);
			s2 = true;
		}
		// West
		if (this.isWalkableAt(x - 1, y)) {
			neighbors.push(grid[x - 1][y]);
			s3 = true;
		}

		if (!this.diagonal) {
			return neighbors;
		}

		// do not allow diagonal movement when close to objects
		if (this.dontCrossCorners) {
			d0 = s3 && s0;
			d1 = s0 && s1;
			d2 = s1 && s2;
			d3 = s2 && s3;
		}

		// Northwest
		if (d0 && this.isWalkableAt(x - 1, y - 1)) {
			neighbors.push(grid[x - 1][y - 1]);
		}
		// Northeast
		if (d1 && this.isWalkableAt(x + 1, y - 1)) {
			neighbors.push(grid[x + 1][y - 1]);
		}
		// Southeast
		if (d2 && this.isWalkableAt(x + 1, y + 1)) {
			neighbors.push(grid[x + 1][y + 1]);
		}
		// Southwest
		if (d3 && this.isWalkableAt(x - 1, y + 1)) {
			neighbors.push(grid[x - 1][y + 1]);
		}

		return neighbors;
	}
	toString() {
		var graphString = [];
		var nodes = this.grid;
		for (var x = 0; x < nodes.length; x++) {
			var rowDebug = [];
			var row = nodes[x];
			for (var y = 0; y < row.length; y++) {
				rowDebug.push(row[y].weight);
			}
			graphString.push(rowDebug.join(" "));
		}
		return graphString.join("\n");
	}
}
