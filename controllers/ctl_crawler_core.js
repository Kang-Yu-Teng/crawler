import Url from 'url-parse';

import Cheerio from 'cheerio';

import Crawler from 'crawler';

import axios, * as others from 'axios';


import createError from 'http-errors';

import crawlerRuleModel from '../models/mod_crawler_rule.js';
import { copyFileSync, utimes } from 'fs';

import url from 'url';
import xpath, { select } from 'xpath';
import { DOMParser } from 'xmldom';
import fs from 'fs';
import path from 'path';
var __dirname = path.resolve();
import htmlParser from 'html-parser';
import ADODB from 'node-adodb';

/* CBDB */
const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=data/CBDB.mdb;');

/* DILA */
var xmlFile = fs.readFileSync(__dirname+'/data/DILA.xml', 'utf8');
//var xmlFileSmall = fs.readFileSync(__dirname+'/data/small.xml', 'utf8');
const xml = Cheerio.load(xmlFile,{
    xmlMode: true
  });
//var doc = new DOMParser().parseFromString(xmlFileSmall);


function wrapUrl(target,href,title){
    var result = {};
    result["obj"] = target;
    result["href"] = href.href;
    result["title"] = title;
    return result;
}

function wrapString(target,href,title){
    var result = {};
    //result['obj'] = target;
    result['href'] = href;
    result['title'] = title;
    return result;
}



async function defaultSolver(target,rule){
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    //const current_url = new URL(target);
    try {
        //target = encodeURI(target);
        const response = await axios.get(target);
        const html = response.data;
        const $ = Cheerio.load(html);
        const current_url = new URL(target);
        var page = $.html();
        if(page != null){
          var content=Cheerio.load(page);
          var links = content("a").each(
              function(){
                /* 如果沒有在黑名單才會加入 */
                if(rule.nodeBanlist[$(this).attr("href")] == undefined){
                    var full_url = new URL($(this).attr("href"),current_url.origin);
                    var full_title = $(this).attr("title");
                    result['child'].push(wrapUrl($(this),full_url,full_title));
                }
              }
          );
          result['name'] = current_url.pathname;
        }
        //console.log(result);
        return result;
    } catch (error) {
        console.log(error);
        return result;
    }
    //return result;
}

async function bookStackShelvesSolver(target,rule){
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    try {
        //target = encodeURI(target);
        const response = await axios.get(target);
        const html = response.data;
        const $ = Cheerio.load(html);
        const current_url = new URL(target);
        var page = $("main[class='content-wrap mt-m card']").html();
        if(page != null){
          var shelves_content=Cheerio.load(page);
          var bookshelf_links = shelves_content("div[class='grid third'] > a[data-entity-type='bookshelf']").each(
              function(){
                /* 如果沒有在黑名單才會加入 */
                if(rule.nodeBanlist[$(this).attr("href")] == undefined){
                    var full_url = new URL($(this).attr("href"),current_url.origin);
                    var full_title = $(this).attr("title");
                    result['child'].push(wrapUrl($(this),full_url,full_title));
                }
              }
          );
          result['name'] = shelves_content("h1[class='list-heading']").text();
        }
        //console.log(result);
        return result;
    } catch (error) {
        console.log(error);
        return result;
    }
}

async function bookStackShelfSolver(target,rule){
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    try {
        //target = encodeURI(target);
        const response = await axios.get(target);
        const html = response.data;
        const $ = Cheerio.load(html);
        const current_url = new URL(target);
        var page = $("main[class='card content-wrap']").html();
        if(page != null){
          var content=Cheerio.load(page);
          content("div[class='grid third'] > a[data-entity-type='book']").each(
              function(){
                /* 如果沒有在黑名單才會加入 */
                if(rule.nodeBanlist[$(this).attr("href")] == undefined){
                    var full_url = new URL($(this).attr("href"),current_url.origin);
                    var full_title = $(this).attr("title");
                    result['child'].push(wrapUrl($(this),full_url,full_title));
                }
              }
          );
          result['name'] = content("div[class='flex-container-row wrap v-center'] > h1[class='flex fit-content break-text']").text();
        }else{
            console.log("resolver null: ", target);
        }
        //console.log("resolver: ",$(this).attr("href"));
        return result;
    } catch (error) {
        console.log(error);
        return result;
    }
}

