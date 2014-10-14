var Arango = require('../arango');

/**
 * The api module "aqlfunction" to define user functions in ArangoDB.
 *
 * @class aqlfunction
 * @module arango
 * @submodule aqlfunction
 **/
function AqlfunctionAPI(db) {
    var path = "/_api/aqlfunction/";

    return {
	/**
	 * Creates a user defined AQL function.
	 *
	 * @param {String} name - name of the function.
	 * @param {String} code - the function.
	 * @param {Boolean} [isDeterministic]   -   boolean value to indicate that the function results are fully
	 * deterministic.
	 * @param {Function} callback   - The callback function.
	 * @method create
	 * @return{Promise}
	 */
	"create": function (name, code, isDeterministic, callback) {
	    var options = {
		"name": name,
		"code": code
	    };
	    
	    if (typeof isDeterministic === 'function') {
		callback = isDeterministic;
		isDeterministic = null;
	    }
	    
	    if(isDeterministic === true)
		options.isDeterministic = isDeterministic;
	    
	    return db.post(path, options, callback);
	},
	/**
	 * Deletes a user defined AQL function.
	 *
	 * @param {String} name - name of the function.
	 * @param {Boolean} [group] - if set to true all functions is the namespace set in name will be deleted.
	 * @param {Function} callback   - The callback function.
	 * @method delete
	 * @return{Promise}
	 */
	"delete": function (name, group, callback) {
	    return db.delete(path + encodeURIComponent(name) + "/?group=" + group, callback);
	},
	/**
	 * Returns all user defined AQL functions.
	 *
	 * @param {String} [namespace] - If set only functions in this namespace will be returned.
	 * @param {Function} callback   - The callback function.
	 * @method get
	 * @return{Promise}
	 */
	"get": function (namespace, callback) {
	    var params = "";
	    if (typeof namespace === 'string') {
		params += '?namespace=' + encodeURIComponent(namespace);
	    }
	    
	    return db.get(path + params, callback);
	}
    }
}

module.exports = Arango.api('aqlfunction', AqlfunctionAPI);
