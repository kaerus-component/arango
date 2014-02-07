var Arango = require('../arango');


/**
 * The api module to create indices for collections in ArangoDB.
 *
 * @class index
 * @module arango
 * @submodule index
 **/
function IndexAPI(db) {
    var path = "/_api/index/",
        xpath = "/_api/index?collection=";
        
    return {
        /**
         * Creates a Cap Index for the collection
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Object} data       - a JSON Object containing at least one attributes:
         * @param {Number} [data.size] -  The maximal number of documents for the collection.
         * @param {Number} [data.byteSize] - The maximal size of the active document data in the collection.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method createCapIndex
         */
        "createCapIndex": function(collection, data, callback) {
            if (typeof data === 'function') {
                callback = data;
                if (typeof collection === "string") {
                    throw "size or byteSize must be set.";
                } else {
                    data = collection;
                    collection = db._collection;
                }
            }

            data.type = "cap";
            return db.post(xpath + collection, data, callback);
        },
        /**
         * Creates a geo-spatial Index for the collection
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {List} fields  - A list with one or two attribute paths. If it is a list with one attribute path
         * location, then a geo-spatial index on all documents is created using location as path to the coordinates.
         * The value of the attribute must be a list with at least two double values. The list must contain the latitude
         * (first value) and the longitude (second value). All documents, which do not have the attribute path or with
         * value that are not suitable, are ignored. If it is a list with two attribute paths latitude and longitude,
         * then a geo-spatial index on all documents is created using latitude and longitude as paths the latitude and
         * the longitude. The value of the attribute latitude and of the attribute longitude must a double. All
         * documents, which do not have the attribute paths or which values are not suitable, are ignored.
         *
         * @param {Object} [options]  - a JSONObject with optional parameters:
         * @param {Boolean} [options.geoJson]: If a geo-spatial index on a location is constructed and geoJson is true,
         * then the order within the list is longitude followed by latitude. This corresponds to the format described in
         * http://geojson.org/geojson-spec.html#positions
         * @param {Object} [options.constraint=false] - If constraint is true, then a geo-spatial constraint is created.
         * The constraint is a non-unique variant of the index. Note that it is also possible to set the unique
         * attribute instead of the constraint attribute.
         * @param {Object} [options.ignoreNull=false] - If a geo-spatial constraint is created and ignoreNull is true,
         * then documents with a null in location or at least one null in latitude or longitude are ignored.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method createGeoSpatialIndex
         */
        "createGeoSpatialIndex": function(collection, fields, options, callback) {
            if (typeof fields === 'function') {
                callback = fields;
                options = {};
                fields = collection;
                collection = db._collection;
            }
            if (typeof options === 'function') {
                callback = options;
                if (typeof collection !== "string") {
                    options = fields;
                    fields = collection;
                    collection = db._collection;
                } else {
                    options = {};
                }
            }
            options.type = "geo";
            options.fields = fields;
            return db.post(xpath + collection, options, callback);
        },
        /**
         * Creates a hash index for the collection collection-name, if it does not already exist.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {List} fields        - A list of attribute paths.
         * @param {Boolean} [unique=false]    -  If true, then create a unique index.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method createHashIndex
         */
        "createHashIndex": function(collection, fields, unique, callback) {
            if (typeof fields === 'function') {
                callback = fields;
                unique = false;
                fields = collection;
                collection = db._collection;
            }
            if (typeof unique === 'function') {
                callback = unique;
                if (typeof collection !== "string") {
                    unique = fields;
                    fields = collection;
                    collection = db._collection;
                } else {
                    unique = false;
                }
            }
            var options = {};
            options.type = "hash";
            options.fields = fields;
            options.unique = unique;
            return db.post(xpath + collection, options, callback);
        },
        /**
         * Creates a skip-List index for the collection collection-name, if it does not already exist.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {List} fields        - A list of attribute paths.
         * @param {Boolean} [unique=false]    -  If true, then create a unique index.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method createSkipListIndex
         */
        "createSkipListIndex": function(collection, fields, unique, callback) {
            if (typeof fields === 'function') {
                callback = fields;
                unique = false;
                fields = collection;
                collection = db._collection;
            }
            if (typeof unique === 'function') {
                callback = unique;
                if (typeof collection !== "string") {
                    unique = fields;
                    fields = collection;
                    collection = db._collection;
                } else {
                    unique = false;
                }
            }
            var options = {};
            options.type = "skiplist";
            options.fields = fields;
            options.unique = unique;
            return db.post(xpath + collection, options, callback);
        },
        /**
         * Creates a fulltext index for the collection collection-name, if it does not already exist.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {List} fields        - A list of attribute paths.
         * @param {Number} [minLength]  - Minimum character length of words to index. Will default to a server-defined
         * value if unspecified. It is thus recommended to set this value explicitly when creating the index.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method createFulltextIndex
         */
        "createFulltextIndex": function(collection, fields, minLength, callback) {
            if (typeof fields === 'function') {
                callback = fields;
                minLength = false;
                fields = collection;
                collection = db._collection;
            }
            if (typeof minLength === 'function') {
                callback = minLength;
                if (typeof collection !== "string") {
                    minLength = fields;
                    fields = collection;
                    collection = db._collection;
                } else {
                    minLength = false;
                }
            }
            var options = {};
            options.type = "fulltext";
            options.fields = fields;
            if (minLength !== false) {
                options.minLength = minLength;
            }
            return db.post(xpath + collection, options, callback);
        },
        /**
         * Creates a bitarray index for the collection collection-name, if it does not already exist.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {List} fields        - A list of attribute paths.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method createBitarrayIndex
         */
        "createBitarrayIndex": function(collection, fields, callback) {
            if (typeof fields === "function") {
                callback = fields;
                fields = collection;
                collection = db._collection;
            }
            var options = {};
            options.type = "bitarray";
            options.fields = fields;
            options.unique = false;
            return db.post(xpath + collection, options, callback);
        },
        /**
         * Retrieves an index
         * @param {String} id  -   the index id.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method get
         */
        "get": function(id, callback) {
            return db.get(path + id, callback);
        },
        /**
         * Deletes an index
         * @param {String} id  -   the index id.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method delete
         */
        "delete": function(id, callback) {
            return db.delete(path + id, callback);
        },
        /**
         * Retrieves all indices for a collection
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method list
         */
        "list": function(collection, callback) {
            if (typeof collection === "function") {
                callback = collection;
                collection = db._collection;
            }
            return db.get(xpath + collection, callback);
        }
    }
}


module.exports = Arango.api('index', IndexAPI);
