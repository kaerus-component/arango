var Arango = require('../arango'),
    url = require('../url');


function ImportAPI(db) {
    var path = "/_api/import";

    return {

        /**
         *
         * @param collection - The collection name
         * @param documents  - The data to import, can either be one single JSON Object containing a list of documents,
         *                     or a list of JSON Objects seperated ny new lines.
         * @param options    - a JSON Object containting the following optional parameters:
         *                      - createCollection : If true, the collection will be created if it doesn't exist.
         *                      - waitForSync: Wait until documents have been synced to disk before returning.
         *                      - complete : If set to true, it will make the whole import fail if any error occurs.
         *                      - details : If set to true or yes, the result will include an attribute details with
         *                                  details about documents that could not be imported.
         * @param callback
         * @returns {*}
         */
        "importJSONData": function(collection, documents, options, callback) {
            if (typeof documents === "function") {
                callback = documents;
                options = {};
                documents = collection;
                collection = db._collection;
            }

            if (typeof options === 'function') {
                callback = options;
                if (typeof collection !== "string") {
                    options = documents;
                    documents = collection;
                    collection = db._collection;

                } else {
                    options = {};
                }
            }
            options.type = "auto";
            options.collection = collection;
            return db.post(path + url.options(options), documents, callback);
        },
        /**
         *
         * @param collection - The collection name
         * @param documents  - The data to import, The first line of the request body must contain a JSON-encoded list of
         *                      attribute names. All following lines in the request body must contain JSON-encoded lists of
         *                      attribute values. Each line is interpreted as a separate document, and the values specified
         *                      will be mapped to the list of attribute names specified in the first header line.
         * @param options    - a JSON Object containting the following optional parameters:
         *                      - createCollection : If true, the collection will be created if it doesn't exist.
         *                      - waitForSync: Wait until documents have been synced to disk before returning.
         *                      - complete : If set to true, it will make the whole import fail if any error occurs.
         *                      - details : If set to true or yes, the result will include an attribute details with
         *                                  details about documents that could not be imported.
         * @param callback
         * @returns {*}
         */
        "importValueList": function(collection, documents, options, callback) {
            if (typeof documents === "function") {
                callback = documents;
                options = {};
                documents = collection;
                collection = db._collection;
            }

            if (typeof options === 'function') {
                callback = options;
                if (typeof documents !== "string") {
                    options = documents;
                    documents = collection;
                    collection = db._collection;

                } else {
                    options = {};
                }
            }

            options.collection = collection;

            return db.post(path + url.options(options), documents, {
                "NoStringify": true
            }, callback);
        }
    }
}


module.exports = Arango.api('import', ImportAPI);
