var utils = require('./utils'),
	urlParser = require('urlparser');
	
function path2db(path){
    var o = {}, c = urlParser.parse(path);
    if(c.host) {
        o._server = {};
        utils.extend(o._server,c.host);
    }
    
    if(c.path){
        if(c.path.base) o._name = c.path.base;
        if(c.path.name) o._collection = c.path.name;
    }

    return o;
}

module.exports = {path2db: path2db};