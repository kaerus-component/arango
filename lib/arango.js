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

var API_DIR = './api/',
    API_MODULES = [
        'transaction',
        'collection',
        'database',
        'document',
        'cursor',
        'job',
        'simple',
        'index',
        'query',
        'admin',
        'aqlfunction',
        'endpoint',
        'import',
        'traversal',
        'graph',
        'batch',
        'edge',
        'action',
        'user'
], ArangoAPI;

var header;

function Arango(db,options) {
    if(!(this instanceof Arango)){
        return new Arango(db,options);
    }

    /* attach API:s */
    attach(this,ArangoAPI);

    if(db instanceof Arango) {
        this._name = db._name;
        this._collection = db._collection;
        this._server = utils.extend(true,{},db._server); 
    } else options = db;
    
    if(options){
        if(typeof options === 'string') {
            utils.extend(true,this,url.path2db(options)); 
        } else if(typeof options === 'object') {
            if(options.api) attach(this,options.api);
            if(options._name) this._name = options._name;
            if(options._server) this._server = options._server;
            if(options._collection) this._collection = options._collection;
        }
    }
    /* Apply defaults */
    if(typeof this._server !== 'object') 
        this._server = {};
    if(typeof this._server.protocol !== 'string') 
        this._server.protocol = 'http';
    if(typeof this._server.hostname !=='string') 
        this._server.hostname = '127.0.0.1';
    if(typeof this._server.port !== 'number') 
        this._server.port = parseInt(this._server.port||8529,10);
    if(typeof this._collection !== 'string') 
        this._collection = '';

    /* Basic authorization */
    if(this._server.username) {
        if(typeof this._server.headers !== 'object') this._server.headers = {};
        this._server.headers['authorization'] = 'Basic ' + 
            base64.encode(this._server.username + ':' + this._server.password);  
    }
}   

/* connection factory */
Arango.Connection = function(){
    var options = {};
 
    for(var i = 0; arguments[i]; i++) {
        if(typeof arguments[i] === 'object')
            utils.extend(true,options,arguments[i]);
        else if(typeof arguments[i] === 'string')
            utils.extend(true,options,url.path2db(arguments[i]));
    }

    return new Arango(options);
}

/* api registration hook */
Arango.api = function(ns,exp){
    var api = {};

    api[ns] = exp;

    attach(this,api);

    return exp;
}

/* base64 helper */
Arango.base64 = base64;

Arango.prototype = {
    "use": function(options) {
        return new Arango(this,options);
    },
    "api": function(api) {
        if(!api) return ArangoAPI;

        attach(this,api);
        
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
    /**
     *
     * @param active                boolean, true to activate.
     * @param fireAndForget     boolean, if true fire and forget mode is activated.
     * @returns {Arango}
     */
    "setAsyncMode": function(active, fireAndForget) {
 
        if(!active) {
            if(this._server.headers !== undefined)
                delete this._server.headers["x-arango-async"];

            return this;
        }

        if(typeof this._server.headers !== 'object') 
            this._server.headers = {};
        
        this._server.headers["x-arango-async"] = fireAndForget ? "true" : "store";

        return this;
    },

    "debug": function(on){
        if(on === undefined) return debug;
        
        debug = !!on;
    },
    "request": request,
    "Promise": Promise
}

function attach(db,api){
    if(typeof api === 'string'){
        api = fetch(api);
    }
    
    for(var ns in api) {
        if(!Object.getOwnPropertyDescriptor(db,ns)) 
            load(db,ns,api[ns],true);
    }
}

function load(db,ns,api,lazy){

    if(lazy) {
        Object.defineProperty(db,ns,{
            enumerable: true,
            configurable: true,
            get: function(){
                return context();
            }
        });
    } else {
        db[ns] = context();
    }

    function context(){
        var instance = (require(api))(db);
        
        context = function(){ return instance };

        return instance;
    }
}

function fetch(api){
    var o = {};

    if(typeof api === 'string') api = api.split(' ');

    for(var n in api) o[api[n]] = API_DIR + api[n];

    return o;
}

/* configure API modules */
ArangoAPI = fetch(API_MODULES);

module.exports = Arango;
