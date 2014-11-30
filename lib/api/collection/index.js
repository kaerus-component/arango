/*global require exports */

var url = require('../../url');

/**
 * The api module to do perform operations on collections.
 *
 * @module Arango
 * @submodule collection
 * @class collection
 * @extends Arango
 *
 **/
function CollectionAPI(db) {
    var path = "/_api/collection/";

    return {
	/**
	 * Creates a collection
	 *
	 * @param {String} collection       - the collection name
	 * @param {Object} [data]        - a JSONObject containing optional attributes:
	 * @param {Boolean} [data.waitForSync=false] -    If true then the data is synchronised to disk before
	 * returning from a create or update of a document.
	 * @param {Boolean} [data.doCompact=true] - whether or not the collection will be compacted.
	 * @param {Number} [data.type=2] -   the type of the collection to create. The following values for type are
	 * valid: <br>- 2: document collection <br>- 3: edges collection
	 * @param {Number} [data.journalSize]    -   The maximal size of a journal or datafile. Must be at least 1MB.
	 * @param {Boolean} [data.isSystem=false]-    If true, create a system collection. In this case collectionname
	 * should start with an underscore. End users should normally create non-system collections only. API
	 * implementors may be required to create system collections in very special occasions, but normally a regular
	 * collection will do.
	 * @param {Boolean} [data.isVolatile=false]-  If true then the collection data is kept in-memory only and not
	 * made persistent. Unloading the collection will cause the collection data to be discarded. Stopping or
	 * re-starting the server will also cause full loss of data in the collection. Setting this option will make the
	 * resulting collection be slightly faster than regular collections because ArangoDB does not enforce any
	 * synchronisation to disk and does not calculate any CRC checksums for datafiles.
	 * @param {Number} [data.numberOfShards]   -   number of shards to distribute the collection on.
	 * @param {Number} [data.shardKeys]  -   list of shard key attributes to use (e.g. [ "_key1", "_key2" ]).
	 * @param {Object} [data.keyOptions] -   additional options for key generation. If specified, then keyOptions
	 * should be a JSON array containing the following attributes:
	 * @param {String} [data.keyOptions.type]-   "traditional" and "autoincrement".
	 * @param {Boolean} [data.keyOptions.allowUserKeys=false]   -    if set to true, then it is allowed to supply
	 * own key values in the _key attribute of a document.
	 * @param {Number} [data.keyOptions.increment]   -   increment value for autoincrement key generator.
	 * @param {Number} [data.keyOptions.offset]  -   initial offset value for autoincrement key generator.
	 *
	 * @return{Promise}
	 * @method create
	 */
	"create": function (collection, data) {
	    collection = collection || db._collection;

	    data = data ? data : {};

	    if (!data.name) data.name = collection;

	    return db.post(path, data);
	},
	/**
	 * The result is an object describing the collection.
	 *
	 * @param {String}  id        - the collection handle.
	 * @return{Promise}
	 * @method get
	 */
	"get": function (id) {
	    return db.get(path + id);
	},
	/**
	 * Deletes the collection.
	 *
	 * @param {String}  id        - the collection handle.
	 * @return{Promise}
	 * @method delete
	 */
	"delete": function (id) {
	    return db.delete(path + id);
	},
	/**
	 * Deletes all documents of a collection.
	 *
	 * @param {String}  id        - the collection handle.
	 * @return{Promise}
	 * @method truncate
	 */
	"truncate": function (id) {
	    return db.put(path + id + '/truncate');
	},
	/**
	 * Counts the document in the collection.
	 *
	 * @param {String}  id        - the collection handle.
	 * @return{Promise}
	 * @method count
	 */
	"count": function (id) {
	    return db.get(path + id + '/count');
	},
	/**
	 * Result contains the number of documents and additional statistical information about the collection.
	 *
	 * @param {String}  id        -	the collection handle.
	 * @return{Promise}
	 * @method figures
	 */
	"figures": function (id) {
	    return db.get(path + id + '/figures');
	},
	/**
	 * Returns a list of all collections in the database.
	 *
	 * @param {Object}  [options]	- list options
	 * @param {Boolean} [options]  	- shorthand for options.excludeSystem.
         * @param {Boolean} [options.excludeSystem] 	  - if set to true the system collections are excluded 
	 * @return{Promise}
	 * @method list
	 */
	"list": function (options) {
	    
	    if(typeof options === 'boolean') options = {excludeSystem: options};
	    
	    options = options || {};
	    
	    return db.get(path + url.options(options));
	},
	/**
	 * Loads a collection into memory.
	 *
	 * @param {String}  id        - the collection handle.
	 * @return{Promise}
	 * @method load
	 */
	"load": function (id, count) {
	    var param = {};
	    
	    param.count = count;
	    
	    return db.put(path + id + '/load', param);
	},
	/**
	 * Deletes a collection from memory.
	 *
	 * @param {String}  id        - the collection handle.
	 * @return{Promise}
	 * @method unload
	 */
	"unload": function (id) {
	    return db.put(path + id + '/unload', null);
	},
	/**
	 * Renames a collection.
	 *
	 * @param {String}  id        - the collection handle.
	 * @param {String} name       - the new name
	 * @return{Promise}
	 * @method rename
	 */
	"rename": function (id, name) {
	    var data = {
		name: name
	    };
	    return db.put(path + id + '/rename', data);
	},
	/**
	 * Result contains the waitForSync, doCompact, journalSize, and isVolatile properties.
	 *
	 * @param {String}  id        - the collection handle.
	 * @return{Promise}
	 * @method getProperties
	 */
	"getProperties": function (id) {
	    return db.get(path + id + '/properties');
	},
	/**
	 * Changes the properties of a collection.
	 *
	 * @param {String} id            - the collection handle.
	 * @param {Object} properties    - JSON Object that can contain each of the following:
	 * @param {Boolean} [properties.waitForSync=false] -  If true then creating or changing a document will wait
	 * until the data has been synchronised to disk.
	 * @param {Number} [properties.journalSize] -   Size (in bytes) for new journal files that are created for the
	 * collection.
	 * @return{Promise}
	 * @method setProperties
	 */
	"setProperties": function (id, data) {
	    return db.put(path + id + '/properties', data);
	},
	/**
	 * Result contains the collection's revision id. The revision id is a server-generated string that clients can
	 * use to check whether data in a collection has changed since the last revision check.
	 *
	 * @param {String}  id        - the collection handle.
	 * @return{Promise}
	 * @method revision
	 */
	"revision": function (id) {
	    return db.get(path + id + '/revision');
	},

	/**
	 * Will calculate a checksum of the meta-data (keys and optionally revision ids) and optionally the document
	 * data in the collection.
	 * The checksum can be used to compare if two collections on different ArangoDB instances contain the same
	 * contents. The current revision of the collection is returned too so one can make sure the checksums are
	 * calculated for the same state of data.
	 *
	 *
	 * @param {String}  id        - the collection handle.
	 * @param {Object} options   - JSON Object that can contain each of the following:
	 * @param {Boolean} [options.withRevisions=false]    -   If true, then revision ids (_rev system attributes) are
	 * included in the checksumming.
	 * @param {Boolean} [options.withData=false]    -   If true, the user-defined document attributes will be
	 * included in the calculation too.
	 * @return{Promise}
	 * @method checksum
	 */
	"checksum": function (id, options) {

	    options = options ? options : {};

	    return db.get(path + id + '/checksum' + url.options(options));
	},
	/**
	 * Rotates the journal of a collection. The current journal of the collection will be closed and made a read-only
	 * datafile. The purpose of the rotate method is to make the data in the file available for compaction (compaction
	 * is only performed for read-only datafiles, and not for journals).
	 *
	 * @param {String}  id        - the collection handle.
	 * @return{Promise}
	 * @method rotate
	 */
	"rotate": function (id) {
	    return db.put(path + id + '/rotate', null);
	}
    };
}

exports.collection = CollectionAPI;
