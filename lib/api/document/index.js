/*global require exports */
var url = require('../../url');

/**
 * The api module to perform document related operations on ArangoDB.
 *
 * @module Arango
 * @submodule document
 * @class document
 * @extends Arango
 *
 **/

function DocumentAPI(db) {
    var path = "/_api/document";

    return {
	/**
	 * creates a a document in a given collection.
	 *
	 * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
	 * in the connection is used.
	 * @param {Object} data - the data of the document as JSON object
	 * @param {Object} [options] - an object with the following optional parameters:
	 * @param {Boolean} [options.createCollection=false] - if set the collection given in "collection" is created as
	 * well.
	 * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
	 * @method create
	 * @return{Promise}
	 */
	"create": function (collection, data, options) {
	    if (typeof collection !== 'string') {
		options = data;
		data = collection;
		collection = db._collection;
	    }

	    if (!options) options = {};

	    options.collection = collection;

	    return db.post(path + url.options(options), data);
	},
	/**
	 * retrieves a document from the database
	 *
	 * @param {String} id - the document-handle
	 * @param {Object} [options] - an object with the following optional parameters:
	 * @param {Boolean} [options.match] - boolean defining if the given revision should match the found document or
	 * not.
	 * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
	 * @method get
	 * @return{Promise}
	 */
	"get": function (id, options) {
	    var headers;

	    if (options) {
		headers = url.ifMatch(id, options);
	    }
	    
	    return db.get(path + '/' + id + url.options(options), headers);
	},
	/**
	 * replaces a document with the data given in data.
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
	    var headers;

	    if (options) {
		headers = url.ifMatch(id, options);
	    }

	    options = options ? options : {};

	    if (options.forceUpdate !== undefined) {
		options.policy = (options.forceUpdate === true) ? "last" : "error";
		delete options.forceUpdate;
	    }

	    return db.put(path + '/' + id + url.options(options), data, headers);
	},
	/**
	 * patches a document with the data given in data
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
	    var headers;
	    
	    if (options) {
		headers = url.ifMatch(id, options);
	    }
	    
	    options = options ? options : {};

	    if (options.forceUpdate !== undefined) {
		options.policy = (options.forceUpdate === true) ? "last" : "error";
		delete options.forceUpdate;
	    }

	    return db.patch(path + '/' + id + url.options(options), data, headers);
	},
	/**
	 * Deletes a document
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
	    
	    options = options ? options : {};

	    if (options.forceUpdate !== undefined) {
		options.policy = (options.forceUpdate === true) ? "last" : "error";
		delete options.forceUpdate;
	    }
	    
	    return db.delete(path + '/' + id + url.options(options),headers);
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
	    
	    options = options ? options : {};

	    if (options.forceUpdate !== undefined) {
		options.policy = (options.forceUpdate === true) ? "last" : "error";
		delete options.forceUpdate;
	    }
	    
	    return db.head(path + '/' + id + url.options(options), headers);
	},
	/**
	 * returns all documents in a collection
	 *
	 * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
	 * in the connection is used.
	 * @method list
	 * @return{Promise}
	 */
	"list": function (collection) {
	    if (typeof collection !== 'string') {
		collection = db._collection;
	    }
	    
	    return db.get(path + "?collection=" + collection);
	}
    };
}

exports.document = DocumentAPI;
