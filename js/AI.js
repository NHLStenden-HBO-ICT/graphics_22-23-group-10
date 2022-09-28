import * as astar from "./Astar.js";
import { Level } from "./Level.js";

export class Ai{
    //add general code for the AI (pathfinding etc)

    pathfinding(){
        let data = Level.getLevelData;
        let graph = new Graph(Level.getLevelData);
        console.log(data);

        var start = graph.grid[1][1];
        var end = graph.grid[4][5];
        console.log(start + end)
        //var result = astar.astar.search(graph, start, end);

        //console.log(result);
    }
    
    
}