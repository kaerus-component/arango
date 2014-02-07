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

/**
 * The api module to perform document related operations on ArangoDB.
 *
 * @class document
 * @module arango
 * @submodule document
 **/

function DocumentAPI(db) {
    return {
        /**
         * creates a a document in a given collection.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Object} data - the data of the document as JSON object
         * @param {Object} [options] - an object with the following optional parameters:
         * @param {Boolean} [options.createCollection=false] - if set the collection given in "collection" is created as
         * well.
         * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
         * @param {Function} callback   - The callback function.
         * @method create
         * @return{Promise}
         */
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

            options.collection = collection;

            return db.post(path+optionsToUrl(options),data,callback);
        },
        /**
         * retrieves a document from the database
         *
         * @param {String} id - the document-handle
         * @param {Object} [options] - an object with the following optional parameters:
         * @param {Boolean} [options.match] - boolean defining if the given revision should match the found document or
         * not.
         * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
         * @param {Function} callback   - The callback function.
         * @method get
         * @return{Promise}
         */
        "get": function(id,options,callback) {
            var headers;

            if(typeof options == 'function') {
                callback = options;
                options = {};
            } else if(options) {
                headers = ifMatch(id,options);
            }
            return db.get(path+'/'+id+optionsToUrl(options),headers,callback);
        },
        /**
         * replaces a document with the data given in data.
         *
         * @param {String} id - the edge-handle
         * @param {Object} data - the data of the edge as JSON object
         * @param {Object} [options] - an object with the following optional parameters:
         * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
         * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
         * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
         * does not match.
         * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
         * @param {Function} callback   - The callback function.
         * @method put
         * @return{Promise}
         */
        "put": function(id,data,options,callback) {
            var headers;
            options = options ? options : {};

            if(typeof options == 'function') {
                callback = options;
                options = null;
            } else if(options) {
                headers = ifMatch(id,options);
            }
            if (options.forceUpdate !== undefined) {
                options.policy = (options.forceUpdate === true) ? "last" : "error";
                delete options.forceUpdate;
            }

            return db.put(path+'/'+id+optionsToUrl(options),data,headers,callback);
        },
        /**
         * patches a document with the data given in data
         *
         * @param {String} id - the edge-handle
         * @param {Object} data - the data of the edge as JSON object
         * @param {Object} [options] - an object with the following optional parameters:
         * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
         * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
         * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
         * does not match.
         * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
         * @param {Boolean} [options.keepNull=true] -  if set to false a patch request will delete every null value
         * attributes.
         * @param {Function} callback   - The callback function.
         * @method patch
         * @return{Promise}
         */
        "patch": function(id,data,options,callback) {
            var headers;
            if(typeof options == 'function') {
                callback = options;
                options = null;
            } else if(options) {
                headers = ifMatch(id,options);
            }
            options = options ? options : {};
            if (options.forceUpdate !== undefined) {
                options.policy = (options.forceUpdate === true) ? "last" : "error";
                delete options.forceUpdate;
            }
            return db.patch(path+'/'+id+optionsToUrl(options),data,headers,callback);
        },
        /**
         * Deletes a document
         *
         * @param {String} id - the document-handle
         * @param {Object} [options] - an object with the following optional parameters:
         * @param {Boolean} [options.match] - boolean defining if the given revision should match the found document or
         * not.
         * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
         * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
         * does not match.
         * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.

         * @param {Function} callback   - The callback function.
         * @method delete
         * @return{Promise}
         */
        "delete": function(id,options,callback) {
            var headers;

            if(typeof options == 'function') {
                callback = options;
                options = null;
            } else if(options) {
                headers = ifMatch(id,options);
            }
            options = options ? options : {};
            if (options.forceUpdate !== undefined) {
                options.policy = (options.forceUpdate === true) ? "last" : "error";
                delete options.forceUpdate;
            }
            return db.delete(path+'/'+id+optionsToUrl(options),headers,callback);
        },
        /**
         * same as get but only returns the header.
         *
         * @param {String} id - the edge-handle
         * @param {Object} [options] - an object with the following optional parameters:
         * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
         * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
         * @param {Function} callback   - The callback function.
         * @method head
         * @return{Promise}
         */
        "head": function(id,options,callback) {
            var headers;

            if(typeof options == 'function') {
                callback = options;
                options = null;
            } else if(options) {
                headers = ifMatch(id,options);
            }
            options = options ? options : {};
            if (options.forceUpdate !== undefined) {
                options.policy = (options.forceUpdate === true) ? "last" : "error";
                delete options.forceUpdate;
            }
            return db.head(path+'/'+id+optionsToUrl(options),headers,callback);
        },
        /**
         * returns all documents in a collection
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Function} callback   - The callback function.
         * @method list
         * @return{Promise}
         */
        "list": function(collection,callback) {
            if(typeof collection == 'function') {
                callback = collection;
                collection = db,_collection;
            }
            return db.get(path+"?collection="+collection,callback);
        }
    }
}

module.exports = Arango.api('document',DocumentAPI);

