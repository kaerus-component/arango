var Arango = require('../arango');

/**
 * The api module to maintain endpoints in ArangoDB.
 *
 * @class endpoint
 * @module arango
 * @submodule endpoint
 **/
function EndpointAPI(db) {
    var  path = "/_api/endpoint";
    
    return {
        /**
         *
         * creates an endpoint
         *
         * @param {String} endpoint -  the endpoint specification, e.g. tcp://127.0.0.1:8530
         * @param {List} databases - a list of database names the endpoint is responsible for.
         * @param {Function} callback   - The callback function.
         * @method create
         * @return{Promise}
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
         * @param {Function} callback   - The callback function.
         * @method get
         * @return{Promise}
         */
        "get": function(callback) {
            return db.get(path, null, callback);
        },
        /**
         * Deletes an endpoint
         *
         * @param {String} endpoint -  the endpoint specification, e.g. tcp://127.0.0.1:8530
         * @param {Function} callback   - The callback function.
         * @method delete
         * @return{Promise}
         */
        "delete": function(endpoint, callback) {
            return db.delete(path + "/" + encodeURIComponent(endpoint), callback);
        }
    }
}


module.exports = Arango.api('endpoint', EndpointAPI);
