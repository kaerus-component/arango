/* 
 * Copyright (c) 2012 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict"

var url = require('./url'),
    base64 = require('base64'),
    Promise = require('micropromise'),
    utils = require('./utils'),
    request = require('./request');

var ArangoAPI = {}, debug;

function Arango(db,options) {
    if(!(this instanceof Arango))
        return new Arango(options);

    if(!db) return this;

    /* inherit preferences */
    if(db instanceof Arango) {
        this._server = utils.extend(true,{},db._server);
        this._name = db._name;
        this._collection = db._collection;
    } else if(typeof db === 'object') {
        utils.extend(true,this,db);
    } else if (typeof db === 'string'){
        utils.extend(true,this,url.path2db(db)); 
    }

    if(options){
        if(typeof options === 'string') {
            utils.extend(true,this,url.path2db(options)); 
        } else if(typeof options === 'object') {
            utils.extend(true,this,options);
        }
    }

    if(this._collection === undefined) this._collection = '';
    this._server.port = parseInt(this._server.port||8529,10);

    /* Basic authorization */
    if(this._server.username) {
        this._server.headers = this._server.headers || {};
        this._server.headers.authorization = 'Basic ' + 
            base64.encode(this._server.username + ':' + this._server.password);  
    }

    /* mixin API */
    for(var api in ArangoAPI) {
        if(typeof ArangoAPI[api] === 'object') this[api] = Object.create(ArangoAPI[api]);
        else this[api] = new ArangoAPI[api]();
        /* todo: refactor */
        this[api].db = this;
        if (api === "graph") {
            this[api]["vertex"].db = this;
            this[api]["edge"].db = this;
        }
    }
}   

Arango.api = function(ns,api){

    if(debug && ArangoAPI[ns]) console.warn("ArangoAPI['" + ns + "''] was already attached!");

    ArangoAPI[ns] = api;
}

Arango.prototype = {
    "use": function(options) {
        return new Arango(this,options);
    },
    "api": function(api) {
        if(!api) return ArangoAPI;

        if(typeof api === 'string') api = api.split(' '); 

        for(var name in api){
            if(!ArangoAPI[api[name]]) require('./api/' + api[name]);
        }
        
        return new Arango(this);
    },
    "get": function(path,options,callback){
        return this.request('GET',path,null,options,callback);
    },
    "post": function(path,data,options,callback){
        return this.request('POST',path,data,options,callback);
    },
    "put": function(path,data,options,callback){
        return this.request('PUT', path, data, options, callback);
    },
    "delete": function(path,options,callback){
        return this.request('DELETE',path,null,options,callback);
    },
    "head": function(path,options,callback){
        return this.request('HEAD',path,null,options,callback);
    },
    "patch": function(path,data,options,callback){
        return this.request('PATCH',path,data,options,callback);
    },
    "options": function(path,options,callback){
        return this.request("OPTIONS",path,null,options,callback);
    },
    "debug": function(on){
        if(on === undefined) return debug;
        
        debug = !!on;
    },
    "request": request,
    "Promise": Promise
}


module.exports = Arango;
