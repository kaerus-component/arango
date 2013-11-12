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
    Promise = require('microPromise'),
    utils = require('./utils'),
    request = require('./request');

var Api = {
  "transaction": require('./api/transaction'),
  "collection": require('./api/collection'),
  "database": require('./api/database'),
  "document": require('./api/document'),
  "action": require('./api/action'),
  "cursor": require('./api/cursor'),
  "simple": require('./api/simple'),
  "index": require('./api/index'),
  "admin": require('./api/admin'),
  "query": require('./api/query'),
  "graph": require('./api/graph'),
  "batch": require('./api/batch'),
  "edge": require('./api/edge'),
  "user": require('./api/user'),
  "key": require('./api/key')
};

/* Arango connection */
function Connection(){
    var options = {
        _name: undefined,
        _collection: '',
        _server: {
            protocol: 'http',
            hostname: '127.0.0.1',
            port: 8529
        }
    };
 
    for(var i = 0; arguments[i]; i++) {
        if(typeof arguments[i] === 'object')
            utils.extend(true,options,{_server:arguments[i]});
        else if(typeof arguments[i] === 'string')
            connectionString(options,arguments[i]);
    }

    return new Arango(options);
}

function Arango(db,options) {
    if(!(this instanceof Arango))
        return new Arango(db,options);

    /* inherit preferences */
    if(db instanceof Arango) {
        this._server = utils.extend(true,{},db._server);
        this._name = db._name;
        this._collection = db._collection;
    } else if(db && !options) {
        options = db; 
    }

    if(options){
        if(typeof options === 'string') {
            connectionString(this,options); 
        } else if(typeof options === 'object') {
            utils.extend(true,this,options);
        }
    }

    /* Mixin the API modules */
    for(var module in Api) {
        this[module] = Api[module](this);
    }

    this.request = request(this);
}

function connectionString(options,path){
    var o, c = url.parse(path);

    if(c.host) {
        if(!options._server) options._server = {};

        utils.extend(options._server,c.host);
        options._server.port = parseInt(options._server.port,10);

        /* Basic authorization */
        if(options._server.username) {
            options._server.headers = options._server.headers||{};
            options._server.headers.authorization = 'Basic ' + 
                base64.encode(options._server.username + ':' + options._server.password);  
        }
    }
    
    if(c.path){
        options._name = c.path.base;
        options._collection = c.path.name||'';
    } 
}     

Arango.prototype = {
    "use": function(options) {
        return new Arango(this,options);
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
    "promise": function(){ 
        return new Promise(); 
    }
}

module.exports = {Connection: Connection, base64: base64};

