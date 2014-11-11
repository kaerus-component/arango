/*global require exports */

var api = require('../api'),
    utils = require('../../utils');

api.use(require('../cursor'));
/**
 * The api module to create and execute queries running in ArangoDB.
 * This module wraps the cursor module.
 *
 * @module Arango
 * @submodule query
 * @class query
 * @extends Arango
 * 
 **/
/**
 *
 * AQL function "for",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationFor">AQL Documentation</a>
 *
 * @return{Aql}
 * @method for
 */
/**
 *
 * AQL function "in",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationIn">AQL Documentation</a>
 *
 * @return{Aql}
 * @method in
 */
/**
 *
 * AQL function "filter",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationFilter">AQL Documentation</a>
 *
 * @return{Aql}
 * @method filter
 */
/**
 *
 * AQL function "from",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationFrom">AQL Documentation</a>
 *
 * @return{Aql}
 * @method from
 */
/**
 *
 * AQL function "include",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationInclude">AQL Documentation</a>
 *
 * @return{Aql}
 * @method include
 */
/**
 *
 * AQL function "collect",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationCollect">AQL Documentation</a>
 *
 * @return{Aql}
 * @method collect
 */
/**
 *
 * AQL function "into",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationInto">AQL Documentation</a>
 *
 * @return{Aql}
 * @method into
 */
/**
 *
 * AQL function "sort",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationSort">AQL Documentation</a>
 *
 * @return{Aql}
 * @method sort
 */

/**
 *
 * AQL function "limit",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationLimit">AQL Documentation</a>
 *
 * @return{Aql}
 * @method limit
 */
/**
 *
 * AQL function "let",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationLet">AQL Documentation</a>
 *
 * @return{Aql}
 * @method let
 */
