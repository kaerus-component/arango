/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

function closure(db) {
    "use strict"
     
    var path = "/_api/transaction/";

    var TransactionAPI = {
        "submit": function(collections,params,action,options,callback){

	        if(typeof params === 'function'){
	        	callback = options;
	        	options = action;
	        	action = params;
	        	params = null;
	        }
	        
	        if(typeof options === 'function'){
	        	callback = options;
	        	options = null;
	        }

	        var data = {collections:collections,action:action.toString()};

	        if(params) data.params = params;
	        
        	return db.post(path,data,options,callback);
    	}
    };

    return TransactionAPI;
}

module.exports = closure;
