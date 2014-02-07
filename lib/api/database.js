var Arango = require('../arango');

/**
 * The api module to perform database related operations on ArangoDB.
 *
 * @class database
 * @module arango
 * @submodule database
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
         * @param {Function} callback   - The callback function.
         * @method create
         * @return{Promise}
         */
        "create": function(name, users, callback) {
            var options = {
                name: name
            };

            if (typeof users === 'function') {
                callback = users;
                users = null;
            }

            if (users) options.users = users;

            return db.post(path, options, callback);
        },
        /**
         *
         * Retrieves information about the current database
         *
         * @param {Function} callback   - The callback function.
         * @method current
         * @return{Promise}
         */
        "current": function(callback) {
            return db.get(path + 'current', callback);
        },
        /**
         *
         * Lists all databases.
         *
         * @param {Function} callback   - The callback function.
         * @method list
         * @return{Promise}
         */
        "list": function(callback) {
            return db.get(path, callback);
        },
        /**
         *
         * Returns all databases the current user can access.
         *
         * @param {Function} callback   - The callback function.
         * @method user
         * @return{Promise}
         */
        "user": function(callback) {
            return db.get(path + 'user', callback);
        },
        /**
         *
         * Deletes a database.
         *
         * @param {String} name   -   The database to delete.
         * @param {Function} callback   - The callback function.
         * @method delete
         * @return{Promise}
         */
        "delete": function(name, callback) {
            return db.delete(path + name, callback);
        }
    };
}

module.exports = Arango.api('database', DatabaseAPI);
