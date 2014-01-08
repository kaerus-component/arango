var Arango = require('../arango'),
	path = "/_api/transaction/";

function TransactionAPI(db) {
	return {
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
}


module.exports = Arango.api('transaction',TransactionAPI);
