/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
 
var extend = require('../utils').extend;

function closure(db) {
    "use strict"

    var path = "/_api/database/";

    var DatabaseAPI = {
        "create": function(name,users,callback) {
            var options = {name: name};

            if(typeof users === 'function'){
                callback = users;
                users = null;
            }

            if(users) options.users = users;

            return db.post(path,options,callback);
        },
        "current": function(callback) {
            return db.get(path+'current',callback);   
        },
        "list": function(callback) {
            return db.get(path,callback);
        },
        "user": function(callback) {
            return db.get(path+'user',callback);
        },
        "delete": function(name,callback) {
            return db.delete(path+name,callback);
        }
    };

    return DatabaseAPI;
}

module.exports = closure;