/**
 *
 * AQL function "return",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationReturn">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_edges",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_edges">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_vertices",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_vertices">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_neighbors",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_neighbors">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_common_neighbors",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_common_neighbors">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_common_properties",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_common_properties">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_paths",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_paths">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_shortest_path",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_shortest_path">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_traversal",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_traversal">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_traversal_tree",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_traversal_tree">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_distance_to",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_distance_to">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_absolute_eccentricity",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_absolute_eccentricity">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_eccentricity",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_eccentricity">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_absolute_closeness",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_absolute_closeness">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_closeness",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_closeness">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_absolute_betweenness",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_absolute_betweenness">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_betweenness",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_betweenness">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_radius",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_radius">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_diameter",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_diameter">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
function Aql() {

    var keywords = [
	'for',
	'in',
	'filter',
	'from',
	'include',
	'collect',
	'into',
	'sort',
	'limit',
	'let',
	'return'
    ],
	graphKeywords = [
	    "graph_vertices",
	    "graph_edges",
	    "graph_neighbors",
	    "graph_common_neighbors",
	    "graph_common_properties",
	    "graph_paths",
	    "graph_shortest_path",
	    "graph_traversal",
	    "graph_traversal_tree",
	    "graph_distance_to",
	    "graph_absolute_eccentricity",
	    "graph_eccentricity",
	    "graph_absolute_closeness",
	    "graph_closeness",
	    "graph_absolute_betweenness",
	    "graph_betweenness",
	    "graph_radius",
	    "graph_diameter"
	],
	aql = this;

    aql.struct = {};
    
    var bindGraphKeywords = function (bindee) {
	graphKeywords.forEach(function(key) {
	    Object.defineProperty(bindee,key,{
		enumerable:false,
		value: function() {
		    var aqlString = key.toUpperCase();
		    var args = [].slice.call(arguments);
		    
		    aqlString += "(";
		    aqlString += args.map(function(arg) {
			if (typeof arg === "object") {
			    return JSON.stringify(arg);
			}
			
			return "\"" + arg + "\"";
		    }).join(",");
		    aqlString += ")";
		    
		    bindee(aqlString);
		    
		    return aql;
		}
	    });
	});
    };
    
    keywords.forEach(function (key) {
	Object.defineProperty(aql,key,{
	    enumerable: false,
	    value: function () {
		var args = [].slice.call(arguments);
		if (!args.length) return aql.struct[key];
		if (typeof args[0] === 'function') {
		    aql.struct[key] = (function (func) {
			var faql = new Aql();
			func.apply(faql);

			return faql.struct;
		    })(args[0]);
		} else if (args[0] instanceof Aql) {
		    aql.struct[key] = args[0].struct;
		} else {
		    if (key === 'filter' || key === 'let') {
			if (!aql.struct[key]) aql.struct[key] = [];
			aql.struct[key].push(args.join(' '));
		    } else aql.struct[key] = args.join(' ');
		}
		
		return aql;
	    }
	});
    });
    
    Object.defineProperty(aql, "string", {
	enumerable: false,
	get: function () {
	    return aql.toString();
	},
	set: function (str) {
	    if(typeof str === 'string')
		aql.struct = { '_string': str };

	    return aql._string;
	}
    });

    bindGraphKeywords(aql.in);
    bindGraphKeywords(aql.return);
    
    function structToString(struct) {
	struct = struct || aql.struct;

	return struct._string || keywords.concat(graphKeywords)
	    .filter(function (key) {
		return !!struct[key];
	    }).map(function (q) {
		var keyword = q.toUpperCase(),
		    value = struct[q],
		    str;

		switch (keyword) {
		case 'FROM':
		    keyword = 'IN';
		    break;
		case 'INCLUDE':
		    keyword = '';
		    break;
		case 'FILTER':
		    value = value.join(' && ');
		    break;
		case 'LET':
		    value = value.join(' LET ');
		    break;
		default:
		    break;
		}

		if (typeof value === 'object') {
		    var nested = structToString(value);

		    if (q === 'in') str = keyword + ' ( ' + nested + ' )';
		    else str = keyword + ' ' + nested;

		} else str = keyword + ' ' + value;

		return str;
	    }).join(' ');
    }

    aql.toString = structToString;
}

function QueryAPI(db) {
    if (!(this instanceof QueryAPI))
	return new QueryAPI(db);

    var query = this;
    
    Aql.call(this);
    
    this.options = {};

    Object.defineProperty(this,"db",{
	enumerable:false,
	writable:false,
	value: db
    });

    Object.defineProperty(this,"toQuery",{
	enumerable: false,
	writable: false,
	value: function(bindVars){
	    var q = { query: query.toString() };

	    // merge options
	    if(query.options)
		utils.extend(true, q, query.options);

	    // use bindVars
	    if(bindVars) q.bindVars = bindVars;

	    return q;
	}
    });

};

utils.inherit(QueryAPI, Aql);

QueryAPI.prototype = {
    /**
     *
     * Test the current query.
     *
     * @method test
     * @return{Promise}
     */
    "test": function (bindVars,options) {
	return this.db.cursor.query(this.toQuery(bindVars),options);
    },
    /**
     *
     * Explain the current query.
     *
     * @return{Promise}
     * @method explain
     */
    "explain": function (bindVars,options) {
	return this.db.cursor.explain(this.toQuery(bindVars),options);
    },
    /**
     *
     * Execute the current query.
     *
     * @method execute
     * @return{Promise}
     */
    "exec": function (bindVars,options) {
	var db = this.db, self = this;
	
	function on_result(ret) {
	    
	    if (ret.hasMore) {
		self.hasNext = function() {
		    return true;
		};
		self.next = function () {
		    return db.cursor.get(ret.id).then(on_result);
		};
	    } else {
		delete self.next;
		self.hasNext = function() {
		    return false;
		};
	    }
	    
	    return ret;
	};
	
	return this.db.cursor.create(this.toQuery(bindVars), options).then(on_result);
    },
    /**
     *
     * Sets the count and batchsize options for the query for this instance.
     * @param {Number} num - the desired batchsize.
     * @method test
     * @return {QueryAPI}
     */
    "count": function (num) {
	this.options.count = num > 0 ? true : false;
	this.options.batchSize = num > 0 ? num : undefined;

	return this;
    },
    /**
     *
     * Returns a fresh query instance.
     * @method test
     * @return {Aql}
     */
    "new": function () {
	return new Aql();
    },
    /**
     *
     * Returns true if there is more data to fetch,
     *
     * @return {Boolean}
     * @method test
     */
    "hasNext": function () {
	return this.next !== QueryAPI.prototype.next;
    },
    "next": function () {
	throw {
	    name: "StopIteration"
	};
    }
};

exports.query = QueryAPI;