async function bookStackBookSolver(target,rule){
    /* 注意Book中的下一層可能是章節也可能是頁面，章節中也可能找出頁面，只管直接頁面與直接章節，chapter expansion 內的不管 */
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    try {
        //target = encodeURI(target);
        const response = await axios.get(target);
        const html = response.data;
        const $ = Cheerio.load(html);
        const current_url = new URL(target);
        var page = $("main[class='content-wrap card']").html();
        if(page != null){
            var content=Cheerio.load(page);
            /* 找頁面 */
            content("div[class='entity-list book-contents'] > a[data-entity-type='page']").each(
                function(){
                    /* 如果沒有在黑名單才會加入 */
                    if(rule.nodeBanlist[$(this).attr("href")] == undefined){
                        var full_url = new URL($(this).attr("href"),current_url.origin);
                        var full_title = $(this).attr("title");
                        result['child'].push(wrapUrl($(this),full_url,full_title));
                    }
                }
            );
            /* 找章節 */
            content("div[class='entity-list book-contents'] > a[data-entity-type='chapter']").each(
                function(){
                    /* 如果沒有在黑名單才會加入 */
                    if(rule.nodeBanlist[$(this).attr("href")] == undefined){
                        var full_url = new URL($(this).attr("href"),current_url.origin);
                        var full_title = $(this).attr("title");
                        result['child'].push(wrapUrl($(this),full_url,full_title));
                    }
                }
            );
            result['name'] = content("h1[class='break-text']").text();
        }else{
            console.log("resolver null: ", target);
        }
        //console.log("resolver: ",$(this).attr("href"));
        return result;
    } catch (error) {
        console.log(error);
        return result;
    }
}

async function bookStackChapterSolver(target,rule){
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    try {
        //target = encodeURI(target);
        const response = await axios.get(target);
        const html = response.data;
        const $ = Cheerio.load(html);
        const current_url = new URL(target);
        var page = $("main[class='content-wrap card']").html();
        if(page != null){
          var content=Cheerio.load(page);
          content("div[class='entity-list book-contents'] > a[data-entity-type='page']").each(
              function(){
                /* 如果沒有在黑名單才會加入 */
                if(rule.nodeBanlist[$(this).attr("href")] == undefined){
                    var full_url = new URL($(this).attr("href"),current_url.origin);
                    var full_title = $(this).attr("title");
                    result['child'].push(wrapUrl($(this),full_url,full_title));
                }
              }
          );
          result['name'] = content("h1[class='break-text']").text();
        }else{
            console.log("resolver null: ", target);
        }
        //console.log("resolver: ",$(this).attr("href"));
        return result;
    } catch (error) {
        console.log(error);
        return result;
    }
}

async function bookStackPageSolver(target,rule){
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    try {
        //target = encodeURI(target);
        const response = await axios.get(target);
        const html = response.data;
        const $ = Cheerio.load(html);
        const current_url = new URL(target);
        var page = $("main[class='content-wrap card']").html();
        if(page != null){
          var content=Cheerio.load(page);
          content("a[title]").each(
              function(){
                /* 如果沒有在黑名單才會加入 */
                if(rule.nodeBanlist[$(this).attr("href")] == undefined){
                    var full_url = new URL($(this).attr("href"),current_url.origin);
                    var full_title = $(this).attr("title");
                    result['child'].push(wrapUrl($(this),full_url,full_title));
                }
              }
          );
          result['name'] = content("h1[class='break-text']").text();
        }else{
            console.log("resolver null: ", target);
        }
        //console.log("resolver: ",$(this).attr("href"));
        return result;
    } catch (error) {
        //console.log(error);
        return result;
    }
}

