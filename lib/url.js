var utils = require('./utils'),
    urlParser = require('urlparser');

function path2db(path) {
    var o = {}, c = urlParser.parse(path);

    if (c.host) {
	o._server = {};
	utils.extend(o._server, c.host);
    }

    if (c.path) {
	if (c.path.base) o._name = c.path.base;
	if (c.path.name) o._collection = c.path.name;
    }

    return o;
}

// build url options from object
function options(o) {

    if (typeof o !== 'object') return '';

    return Object.keys(o).reduce(function (a, b, c) {
	c = b + '=' + o[b];
	return !a ? '?' + c : a + '&' + c;
    }, '');
}

// set if-match / if-none-match headers when options.match
function ifMatch(id, options) {
    var headers, rev;

    if (options.match !== undefined) {
	rev = JSON.stringify(options.rev || id);

	if (options.match) headers = {
	    headers: {
		"if-match": rev
	    }
	};
	else headers = {
	    headers: {
		"if-none-match": rev
	    }
	};
	// these options are not needed anymore
	delete options.match;
	delete options.rev;
    }

    return headers;
}

module.exports = {
    path2db: path2db,
    options: options,
    ifMatch: ifMatch
};
