var Arango = require('../arango'),
    utils = require('../utils');

require('./cursor');
/**
 * The api module to create and execute queries running in ArangoDB.
 * This module wraps the cursor module.
 *
 * @class query
 * @module arango
 * @submodule query
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
function Aql() {

    var keywords = ['for', 'in', 'filter', 'from', 'include', 'collect', 'into', 'sort', 'limit', 'let', 'return'],
        aql = this;

    keywords.forEach(function(key) {
        aql[key] = function() {
            if (!aql.struct) aql.struct = {};
            if (!arguments.length) return aql.struct[key];
            var args = Array.prototype.slice.call(arguments);
            if (typeof args[0] === 'function') {
                aql.struct[key] = (function(func) {
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
        };
    });

    function structToString(s) {
        var struct = s || aql.struct;
        return keywords.filter(function(key) {
            return !!struct[key];
        }).map(function(q) {
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

    this.options = {};
    this.db = db;

    Aql.call(this);

    /* transforms struct to string */
    Object.defineProperty(this, "query", {
        string: null,
        get: function() {
            if (query.struct) {
                this.string = query.toString();
                delete query.struct;
            }

            return this.string;
        },
        set: function(val) {
            this.string = val;
            delete query.struct;

            return this.string;
        }
    });
}

utils.inherit(QueryAPI, Aql);

function exec_query(query, method, args) {
    var q = {}, i = 0,
        a = Array.prototype.slice.call(args);

    utils.extend(true, q, query.options);

    /* use Aql object */
    if (a[i] instanceof Aql)
        q.query = a[i++].toString();
    /* use query string */
    else if (typeof a[i] === 'string')
        q.query = a[i++];
    else
        q.query = query.query;

    /* merge with object */
    if (typeof a[i] === 'object') {
        if (a[i].hasOwnProperty('bindVars'))
            utils.extend(true, q, a[i++]);
        else q.bindVars = a[i++];
    }

    return query.db.cursor[method](q, a[i]);
}

QueryAPI.prototype = {
    /**
     *
     * Test the current query.
     *
     * @method test
     * @return{Promise}
     */
    "test": function() {
        return exec_query(this, "query", arguments);
    },
    /**
     *
     * Explain the current query.
     *
     * @return{Promise}
     * @method explain
     */
    "explain": function() {
        return exec_query(this, "explain", arguments);
    },
    /**
     *
     * Execute the current query.
     *
     * @method execute
     * @return{Promise}
     */
    "exec": function() {
        var db = this.db;

        var on_result = function(retval) {

            if (retval.hasMore) {
                this.next = function() {
                    return db.cursor.get(retval.id).then(on_result);
                };
            } else delete this.next;
            return retval.result;
        };
        return exec_query(this, "create", arguments).then(on_result);
    },
    /**
     *
     * Sets the count and batchsize options for the query for this instance.
     * @param {Number} num - the desired batchsize.
     * @method test
     * @return {QueryAPI}
     */
    "count": function(num) {
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
    "new": function() {
        return new Aql();
    },
    /**
     *
     * Returns true if there is more data to fetch,
     *
     * @return {Boolean}
     * @method test
     */
    "hasNext": function() {
        return this.next !== QueryAPI.prototype.next;
    },
    "next": function() {
        throw {
            name: "StopIteration"
        };
    }
};

module.exports = Arango.api('query', QueryAPI);