async function wikipediaSolver(target,rule){
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";

    try {
        //target = encodeURI(target);
        const response = await axios.get(target);
        const html = response.data;
        const $ = Cheerio.load(html);
        const current_url = new URL(target);
        //console.log("current url:", current_url);
        var page = $("div[id='content']").html();
        if(page != null){
            var content=Cheerio.load(page);
            console.log("wiki name: ",content("h1[id='firstHeading']").text());
            result['name'] = content("h1[id='firstHeading']").text();
        }else{
            console.log("resolver null: ", target);
        }
        page = $("div[id='content'] > div[id='bodyContent'] > div[id='mw-content-text'] > div[class='mw-parser-output'] > p").each(
            function(index){
                $(this).find("a[title]").each(
                    function(){
                        /* 如果沒有在黑名單才會加入 */
                        if(rule.nodeBanlist[$(this).attr("href")] == undefined){
                            var full_url = new URL($(this).attr("href"),current_url.origin);
                            var full_title = $(this).attr("title");
                            result['child'].push(wrapUrl($(this),full_url,full_title));
                        }
                    }
                );
                
            }
        );
        page = $("div[id='content'] > div[id='bodyContent'] > div[id='mw-content-text'] > div[class='mw-parser-output']").each(
            function(index){
                $(this).find("a[title]").each(
                    function(){
                        /* 如果沒有在黑名單才會加入 */
                        if(rule.nodeBanlist[$(this).attr("href")] == undefined){
                            var full_url = new URL($(this).attr("href"),current_url.origin);
                            var full_title = $(this).attr("title");
                            result['child'].push(wrapUrl($(this),full_url,full_title));
                        }
                    }
                );
                
            }
        );
        /*
        page = $("div[id='content'] > div[id='bodyContent'] > div[id='mw-content-text'] > div[class='mw-parser-output'] p").html();
        if(page != null){
          var content=Cheerio.load(page);
          content("a[title]").each(
          );

        }else{
            console.log("resolver null: ", target);
        }
        */
        //console.log("resolver: ",$(this).attr("href"));
        return result;
    } catch (error) {
        console.log(error);
        console.log(target);
        const url = new URL(target);
        result['name'] = decodeURI(url.pathname);
        return result;
    }
}

async function normalSolver(target,rule){
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    var $=xml;
    var page=null
    /*
    要處理同名，不同人的問題
    */
    const PersonRefId_pattern = "^dila_.*";
    try{
        if(RegExp(PersonRefId_pattern).test(target)==true){
            console.log("dila_id: ",target);
            page = $('document[filename='+target+']').html();
        }else{
            page = $('PersonName:contains("'+target+'")').filter(function(){    
                return $(this).text() === target;}
                ).parent().parent().parent().html();
        }
    }catch(error){}


    try {

        if(page != null){
            var content=Cheerio.load(page);
            console.log("html: ",page);
            console.log("name: ",content("author").html());
            result['name'] = content("author").html();

            /* 年代 */
            content('*').find('time_dynasty').each(function (index, element) {
                var item = $(element);
                console.log("年代： ",decodeURI(item.html()));
                if(rule.nodeBanlist[item.text()] == undefined && item.html()!=null){
                    result['child'].push(wrapString(item,item.text(),"年代"));
                } 
              });    

            /* 籍貫 */
            content('doc_content > Paragraph[Key="BasicInfo"]').find('Udef_JiGuan').each(function (index, element) {
                var item = $(element);
                console.log("籍貫： ",item.html());
                if(rule.nodeBanlist[item.text()] == undefined && item.html()!=null){
                    result['child'].push(wrapString(item,item.text(),"籍貫"));
                } 
              });        

            /* 老師 */
            content('doc_content > Paragraph[Key="BasicInfo"]').find('Udef_Association[RelCode*="teacher"]').each(function (index, element) {
                var item = $(element);
                console.log("老師： ",item.attr("personrefid"),"/",item.html());
                if(rule.nodeBanlist[item.text()] == undefined && item.html()!=null){
                    result['child'].push(wrapString(item,item.attr("personrefid"),"老師"));
                } 
              });

            /* 學生 */
            content('doc_content > Paragraph[Key="BasicInfo"]').find('Udef_Association[RelCode*="student"]').each(function (index, element) {
                var item = $(element);
                console.log("學生： ",item.attr("personrefid"),"/",item.html());
                if(rule.nodeBanlist[item.text()] == undefined && item.html()!=null){
                    result['child'].push(wrapString(item,item.attr("personrefid"),"學生"));
                } 
                });

        }else{
            console.log("自動搜尋: ", target);
            //console.log("https://zh.wikipedia.org/wiki/"+target);
            var et = encodeURI("https://zh.wikipedia.org/wiki/"+target);

            //console.log(et);
            return await wikipediaSolver(et,rule);
        }
        /*
        page = $("time_dynasty").each(
            function(index){
                console.log($(this).html());
                if(rule.nodeBanlist[$(this).text()] == undefined){
                    var full_url = $(this).text();
                    var full_title = "年代";
                    result['child'].push(wrapUrl($(this),full_url,full_title));
                }               
            }
        );
        */
        return result;
    } catch (error) {
        console.log(error);
        return result;
    }    
}

