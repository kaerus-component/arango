var Arango = require('../arango'),
    url = require('../url');

function CollectionAPI(db) {
    var path = "/_api/collection/";

    return {
        /**
         * Creates a collection
         *
         * @param collection    - the collection name
         * @param options       - a JSONObject containing optional attributes:
         *                          - waitForSync (default: false): If true then the data is synchronised to disk
         *                              before returning from a create or update of a document.
         *                          - doCompact (default is true): whether or not the collection will be compacted.
         *                          - type (default is 2): the type of the collection to create. The following values for
         *                              type are valid: - 2: document collection - 3: edges collection
         *                          - journalSize (default is a @ref CommandLineArangod "configuration parameter"):
         *                              The maximal size of a journal or datafile. Must be at least 1MB.
         *                          - isSystem (default is false): If true, create a system collection. In this case
         *                              collection-name should start with an underscore. End users should normally create
         *                              non-system collections only. API implementors may be required to create system
         *                              collections in very special occasions, but normally a regular collection will do.
         *                          - isVolatile (default is false): If true then the collection data is kept in-memory only
         *                              and not made persistent. Unloading the collection will cause the collection data to
         *                              be discarded. Stopping or re-starting the server will also cause full loss of data
         *                              in the collection. Setting this option will make the resulting collection be slightly
         *                              faster than regular collections because ArangoDB does not enforce any synchronisation
         *                              to disk and does not calculate any CRC checksums for datafiles.
         *                          -keyOptions  additional options for key generation. If specified, then keyOptions should
         *                              be a JSON array containing the following attributes (note: some of them are optional):
         *                              - type:         "traditional" and "autoincrement".
         *                              - allowUserKeys: if set to true, then it is allowed to supply own key values in the
         *                                              _key attribute of a document.
         *                              - increment:    increment value for autoincrement key generator.
         *                              - offset:       initial offset value for autoincrement key generator.
         *
         * @param callback
         * @returns {*}
         */
        "create": function(collection, options, callback) {
            collection = collection || db._collection;

            if (typeof options === 'function') {
                callback = options;
                options = null;
            }

            options = options ? options : {};

            if (!options.name) options.name = collection;

            return db.post(path, options, callback);
        },
        /**
         *  The result is an object describing the collection.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "get": function(id, callback) {
            return db.get(path + id, callback);
        },
        /**
         *  Deletes the collection.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "delete": function(id, callback) {
            return db.delete(path + id, callback);
        },
        /**
         * Deletes all documents of a collection.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "truncate": function(id, callback) {
            return db.put(path + id + '/truncate', null, callback);
        },
        /**
         * Counts the document in the collection.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "count": function(id, callback) {
            return db.get(path + id + '/count', callback);
        },
        /**
         * Result contains the number of documents and additional statistical information about the collection.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "figures": function(id, callback) {
            return db.get(path + id + '/figures', callback);
        },
        /**
         * Returns a list of all collections in the database.
         *
         * @param excludeSystem  - if set to true no system collections are returned.
         * @param callback
         * @returns {*}
         */
        "list": function(excludeSystem, callback) {
            var url = path;
            if (typeof excludeSystem === 'function') {
                callback = excludeSystem;
            } else {
                url += "?excludeSystem=" + excludeSystem;
            }
            return db.get(url, callback);
        },
        /**
         * Loads a collection into memory.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "load": function(id, count, callback) {
            var param = {};
            if (typeof count === "function") {
                callback = count;
            } else {
                param.count = count;
            }
            return db.put(path + id + '/load', param, callback);
        },
        /**
         * Deletes a collection from memory.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "unload": function(id, callback) {
            return db.put(path + id + '/unload', null, callback);
        },
        /**
         * Renames a collection.
         *
         * @param id        - the collection handle.
         * @param name      - the new name
         * @param callback
         * @returns {*}
         */
        "rename": function(id, name, callback) {
            var data = {
                name: name
            };
            return db.put(path + id + '/rename', data, callback);
        },
        /**
         * Result contains the waitForSync, doCompact, journalSize, and isVolatile properties.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "getProperties": function(id, callback) {
            return db.get(path + id + '/properties', callback);
        },
        /**
         * Changes the properties of a collection.
         *
         * @param id            - the collection handle.
         * @param properties    - JSON Object that can contain each of the following:
         *                          - waitForSync: If true then creating or changing a document will wait until the data has
         *                                         been synchronised to disk.
         *                          - journalSize: Size (in bytes) for new journal files that are created for the collection.
         * @param callback
         * @returns {*}
         */
        "setProperties": function(id, data, callback) {
            return db.put(path + id + '/properties', data, callback);
        },
        /**
         * Result contains the collection's revision id. The revision id is a server-generated string that clients can use
         * to check whether data in a collection has changed since the last revision check.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "revision": function(id, callback) {
            return db.get(path + id + '/revision', callback);
        },

        /**
         * Will calculate a checksum of the meta-data (keys and optionally revision ids) and optionally the document data in
         * the collection.
         * The checksum can be used to compare if two collections on different ArangoDB instances contain the same contents.
         * The current revision of the collection is returned too so one can make sure the checksums are calculated for the
         * same state of data.
         *
         *
         * @param id        - the collection handle.
         * @param options   - JSON Object that can contain each of the following:
         *                          - withRevisions: If true, then revision ids (_rev system attributes) are included in
         *                                               the checksumming.
         *                          - withData:      If true, the user-defined document attributes will be included in the
         *                                           calculation too.
         * @param callback
         * @returns {*}
         */
        "checksum": function(id, options, callback) {
            if (typeof options === "function") {
                callback = options;
                options = null;
            }

            options = options ? options : {};

            return db.get(path + id + '/checksum' + url.options(options), callback);
        },
        /**
         * Rotates the journal of a collection. The current journal of the collection will be closed and made a read-only
         * datafile. The purpose of the rotate method is to make the data in the file available for compaction (compaction
         * is only performed for read-only datafiles, and not for journals).
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "rotate": function(id, callback) {
            return db.put(path + id + '/rotate', null, null, callback);
        }
    }
}


module.exports = Arango.api('collection', CollectionAPI);
