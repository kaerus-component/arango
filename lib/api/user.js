var Arango = require('../arango');
/**
 * The api module to maintain users in ArangoDB.
 *
 * @class users
 * @module arango
 * @submodule users
 **/
function UserAPI(db) {
    var path = "/_api/user/";

    return {

	/**
	 * Creates a user.
	 *
	 * @param {String} username  - the username.
	 * @param {String} password  - the password.
	 * @param {Boolean} [active=true] - true if is the user is active.
	 * @param {Object} [extra]   - additional userdata as JSONObject
	 * @method create
	 * @return{Promise}
	 */
	"create": function (username, password, active, extra) {
	    if (typeof active !== 'boolean') {
		extra = active;
		active = true;
	    }
	    
	    var data = {
		username: username,
		password: password,
		active: active,
		extra: extra
	    };
	    
	    return db.post(path, data);
	},
	/**
	 * Returns the requested user.
	 *
	 * @param {String} username  - the user to request data for.
	 * @method get
	 * @return{Promise}
	 */
	"get": function (username) {
	    return db.get(path + username);
	},
	/**
	 * Replaces entry for user
	 *
	 * @param {String} username  - the user to be replaced
	 * @param {String} password  - new password
	 * @param {Boolean} [active=true] is the user is active.
	 * @param {Object} [extra]   - additional userdata as JSONObject
	 * @method put
	 * @return{Promise}
	 */
	"put": function (username, password, active, extra) {
	    if (typeof active !== 'boolean') {
		extra = active;
		active = true;
	    }

	    var data = {
		password: password,
		active: active
	    };
	    
	    if (extra) data.extra = extra;

	    return db.put(path + username, data);
	},
	/**
	 * updates entry for user
	 * @param {String} username  - the user to be replaced
	 * @param {String} password  - new password
	 * @param {Boolean} [active] - boolean is the user is active.
	 * @param {Object} [extra]  - additional userdata as JSONObject
	 * @method patch
	 * @return{Promise}
	 */
	"patch": function (username, password, active, extra) {
	    if (typeof active !== 'boolean') {
		extra = active;
		active = true;
	    }

	    var data = {
		password: password
	    };
	    
	    if (extra) data.extra = extra;
	    if (active !== undefined) data.active = active;
	    if (extra !== undefined) data.extra = extra;
	    
	    return db.patch(path + username, data);
	},
	/**
	 * deletes user
	 * @param {String} username  - the user to be deleted
	 * @method delete
	 * @return{Promise}
	 */
	"delete": function (username) {
	    return db.delete(path + username);
	}
    };
}

module.exports = Arango.api('user', UserAPI);
