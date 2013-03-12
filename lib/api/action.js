/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
 
function closure(db){
    "use strict"

    var utils = require('../utils');
    var submit = {};

    var ActionAPI = {
        /* Defines an action */
        "define": function(o) {
            if(typeof o !== 'object')
                throw new Error("Action object unspecified");

            if(!o.name)
                throw new Error("Action name missing");

            if(!(o.url = utils.parseUrl(o.url))) 
                throw new URIError("Action url invalid");

            if(o.data && typeof o.data !== 'object')
                throw new Error("Invalid action data type");

            var options = {};

            /* setup xhr options */
            var method = o.method ? o.method.toLowerCase() : 'get';
            options.protocol = o.url.protocol ? o.url.protocol : db.server.protocol;
            options.hostname = o.url.hostname ? o.url.hostname : db.server.hostname;
            options.port = o.url.port ? parseInt(o.url.port,10) : db.server.port; 

            /* Pass through user defined xhr options                  */
            /* Note: options.timeout sets a request timeout in ms     */
            /* options.headers sets ajax headers such as content-type */
            if(o.options) utils.extend(true,options,o.options); 

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
                args.unshift(o.url.path ? (o.url.path.string ? o.url.path.string : o.url.path) :'');

                /* note: o.result, o.error are called whenever the promise has been fulfiled or rejected. */
                /* However callback passed as argument has precedence. Unspecified result/error handlers   */
                /* are ignored so that users can specify their own methods when invoking the action........*/
                /* options, path, data, callback */
                return db[method].apply(this,args).then(o.result,o.error);
            }

            /* bind this action to a name */
            submit[o.name] = action;

            return this; 
        },
        /* Executes an action and returns a promise */
        "invoke": function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift();

            /* calls action handler, returns a promise */
            return submit[name].apply(db,args);
        }
    }    

    return ActionAPI;
}

module.exports = closure;