
var url = require('./url'),
	utils = require('./utils'),
	base64 = require('base64'),
	Arango = require('./arango');


var API = [
	'transaction',
	'collection',
	'database',
	'document',
	'action',
	'cursor',
	'simple',
	'index',
	'query',
	'admin',
	'graph',
	'batch',
	'edge',
	'user',
	'key'
], use_api = API;

/* Arango connection */
function Connection(){
    var options = {
        _server: {
            protocol: 'http',
            hostname: '127.0.0.1',
            port: 8529
        }
    };
 
    for(var i = 0; arguments[i]; i++) {
        if(typeof arguments[i] === 'object')
            utils.extend(true,options,arguments[i]);
        else if(typeof arguments[i] === 'string')
            utils.extend(true,options,url.path2db(arguments[i]));
    }

    /* pull in API:s */
    for(var name in use_api){
    	if(use_api[name]) require('./api/' + use_api[name]);
    }

    return new Arango(options);
}

function api(names){
	if(names === undefined) return use_api;

	if(typeof names === 'string') names = names.split(' '); 

	use_api = names;
}

module.exports = {Connection: Connection, api: api, base64: base64};