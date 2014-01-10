
var url = require('./url'),
	utils = require('./utils'),
	base64 = require('base64'),
	Arango = require('./arango');

/* Connection factory */ 
function Connection(){
    var options = {};
 
    for(var i = 0; arguments[i]; i++) {
        if(typeof arguments[i] === 'object')
            utils.extend(true,options,arguments[i]);
        else if(typeof arguments[i] === 'string')
            utils.extend(true,options,url.path2db(arguments[i]));
    }

    return new Arango(options);
}

module.exports = {Connection: Connection, base64: base64};