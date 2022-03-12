import md5 from "md5";
import { attribute, Digraph, Subgraph, Node, Edge, toDot }  from "ts-graphviz";

const missionModel = {
    create: (mission_name,nodes,edges) => {
        var dict = new Object();
        dict["name"] = mission_name;
        if(nodes!=null){
            if(nodes[0]!=null){
                dict["root"] = nodes[0];
            }
        }
        dict["nodes"] = nodes;
        dict["edges"] = edges;

        return dict;
    }
}
  
export default missionModel