    /*
     * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
     */
    var Arango = require('../arango');

    var utils = require('../utils');

    var path = "/_api/graph";

    function optionsToUrl(o, data, useKeep) {
        if (typeof data !== 'object') return '';

        if (o._waitForSync && typeof data.waitForSync !== "boolean") data.waitForSync = o._waitForSync;
        if (useKeep && !o._keepNull && data.keepNull === undefined) data.keepNull = o._keepNull;

        return Object.keys(data).reduce(function(a, b, c) {
            c = b + '=' + data[b];
            return !a ? '?' + c : a + '&' + c;
        }, '');
    }
    // set if-match / if-none-match headers when options.match
    function ifMatch(id, options) {
        var headers, rev;

        if (options.match !== undefined) {
            rev = JSON.stringify(options.rev || id);

            if (options.match) headers = {
                headers: {
                    "if-match": rev
                }
            };
            else headers = {
                headers: {
                    "if-none-match": rev
                }
            };
            // these options are not needed anymore
            delete options.match;
            delete options.rev;
        }

        return headers;
    }

    /**
     * The api module to perform graph related operations on ArangoDB.
     *
     * @class graph
     * @module arango
     * @submodule graph
     **/
    function GraphAPI(db) {
        return {

            /**
             * creates a Graph.
             *
             * @param {String} graph - the name of the graph
             * @param {String} vertices - the vertices collection
             * @param {String} edges - the edge collection
             * @param waitForSync - boolean , wait until document has been sync to disk.
             * @param {Function} callback   - The callback function.
             * @method create
             * @return{Promise}
             */
            "create": function(graph, vertices, edges, waitForSync, callback) {
                var data = {
                    _key: graph,
                    vertices: vertices,
                    edges: edges
                };

                var options = {};
                if (typeof waitForSync === "function") {
                    callback = waitForSync;
                } else if (typeof waitForSync === "boolean") {
                    options.waitForSync = waitForSync;
                }
                return db.post(path + optionsToUrl(this, options), data, callback);
            },
            /**
             * retrieves a graph from the database
             *
             * @param {String} graph - the name of the graph
             * @param {Function} callback   - The callback function.
             * @method get
             * @return{Promise}
             */
            "get": function(graph, callback) {
                return db.get(path + '/' + graph, null, callback);
            },
            /**
             * retrieves a list of graphs from the database
             *
             * @param {Function} callback   - The callback function.
             * @method list
             * @return{Promise}
             */
            "list": function(callback) {
                return db.get(path, callback);
            },
            /**
             * Deletes a graph
             *
             * @param {String} graph - the name of the graph
             * @param {Boolean} [waitForSync=false] - wait until document has been sync to disk.
             * @param {Function} callback   - The callback function.
             * @method delete
             * @return{Promise}
             */
            "delete": function(graph, waitForSync, callback) {

                var options = {};
                if (typeof waitForSync === "function") {
                    callback = waitForSync;
                } else if (typeof waitForSync === "boolean") {
                    options.waitForSync = waitForSync;
                }
                return db.delete(path + '/' + graph + optionsToUrl(this, options), null, callback);
            },
            "vertex": {
                /**
                 * creates a Vertex within a Graph
                 *
                 * @param {String} graph - the name of the graph
                 * @param vertexData - the vertex object as JSON. It is possible to set the vertex key by providing the _key attribute.
                 * @param {Boolean} [waitForSync=false] - wait until document has been sync to disk.
                 * @param {Function} callback   - The callback function.
                 * @method vertex.create
                 * @return{Promise}
                 */
                "create": function(graph, vertexData, waitForSync, callback) {
                    var options = {};
                    if (typeof waitForSync === "function") {
                        callback = waitForSync;
                    } else if (typeof waitForSync === "boolean") {
                        options.waitForSync = waitForSync;
                    }
                    return db.post(path + '/' + graph + '/vertex' + optionsToUrl(this, options), vertexData, callback);
                },

                /**
                 * retrieves a vertex from a graph
                 *
                 * @param {String} graph - the name of the graph
                 * @param {String} id        - the vertex-handle
                 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
                 * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
                 * @param {Function} callback   - The callback function.
                 * @method vertex.get
                 * @return{Promise}
                 */
                "get": function(graph, id, options, callback) {
                    var headers;

                    if (typeof options == 'function') {
                        callback = options;
                        options = {};
                    } else if (options) {
                        headers = ifMatch(id, options);
                    }
                    return db.get(path + '/' + graph + '/vertex/' + id + optionsToUrl(this, options), headers, callback);
                },
                /**
                 * replaces a vertex with the data given in data.
                 *
                 * @param {String} graph - the name of the graph
                 * @param {String} id        - the vertex-handle
                 * @param {Object} data - the data of the vertex as JSON object
                 * @param {Object} [options] - an object with the following optional parameters:
                 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
                 * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
                 * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
                 * does not match.
                 * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
                 * @param {Function} callback   - The callback function.
                 * @method vertex.put
                 * @return{Promise}
                 */
                "put": function(graph, id, data, options, callback) {
                    var headers;

                    if (typeof options == 'function') {
                        callback = options;
                        options = {};
                    } else if (options) {
                        headers = ifMatch(id, options);
                    }
                    if (options.forceUpdate !== undefined) {
                        options.policy = (options.forceUpdate === true) ? "last" : "error";
                        delete options.forceUpdate;
                    }
                    return db.put(path + '/' + graph + '/vertex/' + id + optionsToUrl(this, options), data, headers, callback);
                },
                /**
                 * patches a vertex with the data given in data
                 *
                 * @param {String} graph - the name of the graph
                 * @param {String} id        - the vertex-handle
                 * @param {Object} data - the data of the vertex as JSON object
                 * @param {Object} [options] - an object with the following optional parameters:
                 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
                 * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
                 * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
                 * does not match.
                 * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
                 * @param {Boolean} [options.keepNull=true] -  if set to false a patch request will delete every null value
                 * @param {Function} callback   - The callback function.
                 * @method vertex.patch
                 * @return{Promise}
                 */
                "patch": function(graph, id, data, options, callback) {
                    var headers;

                    if (typeof options == 'function') {
                        callback = options;
                        options = {};
                    } else if (options) {
                        headers = ifMatch(id, options);
                    }
                    if (options.forceUpdate !== undefined) {
                        options.policy = (options.forceUpdate === true) ? "last" : "error";
                        delete options.forceUpdate;
                    }

                    return db.patch(path + '/' + graph + '/vertex/' + id + optionsToUrl(this, options, true), data, headers, callback);
                },
                /**
                 * Deletes a vertex
                 *
                 * @param {String} graph - the name of the graph
                 * @param {String} id        - the vertex-handle
                 * @param {Object} [options] - an object with the following optional parameters:
                 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
                 * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
                 * @param {Number} [options.waitForSync] -  Boolean, wait until document has been synced to disk.
                 * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
                 * does not match.
                 * @param {Function} callback   - The callback function.
                 * @method vertex.delete
                 * @return{Promise}
                 */
                "delete": function(graph, id, options, callback) {
                    var headers;

                    if (typeof options == 'function') {
                        callback = options;
                        options = {};
                    } else if (options) {
                        headers = ifMatch(id, options);
                    }

                    return db.delete(path + '/' + graph + '/vertex/' + id + optionsToUrl(this, options), headers, callback);
                }
            },

            "edge": {
                /**
                 * creates an edge within a Graph
                 *
                 * @param {String} graph - the name of the graph
                 * @param edgeData  - the vertex object as JSON. It is possible to set the vertex key by providing the _key attribute.
                 * @param {String} from      - the start vertex of this edge
                 * @param {String} to        - the end vertex of this edge
                 * @param {String} label     - the edges label
                 * @param {Boolean} [waitForSync=false] - wait until document has been sync to disk.
                 * @param {Function} callback   - The callback function.
                 * @method edge.create
                 * @return{Promise}
                 */
                "create": function(graph, edgeData, from, to, label, waitForSync, callback) {

                    if (typeof label === 'function') {
                        callback = label;
                        label = null;
                    }

                    var data = utils.extend({
                        _from: from,
                        _to: to
                    }, edgeData);
                    if (label) {
                        data = utils.extend({
                            $label: label
                        }, data);
                    }
                    var options = {};
                    if (typeof waitForSync === "function") {
                        callback = waitForSync;
                    } else if (typeof waitForSync === "boolean") {
                        options.waitForSync = waitForSync;
                    }
                    return db.post(path + '/' + graph + '/edge' + optionsToUrl(this, options), data, callback);
                },
                /**
                 * retrieves an edge  from a graph
                 *
                 * @param {String} graph - the name of the graph
                 * @param {String} id        - the edge-handle
                 * @param {Object} [options] - an object with the following optional parameters:
                 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
                 * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
                 * @param {Function} callback   - The callback function.
                 * @method edge.get
                 * @return{Promise}
                 */
                "get": function(graph, id, options, callback) {
                    var headers;

                    if (typeof options == 'function') {
                        callback = options;
                        options = {};
                    } else if (options) {
                        headers = ifMatch(id, options);
                    }
                    return db.get(path + '/' + graph + '/edge/' + id + optionsToUrl(this, options), headers, callback);
                },
                /**
                 * replaces an edge with the data given in data.
                 *
                 * @param {String} graph - the name of the graph
                 * @param {String} id        - the vertex-handle
                 * @param {Object} data - the data of the edge as JSON object
                 * @param {Object} [options] - an object with the following optional parameters:
                 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
                 * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
                 * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
                 * does not match.
                 * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
                 * @param {Function} callback   - The callback function.
                 * @method edge.put
                 * @return{Promise}
                 */
                "put": function(graph, id, data, options, callback) {
                    var headers;

                    if (typeof options == 'function') {
                        callback = options;
                        options = {};
                    } else if (options) {
                        headers = ifMatch(id, options);
                    }
                    if (options.forceUpdate !== undefined) {
                        options.policy = (options.forceUpdate === true) ? "last" : "error";
                        delete options.forceUpdate;
                    }

                    return db.put(path + '/' + graph + '/edge/' + id + optionsToUrl(this, options), data, headers, callback);
                },
                /**
                 * patches an edge with the data given in data
                 *
                 * @param {String} graph - the name of the graph
                 * @param {String} id        - the edge-handle
                 * @param {Object} data - the data of the edge as JSON object
                 * @param {Object} [options] - an object with the following optional parameters:
                 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
                 * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
                 * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
                 * does not match.
                 * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
                 * @param {Boolean} [options.keepNull=true] -  if set to false a patch request will delete every null value
                 * @param {Function} callback   - The callback function.
                 * @method edge.patch
                 * @return{Promise}
                 */
                "patch": function(graph, id, data, options, callback) {
                    var headers;

                    if (typeof options == 'function') {
                        callback = options;
                        options = {};
                    } else if (options) {
                        headers = ifMatch(id, options);
                    }
                    if (options.forceUpdate !== undefined) {
                        options.policy = (options.forceUpdate === true) ? "last" : "error";
                        delete options.forceUpdate;
                    }
                    return db.patch(path + '/' + graph + '/edge/' + id + optionsToUrl(this, options, true), data, headers, callback);
                },
                /**
                 * Deletes an edge
                 *
                 * @param {String} graph - the name of the graph
                 * @param {String} id        - the edge-handle
                 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
                 * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
                 * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
                 * does not match.
                 * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
                 * @param {Function} callback   - The callback function.
                 * @method edge.delete
                 * @return{Promise}
                 */
                "delete": function(graph, id, options, callback) {
                    var headers;

                    if (typeof options == 'function') {
                        callback = options;
                        options = {};
                    } else if (options) {
                        headers = ifMatch(id, options);
                    }

                    return db.delete(path + '/' + graph + '/edge/' + id + optionsToUrl(this, options), headers, callback);
                }
            },
            /**
             * returns all neighbouring vertices of the given vertex .
             *
             * @param {String} graph - the name of the graph
             * @param {String} vertex - the vertex
             * @param {Object} [options]   - the following optional parameters are allowed:
             * @param {Number} [options.batchSize] - the batch size of the returned cursor.
             * @param {Number} [options.limit] -  limit the result size.
             * @param {Boolean} [options.count=false]  -   return the total number of results.
             * @param {Object} [options.filter] -   a optional filter, The attributes of filter:
             * @param {String} [options.direction=any]     filter for inbound (value "in") or outbound (value "out")
             * neighbors.
             * @param {List} [options.filter.labels]  -   filter by an array of edge labels (empty array means no
             * restriction)
             * @param {Object} [options.filter.properties]  -   filter neighbors by an array of edge properties, The
             * attributes of a property filter:
             * @param {String} [options.filter.key] -   filter the result vertices by a key value pair
             * @param {String} [options.filter.value]   -   the value of the key
             * @param {String} [options.filter.compare] -   a compare operator
             * @param {Function} callback   - The callback function.
             * @method getNeighbourVertices
             * @return{Promise}
             */

            "getNeighbourVertices": function(graph, vertex, options, callback) {
                if (typeof options === "function") {
                    callback = options;
                    options = {};
                }
                return db.post(path + "/" + graph + '/vertices/' + vertex, options, callback);
            },
            /**
             * returns all neighbouring edges of the given vertex .
             *
             * @param {String} graph - the name of the graph
             * @param {String} vertex - the vertex
             * @param {Object} [options]   - the following optional parameters are allowed:
             * @param {Number} [options.batchSize] - the batch size of the returned cursor.
             * @param {Number} [options.limit] -  limit the result size.
             * @param {Boolean} [options.count=false]  -   return the total number of results.
             * @param {Object} [options.filter] -   a optional filter, The attributes of filter:
             * @param {String} [options.direction=any]     filter for inbound (value "in") or outbound (value "out")
             * neighbors.
             * @param {List} [options.filter.labels]  -   filter by an array of edge labels (empty array means no
             * restriction)
             * @param {Object} [options.filter.properties]  -   filter neighbors by an array of edge properties, The
             * attributes of a property filter:
             * @param {String} [options.filter.key] -   filter the result vertices by a key value pair
             * @param {String} [options.filter.value]   -   the value of the key
             * @param {String} [options.filter.compare] -   a compare operator
             * @param {Function} callback   - The callback function.
             * @method getEdgesForVertex
             * @return{Promise}
             */
            "getEdgesForVertex": function(graph, vertex, options, callback) {
                if (typeof options === "function") {
                    callback = options;
                    options = {};
                }
                return db.post(path + "/" + graph + '/edges/' + vertex, options, callback);
            },
            /**
             * returns all vertices of a graph.
             *
             * @param {String} graph - the name of the graph.
             * @param {Object} [options]   - the following optional parameters are allowed:
             * @param {Number} [options.batchSize] - the batch size of the returned cursor.
             * @param {Number} [options.limit] -  limit the result size.
             * @param {Boolean} [options.count=false]  -   return the total number of results.
             * @param {Object} [options.filter] -   a optional filter, The attributes of filter:
             * @param {Object} [options.filter.properties]  -   filter neighbors by an array of edge properties, The
             * attributes of a property filter:
             * @param {String} [options.filter.key] -   filter the result vertices by a key value pair
             * @param {String} [options.filter.value]   -   the value of the key
             * @param {String} [options.filter.compare] -   a compare operator
             * @param {Function} callback   - The callback function.
             * @method vertices
             * @return{Promise}
             */

            "vertices": function(graph, options, callback) {
                if (typeof options === "function") {
                    callback = options;
                    options = {};
                }
                return db.post(path + "/" + graph + '/vertices/', options, callback);
            },
            /**
             * returns all edges of a graph.
             *
             * @param {String} graph - the name of the graph.
             * @param {Object} [options]   - the following optional parameters are allowed:
             * @param {Number} [options.batchSize] - the batch size of the returned cursor.
             * @param {Number} [options.limit] -  limit the result size.
             * @param {Boolean} [options.count=false]  -   return the total number of results.
             * @param {Object} [options.filter] -   a optional filter, The attributes of filter:
             * @param {List} [options.filter.labels]  -   filter by an array of edge labels (empty array means no
             * restriction)
             * @param {Object} [options.filter.properties]  -   filter neighbors by an array of edge properties,
             * The attributes of a property filter:
             * @param {String} [options.filter.key] -   filter the result vertices by a key value pair
             * @param {String} [options.filter.value]   -   the value of the key
             * @param {String} [options.filter.compare] -   a compare operator
             * @param {Function} callback   - The callback function.
             * @method edges
             * @return{Promise}
             */
            "edges": function(graph, options, callback) {
                if (typeof options === "function") {
                    callback = options;
                    options = {};
                }
                return db.post(path + "/" + graph + '/edges/', options, callback);
            },
            /**
             * Sets the keepNull value for all further requests in the graph module.
             *
             * @param {Boolean} val
             * @method keepNull
             * @return {Object}    -   The modified instance of the graph module.
             */
            "keepNull": function(val) {
                this._keepNull = !! val;
                this.vertex._keepNull = !! val;
                this.edge._keepNull = !! val;


                return this;
            },

            /**
             * Sets the waitForSync value for all further requests in the graph module.
             *
             * @param {Boolean} val
             * @method waitForSync
             * @return {Object}    -   The modified instance of the graph module.
             */
            "waitForSync": function(val) {
                this._waitForSync = !! val;
                this.vertex._waitForSync = !! val;
                this.edge._waitForSync = !! val;

                return this;
            }
        }
    }

    module.exports = Arango.api('graph', GraphAPI);
