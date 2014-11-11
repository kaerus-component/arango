/*global require exports */

var API = {};

function use(api){
    
    if(Array.isArray(api)){
	api.forEach(use);
    }
    else if(typeof api === 'object'){	
	for(var ns in api) {
	    register(ns, api[ns]);
	}
    }
    else if(typeof api === 'string'){
	api = require(api);
	
	use(api);
    }
    else {
	throw new TypeError(typeof api);
    }
}

exports.use = use;

function register(ns,api) {
    if(!Object.getOwnPropertyDescriptor(API, ns)) {
	API[ns] = api;
    }
    else {
	if(!API[ns]) API[ns] = api;
	else if(API[ns] !== api) throw new Error(ns + " api already registered");
    }
}

exports.register = register;

function list(){
    var apis = [];
    
    for(var ns in API) apis.push(ns);

    return apis;
}

exports.list = list;

function load(db,api){
    if(!db) return;
    
    if(api && typeof api === 'string'){
	// load single api
	if(!API[api])
	    throw new Error(api + " api not registered");
	else db[api] = attach(db,api,API[api]);
    } else {
	// load everything
	for(var ns in API)
	    db[ns] = attach(db,ns,API[ns]);
    }
}

exports.load = load;

function attach(db, ns, api) {

    Object.defineProperty(db, ns, {
	enumerable: true,
	configurable: true,
	get: function () {
	    return context();
	}
    });
    
    function context() {
	var instance = api(db);

	proxyMethods(db,instance);
	
	context = function () {
	    return instance;
	};

	return instance;
    }
}

function proxyMethods(db,instance){
    Object.keys(instance).forEach(function(method){
	var api_method = instance[method];
	
	if(typeof api_method === 'function'){
	    
	    instance[method] = function(){
		var args = [].slice.call(arguments), arg, i;

		if((i = args.length)){
		    arg = args[i-1];

		    if(arg && typeof arg === 'function'){
			db.__callback = arg;
			args.splice(i-1,1);
			arg = args[i-2];
		    }
		    
		    if(arg && typeof arg === 'object'){
			if(arg.hasOwnProperty('__headers')){
			    db.__headers = arg.__headers;
			    delete arg.__headers;
			}
			
			if(arg.hasOwnProperty('__options')){
			    db.__options = arg.__options;
			    delete arg.__options;
			}
		    }
		}

		try{
		    return api_method.apply(instance,args);
		} catch(e) {
		    throw e;
		} finally {
		    db.__callback = undefined;
		    db.__headers = undefined;
		    db.__options = undefined;
		}

		// should never reach here
		throw new Error("unexpected return");  
	    };
	    
	} else if(typeof api_method === 'object') {
	    proxyMethods(db,api_method);
	}
    });
}

