/*global require exports */
var api = require('../api'),
    url = require('../../url'),
    utils = require('../../utils');

/**
 * The api module to perform edge related operations on ArangoDB.
 *
 * @module Arango
 * @submodule edge
 * @class edge
 * @extends Arango
 * 
 **/
function EdgeAPI(db) {
    var path = "/_api/edge",
	ypath = "/_api/edges/";

    return {
	/**
	 * creates an edge in a given collection.
	 *
	 * @param {String} collection - the collection
	 * @param {String} from - The document handle of the start point must be passed in from handle.
	 * @param {String} to - The document handle of the end point must be passed in from handle.
	 * @param {Object} data - the data of the edge as JSON object
	 * @param {Object} [options] - an object with the following optional parameters:
	 * @param {Boolean} [options.createCollection=false] - if set the collection given in "collection" is created as
	 * well.
	 * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
	 * @method create
	 * @return{Promise}
	 */
	"create": function (collection, from, to, data, options) {
	    if (typeof collection !== 'string') {
		options = options;
		options = data;
		data = to;
		to = from;
		from = collection;
		collection = db._collection;
	    }

	    options = options || {};

	    options.collection = collection;
	    options.from = from;
	    options.to = to;
	    
	    return db.post(path + url.options(options), data);
	},
	/**
	 * retrieves an edge from the database
	 *
	 * @param {String} id - the edge-handle
	 * @param {Object} [options] - an object with the following optional parameters:
	 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
	 * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
	 * @method get
	 * @return{Promise}
	 */
	"get": function (id, options) {

	    if (options) {
		options = options ? options : {};
		
		utils.extend(true,options,url.ifMatch(id, options));
	    }

	    return db.get(path + '/' + id + url.options(options));
	},
	/**
	 * replaces an edge with the data given in data.
	 *
	 * @param {String} id - the edge-handle
	 * @param {Object} data - the data of the edge as JSON object
	 * @param {Object} [options] - an object with the following optional parameters:
	 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
	 * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
	 * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
	 * does not match.
	 * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
	 * @method put
	 * @return{Promise}
	 */
	"put": function (id, data, options) {

	    if (options) {
		options = options ? options : {};
		
		utils.extend(true,options,url.ifMatch(id, options));
	    }

	    options = options || {};

	    if (options.forceUpdate !== undefined) {
		options.policy = (options.forceUpdate === true) ? "last" : "error";
		delete options.forceUpdate;
	    }

	    return db.put(path + '/' + id + url.options(options), data, options);
	},
	/**
	 * patches an edge with the data given in data
	 *
	 * @param {String} id - the edge-handle
	 * @param {Object} data - the data of the edge as JSON object
	 * @param {Object} [options] - an object with the following optional parameters:
	 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
	 * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
	 * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
	 * does not match.
	 * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
	 * @param {Boolean} [options.keepNull=true] -  if set to false a patch request will delete every null value
	 * attributes.
	 * @method patch
	 * @return{Promise}
	 */
	"patch": function (id, data, options) {

	    if (options) {
		options = options ? options : {};
		
		utils.extend(true,options,url.ifMatch(id, options));
	    }

	    options = options ? options : {};

	    if (options.forceUpdate !== undefined) {
		options.policy = (options.forceUpdate === true) ? "last" : "error";
		delete options.forceUpdate;
	    }

	    return db.patch(path + '/' + id + url.options(options), data);
	},
	/**
	 * Deletes an edge
	 *
	 * @param {String} id - the document-handle
	 * @param {Object} [options] - an object with the following optional parameters:
	 * @param {Boolean} [options.match] - boolean defining if the given revision should match the found document or
	 * not.
	 * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
	 * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
	 * does not match.
	 * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
	 * @method delete
	 * @return{Promise}
	 */
	"delete": function (id, options) {
	    var headers;
	    
	    if (options) {
		headers = url.ifMatch(id, options);
	    }

	    options = options || {};

	    return db.delete(path + '/' + id + url.options(options), headers);
	},
	/**
	 * same as get but only returns the header.
	 *
	 * @param {String} id - the edge-handle
	 * @param {Object} [options] - an object with the following optional parameters:
	 * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
	 * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
	 * @method head
	 * @return{Promise}
	 */
	"head": function (id, options) {
	    var headers;

	    if (options) {
		headers = url.ifMatch(id, options);
	    }
	    
	    options = options || {};

	    return db.head(path + '/' + id + url.options(options), headers);
	},
	/**
	 * Returns the list of edges starting or ending in the vertex identified by vertex-handle.
	 *
	 * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
	 * in the connection is used.
	 * @param {String} vertex   -   The id of the start vertex.
	 * @param {String} [direction=any] - Selects in or out direction for edges. If not set, any edges are returned.
	 * @method list
	 * @return{Promise}
	 */
	"list": function (collection, vertex, direction) {
	    var options;

	    if(!vertex) {
		vertex = collection;
		direction = 'any';
		collection = db._collection;
	    } else if(['in','out','any'].indexOf(vertex) >= 0){
		direction = vertex;
		vertex = collection;
		collection = db._collection;
	    }

	    options = '?vertex=' + vertex + '&direction=' + direction;

	    return db.get(ypath + collection + options);
	}
    };
}

exports.edge = EdgeAPI;