async function cbdbSolver(target,rule){
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    var target_array = target.split("cbdb:");
    var cbdbid = null;
    //console.log(target_array);
    if(target_array.length == 2 && target_array[1] != ""){
        cbdbid = Number(target_array[1]).toString();
    }

    try {
        if(cbdbid!=null){
            const cbdb_data = await connection.query(
                `SELECT KIN_DATA.c_personid, BIOG_MAIN_1.c_name_chn, KIN_DATA.c_kin_code, KINSHIP_CODES.c_kinrel_chn, KIN_DATA.c_kin_id, BIOG_MAIN.c_name_chn
                FROM (KINSHIP_CODES INNER JOIN (BIOG_MAIN INNER JOIN KIN_DATA ON BIOG_MAIN.c_personid = KIN_DATA.c_kin_id) ON KINSHIP_CODES.c_kin_code = KIN_DATA.c_kin_code) INNER JOIN BIOG_MAIN AS BIOG_MAIN_1 ON KIN_DATA.c_personid = BIOG_MAIN_1.c_personid
                WHERE (((KIN_DATA.c_personid)=` + cbdbid +`));
                `);
            console.log(cbdb_data);
            if(cbdb_data.length != 0){
                //console.log(cbdb_data[0]['BIOG_MAIN_1.c_name_chn']);
                result['name'] = cbdb_data[0]['BIOG_MAIN_1.c_name_chn'];
                for(let i=0; i<cbdb_data.length; i++){
                    var c=wrapString(null,"cbdb:"+cbdb_data[i]['c_kin_id'],cbdb_data[i]['c_kinrel_chn']);
                    //console.log(c);
                    result['child'].push(c);
                }
            }
            return result;
        }
    } catch (error) {
        console.log(error);
        return result;
    }    
}

