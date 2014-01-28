/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
var Arango = require('../arango');

var path = "/_api/edge",
    ypath = "/_api/edges/";

function optionsToUrl(o){
    if(typeof o !== 'object') return '';

    return Object.keys(o).reduce(function(a,b,c){
        c = b + '=' + o[b];
        return !a ? '?' + c : a + '&' + c;
    },'');
}

var EdgeAPI = {
    /**
     * creates an edge in a given collection.
     *
     * @param collection - the collection
     * @param data - the data of the edge as JSON object
     * @param from - The document handle of the start point must be passed in from handle.
     * @param to - The document handle of the end point must be passed in from handle.
     * @param options - an object with the following optional parameters:
     *                  - createCollection : - Boolean, if set the collection given in "collection" is created as well.
     *                  - "waitForSync": -  Boolean, wait until document has been synced to disk.
     * @param callback
     * @returns {*}
     */
    "create": function(collection,from,to,data,options,callback) {
        if(typeof options === 'function'){
            callback = options;
        }
        if(!options) options = {};
        options.collection = collection;
        options.from = from ;
        options.to = to;
        return this.db.post(path+optionsToUrl(options),data,callback);
    },
    /**
     * retrieves an edge from the database
     *
     * @param id -- the edge-handle
     * @param options  - an object with 2 possible attributes:
     *                  - "match": boolean defining if the given revision should match the found document or not.
     *                  - "rev":   String the revision, used by the "match" attribute.
     * @param callback
     * @returns {*}
     */
    "get": function(id, options ,callback) {
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
    /**
     * replaces an edge with the data given in data.
     *
     * @param id -- the edge-handle
     * @param data -- a JSON Object containing the new attributes for the edge handle
     * @param options  - an object with 4 possible attributes:
     *                  - "match": - boolean defining if the given revision should match the found document or not.
     *                  - "rev":  - String the revision, used by the "match" attribute.
     *                  - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
     *                  - "waitForSync": -  Boolean, wait until document has been synced to disk.
     * @param callback
     * @returns {*}
     */
    "put": function(id,data,options,callback) {
        var headers;
        options = options ? options : {};

        if(typeof options === 'function'){
            callback = options;
            options = {};
        }
        if (options.forceUpdate !== undefined) {
            options.policy = (options.forceUpdate === true) ? "last" : "error";
            delete options.forceUpdate;
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
    /**
     * patches an edge with the data given in data
     *
     * @param id -- the edge-handle
     * @param data -- a JSON Object containing the new attributes for the edge handle
     * @param options  - an object with 4 possible attributes:
     *                  - "match": - boolean defining if the given revision should match the found document or not.
     *                  - "rev":  - String the revision, used by the "match" attribute.
     *                  - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
     *                  - "waitForSync": -  Boolean, wait until document has been synced to disk.
     *                  - "keepNull": -  Boolean, default is true, if set to false a patch request will delete every null value attributes.
     * @param callback
     * @returns {*}
     */
    "patch": function(id,data,options,callback) {
        var headers;
        options = options ? options : {};

        if(typeof options === 'function'){
            callback = options;
            options = {};
        }
        if (options.forceUpdate !== undefined) {
            options.policy = (options.forceUpdate === true) ? "last" : "error";
            delete options.forceUpdate;
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
    /**
     * Deletes an edge
     *
     * @param id -- the edge-handle
     * @param data -- a JSON Object containing the new attributes for the document handle
     * @param options  - an object with 4 possible attributes:
     *                  - "match": - boolean defining if the given revision should match the found document or not.
     *                  - "rev":  - String the revision, used by the "match" attribute.
     *                  - "forceUpdate": - Boolean, if set a deletion is performed even when the given revision does not match.
     *                  - "waitForSync": -  Boolean, wait until document has been synced to disk.
     * @param callback
     * @returns {*}
     */
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
    /**
     * same as get but only returns the header
     *
     * @param id -- the edge-handle
     * @param options  - an object with 2 possible attributes:
     *                  - "match" boolean defining if the given revision should match the found document or not.
     *                  - "rev"   String the revision, used by the "match" attribute.
     * @param callback
     * @returns {*}
     */
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
    /**
     * Returns the list of edges starting or ending in the vertex identified by vertex-handle.
     * @param collection   the edge collection
     * @param vertex       The id of the start vertex.
     * @param direction    Selects in or out direction for edges. If not set, any edges are returned.
     * @param callback
     * @returns {*}
     */

    "list": function(collection,vertex,direction,callback) {
        if(typeof direction === 'function'){
            callback = direction;
            direction = "any";
        }

        var options = '?vertex='+vertex+'&direction='+direction;
        return this.db.get(ypath+collection+options,callback);
    }
};


module.exports = Arango.api('edge',EdgeAPI);
