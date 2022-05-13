//const todoModel = import('../models/mod_todo.js');  // 引入 model
//const crawlerRuleModel = import('../models/mod_crawler_rule.js');
import crawlerRuleModel from '../models/mod_crawler_rule.js';
import missionModel from "../models/mod_mission.js";
import nodeModel from "../models/mod_node.js";
import edgeModel from "../models/mod_edge.js";
import bfsController from './ctl_bfs.js';
import historyModel from '../models/mod_history.js';
import crawlerControllerCore from './ctl_crawler_core.js';

const crawlerController = {
  getType: (target)=> {
    return crawlerRuleModel.get(target);
  },
  getDemo: ()=>{
    //create mission 1
    var nodes1 = [];
    var edges1 = [];
    nodes1.push(nodeModel.create("詩經","http://books_wiki.com/books/13f3c"));
    nodes1.push(nodeModel.create("藝文類聚","http://books_wiki.com/books/34173"));
    edges1.push(edgeModel.create(nodes1[0]["obj"],nodes1[1]["obj"],"關係",nodes1[0]["link"],nodes1[1]["link"]));
    var m1 = missionModel.create("1",nodes1,edges1);
    //create mission 2
    var nodes2 = [];
    var edges2 = [];
    nodes2.push(nodeModel.create("太平御覽","http://books_wiki.com/books/fccb6"));
    nodes2.push(nodeModel.create("左太沖","http://books_wiki.com/books/bca82"));
    edges2.push(edgeModel.create(nodes2[0]["obj"],nodes2[1]["obj"],"關係",nodes2[0]["link"],nodes2[1]["link"]));
    edges2.push(edgeModel.create(nodes1[0]["obj"],nodes2[1]["obj"],"關係",nodes1[0]["link"],nodes2[1]["link"]));
    edges2.push(edgeModel.create(nodes2[1]["obj"],nodes1[0]["obj"],"關係",nodes2[1]["link"],nodes1[0]["link"]));
    edges2.push(edgeModel.create(nodes2[0]["obj"],nodes1[1]["obj"],"關係",nodes2[0]["link"],nodes1[1]["link"]));
    
    var m2 = missionModel.create("2",nodes2,edges2);
    //create mission set   
    var dict = new Object();
    dict["1"] = m1;
    dict["2"] = m2;
    return dict;
  },
  get: async (missionlist) => {
    /* 初始化參數 */
    var history = historyModel.create(); /* 建立過往的節點與邊的紀錄 */
    var dict = new Object();
    /* 存取任務列表 */
    for(var key in missionlist){
      //console.log("mission: ",key,missionlist[key]);
      /* 運行BFS演算法 */
      var root_flag = true;
      var init_lifepoint = 12;
      var width_dict = {};
      var div_param = Object.keys(missionlist).length;
      for (let i = 0; i < init_lifepoint; i++) {
        width_dict[i] = 1;
      }
      width_dict[init_lifepoint] = 20;
      width_dict[init_lifepoint-1] = 20;
      width_dict[init_lifepoint-2] = 20;
      width_dict[init_lifepoint-2] = 20;


      bfsController.enqueue(missionlist[key],init_lifepoint,root_flag,"");
      dict[key] = await bfsController.runAll(key,history["node_history"],width_dict);
      //console.log(history["node_history"]);
    }

    
    return dict;
  },
  testCrawlerCore: async (target,pattern) => {
    var rule = crawlerRuleModel.create(pattern);
    var value = crawlerControllerCore.run(target,rule);
    
    return value;
  }
}

export default crawlerController;