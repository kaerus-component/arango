var Arango = require('../arango'),
	path = "/_api/transaction/";

function TransactionAPI(db) {
	return {
        /**
         *
         * @param collection        - contains the list of collections to be used in the transaction (mandatory). collections
         *                            must be a JSON array that can have the optional sub-attributes read and write. read and
         *                            write must each be either lists of collections names or strings with a single
         *                            collection name.
         * @param action            - the actual transaction operations to be executed, in the form of stringified Javascript
         *                            code.
         * @param options           - a JSON Object contatining optional parameter:
         *                                  - params        - optional arguments passed to action.
         *                                  - waitForSync   - an optional boolean flag that, if set, will force the
         *                                                    transaction to write all data to disk before returning.
         *                                  - lockTimeout   - an optional numeric value that can be used to set a timeout for
         *                                                    waiting on collection locks. If not specified, a default value
         *                                                    will be used. Setting lockTimeout to 0 will make ArangoDB not
         *                                                    time out waiting for a lock.
         *                                  - replicate     - whether or not to replicate the operations from this transaction.
         *                                                    If not specified, the default value is true.
         * @param callback
         * @returns {*}
         */
        "submit": function(collections, action, options, callback){

            if(typeof options === 'function'){
                callback = options;
                options = {};
            }
            options.collections = collections;
            options.action = action.toString();

            return db.post(path,options,null,callback);
        }
    }
}


module.exports = Arango.api('transaction',TransactionAPI);
