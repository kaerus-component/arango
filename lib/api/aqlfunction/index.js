/*global require exports */

/**
 * The api module "aqlfunction" to define user functions in ArangoDB.
 *
 * @module Arango
 * @submodule aqlfunction
 * @class aqlfunction
 * @extends Arango
 **/
function AqlfunctionAPI(db) {
    var path = "/_api/aqlfunction/";

    return {
	/**
	 * Creates a user defined AQL function.
	 *
	 * @param {String} name - name of the function.
	 * @param {String} code - the function.
	 * @param {Boolean} isDeterministic   -   boolean value to indicate that the function results are fully
	 * deterministic.
	 * @method create
	 * @return{Promise}
	 */
	"create": function (name, code, isDeterministic) {
	    var data = {
		"name": name,
		"code": code.toString()
	    };
	    
	    if(isDeterministic === true)
		data.isDeterministic = isDeterministic;
	    
	    return db.post(path, data);
	},
	/**
	 * Deletes a user defined AQL function.
	 *
	 * @param {String} name - name of the function.
	 * @param {Boolean} [group] - if set to true all functions in the namespace set in name will be deleted.
	 * @method delete
	 * @return{Promise}
	 */
	"delete": function (name, group) {
	    return db.delete(path + encodeURIComponent(name) + "/?group=" + group);
	},
	/**
	 * Returns all user defined AQL functions.
	 *
	 * @param {String} [namespace] - If set only functions in this namespace will be returned.
	 * @method get
	 * @return{Promise}
	 */
	"get": function (namespace) {
	    var params = "";
	    
	    if (typeof namespace === 'string') {
		params += '?namespace=' + encodeURIComponent(namespace);
	    }
	    
	    return db.get(path + params);
	}
    };
}

exports.aqlfunction = AqlfunctionAPI;
