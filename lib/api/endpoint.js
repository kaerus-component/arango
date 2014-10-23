var Arango = require('../arango');

/**
 * The api module to maintain endpoints in ArangoDB.
 *
 * @module Arango
 * @submodule endpoint
 * @class endpoint
 * @extends Arango
 *
 **/
function EndpointAPI(db) {
    var path = "/_api/endpoint";

    return {
	/**
	 *
	 * creates an endpoint
	 *
	 * @param {String} endpoint -  the endpoint specification, e.g. tcp://127.0.0.1:8530
	 * @param {List} databases - a list of database names the endpoint is responsible for.
	 * @method create
	 * @return{Promise}
	 */
	"create": function (endpoint, databases) {
	    var description = {};

	    description.endpoint = endpoint;
	    description.databases = databases;

	    return db.post(path, description);
	},
	/**
	 * Returns the list of endpoints
	 *
	 * @param {Function} callback   - The callback function.
	 * @method get
	 * @return{Promise}
	 */
	"get": function () {
	    return db.get(path);
	},
	/**
	 * Deletes an endpoint
	 *
	 * @param {String} endpoint -  the endpoint specification, e.g. tcp://127.0.0.1:8530
	 * @method delete
	 * @return{Promise}
	 */
	"delete": function (endpoint) {
	    return db.delete(path + "/" + encodeURIComponent(endpoint));
	}
    };
}


module.exports = Arango.api('endpoint', EndpointAPI);
