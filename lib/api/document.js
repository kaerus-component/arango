var Arango = require('../arango'),
    path = "/_api/document";


function optionsToUrl(o){
    if(typeof o !== 'object') return '';

    return Object.keys(o).reduce(function(a,b,c){
            c = b + '=' + o[b];
            return !a ? '?' + c : a + '&' + c;
        },'');
}

// set if-match / if-none-match headers when options.match
function ifMatch(id,options) {
    var headers, rev;

    if(options.match !== undefined) {
        rev = JSON.stringify(options.rev||id);

        if(options.match) headers = {headers:{"if-match":rev}};
        else headers = {headers:{"if-none-match":rev}};
        // these options are not needed anymore
        delete options.match;
        delete options.rev;
    }

    return headers;
}

function DocumentAPI(db) {
    return {
        "create": function(collection,data,options,callback) {
            
            if(typeof collection !=='string'){
                callback = options;
                options = data;
                data = collection;
                collection = db._collection;
            }  

            if(typeof options === 'function'){
                callback = options;
                options = null;
            } 

            if(!options) options = {};

            options.collection = options.collection ? options.collection : collection;
               
            return db.post(path+optionsToUrl(options),data,callback);
        },
        "get": function(id,options,callback) {
            var headers;

            if(typeof options == 'function') {
                callback = options;
                options = null;
            } else if(options) {
                headers = ifMatch(id,options);
            }
            
            return db.get(path+'/'+id+optionsToUrl(options),headers,callback);
        },
        "put": function(id,data,options,callback) {
            var headers; 

            if(typeof options === 'function'){
                callback = options;
                options = null;
            } else if(options) {
                headers = ifMatch(id,options);
            }
            
            return db.put(path+'/'+id+optionsToUrl(options),data,headers,callback);
        },
        "patch": function(id,data,options,callback) {
            var headers;

            if(typeof options === 'function'){
                callback = options;
                options = null;
            } else if(options) {
                headers = ifMatch(id,options);
            }

            return db.patch(path+'/'+id+optionsToUrl(options),data,headers,callback);
        },
        "delete": function(id,options,callback) {
            var headers = {};

            if(typeof options === 'function'){
                callback = options;
                options = null;
            } else if(options) {
                headers = ifMatch(id,options);
            }

            return db.delete(path+'/'+id+optionsToUrl(options),headers,callback);
        },
        "head": function(id,options,callback) {
            var headers = {};

            if(typeof options === 'function'){
                callback = options;
                options = {};
            } else if(options) {
                headers = ifMatch(id,options);
            }
 
            return db.head(path+'/'+id+optionsToUrl(options),headers,callback);
        },    
        "list": function(collection,callback) {

            if(typeof collection !== 'string'){
                callback = collection;
                collection = db._collection;
            }

            return db.get(path+"?collection="+collection,callback);
        }
    }; 
}

module.exports = Arango.api('document',DocumentAPI);