async function bookStackLinkSolver(target,rule){
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    try {
        //target = encodeURI(target);
        const response = await axios.get(target);
        const html = response.data;
        //console.log(html);
        const $ = Cheerio.load(html);
        const current_url = new URL(target);
        var page = $("main[class='content-wrap card']").html();
        if(page != null){
          var content=Cheerio.load(page);
          content("a[title]").each(
              function(){
                /* 如果沒有在黑名單才會加入 */
                if(rule.nodeBanlist[$(this).attr("href")] == undefined){
                    var full_url = new URL($(this).attr("href"),current_url.origin);
                    var full_title = $(this).attr("title");
                    result['child'].push(wrapUrl($(this),full_url,full_title));
                }
              }
          );
          result['name'] = content("h1[class='break-text']").text();
        }else{
            console.log("resolver null: ", target);
        }
        //console.log("resolver: ",$(this).attr("href"));
        return result;
    } catch (error) {
        //console.log(error);
        return result;
    }
}
async function dilaSolver(target,rule){
    target = target.split("dila:")[1];
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    var $=xml;
    var page=null
    /*
    要處理同名，不同人的問題
    */
    const PersonRefId_pattern = "^dila_.*";
    try{
        if(RegExp(PersonRefId_pattern).test(target)==true){
            console.log("dila_id: ",target);
            page = $('document[filename='+target+']').html();
        }else{
            page = $('PersonName:contains("'+target+'")').filter(function(){    
                return $(this).text() === target;}
                ).parent().parent().parent().html();
        }
    }catch(error){}


    try {

        if(page != null){
            var content=Cheerio.load(page);
            console.log("html: ",page);
            console.log("name: ",content("author").html());
            result['name'] = content("author").html();

            /* 年代 */
            content('*').find('time_dynasty').each(function (index, element) {
                var item = $(element);
                console.log("年代： ",decodeURI(item.html()));
                if(rule.nodeBanlist[item.text()] == undefined && item.html()!=null){
                    result['child'].push(wrapString(item,"dila:"+item.text(),"年代"));
                } 
              });    

            /* 籍貫 */
            content('doc_content > Paragraph[Key="BasicInfo"]').find('Udef_JiGuan').each(function (index, element) {
                var item = $(element);
                console.log("籍貫： ",item.html());
                if(rule.nodeBanlist[item.text()] == undefined && item.html()!=null){
                    result['child'].push(wrapString(item,"dila:"+item.text(),"籍貫"));
                } 
              });        

            /* 老師 */
            content('doc_content > Paragraph[Key="BasicInfo"]').find('Udef_Association[RelCode*="teacher"]').each(function (index, element) {
                var item = $(element);
                console.log("老師： ",item.attr("personrefid"),"/",item.html());
                if(rule.nodeBanlist[item.text()] == undefined && item.html()!=null){
                    result['child'].push(wrapString(item,"dila:"+item.attr("personrefid"),"老師"));
                } 
              });

            /* 學生 */
            content('doc_content > Paragraph[Key="BasicInfo"]').find('Udef_Association[RelCode*="student"]').each(function (index, element) {
                var item = $(element);
                console.log("學生： ",item.attr("personrefid"),"/",item.html());
                if(rule.nodeBanlist[item.text()] == undefined && item.html()!=null){
                    result['child'].push(wrapString(item,"dila:"+item.attr("personrefid"),"學生"));
                } 
                });

        }else{
            console.log("自動搜尋: ", target);
            //console.log("https://zh.wikipedia.org/wiki/"+target);
            var et = encodeURI("https://zh.wikipedia.org/wiki/"+target);

            //console.log(et);
            return await wikipediaSolver(et,rule);
        }
        /*
        page = $("time_dynasty").each(
            function(index){
                console.log($(this).html());
                if(rule.nodeBanlist[$(this).text()] == undefined){
                    var full_url = $(this).text();
                    var full_title = "年代";
                    result['child'].push(wrapUrl($(this),full_url,full_title));
                }               
            }
        );
        */
        return result;
    } catch (error) {
        console.log(error);
        return result;
    }    
}

const  crawlerControllerCore = {
    /* 負責呼叫不同網頁的solver，統一回傳下一層節點的原始物件陣列 */
    run: async (target,rule) => {
        var solverType = "";
        if(rule.solverType != undefined){
            solverType = rule.solverType;
        }
        var result = null;
        switch (solverType) {
            case 'bookstack_shelves_pattern':
                result = await bookStackShelvesSolver(target,rule);
                break;
            case 'bookstack_shelf_pattern':
                result = await bookStackShelfSolver(target,rule);
                break;
            case 'bookstack_book_pattern':
                //result = await defaultSolver(target,rule);
                result = await bookStackBookSolver(target,rule);
                break;
            case 'bookstack_chapter_pattern':
                result = await bookStackChapterSolver(target,rule);
                break;
            case 'bookstack_page_pattern':
                result = await bookStackPageSolver(target,rule);
                break;
            case 'wikipedia_pattern':
                //console.log("wiki");
                result = await wikipediaSolver(target,rule);
                break;
            case 'normal_pattern':
                //console.log("normal string");
                result = await normalSolver(target,rule);
                /* todo */
                break;
            case 'bookstack_link_pattern':
                result = await bookStackLinkSolver(target,rule);
                break;
            case 'cbdb_pattern':
                //console.log("cbdb_pattern: " + target);
                result = await cbdbSolver(target,rule);
                break;
            case 'dila_pattern':
                result = await dilaSolver(target,rule);
                break;
            default:
                console.log(`unknow solverType: ${solverType} ${target}`);
                result = await defaultSolver(target,rule);
                break;
        }
        //console.log(result['child'][0]['obj']);
        return result;
    }
}

export default crawlerControllerCore;