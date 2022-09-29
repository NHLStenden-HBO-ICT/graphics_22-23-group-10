import { Astar, Graph } from "./Astar.js";
import { Level } from "./Level.js";
import * as THREE from "../node_modules/three/build/three.module.js";

export class Ai{
    //add general code for the AI (pathfinding etc)
    threshold = 0.2;

    pathfinding(pacmanPos, playerPos){
        // console.log(pacmanPos);
        let astar = new Astar();

        let graph = new Graph(Level.getLevelData);

        // var start = graph.grid[Math.round(pacmanPos.x)][Math.round(pacmanPos.z)];
        var start = graph.grid[7][5];
        // var end = graph.grid[Math.round(playerPos.x)][Math.round(playerPos.z)];
        var end = graph.grid[15][15];
        // console.log(start);
        var result = astar.search(graph, start, end);

        //console.log(result[0].x);
        return result;
    }
    
    isPositionReached(pos, targetpos){
        let t = new THREE.Vector3();
        t.copy(targetpos);
        targetpos.multiplyScalar(Level.getScaleFactor);
        let dPos = pos.sub(targetpos);
        if(dPos.x < this.threshold && dPos.x > -this.threshold){
            if(dPos.z < this.threshold && dPos.z > -this.threshold){
                return true;
            }
        }
        return false;
    }
    
}