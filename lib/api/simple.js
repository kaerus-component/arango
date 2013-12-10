/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
var Arango = require('../arango');
    
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
    "list": function(collection,attributes,callback) {
        if(typeof collection !== 'string'){
            callback = attributes;
            attributes = collection;
            collection = this.db._collection;
        }
        var data = {collection:collection};
        return this.db.put(path+'all',applyOptions(this,data,attributes),callback);
    },
    "any": function(collection,attributes,callback) {
        if(typeof collection !== 'string'){
            callback = attributes;
            attributes = collection;
            collection = this.db._collection;
        }
        var data = {collection:collection};
        return this.db.put(path+'any',applyOptions(this,data,attributes),callback);
    },
    "example": function(collection,example,attributes,callback) {
        if(typeof collection !== 'string'){
            callback = attributes;
            attributes = example;
            example = collection;
            collection = this.db._collection;
        }
        var data = {collection:collection, example:example};
        return this.db.put(path+'by-example',applyOptions(this,data,attributes),callback);
    },
    "removeByExample": function(collection,example,attributes,callback){
        if(typeof collection !== 'string'){
            callback = attributes;
            attributes = example;
            example = collection;
            collection = this.db._collection;
        }
        var data = {collection:collection, example:example};
        return this.db.put(path+'remove-by-example',applyOptions(this,data,attributes),callback);
    },
    "replaceByExample": function(collection,example,object,attributes,callback){
        if(typeof collection !== 'string'){
            callback = attributes;
            attributes = object;
            object = example;
            example = collection;
            collection = this.db._collection;
        }
        var data = {collection:collection,example:example,newValue:object};
        return this.db.put(path+'replace-by-example',applyOptions(this,data,attributes),callback);
    },
    "updateByExample": function(collection,example,object,attributes,callback){
        if(typeof collection !== 'string'){
            callback = attributes;
            attributes = object;
            object = example;
            example = collection;
            collection = this.db._collection;
        }
        var data = {collection:collection,example:example,newValue:object};
        return this.db.put(path+'update-by-example',applyOptions(this,data,attributes),callback);
    },
    "first": function(collection,example,attributes,callback) {
        if(typeof collection !== 'string'){
            callback = attributes;
            attributes = example;
            example = collection;
            collection = this.db._collection;
        }

        if(typeof attributes === 'function'){
            callback = attributes;
        }

        var data = {collection:collection, example:example};
        return this.db.put(path+'first-example',applyOptions(this,data,attributes),callback);    
    },
    "last": function(collection,example,attributes,callback) {
        if(typeof collection !== 'string'){
            callback = attributes;
            attributes = example;
            example = collection;
            collection = this.db._collection;
        }

        if(typeof attributes === 'function'){
            callback = attributes;
        }

        var data = {collection:collection, example:example};
        return this.db.put(path+'last-example',applyOptions(this,data,attributes),callback);    
    },
    "range": function(collection,attributes,callback) {
        if(typeof collection !== 'string'){
            callback = attributes;
            attributes = collection;
            collection = this.db._collection;
        }
        var data = {collection:collection};
        return this.db.put(path+'range',applyOptions(this,data,attributes),callback);
    },
    "near": function(collection,attributes,callback) {
        if(typeof collection !== 'string'){
            callback = attributes;
            attributes = collection;
            collection = this.db._collection;
        }
        var data = {collection:collection};
        return this.db.put(path+'near',applyOptions(this,data,attributes),callback);
    },
    "within": function(collection,attributes,callback) {
        if(typeof collection !== 'string'){
            callback = attributes;
            attributes = collection;
            collection = this.db._collection;
        }
        var data = {collection: collection};
        return this.db.put(path+'within',applyOptions(this,data,attributes),callback);
    },
    "fulltext": function(collection,attribute,query,attributes,callback){
        if(typeof query !== 'string'){
            callback = attributes;
            attributes = query;
            query = attribute;
            attribute = collection;
            collection = this.db._collection;
        }
        var data = {collection:collection,attribute:attribute,query:query};
        return this.db.put(path+'fulltext',applyOptions(this,data,attributes),callback);
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

module.exports = Arango.api('simple',SimpleAPI);
