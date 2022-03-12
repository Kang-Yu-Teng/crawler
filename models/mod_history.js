//import { val } from "cheerio/lib/api/attributes";
//import md5 from "md5";
//import { attribute, Digraph, Subgraph, Node, Edge, toDot }  from "ts-graphviz";

const historyModel = {
    create: () => {
        var dict = new Object();
        var node_history = {};
        var edge_history = {};
        dict["node_history"] = node_history;
        dict["edge_history"] = edge_history;

        return dict;
    },
    addNode: (dict,key,value)=>{
        dict["node_history"][key] = value;
        return dict;
    },
    addEdge: (dict,key,value)=>{
        dict["edge_history"][key] = value;
        return dict;
    }
}
  
export default historyModel