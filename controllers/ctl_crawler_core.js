import Url from 'url-parse';

import Cheerio from 'cheerio';

import Crawler from 'crawler';

import axios, * as others from 'axios';


import createError from 'http-errors';

import crawlerRuleModel from '../models/mod_crawler_rule.js';
import { copyFileSync } from 'fs';

import url from 'url';

function wrapUrl(target,href,title){
    var result = {};
    result["obj"] = target;
    result["href"] = href.href;
    result["title"] = title;
    return result;
}


async function defaultSolver(target,rule){
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    const current_url = new URL(target);
    return result;
}

async function bookStackShelvesSolver(target,rule){
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    try {
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
        console.log(error);
        return result;
    }
}

async function wikipediaSolver(target,rule){
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    try {
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
        return result;
    }
}

async function normalSolver(target,rule){
    var result = {};
    result['child'] = [];
    result['name'] = "unknown";
    try {
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
                console.log("normal string");
                /* todo */
                break;
            default:
                console.log(`unknow solverType: ${solverType} ${target}`);
                //result = await defaultSolver(target,rule);
                break;
        }
        //console.log(result);
        return result;
    }
}

export default crawlerControllerCore;