var Arango = require('../arango'),
    path = "/_api/edge",
    ypath = "/_api/edges/";

function optionsToUrl(o) {
    if (typeof o !== 'object') return '';

    return Object.keys(o).reduce(function(a, b, c) {
        c = b + '=' + o[b];
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
 * The api module to perform edge related operations on ArangoDB.
 *
 * @class edge
 * @module arango
 * @submodule edge
 **/
function EdgeAPI(db) {
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
         * @param {Function} callback   - The callback function.
         * @method create
         * @return{Promise}
         */
        "create": function(collection, from, to, data, options, callback) {
            if (typeof collection !== 'string') {
                callback = options;
                options = data;
                data = to;
                to = from;
                from = collection;
                collection = db._collection;
            }

            if (typeof options === 'function') {
                callback = options;
                options = null;
            }

            if (!options) options = {};

            options.collection = collection;
            options.from = from;
            options.to = to;
            return db.post(path + optionsToUrl(options), data, callback);
        },
        /**
         * retrieves an edge from the database
         *
         * @param {String} id - the edge-handle
         * @param {Object} [options] - an object with the following optional parameters:
         * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
         * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
         * @param {Function} callback   - The callback function.
         * @method get
         * @return{Promise}
         */
        "get": function(id, options, callback) {
            var headers;

            if (typeof options === 'function') {
                callback = options;
                options = null;
            } else if (options) {
                headers = ifMatch(id, options);
            }

            options = options ? options : {};

            return db.get(path + '/' + id + optionsToUrl(options), headers, callback);
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
         * @param {Function} callback   - The callback function.
         * @method put
         * @return{Promise}
         */
        "put": function(id, data, options, callback) {
            var headers;

            if (typeof options === 'function') {
                callback = options;
                options = null;
            } else if (options) {
                headers = ifMatch(id, options);
            }

            options = options ? options : {};

            if (options.forceUpdate !== undefined) {
                options.policy = (options.forceUpdate === true) ? "last" : "error";
                delete options.forceUpdate;
            }

            return db.put(path + '/' + id + optionsToUrl(options), data, headers, callback);
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
         * @param {Function} callback   - The callback function.
         * @method patch
         * @return{Promise}
         */
        "patch": function(id, data, options, callback) {
            var headers;

            if (typeof options === 'function') {
                callback = options;
                options = null;
            } else if (options) {
                headers = ifMatch(id, options);
            }

            options = options ? options : {};

            if (options.forceUpdate !== undefined) {
                options.policy = (options.forceUpdate === true) ? "last" : "error";
                delete options.forceUpdate;
            }

            return db.patch(path + '/' + id + optionsToUrl(options), data, headers, callback);
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

         * @param {Function} callback   - The callback function.
         * @method delete
         * @return{Promise}
         */
        "delete": function(id, options, callback) {
            var headers;

            if (typeof options === 'function') {
                callback = options;
                options = null;
            } else if (options) {
                headers = ifMatch(id, options);
            }

            options = options ? options : {};

            return db.delete(path + '/' + id + optionsToUrl(options), headers, callback);
        },
        /**
         * same as get but only returns the header.
         *
         * @param {String} id - the edge-handle
         * @param {Object} [options] - an object with the following optional parameters:
         * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
         * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
         * @param {Function} callback   - The callback function.
         * @method head
         * @return{Promise}
         */
        "head": function(id, options, callback) {
            var headers;

            if (typeof options === 'function') {
                callback = options;
                options = null;
            } else if (options) {
                headers = ifMatch(id, options);
            }
            options = options ? options : {};
            return db.head(path + '/' + id + optionsToUrl(options), headers, callback);
        },
        /**
         * Returns the list of edges starting or ending in the vertex identified by vertex-handle.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {String} vertex   -   The id of the start vertex.
         * @param {String} [direction=any] - Selects in or out direction for edges. If not set, any edges are returned.
         * @param {Function} callback   - The callback function.
         * @method list
         * @return{Promise}
         */
        "list": function(collection, vertex, direction, callback) {
            var options;

            if (typeof vertex === 'function') {
                callback = vertex;
                vertex = collection;
                collection = db._collection;
                direction = "any";

            }

            if (typeof direction === 'function') {
                callback = direction;
                direction = vertex;
                if (direction !== 'in' && direction !== 'out' && direction !== 'any') {
                    vertex = direction;
                    direction = "any";
                } else {
                    vertex = collection;
                    collection = db._collection;
                }
            }

            options = '?vertex=' + vertex + '&direction=' + direction;

            return db.get(ypath + collection + options, callback);
        }
    }
}


module.exports = Arango.api('edge', EdgeAPI);
