/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
var Arango = require('../arango');

var path = "/_api/collection/";

var CollectionAPI = {
    "create": function(collection,options,callback) {
        collection = collection || this.db._collection;
        options = options || {};
        
        if(typeof options === 'function') {
            callback = options;
            options = {};    
        }

        if(typeof collection === 'object'){
            options = collection;
            collection = this.db._collection;
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

