/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

function closure(db){
    "use strict"
    
    var params = require('../utils').Params,
        path = "/_api/edge/",
        xpath = "/_api/edge?collection=",
        ypath = "/_api/edges/";

    var EdgeAPI = {
        "create":params([{collection:"string"},{from:"string"},{to:"string"},{data:"object"},{callback:"function"}],
            function(collection,from,to,data,callback) {
                if(!to){
                    to = from;
                    from = collection;
                    collection = db.name;
                }
                return db.post(xpath+collection+'&from='+from+'&to='+to,data,callback);
            }
        ),
        "get":params([{match:"boolean"},{id:"string"},{rev:"string"},{callback:"function"}],
            function(match,id,rev,callback) {   
                if(match !== undefined) {
                    rev = JSON.stringify(rev||id);
                    if(match) return db.get(path+id,{headers:{"if-match":rev}},callback);
                    else return db.get(path+id,{headers:{"if-none-match":rev}},callback);
                }
                return db.get(path+id,callback);
            }
        ),
        "put":params([{match:"boolean"},{id:"string"},{rev:"string"},{data:"object"},{callback:"function"}],
            function(match,id,rev,data,callback) {
                if(match !== undefined) {
                    rev = JSON.stringify(rev||id);
                    if(match) return db.put(path+id,data,{headers:{"if-match":rev}},callback);
                    else return db.put(path+id,data,{headers:{"if-none-match":rev}},callback);
                } 
                return db.put(path+id,data,callback);
            }
        ),
        "patch":params([{match:"boolean"},{id:"string"},{rev:"string"},{data:"object"},{callback:"function"}],
            function(match,id,rev,data,callback) {
                if(match !== undefined) {
                    rev = JSON.stringify(rev||id);
                    if(match) return db.patch(path+id,data,{headers:{"if-match":rev}},callback);
                    else return db.patch(path+id,data,{headers:{"if-none-match":rev}},callback);
                } 
                return db.patch(path+id,data,callback);
            }
        ),
        "delete": function(id,callback) {
            return db.delete(path+id,callback);
        },
         "head": function(id,callback) {
            return db.head(path+id,callback);
        },
        "list":params([{vertex:"string"},{direction:"string"},{callback:"function"}],
            function(vertex,direction,callback) {
                direction = direction ? direction : "any";
                var options = '?vertex='+vertex+'&direction='+direction;
                
                return db.get(ypath+db.name+options,callback);
            }
        )    
    };

    return EdgeAPI;
}

module.exports = closure;
