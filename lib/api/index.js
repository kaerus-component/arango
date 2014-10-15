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
	 * @return{Promise}
	 * @method createCapIndex
	 */
	"createCapIndex": function (collection, data) {
	    if (typeof collection !== "string") {
		data = collection;
		collection = db._collection;
	    }

	    if(!data || data.byteSize === undefined){
		throw "data byteSize must be set";
	    }
	    
	    data.type = "cap";
	    
	    return db.post(xpath + collection, data);
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
	 * @return{Promise}
	 * @method createGeoSpatialIndex
	 */
	"createGeoSpatialIndex": function (collection, fields, options) {
	    if (typeof collection !== "string") {
		options = fields;
		fields = collection;
		collection = db._collection;
	    }

	    options = options || {};
	    
	    options.type = options.type || "geo";
	    options.fields = fields;
	    
	    return db.post(xpath + collection, options);
	},
	/**
	 * Creates a hash index for the collection collection-name, if it does not already exist.
	 *
	 * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
	 * in the connection is used.
	 * @param {Object} options - index options.
	 * @param {Object} [options.fields] - A list of attribute paths.
	 * @param {Boolean} [options.unique=false] -  If true, then create a unique index.
	 * @return{Promise}
	 * @method createHashIndex
	 */
	"createHashIndex": function (collection, options) {
	    
	    if (typeof collection !== "string") {
		options = collection;
		collection = db._collection;
	    }
	    
	    options = options || {};
	    
	    options.type = options.type || "hash";
	    options.unique = options.unique || false;
	    
	    return db.post(xpath + collection, options);
	},
	/**
	 * Creates a skip-List index for the collection collection-name, if it does not already exist.
	 *
	 * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
	 * in the connection is used.
	 * @param {Object} options        - skip list options.
	 * @param {List} [options.fields] - A list of skip list paths.
	 * @param {Boolean} [options.unique=false]    -  If true, then create a unique index.
	 * @return{Promise}
	 * @method createSkipListIndex
	 */
	"createSkipListIndex": function (collection, options) {
	    if (typeof collection !== "string") {
		options = collection;
		collection = db._collection;
	    }
	    
	    options = options || {};
	    
	    options.type = options.type || "skiplist";
	    options.unique = options.unique || false;
	  
	    return db.post(xpath + collection, options);
	},
	/**
	 * Creates a fulltext index for the collection collection-name, if it does not already exist.
	 *
	 * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
	 * in the connection is used.
	 * @param {Object} options - Fulltext index options
	 * @param {List} [options.fields]        - A list of attribute paths.
	 * @param {Number} [options.minLength]  - Minimum character length of words to index. Will default to a server-defined
	 * value if unspecified. It is thus recommended to set this value explicitly when creating the index.
	 * @return{Promise}
	 * @method createFulltextIndex
	 */
	"createFulltextIndex": function (collection, options) {
	    if (typeof collection !== "string") {
		options = collection;
		collection = db._collection;
	    }
	    
	    options = options || {};
	    
	    options.type = options.type || "fulltext";
	    options.minLength = options.minLength || false;
	    
	    return db.post(xpath + collection, options);
	},
	/**
	 * Creates a bitarray index for the collection collection-name, if it does not already exist.
	 *
	 * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
	 * in the connection is used.
	 * @param {Object} options - bitArray options
	 * @param {List} [options.fields] - A list of attribute paths.
	 * @return{Promise}
	 * @method createBitarrayIndex
	 */
	"createBitarrayIndex": function (collection, options) {
	    if (typeof collection !== "string") {
		options = collection;
		collection = db._collection;
	    }
	    
	    options = options || {};
	    
	    options.type = options.type || "bitarray";
	    options.unique = options.unique || false;
	    
	    return db.post(xpath + collection, options);
	},
	/**
	 * Retrieves an index
	 * @param {String} id  -   the index id.
	 * @return{Promise}
	 * @method get
	 */
	"get": function (id) {
	    return db.get(path + id);
	},
	/**
	 * Deletes an index
	 * @param {String} id  -   the index id.
	 * @return{Promise}
	 * @method delete
	 */
	"delete": function (id) {
	    return db.delete(path + id);
	},
	/**
	 * Retrieves all indices for a collection
	 *
	 * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
	 * in the connection is used.
	 * @return{Promise}
	 * @method list
	 */
	"list": function (collection) {
	    if(typeof collection !== 'string'){
		collection = db._collection;
	    }
	    
	    return db.get(xpath + collection);
	}
    };
}


module.exports = Arango.api('index', IndexAPI);
