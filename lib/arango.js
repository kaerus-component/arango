"use strict";

var uPromise = require('micropromise'),
    base64 = require('base64'),
    utils = require('./utils'),
    xhr = require('./xhr'),
    url = require('./url');

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
    ], ArangoAPI;

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
    var api = {};

    api[ns] = exp;

    attach(this, api);

    return exp;
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
    "api": function (api) {
	if (!api) return ArangoAPI;

	attach(this, api);

	return new Arango(this);
    },
    "request": function(method, path, data, headers) {
	var promise = new uPromise(), options;

	if (data && typeof data !== 'string') {
	    try {
		data = JSON.stringify(data);
	    } catch (err) {
		promise.reject(err);
		
		return promise;
	    }
	}

	options = utils.extend(true, {}, this._server, {headers:headers});
	
	if (this._name) {
	    path = '/_db/' + this._name + path;
	}

	xhr(method, path, options, data, promise);
	
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
	var urlopt;

	if(this['__headers']) {
	    headers = utils.extend(true,{},headers,this['__headers']);
	}
	
	if(this['__options']) {
	    urlopt = url.options(this['__options']);

	    if(path.indexOf('?') > 0) path+= '&' + urlopt.substr(1);
	    else path+= urlopt;
	}
	
	return this.request(method.toUpperCase(), path, data, headers);
    };
});

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
	    get: function () {
		return context();
	    }
	});
    } else {
	db[ns] = typeof api === 'function' ? api(db) : context();
    }

    function context() {
	var instance = (require(api))(db);
	
	// proxy api methods
	Object.keys(instance).forEach(function(method){
	    var api_method = instance[method];
	    
	    if(typeof api_method === 'function'){
		instance[method] = function(){
		    var args = [].slice.call(arguments);		 
		    return arango_api(db,api_method,instance,args);
		};
	    } 
	});
	
	context = function () {
	    return instance;
	};

	return instance;
    }
}

function arango_api(db,method,api,args){
    var options, headers, ret, arg, i;
    
    if((i = args.length)){
	arg = args[i-1];
	
	if(typeof arg === 'object'){
	    if(arg.hasOwnProperty('__headers')){
		db['__headers'] = arg['__headers'];
		delete arg['__headers'];
	    }
	    
	    if(arg.hasOwnProperty('__options')){
		db['__options'] = arg['__options'];
		delete arg['__options'];
	    }
	}
    }

    try{
	ret = method.apply(api,args);
    } catch(e) {
	throw e;
    } finally {
	db['__headers'] = null;
	db['__options'] = null;
    } 
    
    return ret;
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
