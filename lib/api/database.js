/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
 
function closure(db) {
    "use strict"

    var path = "/_api/database/";

    var DatabaseAPI = {
        "create": function(name,callback) {
            var options = {name: name};

            return db.post(path,options,callback);
        },
        "current": function(callback) {
            return db.get(path+'current',callback);   
        },
        "list": function(callback) {
            return db.get(path,callback);
        },
        "delete": function(name,callback) {
            return db.delete(path+name,callback);
        }
    };

    return DatabaseAPI;
}

module.exports = closure;