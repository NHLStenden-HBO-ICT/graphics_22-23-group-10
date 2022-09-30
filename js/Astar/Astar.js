import { BinaryHeap } from "./BinaryHeap";
import { Graph } from "./Graph";
import { GridNode } from "./Gridnode";

export class Astar {

	constructor() {
		this.graph = Graph;
		this.start = GridNode;
		this.end = GridNode;
		this.closestOption = Boolean;

		this.gridIn = Array;

		this.diagonalOption = Boolean;
		this.dontCrossCornersOption = Boolean;
	}

	search(graph, start, end) {
		this.graph = graph;
		this.start = start;
		this.end = end;

		graph.cleanDirty();
		var heuristic = this.diagonal;
		var closest = this.closestOption || false;

		var openHeap = getHeap();
		var closestNode = start; // set the start node to be the closest if required

		start.h = heuristic(start, end);
		graph.markDirty(start);

		openHeap.push(start);

		while (openHeap.size() > 0) {
			// Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
			var currentNode = openHeap.pop();

			// End case - result has been found, return the traced path.
			if (currentNode === end) {
				return pathTo(currentNode);
			}

			// Normal case - move currentNode from open to closed, process each of its neighbors.
			currentNode.closed = true;

			// Find all neighbors for the current node.
			var neighbors = graph.neighbors(currentNode);

			for (var i = 0, il = neighbors.length; i < il; ++i) {
				var neighbor = neighbors[i];

				if (neighbor.closed || neighbor.isWall()) {
					// Not a valid node to process, skip to next neighbor.
					continue;
				}

				// The g score is the shortest distance from start to current node.
				// Check if the path we have arrived at this neighbor is the shortest one found yet.
				var gScore = currentNode.g + neighbor.getCost(currentNode);
				var beenVisited = neighbor.visited;

				if (!beenVisited || gScore < neighbor.g) {
					// Found an optimal (so far) path to this node.  Take score for node to see how good it is.
					neighbor.visited = true;
					neighbor.parent = currentNode;
					neighbor.h = neighbor.h || heuristic(neighbor, end);
					neighbor.g = gScore;
					neighbor.f = neighbor.g + neighbor.h;
					graph.markDirty(neighbor);
					if (closest) {
						// If the neighbour is closer than the current closestNode or if it's equally close but has
						// a cheaper path than the current closest node then it becomes the closest node
						if (
							neighbor.h < closestNode.h ||
							(neighbor.h === closestNode.h && neighbor.g < closestNode.g)
						) {
							closestNode = neighbor;
						}
					}

					if (!beenVisited) {
						// Pushing to heap will put it in proper place based on the 'f' value.
						openHeap.push(neighbor);
					} else {
						// Already seen the node, but since it has been rescored we need to reorder it in the heap
						openHeap.rescoreElement(neighbor);
					}
				}
			}
		}
		if (closest) {
			return pathTo(closestNode);
		}
		return [];
	}

  // Different pathfinding heuristics
	manhattan(pos0, pos1) {
		var d1 = Math.abs(pos1.x - pos0.x);
		var d2 = Math.abs(pos1.y - pos0.y);
		return d1 + d2;
	}
	diagonal(pos0, pos1) {
		var D = 1;
		var D2 = Math.sqrt(2);
		var d1 = Math.abs(pos1.x - pos0.x);
		var d2 = Math.abs(pos1.y - pos0.y);
		return D * (d1 + d2) + (D2 - 2 * D) * Math.min(d1, d2);
	}

	static cleanNode(node) {
		node.f = 0;
		node.g = 0;
		node.h = 0;
		node.visited = false;
		node.closed = false;
		node.parent = null;
	}
}

function pathTo(node) {
	var curr = node;
	var path = [];
	while (curr.parent) {
		path.unshift(curr);
		curr = curr.parent;
	}
	return path;
}

function getHeap() {
	return new BinaryHeap(function (node) {
		return node.f;
	});
}

















