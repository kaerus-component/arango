var Arango = require('../arango'),
    url = require('../url'),
    utils = require('../utils');

var compareOperators = ["==","!=","<",">",">=","<="];

function propertyCompare (compare) {
    if (!compare) return("==");

    if(typeof compare !== 'string')
	throw new Error("not a string");
    
    if(compareOperators.indexOf(compare) < 0)
	throw new Error("unknown operator " + compare);
    
    return compare;
}

function filterDirection(filter, options) {
    switch (filter.direction) {
    case "in":
	options.direction = "inbound";
	break;
    case "out":
	options.direction = "outbound";
	break;
    case "any":
	options.direction = "any";
	break;
    default:
    }
}

function filterStatement(filter, statement) {
    if (!filter) {
	return " FILTER " + statement;
    }

    if(typeof filter !== 'string')
	throw new Error("not a string");
    
    filter+= " && " + statement;
    
    return filter;
}

/* fills a filter (throws exception) */
function propertyFilter (bindVars, filter, num, property, collname) {
    var statement;
    
    if (property.key === undefined) {
	throw new Error("undefined property key");
    }
    
    if (property.compare === "HAS") {
	bindVars["key" + num] = property.key;
	statement = "HAS(" + collname + ", @key" + num + ") ";
    } else if (property.compare === "HAS_NOT") {
	bindVars["key" + num.toString()] = property.key;
	statement = "!HAS(" + collname + ", @key" + num + ") ";
    } else if (property.value !== undefined) {
	bindVars["key" + num.toString()] = property.key;
	bindVars["value" + num.toString()] = property.value;
	statement = collname + "[@key" + num + "] ";
	statement+= propertyCompare(property.compare) + " @value" + num;
    } else throw new Error("unknown property filter");
    
    return filterStatement(filter,statement);
}

/* fills a properties filter */
function filterProperties (data, properties, collname) {
    var filter;

    if (Array.isArray(properties)) {
	properties.forEach(function(p,i){
	    filter = propertyFilter(data, filter, i, p, collname);
	});
    }
    else if (typeof properties === 'object') {
	filter = propertyFilter(data, filter, 0, properties, collname);
    }
    
    return filter;
}

/* fills a labels filter */
function filterLabels (bindVars, filter, labels, collname) {

    if (!Array.isArray(labels))
	throw new Error("labels not an array");
    
    if (!labels.length)
	throw new Error("no labels");
    
    bindVars.labels = labels;
    
    return filterStatement(filter, collname + '["$label"] IN @labels');
}

function createFilterQuery(bindVars, filter, collname) {
    var filterQuery = "";
    
    if (filter.properties) {
	filterQuery+= filterProperties(bindVars, filter.properties, collname);
    }
    
    if (filter.labels) {
	filterQuery+= filterLabels(bindVars, filter.labels, collname);
    }
    
    return filterQuery;
}

function optionsToUrl(o, options, useKeep) {

    if (o._waitForSync && typeof options.waitForSync !== "boolean") {
	options.waitForSync = o._waitForSync;
    }
    if (useKeep && !o._keepNull && options.keepNull === undefined) {
	options.keepNull = o._keepNull;
    }

    return url.options(options);
}

/**
 * The api module to perform graph related operations on ArangoDB.
 *
 * The underlying collections of the graph are still accessible using the standard methods for collections. 
 * However the graph module adds an additional layer on top of these collections giving you the following guarantees:
 *
 * - All modifications are executed transactional
 * - If you delete a vertex all edges will be deleted, you will never have loose ends
 * - If you insert an edge it is checked if the edge matches the definition, your edge collections will only contain valid edges
 * These guarantees are lost if you access the collections in any other way than the graph module or AQL.
 *
 * @class graph
 * @module arango
 * @submodule graph
 **/
