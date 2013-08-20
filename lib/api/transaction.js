/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

function closure(db) {
    "use strict"
     
    var path = "/_api/transaction/";

    var TransactionAPI = {
        "commit": function(collections,action,attributes,callback){
        	var data = {collections:collections,action:action.toString(),attributes:attributes};

        	return db.post(path,data,callback);
        }
    };

    return TransactionAPI;
}

module.exports = closure;
