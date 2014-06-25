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
     * @param {Function} callback   - The callback function.
     * @method create
     * @return{Promise}
     */
    "create": function (username, password, active, extra, callback) {
      if (typeof active !== 'boolean') {
        callback = extra;
        extra = active;
        active = true;
      }
      var data = {
        username: username,
        password: password,
        active: active,
        extra: extra
      };
      return db.post(path, data, callback);
    },
    /**
     * Returns the requested user.
     *
     * @param {String} username  - the user to request data for.
     * @param {Function} callback   - The callback function.
     * @method get
     * @return{Promise}
     */
    "get": function (username, callback) {
      return db.get(path + username, callback);
    },
    /**
     * Replaces entry for user
     *
     * @param {String} username  - the user to be replaced
     * @param {String} password  - new password
     * @param {Boolean} [active=true] is the user is active.
     * @param {Object} [extra]   - additional userdata as JSONObject
     * @param {Function} callback   - The callback function.
     * @method put
     * @return{Promise}
     */
    "put": function (username, password, active, extra, callback) {
      if (typeof active === 'function') {
        callback = active;
        active = undefined;
        extra = undefined;
      }
      if (typeof extra === 'function') {
        callback = extra;
        extra = undefined;
      }

      var data = {
        password: password,
        active: active
      };
      if (extra) data.extra = extra;

      return db.put(path + username, data, callback);
    },
    /**
     * updates entry for user
     * @param {String} username  - the user to be replaced
     * @param {String} password  - new password
     * @param {Boolean} [active] - boolean is the user is active.
     * @param {Object} [extra]  - additional userdata as JSONObject
     * @param {Function} callback   - The callback function.
     * @method patch
     * @return{Promise}
     */
    "patch": function (username, password, active, extra, callback) {
      if (typeof active === 'function') {
        callback = active;
        extra = undefined;
        active = undefined;
      }
      if (typeof extra === 'function') {
        callback = extra;
        extra = undefined;
      }

      var data = {
        password: password
      };
      if (extra) data.extra = extra;
      if (active !== undefined) data.active = active;
      if (extra !== undefined) data.extra = extra;
      return db.patch(path + username, data, callback);
    },
    /**
     * deletes user
     * @param {String} username  - the user to be deleted
     * @param {Function} callback   - The callback function.
     * @method delete
     * @return{Promise}
     */
    "delete": function (username, callback) {
      return db.delete(path + username, callback);
    }
  }
}

module.exports = Arango.api('user', UserAPI);
