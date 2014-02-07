var Arango = require('../arango'),
	path = "/_api/transaction/";
/**
 * The api module to execute transactions in ArangoDB.
 *
 * @class transaction
 * @module arango
 * @submodule transaction
 **/
function TransactionAPI(db) {
	return {
        /**
         *
         * @param {Object} collection  - contains the list of collections to be used in the transaction (mandatory).
         * collections must be a JSON array that can have the optional sub-attributes read and write. read and write
         * must each be either lists of collections names or strings with a single collection name.
         * @param {String} action  - the actual transaction operations to be executed, in the form of stringified
         * Javascript code.
         * @param {Object} [options] - a JSON Object contatining optional parameter:
         * @param {Object} [options.params]        - optional arguments passed to action.
         * @param {Object} [options.waitForSync=false]  - if set, will force the transaction to write all data to disk
         * before returning.
         * @param {Object} [options.lockTimeout] - a numeric value that can be used to set a timeout for waiting on
         * collection locks. If not specified, a default value will be used. Setting lockTimeout to 0 will make ArangoDB
         * not time out waiting for a lock.
         * @param {Object} [options.replicate=true] - whether or not to replicate the operations from this transaction.
         * @param {Function} callback   - The callback function.
         * @method submit
         * @return{Promise}
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
