/* 
* Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
*/

var Arango = require('../arango');

var path = "/_api/user/";

var UserAPI = {
    /**
     *
     * @param username  - the username.
     * @param password  - the password.
     * @param active    - boolean is the user is active.
     * @param extra     - additional userdata as JSONObject
     * @param callback
     * @returns {*}
     */
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
    /**
     *
     * @param username  - the user to request data for.
     * @param callback
     * @returns {*}
     */
    "get":function(username,callback) {
        return this.db.get(path+username,callback);
    },
    /**
     * Replaces entry for user
     * @param username  - the user to be replaced
     * @param password  - new password
     * @param active    - boolean is the user is active.
     * @param extra     - additional userdata as JSONObject
     * @param callback
     * @returns {*}
     */
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
    /**
     * updates entry for user
     * @param username  - the user to be replaced
     * @param password  - new password
     * @param active    - boolean is the user is active.
     * @param extra     - additional userdata as JSONObject
     * @param callback
     * @returns {*}
     */
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
    /**
     * deletes user
     * @param username  - the user to be deleted
     * @param callback
     * @returns {*}
     */
    "delete": function(username,callback) {
        return this.db.delete(path+username,callback);
    }  
};


module.exports = Arango.api('user',UserAPI);