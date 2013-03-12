/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

function closure(db){
    "use strict"
    
    var path = "/_api/simple/";

    function applyOptions(o,data,attributes) {
        if(typeof attributes === 'object') {
            Object.keys(attributes).forEach(function(option){
                switch(option){
                    case 'from': data.left = attributes[option];
                        data.closed = true;
                        break;
                    case 'to': data.right = attributes[option];
                        data.closed = true;
                        break;
                    default:
                        data[option] = attributes[option];
                        break;          
                }   
                /* apply skip/limit preferences */
                if(o._skip && !data.skip) data.skip = o._skip;
                if(o._limit && !data.limit) data.limit = o._limit;
            });
        }

        return data;
    }

    var SimpleAPI = {
        "list": function(attributes,callback) {
            var data = {collection: db.name};
            return db['put'](path+'all',applyOptions(this,data,attributes),callback);
        },
        "example": function(example,attributes,callback) {
            var data = {collection: db.name, example:example};
            return db['put'](path+'by-example',applyOptions(this,data,attributes),callback);
        },
        "first": function(example,callback) {
            var data = {collection: db.name, example:example};
            return db['put'](path+'first-example',data,callback);    
        },
        "range": function(attributes,callback) {
            var data = {collection: db.name};
            return db['put'](path+'range',applyOptions(this,data,attributes),callback);
        },
        "near": function(attributes,callback) {
            var data = {collection: db.name};
            return db['put'](path+'near',applyOptions(this,data,attributes),callback);
        },
        "within": function(attributes,callback) {
            var data = {collection: db.name};
            return db['put'](path+'within',applyOptions(this,data,attributes),callback);
        },
        "skip": function(val) {
            this._skip = val;
            return this;
        },
        "limit": function(val) {
            this._limit = val;
            return this;
        }
    };

    return SimpleAPI;
}

module.exports = closure;
