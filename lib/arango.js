"use strict";

var url = require('./url'),
    base64 = require('base64'),
    Promise = require('micropromise'),
    utils = require('./utils'),
    request = require('./request');

var API_DIR = './api/',
    API_MODULES = [
        'transaction',
        'collection',
        'database',
        'document',
        'cursor',
        'job',
        'simple',
        'index',
        'query',
        'admin',
        'aqlfunction',
        'endpoint',
        'import',
        'traversal',
        'graph',
        'batch',
        'edge',
        'action',
        'user'
    ],
    ArangoAPI;


function Arango(db, options) {
    if (!(this instanceof Arango)) {
        return new Arango(db, options);
    }

    /* attach API:s */
    attach(this, ArangoAPI);

    if (db instanceof Arango) {
        this._name = db._name;
        this._collection = db._collection;
        this._server = utils.extend(true, {}, db._server);
    } else options = db;

    if (options) {
        if (typeof options === 'string') {
            utils.extend(true, this, url.path2db(options));
        } else if (typeof options === 'object') {
            if (options.api) attach(this, options.api);
            if (options._name) this._name = options._name;
            if (options._server) this._server = options._server;
            if (options._collection) this._collection = options._collection;
        }
    }
    /* Apply defaults */
    if (typeof this._server !== 'object')
        this._server = {};
    if (typeof this._server.protocol !== 'string')
        this._server.protocol = 'http';
    if (typeof this._server.hostname !== 'string')
        this._server.hostname = '127.0.0.1';
    if (typeof this._server.port !== 'number')
        this._server.port = parseInt(this._server.port || 8529, 10);
    if (typeof this._collection !== 'string')
        this._collection = '';

    /* Basic authorization */
    if (this._server.username) {
        if (typeof this._server.headers !== 'object') this._server.headers = {};
        this._server.headers['authorization'] = 'Basic ' +
            base64.encode(this._server.username + ':' + this._server.password);
    }
}
/**
 * Creates an arango connection, can be called either with a JSON Object representing the connection or with a
 * connection String.
 *
 * @example
 *  arango.Connection("https://user:pass@hostname:8529/database:collection")<br>
 *  arango.Connection("https://test.com")<br>
 *  arango.Connection({_name:"database",_collection:"collection",_server:{hostname:"test.host"}})<br>
 *
 * @return {arango}
 * @class arango
 * @constructor
 * @module arango

 */
Arango.Connection = function() {
    var options = {};

    for (var i = 0; arguments[i]; i++) {
        if (typeof arguments[i] === 'object')
            utils.extend(true, options, arguments[i]);
        else if (typeof arguments[i] === 'string')
            utils.extend(true, options, url.path2db(arguments[i]));
    }

    return new Arango(options);
}

/* api registration hook */
Arango.api = function(ns, exp) {
    var api = {};

    api[ns] = exp;

    attach(this, api);

    return exp;
}

/* base64 helper */
Arango.base64 = base64;

Arango.prototype = {
    /**
     * changes the arango connection
     *
     * @param {String|Object} options - the new connection parameters.
     * @method use
     * @return{arango}
     */
    "use": function(options) {
        return new Arango(this, options);
    },
    /**
     * changes the arango defautl collection
     *
     * @param {String} collection - the collection to be used for all further requests.
     * @method useCollection
     * @return{arango}
     */
    "useCollection": function(collection) {
        return this.use(":" + collection);
    },
    /**
     * changes the arango database.
     *
     * @param {String} database - the database to perform every operation on.
     * @method useDatabase
     * @return{arango}
     */
    "useDatabase": function(database) {
        return this.use("/" + database);
    },
    /**
     * add a new api module to the arango module
     *
     * @param {Object} api - a new api module
     * @method api
     * @return{arango}
     */
    "api": function(api) {
        if (!api) return ArangoAPI;

        attach(this, api);

        return new Arango(this);
    },
    /**
     * perform a HTTP "GET" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Function} callback   - The callback function.
     * @method get
     * @return{Promise}
     */
    "get": function(path, options, callback) {
        return this.request('GET', path, null, options, callback);
    },
    /**
     * perform a HTTP "POST" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Object} data - the request body
     * @param {Function} callback   - The callback function.
     * @method post
     * @return{Promise}
     */
    "post": function(path, data, options, callback) {
        return this.request('POST', path, data, options, callback);
    },
    /**
     * perform a HTTP "PUT" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Object} data - the request body
     * @param {Function} callback   - The callback function.
     * @method put
     * @return{Promise}
     */
    "put": function(path, data, options, callback) {
        return this.request('PUT', path, data, options, callback);
    },
    /**
     * perform a HTTP "DELETE" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Function} callback   - The callback function.
     * @method delete
     * @return{Promise}
     */
    "delete": function(path, options, callback) {
        return this.request('DELETE', path, null, options, callback);
    },
    /**
     * perform a HTTP "HEAD" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Function} callback   - The callback function.
     * @method head
     * @return{Promise}
     */
    "head": function(path, options, callback) {
        return this.request('HEAD', path, null, options, callback);
    },
    /**
     * perform a HTTP "PATCH" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Object} data - the request body
     * @param {Function} callback   - The callback function.
     * @method patch
     * @return{Promise}
     */
    "patch": function(path, data, options, callback) {
        return this.request('PATCH', path, data, options, callback);
    },
    /**
     * perform a HTTP "OPTIONS" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Function} callback   - The callback function.
     * @method options
     * @return{Promise}
     */
    "options": function(path, options, callback) {
        return this.request("OPTIONS", path, null, options, callback);
    },
    /**
     * Enables/disables the async mode. Every request is enriched with a header telling arangodb to perform the request
     * asnyc.
     *
     * @param {Boolean} active   -  true to activate.
     * @param {Boolean} [fireAndForget   -  if true fire and forget mode is activated.
     * @method setAsyncMode
     * @return{arango}
     */
    "setAsyncMode": function(active, fireAndForget) {

        if (!active) {
            if (this._server.headers !== undefined)
                delete this._server.headers["x-arango-async"];

            return this;
        }

        if (typeof this._server.headers !== 'object')
            this._server.headers = {};

        this._server.headers["x-arango-async"] = fireAndForget ? "true" : "store";

        return this;
    },

    "debug": function(on) {
        if (on === undefined) return debug;

        debug = !! on;
    },
    "request": request,
    "Promise": Promise
}

function attach(db, api) {
    if (typeof api === 'string') {
        api = fetch(api);
    }

    for (var ns in api) {
        if (!Object.getOwnPropertyDescriptor(db, ns))
            load(db, ns, api[ns], true);
    }
}

function load(db, ns, api, lazy) {

    if (lazy) {
        Object.defineProperty(db, ns, {
            enumerable: true,
            configurable: true,
            get: function() {
                return context();
            }
        });
    } else {
        db[ns] = typeof api === 'function' ? api(db) : context();
    }

    function context() {
        var instance = (require(api))(db);

        context = function() {
            return instance
        };

        return instance;
    }
}

function fetch(api) {
    var o = {};

    if (typeof api === 'string') api = api.split(' ');

    for (var n in api) o[api[n]] = API_DIR + api[n];

    return o;
}

/* configure API modules */
ArangoAPI = fetch(API_MODULES);

module.exports = Arango;
