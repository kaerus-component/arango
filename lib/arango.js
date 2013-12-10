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

var url = require('urlparser'),
    base64 = require('base64'),
    Promise = require('micropromise'),
    utils = require('./utils'),
    request = require('./request');

var ArangoAPI = {};

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
        utils.extend(true,this,dburl(db)); 
    }

    if(options){
        if(typeof options === 'string') {
            utils.extend(true,this,dburl(options)); 
        } else if(typeof options === 'object') {
            utils.extend(true,this,options);
        }
    }

    if(this._collection === undefined) this._collection = '';
    if(isNaN(this._server.port)) this._server.port = 8529;

    /* Basic authorization */
    if(this._server.username) {
        this._server.headers = this._server.headers || {};
        this._server.headers.authorization = 'Basic ' + 
            base64.encode(this._server.username + ':' + this._server.password);  
    }

    /* mixin API */
    for(var api in ArangoAPI) {
        if(typeof ArangoAPI[api] === 'object') this[api] = ArangoAPI[api];
        else this[api] = new ArangoAPI[api]();

        if(!this[api].db) {
            Object.defineProperty(this[api],'db',{
                configurable:false,
                enumerable:false,
                writable:false,
                value:this
            });
        }
    }
}   

Arango.api = function(ns,api){

    if(ArangoAPI[ns]) throw { 
        name: "APIError",
        message: "ArangoAPI[" + ns + "] already attached!"
    }

    ArangoAPI[ns] = api;
}

Arango.prototype = {
    "use": function(options) {
        return new Arango(this,options);
    },
    "api": function(api) {
        if(!ArangoAPI[api]) require('./api/' + api);

        if(typeof ArangoAPI[api] === 'object') this[api] = ArangoAPI[api];
        else this[api] = new ArangoAPI[api]();
        
        return this;
    },
    "get": function(path,options,callback){
        return this.request('GET',path,null,options,callback);
    },
    "post": function(path,data,options,callback){
        return this.request('POST',path,data,options,callback);
    },
    "put": function(path,data,options,callback){
        return this.request('PUT',path,data,options,callback);
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
    "request": request,
    "Promise": Promise
}


module.exports = Arango;
