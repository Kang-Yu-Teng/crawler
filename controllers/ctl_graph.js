//import { Graph, Digraph } from "graphviz-node";
import { attribute, Digraph, Subgraph, Node, Edge, toDot }  from "ts-graphviz";
//import pkg from "sha1";
//import {HashDog} from 'hashdog';
import md5 from "md5";

import missionModel from "../models/mod_mission.js";
import nodeModel from "../models/mod_node.js";
import edgeModel from "../models/mod_edge.js";
import crawlerController from "./ctl_crawler.js";
import crawlerControllerCore from "./ctl_crawler_core.js";
import pkg from "he";
const {he} = pkg;

function makeGraph(Missions){
    let g = new Digraph("Missions",{
        [attribute.newrank] : true,
        [attribute.overlap] : false,
        [attribute.splines] : true,
        [attribute.nodesep] : 0.5,
    });
    let l = new Subgraph();
    let top = new Subgraph("top",{
        [attribute.rank] : "same"
    });
    try{
        for (const [key, value] of Object.entries(Missions)) {
            //console.log(key, value);
            //root
    
            top.addNode(value["root"]["obj"]);
    
            //nodes
            var mission_number = key;
            var A = new Subgraph("cluster_" + mission_number, {
                [attribute.label]: "任務:"+value["name"]
            });
            g.addSubgraph(A);
            var nodes = value["nodes"];
            for (let i=0; i<nodes.length; i++) {
                A.addNode(nodes[i]["obj"]);
            }
            //edges
            var edges = value["edges"];
            var uni_edges = {};
            for (let i=0; i<edges.length; i++) {
                var current_edge_id = edges[i]["id"];
                if(uni_edges[current_edge_id] == undefined){
                    uni_edges[current_edge_id] = edges[i];
                    l.addEdge(edges[i]["obj"]);
                }
            }
        }     
    }catch(e){
        console.log("graph error: ",e);
    }
   


    g.addSubgraph(l); /* 加入所有邊 */
    g.addSubgraph(top); /* 加入最高rank */
    var dot = toDot(g);
    //console.log(dot);
    return dot;
}

function makeSimpleGraph(Missions){
    let g = new Digraph("Missions",{
        [attribute.newrank] : true,
        [attribute.overlap] : false,
        [attribute.splines] : true,
        [attribute.nodesep] : 0.5,
    });
    let l = new Subgraph();
    let top = new Subgraph("top",{
        [attribute.rank] : "same"
    });

    try{
        var node_link_to_id = {};
        /* 只找共通點 */
        var common_nodes = {};
        for (const [key, value] of Object.entries(Missions)) {
            var nodes = value["nodes"];
            for (let i=0; i<nodes.length; i++) {
                if(common_nodes[nodes[i]["id"]]==undefined){
                    common_nodes[nodes[i]["id"]] = 1;
                }else{
                    common_nodes[nodes[i]["id"]] = common_nodes[nodes[i]["id"]] + 1;
                }
                node_link_to_id[nodes[i]["link"]] = nodes[i]["id"];
            }
        }
        /* 刪除沒有共通的 */
        for (const [key, value] of Object.entries(common_nodes)) {
            if(value<=1){
                delete common_nodes[key];
            }
        }
        /* root是特例 */
        for (const [key, value] of Object.entries(Missions)) {
            if(common_nodes[value["root"]["id"]]==undefined){
                common_nodes[value["root"]["id"]]=1;
            }
            node_link_to_id[value["root"]["link"]] = value["root"]["id"];
        }

        for (const [key, value] of Object.entries(Missions)) {
            //console.log(key, value);
            //root
            top.addNode(value["root"]["obj"]);
    
            //nodes
            var mission_number = key;
            var A = new Subgraph("cluster_" + mission_number, {
                [attribute.label]: "任務:"+value["name"]
            });
            g.addSubgraph(A);
            var nodes = value["nodes"];
            for (let i=0; i<nodes.length; i++) {
                if(common_nodes[nodes[i]["id"]]!=undefined){
                    A.addNode(nodes[i]["obj"]);
                }
            }
            //edges
            var edges = value["edges"];
            var uni_edges = {};
            for (let i=0; i<edges.length; i++) {
                var current_edge_id = edges[i]["id"];
                if(uni_edges[current_edge_id] == undefined){
                    var from_id = node_link_to_id[edges[i]["from_link"]];
                    var to_id = node_link_to_id[edges[i]["to_link"]];
                    if(common_nodes[from_id]!=undefined && common_nodes[to_id]!=undefined){
                        uni_edges[current_edge_id] = edges[i];
                        l.addEdge(edges[i]["obj"]);
                    }
                }
            }
        }     
    }catch(e){
        console.log("graph error: ",e);
    }
   


    g.addSubgraph(l); /* 加入所有邊 */
    g.addSubgraph(top); /* 加入最高rank */
    var dot = toDot(g);
    //console.log(dot);
    return dot;
}


const graphController = {
    getDemo: (target)=> {
        //target from crawlerController
        let g = new Digraph("Missions",{
            [attribute.newrank] : true,
            [attribute.overlap] : false,
            [attribute.splines] : true,
            [attribute.nodesep] : 0.5
        });

        var mission_number = "1";
        var A = new Subgraph(mission_number, {
            [attribute.label]: "任務:1"
        });

        var n = new Node('node1', {
            [attribute.color]: 'red',
            [attribute.label]:`<<table border="0" cellspacing="10" cellpadding="10" style="rounded"><tr><td href="` + 
            `http://books_wiki.com/books/13f3c` + `" border="0" cellspacing="10" cellpadding="10" style="rounded">詩經</td></tr></table>>`
        });
        var dn = new Node('node1', {
            [attribute.color]: 'red',
            [attribute.label]:`<<table border="0" cellspacing="10" cellpadding="10" style="rounded"><tr><td href="` + 
            `http://books_wiki.com/books/13f3c` + `" border="0" cellspacing="10" cellpadding="10" style="rounded">詩經</td></tr></table>>`
        });

        g.addSubgraph(A);
        A.addNode(n);
        A.addNode(dn);

        // Print dot file
        let dotScript = toDot(g);
        console.log(dotScript);
        //var hash = md5("value");
        //console.log(hash);
        return dotScript;
    },
    get: async (target)=>{

        var result = makeGraph(target);

        return result;
    },
    getSimple: async (target)=>{
        var result = makeSimpleGraph(target);
        return result;
    }
  }
  
  export default graphController;