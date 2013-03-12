/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

function closure(db){
    "use strict"
    
    var path = "/_api/index/",
        xpath = "/_api/index?collection=";

      
    var IndexAPI = {
        "create": function(data,callback) {
            return db['post'](xpath+db.name,data,callback);
        },
        "get": function(id,callback) {
            return db['get'](path+id,callback);
        },
        "delete": function(id,callback) {
            return db['delete'](path+id,callback);
        },
        "list":function(callback) {
            return db['get'](xpath+db.name,callback);
        }    
    };

    return IndexAPI;
}

module.exports = closure;
