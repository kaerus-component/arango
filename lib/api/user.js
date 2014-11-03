var Arango = require('../arango');
var utils = require('../utils');

/**
 * The api module to maintain users in ArangoDB.
 *
 * @module Arango
 * @submodule user
 * @class user
 * @extends Arango
 *
 **/
function UserAPI(db) {
    var path = "/_api/user/";

    return {

	/**
	 * Creates a user.
	 *
	 * @param {String} user  - the username
	 * @param {Object} options  - user options
	 * @param {String} [options.passwd] - password
	 * @param {Boolean} [options.active] - deactivate user if false, default true
	 * @param {Object} [options.extra] - extra user attributes
	 * @param {Boolean} [options.changePassword] - if true user must change password, default false
	 * @method create
	 * @return{Promise}
	 */
	"create": function (user, options) {

	    if(!user) throw new Error("no username");
	    
	    var data = utils.extend({ user: user },options);
	    
	    return db.post(path, data);
	},
	/**
	 * Returns the requested user.
	 *
	 * @param {String} user  - the user to request data for.
	 * @method get
	 * @return{Promise}
	 */
	"get": function (user) {
	    return db.get(path + user);
	},
	/**
	 * Replaces entry for user
	 *
	 * @param {String} user  - the user to be replaced
	 * @param {Object} options  - user options (see create method)
	 * @method put
	 * @return{Promise}
	 */
	"put": function (user, options) {

	    if(!user) throw new Error("no username");
	    
	    var data = utils.extend({ user: user },options);
	    
	    return db.put(path + user, data);
	},
	/**
	 * updates entry for user
	 * @param {String} user  - the user to be replaced
	 * @param {Object} options  - user options (see create method)
	 * @method patch
	 * @return{Promise}
	 */
	"patch": function (user, options) {
	    
	    if(!user) throw new Error("no username");
	    
	    var data = utils.extend({ user: user },options);
	    
	    return db.patch(path + user, data);
	},
	/**
	 * deletes user
	 * @param {String} user  - the user to be deleted
	 * @method delete
	 * @return{Promise}
	 */
	"delete": function (user) {
	    return db.delete(path + user);
	}
    };
}

module.exports = Arango.api('user', UserAPI);
