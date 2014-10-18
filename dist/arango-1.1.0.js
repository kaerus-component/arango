;(function(){
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("kaerus-component-microTask/index.js", function(module, exports, require){

(function(root){
    "use strict"

    try {root = global} catch(e){ try {root = window} catch(e){} };

    var defer, deferred, observer, queue = [];
    
    if(root.process && typeof root.process.nextTick === 'function'){
        /* avoid buggy nodejs setImmediate */ 
        if(root.setImmediate && root.process.versions.node.split('.')[1] > '10') defer = root.setImmediate;
        else defer = root.process.nextTick;
    } else if(root.vertx && typeof root.vertx.runOnLoop === 'function') defer = root.vertx.RunOnLoop;
    else if(root.vertx && typeof root.vertx.runOnContext === 'function') defer = root.vertx.runOnContext;
    else if(observer = root.MutationObserver || root.WebKitMutationObserver) {
        defer = (function(document, observer, drain) {
            var el = document.createElement('div');
                new observer(drain).observe(el, { attributes: true });
                return function() { el.setAttribute('x', 'y'); };
        }(document, observer, drain));
    }
    else if(typeof root.setTimeout === 'function' && (root.ActiveXObject || !root.postMessage)) {
        /* use setTimeout to avoid buggy IE MessageChannel */
        defer = function(f){ root.setTimeout(f,0); }
    }
    else if(root.MessageChannel && typeof root.MessageChannel === 'function') {
        var fifo = [], channel = new root.MessageChannel();
        channel.port1.onmessage = function () { (fifo.shift())() };
        defer = function (f){ fifo[fifo.length] = f; channel.port2.postMessage(0); };
    } 
    else if(typeof root.setTimeout === 'function') defer = function(f){ root.setTimeout(f,0); } 
    else throw new Error("No candidate for microtask defer()")

    deferred = head;

    function microtask(func,args,context){
        if( typeof func !== 'function' ) throw new Error("microtask: func argument is not a function!");
        
        deferred(func,args,context);
    }

    function head(func,args,context){
        queue[queue.length] = [func,args,context]; 
        deferred = tail;
        defer(drain); 
    }

    function tail(func,args,context){
        queue[queue.length] = [func,args,context];
    }

    function drain(){   
        var q;
        for(var i = 0; i < queue.length; i++){
            q = queue[i];
            try {
                q[0].apply(q[2],q[1]);
            } catch(e) {
                defer(function() {
                    throw e;
                });
            }
        }
        deferred = head;
        queue = [];
    }
    
    if(module && module.exports) module.exports = microtask;
    else if(typeof define ==='function' && define.amd) define(microtask); 
    else root.microtask = microtask;
}(this));
});
require.register("kaerus-component-uP/index.js", function(module, exports, require){
/*global require, global, window */

/**
 * Provides A+ v1.1 compliant promises.
 * @module Promise
 * @name microPromise
 * @main Promise
 */

var task = require('microtask'); // nextTick shim

(function(root){
    "use strict";

    try {root = global;} catch(e){ try {root = window;} catch(f){} }

    var slice = Array.prototype.slice,
        isArray = Array.isArray;

    var PENDING   = 0,   
	FULFILLED = 1, 
	REJECTED  = 2;  
    
    /**
     * Promise constructor
     * 
     * @param {Object} [mixin] - Mixin promise into object
     * @param {Function} [resolver] - Resolver function(resolve,reject,progress,timeout) 
     * @return {Object} Promise
     * @api public
     */
    function Promise(p){
        // object mixin
        if(p && typeof p === 'object'){
            for(var k in Promise.prototype)
		p[k] = Promise.prototype[k];
	    p._promise = {_chain:[]};

	    return p;
        }
	
	// create new instance
        if(!(this instanceof Promise))
            return new Promise(p);

	this._promise = {_chain: []};

        // resolver callback
        if(typeof p === 'function') {
            p(this.resolve,this.reject,this.progress,this.timeout);
        }
    }

    /**
     * Promise resolver
     * 
     * @param {Object} [Promise|Object|Function]  
     * @param {Function} [resolver] - Resolver function(resolve,reject,progress,timeout) 
     * @return {Object} Promise
     * @api public
     */
    Promise.resolver = function(p,r){

	if(typeof r === 'function') {
	    
	    if(Promise.thenable(p)){
		return r(p.resolve,p.reject,p.progress,p.timeout);
	    }
	    else if(p) {
		return Promise.resolver(Promise(p),r);
	    }
	    else return new Promise(r);
	}
	
	return new Promise(p);
    };

    
    /**
     * Helper for identifying a promise-like objects or functions
     * 
     * @param {Object} p - Object or Function to test
     * @return {Boolean} - Returns true if thenable or else false
     */
    Promise.thenable = function(p){
	var then;
	
	if(p && (typeof p === 'object' || typeof p === 'function')){
	    try { then = p.then; } catch (e) { return false; };
	}
	
	return (typeof then === 'function');
    };

    
    /**
     * Wrap a promise around function or constructor
     *
     * Example: wrap an Array
     *      p = Promise();
     *      c = p.wrap(Array);
     *      c(1,2,3); // => calls Array constructor and fulfills promise
     *      p.resolved; // => [1,2,3]
     *
     * @return {Function} function to wrap
     * @throws {Error} not wrappable
     * @api public
     */
    Promise.wrap = function(func){
        var p = new Promise();

	if(!func) throw Error("Nothing to wrap!");
	
        return function(){
            var args = slice.call(arguments), ret;

            if(Promise.thenable(func) && typeof func.resolve === 'function'){
		func.resolve(args).then(p.fulfill, p.reject, p.progress, p.timeout);
            } else if(typeof func.constructor === 'function'){
                try{
                    ret = new func.constructor.apply(p,args);
                    p.resolve(ret);
                } catch(err) {
                    p.reject(err);
                }
            } else if(typeof func === 'function'){
		try {
		    ret = func.apply(p,args);
		    p.resolve(ret);
		} catch(err){
		    p.reject(err);
		}
	    } else throw Error("not wrappable");

            return p;
        };
    };

    
    /**
     * Deferres a task and returns a pending promise fulfilled with the return value from task.
     * The task may also return a promise itself which to wait on.
     *
     * Example: Make readFileSync async
     *      fs = require('fs');
     *      var asyncReadFile = Promise().defer(fs.readFileSync,'./index.js','utf-8');
     *      asyncReadFile.then(function(data){
     *          console.log(data)
     *      },function(error){
     *          console.log("Read error:", error);
     *      });
     *
     * @return {Object} - returns a pending promise
     * @api public
     */
    Promise.defer = function(){
        var args = slice.call(arguments),
            func = args.shift(),
            wrap = Promise.wrap(func);

	function deferred(){
	    task(wrap,args);
	}
	task(wrap,args);

        return wrap;
    };

    
    /**
     * Make a synchronous nodejs function asynchrounous.
     *
     * Example: make readFile async
     *      fs = require('fs');
     *      var asyncReadFile = Promise.async(fs.readFile);
     *      asyncReadFile('package.json','utf8').then(function(data){
     *          console.log(data);
     *      },function(error){
     *          console.log("Read error:", error);
     *      });
     *
     * @return {Object} promise
     * @api public
     */
    Promise.async = function(func){
	
	var wrap = Promise.wrap(func);
	
	function callback(err,ret){ if(err) throw err; return ret; }
	
        return function(){
	    var args = slice.call(arguments);

	    args.push(callback);

	    task(wrap,args);
	    
	    return wrap; 
	};
    };
    
    /**
     * Check if promise is pending
     * 
     * @return {Boolean} - Returns true if pending or else false
     */
    Promise.prototype.isPending = function(){
	return !this._promise._state;
    };

    /**
     * Check if promise is fulfilled
     * 
     * @return {Boolean} - Returns true if pending or else false
     */
    Promise.prototype.isFulfilled = function(){
	return this._promise._state === FULFILLED;
    };

    /**
     * Check if promise is rejeced
     * 
     * @return {Boolean} - Returns true if pending or else false
     */ 
    Promise.prototype.isRejected = function(){
	return this._promise._state === REJECTED;
    };

    /**
     * Check if promise has resolved
     * 
     * @return {Boolean} - Returns true if pending or else false
     */ 
    Promise.prototype.hasResolved = function(){
	return !!this._promise._state;
    };

    /**
     * Get value if promise has been fulfilled
     * 
     * @return {Boolean} - Returns true if pending or else false
     */
    Promise.prototype.valueOf = function(){
	return this.isFulfilled() ? this._promise._value : undefined;
    };

    /**
     * Get reason if promise has rejected
     * 
     * @return {Boolean} - Returns true if pending or else false
     */
    Promise.prototype.reason = function(){
	return this.isRejected() ? this._promise._value : undefined;
    };
    
    /**
     * Attaches callback,errback,notify handlers and returns a promise
     *
     * Example: catch fulfillment or rejection
     *      var p = Promise();
     *      p.then(function(value){
     *          console.log("received:", value);
     *      },function(error){
     *          console.log("failed with:", error);
     *      });
     *      p.fulfill('hello world!'); // => 'received: hello world!'
     *
     * Example: chainable then clauses
     *      p.then(function(v){
     *          console.log('v is:', v);
     *          if(v > 10) throw new RangeError('to large!');
     *          return v*2;
     *      }).then(function(v){
     *          // gets v*2 from above
     *          console.log('v is:', v)
     *      },function(e){
     *          console.log('error2:', e);
     *      });
     *      p.fulfill(142); // => v is: 142, error2: [RangeError:'to large']
     *
     * Example: undefined callbacks are ignored
     *      p.then(function(v){
     *          if(v < 0) throw v;
     *          return v;
     *      }).then(undefined,function(e){
     *          e = -e;
     *          return e;
     *      }).then(function(value){
     *          console.log('we got:', value);
     *      });
     *      p.fulfill(-5); // => we got: 5
     *
     * @param {Function} onFulfill callback
     * @param {Function} onReject errback
     * @param {Function} onNotify callback
     * @return {Object} a decendant promise
     * @api public
     */
    Promise.prototype.then = function(f,r,n){
        var p = new this.constructor();
	  
	this._promise._chain.push([p,f,r,n]);

	if(this._promise._state) task(traverse,[this._promise]);

        return p;
    };

    
    /**
     * Like `then` but spreads array into multiple arguments
     *
     * Example: Multiple fulfillment values
     *      p = Promise();
     *      p.fulfill([1,2,3])
     *      p.spread(function(a,b,c){
     *          console.log(a,b,c); // => '1 2 3'
     *      });
     *
     * @param {Function} onFulfill callback
     * @param {Function} onReject errback
     * @param {Function} onNotify callback
     * @return {Object} a decendant promise
     * @api public
     */
    Promise.prototype.spread = function(f,r,n){
        function s(v,a){
            if(!isArray(v)) v = [v];
            return f.apply(f,v.concat(a));
        }

        return this.then(s,r,n);
    };

    
    /**
     * Terminates chain of promises, calls onerror or throws on unhandled Errors
     *
     * Example: capture error with done
     *      p.then(function(v){
     *          console.log('v is:', v);
     *          if(v > 10) throw new RangeError('to large!');
     *          return v*2;
     *      }).done(function(v){
     *          // gets v*2 from above
     *          console.log('v is:', v)
     *      });
     *
     *      p.fulfill(142); // => v is: 142, throws [RangeError:'to large']
     *
     * Example: define onerror handler defined on promise
     *      p.onerror = function(error){ console.log("Sorry:",error) };
     *      p.then(function(v){
     *          console.log('v is:', v);
     *          if(v > 10) throw new RangeError('to large!');
     *          return v*2;
     *      }).done(function(v){
     *          // gets v*2 from above
     *          console.log('v is:', v)
     *      });
     *      p.fulfill(142); // => v is: 142, "Sorry: [RangeError:'to large']"
     *
     * @param {Function} onFulfill callback
     * @param {Function} onReject errback
     * @param {Function} onNotify callback
     * @api public
     */
    Promise.prototype.done = function(f,r,n){
	
        var self = this, p = this.then(f,catchError,n);

        function catchError(e){
            task(function(){
		if(typeof r === 'function') r(e);
                else if(typeof self.onerror === 'function'){
                    self.onerror(e);
                } else if(Promise.onerror === 'function'){
                    Promise.onerror(e);
                } else throw e;
            });
        }
    };

    /** 
     * Terminates chain, invokes a callback or throws Error on error 
     *
     * @param {Function} callback - Callback with value or Error object on error.
     * @api public
     */
    Promise.prototype.end = function(callback){
	
	this.then(callback,function(e){
	    if(!(e instanceof Error)){
		e = new Error(e);
	    }
	    
	    if(typeof callback === 'function') callback(e);
	    else throw e;
	});
    };


    /**
     * Terminates chain and catches errors
     *
     *
     * Example: Catch error
     *      p = Promise();
     *      p.then(function(v){
     *          console.log("someone said:", v);  //-> "Hello there"
     *          return "boom!";
     *        })
     *       .then(function(v){ if(v === 'boom!') throw "something bad happened!";})
     *       .catch(function(e){
     *          console.log("error:",e);
     *       });
     *      p.resolve("Hello there");
     *
     * @param {Function} onError callback
     * @return undefined 
     * @api public
     */
    Promise.prototype.catch = function(error){
	this.done(undefined,error);
    };
    /**
     * Fulfills a promise with a `value`
     *
     *
     *  Example: fulfillment
     *      p = Promise();
     *      p.fulfill(123);
     *
     *  Example: multiple fulfillment values in array
     *      p = Promise();
     *      p.fulfill([1,2,3]);
     *      p.resolved; // => [1,2,3]
     *
     *  Example: Pass through opaque arguments (experimental)
     *      p = Promise();
     *      p.fulfill("hello","world");
     *      p.then(function(x,o){
     *          console.log(x,o[0]); // => "hello world"
     *          o.push("!");
     *          return "bye bye";
     *      }).then(function(x,o){
     *          console.log(x,o.join('')); // => "bye bye world!"
     *      })
     *
     * @param {Object} value
     * @return {Object} promise
     * @api public
     */
    Promise.prototype.fulfill = function(value,opaque){

	if(!this._promise._state) {
	    this._promise._state = FULFILLED;
	    this._promise._value = value;
	    this._promise._opaque = opaque;
	    
	    task(traverse,[this._promise]);
	}
	
        return this;
    };


    /**
     * Rejects promise with a `reason`
     *
     *  Example:
     *      p = Promise();
     *      p.then(function(ok){
     *         console.log("ok:",ok);
     *      }, function(error){
     *         console.log("error:",error);
     *      });
     *      p.reject('some error'); // outputs => 'error: some error'
     *
     * @param {Object} reason
     * @return {Object} promise
     * @api public
     */
    Promise.prototype.reject = function(reason,opaque){
	
	if(!this._promise._state){
	    this._promise._state = REJECTED;
	    this._promise._value = reason;
	    this._promise._opaque = opaque;
	    
	    task(traverse,[this._promise]);
	}
	
        return this;
    };

    function transition(state,value,opaque){
        if(!this._promise._state && state){

	    this._promise._state = state;
	    this._promise._value = value;
	    this._promise._opaque = opaque;
	    
            task(traverse,[this._promise]);
        }
    }

    /**
     * Resolves a promise and performs unwrapping if necessary  
     *
     *
     *  Example: resolve a literal
     *      p = Promise();
     *      p.resolve(123); // fulfills promise to 123
     *
     *  Example: resolve value from pending promise
     *      p1 = Promise();
     *      p2 = Promise();
     *      p1.resolve(p2);
     *      p2.fulfill(123) // => p1 fulfills to 123
     *
     * @param {Object} value - Promise or literal
     * @return {Object} promise
     * @api public
     */
    Promise.prototype.resolve = function(x,o){
        var then, z, p = this;

        if(!this._promise._state){
            if(x === p) p.reject(new TypeError("Promise cannot resolve itself!"));

            if(x && (typeof x === 'object' || typeof x === 'function')){
                try { then = x.then; } catch(e){ p.reject(e); }
            }

            if(typeof then !== 'function'){
		this.fulfill(x,o);
            } else if(!z){
                try {
                    then.apply(x,[function(y){
                        if(!z) {
                            p.resolve(y,o);
                            z = true;
                        }
                    },function(r){
                        if(!z) {
                            p.reject(r);
                            z = true;
                        }
                    }]);
                } catch(e) {
                    if(!z) {
			p.reject(e);
			z = true;
                    }
                }
            }
        }

        return this;
    };


    /**
     * Notifies attached handlers
     *
     *  Example:
     *      p = Promise();
     *      p.then(function(ok){
     *         console.log("ok:",ok);
     *      }, function(error){
     *         console.log("error:",error);
     *      }, function(notify){
     *         console.log(notify);
     *      });
     *      p.progress("almost done"); // optputs => 'almost done'
     *      p.reject('some error'); // outputs => 'error: some error'
     *
     * @param {Object} arguments
     * @api public
     */
    Promise.prototype.progress = function(){
        var notify, tuples = this._promise._chain;

	if(!tuples) return;

	for(var i = 0, l = tuples.length; i < l; i++){
            if(typeof (notify = tuples[i][NOTIFY]) === 'function')
                notify.apply(this,arguments);
        }
    };

    /**
     * Timeout a pending promise and invoke callback function on timeout.
     * Without a callback it throws a RangeError('exceeded timeout').
     *
     * Example: timeout & abort()
     *      var p = Promise();
     *      p.attach({abort:function(msg){console.log('Aborted:',msg)}});
     *      p.timeout(5000);
     *      // ... after 5 secs ... => Aborted: |RangeError: 'exceeded timeout']
     *
     * Example: cancel timeout
     *      p.timeout(5000);
     *      p.timeout(null); // timeout cancelled
     *
     * @param {Number} time - timeout value in ms or null to clear timeout
     * @param {Function} callback - optional timeout function callback
     * @throws {RangeError} If exceeded timeout
     * @return {Object} promise
     * @api public
     */
    Promise.prototype.timeout = function(msec,func){
        var p = this;

        if(msec === null) {
            if(this._promise._timeout)
		root.clearTimeout(this._promise._timeout);
	    
            this._promise._timeout = null;
        } else if(!this._promise._timeout){
            this._promise._timeout = root.setTimeout(onTimeout,msec);
        }

        function onTimeout(){
            var e = new RangeError("exceeded timeout");
            if(!this._promise._state) {
                if(typeof func === 'function') func(p);
                else if(typeof p.onerror === 'function') p.onerror(e);
                else throw e;
            }
        }

        return this;
    };

    /**
     * Resolves promise to a nodejs styled callback function(err,ret) 
     * and passes the callbacks return value down the chain.
     *
     * Example:
     *      function cb(err,ret){
     *        if(err) console.log("error(%s):",err,ret);
     *        else console.log("success:", ret);
     *
     *        return "nice";
     *      }
     *
     *      p = Promise();
     *      p.callback(cb)
     *       .then(function(cbret){ 
     *         console.log("callback says:", cbret); //-> callback says: nice 
     *      });
     *
     *      p.fulfill("ok"); //-> success: ok
     *
     * @param {Function} callback - Callback function
     * @return {Object} promise
     * @api public
     */
    Promise.prototype.callback = function(callback){
        return this.then(function(value,opaque){
            return callback(null,value,opaque);
        },function(reason,opaque){
	    if(!(reason instanceof Error))
		reason = new Error(reason);
	    
            return callback(reason);
        },function(progress){
            return callback(0,progress);
        });
    };  
    
    /**
     * Joins promises and collects results into an array.
     * If any of the promises are rejected the chain is also rejected.
     *
     * Example: join with two promises
     *      a = Promise();
     *      b = Promise();
     *      c = Promise();
     *      a.join([b,c]).spread(function(a,b,c){
     *          console.log(a,b,c);
     *      },function(err){
     *          console.log('error=',err);
     *      });
     *      b.fulfill('world');
     *      a.fulfill('hello');
     *      c.fulfill('!'); // => 'hello world !''
     *
     * @param {Array} promises
     * @return {Object} promise
     * @api public
     */
    Promise.prototype.join = function(j){
        var p = this,
            y = [],
            u = new Promise().resolve(p).then(function(v){y[0] = v;});

        if(arguments.length > 1) {
            j = slice.call(arguments);
        }

        if(!isArray(j)) j = [j];

	function stop(error){
	    u.reject(error);
	}
	
        function collect(i){
            j[i].then(function(v){
                y[i+1] = v;
            }).catch(stop);

            return function(){return j[i];};
        }

        for(var i = 0; i < j.length; i++){
            u = u.then(collect(i));
        }

        return u.then(function(){return y;});
    };

    /* Resolver function, yields a promised value to handlers */
    function traverse(_promise){
	var l, tuple = _promise._chain;
	
	if(!tuple.length) return;

	var t,p,h,v = _promise._value;
	
        while((t = tuple.shift())) {
	    p = t[0];
            h = t[_promise._state];

            if(typeof h === 'function') {
                try {
                    v = h(_promise._value,_promise._opaque);
		    p.resolve(v,_promise._opaque);
                } catch(e) {
		    p.reject(e);
                }
            } else {
		p._promise._state = _promise._state;
		p._promise._value = v;
		p._promise._opaque = _promise._opaque;
		
		task(traverse,[p._promise]);
            }
        }
    }

    /* expose this module */
    if(module && module.exports) module.exports = Promise;
    else if(typeof define ==='function' && define.amd) define(Promise);
    else root.Promise = Promise;
}(this));

});
require.register("kaerus-component-ajax/index.js", function(module, exports, require){
var urlParser = require('urlparser');

/* default request timeout */
var DEFAULT_TIMEOUT = 5000;

/* Get browser xhr object */
var Xhr = (function() {  
    if(window.XDomainRequest) {
        return window.XDomainRequest;
    } else if(window.XMLHttpRequest) {
        return window['XMLHttpRequest'];
    } else if(window.ActiveXObject) {
        ['Msxml2.XMLHTTP.6.0','Msxml2.XMLHTTP.3.0','Microsoft.XMLHTTP'].forEach(function(x) {
            try { return window.ActiveXObject(x) } catch (e) {}
        }); 
        throw new Error('XHR ActiveXObject failed');
    } 
    throw new Error('XHR support not found');
}());

/* ReadyState status codes */
var XHR_CLOSED = 0,
    XHR_OPENED = 1,
    XHR_SENT = 2,
    XHR_RECEIVED = 3,
    XHR_DONE = 4; 

function Ajax(method,url,options,data,res) {
    var xhr = new Xhr(), headers;

    if(typeof options === 'function'){
        res = options;
        options = null;
        data = null;
    } else if(typeof data === 'function'){
        res = data;
        data = null;
    }

    options = options ? options : {};

    if(typeof res === 'function') {
        var clb = res;
        res = {
            resolve: function(x){
                clb(undefined,x);
            },
            reject: function(x,c){
                clb(c||-1,x);
            },
            progress: function(x){
                clb(0,x);
            } 
        }
    } else if(typeof res !== 'object') {
        res = {
            resolve: function(x){ 
                this.result = x;
                if(this.onfulfill) this.onfulfill(x); 
            },
            reject: function(x){ 
                this.error = x;
                if(this.onreject) this.onreject(x); 
            },
            progress: function(x){
                if(this.onprogress) this.onprogress(x);
            },
            when: function(f,r,p){
                this.onfulfill = f;
                this.onreject = r;
                this.onprogress = p;
            }
        };
        /* must be async */
        options.async = true;
    } /* else resolve using res */

    if(options.async === undefined) options.async = true;
 
    if(options.timeout === undefined) options.timeout = DEFAULT_TIMEOUT;
    
    if(!options.headers) options.headers = {};
    
    if(options.type || !options.headers['content-type'])
        options.headers['content-type'] = options.type||'application/json';

    if(options.accept || !options.headers.accept) 
        options.headers.accept = options.accept||'application/json';

    if(options.charset) options.headers['accept-charset'] = options.charset;

    if("withCredentials" in xhr || typeof XDomainRequest != "undefined") {
        
        if(options.withCredentials === true)
            xhr.withCredentials = true;

        xhr.onload = function(){
            res.resolve(xhr)
        }
        xhr.onerror = function(){
            res.reject(xhr);
        }
    } else {
        xhr.onreadystatechange = function() {
            switch(xhr.readyState) {
                case XHR_DONE:
                    if(xhr.status) res.resolve(xhr);
                    else res.reject(xhr); // status = 0 (timeout or Xdomain)           
                    break;
            }            
        }
    }

    /* getter for response headers */
    Object.defineProperty(xhr,'headers',{
        get: function(){
            if(!headers) headers = parseHeaders(xhr.getAllResponseHeaders());
            return headers;
        }
    });

    /* response timeout */
    if(options.timeout) { 
        setTimeout(function(){
            xhr.abort();
        }, options.timeout);
    }

    /* report progress */
    if(xhr.upload && res.progress) {
        xhr.upload.onprogress = function(e){
            e.percent = e.loaded / e.total * 100;
            res.progress(e);
        }
    }

    /* parse url */
    url = urlParser.parse(url);
    
    if(!url.host) url.host = {};

    /* merge host info with options */
    if(!url.host.protocol && options.protocol) url.host.protocol = options.protocol;
    if(!url.host.hostname && options.hostname) url.host.hostname = options.hostname;
    if(!url.host.port && options.port) url.host.port = options.port;

    url = url.toString();
    
    try {
        xhr.open(method,url,options.async);
    } catch(error){
        res.reject(error);
    }

    /* set request headers */
    Object.keys(options.headers).forEach(function(header) {
        xhr.setRequestHeader(header,options.headers[header]);
    });

    /* stringify json */
    if(data && typeof data !== 'string' && options.headers['content-type'].indexOf('json')>=0){
        try {
            data = JSON.stringify(data);
        } catch(error) {
            res.reject(error);
        }
    }

    /* request data */
    try {
        xhr.send(data);
    } catch(error){
        res.reject(error);
    }

    return res;
}

/* Object.create polyfill */
if (!Object.create) {
    Object.create = (function(){
        function F(){}

        return function(o){
            F.prototype = o;
            return new F();
        }
    })();
}

function parseHeaders(h) {
    var ret = Object.create(null), key, val, i;

    h.split('\n').forEach(function(header) {
        if((i=header.indexOf(':')) > 0) {
            key = header.slice(0,i).replace(/^[\s]+|[\s]+$/g,'').toLowerCase();
            val = header.slice(i+1,header.length).replace(/^[\s]+|[\s]+$/g,'');
            if(key && key.length) ret[key] = val;
        }   
    });

    return ret;
}

['head','get','put','post','delete','patch','trace','connect','options']
    .forEach(function(method) {
        Ajax[method] = function(url,options,data,res) {
            return Ajax(method,url,options,data,res);
        }
    });

module.exports = Ajax;
});
require.register("kaerus-component-urlparser/index.js", function(module, exports, require){
/**
 * Provides with an Url parser that deconstructs an url into a managable object and back to a string.
 *
 *  ### Examples:
 *  
 *      url = require('urlparser');
 *      
 *      var u = url.parse('http://user:pass@kaerus.com/login?x=42');
 *      
 *      u.host.hostname = 'database.kaerus.com'
 *      u.host.password = 'secret';
 *      u.host.port = 8529;
 *      u.query.parts.push('a=13');
 *      u.toString(); // 'http://user:secret@database.kaerus.com:8529/login?x=42&a=13'
 *      
 * @module  urlparser
 * @name urlparser
 * @main  urlparser
 */

var URL = /^(?:(?:([A-Za-z]+):?\/{2})?(?:(\w+)?:?([^\x00-\x1F^\x7F^:]*)@)?([\w\-\.]+)?(?::(\d+))?)\/?(([^\x00-\x1F^\x7F^\#^\?^:]+)?(?::([^\x00-\x1F^\x7F^\#^\?]+))?(?:#([^\x00-\x1F^\?]+))?)(?:\?(.*))?$/;

function urlString(o){
    var str = "";

    o = o ? o : this;
  
    str+= hostString(o);
    str+= pathString(o);
    str+= queryString(o);

    return str;
}

module.exports.url = urlString;

function hostString(o){
    var str = "";
  
    o = o ? o.host : this.host;

    if(o) {
        if(o.protocol) str+= o.protocol + '://';
        if(o.username) { 
            str+= o.username + (o.password ? ':' + o.password : '') + '@';
        }
        if(o.hostname) str+= o.hostname; 
        if(o.port) str+= ':' + o.port;
    }

    return str;    
}

module.exports.host = hostString;

function pathString(o){
    var str = "";
  
    o = o ? o.path : this.path;

    if(o) {
        if(o.base) str+= '/' + o.base;
        if(o.name) str+= ':' + o.name;
        if(o.hash) str+= '#' + o.hash;
    }

    return str;     
}

module.exports.path = pathString;

function queryString(o){
    var str = "";
    
    o = o ? o.query : this.query;

    if(o) {
        str = "?";
        if(o.parts)
            str+= o.parts.join('&');
    }

    return str;    
}

module.exports.query = queryString;
/**
 * @class  UrlParser
 * @constructor
 * @static
 * @param url {String}
 * @return {Object}
 */
function urlParser(parse) {

    var param, 
        ret = {};

    /**
     * @method  toString 
     * @return {String}
     */
    Object.defineProperty(ret,'toString',{
        enumerable: false,
        value: urlString
    });   

    
    if(typeof parse === 'string') {
        var q, p, u; 

        u = URL.exec(parse);

        /**
         * Host attributes
         *
         *      host: {
         *          protocol: {String}
         *          username: {String}
         *          password: {String}
         *          hostname: {String}
         *          port: {String}
         *      }
         *      
         * @attribute host
         * @type {Object} 
         */

        if(u[1] || u[4]) {
            ret.host = {};

            if(u[1]) ret.host.protocol = u[1];
            if(u[2]) ret.host.username = u[2];
            if(u[3]) ret.host.password = u[3];
            if(u[4]) ret.host.hostname = u[4];
            if(u[5]) ret.host.port = u[5]; 
        }
        /**
         * Path information
         *
         *      path: {
         *          base: {String} // base path without hash
         *          name: {String} // file or directory name
         *          hash: {String} // the #hash part in path
         *      }
         *      
         * @attribute path
         * @type {Object} 
         */

        if(u[6]) {
            ret.path = {};

            if(u[7]) ret.path.base = u[7];
            if(u[8]) ret.path.name = u[8];
            if(u[9]) ret.path.hash = u[9];
        }
        /**
         * Query parameters
         *
         *      query: {
         *          parts: {Array}   // query segments ['a=3','x=2'] 
         *          params: {Object} // query parameters {a:3,x:2}
         *      }
         *      
         * @attribute query
         * @type {Object} 
         */
        if(u[10]) {
            ret.query = {};
            ret.query.parts = u[10].split('&');
            if(ret.query.parts.length) {

                ret.query.params = {};
                ret.query.parts.forEach(function(part){
                    param = part.split('='); 
                    ret.query.params[param[0]] = param[1];   
                });
            }
        }
    }

    return ret; 
}

module.exports.parse = urlParser;
});
require.register("kaerus-component-base64/index.js", function(module, exports, require){
/* Kaerus 2013, Anders Elo < anders @ kaerus com >             
 * base64 (utf8) encoder / decoder in under 100-lines, enjoyo! 
 *
 *      /                        /     /    /
 *     /__   _ _   ____  ____   /____ /____/
 *    /   / /  /  /___  /__    /    /     /
 *   /___/ /__/\ ____/ /____  /____/     /
*/

var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
/* url encoder/decoder replacements */
var url = {'+':'-','/':'_','=':''};

var Base64 = {
    encode: function(buf){
        var ret = [], x = 0, z, b1 , b2;

        var len = buf.length;
        var code = buf.charCodeAt ? buf.charCodeAt.bind(buf) : function(i){return buf[i]};

        for(var i = 0; i < len; i+=3){
            /* 24 bit triplet */
            z = code(i) << 16 | (b1 = code(i+1)) << 8 | (b2 = code(i+2));
            /* 4 x 6 bits */
            ret[x++] = b64[z >> 18];
            ret[x++] = b64[(z >> 12) & 0x3f];
            ret[x++] = b64[(z >> 6) & 0x3f];
            ret[x++] = b64[z & 0x3f];
        }

        /* padding */
        if(isNaN(b1)){
            ret[x-2] = b64[64];
            ret[x-1] = b64[64];
        } else if(isNaN(b2)){
            ret[x-1] = b64[64];
        }

        return ret.join('');    
    },
    decode: function(buf){
        var ret = [], z, x, i, b1, b2, w = [];

        var len = buf.length;
        var code = buf.indexOf.bind(b64);

        for(i = 0; i < len; i++){
            if(i % 4){
                b1 = code(buf[i-1]);
                b2 = code(buf[i]);
                z = (b1 << i % 4 * 2) + (b2 >> 6 - i % 4 * 2);
                w[i >>> 2] |= z << 24 - i % 4 * 8;
            }
        }

        for(i = 0, x = 0, l = w.length; i < l; i++){
            ret[x++] = String.fromCharCode(w[i]>>16);
            ret[x++] = String.fromCharCode((w[i]>>8)&0xff);
            ret[x++] = String.fromCharCode(w[i]&0xff);
        }

        /* padding */
        if(b1 === 64){
            ret.splice(-2,2);
        } else if(b2 === 64){
            ret.pop();
        }

        return ret.join('');
    },
    encodeURL: function(buf){
        var encoded = this.encode(buf);

        for(var enc in url)
            encoded = encoded.split(enc).join(url[enc]);

        return encoded;
    },
    decodeURL: function(buf){
        var data, pad;

        for(var enc in url){
            if(url[enc])
                data = buf.split(url[enc]).join(enc);
        }

        /* padding */
        if((pad = data.length % 4)){
            data = data.concat(Array(pad+1).join(b64[64]));
        }

        return this.decode(data);
    }
}

module.exports = Base64;
});
require.register("arango/index.js", function(module, exports, require){
module.exports = require('./lib/arango');

});
require.register("arango/lib/arango.js", function(module, exports, require){
"use strict";

var url = require('./url'),
    base64 = require('base64'),
    Promise = require('micropromise'),
    utils = require('./utils'),
    request = require('./request');

var API_DIR = './api/',
    API_MODULES = [
	'transaction',
	'collection',
	'database',
	'document',
	'cursor',
	'job',
	'simple',
	'index',
	'query',
	'admin',
	'aqlfunction',
	'endpoint',
	'import',
	'traversal',
	'graph',
	'batch',
	'edge',
	'action',
	'user'
    ],
    ArangoAPI;

function Arango(db, options) {
    if (!(this instanceof Arango)) {
	return new Arango(db, options);
    }

    /* attach API:s */
    attach(this, ArangoAPI);

    if (db instanceof Arango) {
	this._name = db._name;
	this._collection = db._collection;
	this._server = utils.extend(true, {}, db._server);
    } else options = db;

    if (options) {
	if (typeof options === 'string') {
	    utils.extend(true, this, url.path2db(options));
	} else if (typeof options === 'object') {
	    if (options.api) attach(this, options.api);
	    if (options._name) this._name = options._name;
	    if (options._server) this._server = options._server;
	    if (options._collection) this._collection = options._collection;
	}
    }
    /* Apply defaults */
    if (typeof this._server !== 'object')
	this._server = {};
    if (typeof this._server.protocol !== 'string')
	this._server.protocol = 'http';
    if (typeof this._server.hostname !== 'string')
	this._server.hostname = '127.0.0.1';
    if (typeof this._server.port !== 'number')
	this._server.port = parseInt(this._server.port || 8529, 10);
    if (typeof this._collection !== 'string')
	this._collection = '';

    /* Basic authorization */
    if (this._server.username) {
	if (typeof this._server.headers !== 'object') this._server.headers = {};
	this._server.headers['authorization'] = 'Basic ' +
	    base64.encode(this._server.username + ':' + this._server.password);
    }
}
/**
 * Creates an arango connection, can be called either with a JSON Object representing the connection or with a
 * connection String.
 *
 * @example
 *  arango.Connection("https://user:pass@hostname:8529/database:collection")<br>
 *  arango.Connection("https://test.com")<br>
 *  arango.Connection({_name:"database",_collection:"collection",_server:{hostname:"test.host"}})<br>
 *
 * @return {arango}
 * @class arango
 * @constructor
 * @module arango

 */
Arango.Connection = function () {
    var options = {};

    for (var i = 0; arguments[i]; i++) {
	if (typeof arguments[i] === 'object')
	    utils.extend(true, options, arguments[i]);
	else if (typeof arguments[i] === 'string')
	    utils.extend(true, options, url.path2db(arguments[i]));
    }

    return new Arango(options);
}

/* api registration hook */
Arango.api = function (ns, exp) {
    var api = {};

    api[ns] = exp;

    attach(this, api);

    return exp;
}

/* base64 helper */
Arango.base64 = base64;

Arango.prototype = {
    /**
     * changes the arango connection
     *
     * @param {String|Object} options - the new connection parameters.
     * @method use
     * @return{arango}
     */
    "use": function (options) {
	return new Arango(this, options);
    },
    /**
     * changes the arango defautl collection
     *
     * @param {String} collection - the collection to be used for all further requests.
     * @method useCollection
     * @return{arango}
     */
    "useCollection": function (collection) {
	return this.use(":" + collection);
    },
    /**
     * changes the arango database.
     *
     * @param {String} database - the database to perform every operation on.
     * @method useDatabase
     * @return{arango}
     */
    "useDatabase": function (database) {
	return this.use("/" + database);
    },
    /**
     * add a new api module to the arango module
     *
     * @param {Object} api - a new api module
     * @method api
     * @return{arango}
     */
    "api": function (api) {
	if (!api) return ArangoAPI;

	attach(this, api);

	return new Arango(this);
    },
    /**
     * perform a HTTP "GET" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Function} callback   - The callback function.
     * @method get
     * @return{Promise}
     */
    "get": function (path, options, callback) {
	return this.request('GET', path, null, options, callback);
    },
    /**
     * perform a HTTP "POST" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Object} data - the request body
     * @param {Function} callback   - The callback function.
     * @method post
     * @return{Promise}
     */
    "post": function (path, data, options, callback) {
	return this.request('POST', path, data, options, callback);
    },
    /**
     * perform a HTTP "PUT" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Object} data - the request body
     * @param {Function} callback   - The callback function.
     * @method put
     * @return{Promise}
     */
    "put": function (path, data, options, callback) {
	return this.request('PUT', path, data, options, callback);
    },
    /**
     * perform a HTTP "DELETE" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Function} callback   - The callback function.
     * @method delete
     * @return{Promise}
     */
    "delete": function (path, options, callback) {
	return this.request('DELETE', path, null, options, callback);
    },
    /**
     * perform a HTTP "HEAD" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Function} callback   - The callback function.
     * @method head
     * @return{Promise}
     */
    "head": function (path, options, callback) {
	return this.request('HEAD', path, null, options, callback);
    },
    /**
     * perform a HTTP "PATCH" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Object} data - the request body
     * @param {Function} callback   - The callback function.
     * @method patch
     * @return{Promise}
     */
    "patch": function (path, data, options, callback) {
	return this.request('PATCH', path, data, options, callback);
    },
    /**
     * perform a HTTP "OPTIONS" request
     *
     * @param {String} path - the URL
     * @param {Object} options - a  JSON Object containing optional data.
     * @param {Function} callback   - The callback function.
     * @method options
     * @return{Promise}
     */
    "options": function (path, options, callback) {
	return this.request("OPTIONS", path, null, options, callback);
    },
    /**
     * Enables/disables the async mode. Every request is enriched with a header telling arangodb to perform the request
     * asnyc.
     *
     * @param {Boolean} active   -  true to activate.
     * @param {Boolean} [fireAndForget   -  if true fire and forget mode is activated.
     * @method setAsyncMode
     * @return{arango}
     */
    "setAsyncMode": function (active, fireAndForget) {

	if (!active) {
	    if (this._server.headers !== undefined)
		delete this._server.headers["x-arango-async"];

	    return this;
	}

	if (typeof this._server.headers !== 'object')
	    this._server.headers = {};

	this._server.headers["x-arango-async"] = fireAndForget ? "true" : "store";

	return this;
    },
    "request": request,
    "Promise": Promise
}

function attach(db, api) {
    if (typeof api === 'string') {
	api = fetch(api);
    }

    for (var ns in api) {
	if (!Object.getOwnPropertyDescriptor(db, ns))
	    load(db, ns, api[ns], true);
    }
}

function load(db, ns, api, lazy) {

    if (lazy) {
	Object.defineProperty(db, ns, {
	    enumerable: true,
	    configurable: true,
	    get: function () {
		return context();
	    }
	});
    } else {
	db[ns] = typeof api === 'function' ? api(db) : context();
    }

    function context() {
	var instance = (require(api))(db);

	context = function () {
	    return instance;
	};

	return instance;
    }
}

function fetch(api) {
    var o = {};

    if (typeof api === 'string') api = api.split(' ');

    for (var n in api) o[api[n]] = API_DIR + api[n];

    return o;
}

/* configure API modules */
ArangoAPI = fetch(API_MODULES);

module.exports = Arango;

});
require.register("arango/lib/request.js", function(module, exports, require){
var utils = require('./utils'),
    xhr = require('./xhr');

function request(method, path, data, options, callback) {
    var result;

    if (typeof options === 'function') {
	callback = options;
	options = null;
    }

    options = options ? options : {};

    options = utils.extend(true, {}, this._server, options);

    if (data && typeof data !== 'string') {
	try {
	    data = JSON.stringify(data);
	} catch (err) {
	    throw "failed to json stringify data";
	}
    }

    if (this._name) {
	path = '/_db/' + this._name + path;
    }

    result = new this.Promise();
    
    xhr(method, path, options, data, result);

    if(typeof callback === 'function') {
        result.then(function(value,opaque){
            callback(undefined,value,opaque);    
        },function(reason,opaque){
            callback(-1,reason,opaque);    
        },function(progress){
            callback(0,progress);
        });         
    }
    
    return result;
}

module.exports = request;

});
require.register("arango/lib/utils.js", function(module, exports, require){
function extend() {
  var deep = false,
    source, target,
    key, i = 0,
    l = arguments.length;

  if (typeof arguments[i] === "boolean") deep = arguments[i++];

  target = arguments[i++];

  if (l <= i) return extend(deep, {}, target);

  while (i < l) {
    source = arguments[i++];

    for (key in source) {
      if (typeof source[key] === 'object' && source[key] != null) {
        if (deep) {
          if (target.hasOwnProperty(key)) extend(true, target[key], source[key]);
          else target[key] = extend(true, {}, source[key])
        }
      } else target[key] = source[key];
    }
  }

  return target;
}

/* Prototypal inheritance (from nodejs) */
function inherit(self, parent) {
  self.super_ = parent;
  self.prototype = Object.create(parent.prototype, {
    constructor: {
      value: self,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
}


module.exports = {
  extend: extend,
  inherit: inherit
};

});
require.register("arango/lib/xhr.js", function(module, exports, require){
var urlParser = require('urlparser'),
    BROWSER,
    xhr;

/* detects if in nodejs or else assume we are in a browser */
try {
    BROWSER = !process.versions.node
} catch (e) {
    BROWSER = true
}

/* Bring in Xhr support for nodejs or browser */
if (!BROWSER) {
    xhr = function (method, path, options, data, resolver) {
	"use strict";

	var url = urlParser.parse(path);
	var proto = (url.host && url.host.protocol) || options.protocol;
	var req = require(proto).request;

	delete options.protocol;

	if (options.timeout) {
	    request.socket.setTimeout(options.timeout);
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
            reply(resolver, error)
	}).end(data, options.encoding);
    }
} else {
    xhr = function (method, path, options, data, resolver) {
	"use strict";

	var ajax = require('ajax'),
	    buf;
	
	ajax(method, path, options, data).when(function (res) {
	    console.log("res",res);
	    buf = res.responseText;
	    reply(resolver, buf, res);
	}, function (error) {
	    reply(resolver, error);
	});
    }
}

function reply(resolver, data, xhr) {
    xhr = typeof xhr === 'object' ? xhr : {
	status: xhr || -1
    }

    xhr.status = xhr.statusCode ? xhr.statusCode : xhr.status;

    if (typeof data === 'string') {
	try {
	    data = JSON.parse(data)
	} catch (e) {
	}
    }

    if (0 < xhr.status && 399 > xhr.status) {
	resolver.resolve(data, xhr);
    } else {
	resolver.reject(data, xhr);
    }
}

module.exports = xhr;

});
require.register("arango/lib/url.js", function(module, exports, require){
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

});
require.register("arango/lib/api/transaction.js", function(module, exports, require){
var Arango = require('../arango');
/**
 * The api module to execute transactions in ArangoDB.
 *
 * @class transaction
 * @module arango
 * @submodule transaction
 **/
function TransactionAPI(db) {
    var path = "/_api/transaction/";
    return {
	/**
	 *
	 * @param {Object} collection  - contains the list of collections to be used in the transaction (mandatory).
	 * collections must be a JSON array that can have the optional sub-attributes read and write. read and write
	 * must each be either lists of collections names or strings with a single collection name.
	 * @param {String} action  - the actual transaction operations to be executed, in the form of stringified
	 * Javascript code.
	 * @param {Object} [options] - a JSON Object contatining optional parameter:
	 * @param {Object} [options.params]        - optional arguments passed to action.
	 * @param {Object} [options.waitForSync=false]  - if set, will force the transaction to write all data to disk
	 * before returning.
	 * @param {Object} [options.lockTimeout] - a numeric value that can be used to set a timeout for waiting on
	 * collection locks. If not specified, a default value will be used. Setting lockTimeout to 0 will make ArangoDB
	 * not time out waiting for a lock.
	 * @param {Object} [options.replicate=true] - whether or not to replicate the operations from this transaction.
	 * @param {Function} callback   - The callback function.
	 * @method submit
	 * @return{Promise}
	 */
	"submit": function (collections, action, options, callback) {

	    if (typeof options === 'function') {
		callback = options;
		options = {};
	    }
	    options.collections = collections;
	    options.action = action.toString();

	    return db.post(path, options, null, callback);
	}
    }
}


module.exports = Arango.api('transaction', TransactionAPI);

});
require.register("arango/lib/api/collection.js", function(module, exports, require){
var Arango = require('../arango'),
  url = require('../url');

/**
 * The api module to do perform operations on collections.
 *
 * @class collection
 * @module arango
 * @submodule collection
 **/
function CollectionAPI(db) {
  var path = "/_api/collection/";

  return {
    /**
     * Creates a collection
     *
     * @param {String} collection       - the collection name
     * @param {Object} [options]        - a JSONObject containing optional attributes:
     * @param {Boolean} [options.waitForSync=false] -    If true then the data is synchronised to disk before
     * returning from a create or update of a document.
     * @param {Boolean} [options.doCompact=true] - whether or not the collection will be compacted.
     * @param {Number} [options.type=2] -   the type of the collection to create. The following values for type are
     * valid: <br>- 2: document collection <br>- 3: edges collection
     * @param {Number} [options.journalSize]    -   The maximal size of a journal or datafile. Must be at least 1MB.
     * @param {Boolean} [options.isSystem=false]-    If true, create a system collection. In this case collectionname
     * should start with an underscore. End users should normally create non-system collections only. API
     * implementors may be required to create system collections in very special occasions, but normally a regular
     * collection will do.
     * @param {Boolean} [options.isVolatile=false]-  If true then the collection data is kept in-memory only and not
     * made persistent. Unloading the collection will cause the collection data to be discarded. Stopping or
     * re-starting the server will also cause full loss of data in the collection. Setting this option will make the
     * resulting collection be slightly faster than regular collections because ArangoDB does not enforce any
     * synchronisation to disk and does not calculate any CRC checksums for datafiles.
     * @param {Number} [options.numberOfShards]   -   number of shards to distribute the collection on.
     * @param {Number} [options.shardKeys]  -   list of shard key attributes to use (e.g. [ "_key1", "_key2" ]).
     * @param {Object} [options.keyOptions] -   additional options for key generation. If specified, then keyOptions
     * should be a JSON array containing the following attributes:
     * @param {String} [options.keyOptions.type]-   "traditional" and "autoincrement".
     * @param {Boolean} [options.keyOptions.allowUserKeys=false]   -    if set to true, then it is allowed to supply
     * own key values in the _key attribute of a document.
     * @param {Number} [options.keyOptions.increment]   -   increment value for autoincrement key generator.
     * @param {Number} [options.keyOptions.offset]  -   initial offset value for autoincrement key generator.
     *
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method create
     */
    "create": function (collection, options, callback) {
      collection = collection || db._collection;

      if (typeof options === 'function') {
        callback = options;
        options = null;
      }

      options = options ? options : {};

      if (!options.name) options.name = collection;

      return db.post(path, options, callback);
    },
    /**
     * The result is an object describing the collection.
     *
     * @param {String}  id        - the collection handle.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method get
     */
    "get": function (id, callback) {
      return db.get(path + id, callback);
    },
    /**
     * Deletes the collection.
     *
     * @param {String}  id        - the collection handle.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method delete
     */
    "delete": function (id, callback) {
      return db.delete(path + id, callback);
    },
    /**
     * Deletes all documents of a collection.
     *
     * @param {String}  id        - the collection handle.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method truncate
     */
    "truncate": function (id, callback) {
      return db.put(path + id + '/truncate', null, callback);
    },
    /**
     * Counts the document in the collection.
     *
     * @param {String}  id        - the collection handle.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method count
     */
    "count": function (id, callback) {
      return db.get(path + id + '/count', callback);
    },
    /**
     * Result contains the number of documents and additional statistical information about the collection.
     *
     * @param {String}  id        - the collection handle.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method figures
     */
    "figures": function (id, callback) {
      return db.get(path + id + '/figures', callback);
    },
    /**
     * Returns a list of all collections in the database.
     *
     * @param {Boolean} [excludeSystem=false]  -    if set to true no system collections are returned.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method list
     */
    "list": function (excludeSystem, callback) {
      var url = path;
      if (typeof excludeSystem === 'function') {
        callback = excludeSystem;
      } else {
        url += "?excludeSystem=" + excludeSystem;
      }
      return db.get(url, callback);
    },
    /**
     * Loads a collection into memory.
     *
     * @param {String}  id        - the collection handle.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method load
     */
    "load": function (id, count, callback) {
      var param = {};
      if (typeof count === "function") {
        callback = count;
      } else {
        param.count = count;
      }
      return db.put(path + id + '/load', param, callback);
    },
    /**
     * Deletes a collection from memory.
     *
     * @param {String}  id        - the collection handle.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method unload
     */
    "unload": function (id, callback) {
      return db.put(path + id + '/unload', null, callback);
    },
    /**
     * Renames a collection.
     *
     * @param {String}  id        - the collection handle.
     * @param {String} name       - the new name
     * @param {Function} callback - The callback function.
     * @return{Promise}
     * @method rename
     */
    "rename": function (id, name, callback) {
      var data = {
        name: name
      };
      return db.put(path + id + '/rename', data, callback);
    },
    /**
     * Result contains the waitForSync, doCompact, journalSize, and isVolatile properties.
     *
     * @param {String}  id        - the collection handle.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method getProperties
     */
    "getProperties": function (id, callback) {
      return db.get(path + id + '/properties', callback);
    },
    /**
     * Changes the properties of a collection.
     *
     * @param {String} id            - the collection handle.
     * @param {Object} properties    - JSON Object that can contain each of the following:
     * @param {Boolean} [properties.waitForSync=false] -  If true then creating or changing a document will wait
     * until the data has been synchronised to disk.
     * @param {Number} [properties.journalSize] -   Size (in bytes) for new journal files that are created for the
     * collection.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method setProperties
     */
    "setProperties": function (id, data, callback) {
      return db.put(path + id + '/properties', data, callback);
    },
    /**
     * Result contains the collection's revision id. The revision id is a server-generated string that clients can
     * use to check whether data in a collection has changed since the last revision check.
     *
     * @param {String}  id        - the collection handle.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method revision
     */
    "revision": function (id, callback) {
      return db.get(path + id + '/revision', callback);
    },

    /**
     * Will calculate a checksum of the meta-data (keys and optionally revision ids) and optionally the document
     * data in the collection.
     * The checksum can be used to compare if two collections on different ArangoDB instances contain the same
     * contents. The current revision of the collection is returned too so one can make sure the checksums are
     * calculated for the same state of data.
     *
     *
     * @param {String}  id        - the collection handle.
     * @param {Object} options   - JSON Object that can contain each of the following:
     * @param {Boolean} [options.withRevisions=false]    -   If true, then revision ids (_rev system attributes) are
     * included in the checksumming.
     * @param {Boolean} [options.withData=false]    -   If true, the user-defined document attributes will be
     * included in the calculation too.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method checksum
     */
    "checksum": function (id, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = null;
      }
      options = options ? options : {};

      return db.get(path + id + '/checksum' + url.options(options), callback);
    },
    /**
     * Rotates the journal of a collection. The current journal of the collection will be closed and made a read-only
     * datafile. The purpose of the rotate method is to make the data in the file available for compaction (compaction
     * is only performed for read-only datafiles, and not for journals).
     *
     * @param {String}  id        - the collection handle.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method rotate
     */
    "rotate": function (id, callback) {
      return db.put(path + id + '/rotate', null, null, callback);
    }
  }
}

module.exports = Arango.api('collection', CollectionAPI);

});
require.register("arango/lib/api/database.js", function(module, exports, require){
var Arango = require('../arango');

/**
 * The api module to perform database related operations on ArangoDB.
 *
 * @class database
 * @module arango
 * @submodule database
 **/
function DatabaseAPI(db) {
  var path = "/_api/database/";

  return {
    /**
     *
     * Creates a database.
     *
     * @param {String} name   -   The name of the database.
     * @param {List} users   -  A list containing objects describing the users, each user Object contains:
     * @param {String} users.username    -   The name of the user.
     * @param {String} [users.passwd=""] -   The user password
     * @param {Boolean} [users.active=true]   -  Indicates if the user is active.
     * @param {Object} [users.extra] -   Object containing additional user data.
     * @param {Function} callback   - The callback function.
     * @method create
     * @return{Promise}
     */
    "create": function (name, users, callback) {
      var options = {
        name: name
      };

      if (typeof users === 'function') {
        callback = users;
        users = null;
      }

      if (users) options.users = users;

      return db.post(path, options, callback);
    },
    /**
     *
     * Retrieves information about the current database
     *
     * @param {Function} callback   - The callback function.
     * @method current
     * @return{Promise}
     */
    "current": function (callback) {
      return db.get(path + 'current', callback);
    },
    /**
     *
     * Lists all databases.
     *
     * @param {Function} callback   - The callback function.
     * @method list
     * @return{Promise}
     */
    "list": function (callback) {
      return db.get(path, callback);
    },
    /**
     *
     * Returns all databases the current user can access.
     *
     * @param {Function} callback   - The callback function.
     * @method user
     * @return{Promise}
     */
    "user": function (callback) {
      return db.get(path + 'user', callback);
    },
    /**
     *
     * Deletes a database.
     *
     * @param {String} name   -   The database to delete.
     * @param {Function} callback   - The callback function.
     * @method delete
     * @return{Promise}
     */
    "delete": function (name, callback) {
      return db.delete(path + name, callback);
    }
  };
}

module.exports = Arango.api('database', DatabaseAPI);

});
require.register("arango/lib/api/document.js", function(module, exports, require){
var Arango = require('../arango'),
  url = require('../url');

/**
 * The api module to perform document related operations on ArangoDB.
 *
 * @class document
 * @module arango
 * @submodule document
 **/

function DocumentAPI(db) {
  var path = "/_api/document";

  return {
    /**
     * creates a a document in a given collection.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Object} data - the data of the document as JSON object
     * @param {Object} [options] - an object with the following optional parameters:
     * @param {Boolean} [options.createCollection=false] - if set the collection given in "collection" is created as
     * well.
     * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
     * @param {Function} callback   - The callback function.
     * @method create
     * @return{Promise}
     */
    "create": function (collection, data, options, callback) {
      if (typeof collection !== 'string') {
        callback = options;
        options = data;
        data = collection;
        collection = db._collection;
      }
      if (typeof options === 'function') {
        callback = options;
        options = null;
      }

      if (!options) options = {};

      options.collection = collection;

      return db.post(path + url.options(options), data, callback);
    },
    /**
     * retrieves a document from the database
     *
     * @param {String} id - the document-handle
     * @param {Object} [options] - an object with the following optional parameters:
     * @param {Boolean} [options.match] - boolean defining if the given revision should match the found document or
     * not.
     * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
     * @param {Function} callback   - The callback function.
     * @method get
     * @return{Promise}
     */
    "get": function (id, options, callback) {
      var headers;

      if (typeof options == 'function') {
        callback = options;
        options = {};
      } else if (options) {
        headers = url.ifMatch(id, options);
      }
      return db.get(path + '/' + id + url.options(options), headers, callback);
    },
    /**
     * replaces a document with the data given in data.
     *
     * @param {String} id - the edge-handle
     * @param {Object} data - the data of the edge as JSON object
     * @param {Object} [options] - an object with the following optional parameters:
     * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
     * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
     * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
     * does not match.
     * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
     * @param {Function} callback   - The callback function.
     * @method put
     * @return{Promise}
     */
    "put": function (id, data, options, callback) {
      var headers;

      if (typeof options == 'function') {
        callback = options;
        options = null;
      } else if (options) {
        headers = url.ifMatch(id, options);
      }

      options = options ? options : {};

      if (options.forceUpdate !== undefined) {
        options.policy = (options.forceUpdate === true) ? "last" : "error";
        delete options.forceUpdate;
      }

      return db.put(path + '/' + id + url.options(options), data, headers, callback);
    },
    /**
     * patches a document with the data given in data
     *
     * @param {String} id - the edge-handle
     * @param {Object} data - the data of the edge as JSON object
     * @param {Object} [options] - an object with the following optional parameters:
     * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
     * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
     * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
     * does not match.
     * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
     * @param {Boolean} [options.keepNull=true] -  if set to false a patch request will delete every null value
     * attributes.
     * @param {Function} callback   - The callback function.
     * @method patch
     * @return{Promise}
     */
    "patch": function (id, data, options, callback) {
      var headers;
      if (typeof options == 'function') {
        callback = options;
        options = null;
      } else if (options) {
        headers = url.ifMatch(id, options);
      }
      options = options ? options : {};
      if (options.forceUpdate !== undefined) {
        options.policy = (options.forceUpdate === true) ? "last" : "error";
        delete options.forceUpdate;
      }
      return db.patch(path + '/' + id + url.options(options), data, headers, callback);
    },
    /**
     * Deletes a document
     *
     * @param {String} id - the document-handle
     * @param {Object} [options] - an object with the following optional parameters:
     * @param {Boolean} [options.match] - boolean defining if the given revision should match the found document or
     * not.
     * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
     * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
     * does not match.
     * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.

     * @param {Function} callback   - The callback function.
     * @method delete
     * @return{Promise}
     */
    "delete": function (id, options, callback) {
      var headers;

      if (typeof options == 'function') {
        callback = options;
        options = null;
      } else if (options) {
        headers = url.ifMatch(id, options);
      }
      options = options ? options : {};
      if (options.forceUpdate !== undefined) {
        options.policy = (options.forceUpdate === true) ? "last" : "error";
        delete options.forceUpdate;
      }
      return db.delete(path + '/' + id + url.options(options), headers, callback);
    },
    /**
     * same as get but only returns the header.
     *
     * @param {String} id - the edge-handle
     * @param {Object} [options] - an object with the following optional parameters:
     * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
     * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
     * @param {Function} callback   - The callback function.
     * @method head
     * @return{Promise}
     */
    "head": function (id, options, callback) {
      var headers;

      if (typeof options == 'function') {
        callback = options;
        options = null;
      } else if (options) {
        headers = url.ifMatch(id, options);
      }
      options = options ? options : {};
      if (options.forceUpdate !== undefined) {
        options.policy = (options.forceUpdate === true) ? "last" : "error";
        delete options.forceUpdate;
      }
      return db.head(path + '/' + id + url.options(options), headers, callback);
    },
    /**
     * returns all documents in a collection
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Function} callback   - The callback function.
     * @method list
     * @return{Promise}
     */
    "list": function (collection, callback) {
      if (typeof collection == 'function') {
        callback = collection;
        collection = db, _collection;
      }
      return db.get(path + "?collection=" + collection, callback);
    }
  }
}

module.exports = Arango.api('document', DocumentAPI);

});
require.register("arango/lib/api/action.js", function(module, exports, require){
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

            var options = {};
            /* Pass through user defined xhr options                  */
            /* Note: options.timeout sets a request timeout in ms     */
            /* options.headers sets ajax headers such as content-type */
            if (o.options) utils.extend(true, options, o.options);

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
                }).then(function(res) {
                    submit[o.name].route = res._id;

		    /* reload routes */
                    if (reload === true) {
			db.admin.routesReload().then(function(){
			    ret.fulfill(submit[o.name]);
			}, ret.reject);
		    } else ret.fulfill(submit[o.name]);
                }, ret.reject);
            } else {
		ret.fulfill(submit[o.name]);
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


module.exports = Arango.api('action', ActionAPI);

});
require.register("arango/lib/api/cursor.js", function(module, exports, require){
var Arango = require('../arango');
/**
 * The api module to validate, test, execute arangodb queries and fetch the data..
 *
 * @class cursor
 * @module arango
 * @submodule cursor
 **/
function CursorAPI(db) {
  var path = "/_api/cursor/";

  return {
    /**
     *
     * Fetches data for a cursor.
     *
     * @param {String} id   -   The id of the cursor to fetch data for
     * @param {Function} callback   - The callback function.
     * @method get
     * @return{Promise}
     */
    "get": function (id, callback) {
      return db.put(path + id, {}, callback);
    },
    /**
     * Executes query string.
     *
     * @param {Object} data - A JSON Object containing the query data:
     * @param {String} data.query   - contains the query string to be executed.
     * @param {Boolean} [data.count=false]  -   boolean flag that indicates whether the number of documents in the
     * result set should be returned in the "count" attribute of the result.
     * @param {Integer} [data.batchSize]    -   maximum number of result documents to be transferred from the server
     * to the client in one roundtrip (optional). If this attribute is not set, a server-controlled default value
     * will be used.
     * @param {Object} [data.bindVars]- key/value list of bind parameters.
     * @param {Object} [data.options]   -   key/value list of extra options for the query
     * @param {Boolean} [data.options.fullCount=false]   -   if set to true and the query contains a LIMIT clause,
     * then the result will contain an extra attribute extra with a sub-attribute fullCount. This sub-attribute will
     * contain the number of documents in the result before the last LIMIT in the query was applied. It can be used
     * to count the number of documents that match certain filter criteria, but only return a subset of them, in one
     * go.
     * @param {Function} callback   - The callback function.
     * @method create
     * @return{Promise}
     */
    "create": function (data, callback) {
      return db.post(path, data, callback);
    },
    /**
     * Validates a query.
     *
     * @param {Object} data - A JSON Object containing the query data:
     * @param {String} data.query   - contains the query string to be executed.
     * @param {Boolean} [data.count=false]  -   boolean flag that indicates whether the number of documents in the
     * result set should be returned in the "count" attribute of the result.
     * @param {Integer} [data.batchSize]    -   maximum number of result documents to be transferred from the server
     * to the client in one roundtrip (optional). If this attribute is not set, a server-controlled default value
     * will be used.
     * @param {Object} [data.bindVars]- key/value list of bind parameters.
     * @param {Object} [data.options]   -   key/value list of extra options for the query
     * @param {Boolean} [data.options.fullCount=false]   -   if set to true and the query contains a LIMIT clause,
     * then the result will contain an extra attribute extra with a sub-attribute fullCount. This sub-attribute will
     * contain the number of documents in the result before the last LIMIT in the query was applied. It can be used
     * to count the number of documents that match certain filter criteria, but only return a subset of them, in one
     * go.
     * @param {Function} callback   - The callback function.
     * @method query
     * @return{Promise}
     */
    "query": function (data, callback) {
      return db.post("/_api/query", data, callback);
    },
    /**
     * Explains a query.
     *
     * @param {Object} data - A JSON Object containing the query data:
     * @param {String} data.query   - contains the query string to be executed.
     * @param {Boolean} [data.count=false]  -   boolean flag that indicates whether the number of documents in the
     * result set should be returned in the "count" attribute of the result.
     * @param {Number} [data.batchSize]    -   maximum number of result documents to be transferred from the server
     * to the client in one roundtrip (optional). If this attribute is not set, a server-controlled default value
     * will be used.
     * @param {Object} [data.bindVars]- key/value list of bind parameters.
     * @param {Object} [data.options]   -   key/value list of extra options for the query
     * @param {Boolean} [data.options.fullCount=false]   -   if set to true and the query contains a LIMIT clause,
     * then the result will contain an extra attribute extra with a sub-attribute fullCount. This sub-attribute will
     * contain the number of documents in the result before the last LIMIT in the query was applied. It can be used
     * to count the number of documents that match certain filter criteria, but only return a subset of them, in one
     * go.
     * @param {Function} callback   - The callback function.
     * @method explain
     * @return{Promise}
     */
    "explain": function (data, callback) {
      var queryData = {};

      queryData.query = data;
      return db.post("/_api/explain", data, callback);
    },
    /**
     * deletes a cursor.
     *
     * @param {String} id   -   The id of the cursor to fetch data for
     * @param {Function} callback   - The callback function.
     * @method delete
     * @return{Promise}
     */
    "delete": function (id, callback) {
      return db.delete(path + id, callback);
    }
  }
}

module.exports = Arango.api('cursor', CursorAPI);

});
require.register("arango/lib/api/simple.js", function(module, exports, require){
var Arango = require('../arango');
/**
 * The api module to do perform simple queries in ArangoDB.
 *
 * @class simple
 * @module arango
 * @submodule simple
 **/
function SimpleAPI(db) {
  var path = "/_api/simple/";

  return {
    /**
     * Returns all documents of a collections. The call expects a JSON object as body with the following attributes:
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Object} [options] -  JSONObject with optional parameters:
     * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
     * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method list
     */
    "list": function (collection, options, callback) {
      if (typeof collection === "function") {
        callback = collection;
        options = {};
        collection = db._collection;
      }
      if (typeof options === "function") {
        callback = options;
        if (typeof collection === "string") {
          options = {};
        } else {
          options = collection;
          collection = db._collection;
        }
      }

      var data = {
        collection: collection
      };
      return db.put(path + 'all', applyOptions(this, data, options), callback);
    },
    /**
     * Returns any document of a collections. The call expects a JSON object as body with the following attributes:
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method any
     */
    "any": function (collection, callback) {
      if (typeof collection === "function") {
        callback = collection;
        collection = db._collection;
      }

      var data = {
        collection: collection
      };
      return db.put(path + 'any', data, callback);
    },
    /**
     * This will find all documents matching a given example.
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Object} example - An object defining the example.
     * @param {Object} [options] -  JSONObject with optional parameters:
     * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
     * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method example
     */
    "example": function (collection, example, options, callback) {
      if (typeof example === "function") {
        callback = example;
        example = collection;
        options = {};
        collection = db._collection;
      }
      if (typeof options === "function") {
        callback = options;
        if (typeof collection === "string") {
          options = {};
        } else {
          options = example;
          example = collection;
          collection = db._collection;
        }
      }
      var data = {
        collection: collection,
        example: example
      };
      return db.put(path + 'by-example', applyOptions(this, data, options), callback);
    },
    /**
     * This will remove all documents matching a given example.
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Object} example - An object defining the example.
     * @param {Object} [options] -  JSONObject with optional parameters:
     * @param {Boolean} [options.waitForSync]  -   if set to true, then all removal operations will instantly be
     * synchronised to disk. If this is not specified, then the collection's default sync behavior will be applied.
     * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method removeByExample
     */
    "removeByExample": function (collection, example, options, callback) {
      if (typeof example === "function") {
        callback = example;
        example = collection;
        options = {};
        collection = db._collection;
      }
      if (typeof options === "function") {
        callback = options;
        if (typeof collection === "string") {
          options = {};
        } else {
          options = example;
          example = collection;
          collection = db._collection;
        }
      }
      var data = {
        collection: collection,
        example: example
      };
      return db.put(path + 'remove-by-example', applyOptions(this, data, options), callback);
    },
    /**
     * This will find all documents in the collection that match the specified example object, and replace the entire
     * document body with the new value specified. Note that document meta-attributes such as _id, _key, _from, _to etc.
     * cannot be replaced.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Object} example - An object defining the example.
     * @param {Object} newValue - The replacement object.
     * @param {Object} [options] -  JSONObject with optional parameters:
     * @param {Boolean} [options.waitForSync]  -   if set to true, then all removal operations will instantly be
     * synchronised to disk. If this is not specified, then the collection's default sync behavior will be applied.
     * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method replaceByExample
     */
    "replaceByExample": function (collection, example, newValue, options, callback) {
      if (typeof newValue === "function") {
        callback = newValue;
        newValue = example;
        example = collection;
        options = {};
        collection = db._collection;
      }
      if (typeof options === "function") {
        callback = options;
        if (typeof collection === "string") {
          options = {};
        } else {
          options = newValue;
          newValue = example;
          example = collection;
          collection = db._collection;
        }
      }
      var data = {
        collection: collection,
        example: example,
        newValue: newValue
      };
      return db.put(path + 'replace-by-example', applyOptions(this, data, options), callback);
    },
    /**
     * This will find all documents in the collection that match the specified example object, and partially update the
     * document body with the new value specified. Note that document meta-attributes such as _id, _key, _from, _to etc.
     * cannot be replaced.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Object} example - An object defining the example.
     * @param {Object} newValue - The replacement object.
     * @param {Object} [options] -  JSONObject with optional parameters:
     * @param {Boolean} [options.waitForSync]  -   if set to true, then all removal operations will instantly be
     * synchronised to disk. If this is not specified, then the collection's default sync behavior will be applied.
     * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
     * @param {Boolean} [options.keepNull=true]  -  "false" will remove null values from the update document.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method updateByExample
     */
    "updateByExample": function (collection, example, newValue, options, callback) {
      if (typeof newValue === "function") {
        callback = newValue;
        newValue = example;
        example = collection;
        options = {};
        collection = db._collection;
      }
      if (typeof options === "function") {
        callback = options;
        if (typeof collection === "string") {
          options = {};
        } else {
          options = newValue;
          newValue = example;
          example = collection;
          collection = db._collection;
        }
      }
      var data = {
        collection: collection,
        example: example,
        newValue: newValue
      };

      return db.put(path + 'update-by-example', applyOptions(this, data, options), callback);
    },
    /**
     * This will return the first documents matching a given example.
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Object} example - An object defining the example.
     * @param {Object} [options] -  JSONObject with optional parameters:
     * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
     * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method firstByExample
     */
    "firstByExample": function (collection, example, options, callback) {
      if (typeof example === "function") {
        callback = example;
        example = collection;
        options = {};
        collection = db._collection;
      }
      if (typeof options === "function") {
        callback = options;
        if (typeof collection === "string") {
          options = {};
        } else {
          options = example;
          example = collection;
          collection = db._collection;
        }
      }
      var data = {
        collection: collection,
        example: example
      }
      return db.put(path + 'first-example', applyOptions(this, data, options), callback);
    },
    /**
     * This will return the first documents from the collection, in the order of insertion/update time. When the count
     * argument is supplied, the result will be a list of documents, with the "oldest" document being first in the
     * result list. If the count argument is not supplied, the result is the "oldest" document of the collection,
     * or null if the collection is empty.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Number} [count=1]  - the number of documents to return at most.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method first
     */
    "first": function (collection, count, callback) {
      if (typeof collection === "function") {
        callback = collection;
        count = undefined;
        collection = db._collection;
      }
      if (typeof count === "function") {
        callback = count;
        if (typeof collection === "string") {
          count = undefined;
        } else {
          count = collection;
          collection = db._collection;
        }
      }
      var data = {
        collection: collection
      }
      if (count !== null) {
        data.count = count;
      }
      return db.put(path + 'first', data, callback);
    },

    /**
     * This will return the last documents from the collection, in the order of insertion/update time. When the count
     * argument is supplied, the result will be a list of documents, with the "newest" document being first in the
     * result list. If the count argument is not supplied, the result is the "newest" document of the collection,
     * or null if the collection is empty.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Number} [count=1]  - the number of documents to return at most.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method last
     */
    "last": function (collection, count, callback) {
      if (typeof collection === "function") {
        callback = collection;
        count = undefined;
        collection = db._collection;
      }
      if (typeof count === "function") {
        callback = count;
        if (typeof collection === "string") {
          count = undefined;
        } else {
          count = collection;
          collection = db._collection;
        }
      }
      var data = {
        collection: collection
      }
      if (count !== null) {
        data.count = count;
      }
      return db.put(path + 'last', data, callback);
    },
    /**
     * This will find all documents within a given range. You must declare a skip-list index on the attribute in order
     * to be able to use a range query.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {String} attribute     - the attribute path to check.
     * @param {Number|String} left - The lower bound.
     * @param {Number|String} right    - The upper bound.
     * @param {Object} [options] -  JSONObject with optional parameters:
     * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
     * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
     * @param {Number} [options.closed=false] - If true, use interval including left and right, otherwise exclude
     * right, but include left.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method range
     */
    "range": function (collection, attribute, left, right, options, callback) {
      if (typeof right === "function") {
        callback = right;
        right = left;
        left = attribute;
        attribute = collection;
        options = {};
        collection = db._collection;
      }
      if (typeof options === "function") {
        callback = options;
        if (typeof right === "object") {
          options = right;
          right = left;
          left = attribute;
          attribute = collection;
          collection = db._collection;
        } else {
          options = {};
        }
      }
      var data = {
        collection: collection,
        attribute: attribute,
        left: left,
        right: right
      };
      return db.put(path + 'range', applyOptions(this, data, options), callback);
    },
    /**
     * The default will find at most 100 documents near a given coordinate. The returned list is sorted according to the
     * distance, with the nearest document coming first. If there are near documents of equal distance, documents are
     * chosen randomly from this set until the limit is reached. In order to use the near operator, a geo index must be
     * defined for the collection. This index also defines which attribute holds the coordinates for the document.
     * If you have more then one geo-spatial index, you can use the geo field to select a particular index.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Number} latitude      - The latitude of the coordinate.
     * @param {Number} longitude     - The longitude of the coordinate.
     * @param {Object} [options] -  JSONObject with optional parameters:
     * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
     * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
     * @param {Number} [options.geo] -   If given, the identifier of the geo-index to use.
     * @param {Number} [options.distance] - If given, the attribute key used to store the distance.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method near
     */
    "near": function (collection, latitude, longitude, options, callback) {
      if (typeof longitude === "function") {
        callback = longitude;
        longitude = latitude;
        latitude = collection;
        collection = db._collection;
      }
      if (typeof options === "function") {
        callback = options;
        if (typeof longitude === "object") {
          options = longitude;
          longitude = latitude;
          latitude = collection;
          collection = db._collection;
        } else {
          options = {};
        }
      }
      var data = {
        collection: collection,
        latitude: latitude,
        longitude: longitude
      };
      return db.put(path + 'near', applyOptions(this, data, options), callback);
    },
    /**
     * This will find all documents with in a given radius around the coordinate (latitude, longitude). The returned
     * list is sorted by distance. In order to use the near operator, a geo index must be
     * defined for the collection. This index also defines which attribute holds the coordinates for the document.
     * If you have more then one geo-spatial index, you can use the geo field to select a particular index.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Number} latitude      - The latitude of the coordinate.
     * @param {Number} longitude     - The longitude of the coordinate.
     * @param {Number} radius        - The radius in meters.
     * @param {Object} [options] -  JSONObject with optional parameters:
     * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
     * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
     * @param {Number} [options.geo] -   If given, the identifier of the geo-index to use.
     * @param {Number} [options.distance] - If given, the attribute key used to store the distance.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method within
     */
    "within": function (collection, latitude, longitude, radius, options, callback) {
      if (typeof radius === "function") {
        callback = radius;
        radius = longitude;
        longitude = latitude;
        latitude = collection;
        collection = db._collection;
      }
      if (typeof options === "function") {
        callback = options;
        if (typeof radius === "object") {
          options = radius;
          radius = longitude;
          longitude = latitude;
          latitude = collection;
          collection = db._collection;
        } else {
          options = {};
        }
      }
      var data = {
        collection: collection,
        latitude: latitude,
        longitude: longitude,
        radius: radius
      };
      return db.put(path + 'within', applyOptions(this, data, options), callback);
    },
    /**
     * This will find all documents from the collection that match the fulltext query specified in query. In order to
     * use the fulltext operator, a fulltext index must be defined for the collection and the specified attribute.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {String} attribute    - the attribute
     * @param {String} query         - the query
     * @param {Object} [options] -  JSONObject with optional parameters:
     * @param {Number} [options.skip]  -   can also be set using the "skip" method in this class.
     * @param {Number} [options.limit]  -  can also be set using the "limit" method in this class
     * @param {Number} [options.index]  -   If given, the identifier of the fulltext-index to use.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method fulltext
     */
    "fulltext": function (collection, attribute, query, options, callback) {
      if (typeof query === "function") {
        callback = query;
        query = attribute;
        attribute = collection;
        collection = db._collection;
      }
      if (typeof options === "function") {
        callback = options;
        if (typeof query === "object") {
          options = query;
          query = attribute;
          attribute = collection;
          collection = db._collection;
        } else {
          options = {};
        }
      }
      var data = {
        collection: collection,
        attribute: attribute,
        query: query
      };
      return db.put(path + 'fulltext', applyOptions(this, data, options), callback);
    },
    /**
     * Set the amount of elements to skip for queries performed with this instance.
     *
     * @param {Number} val   - The number of elements to skip.
     * @return{simple} -  the modified instance
     * @method skip
     */

    "skip": function (val) {
      this._skip = val;
      return this;
    },
    /**
     * Set the limit for the result set for queries performed with this instance.
     *
     * @param {Number} val   - The result limit.
     * @return{simple} -  the modified instance
     * @method limit
     */

    "limit": function (val) {
      this._limit = val;
      return this;
    }
  }
}

function applyOptions(o, data, attributes) {
  if (typeof attributes === 'object') {
    Object.keys(attributes).forEach(function (option) {
      switch (option) {
        case 'from':
          data.left = attributes[option];
          data.closed = true;
          break;
        case 'to':
          data.right = attributes[option];
          data.closed = true;
          break;
        default:
          data[option] = attributes[option];
          break;
      }
    });
  }
  if (o._skip && data.skip === undefined) data.skip = o._skip;
  if (o._limit && data.limit === undefined) data.limit = o._limit;

  return data;
}
module.exports = Arango.api('simple', SimpleAPI);

});
require.register("arango/lib/api/index.js", function(module, exports, require){
var Arango = require('../arango');


/**
 * The api module to create indices for collections in ArangoDB.
 *
 * @class index
 * @module arango
 * @submodule index
 **/
function IndexAPI(db) {
  var path = "/_api/index/",
    xpath = "/_api/index?collection=";

  return {
    /**
     * Creates a Cap Index for the collection
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Object} data       - a JSON Object containing at least one attributes:
     * @param {Number} [data.size] -  The maximal number of documents for the collection.
     * @param {Number} [data.byteSize] - The maximal size of the active document data in the collection.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method createCapIndex
     */
    "createCapIndex": function (collection, data, callback) {
      if (typeof data === 'function') {
        callback = data;
        if (typeof collection === "string") {
          throw "size or byteSize must be set.";
        } else {
          data = collection;
          collection = db._collection;
        }
      }

      data.type = "cap";
      return db.post(xpath + collection, data, callback);
    },
    /**
     * Creates a geo-spatial Index for the collection
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {List} fields  - A list with one or two attribute paths. If it is a list with one attribute path
     * location, then a geo-spatial index on all documents is created using location as path to the coordinates.
     * The value of the attribute must be a list with at least two double values. The list must contain the latitude
     * (first value) and the longitude (second value). All documents, which do not have the attribute path or with
     * value that are not suitable, are ignored. If it is a list with two attribute paths latitude and longitude,
     * then a geo-spatial index on all documents is created using latitude and longitude as paths the latitude and
     * the longitude. The value of the attribute latitude and of the attribute longitude must a double. All
     * documents, which do not have the attribute paths or which values are not suitable, are ignored.
     *
     * @param {Object} [options]  - a JSONObject with optional parameters:
     * @param {Boolean} [options.geoJson]: If a geo-spatial index on a location is constructed and geoJson is true,
     * then the order within the list is longitude followed by latitude. This corresponds to the format described in
     * http://geojson.org/geojson-spec.html#positions
     * @param {Object} [options.constraint=false] - If constraint is true, then a geo-spatial constraint is created.
     * The constraint is a non-unique variant of the index. Note that it is also possible to set the unique
     * attribute instead of the constraint attribute.
     * @param {Object} [options.ignoreNull=false] - If a geo-spatial constraint is created and ignoreNull is true,
     * then documents with a null in location or at least one null in latitude or longitude are ignored.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method createGeoSpatialIndex
     */
    "createGeoSpatialIndex": function (collection, fields, options, callback) {
      if (typeof fields === 'function') {
        callback = fields;
        options = {};
        fields = collection;
        collection = db._collection;
      }
      if (typeof options === 'function') {
        callback = options;
        if (typeof collection !== "string") {
          options = fields;
          fields = collection;
          collection = db._collection;
        } else {
          options = {};
        }
      }
      options.type = "geo";
      options.fields = fields;
      return db.post(xpath + collection, options, callback);
    },
    /**
     * Creates a hash index for the collection collection-name, if it does not already exist.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {List} fields        - A list of attribute paths.
     * @param {Boolean} [unique=false]    -  If true, then create a unique index.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method createHashIndex
     */
    "createHashIndex": function (collection, fields, unique, callback) {
      if (typeof fields === 'function') {
        callback = fields;
        unique = false;
        fields = collection;
        collection = db._collection;
      }
      if (typeof unique === 'function') {
        callback = unique;
        if (typeof collection !== "string") {
          unique = fields;
          fields = collection;
          collection = db._collection;
        } else {
          unique = false;
        }
      }
      var options = {};
      options.type = "hash";
      options.fields = fields;
      options.unique = unique;
      return db.post(xpath + collection, options, callback);
    },
    /**
     * Creates a skip-List index for the collection collection-name, if it does not already exist.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {List} fields        - A list of attribute paths.
     * @param {Boolean} [unique=false]    -  If true, then create a unique index.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method createSkipListIndex
     */
    "createSkipListIndex": function (collection, fields, unique, callback) {
      if (typeof fields === 'function') {
        callback = fields;
        unique = false;
        fields = collection;
        collection = db._collection;
      }
      if (typeof unique === 'function') {
        callback = unique;
        if (typeof collection !== "string") {
          unique = fields;
          fields = collection;
          collection = db._collection;
        } else {
          unique = false;
        }
      }
      var options = {};
      options.type = "skiplist";
      options.fields = fields;
      options.unique = unique;
      return db.post(xpath + collection, options, callback);
    },
    /**
     * Creates a fulltext index for the collection collection-name, if it does not already exist.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {List} fields        - A list of attribute paths.
     * @param {Number} [minLength]  - Minimum character length of words to index. Will default to a server-defined
     * value if unspecified. It is thus recommended to set this value explicitly when creating the index.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method createFulltextIndex
     */
    "createFulltextIndex": function (collection, fields, minLength, callback) {
      if (typeof fields === 'function') {
        callback = fields;
        minLength = false;
        fields = collection;
        collection = db._collection;
      }
      if (typeof minLength === 'function') {
        callback = minLength;
        if (typeof collection !== "string") {
          minLength = fields;
          fields = collection;
          collection = db._collection;
        } else {
          minLength = false;
        }
      }
      var options = {};
      options.type = "fulltext";
      options.fields = fields;
      if (minLength !== false) {
        options.minLength = minLength;
      }
      return db.post(xpath + collection, options, callback);
    },
    /**
     * Creates a bitarray index for the collection collection-name, if it does not already exist.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {List} fields        - A list of attribute paths.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method createBitarrayIndex
     */
    "createBitarrayIndex": function (collection, fields, callback) {
      if (typeof fields === "function") {
        callback = fields;
        fields = collection;
        collection = db._collection;
      }
      var options = {};
      options.type = "bitarray";
      options.fields = fields;
      options.unique = false;
      return db.post(xpath + collection, options, callback);
    },
    /**
     * Retrieves an index
     * @param {String} id  -   the index id.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method get
     */
    "get": function (id, callback) {
      return db.get(path + id, callback);
    },
    /**
     * Deletes an index
     * @param {String} id  -   the index id.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method delete
     */
    "delete": function (id, callback) {
      return db.delete(path + id, callback);
    },
    /**
     * Retrieves all indices for a collection
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method list
     */
    "list": function (collection, callback) {
      if (typeof collection === "function") {
        callback = collection;
        collection = db._collection;
      }
      return db.get(xpath + collection, callback);
    }
  }
}


module.exports = Arango.api('index', IndexAPI);

});
require.register("arango/lib/api/admin.js", function(module, exports, require){
var Arango = require('../arango');

/**
 * The api module to do administrative requests on Arango
 *
 * @module arango
 * @class admin
 * @submodule admin
 **/
function AdminAPI(db) {
  var path = "/_admin/";

  return {
    /**
     * Returns the server version
     *
     * @param {Boolean} details     - If true more details are returned.
     * @param {Function} callback   - The callback function.
     * @method version
     * @return {Promise}
     */
    "version": function (details, callback) {
      return db.get(path + "version?details=" + !!details, callback);
    },
    /**
     * Returns server statistics.
     *
     * @param {Function} callback   - The callback function.
     * @method statistics
     * @return {Promise}
     */
    "statistics": function (callback) {
      return db.get(path + "statistics", callback);
    },
    /**
     * Returns servers role. Possible values are "UNDEFINED", "COORDINATOR" or "PRIMARY".
     *
     * @param {Function} callback   - The callback function.
     * @method role
     * @return {Promise}
     */
    "role": function (callback) {
      return db.get(path + "server/role");
    },
    /**
     * Returns descriptions for server statistics.
     *
     * @param {Function} callback   - The callback function.
     * @method statisticsDescription
     * @return {Promise}
     */
    "statisticsDescription": function (callback) {
      return db.get(path + "statistics-description", callback);
    },
    /**
     * Returns the server logs.
     *
     * @param {Object} [options]        - Optional parameters and filters, can contain.
     * @param {String} [options.upto]       - Returns all log entries up to log level upto. Note that upto must be:
     * <br>\- fatal or 0 <br>- error or 1 <br>- warning or 2 <br>- info or 3 <br>- debug or 4 <br>The default value
     * is info.
     * @param {String} [options.level]      - Returns all log entries of log level level. Note that the URL
     * parameters upto and level are mutually exclusive.
     * @param {String} [options.start]      - Returns all log entries such that their log entry identifier (lid
     * value) is greater or equal to start.
     * @param {Number} [options.size]      - Restricts the result to at most size log entries.
     * @param {Number} [options.offset]    - Starts to return log entries skipping the first offset log entries.
     * offset and size can be used for pagination.
     * @param {String} [options.sort]       - Sort the log entries either ascending (if sort is asc) or descending
     * (if sort is desc) according to their lid values. Note that the lid imposes a chronological order. The default
     * value is asc
     * @method log
     * @return {Promise}
     */
    "log": function (options, callback) {

      params = "";
      if (options) {
        Object.keys(options).forEach(function (param) {
          params += param + '=' + options[param] + "&";
        });
      }
      return db.get(path + "log?" + params, callback);
    },
    /**
     * Returns the routes defined in ArangoDB,
     *
     * @param {Function} callback   - The callback function.
     * @method routes
     * @return {Promise}
     */
    "routes": function (callback) {
      return db.get(path + "routing/routes", callback);
    },
    /**
     * Reloads the routes in ArangoDB.
     *
     * @param {Function} callback   - The callback function.
     * @method routesReload
     * @return {Promise}
     */
    "routesReload": function (callback) {
      return db.get(path + "routing/reload", callback);
    },
    /**
     * Flushes the server modules.
     *
     * @param {Function} callback   - The callback function.
     * @method modulesFlush
     * @return {Promise}
     */
    "modulesFlush": function (callback) {
      return db.get(path + "modules/flush", callback);
    },
    /**
     * Returns the server time.
     *
     * @param {Function} callback   - The callback function.
     * @method time
     * @return {Promise}
     */
    "time": function (callback) {
      return db.get(path + "time", callback);
    },
    /**
     * The call returns an object with the following attributes: <br>- headers: a list of HTTP headers received
     * \n<br>- requestType: the HTTP request method (e.g. GET)<br>- parameters: list of URL parameters received
     *
     * @param {Function} callback   - The callback function.
     * @method echo
     * @return {Promise}
     */
    "echo": function (method, htmloptions, data, headers, callback) {
      method = typeof method === 'string' ? method.toUpperCase() : 'GET';
      headers = {
        headers: headers
      };
      htmloptions = htmloptions ? htmloptions : '';

      return db.request(method, path + 'echo' + htmloptions, data, headers, callback);
    },

    /**
     * Flushes the server wal.
     *
     * @param {Boolean} waitForSync        - Should wait if everything is synced to disk.
     * @param {Boolean} waitForCollector   - Should wait for the collector to execute.
     * @param {Function} callback          - The callback function.
     * @method modulesFlush
     * @return {Promise}
     */
    "walFlush": function (waitForSync, waitForCollector, callback) {
      var pathSuffix = "wal/flush";
      if (waitForSync) {
        pathSuffix += "?waitForSync=" + waitForSync;
      }
      if (waitForCollector) {
        pathSuffix += "?waitForCollector=" + waitForCollector;
      }
      return db.put(path + pathSuffix, undefined, callback);
    }
  }
}

module.exports = Arango.api('admin', AdminAPI);

});
require.register("arango/lib/api/aqlfunction.js", function(module, exports, require){
var Arango = require('../arango');

/**
 * The api module "aqlfunction" to define user functions in ArangoDB.
 *
 * @class aqlfunction
 * @module arango
 * @submodule aqlfunction
 **/
function AqlfunctionAPI(db) {
    var path = "/_api/aqlfunction/";

    return {
	/**
	 * Creates a user defined AQL function.
	 *
	 * @param {String} name - name of the function.
	 * @param {String} code - the function.
	 * @param {Boolean} [isDeterministic]   -   boolean value to indicate that the function results are fully
	 * deterministic.
	 * @param {Function} callback   - The callback function.
	 * @method create
	 * @return{Promise}
	 */
	"create": function (name, code, isDeterministic, callback) {
	    var options = {
		"name": name,
		"code": code
	    };
	    
	    if (typeof isDeterministic === 'function') {
		callback = isDeterministic;
		isDeterministic = null;
	    }
	    
	    if(isDeterministic === true)
		options.isDeterministic = isDeterministic;
	    
	    return db.post(path, options, callback);
	},
	/**
	 * Deletes a user defined AQL function.
	 *
	 * @param {String} name - name of the function.
	 * @param {Boolean} [group] - if set to true all functions is the namespace set in name will be deleted.
	 * @param {Function} callback   - The callback function.
	 * @method delete
	 * @return{Promise}
	 */
	"delete": function (name, group, callback) {
	    return db.delete(path + encodeURIComponent(name) + "/?group=" + group, callback);
	},
	/**
	 * Returns all user defined AQL functions.
	 *
	 * @param {String} [namespace] - If set only functions in this namespace will be returned.
	 * @param {Function} callback   - The callback function.
	 * @method get
	 * @return{Promise}
	 */
	"get": function (namespace, callback) {
	    var params = "";
	    if (typeof namespace === 'string') {
		params += '?namespace=' + encodeURIComponent(namespace);
	    }
	    
	    return db.get(path + params, callback);
	}
    }
}

module.exports = Arango.api('aqlfunction', AqlfunctionAPI);

});
require.register("arango/lib/api/traversal.js", function(module, exports, require){
var Arango = require('../arango');
/**
 * The api module to perform a traversal on the edges of a start vertex.
 *
 * @class traversal
 * @module arango
 * @submodule traversal
 **/
function TraversalAPI(db) {
  var path = "/_api/traversal/";

  return {
    /**
     *
     * @param {String} startVertex     -  id of the startVertex, e.g. "users/foo".
     * @param {String} edgeCollection  -  the edge collection containing the edges.
     * @param {Object} options - a JSON Object contatining optional parameter:
     * @param {String} [options.filter] -  body (JavaScript code) of custom filter function
     * (signature (config, vertex, path) -> mixed) can return four different string values: <br>- "exclude" -> this
     * vertex will not be visited.<br>- "prune" -> the edges of this vertex will not be followed.<br>- "" or
     * undefined -> visit the vertex and follow it's edges.<br>- Array -> containing any combination of the above.
     * @param {Number} [options.minDepth]  -   visits only nodes in at least the given depth
     * @param {Number} [options.maxDepth]  -   visits only nodes in at most the given depth
     * @param {String} [options.visitor] - body (JavaScript) code of custom visitor function (signature: (config,
     * result, vertex, path) -> void visitor). Function can do anything, but its return value is ignored. To populate
     * a result, use the result variable by reference.
     * @param {String} [options.direction] - direction for traversal.  if set, must be either "outbound", "inbound",
     * or "any" , if not set, the expander attribute must be specified.
     * @param {String} [options.init] - body (JavaScript) code of custom result initialisation function (signature
     * (config, result) -> void)  initialise any values in result with what is required,
     * @param {String} [options.expander]  - body (JavaScript) code of custom expander function must be set if
     * direction attribute is not set. function (signature (config, vertex, path) -> array)  expander must return an
     * array of the connections for vertex.Each connection is an object with the attributes edge and vertex
     * @param {String} [options.strategy] - traversal strategy can be "depthfirst" or "breadthfirst"
     * @param {String} [options.order] - traversal order can be "preorder" or "postorder"
     * @param {String} [options.itemOrder] - item iteration order can be "forward" or "backward"
     * @param {String} [options.uniqueness] - specifies uniqueness for vertices and edges visited if set, must be an
     * object like this: "uniqueness": {"vertices": "none"|"global"|path", "edges": "none"|"global"|"path"}.
     * @param {Number} [options.maxIterations] - Maximum number of iterations in each traversal. This number can be
     * set to prevent endless loops in traversal of cyclic graphs. When a traversal performs as many iterations as
     * the maxIterations value, the traversal will abort with an error. If maxIterations is not set, a
     * server-defined value may be used.
     * @param {Function} callback   - The callback function.
     * @method startTraversal
     * @return{Promise}
     */
    "startTraversal": function (startVertex, edgeCollection, options, callback) {

      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      options.edgeCollection = edgeCollection;
      options.startVertex = startVertex;

      return db.post(path, options, null, callback);
    }
  }
}


module.exports = Arango.api('traversal', TraversalAPI);

});
require.register("arango/lib/api/endpoint.js", function(module, exports, require){
var Arango = require('../arango');

/**
 * The api module to maintain endpoints in ArangoDB.
 *
 * @class endpoint
 * @module arango
 * @submodule endpoint
 **/
function EndpointAPI(db) {
  var path = "/_api/endpoint";

  return {
    /**
     *
     * creates an endpoint
     *
     * @param {String} endpoint -  the endpoint specification, e.g. tcp://127.0.0.1:8530
     * @param {List} databases - a list of database names the endpoint is responsible for.
     * @param {Function} callback   - The callback function.
     * @method create
     * @return{Promise}
     */
    "create": function (endpoint, databases, callback) {
      var description = {};

      description.endpoint = endpoint;
      description.databases = databases;

      return db.post(path, description, callback);
    },
    /**
     * Returns the list of endpoints
     *
     * @param {Function} callback   - The callback function.
     * @method get
     * @return{Promise}
     */
    "get": function (callback) {
      return db.get(path, null, callback);
    },
    /**
     * Deletes an endpoint
     *
     * @param {String} endpoint -  the endpoint specification, e.g. tcp://127.0.0.1:8530
     * @param {Function} callback   - The callback function.
     * @method delete
     * @return{Promise}
     */
    "delete": function (endpoint, callback) {
      return db.delete(path + "/" + encodeURIComponent(endpoint), callback);
    }
  }
}


module.exports = Arango.api('endpoint', EndpointAPI);

});
require.register("arango/lib/api/import.js", function(module, exports, require){
var Arango = require('../arango'),
    url = require('../url');

/**
 * The api module to import data into ArangoDB.
 *
 * @class import
 * @module arango
 * @submodule import
 **/
function ImportAPI(db) {
    var path = "/_api/import";

    return {

	/**
	 * Imports data from a JSON Object.
	 *
	 * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
	 * in the connection is used.
	 * @param {Object} documents  - The data to import, can either be one single JSON Object containing a list of
	 * documents or a list of JSON Objects seperated ny new lines.
	 * @param {Object} [options]    - a JSON Object containting the following optional parameters:
	 * @param {Object} [options.createCollection=false] - If true, the collection will be created if it doesn't
	 * exist.
	 * @param {Object} [options.waitForSync=false] -  Wait until documents have been synced to disk before returning.
	 * @param {Object} [options.complete=false] -  If set to true, it will make the whole import fail if any error
	 * occurs.
	 * @param {Object} [options.details=false] -  If set to true or yes, the result will include an attribute
	 * details with details about documents that could not be imported.
	 * @param {Function} callback   - The callback function.
	 * @method importJSONData
	 * @return{Promise}
	 */
	"importJSONData": function (collection, documents, options, callback) {
	    if (typeof collection !== 'string') {
		callback = options;
		options = documents;
		documents = collection;
		collection = db._collection;
	    }

	    if(typeof documents === 'function'){
		callback = documents;
		documents = null;
		options = {};
	    } else if(typeof options === 'function'){
		callback = options;
		options = {};
	    }

	    options = options || {};
	    
	    options.type = "auto";
	    options.collection = collection;
	    return db.post(path + url.options(options), documents, callback);
	},
	/**
	 *
	 * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
	 * in the connection is used.
	 * @param {Object} documents  - The data to import, The first line of the request body must contain a
	 * JSON-encoded list of attribute names. All following lines in the request body must contain JSON-encoded lists
	 * of attribute values. Each line is interpreted as a separate document, and the values specified will be mapped
	 * to the list of attribute names specified in the first header line.
	 * @param {Object} [options]    - a JSON Object containting the following optional parameters:
	 * @param {Object} [options.createCollection=false] - If true, the collection will be created if it doesn't
	 * exist.
	 * @param {Object} [options.waitForSync=false] -  Wait until documents have been synced to disk before returning.
	 * @param {Object} [options.complete=false] -  If set to true, it will make the whole import fail if any error
	 * occurs.
	 * @param {Object} [options.details=false] -  If set to true or yes, the result will include an attribute
	 * details with details about documents that could not be imported.
	 * @param {Function} callback   - The callback function.
	 * @method importValueList
	 * @return{Promise}
	 */
	"importValueList": function (collection, documents, options, callback) {
	    if (typeof collection !== 'string') {
		callback = options;
		options = documents;
		documents = collection;
		collection = db._collection;
	    }

	    if(typeof documents === 'function'){
		callback = documents;
		documents = null;
		options = {};
	    } else if(typeof options === 'function'){
		callback = options;
		options = {};
	    }

	    options = options || {};
	    
	    options.collection = collection;
	    
	    return db.post(path + url.options(options), documents, {
		"NoStringify": true
	    }, callback);
	}
    }
}


module.exports = Arango.api('import', ImportAPI);

});
require.register("arango/lib/api/query.js", function(module, exports, require){
var Arango = require('../arango'),
  utils = require('../utils');

require('./cursor');
/**
 * The api module to create and execute queries running in ArangoDB.
 * This module wraps the cursor module.
 *
 * @class query
 * @module arango
 * @submodule query
 **/
/**
 *
 * AQL function "for",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationFor">AQL Documentation</a>
 *
 * @return{Aql}
 * @method for
 */
/**
 *
 * AQL function "in",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationIn">AQL Documentation</a>
 *
 * @return{Aql}
 * @method in
 */
/**
 *
 * AQL function "filter",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationFilter">AQL Documentation</a>
 *
 * @return{Aql}
 * @method filter
 */
/**
 *
 * AQL function "from",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationFrom">AQL Documentation</a>
 *
 * @return{Aql}
 * @method from
 */
/**
 *
 * AQL function "include",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationInclude">AQL Documentation</a>
 *
 * @return{Aql}
 * @method include
 */
/**
 *
 * AQL function "collect",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationCollect">AQL Documentation</a>
 *
 * @return{Aql}
 * @method collect
 */
/**
 *
 * AQL function "into",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationInto">AQL Documentation</a>
 *
 * @return{Aql}
 * @method into
 */
/**
 *
 * AQL function "sort",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationSort">AQL Documentation</a>
 *
 * @return{Aql}
 * @method sort
 */

/**
 *
 * AQL function "limit",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationLimit">AQL Documentation</a>
 *
 * @return{Aql}
 * @method limit
 */
/**
 *
 * AQL function "let",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationLet">AQL Documentation</a>
 *
 * @return{Aql}
 * @method let
 */
/**
 *
 * AQL function "return",see <a href="https://www.arangodb.org/manuals/current/Aql.html#AqlOperationReturn">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_edges",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_edges">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_vertices",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_vertices">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_neighbors",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_neighbors">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_common_neighbors",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_common_neighbors">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_common_properties",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_common_properties">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_paths",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_paths">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_shortest_path",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_shortest_path">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_traversal",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_traversal">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_traversal_tree",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_traversal_tree">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_distance_to",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_distance_to">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_absolute_eccentricity",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_absolute_eccentricity">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_eccentricity",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_eccentricity">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_absolute_closeness",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_absolute_closeness">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_closeness",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_closeness">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_absolute_betweenness",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_absolute_betweenness">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_betweenness",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_betweenness">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_radius",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_radius">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
/**
 *
 * AQL function "graph_diameter",see <a href="https://docs.arangodb.org/Aql/GraphOperations.html#graph_diameter">AQL Documentation</a>
 *
 * @return{Aql}
 * @method return
 */
function Aql() {

  var keywords = [
    'for',
    'in',
    'filter',
    'from',
    'include',
    'collect',
    'into',
    'sort',
    'limit',
    'let',
    'return'
  ],
  graphKeywords = [
    "graph_vertices",
    "graph_edges",
    "graph_neighbors",
    "graph_common_neighbors",
    "graph_common_properties",
    "graph_paths",
    "graph_shortest_path",
    "graph_traversal",
    "graph_traversal_tree",
    "graph_distance_to",
    "graph_absolute_eccentricity",
    "graph_eccentricity",
    "graph_absolute_closeness",
    "graph_closeness",
    "graph_absolute_betweenness",
    "graph_betweenness",
    "graph_radius",
    "graph_diameter"
  ],
  aql = this,
  bindGraphKeywords = function(bindee) {
    graphKeywords.forEach(function(key) {
      bindee[key] = function() {
        var aqlString = key.toUpperCase();
        aqlString += "(";
        var args = Array.prototype.slice.call(arguments);
        aqlString += args.map(function(arg) {
          if (typeof arg === "object") {
            return JSON.stringify(arg);
          }
          return "\"" + arg + "\"";
        }).join(",");
        aqlString += ")";
        bindee(aqlString);
        return aql;
      };
    });
  };

  keywords.forEach(function (key) {
    aql[key] = function () {
      if (!aql.struct) aql.struct = {};
      if (!arguments.length) return aql.struct[key];
      var args = Array.prototype.slice.call(arguments);
      if (typeof args[0] === 'function') {
        aql.struct[key] = (function (func) {
          var faql = new Aql();
          func.apply(faql);

          return faql.struct;
        })(args[0]);
      } else if (args[0] instanceof Aql) {
        aql.struct[key] = args[0].struct;
      } else {
        if (key === 'filter' || key === 'let') {
          if (!aql.struct[key]) aql.struct[key] = [];
          aql.struct[key].push(args.join(' '));
        } else aql.struct[key] = args.join(' ');
      }
      return aql;
    };
  });

  aql['string'] = function () {
    if (!aql.struct) aql.struct = {};
    if (!arguments.length) return aql.struct['string'];
    var args = Array.prototype.slice.call(arguments);
    aql.struct = { 'string': args[0] };
    return aql;
  }

  bindGraphKeywords(aql.in);
  bindGraphKeywords(aql.return);

  function structToString(s) {
    var struct = s || aql.struct;
    if (struct.hasOwnProperty('string')) {
      return struct['string'];
    }
    return keywords.concat(graphKeywords)
      .filter(function (key) {
      return !!struct[key];
    }).map(function (q) {
        var keyword = q.toUpperCase(),
          value = struct[q],
          str;

        switch (keyword) {
          case 'FROM':
            keyword = 'IN';
            break;
          case 'INCLUDE':
            keyword = '';
            break;
          case 'FILTER':
            value = value.join(' && ');
            break;
          case 'LET':
            value = value.join(' LET ');
            break;
          default:
            break;
        }

        if (typeof value === 'object') {
          var nested = structToString(value);

          if (q === 'in') str = keyword + ' ( ' + nested + ' )';
          else str = keyword + ' ' + nested;

        } else str = keyword + ' ' + value;

        return str;
      }).join(' ');
  }

  aql.toString = structToString;
}

function QueryAPI(db) {
  if (!(this instanceof QueryAPI))
    return new QueryAPI(db);

  var query = this;

  this.options = {};
  this.db = db;

  Aql.call(this);

  /* transforms struct to string */
  Object.defineProperty(this, "query", {
    stringValue: null,
    get: function () {
      if (query.struct) {
        this.stringValue = query.toString();
        delete query.struct;
      }

      return this.stringValue;
    },
    set: function (val) {
      this.stringValue = val;
      delete query.struct;

      return this.stringValue;
    }
  });
}

utils.inherit(QueryAPI, Aql);

function exec_query(query, method, args) {
  var q = {}, i = 0,
    a = Array.prototype.slice.call(args);

  utils.extend(true, q, query.options);

  /* use Aql object */
  if (a[i] instanceof Aql)
    q.query = a[i++].toString();
  /* use query string */
  else if (typeof a[i] === 'string')
    q.query = a[i++];
  else
    q.query = query.query;

  /* merge with object */
  if (typeof a[i] === 'object') {
    if (a[i].hasOwnProperty('bindVars'))
      utils.extend(true, q, a[i++]);
    else q.bindVars = a[i++];
  }

  return query.db.cursor[method](q, a[i]);
}

QueryAPI.prototype = {
  /**
   *
   * Test the current query.
   *
   * @method test
   * @return{Promise}
   */
  "test": function () {
    return exec_query(this, "query", arguments);
  },
  /**
   *
   * Explain the current query.
   *
   * @return{Promise}
   * @method explain
   */
  "explain": function () {
    return exec_query(this, "explain", arguments);
  },
  /**
   *
   * Execute the current query.
   *
   * @method execute
   * @return{Promise}
   */
  "exec": function () {
    var db = this.db;

    var on_result = function (retval) {

      if (retval.hasMore) {
        this.hasNext = function() {
          return true;
        };
        this.next = function () {
          return db.cursor.get(retval.id).then(on_result);
        };
      } else {
        delete this.next;
        this.hasNext = function() {
          return false;
        };
      }
      return retval.result;
    };
    return exec_query(this, "create", arguments).then(on_result);
  },
  /**
   *
   * Sets the count and batchsize options for the query for this instance.
   * @param {Number} num - the desired batchsize.
   * @method test
   * @return {QueryAPI}
   */
  "count": function (num) {
    this.options.count = num > 0 ? true : false;
    this.options.batchSize = num > 0 ? num : undefined;

    return this;
  },
  /**
   *
   * Returns a fresh query instance.
   * @method test
   * @return {Aql}
   */
  "new": function () {
    return new Aql();
  },
  /**
   *
   * Returns true if there is more data to fetch,
   *
   * @return {Boolean}
   * @method test
   */
  "hasNext": function () {
    return this.next !== QueryAPI.prototype.next;
  },
  "next": function () {
    throw {
      name: "StopIteration"
    };
  }
};

module.exports = Arango.api('query', QueryAPI);

});
require.register("arango/lib/api/graph.js", function(module, exports, require){
/*jslint stupid: true*/

var Arango = require('../arango'),
  url = require('../url'),
  utils = require('../utils');

////////////////////////////////////////////////////////////////////////////////
/// @brief returns the compare operator (throws exception)
////////////////////////////////////////////////////////////////////////////////

function process_property_compare (compare) {
  if (compare === undefined) {
    return "==";
  }

  switch (compare) {
    case ("==") :
      return compare;

    case ("!=") :
      return compare;

    case ("<") :
      return compare;

    case (">") :
      return compare;

    case (">=") :
      return compare;

    case ("<=") :
      return compare;
  }

  throw "unknown compare function in property filter";
}

function filterDirection(filter, options) {
  switch (filter.direction) {
    case "in":
      options.direction = "inbound";
      break;
    case "out":
      options.direction = "outbound";
      break;
    case "any":
      options.direction = "any";
      break;
    default:
  }
}

function concatFilterStatement(filter, statement) {
  if (filter === "") {
    return " FILTER " + statement;
  }
  filter += " && " + statement;
  return filter;
}

////////////////////////////////////////////////////////////////////////////////
/// @brief fills a filter (throws exception)
////////////////////////////////////////////////////////////////////////////////

function process_property_filter (bindVars, filter, num, property, collname) {
  if (property.key === undefined) {
    throw "error in property filter";
  } 
  if (property.compare === "HAS") {
    bindVars["key" + num.toString()] = property.key;
    return concatFilterStatement(filter,
      "HAS(" + collname + ", @key" + num.toString() + ") "
    );
  }
  if (property.compare === "HAS_NOT") {
    bindVars["key" + num.toString()] = property.key;
    return concatFilterStatement(filter,
      "!HAS(" + collname + ", @key" + num.toString() + ") "
    );
  }
  if (property.value !== undefined) {
    bindVars["key" + num.toString()] = property.key;
    bindVars["value" + num.toString()] = property.value;
    return concatFilterStatement(filter,
      collname + "[@key" + num.toString() + "] "
      + process_property_compare(property.compare) + " @value" + num.toString()
    );
  }

  throw "error in property filter";
}

////////////////////////////////////////////////////////////////////////////////
/// @brief fills a properties filter
////////////////////////////////////////////////////////////////////////////////

function process_properties_filter (data, properties, collname) {
  var i, filter = "";

  if (properties instanceof Array) {
    for (i = 0;  i < properties.length;  ++i) {
      filter = process_property_filter(data, filter, i, properties[i], collname);
    }
  }
  else if (properties instanceof Object) {
    filter = process_property_filter(data, filter, 0, properties, collname);
  }
  return filter;
}

////////////////////////////////////////////////////////////////////////////////
/// @brief fills a labels filter
////////////////////////////////////////////////////////////////////////////////

function process_labels_filter (bindVars, filter, labels, collname) {

  // filter edge labels
  if (labels !== undefined && labels instanceof Array && labels.length > 0) {
    bindVars.labels = labels;
    return concatFilterStatement(filter, collname + '["$label"] IN @labels');
  }
}

function createFilterQuery(bindVars, filter, collname) {
  var filterQuery = "";
  if (filter.properties !== undefined) {
    filterQuery += process_properties_filter(bindVars, filter.properties, collname);
  }
  if (filter.labels !== undefined) {
    filterQuery += process_labels_filter(bindVars, filter.labels, collname);
  }
  return filterQuery;
}

function optionsToUrl(o, options, useKeep) {

  if (o._waitForSync && typeof options.waitForSync !== "boolean") {
    options.waitForSync = o._waitForSync;
  }
  if (useKeep && !o._keepNull && options.keepNull === undefined) {
    options.keepNull = o._keepNull;
  }

  return url.options(options);
}

/**
 * The api module to perform graph related operations on ArangoDB.
 *
 * @class graph
 * @module arango
 * @submodule graph
 **/
function GraphAPI(db) {
  var path = "/_api/gharial",
    graphObject = {

    /**
     * creates a Graph.
     *
     * @param {String} graph - the name of the graph
     * @param {String} edgeDefinitions - (optional) the definitions for edges. Compatibility: the name of the vertex collection.
     * @param {String} vertexCollections - (optional) list of additional vertex collections Compatibility: the name of the edge collection
     * @param {Boolean} waitForSync - (optional) wait until document has been synced to disk.
     * @param {Function} callback   - (optional) The callback function.
     * @method create
     * @return{Promise}
     */
    "create": function (graph, edgeDefinitions, vertexCollections, waitForSync, callback) {
      var data = {
        name: graph
      }, options = {};
      // Decide if it is old format
      // edgeDefinitions was vertex collection
      // vertexCollections was edge collection
      if (edgeDefinitions && vertexCollections
          && typeof edgeDefinitions === "string"
          && typeof vertexCollections === "string") {
        data.edgeDefinitions = [{
          collection: vertexCollections,
          from: [edgeDefinitions],
          to: [edgeDefinitions]
        }];
        if (typeof waitForSync === "function") {
          callback = waitForSync;
        } else if (typeof waitForSync === "boolean") {
          options.waitForSync = waitForSync;
        }
      } else {
        switch (typeof edgeDefinitions) {
          case "function":
            callback = edgeDefinitions;
            break;
          case "boolean": 
            callback = vertexCollections;
            waitForSync = edgeDefinitions;
            break;
          case "object":
            data.edgeDefinitions = edgeDefinitions;
            switch (typeof vertexCollections) {
              case "function":
                callback = vertexCollections;
                break;
              case "boolean": 
                callback = waitForSync;
                waitForSync = vertexCollections;
                break;
              case "object":
                data.orphanCollections = vertexCollections;
                if (typeof waitForSync === "function") {
                  callback = waitForSync;
                } else if (typeof waitForSync === "boolean") {
                  options.waitForSync = waitForSync;
                }
                break;
              case "undefined":
                callback = undefined;
                break;
              default:
                throw "Invalid third parameter";
            }
            break;
          case "undefined":
            break;
          default:
            throw "Invalid second parameter";
        }
      }
      return db.post(path + optionsToUrl(this, options), data, callback);
    },
    /**
     * retrieves a graph from the database
     *
     * @param {String} graph - the name of the graph
     * @param {Function} callback   - The callback function.
     * @method get
     * @return{Promise}
     */
    "get": function (graph, callback) {
      return db.get(path + '/' + graph, null, callback);
    },
    /**
     * retrieves a list of graphs from the database
     *
     * @param {Function} callback   - The callback function.
     * @method list
     * @return{Promise}
     */
    "list": function (callback) {
      return db.get(path, callback);
    },
    /**
     * Deletes a graph
     *
     * @param {String} graph - the name of the graph
     * @param {Boolean} [waitForSync=false] - wait until document has been sync to disk.
     * @param {Function} callback   - The callback function.
     * @method delete
     * @return{Promise}
     */
    "delete": function (graph, waitForSync, callback) {

      var options = {};
      if (typeof waitForSync === "function") {
        callback = waitForSync;
      } else if (typeof waitForSync === "boolean") {
        options.waitForSync = waitForSync;
      }
      return db.delete(path + '/' + graph + optionsToUrl(this, options), null, callback);
    },

    "vertexCollections": {

      /**
       * Lists all vertex collections
       *
       * @param {String} graph - the name of the graph
       * @param {Function} callback   - The callback function.
       * @method list
       * @return{Promise}
       */
      "list": function(graph, callback) {
        return db.get(path + '/' + graph + "/vertex", callback);
      },

      /**
       * Add another vertex collection
       *
       * @param {String} graph - the name of the graph
       * @param {String} collectionName - the name of the collection.
       * @param {Function} callback   - The callback function.
       * @method list
       * @return{Promise}
       */
      "add": function(graph, collectionName, callback) {
        var data = {
          collection: collectionName
        };
        return db.post(path + '/' + graph + "/vertex", data, callback);
      },

      /**
       * Remove a vertex collection from the graph
       * The collection may not be used in an edge definition of this graph.
       *
       * @param {String} graph - the name of the graph
       * @param {String} collectionName - the name of the collection.
       * @param {Function} callback   - The callback function.
       * @method list
       * @return{Promise}
       */
      "delete": function(graph, collectionName, callback) {
        return db.delete(path + '/' + graph + "/vertex/" + collectionName, callback);
      }
    },

    "edgeCollections": {

      /**
       * Lists all edge collections
       *
       * @param {String} graph - the name of the graph
       * @param {Function} callback   - The callback function.
       * @method list
       * @return{Promise}
       */
      "list": function(graph, callback) {
        return db.get(path + '/' + graph + "/edge", callback);
      },

      /**
       * Add another edge definition
       *
       * @param {String} graph - the name of the graph
       * @param {String} collectionName - the name of the collection.
       * @param {Function} callback   - The callback function.
       * @method list
       * @return{Promise}
       */
      "add": function(graph, collectionName, from, to, callback) {
        if (typeof to === "function") {
          callback = to;
          to = from;
        }
        if (typeof from === "string") {
          from = [from];
        }
        if (typeof to === "string") {
          to = [to];
        }
        var data = {
          collection: collectionName,
          to: to,
          from: from
        };
        return db.post(path + '/' + graph + "/edge", data, callback);
      },

      "replace": function(graph, collectionName, from, to, callback) {
        if (typeof to === "function") {
          callback = to;
          to = from;
        }
        if (typeof from === "string") {
          from = [from];
        }
        if (typeof to === "string") {
          to = [to];
        }
        var data = {
          collection: collectionName,
          to: to,
          from: from
        };
        return db.put(path + '/' + graph + "/edge/" + collectionName, data, callback);
      },

      /**
       * Remove a edge collection from the graph
       * All vertex collections will still be known to the graph and
       * have to be removed seperately.
       *
       * @param {String} graph - the name of the graph
       * @param {String} collectionName - the name of the collection.
       * @param {Function} callback   - The callback function.
       * @method list
       * @return{Promise}
       */
      "delete": function(graph, collectionName, callback) {
        return db.delete(path + '/' + graph + "/edge/" + collectionName, callback);
      }
    },

    "vertex": {

      /**
       * creates a Vertex within a Graph
       *
       * @param {String} graph - the name of the graph
       * @param vertexData - the vertex object as JSON. It is possible to set the vertex key by providing the _key attribute.
       * @param {Boolean} [waitForSync=false] - wait until document has been sync to disk.
       * @param {Function} callback   - The callback function.
       * @method vertex.create
       * @return{Promise}
       */
      "create": function (graph, vertexData, collection, waitForSync, callback) {
        var options = {}, collections;
        if (typeof collection !== "string") {
          callback = waitForSync;
          waitForSync = collection;
          return graphObject.vertexCollections.list(graph, function(err, ret) {
            if (ret.error === false) {
              collections = ret.collections;
              if (collections.length !== 1) {
                throw "The vertex collection is not unambigiously defined. Please give it explicitly.";
              }
              collection = collections[0];
              if (typeof waitForSync === "function") {
                callback = waitForSync;
              } else if (typeof waitForSync === "boolean") {
                options.waitForSync = waitForSync;
              }
              return db.post(path + '/' + graph + '/vertex/' + collection + optionsToUrl(this, options), vertexData, callback);
            }
          });
        }
        if (typeof waitForSync === "function") {
          callback = waitForSync;
        } else if (typeof waitForSync === "boolean") {
          options.waitForSync = waitForSync;
        }
        return db.post(path + '/' + graph + '/vertex/' + collection + optionsToUrl(this, options), vertexData, callback);
      },

      /**
       * retrieves a vertex from a graph
       *
       * @param {String} graph - the name of the graph
       * @param {String} id        - the vertex-handle
       * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
       * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
       * @param {Function} callback   - The callback function.
       * @method vertex.get
       * @return{Promise}
       */
      "get": function (graph, id, options, callback) {
        var headers;

        if (typeof options === 'function') {
          callback = options;
          options = {};
        } else if (options) {
          headers = url.ifMatch(id, options);
        }
        return db.get(path + '/' + graph + '/vertex/' + id + optionsToUrl(this, options), headers, callback);
      },
      /**
       * replaces a vertex with the data given in data.
       *
       * @param {String} graph - the name of the graph
       * @param {String} id        - the vertex-handle
       * @param {Object} data - the data of the vertex as JSON object
       * @param {Object} [options] - an object with the following optional parameters:
       * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
       * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
       * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
       * does not match.
       * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
       * @param {Function} callback   - The callback function.
       * @method vertex.put
       * @return{Promise}
       */
      "put": function (graph, id, data, options, callback) {
        var headers;

        if (typeof options === 'function') {
          callback = options;
          options = {};
        } else if (options) {
          headers = url.ifMatch(id, options);
        }
        if (options.forceUpdate !== undefined) {
          options.policy = (options.forceUpdate === true) ? "last" : "error";
          delete options.forceUpdate;
        }
        return db.put(path + '/' + graph + '/vertex/' + id + optionsToUrl(this, options), data, headers, callback);
      },
      /**
       * patches a vertex with the data given in data
       *
       * @param {String} graph - the name of the graph
       * @param {String} id        - the vertex-handle
       * @param {Object} data - the data of the vertex as JSON object
       * @param {Object} [options] - an object with the following optional parameters:
       * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
       * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
       * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
       * does not match.
       * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
       * @param {Boolean} [options.keepNull=true] -  if set to false a patch request will delete every null value
       * @param {Function} callback   - The callback function.
       * @method vertex.patch
       * @return{Promise}
       */
      "patch": function (graph, id, data, options, callback) {
        var headers;

        if (typeof options === 'function') {
          callback = options;
          options = {};
        } else if (options) {
          headers = url.ifMatch(id, options);
        }
        if (options.forceUpdate !== undefined) {
          options.policy = (options.forceUpdate === true) ? "last" : "error";
          delete options.forceUpdate;
        }
        return db.patch(path + '/' + graph + '/vertex/' + id + optionsToUrl(this, options, true), data, headers, callback);
      },
      /**
       * Deletes a vertex
       *
       * @param {String} graph - the name of the graph
       * @param {String} id        - the vertex-handle
       * @param {Object} [options] - an object with the following optional parameters:
       * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
       * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
       * @param {Number} [options.waitForSync] -  Boolean, wait until document has been synced to disk.
       * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
       * does not match.
       * @param {Function} callback   - The callback function.
       * @method vertex.delete
       * @return{Promise}
       */
      "delete": function (graph, id, options, callback) {
        var headers;

        if (typeof options === 'function') {
          callback = options;
          options = {};
        } else if (options) {
          headers = url.ifMatch(id, options);
        }

        return db.delete(path + '/' + graph + '/vertex/' + id + optionsToUrl(this, options), headers, callback);
      }
    },

    "edge": {
      /**
       * creates an edge within a Graph
       *
       * @param {String} graph - the name of the graph
       * @param edgeData  - the vertex object as JSON. It is possible to set the vertex key by providing the _key attribute.
       * @param {String} from      - the start vertex of this edge
       * @param {String} to        - the end vertex of this edge
       * @param {String} label     - the edges label
       * @param {Boolean} [waitForSync=false] - wait until document has been sync to disk.
       * @param {Function} callback   - The callback function.
       * @method edge.create
       * @return{Promise}
       */
      "create": function (graph, edgeData, from, to, label, collection, waitForSync, callback) {
        var collections;
        var data = utils.extend({
          _from: from,
          _to: to
        }, edgeData);
        if (typeof collection !== "string") {
          callback = waitForSync;
          waitForSync = collection;
          return graphObject.edgeCollections.list(graph, function(err, ret) {
            if (ret.error === false) {
              collections = ret.collections;
              if (collections.length !== 1) {
                throw "The edge collection is not unambigiously defined. Please give it explicitly.";
              }
              collection = collections[0];
              if (typeof label === 'function') {
                callback = label;
                label = null;
              }
              if (label) {
                data = utils.extend({
                  $label: label
                }, data);
              }
              var options = {};
              if (typeof waitForSync === "function") {
                callback = waitForSync;
              } else if (typeof waitForSync === "boolean") {
                options.waitForSync = waitForSync;
              }
              return db.post(path + '/' + graph + '/edge/' + collection + optionsToUrl(this, options), data, callback);
            }
          });
        }
        if (typeof label === 'function') {
          callback = label;
          label = null;
        }
        if (label) {
          data = utils.extend({
            $label: label
          }, data);
        }
        var options = {};
        if (typeof waitForSync === "function") {
          callback = waitForSync;
        } else if (typeof waitForSync === "boolean") {
          options.waitForSync = waitForSync;
        }
        return db.post(path + '/' + graph + '/edge/' + collection + optionsToUrl(this, options), data, callback);
      },
      /**
       * retrieves an edge  from a graph
       *
       * @param {String} graph - the name of the graph
       * @param {String} id        - the edge-handle
       * @param {Object} [options] - an object with the following optional parameters:
       * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
       * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
       * @param {Function} callback   - The callback function.
       * @method edge.get
       * @return{Promise}
       */
      "get": function (graph, id, options, callback) {
        var headers;

        if (typeof options === 'function') {
          callback = options;
          options = {};
        } else if (options) {
          headers = url.ifMatch(id, options);
        }
        return db.get(path + '/' + graph + '/edge/' + id + optionsToUrl(this, options), headers, callback);
      },
      /**
       * replaces an edge with the data given in data.
       *
       * @param {String} graph - the name of the graph
       * @param {String} id        - the vertex-handle
       * @param {Object} data - the data of the edge as JSON object
       * @param {Object} [options] - an object with the following optional parameters:
       * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
       * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
       * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
       * does not match.
       * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
       * @param {Function} callback   - The callback function.
       * @method edge.put
       * @return{Promise}
       */
      "put": function (graph, id, data, options, callback) {
        var headers;

        if (typeof options === 'function') {
          callback = options;
          options = {};
        } else if (options) {
          headers = url.ifMatch(id, options);
        }
        if (options.forceUpdate !== undefined) {
          options.policy = (options.forceUpdate === true) ? "last" : "error";
          delete options.forceUpdate;
        }

        return db.put(path + '/' + graph + '/edge/' + id + optionsToUrl(this, options), data, headers, callback);
      },
      /**
       * patches an edge with the data given in data
       *
       * @param {String} graph - the name of the graph
       * @param {String} id        - the edge-handle
       * @param {Object} data - the data of the edge as JSON object
       * @param {Object} [options] - an object with the following optional parameters:
       * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
       * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
       * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
       * does not match.
       * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
       * @param {Boolean} [options.keepNull=true] -  if set to false a patch request will delete every null value
       * @param {Function} callback   - The callback function.
       * @method edge.patch
       * @return{Promise}
       */
      "patch": function (graph, id, data, options, callback) {
        var headers;

        if (typeof options === 'function') {
          callback = options;
          options = {};
        } else if (options) {
          headers = url.ifMatch(id, options);
        }
        if (options.forceUpdate !== undefined) {
          options.policy = (options.forceUpdate === true) ? "last" : "error";
          delete options.forceUpdate;
        }
        return db.patch(path + '/' + graph + '/edge/' + id + optionsToUrl(this, options, true), data, headers, callback);
      },
      /**
       * Deletes an edge
       *
       * @param {String} graph - the name of the graph
       * @param {String} id        - the edge-handle
       * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
       * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
       * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
       * does not match.
       * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
       * @param {Function} callback   - The callback function.
       * @method edge.delete
       * @return{Promise}
       */
      "delete": function (graph, id, options, callback) {
        var headers;

        if (typeof options === 'function') {
          callback = options;
          options = {};
        } else if (options) {
          headers = url.ifMatch(id, options);
        }

        return db.delete(path + '/' + graph + '/edge/' + id + optionsToUrl(this, options), headers, callback);
      }
    },
    /**
     * returns all neighbouring vertices of the given vertex .
     *
     * @param {String} graph - the name of the graph
     * @param {String} vertex - the vertex
     * @param {Object} [options]   - the following optional parameters are allowed:
     * @param {Number} [options.batchSize] - the batch size of the returned cursor.
     * @param {Number} [options.limit] -  limit the result size.
     * @param {Boolean} [options.count=false]  -   return the total number of results.
     * @param {Object} [options.filter] -   a optional filter, The attributes of filter:
     * @param {String} [options.direction=any]     filter for inbound (value "in") or outbound (value "out")
     * neighbors.
     * @param {List} [options.filter.labels]  -   filter by an array of edge labels (empty array means no
     * restriction)
     * @param {Object} [options.filter.properties]  -   filter neighbors by an array of edge properties, The
     * attributes of a property filter:
     * @param {String} [options.filter.key] -   filter the result vertices by a key value pair
     * @param {String} [options.filter.value]   -   the value of the key
     * @param {String} [options.filter.compare] -   a compare operator
     * @param {Function} callback   - The callback function.
     * @method getNeighbourVertices
     * @return{Promise}
     */

    "getNeighbourVertices": function (graph, vertex, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options = options || {};
      var queryData = {};
      var bindVars = {};
      bindVars.options = {};
      var filter = options.filter || {};
      filterDirection(filter, bindVars.options);
      bindVars.graphName = graph;
      bindVars.example = vertex;
      queryData.query = "FOR u IN GRAPH_NEIGHBORS(@graphName,@example,@options) ";
      queryData.query += createFilterQuery(bindVars, filter, "u.path.edges[0]");
      if (options.limit) {
        queryData.query += " LIMIT @limit";
        bindVars.limit = options.limit;
      }
      queryData.query += " RETURN u.vertex";
      queryData.bindVars = bindVars;
      queryData.count = options.count;
      queryData.batchSize = options.batchSize;
      return db.cursor.create(queryData, callback);
    },
    /**
     * returns all neighbouring edges of the given vertex .
     *
     * @param {String} graph - the name of the graph
     * @param {String} vertex - the vertex
     * @param {Object} [options]   - the following optional parameters are allowed:
     * @param {Number} [options.batchSize] - the batch size of the returned cursor.
     * @param {Number} [options.limit] -  limit the result size.
     * @param {Boolean} [options.count=false]  -   return the total number of results.
     * @param {Object} [options.filter] -   a optional filter, The attributes of filter:
     * @param {String} [options.direction=any]     filter for inbound (value "in") or outbound (value "out")
     * neighbors.
     * @param {List} [options.filter.labels]  -   filter by an array of edge labels (empty array means no
     * restriction)
     * @param {Object} [options.filter.properties]  -   filter neighbors by an array of edge properties, The
     * attributes of a property filter:
     * @param {String} [options.filter.key] -   filter the result vertices by a key value pair
     * @param {String} [options.filter.value]   -   the value of the key
     * @param {String} [options.filter.compare] -   a compare operator
     * @param {Function} callback   - The callback function.
     * @method getEdgesForVertex
     * @return{Promise}
     */
    "getEdgesForVertex": function (graph, vertex, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options = options || {};
      var queryData = {};
      var bindVars = {};
      bindVars.graphName = graph;
      bindVars.example = vertex;
      bindVars.options = {};
      var filter = options.filter || {};
      filterDirection(filter, bindVars.options);
      bindVars.graphName = graph;
      queryData.query = "FOR e IN GRAPH_EDGES(@graphName,@example,@options) ";
      queryData.query += createFilterQuery(bindVars, filter, "e");
      queryData.query += " RETURN e";
      queryData.bindVars = bindVars;
      queryData.count = options.count;
      queryData.batchSize = options.batchSize;
      return db.cursor.create(queryData, callback);
    },
    /**
     * returns all vertices of a graph.
     *
     * @param {String} graph - the name of the graph.
     * @param {Object} [options]   - the following optional parameters are allowed:
     * @param {Number} [options.batchSize] - the batch size of the returned cursor.
     * @param {Number} [options.limit] -  limit the result size.
     * @param {Boolean} [options.count=false]  -   return the total number of results.
     * @param {Object} [options.filter] -   a optional filter, The attributes of filter:
     * @param {Object} [options.filter.properties]  -   filter neighbors by an array of edge properties, The
     * attributes of a property filter:
     * @param {String} [options.filter.key] -   filter the result vertices by a key value pair
     * @param {String} [options.filter.value]   -   the value of the key
     * @param {String} [options.filter.compare] -   a compare operator
     * @param {Function} callback   - The callback function.
     * @method vertices
     * @return{Promise}
     */

    "vertices": function (graph, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options = options || {};
      var queryData = {};
      var bindVars = {};
      bindVars.graphName = graph;
      bindVars.options = {};
      var filter = options.filter || {};
      filterDirection(filter, bindVars.options);
      bindVars.graphName = graph;
      queryData.query = "FOR v IN GRAPH_VERTICES(@graphName,{},@options) ";
      queryData.query += createFilterQuery(bindVars, filter, "v");
      queryData.query += " RETURN v";
      queryData.bindVars = bindVars;
      queryData.count = options.count;
      queryData.batchSize = options.batchSize;
      return db.cursor.create(queryData, callback);
    },
    /**
     * returns all edges of a graph.
     *
     * @param {String} graph - the name of the graph.
     * @param {Object} [options]   - the following optional parameters are allowed:
     * @param {Number} [options.batchSize] - the batch size of the returned cursor.
     * @param {Number} [options.limit] -  limit the result size.
     * @param {Boolean} [options.count=false]  -   return the total number of results.
     * @param {Object} [options.filter] -   a optional filter, The attributes of filter:
     * @param {List} [options.filter.labels]  -   filter by an array of edge labels (empty array means no
     * restriction)
     * @param {Object} [options.filter.properties]  -   filter neighbors by an array of edge properties,
     * The attributes of a property filter:
     * @param {String} [options.filter.key] -   filter the result vertices by a key value pair
     * @param {String} [options.filter.value]   -   the value of the key
     * @param {String} [options.filter.compare] -   a compare operator
     * @param {Function} callback   - The callback function.
     * @method edges
     * @return{Promise}
     */
    "edges": function (graph, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options = options || {};
      var queryData = {};
      var bindVars = {};
      bindVars.graphName = graph;
      bindVars.options = {};
      var filter = options.filter || {};
      // If no direction is set set it tou outbound s.t. we do not get duplicates
      filter.direction = filter.direction || "out"; 
      filterDirection(filter, bindVars.options);
      bindVars.graphName = graph;
      queryData.query = "FOR e IN GRAPH_EDGES(@graphName,{},@options) ";
      queryData.query += createFilterQuery(bindVars, filter, "e");
      queryData.query += " RETURN e";
      queryData.bindVars = bindVars;
      queryData.count = options.count;
      queryData.batchSize = options.batchSize;
      return db.cursor.create(queryData, callback);
    },
    /**
     * Sets the keepNull value for all further requests in the graph module.
     *
     * @param {Boolean} val
     * @method keepNull
     * @return {Object}    -   The modified instance of the graph module.
     */
    "keepNull": function (val) {
      this._keepNull = !!val;
      this.vertex._keepNull = !!val;
      this.edge._keepNull = !!val;


      return this;
    },

    /**
     * Sets the waitForSync value for all further requests in the graph module.
     *
     * @param {Boolean} val
     * @method waitForSync
     * @return {Object}    -   The modified instance of the graph module.
     */
    "waitForSync": function (val) {
      this._waitForSync = !!val;
      this.vertex._waitForSync = !!val;
      this.edge._waitForSync = !!val;

      return this;
    }
  };
  return graphObject;
}

module.exports = Arango.api('graph', GraphAPI);

});
require.register("arango/lib/api/batch.js", function(module, exports, require){
var Arango = require('../arango'),
    utils = require('../utils'),
    batchPart = "Content-Type: application/x-arango-batchpart",
    defaultBoundary = "batch{id}",
    batch_sequence = 0;

/**
 * The api module "batch" to perform batch requests. Calling "start" sets the connection into batch mode and collects
 * every request. Calling "Exec" switches back to normal mode and executes the batch.
 *
 * @class batch
 * @module arango
 * @submodule batch
 **/

function BatchAPI(db) {
    var path = "/_api/batch",
        request = db.request,
        jobs = [],
        boundary;

    return {
        /**
         * Enables the batch mode for the current connection.
         *
         * @method start
         * @return {Object} The modified arango connection.
         */
        "start": function(user_boundary) {
            ++batch_sequence;

            boundary = user_boundary ? user_boundary + batch_sequence : defaultBoundary.replace(/{(.*)}/, batch_sequence);

            /* start capturing requests */
            db.request = function() {
                var args = Array.prototype.slice.call(arguments),
                    job = new db.Promise();

                args.unshift(job);
                jobs.push(args);

                return job;
            };

            return db;
        },
        /**
         * Disables the batch mode and executes the batch request.
         *
         * @param {Function} callback   - The callback function.
         * @method exec
         * @return{Promise}
         */
        "exec": function(callback) {
            var options = {
                headers: {
                    'content-type': "multipart/form-data; boundary=" + boundary
                }
            },
                data = '',
                args, batch, callbacks, i;

            if (!jobs.length) throw new Error("No jobs");

            for (i = 0; i < jobs.length; i++) {
                args = jobs[i];

                data += '--' + boundary + '\r\n';
                data += batchPart + '\r\n\r\n';
                data += args[1] + ' ' + args[2] + " HTTP/1.1\r\n\r\n";

                if (args[3]) {
                    if (typeof args[3] === 'string') data += args[3];
                    else data += JSON.stringify(args[3]);
                }

                if (args[4]) {
                    utils.extend(true, options, args[4]);
                }

            }

            data += '--' + boundary + '--\r\n';

            batch = jobs.map(function(j) {
                return j[0]
            });

            callbacks = jobs.map(function(j) {
                return j[4]
            });

            jobs = [];

            db.request = request;
            // note: joins result of batch operation and individual jobs
            return db.post(path, data, options).then(function(data, xhr) {
                var results, job, result, ok;

                results = decode_multipart(data, boundary);

                for (job in batch) {
                    result = results[job];

                    ok = result && result.xhr.status < 400;

                    batch[job][ok ? 'fulfill' : 'reject'](result.message, result.xhr);

                    if (callbacks[job]) {
                        callbacks[job](ok ? undefined : -1, result.message, result.xhr);
                    }
                }

                if (callback) callback(undefined, results, xhr);

                return {
                    jobs: batch.length,
                    length: results.length
                };
            }, function(error) {
                error = {
                    message: 'job failed',
                    error: error
                };

                if (callback) callback(-1, error);

                for (var job in batch) {
                    batch[job].reject(error);
                    if (callbacks[job]) callbacks(-1, error);
                }

            }).join(batch);
        },
        /**
         * Disables the batch mode and rejects all requests in the current batch.
         *
         * @param {String} [reason] - reason for cancellation.
         * @method cancel
         * @return {Object}    The original arango collection;
         */
        "cancel": function(reason) {
            var batch = jobs.map(function(j) {
                return j[0]
            }),
                callbacks = jobs.map(function(j) {
                    return j[4]
                }),
                message = {
                    message: reason || "job cancelled"
                };

            db.request = request;

            for (var job in batch) {
                batch[job].reject(message);
                if (callbacks[job]) callbacks[job](-1, message);
            }

            return db;
        }
    };
}

function decode_multipart(data, boundary) {
    var x, i, j, results = [],
        segments, lines, status, message;

    // splits results into chunks
    data = data.split('--' + boundary).filter(function(f) {
        return f
    }).map(function(m) {
        return m.split('\r\n')
    });

    for (i in data) {
        segments = [];

        // check for valid batchPart in chunk
        x = data[i].indexOf(batchPart);

        if (x < 0) continue;

        lines = [];

        // iterate through each chunk
        for (j = x + 1; j < data[i].length; j++) {
            // collect lines to segments
            if (!data[i][j]) {
                if (lines.length) segments.push(lines);
                lines = [];
            } else {
                lines.push(data[i][j]);
            }
        }

        if (segments.length) {
            // get http status code
            status = parseInt(segments[0][0].split(' ')[1], 10);
            // parse message
            try {
                message = JSON.parse(segments[1]);
            } catch (e) {
                message = segments[1]
            }

            results.push({
                xhr: {
                    status: status,
                    headers: segments[0]
                },
                message: message
            });
        }
    }

    return results;
}


module.exports = Arango.api('batch', BatchAPI);

});
require.register("arango/lib/api/edge.js", function(module, exports, require){
var Arango = require('../arango'),
  url = require('../url');

/**
 * The api module to perform edge related operations on ArangoDB.
 *
 * @class edge
 * @module arango
 * @submodule edge
 **/
function EdgeAPI(db) {
  var path = "/_api/edge",
    ypath = "/_api/edges/";

  return {
    /**
     * creates an edge in a given collection.
     *
     * @param {String} collection - the collection
     * @param {String} from - The document handle of the start point must be passed in from handle.
     * @param {String} to - The document handle of the end point must be passed in from handle.
     * @param {Object} data - the data of the edge as JSON object
     * @param {Object} [options] - an object with the following optional parameters:
     * @param {Boolean} [options.createCollection=false] - if set the collection given in "collection" is created as
     * well.
     * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
     * @param {Function} callback   - The callback function.
     * @method create
     * @return{Promise}
     */
    "create": function (collection, from, to, data, options, callback) {
      if (typeof collection !== 'string') {
        callback = options;
        options = data;
        data = to;
        to = from;
        from = collection;
        collection = db._collection;
      }

      if (typeof options === 'function') {
        callback = options;
        options = null;
      }

      if (!options) options = {};

      options.collection = collection;
      options.from = from;
      options.to = to;
      return db.post(path + url.options(options), data, callback);
    },
    /**
     * retrieves an edge from the database
     *
     * @param {String} id - the edge-handle
     * @param {Object} [options] - an object with the following optional parameters:
     * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
     * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
     * @param {Function} callback   - The callback function.
     * @method get
     * @return{Promise}
     */
    "get": function (id, options, callback) {
      var headers;

      if (typeof options === 'function') {
        callback = options;
        options = null;
      } else if (options) {
        headers = url.ifMatch(id, options);
      }

      options = options ? options : {};

      return db.get(path + '/' + id + url.options(options), headers, callback);
    },
    /**
     * replaces an edge with the data given in data.
     *
     * @param {String} id - the edge-handle
     * @param {Object} data - the data of the edge as JSON object
     * @param {Object} [options] - an object with the following optional parameters:
     * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
     * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
     * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
     * does not match.
     * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
     * @param {Function} callback   - The callback function.
     * @method put
     * @return{Promise}
     */
    "put": function (id, data, options, callback) {
      var headers;

      if (typeof options === 'function') {
        callback = options;
        options = null;
      } else if (options) {
        headers = url.ifMatch(id, options);
      }

      options = options ? options : {};

      if (options.forceUpdate !== undefined) {
        options.policy = (options.forceUpdate === true) ? "last" : "error";
        delete options.forceUpdate;
      }

      return db.put(path + '/' + id + url.options(options), data, headers, callback);
    },
    /**
     * patches an edge with the data given in data
     *
     * @param {String} id - the edge-handle
     * @param {Object} data - the data of the edge as JSON object
     * @param {Object} [options] - an object with the following optional parameters:
     * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
     * @param {Number} [options.rev] -  The revision, used by the "match" attribute.
     * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
     * does not match.
     * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.
     * @param {Boolean} [options.keepNull=true] -  if set to false a patch request will delete every null value
     * attributes.
     * @param {Function} callback   - The callback function.
     * @method patch
     * @return{Promise}
     */
    "patch": function (id, data, options, callback) {
      var headers;

      if (typeof options === 'function') {
        callback = options;
        options = null;
      } else if (options) {
        headers = url.ifMatch(id, options);
      }

      options = options ? options : {};

      if (options.forceUpdate !== undefined) {
        options.policy = (options.forceUpdate === true) ? "last" : "error";
        delete options.forceUpdate;
      }

      return db.patch(path + '/' + id + url.options(options), data, headers, callback);
    },
    /**
     * Deletes an edge
     *
     * @param {String} id - the document-handle
     * @param {Object} [options] - an object with the following optional parameters:
     * @param {Boolean} [options.match] - boolean defining if the given revision should match the found document or
     * not.
     * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
     * @param {Boolean} [options.forceUpdate] - If set an update is performed even when the given revision
     * does not match.
     * @param {Boolean} [options.waitForSync=false] -  Wait until document has been synced to disk.

     * @param {Function} callback   - The callback function.
     * @method delete
     * @return{Promise}
     */
    "delete": function (id, options, callback) {
      var headers;

      if (typeof options === 'function') {
        callback = options;
        options = null;
      } else if (options) {
        headers = url.ifMatch(id, options);
      }

      options = options ? options : {};

      return db.delete(path + '/' + id + url.options(options), headers, callback);
    },
    /**
     * same as get but only returns the header.
     *
     * @param {String} id - the edge-handle
     * @param {Object} [options] - an object with the following optional parameters:
     * @param {Boolean} [options.match] - defining if the given revision should match the found document or not.
     * @param {Number} [options.rev] -  String the revision, used by the "match" attribute.
     * @param {Function} callback   - The callback function.
     * @method head
     * @return{Promise}
     */
    "head": function (id, options, callback) {
      var headers;

      if (typeof options === 'function') {
        callback = options;
        options = null;
      } else if (options) {
        headers = url.ifMatch(id, options);
      }
      options = options ? options : {};
      return db.head(path + '/' + id + url.options(options), headers, callback);
    },
    /**
     * Returns the list of edges starting or ending in the vertex identified by vertex-handle.
     *
     * @param {String} [collection] - The collection containing the documents.If not provided the collection defined
     * in the connection is used.
     * @param {String} vertex   -   The id of the start vertex.
     * @param {String} [direction=any] - Selects in or out direction for edges. If not set, any edges are returned.
     * @param {Function} callback   - The callback function.
     * @method list
     * @return{Promise}
     */
    "list": function (collection, vertex, direction, callback) {
      var options;

      if (typeof vertex === 'function') {
        callback = vertex;
        vertex = collection;
        collection = db._collection;
        direction = "any";

      }

      if (typeof direction === 'function') {
        callback = direction;
        direction = vertex;
        if (direction !== 'in' && direction !== 'out' && direction !== 'any') {
          vertex = direction;
          direction = "any";
        } else {
          vertex = collection;
          collection = db._collection;
        }
      }

      options = '?vertex=' + vertex + '&direction=' + direction;

      return db.get(ypath + collection + options, callback);
    }
  }
}

module.exports = Arango.api('edge', EdgeAPI);

});
require.register("arango/lib/api/user.js", function(module, exports, require){
var Arango = require('../arango');
/**
 * The api module to maintain users in ArangoDB.
 *
 * @class users
 * @module arango
 * @submodule users
 **/
function UserAPI(db) {
  var path = "/_api/user/";

  return {

    /**
     * Creates a user.
     *
     * @param {String} username  - the username.
     * @param {String} password  - the password.
     * @param {Boolean} [active=true] - true if is the user is active.
     * @param {Object} [extra]   - additional userdata as JSONObject
     * @param {Function} callback   - The callback function.
     * @method create
     * @return{Promise}
     */
    "create": function (username, password, active, extra, callback) {
      if (typeof active !== 'boolean') {
        callback = extra;
        extra = active;
        active = true;
      }
      var data = {
        username: username,
        password: password,
        active: active,
        extra: extra
      };
      return db.post(path, data, callback);
    },
    /**
     * Returns the requested user.
     *
     * @param {String} username  - the user to request data for.
     * @param {Function} callback   - The callback function.
     * @method get
     * @return{Promise}
     */
    "get": function (username, callback) {
      return db.get(path + username, callback);
    },
    /**
     * Replaces entry for user
     *
     * @param {String} username  - the user to be replaced
     * @param {String} password  - new password
     * @param {Boolean} [active=true] is the user is active.
     * @param {Object} [extra]   - additional userdata as JSONObject
     * @param {Function} callback   - The callback function.
     * @method put
     * @return{Promise}
     */
    "put": function (username, password, active, extra, callback) {
      if (typeof active === 'function') {
        callback = active;
        active = undefined;
        extra = undefined;
      }
      if (typeof extra === 'function') {
        callback = extra;
        extra = undefined;
      }

      var data = {
        password: password,
        active: active
      };
      if (extra) data.extra = extra;

      return db.put(path + username, data, callback);
    },
    /**
     * updates entry for user
     * @param {String} username  - the user to be replaced
     * @param {String} password  - new password
     * @param {Boolean} [active] - boolean is the user is active.
     * @param {Object} [extra]  - additional userdata as JSONObject
     * @param {Function} callback   - The callback function.
     * @method patch
     * @return{Promise}
     */
    "patch": function (username, password, active, extra, callback) {
      if (typeof active === 'function') {
        callback = active;
        extra = undefined;
        active = undefined;
      }
      if (typeof extra === 'function') {
        callback = extra;
        extra = undefined;
      }

      var data = {
        password: password
      };
      if (extra) data.extra = extra;
      if (active !== undefined) data.active = active;
      if (extra !== undefined) data.extra = extra;
      return db.patch(path + username, data, callback);
    },
    /**
     * deletes user
     * @param {String} username  - the user to be deleted
     * @param {Function} callback   - The callback function.
     * @method delete
     * @return{Promise}
     */
    "delete": function (username, callback) {
      return db.delete(path + username, callback);
    }
  }
}

module.exports = Arango.api('user', UserAPI);

});
require.register("arango/lib/api/job.js", function(module, exports, require){
var Arango = require('../arango');

/**
 * The api module to request information about async running jobs in ArangoDB.
 *
 * @class jobs
 * @module arango
 * @submodule jobs
 **/
function JobAPI(db) {
  var path = "/_api/job";

  return {
    /**
     *
     * Returns the result of an async job identified by job-id. If the async job result is present on the server, the
     * result will be removed from the list of result. That means this method can be called for each job-id once.
     *
     * @param {String} jobId     -  The async job id.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method put
     */
    "put": function (jobId, callback) {
      return db.put(path + "/" + jobId, null, callback);
    },
    /**
     * Returns the list of ids of async jobs with a specific status (either done or pending). The list can be used by
     * the client to get an overview of the job system status and to retrieve completed job results later.
     *
     * @param {String} type -  The type of jobs to return. The type can be either done or pending. Setting the type
     * to done will make the method return the ids of already completed async jobs for which results can be fetched.
     * Setting the type to pending will return the ids of not yet finished async jobs.
     * @param {Number} [count] -  The maximum number of ids to return per call. If not specified, a server-defined
     * maximum value will be used.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method get
     */
    "get": function (type, count, callback) {
      var param = "";
      if (typeof count === "function") {
        callback = count;
      } else {
        param = "?count=" + count;
      }
      return db.get(path + "/" + type + param, null, callback);
    },
    /**
     * Deletes either all job results, expired job results, or the result of a specific job. Clients can use this
     * method to perform an eventual garbage collection of job results.
     *
     * @param {String} type -  The type of jobs to delete. type can be: <br>- all:    deletes all jobs results.
     * Currently executing or queued async jobs will not be stopped by this call.<br>- expired: deletes expired
     * results. To determine the expiration status of a result, pass the stamp URL parameter. stamp needs to be a
     * UNIX timestamp, and all async job results created at a lower timestamp will be deleted.<br>- an actual
     * job-id: in this case, the call will remove the result of the specified async job. If the job is currently
     * executing or queued, it will not be aborted.
     * @param {Number} [stamp]     -  A UNIX timestamp specifying the expiration threshold when type is expired.
     * @param {Function} callback   - The callback function.
     * @return{Promise}
     * @method delete
     */
    "delete": function (type, stamp, callback) {
      var param = "";
      if (typeof stamp === "function") {
        callback = stamp;
      } else {
        param = "?stamp=" + stamp;
      }
      return db.delete(path + "/" + type + param, null, callback);
    }
  }
}


module.exports = Arango.api('job', JobAPI);

});
require.alias("kaerus-component-uP/index.js", "arango/deps/micropromise/index.js");
require.alias("kaerus-component-microTask/index.js", "kaerus-component-uP/deps/microtask/index.js");

require.alias("kaerus-component-ajax/index.js", "arango/deps/ajax/index.js");
require.alias("kaerus-component-urlparser/index.js", "kaerus-component-ajax/deps/urlparser/index.js");

require.alias("kaerus-component-urlparser/index.js", "arango/deps/urlparser/index.js");

require.alias("kaerus-component-base64/index.js", "arango/deps/base64/index.js");
  if ("undefined" == typeof module) {
    window.arango = require("arango");
  } else {
    module.exports = require("arango");
  }
})();