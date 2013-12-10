/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
var Arango = require('../arango');
   
var path = "/_api/document";

function optionsToUrl(o){
    if(typeof o !== 'object') return '';

    return Object.keys(o).reduce(function(a,b,c){
            c = b + '=' + o[b];
            return !a ? '?' + c : a + '&' + c;
        },'');
}

var DocumentAPI = {
    "create": function(collection,data,options,callback) {
        if(typeof collection !=='string'){
            callback = options;
            options = data;
            data = collection;
            collection = this.db._collection;
        }  

        if(typeof options === 'function'){
            callback = options;
            options = null;
        }

        if(!options) options = {};

        options.collection = options.collection ? options.collection : collection;
           
        return this.db.post(path+optionsToUrl(options),data,callback);
    },
    "get": function(id,options,callback) {
        var headers;

        options = options ? options : {};

        if(typeof options == 'function'){
            callback = options;
            options = {};
        }

        if(options.match !== undefined) {
            options.rev = JSON.stringify(options.rev||id);
            if(options.match) headers = {"if-match":options.rev};
            else headers = {"if-none-match":options.rev};
            delete options.match;
            delete options.rev;
        }
        if(!headers) return this.db.get(path+'/'+id+optionsToUrl(options),callback);
        else return this.db.get(path+'/'+id+optionsToUrl(options),{headers:headers},callback);
    },
    "put": function(id,data,options,callback) {
        var headers; 
        options = options ? options : {};
        
        if(typeof options === 'function'){
            callback = options;
            options = {};
        }

        /* use headers for rev matching */
        if(options.match !== undefined) {
            options.rev = JSON.stringify(options.rev||id);
            if(options.match) headers = {"if-match":options.rev};
            else headers = {"if-none-match":options.rev};
            delete options.match;
            delete options.rev;
        }
        if(!headers) return this.db.put(path+'/'+id+optionsToUrl(options),data,callback);
        else return this.db.put(path+'/'+id+optionsToUrl(options),data,{headers:headers},callback);
    },
    "patch": function(id,data,options,callback) {
        var headers;
        options = options ? options : {};

        if(typeof options === 'function'){
            callback = options;
            options = {};
        }

        if(options.match !== undefined) {
            options.rev = JSON.stringify(options.rev||id);
            if(options.match) headers = {"if-match":options.rev};
            else headers = {"if-none-match":options.rev};
            delete options.match;
            delete options.rev;
        }
        if(!headers) return this.db.patch(path+'/'+id+optionsToUrl(options),data,callback);
        else return this.db.patch(path+'/'+id+optionsToUrl(options),data,{headers:headers},callback);
    },
    "delete": function(id,options,callback) {
        var headers;
        options = options ? options : {};

        if(typeof options === 'function'){
            callback = options;
            options = {};
        }

        if(options.match !== undefined) {
            options.rev = JSON.stringify(options.rev||id);
            if(options.match) headers = {"if-match":options.rev};
            else headers = {"if-none-match":options.rev};
            delete options.match;
            delete options.rev;
        }
        if(!headers) return this.db.delete(path+'/'+id+optionsToUrl(options),callback);
        else return this.db.delete(path+'/'+id+optionsToUrl(options),{headers:headers},callback);
    },
    "head": function(id,options,callback) {
        var headers;
        options = options ? options : {};

        if(typeof options === 'function'){
            callback = options;
            options = {};
        }

        if(options.match !== undefined) {
            options.rev = JSON.stringify(options.rev||id);
            if(options.match) headers = {"if-match":options.rev};
            else headers = {"if-none-match":options.rev};
            delete options.match;
            delete options.rev;
        }
        if(!headers) return this.db.head(path+'/'+id+optionsToUrl(options),callback);
        else return this.db.head(path+'/'+id+optionsToUrl(options),{headers:headers},callback);
    },    
    "list": function(collection,callback) {
        if(typeof collection !== 'string'){
            callback = collection;
            collection = this.db._collection;
        }
        return this.db.get(path+"?collection="+collection,callback);
    }     
};

module.exports = Arango.api('document',DocumentAPI);

