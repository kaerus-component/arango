var Arango = require('../arango'),
    path = "/_api/cursor/";

function CursorAPI(db) {
    return {
        "get": function(id,callback) {
            return db.put(path+id,{},callback);
        },
        "create": function(data,callback) {
            return db.post(path,data,callback);
        },
        "query": function(data,callback) {
            return db.post("/_api/query",data,callback);
        },
        "explain": function(data,callback) {
            return db.post("/_api/explain",data,callback);
        },
        "delete": function(id,callback) {
            return db.delete(path+id,callback);
        }
    };
}

module.exports = Arango.api('cursor',CursorAPI);
