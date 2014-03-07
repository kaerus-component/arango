var Arango = require('../arango');

/**
 * The api module to do administrative requests on Arango
 *
 * @module arango
 * @class admin
 * @submodule admin
 **/
function AdminAPI(db) {
    var path = "/_admin/";
    
    return {
        /**
         * Returns the server version
         *
         * @param {Boolean} details     - If true more details are returned.
         * @param {Function} callback   - The callback function.
         * @method version
         * @return {Promise}
         */
        "version": function(details, callback) {
            return db.get(path + "version?details=" + !! details, callback);
        },
        /**
         * Returns server statistics.
         *
         * @param {Function} callback   - The callback function.
         * @method statistics
         * @return {Promise}
         */
        "statistics": function(callback) {
            return db.get(path + "statistics", callback);
        },
        /**
         * Returns servers role. Possible values are "UNDEFINED", "COORDINATOR" or "PRIMARY".
         *
         * @param {Function} callback   - The callback function.
         * @method role
         * @return {Promise}
         */
        "role": function(callback) {
            var result;
            db.get(path + "server/role", function(err, ret, message) {
                if (message.status === "404") {
                    ret.role = "UNDEFINED";
                    message.status = "200"
                } else if (message.status === 200) {
                } else {
                    throw err;
                }
                callback(err, ret, message);
            });
        },
        /**
         * Returns descriptions for server statistics.
         *
         * @param {Function} callback   - The callback function.
         * @method statisticsDescription
         * @return {Promise}
         */
        "statisticsDescription": function(callback) {
            return db.get(path + "statistics-description", callback);
        },
        /**
         * Returns the server logs.
         *
         * @param {Object} [options]        - Optional parameters and filters, can contain.
         * @param {String} [options.upto]       - Returns all log entries up to log level upto. Note that upto must be:
         * <br>\- fatal or 0 <br>- error or 1 <br>- warning or 2 <br>- info or 3 <br>- debug or 4 <br>The default value
         * is info.
         * @param {String} [options.level]      - Returns all log entries of log level level. Note that the URL
         * parameters upto and level are mutually exclusive.
         * @param {String} [options.start]      - Returns all log entries such that their log entry identifier (lid
         * value) is greater or equal to start.
         * @param {Number} [options.size]      - Restricts the result to at most size log entries.
         * @param {Number} [options.offset]    - Starts to return log entries skipping the first offset log entries.
         * offset and size can be used for pagination.
         * @param {String} [options.sort]       - Sort the log entries either ascending (if sort is asc) or descending
         * (if sort is desc) according to their lid values. Note that the lid imposes a chronological order. The default
         * value is asc
         * @method log
         * @return {Promise}
         */
        "log": function(options, callback) {

            params = "";
            if (options) {
                Object.keys(options).forEach(function(param) {
                    params += param + '=' + options[param] + "&";
                });
            }
            return db.get(path + "log?" + params, callback);
        },
        /**
         * Returns the routes defined in ArangoDB,
         *
         * @param {Function} callback   - The callback function.
         * @method routes
         * @return {Promise}
         */
        "routes": function(callback) {
            return db.get(path + "routing/routes", callback);
        },
        /**
         * Reloads the routes in ArangoDB.
         *
         * @param {Function} callback   - The callback function.
         * @method routesReload
         * @return {Promise}
         */
        "routesReload": function(callback) {
            return db.get(path + "routing/reload", callback);
        },
        /**
         * Flushes the server modules.
         *
         * @param {Function} callback   - The callback function.
         * @method modulesFlush
         * @return {Promise}
         */
        "modulesFlush": function(callback) {
            return db.get(path + "modules/flush", callback);
        },
        /**
         * Returns the server time.
         *
         * @param {Function} callback   - The callback function.
         * @method time
         * @return {Promise}
         */
        "time": function(callback) {
            return db.get(path + "time", callback);
        },
        /**
         * The call returns an object with the following attributes: <br>- headers: a list of HTTP headers received
         * \n<br>- requestType: the HTTP request method (e.g. GET)<br>- parameters: list of URL parameters received
         *
         * @param {Function} callback   - The callback function.
         * @method echo
         * @return {Promise}
         */
        "echo": function(method, htmloptions, data, headers, callback) {
            method = typeof method === 'string' ? method.toUpperCase() : 'GET';
            headers = {
                headers: headers
            };
            htmloptions = htmloptions ? htmloptions : '';

            return db.request(method, path + 'echo' + htmloptions, data, headers, callback);
        }
    }
}

module.exports = Arango.api('admin', AdminAPI);
