var url = require('../../url');

/**
 * The api module to do administrative requests on Arango
 *
 * @module Arango
 * @submodule admin
 * @class admin
 * @extends Arango
 *
 **/
function AdminAPI(db) {
    var path = "/_admin/";

    return {
	/**
	 * Returns the server version
	 *
	 * @param {Boolean} details     - If true more details are returned.
	 * @method version
	 * @return {Promise}
	 */
	"version": function (details) {
	    return db.get(path + "version?details=" + !!details);
	},
	/**
	 * Returns server statistics.
	 *
	 * @method statistics
	 * @return {Promise}
	 */
	"statistics": function () {
	    return db.get(path + "statistics");
	},
	/**
	 * Returns servers role. Possible values are "UNDEFINED", "COORDINATOR" or "PRIMARY".
	 *
	 * @method role
	 * @return {Promise}
	 */
	"role": function () {
	    return db.get(path + "server/role");
	},
	/**
	 * Returns descriptions for server statistics.
	 *
	 * @method statisticsDescription
	 * @return {Promise}
	 */
	"statisticsDescription": function () {
	    return db.get(path + "statistics-description");
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
	"log": function (options) {
	    return db.get(path + 'log' + url.options(options));
	},
	/**
	 * Returns the routes defined in ArangoDB,
	 *
	 * @method routes
	 * @return {Promise}
	 */
	"routes": function () {
	    return db.get(path + "routing/routes");
	},
	/**
	 * Reloads the routes in ArangoDB.
	 *
	 * @method routesReload
	 * @return {Promise}
	 */
	"routesReload": function () {
	    return db.get(path + "routing/reload");
	},
	/**
	 * Returns the server time.
	 *
	 * @method time
	 * @return {Promise}
	 */
	"time": function () {
	    return db.get(path + "time");
	},
	/**
	 * The call returns an object with the following attributes: <br>- headers: a list of HTTP headers received
	 * \n<br>- requestType: the HTTP request method (e.g. GET)<br>- parameters: list of URL parameters received
	 *
	 * @method echo
	 * @return {Promise}
	 */
	"echo": function (method, htmloptions, data) {
	    method = typeof method === 'string' ? method.toUpperCase() : 'GET';
	    
	    htmloptions = htmloptions ? htmloptions : '';

	    return db.request(method, path + 'echo' + htmloptions, data);
	},

	/**
	 * Flushes the server wal.
	 *
	 * @param {Boolean} waitForSync        - Should wait if everything is synced to disk.
	 * @param {Boolean} waitForCollector   - Should wait for the collector to execute.
	 * @method modulesFlush
	 * @return {Promise}
	 */
	"walFlush": function (waitForSync, waitForCollector, options) {
	    var pathSuffix = "wal/flush";

	    if (waitForSync) {
		pathSuffix += "?waitForSync=" + waitForSync;
	    }
	    
	    if (waitForCollector) {
		pathSuffix += "?waitForCollector=" + waitForCollector;
	    }
	    
	    return db.put(path + pathSuffix, undefined, options);
	}
    };
}

exports.admin = AdminAPI;

