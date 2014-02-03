    /*
    * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
    */
var Arango = require('../arango');

var utils = require('../utils');

var path = "/_api/graph";

function optionsToUrl(o,data, useKeep){
    if(typeof data !== 'object') return '';

    if(o._waitForSync && typeof data.waitForSync !== "boolean") data.waitForSync = o._waitForSync;
    if(useKeep && !o._keepNull && data.keepNull === undefined) data.keepNull = o._keepNull;

    return Object.keys(data).reduce(function(a,b,c){
        c = b + '=' + data[b];
        return !a ? '?' + c : a + '&' + c;
    },'');
}
// set if-match / if-none-match headers when options.match
function ifMatch(id,options) {
    var headers, rev;

    if(options.match !== undefined) {
        rev = JSON.stringify(options.rev||id);

        if(options.match) headers = {headers:{"if-match":rev}};
        else headers = {headers:{"if-none-match":rev}};
        // these options are not needed anymore
        delete options.match;
        delete options.rev;
    }

    return headers;
}


function GraphAPI(db) {
    return {

        /**
         *
         * @param graph - the name of the graph
         * @param vertices - the vertices collection
         * @param edges - the edge collection
         * @param waitForSync - boolean , wait until document has been sync to disk.
         * @param callback
         * @returns {*}
         */
        "create": function(graph,vertices,edges, waitForSync,callback){
            var data = {_key:graph,vertices:vertices,edges:edges};

            var options = {};
            if (typeof waitForSync === "function") {
                callback = waitForSync;
            } else if (typeof waitForSync === "boolean") {
                options.waitForSync = waitForSync;
            }
            return db.post(path+optionsToUrl(this, options),data,callback);
        },
        /**
         * retrieves a graph from the database
         *
         * @param graph - the graph-handle
         * @param callback
         * @returns {*}
         */
        "get": function(graph, callback) {
            return db.get(path+'/'+graph,null,callback);
        },
        /**
         * retrieves a list of graphs from the database
         *
         * @param callback
         * @returns {*}
         */
        "list": function(callback) {
            return db.get(path,callback);
        },
        /**
         * Deletes a graph
         *
         * @param graph       - the graph-handle
         * @param waitForSync - boolean , wait until document has been sync to disk.
         * @param callback
         * @returns {*}
         */
        "delete": function(graph,waitForSync,callback) {

            var options = {};
            if (typeof waitForSync === "function") {
                callback = waitForSync;
            } else if (typeof waitForSync === "boolean") {
                options.waitForSync = waitForSync;
            }
            return db.delete(path+'/'+graph+optionsToUrl(this, options),null,callback);
        },
        "vertex": {
            /**
             *
             * @param graph - The graph-handle
             * @param vertexData - the vertex object as JSON. It is possible to set the vertex key by providing the _key attribute.
             * @param waitForSync - boolean , wait until document has been sync to disk.
             * @param callback
             * @returns {*}
             */
            "create": function(graph, vertexData ,waitForSync, callback){
                var options = {};
                if (typeof waitForSync === "function") {
                    callback = waitForSync;
                } else if (typeof waitForSync === "boolean") {
                    options.waitForSync = waitForSync;
                }
                return db.post(path+'/'+graph+'/vertex'+optionsToUrl(this, options),vertexData,callback);
            },

            /**
             * retrieves a vertex  from a graph
             *
             * @param graph     - the graph-handle
             * @param id        - the vertex-handle
             * @param options   - an object with 2 possible attributes:
             *                      - "match": boolean defining if the given revision should match the found document or not.
             *                      - "rev":   String the revision, used by the "match" attribute.
             * @param callback
             * @returns {*}
             */
            "get": function(graph, id,options,callback) {
                var headers;

                if(typeof options == 'function') {
                    callback = options;
                    options = {};
                } else if(options) {
                    headers = ifMatch(id,options);
                }
                return db.get(path+'/'+graph+'/vertex/'+id+optionsToUrl(this, options),headers,callback);
            },
            /**
             * replaces a vertex with the data given in data.
             *
             * @param graph     - the graph-handle
             * @param id        - the vertex-handle
             * @param data      - a JSON Object containing the new attributes for the document handle
             * @param options   - an object with 4 possible attributes:
             *                      - "match": - boolean defining if the given revision should match the found vertex or not.
             *                      - "rev":  - String the revision, used by the "match" attribute.
             *                      - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
             *                      - "waitForSync": -  Boolean, wait until document has been synced to disk.
             * @param callback
             * @returns {*}
             */
            "put": function(graph , id ,data ,options ,callback) {
                var headers;

                if(typeof options == 'function') {
                    callback = options;
                    options = {};
                } else if(options) {
                    headers = ifMatch(id,options);
                }
                if (options.forceUpdate !== undefined) {
                    options.policy = (options.forceUpdate === true) ? "last" : "error";
                    delete options.forceUpdate;
                }
                return db.put(path+'/'+graph+'/vertex/'+id+optionsToUrl(this, options),data,headers,callback);
            },
            /**
             * patches a vertex with the data given in data
             *
             * @param graph     - the graph-handle
             * @param id        - the vertex-handle
             * @param data      - a JSON Object containing the new attributes for the vertex handle
             * @param options   - an object with 5 possible attributes:
             *                      - "match": - boolean defining if the given revision should match the found vertex or not.
             *                      - "rev":  - String the revision, used by the "match" attribute.
             *                      - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
             *                      - "waitForSync": -  Boolean, wait until document has been synced to disk.
             *                      - "keepNull": -  Boolean, default is true, if set to false a patch request will delete
             *                                          every null value attributes.
             * @param callback
             * @returns {*}
             */
            "patch": function(graph, id, data, options, callback) {
                var headers;

                if(typeof options == 'function') {
                    callback = options;
                    options = {};
                } else if(options) {
                    headers = ifMatch(id,options);
                }
                if (options.forceUpdate !== undefined) {
                    options.policy = (options.forceUpdate === true) ? "last" : "error";
                    delete options.forceUpdate;
                }

                return db.patch(path+'/'+graph+'/vertex/'+id+optionsToUrl(this, options, true),data,headers,callback);
            },
            /**
             * Deletes a vertex
             *
             * @param graph     - the graph-handle
             * @param id        - the vertex-handle
             * @param options   - an object with 4 possible attributes:
             *                      - "match": - boolean defining if the given revision should match the found vertex or not.
             *                      - "rev":  - String the revision, used by the "match" attribute.
             *                      - "waitForSync": -  Boolean, wait until document has been synced to disk.
             * @param callback
             * @returns {*}
             */
            "delete": function(graph, id, options, callback) {
                var headers;

                if(typeof options == 'function') {
                    callback = options;
                    options = {};
                } else if(options) {
                    headers = ifMatch(id,options);
                }

                return db.delete(path+'/'+graph+'/vertex/'+id+optionsToUrl(this, options),headers,callback);
            }
        },

        "edge": {
            /**
             *
             * @param graph     - the graph handle
             * @param edgeData  - the vertex object as JSON. It is possible to set the vertex key by providing the _key attribute.
             * @param from      - the start vertex of this edge
             * @param to        - the end vertex of this edge
             * @param label     - the edges label
             * @param waitForSync - boolean , wait until document has been sync to disk.
             * @param callback
             * @returns {*}
             */
            "create": function(graph, edgeData, from, to, label, waitForSync, callback){

                if(typeof label === 'function'){
                    callback = label;
                    label = null;
                }

                var data = utils.extend({_from : from, _to : to}, edgeData);
                if (label) {
                    data = utils.extend({ $label : label} , data);
                }
                var options = {};
                if (typeof waitForSync === "function") {
                    callback = waitForSync;
                } else if (typeof waitForSync === "boolean") {
                    options.waitForSync = waitForSync;
                }
                return db.post(path+'/'+graph+'/edge'+optionsToUrl(this, options),data,callback);
            },
            /**
             * retrieves an edge  from a graph
             *
             * @param id        - the edge-handle
             * @param options   - an object with 2 possible attributes:
             *                      - "match": boolean defining if the given revision should match the found document or not.
             *                      - "rev":   String the revision, used by the "match" attribute.
             * @param callback
             * @returns {*}
             */
            "get": function(graph, id,options,callback) {
                var headers;

                if(typeof options == 'function') {
                    callback = options;
                    options = {};
                } else if(options) {
                    headers = ifMatch(id,options);
                }
                return db.get(path+'/'+graph+'/edge/'+id+optionsToUrl(this, options),headers,callback);
            },
            /**
             * replaces an edge with the data given in data.
             *
             * @param graph     - the graph-handle
             * @param id        - the vertex-handle
             * @param data      - a JSON Object containing the new attributes for the document handle
             * @param options   - an object with 4 possible attributes:
             *                      - "match": - boolean defining if the given revision should match the found vertex or not.
             *                      - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
             *                      - "rev":  - String the revision, used by the "match" attribute.
             *                      - "waitForSync": -  Boolean, wait until vertex has been synced to disk.
             * @param callback
             * @returns {*}
             */
            "put": function(graph, id ,data ,options ,callback) {
                var headers;

                if(typeof options == 'function') {
                    callback = options;
                    options = {};
                } else if(options) {
                    headers = ifMatch(id,options);
                }
                if (options.forceUpdate !== undefined) {
                    options.policy = (options.forceUpdate === true) ? "last" : "error";
                    delete options.forceUpdate;
                }

                return db.put(path+'/'+graph+'/edge/'+id+optionsToUrl(this, options),data,headers,callback);
            },
            /**
             * patches an edge with the data given in data
             *
             * @param graph     - the graph-handle
             * @param id        - the edge-handle
             * @param data      - a JSON Object containing the new attributes for the edge handle
             * @param options   - an object with 4 possible attributes:
             *                      - "match": - boolean defining if the given revision should match the found edge or not.
             *                      - "rev":  - String the revision, used by the "match" attribute.
             *                      - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
             *                      - "waitForSync": -  Boolean, wait until edge has been synced to disk.
             *                      - "keepNull": -  Boolean, default is true, if set to false a patch request will delete
             *                                          every null value attributes.
             * @param callback
             * @returns {*}
             */
            "patch": function(graph, id,data,options,callback) {
                var headers;

                if(typeof options == 'function') {
                    callback = options;
                    options = {};
                } else if(options) {
                    headers = ifMatch(id,options);
                }
                if (options.forceUpdate !== undefined) {
                    options.policy = (options.forceUpdate === true) ? "last" : "error";
                    delete options.forceUpdate;
                }
                return db.patch(path+'/'+graph+'/edge/'+id+optionsToUrl(this, options, true),data,headers,callback);
            },
            /**
             * Deletes an edge
             *
             * @param graph     - the graph-handle
             * @param id        - the edge-handle
             * @param options   - an object with 4 possible attributes:
             *                      - "match": - boolean defining if the given revision should match the found edge or not.
             *                      - "rev":  - String the revision, used by the "match" attribute.
             *                      - "forceUpdate": - Boolean, if set a deletion is performed even when the given revision
             *                                          does not match.
             *                      - "waitForSync": -  Boolean, wait until document has been synced to disk.
             * @param callback
             * @returns {*}
             */
            "delete": function(graph, id, options, callback) {
                var headers;

                if(typeof options == 'function') {
                    callback = options;
                    options = {};
                } else if(options) {
                    headers = ifMatch(id,options);
                }

                return db.delete(path+'/'+ graph +'/edge/'+id+optionsToUrl(this, options),headers,callback);
            }
        },
        /**
         * returns all neighbouring vertices of the given vertex .
         *
         * @param graph - the graph handle
         * @param vertex - the vertex
         * @param options   - the following optional parameters are allowed:
         *                  -batchSize:  the batch size of the returned cursor
         *                  -limit:      limit the result size
         *                  -count:      return the total number of results (default "false")
         *                  -filter:     a optional filter, The attributes of filter:
         *                      -direction:     filter for inbound (value "in") or outbound (value "out") neighbors. Default value is "any". -
         *                      -labels:        filter by an array of edge labels (empty array means no restriction)
         *                      -properties:    filter neighbors by an array of edge properties, The attributes of a property filter:
         *                              -key: filter the result vertices by a key value pair
         *                              -value: the value of the key
         *                              -compare: a compare operator
         * @param callback
         * @returns {*}
         */

        "getNeighbourVertices": function(graph,vertex,options,callback){
            return db.post(path+"/" + graph+'/vertices/'+vertex,options,callback);
        },
        /**
         * returns all neighbouring edges of the given vertex .
         *
         * @param graph - the graph handle
         * @param vertex - the vertex
         * @param options   - the following optional parameters are allowed:
         *                  -batchSize:  the batch size of the returned cursor
         *                  -limit:      limit the result size
         *                  -count:      return the total number of results (default "false")
         *                  -filter:     a optional filter, The attributes of filter:
         *                      -direction:     filter for inbound (value "in") or outbound (value "out") neighbors. Default value is "any". -
         *                      -labels:        filter by an array of edge labels (empty array means no restriction)
         *                      -properties:    filter neighbors by an array of edge properties, The attributes of a property filter:
         *                              -key: filter the result vertices by a key value pair
         *                              -value: the value of the key
         *                              -compare: a compare operator
         * @param callback
         * @returns {*}
         */
        "getEdgesForVertex": function(graph,vertex,options,callback){
            return db.post(path+"/" + graph+'/edges/'+vertex,options,callback);
        },
        /**
         * returns all vertices of a graph.
         *
         * @param graph - the graph handle
         * @param options   - the following optional parameters are allowed:
         *                  -batchSize:  the batch size of the returned cursor
         *                  -limit:      limit the result size
         *                  -count:      return the total number of results (default "false")
         *                  -filter:     a optional filter, The attributes of filter:
         *                      -properties:    filter neighbors by an array of edge properties, The attributes of a property filter:
         *                              -key: filter the result vertices by a key value pair
         *                              -value: the value of the key
         *                              -compare: a compare operator
         * @param callback
         * @returns {*}
         */

        "vertices": function(graph, options, callback){
            return db.post(path+"/" + graph+'/vertices/',options,callback);
        },
        /**
         * returns all edges of a graph.
         *
         * @param graph - the graph handle
         * @param options   - the following optional parameters are allowed:
         *                  -batchSize:  the batch size of the returned cursor
         *                  -limit:      limit the result size
         *                  -count:      return the total number of results (default "false")
         *                  -filter:     a optional filter, The attributes of filter:
         *                      -labels:        filter by an array of edge labels (empty array means no restriction)
         *                      -properties:    filter neighbors by an array of edge properties, The attributes of a property filter:
         *                              -key: filter the result vertices by a key value pair
         *                              -value: the value of the key
         *                              -compare: a compare operator
         * @param callback
         * @returns {*}
         */
        "edges": function(graph,options,callback){
            return db.post(path+"/" + graph+'/edges/',options,callback);
        },
        "keepNull": function(val) {
            this._keepNull = !!val;
            this.vertex._keepNull = !!val;
            this.edge._keepNull = !!val;


            return this;
        },
        "waitForSync": function(val) {
            this._waitForSync = !!val;
            this.vertex._waitForSync = !!val;
            this.edge._waitForSync = !!val;

            return this;
        }
    }
}

module.exports = Arango.api('graph',GraphAPI);
/*
module.exports = Arango.api(["graph" , "vertex"],GraphAPI.vertex);
module.exports = Arango.api(["graph" , "edges"],GraphAPI.edge);
*/
