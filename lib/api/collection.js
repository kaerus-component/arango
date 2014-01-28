/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
var Arango = require('../arango');

var path = "/_api/collection/";

var CollectionAPI = {
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
    "create": function(collection,options,callback) {
        if(typeof options === 'function') {
            callback = options;
            options = {};    
        }
        if(!options.name) options.name = collection;
        return this.db.post(path,options,callback);
    },
    "get": function(id,callback) {
        return this.db.get(path+id,callback);   
    },
    "delete": function(id,callback) {
        return this.db.delete(path+id,callback);
    },
    "truncate": function(id,callback) {
        return this.db.put(path+id+'/truncate',null,callback);
    },
    "count": function(id,callback) {
        return this.db.get(path+id+'/count',callback);
    },
    "figures": function(id,callback) {
        return this.db.get(path+id+'/figures',callback);
    },
    "list": function(excludeSystem, callback) {
        var url = path;
        if (excludeSystem === true) {
            url += "?excludeSystem="+excludeSystem;
        }
        return this.db.get(url,callback);
    },
    "load": function(id,callback) {
        return this.db.put(path+id+'/load',null,callback);
    },
    "unload": function(id,callback) {
        return this.db.put(path+id+'/unload',null,callback);
    },
    "rename": function(id,data,callback) {
        if(typeof data === 'string' ) data = {name: data};
        return this.db.put(path+id+'/rename',data,callback);
    },
    "getProperties": function(id,callback) {
        return this.db.get(path+id+'/properties',callback);
    },
    "setProperties": function(id,data,callback) {
        return this.db.put(path+id+'/properties',data,callback);
    },
    "revision": function(id,callback) {
        return this.db.get(path+id+'/revision',callback);
    },
    "checksum": function(id,callback) {
        return this.db.get(path+id+'/checksum',callback);
    },
    "rotate": function(id,callback) {
        return this.db.put(path+id+'/rotate', null, null,callback);
    }
};

module.exports = Arango.api('collection',CollectionAPI);

