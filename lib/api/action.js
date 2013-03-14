/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

function closure(db){
    "use strict"

    var utils = require('../utils'),
        parse = require('url'),
        submit = {};

    var ActionAPI = {
        /* Defines an action */
        "define": function(o,f,reload) {
            var ret = db.promise(), 
                inject = f && typeof f === 'function';

            if(typeof o !== 'object')
                ret.reject("Action object unspecified");

            if(!o.name)
                ret.reject("Action name missing");

            if(!o.url) 
                ret.reject("Action url missing");

            if(o.data && typeof o.data !== 'object')
                ret.reject("Invalid action data type");

            var method = o.method ? o.method.toLowerCase() : 'get';

            var options = {};
            /* Pass through user defined xhr options                  */
            /* Note: options.timeout sets a request timeout in ms     */
            /* options.headers sets ajax headers such as content-type */
            if(o.options) utils.extend(true,options,o.options);

            /* if a function was specified register a new action */
            if(inject){
                var route = {action:{callback:f.toString()}};

                inject = true;
 
                route.url = {
                    match: o.match || '/'+parse(o.url).path.toString(), 
                    methods: [method.toUpperCase()]
                }; 

                /* inject the function as arangodb action callback */
                db.use("_routing").document.create(route).then(function(res){
                    submit[o.name].route = res._id;
                    /* reload routes */
                    if(reload === true) db.admin.routesReload();
                    /* user has to reload routes */
                    ret.fulfill({submit:action,route:res._id});
                },function(error){
                    ret.reject("Failed to inject action: " + error);
                });
            }   

            function action() {
                var args = Array.prototype.splice.call(arguments);

                /* request options */
                args.unshift(options);

                /* Extend with o.data */
                if(o.data) {
                    if(args[0] && typeof args[0] !== 'function'){
                        if(Array.isArray(args[0])) {
                            args[0].concat(o.data);
                        } else if(typeof args[0] === 'object') {
                            args[0] = utils.extend(true,o.data,args[0]);
                        }     
                    } else {
                        args.unshift(o.data);
                    }        
                }    
                /* insert path */
                args.unshift(o.url);

                /* note: o.result, o.error are called whenever the promise has been fulfiled or rejected. */
                /* However callback passed as argument has precedence. Unspecified result/error handlers   */
                /* are ignored so that users can specify their own methods when invoking the action........*/
                /* options, path, data, callback */
                return db[method].apply(this,args).then(o.result,o.error);
            }

            /* bind this action to a name */
            submit[o.name] = action;

            if(!inject) ret.fulfill({submit:action});

            return ret; 
        },
        /* Executes an action and returns a promise */
        "submit": function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift();

            /* calls action handler, returns a promise */
            return submit[name].apply(db,args);
        },
        "undefine": function(name) {
            if(!submit[name]) 
                throw new Error("No such action: " + name);

            if(submit[name].route)
                db.document.delete(submit.route).then(undefined,function(error){
                    throw new Error("Failed to revoke action " + name + ": " + error);
                });
            
            delete submit[name];

            return this;
        }
    }    

    return ActionAPI;
}

module.exports = closure;