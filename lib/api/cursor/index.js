/*global require exports */
/**
 * The api module to validate, test, execute arangodb queries and fetch the data..
 *
 * @module Arango
 * @submodule cursor
 * @class cursor
 * @extends Arango
 *
 **/
function CursorAPI(db) {
    var path = "/_api/cursor/";

    return {
	/**
	 *
	 * Fetches data for a cursor.
	 *
	 * @param {String} id   -   The id of the cursor to fetch data for
	 * @method get
	 * @return{Promise}
	 */
	"get": function (id) {
	    return db.put(path + id);
	},
	/**
	 * Executes query string.
	 *
	 * @param {Object} data - A JSON Object containing the query data:
	 * @param {String} data.query   - contains the query string to be executed.
	 * @param {Boolean} [data.count=false]  -   boolean flag that indicates whether the number of documents in the
	 * result set should be returned in the "count" attribute of the result.
	 * @param {Integer} [data.batchSize]    -   maximum number of result documents to be transferred from the server
	 * to the client in one roundtrip (optional). If this attribute is not set, a server-controlled default value
	 * will be used.
	 * @param {Object} [data.bindVars]- key/value list of bind parameters.
	 * @param {Object} [data.options]   -   key/value list of extra options for the query
	 * @param {Boolean} [data.options.fullCount=false]   -   if set to true and the query contains a LIMIT clause,
	 * then the result will contain an extra attribute extra with a sub-attribute fullCount. This sub-attribute will
	 * contain the number of documents in the result before the last LIMIT in the query was applied. It can be used
	 * to count the number of documents that match certain filter criteria, but only return a subset of them, in one
	 * go.
	 * @method create
	 * @return{Promise}
	 */
	"create": function (data) {
	    return db.post(path, data);
	},
	/**
	 * Validates a query.
	 *
	 * @param {Object} data - A JSON Object containing the query data:
	 * @param {String} data.query   - contains the query string to be executed.
	 * @param {Boolean} [data.count=false]  -   boolean flag that indicates whether the number of documents in the
	 * result set should be returned in the "count" attribute of the result.
	 * @param {Integer} [data.batchSize]    -   maximum number of result documents to be transferred from the server
	 * to the client in one roundtrip (optional). If this attribute is not set, a server-controlled default value
	 * will be used.
	 * @param {Object} [data.bindVars]- key/value list of bind parameters.
	 * @param {Object} [data.options]   -   key/value list of extra options for the query
	 * @param {Boolean} [data.options.fullCount=false]   -   if set to true and the query contains a LIMIT clause,
	 * then the result will contain an extra attribute extra with a sub-attribute fullCount. This sub-attribute will
	 * contain the number of documents in the result before the last LIMIT in the query was applied. It can be used
	 * to count the number of documents that match certain filter criteria, but only return a subset of them, in one
	 * go.
	 * @method query
	 * @return{Promise}
	 */
	"query": function (data) {
	    return db.post("/_api/query", data);
	},
	/**
	 * Explains a query.
	 *
	 * @param {Object} data - A JSON Object containing the query data:
	 * @param {String} data.query   - contains the query string to be executed.
	 * @param {Boolean} [data.count=false]  -   boolean flag that indicates whether the number of documents in the
	 * result set should be returned in the "count" attribute of the result.
	 * @param {Number} [data.batchSize]    -   maximum number of result documents to be transferred from the server
	 * to the client in one roundtrip (optional). If this attribute is not set, a server-controlled default value
	 * will be used.
	 * @param {Object} [data.bindVars]- key/value list of bind parameters.
	 * @param {Object} [data.options]   -   key/value list of extra options for the query
	 * @param {Boolean} [data.options.fullCount=false]   -   if set to true and the query contains a LIMIT clause,
	 * then the result will contain an extra attribute extra with a sub-attribute fullCount. This sub-attribute will
	 * contain the number of documents in the result before the last LIMIT in the query was applied. It can be used
	 * to count the number of documents that match certain filter criteria, but only return a subset of them, in one
	 * go.
	 * @method explain
	 * @return{Promise}
	 */
	"explain": function (data) {
	    var queryData = {};

	    queryData.query = data;
	    
	    return db.post("/_api/explain", data);
	},
	/**
	 * deletes a cursor.
	 *
	 * @param {String} id   -   The id of the cursor to fetch data for
	 * @method delete
	 * @return{Promise}
	 */
	"delete": function (id) {
	    return db.delete(path + id);
	}
    };
}

exports.cursor = CursorAPI;
