/*global require, module */
"use strict";

var uPromise,
    base64 = require('base64'),
    utils = require('./utils'),
    url = require('./url'),
    Xhr = require('./xhr'),
    api = require('./api/api');
    

api.use(
    [
	require('./api/action'),
	require('./api/admin'),
	require('./api/aqlfunction'),
	require('./api/batch'),
	require('./api/collection'),
	require('./api/cursor'),
	require('./api/database'),
	require('./api/document'),
	require('./api/edge'),
	require('./api/endpoint'),
	require('./api/graph'),
	require('./api/import'),
	require('./api/index'),
	require('./api/job'),
	require('./api/query'),
	require('./api/simple'),
	require('./api/transaction'),
	require('./api/traversal'),
	require('./api/user')	
    ]
);

try { uPromise = require('micropromise'); } catch(e){ uPromise = require('uP'); }


/**
 * Arangodb client module
 *
 * @class Arango
 * @module Arango
 * @constructor
 *
 **/
function Arango(db, options) {
    if (!(this instanceof Arango)) {
	return new Arango(db, options);
    }

    if (db instanceof Arango) {
	this._name = db._name;
	this._collection = db._collection;
	this._server = utils.extend(true, {}, db._server);
    } else options = db;

    if (options) {
	if (typeof options === 'string') {
	    utils.extend(true, this, url.path2db(options));
	} else if (typeof options === 'object') {
	    if (options.api) api.load(this, options.api);
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
	    base64.encode(this._server.username + ':' + (this._server.password||""));
    }

    api.load(this);
}

/**
 * Factory method for creating a client connection object
 * 
 * @method Connection
 * @static
 * @param {string} url		- connection string
 * @param {object} object 	- connection object
 * @returns {object} db 	- instance
 *
 **/
Arango.Connection = function () {
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
Arango.api = function (ns, exp) {
    api.register(ns, exp);
}

/* base64 helper */
Arango.base64 = base64;

Arango.prototype = {
    "use": function (options) {
	return new Arango(this, options);
    },
    "useCollection": function (collection) {
	return this.use(":" + collection);
    },
    "useDatabase": function (database) {
	return this.use("/" + database);
    },
    "api": function (ns) {
	// returns registered api:s
	if (!ns) return api.list();

	api.load(this, ns);

	return new Arango(this);
    },
    "request": function(method, path, data, headers, callback) {
	var promise, options;

	if(['GET','HEAD','DELETE','OPTIONS'].indexOf(method) >=0){
	    callback = headers;
	    headers = data;
	    data = undefined;
	}

	if(typeof callback !== 'function') promise = new uPromise();
	
	if(data && typeof data !== 'string') {
	    try {
		data = JSON.stringify(data);
	    } catch (err) {
		return promise ? promise.reject(err) : callback(err); 
	    }
	}

	options = utils.extend(true, {}, this._server, {headers:headers});
	
	if (this._name) {
	    path = '/_db/' + this._name + path;
	}

	//console.log("request",method,path,options,data);

	Xhr(method, path, options, data, promise || callback);
	
	return promise;
    },
    "setAsyncMode": function (active, fireAndForget) {

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
    "Promise": uPromise
};

['get','put','post','patch','delete','head','options'].forEach(function(method){
    Arango.prototype[method] = function(path,data,headers){
	var urlopt, callback = this.__callback;

	if(this.__headers) {
	    headers = utils.extend(true,{},headers,this.__headers);
	}
	
	if(this.__options) {
	    urlopt = url.options(this.__options);

	    if(path.indexOf('?') > 0) path+= '&' + urlopt.substr(1);
	    else path+= urlopt;
	}
	
	return this.request(method.toUpperCase(), path, data, headers, callback);
    };
});



module.exports = Arango;
