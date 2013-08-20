/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

function closure(db){
    "use strict"
    
    var params = require('../utils').Params,
        path = "/_api/key/",
        xpath = "/_api/keys/";

    var KeyAPI = {
        "get":function(collection,key,callback) {
            if(typeof key !== 'string'){
                callback = key;
                key = collection;
                collection = db.name;
            }
            return db['get'](path+collection+'/'+key,callback);
        },
        "create": function(key,expire,options,data,callback) {
            var headers = {};

            if(typeof options === 'object' && options.expires) {
                if(typeof options.expires === 'object') expiry = options.expires;
                else expiry = new Date(Date.parse(options.expires,"yyyy-MM-dd HH:MM:SS"));
                headers['x-voc-expires'] = expiry.toISOString();
            } else if(expire) {
                expiry = new Date(Date.parse(expire,"yyyy-MM-dd HH:MM:SS"));
                headers['x-voc-expires'] = expiry.toISOString();  
            } 

            if(options.extended) headers['x-voc-extended'] = JSON.stringify(options.extended);    
            else if(options) headers['x-voc-extended'] = JSON.stringify(options);

            return db.post(path+db.name+'/'+key,data,{headers:headers},callback);
        },
        "put": function(key,expire,options,data,callback) {
            var headers = {};

            if(options.expires) {
                if(typeof options.expires === 'object') expiry = options.expires;
                else expiry = new Date(Date.parse(options.expires,"yyyy-MM-dd HH:MM:SS"));
                headers['x-voc-expires'] = expiry.toISOString();
            } else if(expire) {
                expiry = new Date(Date.parse(expire,"yyyy-MM-dd HH:MM:SS"));
                headers['x-voc-expires'] = expiry.toISOString();  
            } 

            if(options.extended) headers['x-voc-extended'] = JSON.stringify(options.extended);    
            else if(options) headers['x-voc-extended'] = JSON.stringify(options);

            return db.put(path+db.name+'/'+key+'?create=1',data,{headers:headers},callback);
        },
        "delete": function(key,callback) {
            return db.delete(path+db.name+'/'+key,callback);
        },
        "list": function(key,callback) {
            return db.delete(xpath+db.name+'/'+key,callback);
        }
    };

    return KeyAPI;
}

module.exports = closure;
