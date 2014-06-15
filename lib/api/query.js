var Arango = require('../arango'),
    utils = require('../utils');

require('./cursor');

function Aql() {

    var keywords = ['For', 'In', 'filter', 'from', 'include', 'collect', 'into', 'sort', 'limit', 'let', 'Return'],
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

                if (q === 'In') str = keyword + ' ( ' + nested + ' )';
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
    "test": function() {
        return exec_query(this, "query", arguments);
    },
    "explain": function() {
        return exec_query(this, "explain", arguments);
    },
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
    "count": function(num) {
        this.options.count = num > 0 ? true : false;
        this.options.batchSize = num > 0 ? num : undefined;

        return this;
    },
    "new": function() {
        return new Aql();
    },
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
