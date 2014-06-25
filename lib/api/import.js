var Arango = require('../arango'),
  url = require('../url');

/**
 * The api module to import data into ArangoDB.
 *
 * @class import
 * @module arango
 * @submodule import
 **/
function ImportAPI(db) {
  var path = "/_api/import";

  return {

    /**
     * Imports data from a JSON Object.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Object} documents  - The data to import, can either be one single JSON Object containing a list of
     * documents or a list of JSON Objects seperated ny new lines.
     * @param {Object} [options]    - a JSON Object containting the following optional parameters:
     * @param {Object} [options.createCollection=false] - If true, the collection will be created if it doesn't
     * exist.
     * @param {Object} [options.waitForSync=false] -  Wait until documents have been synced to disk before returning.
     * @param {Object} [options.complete=false] -  If set to true, it will make the whole import fail if any error
     * occurs.
     * @param {Object} [options.details=false] -  If set to true or yes, the result will include an attribute
     * details with details about documents that could not be imported.
     * @param {Function} callback   - The callback function.
     * @method importJSONData
     * @return{Promise}
     */
    "importJSONData": function (collection, documents, options, callback) {
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
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Object} documents  - The data to import, The first line of the request body must contain a
     * JSON-encoded list of attribute names. All following lines in the request body must contain JSON-encoded lists
     * of attribute values. Each line is interpreted as a separate document, and the values specified will be mapped
     * to the list of attribute names specified in the first header line.
     * @param {Object} [options]    - a JSON Object containting the following optional parameters:
     * @param {Object} [options.createCollection=false] - If true, the collection will be created if it doesn't
     * exist.
     * @param {Object} [options.waitForSync=false] -  Wait until documents have been synced to disk before returning.
     * @param {Object} [options.complete=false] -  If set to true, it will make the whole import fail if any error
     * occurs.
     * @param {Object} [options.details=false] -  If set to true or yes, the result will include an attribute
     * details with details about documents that could not be imported.
     * @param {Function} callback   - The callback function.
     * @method importValueList
     * @return{Promise}
     */
    "importValueList": function (collection, documents, options, callback) {
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
