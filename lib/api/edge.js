/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
var Arango = require('../arango');

var path = "/_api/edge/",
    xpath = "/_api/edge?collection=",
    ypath = "/_api/edges/";

var EdgeAPI = {
    "create": function(collection,from,to,data,callback) {
        if(typeof to !== 'string'){
            callback = data;
            data = to;
            to = from;
            from = collection;
            collection = this.db._collection;
        }
        return this.db.post(xpath+collection+'&from='+from+'&to='+to,data,callback);
    },
    "get": function(match,id,rev,callback) {   
        if(match !== undefined) {
            rev = JSON.stringify(rev||id);
            if(match) return this.db.get(path+id,{headers:{"if-match":rev}},callback);
            else return this.db.get(path+id,{headers:{"if-none-match":rev}},callback);
        }
        return this.db.get(path+id,callback);
    },
    "put": function(match,id,rev,data,callback) {
        if(match !== undefined) {
            rev = JSON.stringify(rev||id);
            if(match) return this.db.put(path+id,data,{headers:{"if-match":rev}},callback);
            else return this.db.put(path+id,data,{headers:{"if-none-match":rev}},callback);
        } 
        return this.db.put(path+id,data,callback);
    },
    "patch": function(match,id,rev,data,callback) {
        if(match !== undefined) {
            rev = JSON.stringify(rev||id);
            if(match) return this.db.patch(path+id,data,{headers:{"if-match":rev}},callback);
            else return this.db.patch(path+id,data,{headers:{"if-none-match":rev}},callback);
        } 
        return this.db.patch(path+id,data,callback);
    },
    "delete": function(id,callback) {
        return this.db.delete(path+id,callback);
    },
     "head": function(id,callback) {
        return this.db.head(path+id,callback);
    },
    "list": function(collection,vertex,direction,callback) {
        if(typeof direction !== 'string'){
            callback = direction;
            direction = vertex;
            vertex = collection;
            collection = this.db._collection;
            if(typeof direction !== 'string'){
                callback = direction;
                direction = "any";
            }
        }

        var options = '?vertex='+vertex+'&direction='+direction;
            
        return this.db.get(ypath+collection+options,callback);
    }
};


module.exports = Arango.api('edge',EdgeAPI);
