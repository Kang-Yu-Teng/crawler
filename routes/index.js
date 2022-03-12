import express from 'express'; 
var router = express.Router();
import fs from 'fs';
import path from 'path';
var __dirname = path.resolve();
import {renderDot} from 'render-dot'

/* controler*/
import crawlerController from '../controllers/ctl_crawler.js';
import graphController from '../controllers/ctl_graph.js';
import missionModel from '../models/mod_mission.js';
import crawlerRuleModel from '../models/mod_crawler_rule.js';

//var missionlist = [];
var missionlist = {};
var id_counter = 0;

/* test data */
var dotSrc = `
digraph {
    node [color="blue", shape = "record", style = "rounded" ];
    overlap = false;
    splines = true;
    nodesep = 0.5;
	  newrank=true;

    subgraph cluster_1 {
        label="任務:1"
        c1n1[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr>
            <td href="http://books_wiki.com/books/13f3c" border="0" cellspacing="10" cellpadding="10" style="rounded">詩經</td>
            </tr>
            </table>>
        ]
        c1n2[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr>
            <td href="https://fanti.dugushici.com/ancient_proses/168" border="0" cellspacing="10" cellpadding="10" style="rounded">連結</td>
            </tr>
            </table>>
        ]
    }

    subgraph cluster_2 {
        label="任務:2"
        c2n1[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/shelves/9b04d" border="0" cellspacing="10" cellpadding="10" style="rounded">推論集</td></tr>
            </table>>
        ]
        c2n2[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/shelves/9b04d" border="0" cellspacing="10" cellpadding="10" style="rounded">丙穴與嘉魚的推論</td></tr>
            </table>>
        ]
        c2n3[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/books/fccb6" border="0" cellspacing="10" cellpadding="10" style="rounded">太平御覽</td></tr>
            </table>>
        ]
        c2n4[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/books/34ed0" border="0" cellspacing="10" cellpadding="10" style="rounded">左太沖</td></tr>
            </table>>
        ]
        c2n5[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/books/34ed0" border="0" cellspacing="10" cellpadding="10" style="rounded">鎬京</td></tr>
            </table>>
        ]
        c2n6[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/books/34ed0" border="0" cellspacing="10" cellpadding="10" style="rounded">丙穴</td></tr>
            </table>>
        ]
        c2n7[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="https://ctext.org/taiping-yulan/zh" border="0" cellspacing="10" cellpadding="10" style="rounded">連結</td></tr>
            </table>>
        ]
        c2n8[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="https://zh.wikipedia.org/wiki/%E5%B7%A6%E6%80%9D" border="0" cellspacing="10" cellpadding="10" style="rounded">連結</td></tr>
            </table>>
        ]
        c2n9[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="https://www.google.com/maps/dir//%E9%8E%AC%E4%BA%AC%E6%9D%91+%E4%B8%AD%E5%9C%8B%E9%99%9D%E8%A5%BF%E7%9C%81%E8%A5%BF%E5%AE%89%E5%B8%82%E9%95%B7%E5%AE%89%E5%8D%80+%E9%82%AE%E6%94%BF%E7%BC%96%E7%A0%81:+710116/@34.5717836,108.1292941,8.54z/data=!4m8!4m7!1m0!1m5!1m1!1s0x36639d683e4d5745:0xde5052b30a385d8a!2m2!1d108.794131!2d34.243237" border="0" cellspacing="10" cellpadding="10" style="rounded">連結</td></tr>
            </table>>
        ]
        c2n10[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="https://www.chinesewords.org/dict/7656-945.html" border="0" cellspacing="10" cellpadding="10" style="rounded">連結</td></tr>
            </table>>
        ]
    }

    subgraph header {
        {rank = same; c1n1; c2n1;}
    }
    subgraph link{
        c1n1->c1n2 [label="外部資料"]
        c2n1->c2n2 [label="[書]"]
        c2n2->c1n1 [label="相關文本"]
        c2n2->c2n3 [label="相關文本"]
        c2n2->c2n4 [label="相關人物"]
        c2n2->c2n5 [label="相關地名"]
        c2n2->c2n6 [label="相關地名"]
        c2n3->c2n7 [label="外部資料"]
        c2n4->c2n8 [label="外部資料"]
        c2n5->c2n9 [label="外部資料"]
        c2n6->c2n10 [label="外部資料"]
    }
  

}
`;

/* GET home page. */ 
router.get('/', 
function(req, res, next) { 
    //var m = ["m1","m2"];
    res.render('index.ejs', { missionlist: missionlist }); 
  }
);

router.post('/start-mission', 
async function(req, res, next) { 
    /* 初始化任務 */
    var data = await crawlerController.get(missionlist);
    /* 匯入製圖工具 */
    var result = await graphController.getSimple(data);
    try {
      var svg_result = await renderDot({
          input: result, 
          format: 'svg'
        });
        fs.writeFile(path.join(__dirname, './graph.svg'), svg_result, err => {
            if (err) {
              console.error(err)
              return
            }
            //file written successfully
          })
        fs.writeFile(path.join(__dirname, './graph.dot'), result, err => {
            if (err) {
              console.error(err)
              return
            }
            //file written successfully
          })
    } catch (error) {
        console.log(error);
    }
    /* 渲染至頁面 */
    res.render('graphviz.ejs', { dot: result }); 

    //res.send('loader.ejs'); 
    /* 測試資料 */
    //var demo_data = crawlerController.getDemo();
    //var demo_result = graphController.get(demo_data);
    //var result = await crawlerController.testCrawlerCore("xxxxx","bookstack_shelves_pattern");
    //console.log("final: " , result);
    //console.log("missionlist: ", missionlist);
  }
);

router.post('/add-mission', 
function(req, res, next) { 
    //var id = Object.keys(missionlist).length;
    var item = req.body.item.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    //missionlist.push(item);
    if(crawlerRuleModel.get(item)=="normal_pattern"){
      missionlist[id_counter] = item;
    }else{
      missionlist[id_counter] = encodeURI(item);
    }
    id_counter = id_counter + 1;
    //console.log("missionlist add: " + missionlist + " id: " + id);
    res.redirect('/');

    //res.send(item);
    //console.log("add-mission");
  }
);

router.post('/delete-item', function (req, res) {
  var data = new Object();
  if(req.body.id != undefined){
    data.id = req.body.id.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  delete missionlist[data.id];
  res.redirect('/');
})

router.post('/update-item', function (req, res) {
  var data = new Object();
  //console.log(req.body.mission);
  //console.log(req.body.id);
  if(req.body.mission != undefined){
    data.mission = req.body.mission.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  if(req.body.id != undefined){
    data.id = req.body.id.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  //console.log(data);
  console.log(missionlist);
  missionlist[data.id] = data.mission;
  console.log(missionlist);
  //console.log(req.body);
  //var data = JSON.parse(req.body);
  //console.log(data);
  //res.render('index.ejs', { missionlist: missionlist }); 
  res.redirect('/');
  })

export default router;
