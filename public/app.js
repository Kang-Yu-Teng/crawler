import express from 'express'; 
import path from 'path'; 
import cookieParser from 'cookie-parser'; 
import logger from 'morgan';

//controler
import crawlerController from '../controllers/ctl_crawler.js';
import graphController from '../controllers/ctl_graph.js';

//router
import indexRouter from '../routes/index.js';

//import todoController from '../controllers/ctl_todo.js'

//var Crawler = import("crawler");
//var Cheerio = import("cheerio");
//var Url = import('url-parse');

import Url from 'url-parse';

import Cheerio from 'cheerio';

import Crawler from 'crawler';

import fs from 'fs';


import createError from 'http-errors';
import { name } from 'ejs';
//import { next } from 'cheerio/lib/api/traversing';
//const {createError} = pkg;
//var createError = import('http-errors');

var __dirname = path.resolve();
var app = express();
app.use(express.urlencoded({
  extended: false
  }))
//var router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Setting
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/', indexRouter);
app.use(express.static('public'))


/*
app.use('/', function (req, res, next) {
  //onsole.log("missionlist: " + missionlist);
  res.render('index.ejs', { missionlist: missionlist }); 
  //var item = req.body.item;
  //missionlist.push(item);
  //res.send(item);
})

app.get('/', function (req, res, next) {
  //onsole.log("missionlist: " + missionlist);
  res.render('index.ejs', { missionlist: missionlist }); 
  //var item = req.body.item;
  //missionlist.push(item);
  //res.send(item);
})
*/
/*
//test add-mission
app.post('/add-mission', function (req, res) {
  var item = req.body.item;
  missionlist.push(item);
  console.log("missionlist push: " + missionlist);
  //res.redirect('/');
  res.send(item);
})
*/

// test crawler
app.use('/crawler', function (req, res) {
  var result = []
  var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    
    callback : function (error, res, done) {
      
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            var shelves_content=Cheerio.load($("main[class='content-wrap mt-m card']").html());
            var bookshelf_links=shelves_content("div[class='grid third'] > a[data-entity-type='bookshelf']").each(
              function(){
                console.log($(this).attr("href"));
                var url = new Url($(this).attr("href"));
                result.push($(this).attr("href"));
                console.log("-------------------");
              }
            );
            //console.log(bookshelf_links)
        }
        console.log(result);


        //const pattern = "/\*\/shelves/";
        //regex = new RegExp(pattern);
        //console.log(regex.test(result[0]));
        done();
    }
  });
  c.queue('https://demo.bookstackapp.com/shelves');
})

// test graph
app.post('/graph', function (req, res) {
  console.log(req.body.item)
  var dotSrc = `
digraph {
    node [color="blue", shape = "record", style = "rounded" ];
    overlap = false;
    splines = true;
    nodesep = 0.5;

	newrank=true;

    subgraph cluster_1 {
        label="??????:1"
        c1n1[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr>
            <td href="http://books_wiki.com/books/13f3c" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td>
            </tr>
            </table>>
        ]
        c1n2[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr>
            <td href="https://fanti.dugushici.com/ancient_proses/168" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td>
            </tr>
            </table>>
        ]
    }

    subgraph cluster_2 {
        label="??????:2"
        c2n1[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/shelves/9b04d" border="0" cellspacing="10" cellpadding="10" style="rounded">?????????</td></tr>
            </table>>
        ]
        c2n2[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/shelves/9b04d" border="0" cellspacing="10" cellpadding="10" style="rounded">????????????????????????</td></tr>
            </table>>
        ]
        c2n3[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/books/fccb6" border="0" cellspacing="10" cellpadding="10" style="rounded">????????????</td></tr>
            </table>>
        ]
        c2n4[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/books/34ed0" border="0" cellspacing="10" cellpadding="10" style="rounded">?????????</td></tr>
            </table>>
        ]
        c2n5[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/books/34ed0" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td></tr>
            </table>>
        ]
        c2n6[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/books/34ed0" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td></tr>
            </table>>
        ]
        c2n7[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="https://ctext.org/taiping-yulan/zh" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td></tr>
            </table>>
        ]
        c2n8[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="https://zh.wikipedia.org/wiki/%E5%B7%A6%E6%80%9D" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td></tr>
            </table>>
        ]
        c2n9[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="https://www.google.com/maps/dir//%E9%8E%AC%E4%BA%AC%E6%9D%91+%E4%B8%AD%E5%9C%8B%E9%99%9D%E8%A5%BF%E7%9C%81%E8%A5%BF%E5%AE%89%E5%B8%82%E9%95%B7%E5%AE%89%E5%8D%80+%E9%82%AE%E6%94%BF%E7%BC%96%E7%A0%81:+710116/@34.5717836,108.1292941,8.54z/data=!4m8!4m7!1m0!1m5!1m1!1s0x36639d683e4d5745:0xde5052b30a385d8a!2m2!1d108.794131!2d34.243237" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td></tr>
            </table>>
        ]
        c2n10[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="https://www.chinesewords.org/dict/7656-945.html" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td></tr>
            </table>>
        ]
    }

    subgraph header {
        {rank = same; c1n1; c2n1;}
    }
    subgraph link{
        c1n1->c1n2 [label="????????????"]
        c2n1->c2n2 [label="[???]"]
        c2n2->c1n1 [label="????????????"]
        c2n2->c2n3 [label="????????????"]
        c2n2->c2n4 [label="????????????"]
        c2n2->c2n5 [label="????????????"]
        c2n2->c2n6 [label="????????????"]
        c2n3->c2n7 [label="????????????"]
        c2n4->c2n8 [label="????????????"]
        c2n5->c2n9 [label="????????????"]
        c2n6->c2n10 [label="????????????"]
    }
  

}
`;
  res.render('graphviz.ejs', { dot: dotSrc });   
})

