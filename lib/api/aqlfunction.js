/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

var Arango = require('../arango');

var path = "/_api/aqlfunction/";

function AqlfunctionAPI(db) {
    return {
        /**
         * String name  - name of the function
         * String code - the function
         * Boolean isDeterministic  -  optional boolean value to indicate that the function results are fully deterministic.
         */
        "create": function(name, code, isDeterministic ,callback){
            var options = {"name" : name, "code" : code};
            if (isDeterministic !== null) {
                options.isDeterministic = isDeterministic;
            }
            return db.post(path, options ,callback);
        },
        /**
         * String name  - name of the function
         * Boolean group  - if set to true all functions is the namespace set in name will be deleted
         */
        "delete": function(name, group ,callback){
            return db.delete(path+encodeURIComponent(name)+"/?group="+group, callback);
        },
        /**
         * String namespace  - If set all functions in this namespace will be returned
         */
        "get": function(namespace ,callback){
            params="";
            if (namespace) {
                params += '?namespace='+encodeURIComponent(namespace);
            }
            return db.get(path+params, callback);
        }
    }
};

module.exports = Arango.api('aqlfunction',AqlfunctionAPI);

