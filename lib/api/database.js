/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
 
var Arango = require('../arango');

var path = "/_api/database/";

var DatabaseAPI = {
    "create": function(name,users,callback) {
        var options = {name: name};

        if(typeof users === 'function'){
            callback = users;
            users = null;
        }

        if(users) options.users = users;

        return this.db.post(path,options,callback);
    },
    "current": function(callback) {
        return this.db.get(path+'current',callback);   
    },
    "list": function(callback) {
        return this.db.get(path,callback);
    },
    "user": function(callback) {
        return this.db.get(path+'user',callback);
    },
    "delete": function(name,callback) {
        return this.db.delete(path+name,callback);
    }
};

module.exports = Arango.api('database',DatabaseAPI);