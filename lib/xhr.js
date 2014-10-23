/*global require, module, process*/
var urlParser = require('urlparser'),
    BROWSER,
    Xhr;

/* detects if in nodejs or else assume we are in a browser */
try {
    BROWSER = !process.versions.node;
} catch (e) {
    BROWSER = true;
}

/* Bring in Xhr support for nodejs or browser */
if (!BROWSER) {
    Xhr = function (method, path, options, data, resolver) {
	"use strict";
	
	var url = urlParser.parse(path);
	var proto = (url.host && url.host.protocol) || options.protocol;
	var req = require(proto).request;

	delete options.protocol;

	if (options.timeout) {
	    req.socket.setTimeout(options.timeout);
	    delete options.timeout;
	}

	options.method = method;

	if (url.host) {
	    if (url.host.hostname) options.hostname = url.host.hostname;
	    /* todo: add authentication headers if defined in url */

	    url.host = null;
	}

	options.path = url.toString();

	if (!options.headers) options.headers = {};

	options.headers["content-length"] = data ? Buffer.byteLength(data) : 0;
	
	req(options,function (res) {
	    var buf = [];

	    res.on('data',function (chunk) {
		buf[buf.length] = chunk;
	    }).on('end',function () {
		buf = buf.join('');
		reply(resolver, buf, res);
            }).on('error', function (error) {
		reply(resolver, error);
            });
	}).on('error',function (error) {
            reply(resolver, error);
	}).end(data, options.encoding);
    };
} else {
    Xhr = function (method, path, options, data, resolver) {
	"use strict";

	var ajax = require('ajax'),
	    buf;

	ajax(method, path, options, data).when(function (res) {
	    buf = res.responseText;
	    reply(resolver, buf, res);
	}, function (error) {
	    reply(resolver, error);
	});
    };
}

function reply(resolver, data, res) {
    var error;
    
    res = typeof res === 'object' ? res : {
	status: res || -1
    };

    res.status = res.statusCode ? res.statusCode : res.status;

    if (typeof data === 'string') {
	try {
	    data = JSON.parse(data);
	} catch (e) { /* pass data as is */ }
    }

    // insert status code
    if(!data) data = {code:res.status};
    else if(typeof data === 'object' && !data.code) data.code = res.status;

    // success
    if (0 < res.status && 399 > res.status) {
	if(typeof resolver === 'function'){
	    return resolver(undefined,data,res);
	}
	
	return resolver.resolve(data, res);
    }

    // failure
    error = data;
    if(typeof resolver === 'function'){
	if(!(error instanceof Error)){
	    if(typeof error === 'object'){
		error = new Error(JSON.stringify(data));
		for(var k in data)
		    error[k] = data[k];
	    } else {
		error = new Error(data);
	    }
	}
	
	return resolver(error, res);
    }
    
    return resolver.reject(error, res);
}

module.exports = Xhr;
