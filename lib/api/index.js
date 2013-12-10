/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
 
var Arango = require('../arango');

var path = "/_api/index/",
    xpath = "/_api/index?collection=";

  
var IndexAPI = {
    "create": function(collection,data,callback) {
        if(typeof collection !== 'string'){
            callback = data;
            data = collection;
            collection = this.db._collection;
        }
        return this.db.post(xpath+collection,data,callback);
    },
    "get": function(id,callback) {
        return this.db.get(path+id,callback);
    },
    "delete": function(id,callback) {
        return this.db.delete(path+id,callback);
    },
    "list":function(collection,callback) {
        if(typeof collection !== 'string'){
            callback = collection;
            collection = this.db._collection;
        }
        return this.db.get(xpath+collection,callback);
    }    
};


module.exports = Arango.api('index',IndexAPI);
