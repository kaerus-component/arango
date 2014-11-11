/*global require exports */
var api = require('../api'),
    urlparser = require('urlparser'),
    utils = require('../../utils');

/* pull in dependencies */
api.use(
    [
	require('../document'),
	require('../admin')
    ]
);


/**
 * The api module "action" to define user actions in ArangoDB.
 *
 * @module Arango
 * @submodule action
 * @class action
 * @extends Arango
 *
 **/
function ActionAPI(db) {
    var submit = {};

    return {
        /**
         * Defines an action.
         *
         * @param {Object} o        - Object containing the action mandatory and optional settings.
         * @param {String} o.name       - The name of the action.
         * @param {String} o.url        - The url of the action.
         * @param {String} o.method     - The method of the action.
         * @param {String} [o.result]   - A function called if a result has been returned.
         * @param {String} [o.error]    - A function called if an error occured.
         * @param {String} [f]      - A function to be executed on the server.
         * @param {String} [reload] - If true, the routes will be reloaded.

         * @return {None}
         * @method define
         */
        "define": function(o, f, reload) {
	    var ret = db.Promise(); // our return value

            var inject = f && typeof f === 'function';
	    
            if (typeof o !== 'object')
                return ret.reject(Error("Action object unspecified"));

            if (!o.name)
                return ret.reject(Error("Action name missing"));

            if (!o.url)
                return ret.reject(Error("Action url missing"));

            if (o.data && typeof o.data !== 'object')
                return ret.reject(Error("Invalid action data type"));

            var method = o.method ? o.method.toLowerCase() : 'get';

	    /* bind this action to a name */
            submit[o.name] = action;
	    
            /* if a function was specified register a new action */
            if (inject) {
                var route = {
                    action: {
                        callback: f.toString()
                    }
                };

                route.url = {
                    match: o.match || '/' + urlparser.parse(o.url).path.base,
                    methods: [method.toUpperCase()]
                };

                /* inject the function as action callback */
                db.use(":_routing").document.create(route, {
                    waitForSync: true
                }).then(function(injected) {
                    submit[o.name].route = injected._id;

		    /* reload routes */
                    if (reload === true) {
			db.admin.routesReload().then(function(reloaded){
			    ret.fulfill(reloaded);
			}, ret.reject);
		    } else ret.fulfill(injected);
                }, ret.reject);
            } else {
		ret.fulfill(o.name);
	    }

            function action() {
                var args = Array.prototype.slice.call(arguments);

                /* Extend with o.data */
                if (o.data) {
                    if (args[0] && typeof args[0] !== 'function') {
                        if (Array.isArray(args[0])) {
                            args[0].concat(o.data);
                        } else if (typeof args[0] === 'object') {
                            args[0] = utils.extend(true, o.data, args[0]);
                        }
                    } else {
                        args.unshift(o.data);
                    }
                }

                /* insert path */
                args.unshift(o.url);

                /* note: o.result, o.error are called whenever the promise has been fulfiled or rejected. */
		if(o.result || o.error)
                    return db[method].apply(db, args).then(o.result, o.error);

		return db[method].apply(db, args);
            }

	    return ret;
        },
        /**
         * Executes an action and returns a promise.
         *
         * @param {String} actionName   - Name of the action to be executed.
         * @param {Object} [data]       - Data passed to the action.
         * @param {Function} [callback] - Callback function.

         * @return{Promise}
         * @method submit
         */
        "submit": function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift();

            return submit[name].apply(this, args);
        },
        /**
         * deletes an action and its route if existing.
         *
         * @param {String} actionName   - Name of the action to be executed.
         *
         * @return{Promise}
         * @method undefine
         */
        "undefine": function(name) {
	    var ret = db.Promise();
	    
            if (!submit[name])
                ret.reject(Error("No such action: " + name));

            if (submit[name].route) {
                db.document.delete(submit[name].route, {
                    waitForSync: true
                }).then(function(){
		    delete submit[name];
		    
		    ret.fulfill(name);
		},ret.reject);
            } else {
		delete submit[name];
		
		ret.fulfill(name);
	    }
	    
	    return ret;
        },
        /**
         * returns all actions currently available.
         *
         * @return {Object}
         * @method getActions
         */
        "getActions": function() {
            var result = {};
            Object.keys(submit).forEach(function(key) {
                result[key] = submit[key];
            })
            return result;
        }
    }
}

exports.action = ActionAPI;
