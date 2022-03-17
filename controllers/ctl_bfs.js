import crawlerControllerCore from "./ctl_crawler_core.js";
import crawlerRuleModel from "../models/mod_crawler_rule.js";
import nodeModel from "../models/mod_node.js";
import edgeModel from "../models/mod_edge.js";
import missionModel from "../models/mod_mission.js"
import crypto from 'crypto'
import e from "connect-flash";


var missionQueue = [];

function convertToMission(target,nodeBanlist,edgeBanlist,lifepoint=0,parent_url=""){
    var mission = {};
    mission['url'] = target["href"];
    var pattern = crawlerRuleModel.get(mission['url']);
    var rule = crawlerRuleModel.create(pattern, nodeBanlist,edgeBanlist);
    mission['rule'] = rule;
    mission['root_flag'] = false;
    mission['lifepoint'] = lifepoint;
    mission['parent_url'] = parent_url;
    return mission;
}

const bfsController = {
    enqueue: (target,lifepoint=0,root_flag=false,parent_url="") => {
        var mission = {};
        mission['url'] = target;

        var pattern = crawlerRuleModel.get(mission['url']);
        var rule = crawlerRuleModel.create(pattern);
        mission['rule'] = rule;
        mission['root_flag'] = root_flag;
        mission['lifepoint'] = lifepoint;
        //mission['parrent_height'] = 0;
        mission['parent_url'] = parent_url;
        missionQueue.push(mission);
    },
    dequeue: () => {
        return missionQueue.shift();
    },
    runAll: async (id,old_bfs_history,width_limit)=>{
        var nodes = [];
        var edges = [];
        var child_limit_record = {};
        var confirm_child_record = {};
        //var parent = {};
        while(missionQueue.length > 0) {
            /* 取出任務 */
            var mission = missionQueue.shift();

            /* 限制初始化 */
            if(child_limit_record[mission['url']]==undefined){
                child_limit_record[mission['url']]=width_limit[mission['lifepoint']];
            }
            if(confirm_child_record[mission['url']]==undefined){
                confirm_child_record[mission['url']]=0;
            }
            console.log("p: ",mission['parent_url']);

            if (old_bfs_history[mission['url']]!=undefined && mission['root_flag']==false){
                /* 非root且出現過就跳過 */
                console.log("********skip******** ", mission['url']);
                continue;
            }

            /* 運行任務 */
            var result = await crawlerControllerCore.run(mission['url'],mission['rule'])
            var newNodeBanlist = Object.assign({},mission['rule'].nodeBanlist);
            var newEdgeBanlist = Object.assign({},mission['rule'].edgeBanlist);
            if(result != null){
                /* 添加當前點資料 */              
                var current_node = nodeModel.create(result["name"],mission['url']);
                if(old_bfs_history[mission['url']]!=undefined && mission['root_flag']==true){
                    /* 是root且出現過就創不同hash的 */
                    console.log("********dup******** ", mission['url']);
                    current_node = nodeModel.create(result["name"],mission['url'],crypto.randomBytes(20).toString('hex'));
                    var old_relation = "[相同]";
                    var old_node = old_bfs_history[mission['url']];
                    /* 添加邊資料 */
                    var old_edge = edgeModel.create(current_node["obj"],old_node["obj"],old_relation,current_node["link"],old_node["link"]);
                    //nodes.push(child_node);
                    edges.push(old_edge);
                    nodes.push(current_node); 
                    old_bfs_history[mission['url']]=current_node;
                    //continue;
                }
                old_bfs_history[mission['url']]=current_node;
                nodes.push(current_node);  /* 每個節點都必須完成資料更新 */
                if(mission['rule'].solverType != 'wikipedia_pattern' || crawlerRuleModel.get(mission['parent_url']) != 'wikipedia_pattern' ){
                            
                    let maxValue = 1;
                    for(const [key, value] of Object.entries(child_limit_record)) {
                        if(value > maxValue) {
                            maxValue = value;
                        }
                    }
                    child_limit_record[mission['url']] = maxValue;

                }
                if(mission['rule'].solverType == 'wikipedia_pattern' && crawlerRuleModel.get(mission['parent_url']) != 'wikipedia_pattern' ){
                            
                    let maxValue = 1;
                    for(const [key, value] of Object.entries(child_limit_record)) {
                        if(value > maxValue) {
                            maxValue = value;
                        }
                    }
                    if(mission['root_flag']==true){
                        child_limit_record[mission['url']] = maxValue;
                    }else{
                        child_limit_record[mission['url']] = maxValue/10;
                    }
                    
                }
                if(mission['lifepoint'] < 0){
                    /* 壽命已盡 */
                    continue;
                }
                /* 子點處理 */
                result['child'].forEach(
                    (value)=>{
                        /* 準備下次任務 */
                        var new_mission = convertToMission(value,newNodeBanlist,newEdgeBanlist,mission['lifepoint']-1,mission['url']);
                        /* 聲明關係 */
                        var relation = "";
                        var title = value["title"];
                        var href = value["href"];
                        var child_name = "unknown";
                        //const url = new URL(href);
                        //child_name = decodeURI(url.pathname);
                        if(title!=undefined || title!=null){
                            relation = title;
                            //child_name = title;
                        }
                        if(old_bfs_history[href]!=undefined){
                            if(old_bfs_history[href]["name"]!="unknown"){
                                child_name = old_bfs_history[href]["name"];
                            }
                        }
                        
                        /* 添加子點資料 */
                        var child_node = nodeModel.create(child_name,href);
                        if(old_bfs_history[href]!=undefined){
                            child_node = old_bfs_history[href];
                        }
                        /* 添加邊資料 */
                        var child_edge = edgeModel.create(current_node["obj"],child_node["obj"],relation,current_node["link"],child_node["link"]);
                        /*
                        parent[href] = mission['url']; 
                        if(confirm_child_record[parent[href]]==undefined){
                            confirm_child_record[parent[href]]=0;
                        }
                        */


                        if(old_bfs_history[href]==undefined){
                            if(confirm_child_record[mission['url']]!=undefined){
                                confirm_child_record[mission['url']] = confirm_child_record[mission['url']]+1;
                                if(confirm_child_record[mission['url']]>child_limit_record[mission['url']]){
                                    return;
                                }
                            }
                            console.log("rate: ",confirm_child_record[mission['url']],"/",child_limit_record[mission['url']],"/",mission['url'],"/",new_mission['url']);
                            nodes.push(child_node);
                            edges.push(child_edge);
                            missionQueue.push(new_mission);
                            //confirm_child_record[parent[href]] = confirm_child_record[parent[href]] + 1;
                        }else{
                            child_limit_record[mission['url']] = child_limit_record[mission['url']] + 1;
                            if(confirm_child_record[mission['url']]!=undefined){
                                //confirm_child_record[mission['url']] = confirm_child_record[mission['url']]+1;
                                if(confirm_child_record[mission['url']]>child_limit_record[mission['url']]){
                                    child_limit_record[mission['url']] = child_limit_record[mission['url']] - 1;
                                    return;
                                }
                            }
                            console.log("rate: ",confirm_child_record[mission['url']],"/",child_limit_record[mission['url']],"/",mission['url']);
                            nodes.push(child_node);
                            edges.push(child_edge);
                            missionQueue.push(new_mission);
                        }
                        //child_limit_record[parent[href]] = width_limit[mission['lifepoint']];
                        //console.log(confirm_child_record);
                        /*
                        if(confirm_child_record[parent[href]] < child_limit_record[parent[href]]){
                        }
                        */
                        
                    }
                )
            }
        }

        return  missionModel.create(id,nodes,edges);
    }

  }
  
  export default bfsController;