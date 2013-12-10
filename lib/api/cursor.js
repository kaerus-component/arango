/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
var Arango = require('../arango');

var path = "/_api/cursor/";

var CursorAPI = {
    "get": function(id,callback) {
        return this.db.put(path+id,{},callback);
    },
    "create": function(data,callback) {
        return this.db.post(path,data,callback);
    },
    "query": function(data,callback) {
        return this.db.post("/_api/query",data,callback);
    },
    "explain": function(data,callback) {
        return this.db.post("/_api/explain",data,callback);
    },
    "delete": function(id,callback) {
        return this.db.delete(path+id,callback);
    }
};

module.exports = Arango.api('cursor',CursorAPI);
