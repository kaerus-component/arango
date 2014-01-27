/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
var Arango = require('../arango');

var path = "/_api/cursor/";

var CursorAPI = {
    /**
     *
     * @param id -- The id of the cursor to fetch data for
     * @param callback
     * @returns {*}
     */
    "get": function(id,callback) {
        return this.db.put(path+id,{},callback);
    },
    /**
     * Executes query string.
     *
     * @param data - A JSON Object containing the query data
     * - query: contains the query string to be executed (mandatory)
     *              - count: boolean flag that indicates whether the number of documents in the result set should be
     *                      returned in the "count" attribute of the result (optional).
     *              - batchSize: maximum number of result documents to be transferred from the server to the client
     *                      in one roundtrip (optional). If this attribute is not set,
     *                      a server-controlled default value will be used.
     *              - bindVars: key/value list of bind parameters (optional).
     *              - options: key/value list of extra options for the query (optional).
     *                      - fullCount: if set to true and the query contains a LIMIT clause,
     *                                  then the result will contain an extra attribute extra with a sub-attribute fullCount.
     *                                  This sub-attribute will contain the number of documents in the result before
     *                                  the last LIMIT in the query was applied. It can be used to count the number of documents
     *                                  that match certain filter criteria, but only return a subset of them, in one go.
     * @param callback
     * @returns {*}
     */
    "create": function(data,callback) {
        return this.db.post(path,data,callback);
    },
    /**
     * To validate a query string without executing it.
     *
     * @param data - A JSON Object containing the query data
     * - query: contains the query string to be executed (mandatory)
     *              - count: boolean flag that indicates whether the number of documents in the result set should be
     *                      returned in the "count" attribute of the result (optional).
     *              - batchSize: maximum number of result documents to be transferred from the server to the client
     *                      in one roundtrip (optional). If this attribute is not set,
     *                      a server-controlled default value will be used.
     *              - bindVars: key/value list of bind parameters (optional).
     *              - options: key/value list of extra options for the query (optional).
     *                      - fullCount: if set to true and the query contains a LIMIT clause,
     *                                  then the result will contain an extra attribute extra with a sub-attribute fullCount.
     *                                  This sub-attribute will contain the number of documents in the result before
     *                                  the last LIMIT in the query was applied. It can be used to count the number of documents
     *                                  that match certain filter criteria, but only return a subset of them, in one go.
     * @param callback
     * @returns {*}
     */
    "query": function(data,callback) {
        return this.db.post("/_api/query",data,callback);
    },
    /**
     * To explain a query string without executing it.
     *
     * @param data - A JSON Object containing the query data
     * - query: contains the query string to be executed (mandatory)
     *              - count: boolean flag that indicates whether the number of documents in the result set should be
     *                      returned in the "count" attribute of the result (optional).
     *              - batchSize: maximum number of result documents to be transferred from the server to the client
     *                      in one roundtrip (optional). If this attribute is not set,
     *                      a server-controlled default value will be used.
     *              - bindVars: key/value list of bind parameters (optional).
     *              - options: key/value list of extra options for the query (optional).
     *                      - fullCount: if set to true and the query contains a LIMIT clause,
     *                                  then the result will contain an extra attribute extra with a sub-attribute fullCount.
     *                                  This sub-attribute will contain the number of documents in the result before
     *                                  the last LIMIT in the query was applied. It can be used to count the number of documents
     *                                  that match certain filter criteria, but only return a subset of them, in one go.
     * @param callback
     * @returns {*}
     */
    "explain": function(data,callback) {
        var queryData = {};
        queryData.query = data;
        return this.db.post("/_api/explain",data,callback);
    },
    "delete": function(id,callback) {
        return this.db.delete(path+id,callback);
    }
};

module.exports = Arango.api('cursor',CursorAPI);
