var Arango = require('../arango'),
    url = require('urlparser'),
    utils = require('../utils');

/* pull in dependencies */
require('./document');
require('./admin');

function ActionAPI(db) {
    var submit = {};

    return {
        /* Defines an action */
        "define": function(o,f,reload) {

            var inject = f && typeof f === 'function';

            if(typeof o !== 'object')
                throw new Error("Action object unspecified");

            if(!o.name)
                throw new Error("Action name missing");

            if(!o.url) 
                throw new Error("Action url missing");

            if(o.data && typeof o.data !== 'object')
                throw new Error("Invalid action data type");

            var method = o.method ? o.method.toLowerCase() : 'get';

            var options = {};
            /* Pass through user defined xhr options                  */
            /* Note: options.timeout sets a request timeout in ms     */
            /* options.headers sets ajax headers such as content-type */
            if(o.options) utils.extend(true,options,o.options);

            /* if a function was specified register a new action */
            if(inject){
                var route = {action:{callback:f.toString()}};

                route.url = {
                    match: o.match || '/'+url.parse(o.url).path.base, 
                    methods: [method.toUpperCase()]
                }; 

                /* inject the function as action callback */
                db.use(":_routing").document.create(route).then(function(res){
                    submit[o.name].route = res._id;
                    /* reload routes */
                    if(reload === true) db.admin.routesReload();
                },function(error){
                    throw new Error("Failed to inject action: " + error);
                });
            }   

            function action() {
                var args = Array.prototype.slice.call(arguments);
                
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
                
                /* apply request options (before callback) */
                if(typeof args[args.length-1] === 'function')
                    args.push(args.splice(args.length-1,1,options)[0]);
                else args.push(options);

                /* note: o.result, o.error are called whenever the promise has been fulfiled or rejected. */
                /* However callback passed as argument has precedence. Unspecified result/error handlers   */
                /* are ignored so that users can specify their own methods when invoking the action........*/
                /* options, path, data, callback */
                return db[method].apply(db,args).then(o.result,o.error);
            }

            /* bind this action to a name */
            submit[o.name] = action; 
        },
        /* Executes an action and returns a promise */
        "submit": function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift();

            return submit[name].apply(this,args);
        },
        "undefine": function(name) {
            if(!submit[name]) 
                throw new Error("No such action: " + name);

            if(submit[name].route) {
                db.document.delete(submit[name].route, {waitForSync : true}).done();
            }    
            

            delete submit[name];
        },
        "getActions": function() {
            var result={};
            Object.keys(submit).forEach(function(key){
                result[key] = submit[key];
            })
            return result;
        }
    }
}


module.exports = Arango.api('action',ActionAPI);
