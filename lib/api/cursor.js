/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

function closure(db) {
    "use strict"
     
    var path = "/_api/cursor/";

    var CursorAPI = {
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

    return CursorAPI;
}

module.exports = closure;
