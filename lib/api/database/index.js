/*global require exports*/
/**
 * The api module to perform database related operations on ArangoDB.
 *
 * @module Arango
 * @submodule database
 * @class database
 * @extends Arango
 *
 **/
function DatabaseAPI(db) {
    var path = "/_api/database/";

    return {
	/**
	 *
	 * Creates a database.
	 *
	 * @param {String} name   -   The name of the database.
	 * @param {List} users   -  A list containing objects describing the users, each user Object contains:
	 * @param {String} users.username    -   The name of the user.
	 * @param {String} [users.passwd=""] -   The user password
	 * @param {Boolean} [users.active=true]   -  Indicates if the user is active.
	 * @param {Object} [users.extra] -   Object containing additional user data.
	 * @method create
	 * @return{Promise}
	 */
	"create": function (name, users) {
	    var options = {
		name: name
	    };

	    if (users) options.users = users;

	    return db.post(path, options);
	},
	/**
	 *
	 * Retrieves information about the current database
	 *
	 * @method current
	 * @return{Promise}
	 */
	"current": function () {
	    return db.get(path + 'current');
	},
	/**
	 *
	 * Lists all databases.
	 *
	 * @method list
	 * @return{Promise}
	 */
	"list": function () {
	    return db.get(path);
	},
	/**
	 *
	 * Returns all databases the current user can access.
	 *
	 * @method user
	 * @return{Promise}
	 */
	"user": function () {
	    return db.get(path + 'user');
	},
	/**
	 *
	 * Deletes a database.
	 *
	 * @param {String} name   -   The database to delete.
	 * @method delete
	 * @return{Promise}
	 */
	"delete": function (name) {
	    return db.delete(path + name);
	}
    };
}

exports.database = DatabaseAPI;
