/*jslint stupid: true*/
// AE: agree with above, erase & rewrite. :)


var Arango = require('../arango'),
    url = require('../url'),
    utils = require('../utils');

function process_property_compare (compare) {
    if (compare === undefined) {
	return "==";
    }

    switch (compare) {
    case ("==") :
	return compare;

    case ("!=") :
	return compare;

    case ("<") :
	return compare;

    case (">") :
	return compare;

    case (">=") :
	return compare;

    case ("<=") :
	return compare;
    }

    throw "unknown compare function in property filter";
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

function concatFilterStatement(filter, statement) {
    if (filter === "") {
	return " FILTER " + statement;
    }
    filter += " && " + statement;
    return filter;
}

////////////////////////////////////////////////////////////////////////////////
/// @brief fills a filter (throws exception)
////////////////////////////////////////////////////////////////////////////////

function process_property_filter (bindVars, filter, num, property, collname) {
    if (property.key === undefined) {
	throw "error in property filter";
    } 
    if (property.compare === "HAS") {
	bindVars["key" + num.toString()] = property.key;
	return concatFilterStatement(filter,
				     "HAS(" + collname + ", @key" + num.toString() + ") "
				    );
    }
    if (property.compare === "HAS_NOT") {
	bindVars["key" + num.toString()] = property.key;
	return concatFilterStatement(filter,
				     "!HAS(" + collname + ", @key" + num.toString() + ") "
				    );
    }
    if (property.value !== undefined) {
	bindVars["key" + num.toString()] = property.key;
	bindVars["value" + num.toString()] = property.value;
	return concatFilterStatement(filter,
				     collname + "[@key" + num.toString() + "] "
				     + process_property_compare(property.compare) + " @value" + num.toString()
				    );
    }

    throw "error in property filter";
}

////////////////////////////////////////////////////////////////////////////////
/// @brief fills a properties filter
////////////////////////////////////////////////////////////////////////////////

function process_properties_filter (data, properties, collname) {
    var i, filter = "";

    if (properties instanceof Array) {
	for (i = 0;  i < properties.length;  ++i) {
	    filter = process_property_filter(data, filter, i, properties[i], collname);
	}
    }
    else if (properties instanceof Object) {
	filter = process_property_filter(data, filter, 0, properties, collname);
    }
    return filter;
}

////////////////////////////////////////////////////////////////////////////////
/// @brief fills a labels filter
////////////////////////////////////////////////////////////////////////////////

function process_labels_filter (bindVars, filter, labels, collname) {

    // filter edge labels
    if (labels !== undefined && labels instanceof Array && labels.length > 0) {
	bindVars.labels = labels;
	return concatFilterStatement(filter, collname + '["$label"] IN @labels');
    }
}

function createFilterQuery(bindVars, filter, collname) {
    var filterQuery = "";
    if (filter.properties !== undefined) {
	filterQuery += process_properties_filter(bindVars, filter.properties, collname);
    }
    if (filter.labels !== undefined) {
	filterQuery += process_labels_filter(bindVars, filter.labels, collname);
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
	     * @param {Boolean} waitForSync - (optional) wait until document has been synced to disk.
	     * @method create
	     * @return{Promise}
	     */
	    "create": function (graph, edgeDefinitions, vertexCollections, waitForSync) {
		var data = {
		    name: graph
		}, options = {};
		
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
		    if (typeof waitForSync === "boolean") {
			options.waitForSync = waitForSync;
		    }
		} else {
		    switch (typeof edgeDefinitions) {
		    case "boolean": 
			waitForSync = edgeDefinitions;
			break;
		    case "object":
			data.edgeDefinitions = edgeDefinitions;
			switch (typeof vertexCollections) {
			case "boolean": 
			    waitForSync = vertexCollections;
			    break;
			case "object":
			    data.orphanCollections = vertexCollections;
			    if (typeof waitForSync === "boolean") {
				options.waitForSync = waitForSync;
			    }
			    break;    
			default:
			    throw "Invalid third parameter";
			}
			break;
		    case "undefined":
			break;
		    default:
			throw "Invalid second parameter";
		    }
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
		 * @param {Boolean} [waitForSync=false] - wait until document has been sync to disk.
		 * @method vertex.create
		 * @return{Promise}
		 */
		"create": function (graph, vertexData, collection, waitForSync) {
		    var options = {}, collections;

		    if (typeof collection !== "string") {
			waitForSync = collection;
			
			return graphObject.vertexCollections.list(graph,function(err, ret) {
			    if (ret.error === false) {
				collections = ret.collections;
				if (collections.length !== 1) {
				    throw "The vertex collection is not unambigiously defined. Please give it explicitly.";
				}
				collection = collections[0];
				if (typeof waitForSync === "boolean") {
				    options.waitForSync = waitForSync;
				}
				return db.post(path + '/' + graph + '/vertex/' + collection + optionsToUrl(this, options), vertexData);
			    }
			});
		    }

		    if (typeof waitForSync === "boolean") {
			options.waitForSync = waitForSync;
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
		"get": function (graph, id, options, callback) {
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
		 * @param {Boolean} [waitForSync=false] - wait until document has been sync to disk.
		 * @method edge.create
		 * @return{Promise}
		 */
		"create": function (graph, edgeData, from, to, label, collection, waitForSync) {
		    var collections;
		    var data = utils.extend({
			_from: from,
			_to: to
		    }, edgeData);
		    if (typeof collection !== "string") {
			waitForSync = collection;
			return graphObject.edgeCollections.list(graph, function(err, ret) {
			    if (ret.error === false) {
				collections = ret.collections;
				if (collections.length !== 1) {
				    throw "The edge collection is not unambigiously defined. Please give it explicitly.";
				}
				collection = collections[0];
				if (label) {
				    data = utils.extend({
					$label: label
				    }, data);
				}
				var options = {};
				
				if (typeof waitForSync === "boolean") {
				    options.waitForSync = waitForSync;
				}
				
				return db.post(path + '/' + graph + '/edge/' + collection + optionsToUrl(this, options), data);
			    }
			});
		    }
		    if (label) {
			data = utils.extend({
			    $label: label
			}, data);
		    }
		    var options = {};

		    if (typeof waitForSync === "boolean") {
			options.waitForSync = waitForSync;
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
		options = options || {};
		
		var queryData = {};
		var bindVars = {};
		bindVars.options = {};
		var filter = options.filter || {};
		filterDirection(filter, bindVars.options);
		bindVars.graphName = graph;
		bindVars.example = vertex;
		queryData.query = "FOR u IN GRAPH_NEIGHBORS(@graphName,@example,@options) ";
		queryData.query += createFilterQuery(bindVars, filter, "u.path.edges[0]");
		if (options.limit) {
		    queryData.query += " LIMIT @limit";
		    bindVars.limit = options.limit;
		}
		queryData.query += " RETURN u.vertex";
		queryData.bindVars = bindVars;
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
		options = options || {};
		var queryData = {};
		var bindVars = {};
		bindVars.graphName = graph;
		bindVars.example = vertex;
		bindVars.options = {};
		var filter = options.filter || {};
		filterDirection(filter, bindVars.options);
		bindVars.graphName = graph;
		queryData.query = "FOR e IN GRAPH_EDGES(@graphName,@example,@options) ";
		queryData.query += createFilterQuery(bindVars, filter, "e");
		queryData.query += " RETURN e";
		queryData.bindVars = bindVars;
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
		options = options || {};
		var queryData = {};
		var bindVars = {};
		bindVars.graphName = graph;
		bindVars.options = {};
		var filter = options.filter || {};
		filterDirection(filter, bindVars.options);
		bindVars.graphName = graph;
		queryData.query = "FOR v IN GRAPH_VERTICES(@graphName,{},@options) ";
		queryData.query += createFilterQuery(bindVars, filter, "v");
		queryData.query += " RETURN v";
		queryData.bindVars = bindVars;
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
		options = options || {};
		var queryData = {};
		var bindVars = {};
		bindVars.graphName = graph;
		bindVars.options = {};
		var filter = options.filter || {};
		// If no direction is set set it tou outbound s.t. we do not get duplicates
		filter.direction = filter.direction || "out"; 
		filterDirection(filter, bindVars.options);
		bindVars.graphName = graph;
		queryData.query = "FOR e IN GRAPH_EDGES(@graphName,{},@options) ";
		queryData.query += createFilterQuery(bindVars, filter, "e");
		queryData.query += " RETURN e";
		queryData.bindVars = bindVars;
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
