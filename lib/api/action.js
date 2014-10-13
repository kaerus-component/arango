var Arango = require('../arango'),
  urlparser = require('urlparser'),
  utils = require('../utils');

/* pull in dependencies */
require('./document');
require('./admin');


/**
 * The api module "action" to define user actions in ArangoDB.
 *
 * @class action
 * @module arango
 * @submodule action
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
    "define": function (o, f, reload) {

      var inject = f && typeof f === 'function';

      if (typeof o !== 'object')
        throw new Error("Action object unspecified");

      if (!o.name)
        throw new Error("Action name missing");

      if (!o.url)
        throw new Error("Action url missing");

      if (o.data && typeof o.data !== 'object')
        throw new Error("Invalid action data type");

      var method = o.method ? o.method.toLowerCase() : 'get';

      var options = {};
      /* Pass through user defined xhr options                  */
      /* Note: options.timeout sets a request timeout in ms     */
      /* options.headers sets ajax headers such as content-type */
      if (o.options) utils.extend(true, options, o.options);

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
        }).then(function (res) {
            submit[o.name].route = res._id;
            /* reload routes */
            if (reload === true) db.admin.routesReload();
          }, function (error) {
            throw new Error("Failed to inject action: " + error);
          });
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

        /* apply request options (before callback) */
        if (typeof args[args.length - 1] === 'function')
          args.push(args.splice(args.length - 1, 1, options)[0]);
        else args.push(options);

        /* note: o.result, o.error are called whenever the promise has been fulfiled or rejected. */
        /* However callback passed as argument has precedence. Unspecified result/error handlers   */
        /* are ignored so that users can specify their own methods when invoking the action........*/
        /* options, path, data, callback */
        return db[method].apply(db, args).then(o.result, o.error);
      }

      /* bind this action to a name */
      submit[o.name] = action;
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
    "submit": function () {
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
    "undefine": function (name) {
      if (!submit[name])
        throw new Error("No such action: " + name);

      if (submit[name].route) {
        db.document.delete(submit[name].route, {
          waitForSync: true
        }).done();
      }


      delete submit[name];
    },
    /**
     * returns all actions currently available.
     *
     * @return {Object}
     * @method getActions
     */
    "getActions": function () {
      var result = {};
      Object.keys(submit).forEach(function (key) {
        result[key] = submit[key];
      })
      return result;
    }
  }
}


module.exports = Arango.api('action', ActionAPI);
