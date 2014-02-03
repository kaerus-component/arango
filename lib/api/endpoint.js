/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
var Arango = require('../arango');

var path = "/_api/endpoint";

function EndpointAPI(db) {
    return {
        /**
         *
         * creates an endpoint
         *
         * @param endpoint -  the endpoint specification, e.g. tcp://127.0.0.1:8530
         * @param databases - a list of database names the endpoint is responsible for.
         * @param callback
         * @returns {*}
         */
        "create": function(endpoint, databases, callback) {
            var description = {};
            
            description.endpoint = endpoint;
            description.databases = databases;

            return db.post(path, description, callback);
        },
        /**
         * Returns the list of endpoints
         *
         * @param callback
         * @returns {*}
         */
        "get": function(callback) {
            return db.get(path, null, callback);
        },
        /**
         * Deletes an endpoint
         *
         * @param endpoint  - The endpoint which should be deleted.
         * @param callback
         * @returns {*}
         */
        "delete": function(endpoint, callback) {
            return db.delete(path+"/" + encodeURIComponent(endpoint), callback);
        }
    }
};


module.exports = Arango.api('endpoint',EndpointAPI);
