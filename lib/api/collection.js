var Arango = require('../arango'),
    path = "/_api/collection/";

function CollectionAPI(db){
    return {
        "create": function(collection,options,callback) {
            collection = collection || db._collection;
            options = options || {};
            
            if(typeof options === 'function') {
                callback = options;
                options = {};    
            }

            if(typeof collection === 'object'){
                options = collection;
                collection = db._collection;
            }
            
            if(!options.name) options.name = collection;

            return db.post(path,options,callback);
        },
        "get": function(id,callback) {
            return db.get(path+id,callback);   
        },
        "delete": function(id,callback) {
            return db.delete(path+id,callback);
        },
        "truncate": function(id,callback) {
            return db.put(path+id+'/truncate',null,callback);
        },
        "count": function(id,callback) {
            return db.get(path+id+'/count',callback);
        },
        "figures": function(id,callback) {
            return db.get(path+id+'/figures',callback);
        },
        "list": function(callback) {
            return db.get(path,callback);
        },
        "load": function(id,callback) {
            return db.put(path+id+'/load',null,callback);
        },
        "unload": function(id,callback) {
            return db.put(path+id+'/unload',null,callback);
        },
        "rename": function(id,data,callback) {
            if(typeof data === 'string') data = {name: data};

            return db.put(path+id+'/rename',data,callback);
        },
        "getProperties": function(id,callback) {
            return db.get(path+id+'/properties',callback);
        },
        "setProperties": function(id,data,callback) {
            return db.put(path+id+'/properties',data,callback);
        },
        "revision": function(id,callback) {
            return db.get(path+id+'/revision',callback);
        }
    };
}

module.exports = Arango.api('collection',CollectionAPI);

