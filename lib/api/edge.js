/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

function closure(db){
    "use strict"
    
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
                collection = db._collection;
            }
            return db.post(xpath+collection+'&from='+from+'&to='+to,data,callback);
        },
        "get": function(match,id,rev,callback) {   
            if(match !== undefined) {
                rev = JSON.stringify(rev||id);
                if(match) return db.get(path+id,{headers:{"if-match":rev}},callback);
                else return db.get(path+id,{headers:{"if-none-match":rev}},callback);
            }
            return db.get(path+id,callback);
        },
        "put": function(match,id,rev,data,callback) {
            if(match !== undefined) {
                rev = JSON.stringify(rev||id);
                if(match) return db.put(path+id,data,{headers:{"if-match":rev}},callback);
                else return db.put(path+id,data,{headers:{"if-none-match":rev}},callback);
            } 
            return db.put(path+id,data,callback);
        },
        "patch": function(match,id,rev,data,callback) {
            if(match !== undefined) {
                rev = JSON.stringify(rev||id);
                if(match) return db.patch(path+id,data,{headers:{"if-match":rev}},callback);
                else return db.patch(path+id,data,{headers:{"if-none-match":rev}},callback);
            } 
            return db.patch(path+id,data,callback);
        },
        "delete": function(id,callback) {
            return db.delete(path+id,callback);
        },
         "head": function(id,callback) {
            return db.head(path+id,callback);
        },
        "list": function(collection,vertex,direction,callback) {
            if(typeof direction !== 'string'){
                callback = direction;
                direction = vertex;
                vertex = collection;
                collection = db._collection;
                if(typeof direction !== 'string'){
                    callback = direction;
                    direction = "any";
                }
            }

            var options = '?vertex='+vertex+'&direction='+direction;
                
            return db.get(ypath+collection+options,callback);
        }
    };

    return EdgeAPI;
}

module.exports = closure;