app.use('/graph', function (req, res) {
  var dotSrc = `
digraph {
    node [color="blue", shape = "record", style = "rounded" ];
    overlap = false;
    splines = true;
    nodesep = 0.5;
	  newrank=true;

    subgraph cluster_1 {
        label="??????:1"
        c1n1[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr>
            <td href="http://books_wiki.com/books/13f3c" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td>
            </tr>
            </table>>
        ]
        c1n2[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr>
            <td href="https://fanti.dugushici.com/ancient_proses/168" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td>
            </tr>
            </table>>
        ]
    }

    subgraph cluster_2 {
        label="??????:2"
        c2n1[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/shelves/9b04d" border="0" cellspacing="10" cellpadding="10" style="rounded">?????????</td></tr>
            </table>>
        ]
        c2n2[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/shelves/9b04d" border="0" cellspacing="10" cellpadding="10" style="rounded">????????????????????????</td></tr>
            </table>>
        ]
        c2n3[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/books/fccb6" border="0" cellspacing="10" cellpadding="10" style="rounded">????????????</td></tr>
            </table>>
        ]
        c2n4[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/books/34ed0" border="0" cellspacing="10" cellpadding="10" style="rounded">?????????</td></tr>
            </table>>
        ]
        c2n5[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/books/34ed0" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td></tr>
            </table>>
        ]
        c2n6[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="http://books_wiki.com/books/34ed0" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td></tr>
            </table>>
        ]
        c2n7[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="https://ctext.org/taiping-yulan/zh" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td></tr>
            </table>>
        ]
        c2n8[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="https://zh.wikipedia.org/wiki/%E5%B7%A6%E6%80%9D" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td></tr>
            </table>>
        ]
        c2n9[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="https://www.google.com/maps/dir//%E9%8E%AC%E4%BA%AC%E6%9D%91+%E4%B8%AD%E5%9C%8B%E9%99%9D%E8%A5%BF%E7%9C%81%E8%A5%BF%E5%AE%89%E5%B8%82%E9%95%B7%E5%AE%89%E5%8D%80+%E9%82%AE%E6%94%BF%E7%BC%96%E7%A0%81:+710116/@34.5717836,108.1292941,8.54z/data=!4m8!4m7!1m0!1m5!1m1!1s0x36639d683e4d5745:0xde5052b30a385d8a!2m2!1d108.794131!2d34.243237" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td></tr>
            </table>>
        ]
        c2n10[label=<<table border="0" cellspacing="10" cellpadding="10" style="rounded">
            <tr><td href="https://www.chinesewords.org/dict/7656-945.html" border="0" cellspacing="10" cellpadding="10" style="rounded">??????</td></tr>
            </table>>
        ]
    }

    subgraph header {
        {rank = same; c1n1; c2n1;}
    }
    subgraph link{
        c1n1->c1n2 [label="????????????"]
        c2n1->c2n2 [label="[???]"]
        c2n2->c1n1 [label="????????????"]
        c2n2->c2n3 [label="????????????"]
        c2n2->c2n4 [label="????????????"]
        c2n2->c2n5 [label="????????????"]
        c2n2->c2n6 [label="????????????"]
        c2n3->c2n7 [label="????????????"]
        c2n4->c2n8 [label="????????????"]
        c2n5->c2n9 [label="????????????"]
        c2n6->c2n10 [label="????????????"]
    }
  

}
`;
  var dot_from_ctl_graph = graphController.get(null);
  res.render('graphviz.ejs', { dot: dot_from_ctl_graph }); 
})

// test rule
app.use('/rule', function (req, res){
  var test_url = "https://demo.bookstackapp.com/shelves/demo-content";
  var result = crawlerController.getType(test_url);
  console.log("rule: "+result);

})

//test demo
app.use('/demo',function (req,res){
    var xmlFile_1 = fs.readFileSync(__dirname+'/data/DILA.xml', 'utf8');
    const xml_dila_1 = Cheerio.load(xmlFile_1,{
        xmlMode: true
    });

    var xmlFile_2 = fs.readFileSync(__dirname+'/data/Buddhist_Studies_Person_Authority.xml', 'utf8');
    const xml_dila_2 = Cheerio.load(xmlFile_2,{
        xmlMode: true
    });
    console.log("demo");

    var record_1 = {};
    var record_2 = {};
    var $=xml_dila_1;
    xml_dila_1(`document[filename]`).each(
        function(){
            var id = $(this).attr("filename");
            var name = $(this).find(`PersonName`).first().text();
            record_1[id] = name;
            //console.log(id,"/",name);
        }
    );
    $=xml_dila_2;
    xml_dila_2(`person`).each(
        function(){
            var id = "dila_" + $(this).attr("xml:id");
            var name = $(this).find(`persName`).first().text();
            //console.log(id,"/",name);
            record_2[id] = name;
        }
    );

    for (const [key, value] of Object.entries(record_1)) {
        //console.log(key, value);
        var v1 = record_1[key];
        var v2 = record_2[key];
        if(v1 != undefined){
            v1 = v1.trim();
        }
        if(v2 != undefined){
            v2 = v2.trim();
        }
        if(v1 !== v2 && v1!=undefined && v2!=undefined){
            console.log(key,v1,v2);
        }
    }

    console.log("demo done");
})

//test missions

app.use('/crawler',function (req,res){
  var demo_data = crawlerController.getDemo();
  var demo_result = graphController.get(demo_data);
  res.render('graphviz.ejs', { dot: demo_result }); 
})
app.post('/create-item', function (req, res) {
  console.log(req.body.item)
  res.send("Thank for submit the form")
  })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  //next(createError(404));
  next(res.redirect('/'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.error(err);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});



export default app;
