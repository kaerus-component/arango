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
// and also clean up options to be used for url options. 
function ifMatch(id,options,headers) {

    if(options.match !== undefined) {
        options.rev = JSON.stringify(options.rev||id);
        if(options.match) headers = {headers:{"if-match":options.rev}};
        else headers = {headers:{"if-none-match":options.rev}};
        delete options.match;
        delete options.rev;
    }

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

            options = option ? options : {};

            options.collection = options.collection ? options.collection : collection;
               
            return db.post(path+optionsToUrl(options),data,callback);
        },
        "get": function(id,options,callback) {
            var headers = {};

            if(typeof options == 'function'){
                callback = options;
                options = {};
            }

            options = options ? ifMatch(id,options,headers) : {};
            
            return db.get(path+'/'+id+optionsToUrl(options),headers,callback);
        },
        "put": function(id,data,options,callback) {
            var headers = {}; 

            options = options ? ifMatch(id,options,headers) : {};
            
            if(typeof options === 'function'){
                callback = options;
                options = {};
            }
            
            return db.put(path+'/'+id+optionsToUrl(options),data,headers,callback);
        },
        "patch": function(id,data,options,callback) {
            var headers = {};

            if(typeof options === 'function'){
                callback = options;
                options = {};
            }

            options = options ? ifMatch(id,options,headers) : {};
            
            return db.patch(path+'/'+id+optionsToUrl(options),data,headers,callback);
        },
        "delete": function(id,options,callback) {
            var headers = {};

            if(typeof options === 'function'){
                callback = options;
                options = {};
            }

            options = options ? ifMatch(id,options,headers) : {};

            return db.delete(path+'/'+id+optionsToUrl(options),headers,callback);
        },
        "head": function(id,options,callback) {
            var headers = {};

            if(typeof options === 'function'){
                callback = options;
                options = {};
            }

            options = options ? ifMatch(id,options,headers) : {};
            
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

