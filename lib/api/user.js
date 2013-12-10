/* 
* Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
*/

var Arango = require('../arango');

var path = "/_api/user/";

var UserAPI = {
    "create": function(username,password,active,extra,callback) {
        if(typeof active !== 'boolean'){
            callback = extra;
            extra = active;
            active = true;
        }

        if(typeof extra === 'function'){
            callback = extra;
            extra = null;
        }

        var data = {username:username,password:password,active:active,extra:extra};

        return this.db.post(path,data,callback);
    },
    "get":function(username,callback) {
        return this.db.get(path+username,callback);
    }, 
    "put": function(username,password,active,extra,callback) {
        if(typeof active !== 'boolean'){
            callback = extra;
            extra = active;
            active = true;
        }

        if(typeof extra === 'function'){
            callback = extra;
            extra = null;
        }

        var data = {password:password,active:active};

        if(extra) data.extra = extra;

        return this.db.put(path+username,data,callback);
    },
    "patch": function(username,password,active,extra,callback) {
        if(typeof active !== 'boolean'){
            callback = extra;
            extra = active;
            active = undefined;
        }

        if(typeof extra === 'function'){
            callback = extra;
            extra = undefined;
        }
        var data = {};

        if(password !== undefined) data.password = password;
        if(active !== undefined) data.active = active;
        if(extra !== undefined) data.extra = extra;

        return this.db.patch(path+username,data,callback);
    },
    "delete": function(username,callback) {
        return this.db.delete(path+username,callback);
    }  
};


module.exports = Arango.api('user',UserAPI);