function GraphAPI(db) {
    var path = "/_api/gharial",
	graphObject = {

	    /**
	     * creates a Graph.
	     *
	     * @param {String} graph - the name of the graph
	     * @param {String} edgeDefinitions - (optional) the definitions for edges. Compatibility: the name of the vertex collection.
	     * @param {String} vertexCollections - (optional) list of additional vertex collections Compatibility: the name of the edge collection
	     * @param {Boolean} waitForSync - if true wait until document has been synced to disk.
	     * @method create
	     * @return{Promise}
	     */
	    "create": function (graph, edgeDefinitions, vertexCollections, waitForSync) {
		if(typeof graph !== 'string')
		    throw new Error("graph name is not a string");

		var data = {
		    name: graph
		};

		var options = {};

		// Decide if it is old format
		// edgeDefinitions was vertex collection
		// vertexCollections was edge collection
		if (edgeDefinitions && vertexCollections
		    && typeof edgeDefinitions === "string"
		    && typeof vertexCollections === "string") {
		    data.edgeDefinitions = [{
			collection: vertexCollections,
			from: [edgeDefinitions],
			to: [edgeDefinitions]
		    }];
		    
		    if(waitForSync !== undefined)
			options.waitForSync = !!waitForSync;
		    
		} else {
		    
		    if(typeof edgeDefinitions === 'object'){
			data.edgeDefinition = edgeDefinitions;
			
			if(typeof vertexCollections === 'object')
			    data.orphanCollections = vertexCollections;
			else if(typeof vertexCollections === 'boolean')
			    waitForSync = vertexCollections;
		    }
		    else if(typeof edgeDefinitions === 'boolean')
			waitForSync = edgeDefinitions;
		    
		    if(waitForSync !== undefined)
			options.waitForSync = !!waitForSync;
		}
		
		return db.post(path + optionsToUrl(this, options), data);
	    },
	    /**
	     * retrieves a graph from the database
	     *
	     * @param {String} graph - the name of the graph
	     * @method get
	     * @return{Promise}
	     */
	    "get": function (graph) {
		return db.get(path + '/' + graph);
	    },
	    /**
	     * retrieves a list of graphs from the database
	     *
	     * @method list
	     * @return{Promise}
	     */
	    "list": function () {
		return db.get(path);
	    },
	    /**
	     * Deletes a graph
	     *
	     * @param {String} graph - the name of the graph
	     * @param {Boolean} [waitForSync=false] - wait until document has been sync to disk.
	     * @method delete
	     * @return{Promise}
	     */
	    "delete": function (graph, waitForSync) {

		var options = {};
		
		if (typeof waitForSync === "boolean") {
		    options.waitForSync = waitForSync;
		}
		
		return db.delete(path + '/' + graph + optionsToUrl(this, options));
	    },
	    "vertexCollections": {

		/**
		 * Lists all vertex collections
		 *
		 * @param {String} graph - the name of the graph
		 * @method list
		 * @return{Promise}
		 */
		"list": function(graph) {
		    return db.get(path + '/' + graph + "/vertex");
		},

		/**
		 * Add another vertex collection
		 *
		 * @param {String} graph - the name of the graph
		 * @param {String} collectionName - the name of the collection.
		 * @method list
		 * @return{Promise}
		 */
		"add": function(graph, collectionName) {
		    var data = {
			collection: collectionName
		    };
		    
		    return db.post(path + '/' + graph + "/vertex", data);
		},

		/**
		 * Remove a vertex collection from the graph
		 * The collection may not be used in an edge definition of this graph.
		 *
		 * @param {String} graph - the name of the graph
		 * @param {String} collectionName - the name of the collection.
		 * @method list
		 * @return{Promise}
		 */
		"delete": function(graph, collectionName) {
		    return db.delete(path + '/' + graph + "/vertex/" + collectionName);
		}
	    },

	    "edgeCollections": {

		/**
		 * Lists all edge collections
		 *
		 * @param {String} graph - the name of the graph
		 * @method list
		 * @return{Promise}
		 */
		"list": function(graph) {
		    return db.get(path + '/' + graph + "/edge");
		},

		/**
		 * Add another edge definition
		 *
		 * @param {String} graph - the name of the graph
		 * @param {String} collectionName - the name of the collection.
		 * @method list
		 * @return{Promise}
		 */
		"add": function(graph, collectionName, from, to) {
		    if (typeof from === "string") {
			from = [from];
		    }
		    if (typeof to === "string") {
			to = [to];
		    }
		    
		    var data = {
			collection: collectionName,
			to: to,
			from: from
		    };
		    
		    return db.post(path + '/' + graph + "/edge", data);
		},

		"replace": function(graph, collectionName, from, to) {
		    if (typeof from === "string") {
			from = [from];
		    }
		    if (typeof to === "string") {
			to = [to];
		    }
		    var data = {
			collection: collectionName,
			to: to,
			from: from
		    };
		    return db.put(path + '/' + graph + "/edge/" + collectionName, data);
		},

		/**
		 * Remove a edge collection from the graph
		 * All vertex collections will still be known to the graph and
		 * have to be removed seperately.
		 *
		 * @param {String} graph - the name of the graph
		 * @param {String} collectionName - the name of the collection.
		 * @method list
		 * @return{Promise}
		 */
		"delete": function(graph, collectionName) {
		    return db.delete(path + '/' + graph + "/edge/" + collectionName);
		}
	    },
	    "vertex": {

		/**
		 * creates a Vertex within a Graph
		 *
		 * @param {String} graph - the name of the graph
		 * @param vertexData - the vertex object as JSON. It is possible to set the vertex key by providing the _key attribute.
		 * @param {String} collection - vertex collection name
		 * @param {Boolean} [waitForSync=false] - wait until document has been sync to disk.
		 * @method vertex.create
		 * @return{Promise}
		 */
		"create": function (graph, vertexData, collection, waitForSync) {
		    var options = {}, collections;

		    if (waitForSync !== undefined) {
			options.waitForSync = !!waitForSync;
		    }
		    
		    return db.post(path + '/' + graph + '/vertex/' + collection + optionsToUrl(this, options), vertexData);
		},

		/**
		 * retrieves a vertex from a graph
		 *
		 * @param {String} graph - the name of the graph
		 * @param {String} id        - the vertex-handle
		 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
		 * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
		 * @method vertex.get
		 * @return{Promise}
		 */
		"get": function (graph, id, options) {
		    var headers;

		    if (options) {
			headers = url.ifMatch(id, options);
		    }
		    
		    return db.get(path + '/' + graph + '/vertex/' + id + optionsToUrl(this, options), headers);
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
		 * @method vertex.put
		 * @return{Promise}
		 */
		"put": function (graph, id, data, options) {
		    var headers;

		    if (options) {
			headers = url.ifMatch(id, options);
		    }
		    
		    if (options.forceUpdate !== undefined) {
			options.policy = (options.forceUpdate === true) ? "last" : "error";
			delete options.forceUpdate;
		    }
		    
		    return db.put(path + '/' + graph + '/vertex/' + id + optionsToUrl(this, options), data, headers);
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
		 * @method vertex.patch
		 * @return{Promise}
		 */
		"patch": function (graph, id, data, options) {
		    var headers;

		    if (options) {
			headers = url.ifMatch(id, options);
		    }
		    
		    if (options.forceUpdate !== undefined) {
			options.policy = (options.forceUpdate === true) ? "last" : "error";
			delete options.forceUpdate;
		    }
		    
		    return db.patch(path + '/' + graph + '/vertex/' + id + optionsToUrl(this, options, true), data, headers);
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
		 * @method vertex.delete
		 * @return{Promise}
		 */
		"delete": function (graph, id, options) {
		    var headers;

		    if (options) {
			headers = url.ifMatch(id, options);
		    }

		    return db.delete(path + '/' + graph + '/vertex/' + id + optionsToUrl(this, options), headers);
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
		 * @param {String} collection - the edge collection
		 * @param {Boolean} [waitForSync=false] - wait until document has been sync to disk.
		 * @method edge.create
		 * @return{Promise}
		 */
		"create": function (graph, edgeData, from, to, label, collection, waitForSync) {
		    var options = {},
			data = edgeData || {};
		    
		    if (to) data._to = to;
		    if (from) data._from = from;
		    if (label) data.$label = label;
		    if (waitForSync !== undefined) {
			options.waitForSync = !!waitForSync;
		    }
		    
		    return db.post(path + '/' + graph + '/edge/' + collection + optionsToUrl(this, options), data);
		},
		/**
		 * retrieves an edge  from a graph
		 *
		 * @param {String} graph - the name of the graph
		 * @param {String} id        - the edge-handle
		 * @param {Object} [options] - an object with the following optional parameters:
		 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
		 * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
		 * @method edge.get
		 * @return{Promise}
		 */
		"get": function (graph, id, options) {
		    var headers;

		    if (options) {
			headers = url.ifMatch(id, options);
		    }
		    
		    return db.get(path + '/' + graph + '/edge/' + id + optionsToUrl(this, options), headers);
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
		 * @method edge.put
		 * @return{Promise}
		 */
		"put": function (graph, id, data, options) {
		    var headers;

		    if (options) {
			headers = url.ifMatch(id, options);
		    }
		    
		    if (options.forceUpdate !== undefined) {
			options.policy = (options.forceUpdate === true) ? "last" : "error";
			delete options.forceUpdate;
		    }

		    return db.put(path + '/' + graph + '/edge/' + id + optionsToUrl(this, options), data, headers);
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
		 * @method edge.patch
		 * @return{Promise}
		 */
		"patch": function (graph, id, data, options) {
		    var headers;

		    if (options) {
			headers = url.ifMatch(id, options);
		    }

		    options = options || {};
		    
		    if (options.forceUpdate !== undefined) {
			options.policy = (options.forceUpdate === true) ? "last" : "error";
			delete options.forceUpdate;
		    }
		    
		    return db.patch(path + '/' + graph + '/edge/' + id + optionsToUrl(this, options, true), data, headers);
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
		 * @method edge.delete
		 * @return{Promise}
		 */
		"delete": function (graph, id, options) {
		    var headers;

		    if (options) {
			headers = url.ifMatch(id, options);
		    }

		    return db.delete(path + '/' + graph + '/edge/' + id + optionsToUrl(this, options), headers);
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
	     * @method getNeighbourVertices
	     * @return{Promise}
	     */

	    "getNeighbourVertices": function (graph, vertex, options) {
		var bindVars = {graphName:graph,vertex:vertex,options:{}},
		    queryData = {bindVars:bindVars},
		    filter;
		
		options = options || {};
		filter = options.filter || {};
		
		filterDirection(filter, bindVars.options);
		
		queryData.query = "FOR u IN GRAPH_NEIGHBORS(@graphName,@example,@options) ";
		queryData.query += createFilterQuery(bindVars, filter, "u.path.edges[0]");

		if (options.limit) {
		    queryData.query += " LIMIT @limit";
		    bindVars.limit = options.limit;
		}
		
		queryData.query += " RETURN u.vertex";

		queryData.count = options.count;
		queryData.batchSize = options.batchSize;
		
		return db.cursor.create(queryData);
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
	     * @method getEdgesForVertex
	     * @return{Promise}
	     */
	    "getEdgesForVertex": function (graph, vertex, options) {
		var bindVars = {graphName:graph,example:vertex,options:{}},
		    queryData = {bindVars:bindVars},
		    filter;
		
		options = options || {};
		filter = options.filter || {};
		
		filterDirection(filter, bindVars.options);
		
		queryData.query = "FOR e IN GRAPH_EDGES(@graphName,@example,@options) ";
		queryData.query += createFilterQuery(bindVars, filter, "e");
		queryData.query += " RETURN e";

		queryData.count = options.count;
		queryData.batchSize = options.batchSize;
		
		return db.cursor.create(queryData);
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
	     * @method vertices
	     * @return{Promise}
	     */

	    "vertices": function (graph, options) {
		var bindVars = {graphName:graph,options:{}},
		    queryData = {bindVars:bindVars},
		    filter;
		
		options = options || {};
		filter = options.filter || {};
		
		filterDirection(filter, bindVars.options);
		
		queryData.query = "FOR v IN GRAPH_VERTICES(@graphName,{},@options) ";
		queryData.query += createFilterQuery(bindVars, filter, "v");
		queryData.query += " RETURN v";
		
		queryData.count = options.count;
		queryData.batchSize = options.batchSize;
		
		return db.cursor.create(queryData);
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
	     * @method edges
	     * @return{Promise}
	     */
	    "edges": function (graph, options) {
		var bindVars = {graphName:graph,options:{}},
		    queryData = {bindVars:bindVars},
		    filter;
		
		options = options || {};
		filter = options.filter || {};
		
		filter.direction = filter.direction || "out"; 

		filterDirection(filter, bindVars.options);
		
		queryData.query = "FOR e IN GRAPH_EDGES(@graphName,{},@options) ";
		queryData.query += createFilterQuery(bindVars, filter, "e");
		queryData.query += " RETURN e";
		
		queryData.count = options.count;
		queryData.batchSize = options.batchSize;
		
		return db.cursor.create(queryData);
	    },
	    /**
	     * Sets the keepNull value for all further requests in the graph module.
	     *
	     * @param {Boolean} val
	     * @method keepNull
	     * @return {Object}    -   The modified instance of the graph module.
	     */
	    "keepNull": function (val) {
		this._keepNull = !!val;
		this.vertex._keepNull = !!val;
		this.edge._keepNull = !!val;

		return this;
	    },

	    /**
	     * Sets the waitForSync value for all further requests in the graph module.
	     *
	     * @param {Boolean} val
	     * @method waitForSync
	     * @return {Object}    -   The modified instance of the graph module.
	     */
	    "waitForSync": function (val) {
		this._waitForSync = !!val;
		this.vertex._waitForSync = !!val;
		this.edge._waitForSync = !!val;

		return this;
	    }
	};
    
    return graphObject;
}

module.exports = Arango.api('graph', GraphAPI);
