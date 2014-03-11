var Arango = require('../arango');
/**
 * The api module to do perform simple queries in ArangoDB.
 *
 * @class simple
 * @module arango
 * @submodule simple
 **/
function SimpleAPI(db) {
    var path = "/_api/simple/";
    
    return {
        /**
         * Returns all documents of a collections. The call expects a JSON object as body with the following attributes:
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Object} [options] -  JSONObject with optional parameters:
         * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
         * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method list
         */
        "list": function(collection, options, callback) {
            if (typeof collection === "function") {
                callback = collection;
                options = {};
                collection = db._collection;
            }
            if (typeof options === "function") {
                callback = options;
                if (typeof collection === "string") {
                    options = {};
                } else {
                    options = collection;
                    collection = db._collection;
                }
            }

            var data = {
                collection: collection
            };
            return db.put(path + 'all', applyOptions(this, data, options), callback);
        },
        /**
         * Returns any document of a collections. The call expects a JSON object as body with the following attributes:
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method any
         */
        "any": function(collection, callback) {
            if (typeof collection === "function") {
                callback = collection;
                collection = db._collection;
            }

            var data = {
                collection: collection
            };
            return db.put(path + 'any', data, callback);
        },
        /**
         * This will find all documents matching a given example.
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Object} example - An object defining the example.
         * @param {Object} [options] -  JSONObject with optional parameters:
         * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
         * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method example
         */
        "example": function(collection, example, options, callback) {
            if (typeof example === "function") {
                callback = example;
                example = collection;
                options = {};
                collection = db._collection;
            }
            if (typeof options === "function") {
                callback = options;
                if (typeof collection === "string") {
                    options = {};
                } else {
                    options = example;
                    example = collection;
                    collection = db._collection;
                }
            }
            var data = {
                collection: collection,
                example: example
            };
            return db.put(path + 'by-example', applyOptions(this, data, options), callback);
        },
        /**
         * This will remove all documents matching a given example.
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Object} example - An object defining the example.
         * @param {Object} [options] -  JSONObject with optional parameters:
         * @param {Boolean} [options.waitForSync]  -   if set to true, then all removal operations will instantly be
         * synchronised to disk. If this is not specified, then the collection's default sync behavior will be applied.
         * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method removeByExample
         */
        "removeByExample": function(collection, example, options, callback) {
            if (typeof example === "function") {
                callback = example;
                example = collection;
                options = {};
                collection = db._collection;
            }
            if (typeof options === "function") {
                callback = options;
                if (typeof collection === "string") {
                    options = {};
                } else {
                    options = example;
                    example = collection;
                    collection = db._collection;
                }
            }
            var data = {
                collection: collection,
                example: example
            };
            return db.put(path + 'remove-by-example', applyOptions(this, data, options), callback);
        },
        /**
         * This will find all documents in the collection that match the specified example object, and replace the entire
         * document body with the new value specified. Note that document meta-attributes such as _id, _key, _from, _to etc.
         * cannot be replaced.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Object} example - An object defining the example.
         * @param {Object} newValue - The replacement object.
         * @param {Object} [options] -  JSONObject with optional parameters:
         * @param {Boolean} [options.waitForSync]  -   if set to true, then all removal operations will instantly be
         * synchronised to disk. If this is not specified, then the collection's default sync behavior will be applied.
         * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method replaceByExample
         */
        "replaceByExample": function(collection, example, newValue, options, callback) {
            if (typeof newValue === "function") {
                callback = newValue;
                newValue = example;
                example = collection;
                options = {};
                collection = db._collection;
            }
            if (typeof options === "function") {
                callback = options;
                if (typeof collection === "string") {
                    options = {};
                } else {
                    options = newValue;
                    newValue = example;
                    example = collection;
                    collection = db._collection;
                }
            }
            var data = {
                collection: collection,
                example: example,
                newValue: newValue
            };
            return db.put(path + 'replace-by-example', applyOptions(this, data, options), callback);
        },
        /**
         * This will find all documents in the collection that match the specified example object, and partially update the
         * document body with the new value specified. Note that document meta-attributes such as _id, _key, _from, _to etc.
         * cannot be replaced.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Object} example - An object defining the example.
         * @param {Object} newValue - The replacement object.
         * @param {Object} [options] -  JSONObject with optional parameters:
         * @param {Boolean} [options.waitForSync]  -   if set to true, then all removal operations will instantly be
         * synchronised to disk. If this is not specified, then the collection's default sync behavior will be applied.
         * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
         * @param {Boolean} [options.keepNull=true]  -  "false" will remove null values from the update document.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method updateByExample
         */
        "updateByExample": function(collection, example, newValue, options, callback) {
            if (typeof newValue === "function") {
                callback = newValue;
                newValue = example;
                example = collection;
                options = {};
                collection = db._collection;
            }
            if (typeof options === "function") {
                callback = options;
                if (typeof collection === "string") {
                    options = {};
                } else {
                    options = newValue;
                    newValue = example;
                    example = collection;
                    collection = db._collection;
                }
            }
            var data = {
                collection: collection,
                example: example,
                newValue: newValue
            };

            return db.put(path + 'update-by-example', applyOptions(this, data, options), callback);
        },
        /**
         * This will return the first documents matching a given example.
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Object} example - An object defining the example.
         * @param {Object} [options] -  JSONObject with optional parameters:
         * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
         * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method firstByExample
         */

        "firstByExample": function(collection,example,options,callback) {
            var data;

            if(typeof collection !== 'string'){
                callback = options;
                options = example;
                example = collection;
                collection = db._collection;
            }

            if(typeof options === 'function'){
                callback = options;
            }

            data = {collection:collection, example:example};

            return db.put(path+'first-example',applyOptions(this,data,options),callback);    
        },
        /**
         * This will return the first documents from the collection, in the order of insertion/update time. When the count
         * argument is supplied, the result will be a list of documents, with the "oldest" document being first in the
         * result list. If the count argument is not supplied, the result is the "oldest" document of the collection,
         * or null if the collection is empty.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Number} [count=1]  - the number of documents to return at most.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method first
         */
        "first": function(collection, count, callback) {
            if (typeof collection === "function") {
                callback = collection;
                count = undefined;
                collection = db._collection;
            }
            if (typeof count === "function") {
                callback = count;
                if (typeof collection === "string") {
                    count = undefined;
                } else {
                    count = collection;
                    collection = db._collection;
                }
            }
            var data = {
                collection: collection
            }
            if (count !== null) {
                data.count = count;
            }
            return db.put(path + 'first', data, callback);
        },

        /**
         * This will return the last documents from the collection, in the order of insertion/update time. When the count
         * argument is supplied, the result will be a list of documents, with the "newest" document being first in the
         * result list. If the count argument is not supplied, the result is the "newest" document of the collection,
         * or null if the collection is empty.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Number} [count=1]  - the number of documents to return at most.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method last
         */
        "last": function(collection, count, callback) {
            if (typeof collection === "function") {
                callback = collection;
                count = undefined;
                collection = db._collection;
            }
            if (typeof count === "function") {
                callback = count;
                if (typeof collection === "string") {
                    count = undefined;
                } else {
                    count = collection;
                    collection = db._collection;
                }
            }
            var data = {
                collection: collection
            }
            if (count !== null) {
                data.count = count;
            }
            return db.put(path + 'last', data, callback);
        },
        /**
         * This will find all documents within a given range. You must declare a skip-list index on the attribute in order
         * to be able to use a range query.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {String} attribute     - the attribute path to check.
         * @param {Number|String} left - The lower bound.
         * @param {Number|String} right    - The upper bound.
         * @param {Object} [options] -  JSONObject with optional parameters:
         * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
         * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
         * @param {Number} [options.closed=false] - If true, use interval including left and right, otherwise exclude
         * right, but include left.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method range
         */
        "range": function(collection, attribute, left, right, options, callback) {
            if (typeof right === "function") {
                callback = right;
                right = left;
                left = attribute;
                attribute = collection;
                options = {};
                collection = db._collection;
            }
            if (typeof options === "function") {
                callback = options;
                if (typeof right === "object") {
                    options = right;
                    right = left;
                    left = attribute;
                    attribute = collection;
                    collection = db._collection;
                } else {
                    options = {};
                }
            }
            var data = {
                collection: collection,
                attribute: attribute,
                left: left,
                right: right
            };
            return db.put(path + 'range', applyOptions(this, data, options), callback);
        },
        /**
         * The default will find at most 100 documents near a given coordinate. The returned list is sorted according to the
         * distance, with the nearest document coming first. If there are near documents of equal distance, documents are
         * chosen randomly from this set until the limit is reached. In order to use the near operator, a geo index must be
         * defined for the collection. This index also defines which attribute holds the coordinates for the document.
         * If you have more then one geo-spatial index, you can use the geo field to select a particular index.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Number} latitude      - The latitude of the coordinate.
         * @param {Number} longitude     - The longitude of the coordinate.
         * @param {Object} [options] -  JSONObject with optional parameters:
         * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
         * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
         * @param {Number} [options.geo] -   If given, the identifier of the geo-index to use.
         * @param {Number} [options.distance] - If given, the attribute key used to store the distance.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method near
         */
        "near": function(collection, latitude, longitude, options, callback) {
            if (typeof longitude === "function") {
                callback = longitude;
                longitude = latitude;
                latitude = collection;
                collection = db._collection;
            }
            if (typeof options === "function") {
                callback = options;
                if (typeof longitude === "object") {
                    options = longitude;
                    longitude = latitude;
                    latitude = collection;
                    collection = db._collection;
                } else {
                    options = {};
                }
            }
            var data = {
                collection: collection,
                latitude: latitude,
                longitude: longitude
            };
            return db.put(path + 'near', applyOptions(this, data, options), callback);
        },
        /**
         * This will find all documents with in a given radius around the coordinate (latitude, longitude). The returned
         * list is sorted by distance. In order to use the near operator, a geo index must be
         * defined for the collection. This index also defines which attribute holds the coordinates for the document.
         * If you have more then one geo-spatial index, you can use the geo field to select a particular index.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {Number} latitude      - The latitude of the coordinate.
         * @param {Number} longitude     - The longitude of the coordinate.
         * @param {Number} radius        - The radius in meters.
         * @param {Object} [options] -  JSONObject with optional parameters:
         * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
         * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
         * @param {Number} [options.geo] -   If given, the identifier of the geo-index to use.
         * @param {Number} [options.distance] - If given, the attribute key used to store the distance.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method within
         */
        "within": function(collection, latitude, longitude, radius, options, callback) {
            if (typeof radius === "function") {
                callback = radius;
                radius = longitude;
                longitude = latitude;
                latitude = collection;
                collection = db._collection;
            }
            if (typeof options === "function") {
                callback = options;
                if (typeof radius === "object") {
                    options = radius;
                    radius = longitude;
                    longitude = latitude;
                    latitude = collection;
                    collection = db._collection;
                } else {
                    options = {};
                }
            }
            var data = {
                collection: collection,
                latitude: latitude,
                longitude: longitude,
                radius: radius
            };
            return db.put(path + 'within', applyOptions(this, data, options), callback);
        },
        /**
         * This will find all documents from the collection that match the fulltext query specified in query. In order to
         * use the fulltext operator, a fulltext index must be defined for the collection and the specified attribute.
         *
         * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
         * in the connection is used.
         * @param {String} attribute    - the attribute
         * @param {String} query         - the query
         * @param {Object} [options] -  JSONObject with optional parameters:
         * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
         * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
         * @param {Number} [options.index]  -   If given, the identifier of the fulltext-index to use.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method fulltext
         */
        "fulltext": function(collection, attribute, query, options, callback) {
            if (typeof query === "function") {
                callback = query;
                query = attribute;
                attribute = collection;
                collection = db._collection;
            }
            if (typeof options === "function") {
                callback = options;
                if (typeof query === "object") {
                    options = query;
                    query = attribute;
                    attribute = collection;
                    collection = db._collection;
                } else {
                    options = {};
                }
            }
            var data = {
                collection: collection,
                attribute: attribute,
                query: query
            };
            return db.put(path + 'fulltext', applyOptions(this, data, options), callback);
        },
        /**
         * Set the amount of elements to skip for queries performed with this instance.
         *
         * @param {Number} val   - The number of elements to skip.
         * @return{simple} -  the modified instance
         * @method skip
         */

        "skip": function(val) {
            this._skip = val;
            return this;
        },
        /**
         * Set the limit for the result set for queries performed with this instance.
         *
         * @param {Number} val   - The result limit.
         * @return{simple} -  the modified instance
         * @method limit
         */

        "limit": function(val) {
            this._limit = val;
            return this;
        }
    }
}

function applyOptions(o, data, options) {
    if (typeof options === 'object') {
        Object.keys(options).forEach(function(option) {
            switch (option) {
                case 'from':
                    data.left = options[option];
                    data.closed = true;
                    break;
                case 'to':
                    data.right = options[option];
                    data.closed = true;
                    break;
                default:
                    data[option] = options[option];
                    break;
            }
        });
    }
    if (o._skip && data.skip === undefined) data.skip = o._skip;
    if (o._limit && data.limit === undefined) data.limit = o._limit;

    return data;
}
module.exports = Arango.api('simple', SimpleAPI);
