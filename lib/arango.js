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

var parse = require('url'),
    base64 = require('base64'),
    utils = require('./utils'),
    request = require('./request');

var api = {
  "collection": require('./api/collection'),
  "document": require('./api/document'),
  "action": require('./api/action'),
  "cursor": require('./api/cursor'),
  "simple": require('./api/simple'),
  "index": require('./api/index'),
  "admin": require('./api/admin'),
  "query": require('./api/query'),
  "edge": require('./api/edge'),
  "key": require('./api/key')
};

/* Arango connection factory */
function Connection(){
    var arango = new Arango();

    /* apply defaults */ 
    arango.name = '';

    arango.server = {
        protocol: 'http',
        name: '127.0.0.1',
        port: 8529,
        headers: {}
    }
    
    var username, password;

    for(var i = 0, connection; connection = arguments[i]; i++) {
        if(typeof connection === 'object') {
            utils.extend(true,arango,connection);
        }
        else if(typeof connection === 'string') {
            var conn = parse(connection);
            
            if(conn.host) utils.extend(arango.server,conn.host);
            /* get collection name from path */
            if(conn.path) arango.name = conn.path.base;
        } else throw new Error("Invalid connection");
    }

    /* Basic authorization */
    if(username) {
        arango.server.headers.authorization = 'Basic ' + 
            base64.encode(username + ':' + password);  
    }

    return arango;
}

function Arango(obj) {

    /* inherit preferences */
    if(obj instanceof Arango) {
        this.server = utils.extend(true,{},obj.server);
    } 

    /* Mixin the API modules */
    for(var module in api) {
        this[module] = api[module](this);
    }

    /* Mixin request methods */
    var requests = request(this);

    for(var method in requests) {
        this[method] = requests[method];
    } 
}

Arango.prototype = {
    "use": function(preference) {
        /* spawn a new object with the new preference setting */
        var db = new Arango(this);
        
        if(typeof preference === 'string') db.name = preference;
        else if(typeof preference === 'object') utils.extend(true,db,preference);

        /* We return a new object since a preference change  */
        /* would not work so well in asynchronous operations */
        return db;
    }
}

module.exports = {Connection: Connection};

