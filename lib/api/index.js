/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

function closure(db){
    "use strict"
    
    var path = "/_api/index/",
        xpath = "/_api/index?collection=";

      
    var IndexAPI = {
        "create": function(collection,data,callback) {
            if(typeof collection !== 'string'){
                callback = data;
                data = collection;
                collection = db._collection;
            }
            return db.post(xpath+collection,data,callback);
        },
        "get": function(id,callback) {
            return db.get(path+id,callback);
        },
        "delete": function(id,callback) {
            return db.delete(path+id,callback);
        },
        "list":function(collection,callback) {
            if(typeof collection !== 'string'){
                callback = collection;
                collection = db._collection;
            }
            return db.get(xpath+collection,callback);
        }    
    };

    return IndexAPI;
}

module.exports = closure;
