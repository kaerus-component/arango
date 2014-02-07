;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
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

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
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
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
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

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("kaerus-component-microtask/index.js", function(exports, require, module){

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
        for(var i = 0; i < queue.length; i++){ queue[i][0].apply(queue[i][2],queue[i][1]) }
        deferred = head;
        queue = [];
    }
    
    if(module && module.exports) module.exports = microtask;
    else if(typeof define ==='function' && define.amd) define(microtask); 
    else root.microtask = microtask;
}(this));
});
require.register("kaerus-component-up/index.js", function(exports, require, module){
 /**      
 * Provides A+ v1.1 compliant promises.   
 * @module uP
 * @name microPromise
 * @main uP
 */

var task = require('microtask'); // nextTick shim

(function(root){
    "use strict"

    try {root = global} catch(e){ try {root = window} catch(e){} };

    var slice = Array.prototype.slice,
        isArray = Array.isArray;

    var uP = function microPromise(proto){
        // object mixin
        if(proto && typeof proto === 'object'){ 
            for(var key in uP.prototype) proto[key] = uP.prototype[key];
            proto._tuple = [];
            return proto;
        }

        if(!(this instanceof microPromise))
            return new microPromise(proto);

        this._tuple = [];

        // resolver callback
        if(typeof proto === 'function') {
            proto(this.resolve,this.reject,this.progress,this.timeout);
        }
    }

    /**
     * Attaches callback,errback,notify handlers and returns a promise 
     * 
     * Example: catch fulfillment or rejection
     *      var p = uP();
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
    uP.prototype.then = function(f,r,n){
        var p = new uP();

        this._tuple[this._tuple.length] = [p,f,r,n];

        if(this._state) task(resolver,[this._tuple,this._state,this._value,this._opaque]);

        return p;
    }
    /**
     * Same semantic as `then` but spreads array value into separate arguments 
     *
     * Example: Multiple fulfillment values
     *      p = uP();
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
    uP.prototype.spread = function(f,r,n){  
        function s(v,a){
            if(!Array.isArray(v)) v = [v];
            return f.apply(f,v.concat(a)); 
        }

        return this.then(s,r,n);
    }
    /**
     * Same as `then` but terminates a promise chain and calls onerror / throws error on unhandled Errors 
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
     *      p.fulfill(142); // => v is: 142, throws [RangeError:'to large']
     * Example: use onerror handler
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
    uP.prototype.done = function(f,r,n){
    
        if(typeof r !== 'function') r = handleError;

        var self = this, p = this.then(f,r,n);
    
        function handleError(e){
            task(function(){
                if(typeof self.onerror === 'function'){
                    self.onerror(e);
                } else {
                    throw e;
                }
            });
        }
    }

    /**
     * Fulfills a promise with a `value` 
     * 
     *  Example: fulfillment
     *      p = uP();
     *      p.fulfill(123);
     *  
     *  Example: multiple fulfillment values in array
     *      p = uP();
     *      p.fulfill([1,2,3]);
     *      p.resolved; // => [1,2,3]
     *      
     *  Example: Pass through opaque arguments (experimental)
     *      p = uP();
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
    uP.prototype.fulfill = function(x,o){
        if(!this._state){
            task(resolver,[this._tuple,this._state = 1,this._value = x, this._opaque = o]);
        }

        return this;    
    }

    /**
     * Resolves a promise with a `value` yielded from another promise 
     * 
     *  Example: resolve literal value
     *      p = uP();
     *      p.resolve(123); // fulfills promise with 123
     *      
     *  Example: resolve value from another pending promise
     *      p1 = uP();
     *      p2 = uP();
     *      p1.resolve(p2);
     *      p2.fulfill(123) // => p2._value = 123
     *      
     * @param {Object} value
     * @return {Object} promise
     * @api public
     */
    uP.prototype.resolve = function(x,o){
        var then, z = 0, p = this, z = 0;

        if(!this._state){
            if(x === p) p.reject(new TypeError("x === p"));

            if(x && (typeof x === 'object' || typeof x === 'function')){
                try { then = x.then } catch(e){ p.reject(e) }
            } 

            if(typeof then !== 'function'){
                task(resolver,[this._tuple,this._state = 1,this._value = x, this._opaque = o])   
            } else if(!z){
                try {
                    then.apply(x,[function(y){
                        if(!z++) p.resolve(y,o);
                    },function(r){
                        if(!z++) p.reject(r);
                    }]);
                } catch(e) {
                    if(!z++) p.reject(e);
                }  
            }
        }

        return this;
    }

    /**
     * Rejects promise with a `reason`
     *
     *  Example:
     *      p = uP();
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
    uP.prototype.reject = function(x,o){
        if(!this._state){
            task(resolver,[this._tuple,this._state = 2,this._value = x, this._opaque = o]);
        }

        return this;    
    }

    /**
     * Notifies attached handlers
     *
     *  Example:
     *      p = uP();
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
    uP.prototype.progress = function(){
        var args = slice.call(arguments), fn;
        for(var i = 0, l = this._tuple.length; i < l; i++){
            if(typeof (fn = this._tuple[i][3]) === 'function')
                fn.apply(this,arguments);
        }
    }

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
     * @param {Number} time timeout value in ms or null to clear timeout
     * @param {Function} callback optional timeout function callback
     * @throws {RangeError} If exceeded timeout  
     * @return {Object} promise
     * @api public
     */
    uP.prototype.timeout = function(msec,func){
        var p = this;

        if(msec === null) {
            clearTimeout(p._timer);
            p._timer = null;
        } else if(!p._timer){             
            p._timer = setTimeout(onTimeout,msec);
        }       

        function onTimeout(){ 
            var e = RangeError("exceeded timeout");
            if(!p._state) {
                if(typeof func === 'function') func(p);
                else if(typeof p.onerror === 'function') p.onerror(e);
                else throw e;
            }
        }

        return this;
    }

    /**
     * Wraps a `proto` into a promise
     * 
     * Example: wrap an Array
     *      p = Promise();
     *      c = p.wrap(Array);
     *      c(1,2,3); // => calls constructor and fulfills promise 
     *      p.resolved; // => [1,2,3]
     *
     * @param {Object} proto
     * @return {Object} promise
     * @api public
     */
    uP.prototype.wrap = function(proto){
        var p = this;

        return function(){
            var args = slice.call(arguments), ret;

            if(proto instanceof microPromise){
                proto.fulfill(args).then(p.fulfill,p.reject);
            } else if(typeof proto === 'function'){
                try{
                    ret = proto.apply(p,args);
                    p.resolve(ret);
                } catch(err) {
                    p.reject(err);
                }
            }
                
            return p;
        }              
    }
    /**
     * Deferres a task and fulfills with return value.
     * The process may also return a promise itself which to wait on.  
     * 
     * Example: Make readFileSync async
     *      fs = require('fs');
     *      var asyncReadFile = uP().defer(fs.readFileSync,'./index.js','utf-8');
     *      asyncReadFile.then(function(data){
     *          console.log(data)
     *      },function(error){
     *          console.log("Read error:", error);
     *      });
     *         
     * @return {Object} promise
     * @api public
     */
    uP.prototype.defer = function(){
        var args = slice.call(arguments),
            proc = args.shift(),
            p = this;

        if(typeof proc === 'function'){
            task(enclose,args);
        }

        function enclose(){
            try { p.resolve(proc.apply(p,args)) } catch(err) { p.reject(err) } 
        }

        return this;
    }
    /**
     * Adapted for nodejs style functions expecting a callback. 
     * 
     * Example: make readFile async
     *      fs = require('fs');
     *      var asyncReadFile = uP.async(fs.readFile,'./index.js','utf-8');
     *      asyncReadFile.then(function(data){
     *          console.log(data);
     *      },function(error){
     *          console.log("Read error:", error);
     *      });
     *         
     * @return {Object} promise
     * @api public
     */
    uP.prototype.async = function(){
        var p = this,
            args = slice.call(arguments);

        function callback(err,ret){ if(!err) p.fulfill(ret); else p.reject(ret); }

        args[args.length] = callback;

        return this.defer.apply(this,args);
    }

    /**
     * Joins promises and collects results into an array.
     * If any of the promises are rejected the chain is also rejected.  
     * 
     * Example: join with two promises
     *      a = uP();
     *      b = uP();
     *      c = uP();
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
    uP.prototype.join = function(j){
        var p = this, 
            y = [], 
            u = new uP().resolve(p).then(function(v){y[0] = v});

        if(arguments.length > 1) {
            j = slice.call(arguments);
        }

        if(!isArray(j)) j = [j];

        function collect(i){
            j[i].done(function(v){
                y[i+1] = v;
            },u.reject);

            return function(){return j[i]}    
        }

        for(var i = 0; i < j.length; i++){
            u = u.then(collect(i));
        }
        
        return u.then(function(){return y});
    }


    /* Resolver function, yields back a promised value to handlers */
    function resolver(tuple,state,value,opaque){
        var t, p, h, x = value;

        while(t = tuple.shift()) {
            p = t[0];
            h = t[state];

            if(typeof h === 'function') {
                try {
                    x = h(value,opaque);
                    p.resolve(x,opaque);
                } catch(e) {
                    p.reject(e);
                }     
            } else {
                p._state = state;
                p._value = x;
                p._opaque = opaque;
                task(resolver,[p._tuple, p._state, p._value, p._opaque]);
            }
        }
    }

    /* expose this module */
    if(module && module.exports) module.exports = uP;
    else if(typeof define ==='function' && define.amd) define(uP); 
    else root.uP = uP;
}(this));


});
require.register("kaerus-component-ajax/index.js", function(exports, require, module){
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
require.register("kaerus-component-urlparser/index.js", function(exports, require, module){
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
require.register("kaerus-component-base64/index.js", function(exports, require, module){
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
require.register("arango/index.js", function(exports, require, module){
module.exports = require('./lib/arango');

});
require.register("arango/lib/arango.js", function(exports, require, module){
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

/* connection factory */
Arango.Connection = function() {
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
Arango.api = function(ns, exp) {
    var api = {};

    api[ns] = exp;

    attach(this, api);

    return exp;
}

/* base64 helper */
Arango.base64 = base64;

Arango.prototype = {
    "use": function(options) {
        return new Arango(this, options);
    },
    "api": function(api) {
        if (!api) return ArangoAPI;

        attach(this, api);

        return new Arango(this);
    },
    "get": function(path, options, callback) {
        return this.request('GET', path, null, options, callback);
    },
    "post": function(path, data, options, callback) {
        return this.request('POST', path, data, options, callback);
    },
    "put": function(path, data, options, callback) {
        return this.request('PUT', path, data, options, callback);
    },
    "delete": function(path, options, callback) {
        return this.request('DELETE', path, null, options, callback);
    },
    "head": function(path, options, callback) {
        return this.request('HEAD', path, null, options, callback);
    },
    "patch": function(path, data, options, callback) {
        return this.request('PATCH', path, data, options, callback);
    },
    "options": function(path, options, callback) {
        return this.request("OPTIONS", path, null, options, callback);
    },
    /**
     *
     * @param active                boolean, true to activate.
     * @param fireAndForget     boolean, if true fire and forget mode is activated.
     * @returns {Arango}
     */
    "setAsyncMode": function(active, fireAndForget) {

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

    "debug": function(on) {
        if (on === undefined) return debug;

        debug = !! on;
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
            get: function() {
                return context();
            }
        });
    } else {
        db[ns] = typeof api === 'function' ? api(db) : context();
    }

    function context() {
        var instance = (require(api))(db);

        context = function() {
            return instance
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
require.register("arango/lib/request.js", function(exports, require, module){
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

    if (typeof callback === 'function') {
        result.then(function(value, opaque) {
            callback(undefined, value, opaque);
        }, function(reason, opaque) {
            callback(-1, reason, opaque);
        }, function(progress) {
            callback(0, progress);
        });
    }

    return result;
}

module.exports = request;

});
require.register("arango/lib/utils.js", function(exports, require, module){
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
require.register("arango/lib/xhr.js", function(exports, require, module){
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
    xhr = function(method, path, options, data, resolver) {
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
        req(options, function(res) {
            var buf = [];

            res.on('data', function(chunk) {
                buf[buf.length] = chunk;
            }).on('end', function() {
                buf = buf.join('');
                reply(resolver, buf, res);
            }).on('error', function(error) {
                reply(resolver, error);
            });
        }).on('error', function(error) {
            reply(resolver, error)
        }).end(data, options.encoding);
    }
} else {
    xhr = function(method, path, options, data, resolver) {
        "use strict";

        var ajax = require('ajax'),
            buf;

        ajax(method, path, options, data).when(function(res) {
            buf = res.responseText;
            reply(resolver, buf, res);
        }, function(error) {
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
        } catch (e) {}
    }

    if (0 < xhr.status && 399 > xhr.status) {
        resolver.resolve(data, xhr);
    } else {
        resolver.reject(data, xhr);
    }
}

module.exports = xhr;

});
require.register("arango/lib/url.js", function(exports, require, module){
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

    return Object.keys(o).reduce(function(a, b, c) {
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
require.register("arango/lib/api/transaction.js", function(exports, require, module){
var Arango = require('../arango');

function TransactionAPI(db) {
    var path = "/_api/transaction/";
    
    return {
        /**
         *
         * @param collection        - contains the list of collections to be used in the transaction (mandatory). collections
         *                            must be a JSON array that can have the optional sub-attributes read and write. read and
         *                            write must each be either lists of collections names or strings with a single
         *                            collection name.
         * @param action            - the actual transaction operations to be executed, in the form of stringified Javascript
         *                            code.
         * @param options           - a JSON Object contatining optional parameter:
         *                                  - params        - optional arguments passed to action.
         *                                  - waitForSync   - an optional boolean flag that, if set, will force the
         *                                                    transaction to write all data to disk before returning.
         *                                  - lockTimeout   - an optional numeric value that can be used to set a timeout for
         *                                                    waiting on collection locks. If not specified, a default value
         *                                                    will be used. Setting lockTimeout to 0 will make ArangoDB not
         *                                                    time out waiting for a lock.
         *                                  - replicate     - whether or not to replicate the operations from this transaction.
         *                                                    If not specified, the default value is true.
         * @param callback
         * @returns {*}
         */
        "submit": function(collections, action, options, callback) {

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
require.register("arango/lib/api/collection.js", function(exports, require, module){
var Arango = require('../arango'),
    url = require('../url');

function CollectionAPI(db) {
    var path = "/_api/collection/";

    return {
        /**
         * Creates a collection
         *
         * @param collection    - the collection name
         * @param options       - a JSONObject containing optional attributes:
         *                          - waitForSync (default: false): If true then the data is synchronised to disk
         *                              before returning from a create or update of a document.
         *                          - doCompact (default is true): whether or not the collection will be compacted.
         *                          - type (default is 2): the type of the collection to create. The following values for
         *                              type are valid: - 2: document collection - 3: edges collection
         *                          - journalSize (default is a @ref CommandLineArangod "configuration parameter"):
         *                              The maximal size of a journal or datafile. Must be at least 1MB.
         *                          - isSystem (default is false): If true, create a system collection. In this case
         *                              collection-name should start with an underscore. End users should normally create
         *                              non-system collections only. API implementors may be required to create system
         *                              collections in very special occasions, but normally a regular collection will do.
         *                          - isVolatile (default is false): If true then the collection data is kept in-memory only
         *                              and not made persistent. Unloading the collection will cause the collection data to
         *                              be discarded. Stopping or re-starting the server will also cause full loss of data
         *                              in the collection. Setting this option will make the resulting collection be slightly
         *                              faster than regular collections because ArangoDB does not enforce any synchronisation
         *                              to disk and does not calculate any CRC checksums for datafiles.
         *                          -keyOptions  additional options for key generation. If specified, then keyOptions should
         *                              be a JSON array containing the following attributes (note: some of them are optional):
         *                              - type:         "traditional" and "autoincrement".
         *                              - allowUserKeys: if set to true, then it is allowed to supply own key values in the
         *                                              _key attribute of a document.
         *                              - increment:    increment value for autoincrement key generator.
         *                              - offset:       initial offset value for autoincrement key generator.
         *
         * @param callback
         * @returns {*}
         */
        "create": function(collection, options, callback) {
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
         *  The result is an object describing the collection.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "get": function(id, callback) {
            return db.get(path + id, callback);
        },
        /**
         *  Deletes the collection.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "delete": function(id, callback) {
            return db.delete(path + id, callback);
        },
        /**
         * Deletes all documents of a collection.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "truncate": function(id, callback) {
            return db.put(path + id + '/truncate', null, callback);
        },
        /**
         * Counts the document in the collection.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "count": function(id, callback) {
            return db.get(path + id + '/count', callback);
        },
        /**
         * Result contains the number of documents and additional statistical information about the collection.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "figures": function(id, callback) {
            return db.get(path + id + '/figures', callback);
        },
        /**
         * Returns a list of all collections in the database.
         *
         * @param excludeSystem  - if set to true no system collections are returned.
         * @param callback
         * @returns {*}
         */
        "list": function(excludeSystem, callback) {
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
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "load": function(id, count, callback) {
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
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "unload": function(id, callback) {
            return db.put(path + id + '/unload', null, callback);
        },
        /**
         * Renames a collection.
         *
         * @param id        - the collection handle.
         * @param name      - the new name
         * @param callback
         * @returns {*}
         */
        "rename": function(id, name, callback) {
            var data = {
                name: name
            };
            return db.put(path + id + '/rename', data, callback);
        },
        /**
         * Result contains the waitForSync, doCompact, journalSize, and isVolatile properties.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "getProperties": function(id, callback) {
            return db.get(path + id + '/properties', callback);
        },
        /**
         * Changes the properties of a collection.
         *
         * @param id            - the collection handle.
         * @param properties    - JSON Object that can contain each of the following:
         *                          - waitForSync: If true then creating or changing a document will wait until the data has
         *                                         been synchronised to disk.
         *                          - journalSize: Size (in bytes) for new journal files that are created for the collection.
         * @param callback
         * @returns {*}
         */
        "setProperties": function(id, data, callback) {
            return db.put(path + id + '/properties', data, callback);
        },
        /**
         * Result contains the collection's revision id. The revision id is a server-generated string that clients can use
         * to check whether data in a collection has changed since the last revision check.
         *
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "revision": function(id, callback) {
            return db.get(path + id + '/revision', callback);
        },

        /**
         * Will calculate a checksum of the meta-data (keys and optionally revision ids) and optionally the document data in
         * the collection.
         * The checksum can be used to compare if two collections on different ArangoDB instances contain the same contents.
         * The current revision of the collection is returned too so one can make sure the checksums are calculated for the
         * same state of data.
         *
         *
         * @param id        - the collection handle.
         * @param options   - JSON Object that can contain each of the following:
         *                          - withRevisions: If true, then revision ids (_rev system attributes) are included in
         *                                               the checksumming.
         *                          - withData:      If true, the user-defined document attributes will be included in the
         *                                           calculation too.
         * @param callback
         * @returns {*}
         */
        "checksum": function(id, options, callback) {
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
         * @param id        - the collection handle.
         * @param callback
         * @returns {*}
         */
        "rotate": function(id, callback) {
            return db.put(path + id + '/rotate', null, null, callback);
        }
    }
}


module.exports = Arango.api('collection', CollectionAPI);

});
require.register("arango/lib/api/database.js", function(exports, require, module){
var Arango = require('../arango');

function DatabaseAPI(db) {
    var path = "/_api/database/";
    
    return {
        "create": function(name, users, callback) {
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
        "current": function(callback) {
            return db.get(path + 'current', callback);
        },
        "list": function(callback) {
            return db.get(path, callback);
        },
        "user": function(callback) {
            return db.get(path + 'user', callback);
        },
        "delete": function(name, callback) {
            return db.delete(path + name, callback);
        }
    };
}

module.exports = Arango.api('database', DatabaseAPI);

});
require.register("arango/lib/api/document.js", function(exports, require, module){
var Arango = require('../arango'),
    url = require('../url');

function DocumentAPI(db) {
    var path = "/_api/document";
    
    return {
        /**
         * creates a a document in a given collection.
         *
         * @param collection - the collection
         * @param data - the data of the document as JSON object
         * @param options - an object with the following optional parameters:
         *                  - createCollection : - Boolean, if set the collection given in "collection" is created as well.
         *                  - "waitForSync": -  Boolean, wait until document has been synced to disk.
         * @param callback
         * @returns {*}
         */
        "create": function(collection, data, options, callback) {

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
         * @param id -- the document-handle
         * @param options  - an object with 2 possible attributes:
         *                  - "match": boolean defining if the given revision should match the found document or not.
         *                  - "rev":   String the revision, used by the "match" attribute.
         * @param callback
         * @returns {*}
         */
        "get": function(id, options, callback) {
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
         * @param id -- the document-handle
         * @param data -- a JSON Object containing the new attributes for the document handle
         * @param options  - an object with 4 possible attributes:
         *                  - "match": - boolean defining if the given revision should match the found document or not.
         *                  - "rev":  - String the revision, used by the "match" attribute.
         *                  - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
         *                  - "waitForSync": -  Boolean, wait until document has been synced to disk.
         * @param callback
         * @returns {*}
         */
        "put": function(id, data, options, callback) {
            var headers;
            options = options ? options : {};

            if (typeof options == 'function') {
                callback = options;
                options = null;
            } else if (options) {
                headers = url.ifMatch(id, options);
            }
            if (options.forceUpdate !== undefined) {
                options.policy = (options.forceUpdate === true) ? "last" : "error";
                delete options.forceUpdate;
            }

            return db.put(path + '/' + id + url.options(options), data, headers, callback);
        },
        /**
         * patches a document with the data given in data
         *
         * @param id -- the document-handle
         * @param data -- a JSON Object containing the new attributes for the document handle
         * @param options  - an object with 4 possible attributes:
         *                  - "match": - boolean defining if the given revision should match the found document or not.
         *                  - "rev":  - String the revision, used by the "match" attribute.
         *                  - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
         *                  - "waitForSync": -  Boolean, wait until document has been synced to disk.
         *                  - "keepNull": -  Boolean, default is true, if set to false a patch request will delete every null value attributes.
         * @param callback
         * @returns {*}
         */
        "patch": function(id, data, options, callback) {
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
         * @param id -- the document-handle
         * @param options  - an object with 4 possible attributes:
         *                  - "match": - boolean defining if the given revision should match the found document or not.
         *                  - "rev":  - String the revision, used by the "match" attribute.
         *                  - "forceUpdate": - Boolean, if set a deletion is performed even when the given revision does not match.
         *                  - "waitForSync": -  Boolean, wait until document has been synced to disk.
         * @param callback
         * @returns {*}
         */
        "delete": function(id, options, callback) {
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
         * same as get but only returns the header
         *
         * @param id -- the document-handle
         * @param options  - an object with 2 possible attributes:
         *                  - "match" boolean defining if the given revision should match the found document or not.
         *                  - "rev"   String the revision, used by the "match" attribute.
         * @param callback
         * @returns {*}
         */
        "head": function(id, options, callback) {
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
        "list": function(collection, callback) {
            return db.get(path + "?collection=" + collection, callback);
        }
    }
}


module.exports = Arango.api('document', DocumentAPI);

});
require.register("arango/lib/api/action.js", function(exports, require, module){
var Arango = require('../arango'),
    urlparser = require('urlparser'),
    utils = require('../utils');

/* pull in dependencies */
require('./document');
require('./admin');

function ActionAPI(db) {
    var submit = {};

    return {
        /* Defines an action */
        "define": function(o, f, reload) {

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
                }).then(function(res) {
                    submit[o.name].route = res._id;
                    /* reload routes */
                    if (reload === true) db.admin.routesReload();
                }, function(error) {
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
        /* Executes an action and returns a promise */
        "submit": function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift();

            return submit[name].apply(this, args);
        },
        "undefine": function(name) {
            if (!submit[name])
                throw new Error("No such action: " + name);

            if (submit[name].route) {
                db.document.delete(submit[name].route, {
                    waitForSync: true
                }).done();
            }


            delete submit[name];
        },
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
require.register("arango/lib/api/cursor.js", function(exports, require, module){
var Arango = require('../arango');

function CursorAPI(db) {
    var path = "/_api/cursor/";

    return {
        /**
         *
         * @param id -- The id of the cursor to fetch data for
         * @param callback
         * @returns {*}
         */
        "get": function(id, callback) {
            
            return db.put(path + id, {}, callback);
        },
        /**
         * Executes query string.
         *
         * @param data - A JSON Object containing the query data
         * - query: contains the query string to be executed (mandatory)
         *              - count: boolean flag that indicates whether the number of documents in the result set should be
         *                      returned in the "count" attribute of the result (optional).
         *              - batchSize: maximum number of result documents to be transferred from the server to the client
         *                      in one roundtrip (optional). If this attribute is not set,
         *                      a server-controlled default value will be used.
         *              - bindVars: key/value list of bind parameters (optional).
         *              - options: key/value list of extra options for the query (optional).
         *                      - fullCount: if set to true and the query contains a LIMIT clause,
         *                                  then the result will contain an extra attribute extra with a sub-attribute fullCount.
         *                                  This sub-attribute will contain the number of documents in the result before
         *                                  the last LIMIT in the query was applied. It can be used to count the number of documents
         *                                  that match certain filter criteria, but only return a subset of them, in one go.
         * @param callback
         * @returns {*}
         */
        "create": function(data, callback) {

            return db.post(path, data, callback);
        },
        /**
         * To validate a query string without executing it.
         *
         * @param data - A JSON Object containing the query data
         * - query: contains the query string to be executed (mandatory)
         *              - count: boolean flag that indicates whether the number of documents in the result set should be
         *                      returned in the "count" attribute of the result (optional).
         *              - batchSize: maximum number of result documents to be transferred from the server to the client
         *                      in one roundtrip (optional). If this attribute is not set,
         *                      a server-controlled default value will be used.
         *              - bindVars: key/value list of bind parameters (optional).
         *              - options: key/value list of extra options for the query (optional).
         *                      - fullCount: if set to true and the query contains a LIMIT clause,
         *                                  then the result will contain an extra attribute extra with a sub-attribute fullCount.
         *                                  This sub-attribute will contain the number of documents in the result before
         *                                  the last LIMIT in the query was applied. It can be used to count the number of documents
         *                                  that match certain filter criteria, but only return a subset of them, in one go.
         * @param callback
         * @returns {*}
         */
        "query": function(data, callback) {

            return db.post("/_api/query", data, callback);
        },
        /**
         * To explain a query string without executing it.
         *
         * @param data - A JSON Object containing the query data
         * - query: contains the query string to be executed (mandatory)
         *              - count: boolean flag that indicates whether the number of documents in the result set should be
         *                      returned in the "count" attribute of the result (optional).
         *              - batchSize: maximum number of result documents to be transferred from the server to the client
         *                      in one roundtrip (optional). If this attribute is not set,
         *                      a server-controlled default value will be used.
         *              - bindVars: key/value list of bind parameters (optional).
         *              - options: key/value list of extra options for the query (optional).
         *                      - fullCount: if set to true and the query contains a LIMIT clause,
         *                                  then the result will contain an extra attribute extra with a sub-attribute fullCount.
         *                                  This sub-attribute will contain the number of documents in the result before
         *                                  the last LIMIT in the query was applied. It can be used to count the number of documents
         *                                  that match certain filter criteria, but only return a subset of them, in one go.
         * @param callback
         * @returns {*}
         */
        "explain": function(data, callback) {
            var queryData = {};

            queryData.query = data;
            
            return db.post("/_api/explain", data, callback);
        },
        "delete": function(id, callback) {

            return db.delete(path + id, callback);
        }
    }
}

module.exports = Arango.api('cursor', CursorAPI);

});
require.register("arango/lib/api/simple.js", function(exports, require, module){
var Arango = require('../arango');

function SimpleAPI(db) {
    var path = "/_api/simple/";
    
    return {
        /**
         * Returns all documents of a collections. The call expects a JSON object as body with the following attributes:
         * @param collection    - the collection
         * @param options       - JSONObject with optional parameters
         *                          -skip   can also be set using the "skip" method in this class.
         *                          -limit  can also be set using the "limit" method in this class
         * @param callback
         * @returns {*}
         */
        "list": function(collection, options, callback) {
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
         * @param collection    - the collection
         * @param callback
         * @returns {*}
         */
        "any": function(collection, callback) {
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
         * @param collection
         * @param example
         * @param options       - JSONObject with optional parameters
         *                          -skip   can also be set using the "skip" method in this class.
         *                          -limit  can also be set using the "limit" method in this class
         * @param callback
         * @returns {*}
         */
        "example": function(collection, example, options, callback) {
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
         * @param collection
         * @param example
         * @param options       - JSONObject with optional parameters
         *                          -waitForSync  if set to true, then all removal operations will instantly be synchronised
         *                                        to disk. If this is not specified, then the collection's default sync
         *                                        behavior will be applied.
         *                          -limit  can also be set using the "limit" method in this class
         * @param callback
         * @returns {*}
         */
        "removeByExample": function(collection, example, options, callback) {
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
         * @param collection    - the collection
         * @param example       - the example.
         * @param newValue      - the replacement document.
         * @param options       - JSONObject with optional parameters
         *                          -waitForSync  if set to true, then all removal operations will instantly be synchronised
         *                                        to disk. If this is not specified, then the collection's default sync
         *                                        behavior will be applied.
         *                          -limit  can also be set using the "limit" method in this class
         * @param callback
         * @returns {*}
         */
        "replaceByExample": function(collection, example, newValue, options, callback) {
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
         * @param collection    - the collection.
         * @param example       - the example.
         * @param newValue      - the replacement document.
         * @param options       - JSONObject with optional parameters
         *                          -waitForSync  if set to true, then all removal operations will instantly be synchronised
         *                                        to disk. If this is not specified, then the collection's default sync
         *                                        behavior will be applied.
         *                          -limit  can also be set using the "limit" method in this class
         *                          -keepNull "false" will remove null values from the update document.
         * @param callback
         * @returns {*}
         */
        "updateByExample": function(collection, example, newValue, options, callback) {
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
         * @param collection
         * @param example
         * @param options       - JSONObject with optional parameters
         *                          -skip   can also be set using the "skip" method in this class.
         *                          -limit  can also be set using the "limit" method in this class
         * @param callback
         * @returns {*}
         */
        "firstByExample": function(collection, example, options, callback) {
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
         * @param collection  - the collection
         * @param count       - the number of documents to return at most. Specifiying count is optional. It defaults to 1.
         * @param callback
         * @returns {*}
         */
        "first": function(collection, count, callback) {
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
         * @param collection  - the collection
         * @param count       - the number of documents to return at most. Specifiying count is optional. It defaults to 1.
         * @param callback
         * @returns {*}
         */
        "last": function(collection, count, callback) {
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
         * @param collection    - the collection.
         * @param attribute     - the attribute path to check.
         * @param left          - The lower bound.
         * @param right         - The upper bound.
         * @param options       - JSONObject with optional parameters
         *                          -skip   can also be set using the "skip" method in this class.
         *                          -limit  can also be set using the "limit" method in this class
         *                          -closed If true, use interval including left and right, otherwise exclude right, but
         *                              include left.
         * @param callback
         * @returns {*}
         */
        "range": function(collection, attribute, left, right, options, callback) {
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
         * @param collection    - the collection
         * @param latitude      - The latitude of the coordinate.
         * @param longitude     - The longitude of the coordinate.
         * @param options       - JSONObject with optional parameters
         *                          -skip   can also be set using the "skip" method in this class.
         *                          -limit  can also be set using the "limit" method in this class
         *                          -geo    If given, the identifier of the geo-index to use.
         *                          -distance    If given, the attribute key used to store the distance. (optional).
         * @param callback
         * @returns {*}
         */
        "near": function(collection, latitude, longitude, options, callback) {
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
         * @param collection    - the collection
         * @param latitude      - The latitude of the coordinate.
         * @param longitude     - The longitude of the coordinate.
         * @param radius        - The radius in meters.
         * @param options       - JSONObject with optional parameters
         *                          -skip   can also be set using the "skip" method in this class.
         *                          -limit  can also be set using the "limit" method in this class
         *                          -geo    If given, the identifier of the geo-index to use.
         *                          -distance    If given, the attribute key used to store the distance. (optional).
         * @param callback
         * @returns {*}
         */
        "within": function(collection, latitude, longitude, radius, options, callback) {
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
         * @param collection    - the collection
         * @param attribute     - the attribute
         * @param query         - the query
         * @param options       - JSONObject with optional parameters
         *                          -skip   can also be set using the "skip" method in this class.
         *                          -limit  can also be set using the "limit" method in this class
         *                          -index    If given, the identifier of the fulltext-index to use.
         * @param callback
         * @returns {*}
         */
        "fulltext": function(collection, attribute, query, options, callback) {
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
        "skip": function(val) {
            this._skip = val;
            return this;
        },
        "limit": function(val) {
            this._limit = val;
            return this;
        }
    }
}

function applyOptions(o, data, attributes) {
    if (typeof attributes === 'object') {
        Object.keys(attributes).forEach(function(option) {
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
require.register("arango/lib/api/index.js", function(exports, require, module){
var Arango = require('../arango');


function IndexAPI(db) {
    var path = "/_api/index/",
        xpath = "/_api/index?collection=";
        
    return {
        /**
         * Creates a Cap Index for the collection
         * @param collection    - the collection
         * @param data          - a JSON Object containing at least one of the attributes "size" and "byteSize".
         * @param callback
         * @returns {*}
         */
        "createCapIndex": function(collection, data, callback) {
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
         * @param collection    - the collection
         * @param fields        - A list with one or two attribute paths. If it is a list with one attribute path location,
         *                        then a geo-spatial index on all documents is created using location as path to the
         *                        coordinates. The value of the attribute must be a list with at least two double values.
         *                        The list must contain the latitude (first value) and the longitude (second value). All
         *                        documents, which do not have the attribute path or with value that are not suitable, are
         *                        ignored.
         *                        If it is a list with two attribute paths latitude and longitude, then a geo-spatial index
         *                        on all documents is created using latitude and longitude as paths the latitude and the
         *                        longitude. The value of the attribute latitude and of the attribute longitude must a double.
         *                        All documents, which do not have the attribute paths or which values are not suitable,
         *                        are ignored.
         *
         * @prama options       - a JSONObject with optional parameters:
         *                          - geoJson: If a geo-spatial index on a location is constructed and geoJson is true, then
         *                                     the order within the list is longitude followed by latitude. This corresponds
         *                                     to the format described in http://geojson.org/geojson-spec.html#positions
         *                          - constraint: If constraint is true, then a geo-spatial constraint is created. The
         *                                      constraint is a non-unique variant of the index. Note that it is also possible
         *                                      to set the unique attribute instead of the constraint attribute.
         *                          - ignoreNull: If a geo-spatial constraint is created and ignoreNull is true, then documents
         *                                      with a null in location or at least one null in latitude or longitude are ignored.
         * @param callback
         * @returns {*}
         */
        "createGeoSpatialIndex": function(collection, fields, options, callback) {
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
         * @param collection    - the collection
         * @param fields        - A list of attribute paths.
         * @prama unique       -  If true, then create a unique index.
         * @param callback
         * @returns {*}
         */
        "createHashIndex": function(collection, fields, unique, callback) {
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
         * @param collection    - the collection
         * @param fields        - A list of attribute paths.
         * @prama unique       -  If true, then create a unique index.
         * @param callback
         * @returns {*}
         */
        "createSkipListIndex": function(collection, fields, unique, callback) {
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
         * @param collection    - the collection
         * @param fields        - A list of attribute paths.
         * @prama minLength     - Minimum character length of words to index. Will default to a server-defined value if
         *                        unspecified. It is thus recommended to set this value explicitly when creating the index.
         * @param callback
         * @returns {*}
         */
        "createFulltextIndex": function(collection, fields, minLength, callback) {
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
         * @param collection    - the collection
         * @param fields        - A list of pairs. A pair consists of an attribute path followed by a list of values.
         * @param callback
         * @returns {*}
         */
        "createBitarrayIndex": function(collection, fields, callback) {
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
         * @param id    the index id.
         * @param callback
         * @returns {*}
         */
        "get": function(id, callback) {
            return db.get(path + id, callback);
        },
        /**
         * Deletes an index
         * @param id    the index id.
         * @param callback
         * @returns {*}
         */
        "delete": function(id, callback) {
            return db.delete(path + id, callback);
        },
        /**
         * Retrieves all indices for a collection
         *
         * @param collection    - the collection
         * @param callback
         * @returns {*}
         */
        "list": function(collection, callback) {
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
require.register("arango/lib/api/admin.js", function(exports, require, module){
var Arango = require('../arango');

function AdminAPI(db) {
    var path = "/_admin/";
    
    return {
        "version": function(details, callback) {
            return db.get(path + "version?details=" + !! details, callback);
        },
        "statistics": function(callback) {
            return db.get(path + "statistics", callback);
        },
        "statisticsDescription": function(callback) {
            return db.get(path + "statistics-description", callback);
        },
        /**
         * options can include these keys,
         * upto		Returns all log entries up to log level upto. Note that upto must be: - fatal or 0 - error or
         *          1 - warning or 2 - info or 3 - debug or 4 The default value is info.
         * level	Returns all log entries of log level level. Note that the URL parameters upto and level are mutually
         *          exclusive
         * start	Returns all log entries such that their log entry identifier (lid value) is greater or equal to start.
         * size		Restricts the result to at most size log entries.
         * offset	Starts to return log entries skipping the first offset log entries. offset and size can be used
         *          for pagination.	Number
         * sort		Sort the log entries either ascending (if sort is asc) or descending (if sort is desc) according
         *          to their lid values. Note that the lid imposes a chronological order. The default value is asc
         */
        "log": function(options, callback) {

            params = "";
            if (options) {
                Object.keys(options).forEach(function(param) {
                    params += param + '=' + options[param] + "&";
                });
            }
            return db.get(path + "log?" + params, callback);
        },
        "routes": function(callback) {
            return db.get(path + "routing/routes", callback);
        },
        "routesReload": function(callback) {
            return db.get(path + "routing/reload", callback);
        },
        "modulesFlush": function(callback) {
            return db.get(path + "modules/flush", callback);
        },
        "time": function(callback) {
            return db.get(path + "time", callback);
        },
        "echo": function(method, htmloptions, data, headers, callback) {
            method = typeof method === 'string' ? method.toUpperCase() : 'GET';
            headers = {
                headers: headers
            };
            htmloptions = htmloptions ? htmloptions : '';

            return db.request(method, path + 'echo' + htmloptions, data, headers, callback);
        }
    }
}

module.exports = Arango.api('admin', AdminAPI);

});
require.register("arango/lib/api/aqlfunction.js", function(exports, require, module){
var Arango = require('../arango');

function AqlfunctionAPI(db) {
    var path = "/_api/aqlfunction/";
    
    return {
        /**
         * String name  - name of the function
         * String code - the function
         * Boolean isDeterministic  -  optional boolean value to indicate that the function results are fully deterministic.
         */
        "create": function(name, code, isDeterministic, callback) {
            var options = {
                "name": name,
                "code": code
            };
            if (isDeterministic !== null) {
                options.isDeterministic = isDeterministic;
            }
            return db.post(path, options, callback);
        },
        /**
         * String name  - name of the function
         * Boolean group  - if set to true all functions is the namespace set in name will be deleted
         */
        "delete": function(name, group, callback) {
            return db.delete(path + encodeURIComponent(name) + "/?group=" + group, callback);
        },
        /**
         * String namespace  - If set all functions in this namespace will be returned
         */
        "get": function(namespace, callback) {
            params = "";
            if (namespace) {
                params += '?namespace=' + encodeURIComponent(namespace);
            }
            return db.get(path + params, callback);
        }
    }
}

module.exports = Arango.api('aqlfunction', AqlfunctionAPI);

});
require.register("arango/lib/api/traversal.js", function(exports, require, module){
var Arango = require('../arango');

function TraversalAPI(db) {
    var path = "/_api/traversal/";

    return {
        /**
         *
         * @param startVertex       -  id of the startVertex, e.g. "users/foo".
         * @param edgeCollection    -  the edge collection containing the edges.
         * @param options           - a JSON Object containing parameter:
         *                                  - filter  body (JavaScript code) of custom filter function function signature:
         *                                    (config, vertex, path) -> mixed can return four different string values:
         *                                    - "exclude" -> this vertex will not be visited.
         *                                    - "prune" -> the edges of this vertex will not be followed.
         *                                    - "" or undefined -> visit the vertex and follow it's edges.
         *                                    - Array -> containing any combination of the above.
         *                                  - minDepth    visits only nodes in at least the given depth
         *                                  - maxDepth    visits only nodes in at most the given depth
         *                                  - visitor: body (JavaScript) code of custom visitor function function
         *                                      signature: (config, result, vertex, path) -> void visitor function can do
         *                                      anything, but its return value is ignored. To populate a result, use the
         *                                      result variable by reference.
         *                                  - direction: direction for traversal.  *if set*, must be either
         *                                      "outbound", "inbound", or "any" -
         *                                      *if not set*, the expander attribute must be specified.
         *                                  - init: body (JavaScript) code of custom result initialisation function function
         *                                      signature: (config, result) -> void initialise any values in result with what
         *                                      is required,
         *                                  - expander: body (JavaScript) code of custom expander function *must* be set if
         *                                      direction attribute is *not* set.  function signature: (config, vertex, path)
         *                                      -> array expander must return an array of the connections for vertex.
         *                                      each connection is an object with the attributes edge and vertex
         *                                  - strategy (optional): traversal strategy can be "depthfirst" or "breadthfirst"
         *                                  - order (optional): traversal order can be "preorder" or "postorder"
         *                                  - itemOrder (optional): item iteration order can be "forward" or "backward"
         *                                  - uniqueness (optional): specifies uniqueness for vertices and edges visited if
         *                                    set, must be an object like this: "uniqueness":
         *                                    {"vertices": "none"|"global"|path", "edges": "none"|"global"|"path"}
         *                                  - maxIterations (optional): Maximum number of iterations in each traversal. This
         *                                      number can be set to prevent endless loops in traversal of cyclic graphs. When
         *                                      a traversal performs as many iterations as the maxIterations value, the
         *                                      traversal will abort with an error. If maxIterations is not set, a server-
         *                                      defined value may be used.
         * @param callback
         * @returns {*}
         */
        "startTraversal": function(startVertex, edgeCollection, options, callback) {

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
require.register("arango/lib/api/endpoint.js", function(exports, require, module){
var Arango = require('../arango');

function EndpointAPI(db) {
    var  path = "/_api/endpoint";
    
    return {
        /**
         *
         * creates an endpoint
         *
         * @param endpoint -  the endpoint specification, e.g. tcp://127.0.0.1:8530
         * @param databases - a list of database names the endpoint is responsible for.
         * @param callback
         * @returns {*}
         */
        "create": function(endpoint, databases, callback) {
            var description = {};

            description.endpoint = endpoint;
            description.databases = databases;

            return db.post(path, description, callback);
        },
        /**
         * Returns the list of endpoints
         *
         * @param callback
         * @returns {*}
         */
        "get": function(callback) {
            return db.get(path, null, callback);
        },
        /**
         * Deletes an endpoint
         *
         * @param endpoint  - The endpoint which should be deleted.
         * @param callback
         * @returns {*}
         */
        "delete": function(endpoint, callback) {
            return db.delete(path + "/" + encodeURIComponent(endpoint), callback);
        }
    }
}


module.exports = Arango.api('endpoint', EndpointAPI);

});
require.register("arango/lib/api/import.js", function(exports, require, module){
var Arango = require('../arango'),
    url = require('../url');


function ImportAPI(db) {
    var path = "/_api/import";

    return {

        /**
         *
         * @param collection - The collection name
         * @param documents  - The data to import, can either be one single JSON Object containing a list of documents,
         *                     or a list of JSON Objects seperated ny new lines.
         * @param options    - a JSON Object containting the following optional parameters:
         *                      - createCollection : If true, the collection will be created if it doesn't exist.
         *                      - waitForSync: Wait until documents have been synced to disk before returning.
         *                      - complete : If set to true, it will make the whole import fail if any error occurs.
         *                      - details : If set to true or yes, the result will include an attribute details with
         *                                  details about documents that could not be imported.
         * @param callback
         * @returns {*}
         */
        "importJSONData": function(collection, documents, options, callback) {
            if (typeof documents === "function") {
                callback = documents;
                options = {};
                documents = collection;
                collection = db._collection;
            }

            if (typeof options === 'function') {
                callback = options;
                if (typeof collection !== "string") {
                    options = documents;
                    documents = collection;
                    collection = db._collection;

                } else {
                    options = {};
                }
            }
            options.type = "auto";
            options.collection = collection;
            return db.post(path + url.options(options), documents, callback);
        },
        /**
         *
         * @param collection - The collection name
         * @param documents  - The data to import, The first line of the request body must contain a JSON-encoded list of
         *                      attribute names. All following lines in the request body must contain JSON-encoded lists of
         *                      attribute values. Each line is interpreted as a separate document, and the values specified
         *                      will be mapped to the list of attribute names specified in the first header line.
         * @param options    - a JSON Object containting the following optional parameters:
         *                      - createCollection : If true, the collection will be created if it doesn't exist.
         *                      - waitForSync: Wait until documents have been synced to disk before returning.
         *                      - complete : If set to true, it will make the whole import fail if any error occurs.
         *                      - details : If set to true or yes, the result will include an attribute details with
         *                                  details about documents that could not be imported.
         * @param callback
         * @returns {*}
         */
        "importValueList": function(collection, documents, options, callback) {
            if (typeof documents === "function") {
                callback = documents;
                options = {};
                documents = collection;
                collection = db._collection;
            }

            if (typeof options === 'function') {
                callback = options;
                if (typeof documents !== "string") {
                    options = documents;
                    documents = collection;
                    collection = db._collection;

                } else {
                    options = {};
                }
            }

            options.collection = collection;

            return db.post(path + url.options(options), documents, {
                "NoStringify": true
            }, callback);
        }
    }
}


module.exports = Arango.api('import', ImportAPI);

});
require.register("arango/lib/api/query.js", function(exports, require, module){
var Arango = require('../arango'),
    utils = require('../utils');

require('./cursor');

function Aql() {

    var keywords = ['for', 'in', 'filter', 'from', 'include', 'collect', 'into', 'sort', 'limit', 'let', 'return'],
        aql = this;

    keywords.forEach(function(key) {
        aql[key] = function() {
            if (!aql.struct) aql.struct = {};
            if (!arguments.length) return aql.struct[key];
            var args = Array.prototype.slice.call(arguments);
            if (typeof args[0] === 'function') {
                aql.struct[key] = (function(func) {
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

    function structToString(s) {
        var struct = s || aql.struct;
        return keywords.filter(function(key) {
            return !!struct[key];
        }).map(function(q) {
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
        string: null,
        get: function() {
            if (query.struct) {
                this.string = query.toString();
                delete query.struct;
            }

            return this.string;
        },
        set: function(val) {
            this.string = val;
            delete query.struct;

            return this.string;
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
    "test": function() {
        return exec_query(this, "query", arguments);
    },
    "explain": function() {
        return exec_query(this, "explain", arguments);
    },
    "exec": function() {
        var db = this.db;

        var on_result = function(retval) {

            if (retval.hasMore) {
                this.next = function() {
                    return db.cursor.get(retval.id).then(on_result);
                };
            } else delete this.next;
            return retval.result;
        };
        return exec_query(this, "create", arguments).then(on_result);
    },
    "count": function(num) {
        this.options.count = num > 0 ? true : false;
        this.options.batchSize = num > 0 ? num : undefined;

        return this;
    },
    "new": function() {
        return new Aql();
    },
    "hasNext": function() {
        return this.next !== QueryAPI.prototype.next;
    },
    "next": function() {
        throw {
            name: "StopIteration"
        };
    }
};

module.exports = Arango.api('query', QueryAPI);

});
require.register("arango/lib/api/graph.js", function(exports, require, module){
var Arango = require('../arango'),
    utils = require('../utils'),
    url = require('../url');

function GraphAPI(db) {
    var path = "/_api/graph";

    return {

        /**
         *
         * @param graph - the name of the graph
         * @param vertices - the vertices collection
         * @param edges - the edge collection
         * @param waitForSync - boolean , wait until document has been sync to disk.
         * @param callback
         * @returns {*}
         */
        "create": function(graph, vertices, edges, waitForSync, callback) {
            var data = {
                _key: graph,
                vertices: vertices,
                edges: edges
            };

            var options = {};
            if (typeof waitForSync === "function") {
                callback = waitForSync;
            } else if (typeof waitForSync === "boolean") {
                options.waitForSync = waitForSync;
            }
            return db.post(path + optionsToUrl(this, options), data, callback);
        },
        /**
         * retrieves a graph from the database
         *
         * @param graph - the graph-handle
         * @param callback
         * @returns {*}
         */
        "get": function(graph, callback) {
            return db.get(path + '/' + graph, null, callback);
        },
        /**
         * retrieves a list of graphs from the database
         *
         * @param callback
         * @returns {*}
         */
        "list": function(callback) {
            return db.get(path, callback);
        },
        /**
         * Deletes a graph
         *
         * @param graph       - the graph-handle
         * @param waitForSync - boolean , wait until document has been sync to disk.
         * @param callback
         * @returns {*}
         */
        "delete": function(graph, waitForSync, callback) {

            var options = {};
            if (typeof waitForSync === "function") {
                callback = waitForSync;
            } else if (typeof waitForSync === "boolean") {
                options.waitForSync = waitForSync;
            }
            return db.delete(path + '/' + graph + optionsToUrl(this, options), null, callback);
        },
        "vertex": {
            /**
             *
             * @param graph - The graph-handle
             * @param vertexData - the vertex object as JSON. It is possible to set the vertex key by providing the _key attribute.
             * @param waitForSync - boolean , wait until document has been sync to disk.
             * @param callback
             * @returns {*}
             */
            "create": function(graph, vertexData, waitForSync, callback) {
                var options = {};
                if (typeof waitForSync === "function") {
                    callback = waitForSync;
                } else if (typeof waitForSync === "boolean") {
                    options.waitForSync = waitForSync;
                }
                return db.post(path + '/' + graph + '/vertex' + optionsToUrl(this, options), vertexData, callback);
            },

            /**
             * retrieves a vertex  from a graph
             *
             * @param graph     - the graph-handle
             * @param id        - the vertex-handle
             * @param options   - an object with 2 possible attributes:
             *                      - "match": boolean defining if the given revision should match the found document or not.
             *                      - "rev":   String the revision, used by the "match" attribute.
             * @param callback
             * @returns {*}
             */
            "get": function(graph, id, options, callback) {
                var headers;

                if (typeof options == 'function') {
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
             * @param graph     - the graph-handle
             * @param id        - the vertex-handle
             * @param data      - a JSON Object containing the new attributes for the document handle
             * @param options   - an object with 4 possible attributes:
             *                      - "match": - boolean defining if the given revision should match the found vertex or not.
             *                      - "rev":  - String the revision, used by the "match" attribute.
             *                      - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
             *                      - "waitForSync": -  Boolean, wait until document has been synced to disk.
             * @param callback
             * @returns {*}
             */
            "put": function(graph, id, data, options, callback) {
                var headers;

                if (typeof options == 'function') {
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
             * @param graph     - the graph-handle
             * @param id        - the vertex-handle
             * @param data      - a JSON Object containing the new attributes for the vertex handle
             * @param options   - an object with 5 possible attributes:
             *                      - "match": - boolean defining if the given revision should match the found vertex or not.
             *                      - "rev":  - String the revision, used by the "match" attribute.
             *                      - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
             *                      - "waitForSync": -  Boolean, wait until document has been synced to disk.
             *                      - "keepNull": -  Boolean, default is true, if set to false a patch request will delete
             *                                          every null value attributes.
             * @param callback
             * @returns {*}
             */
            "patch": function(graph, id, data, options, callback) {
                var headers;

                if (typeof options == 'function') {
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
             * @param graph     - the graph-handle
             * @param id        - the vertex-handle
             * @param options   - an object with 4 possible attributes:
             *                      - "match": - boolean defining if the given revision should match the found vertex or not.
             *                      - "rev":  - String the revision, used by the "match" attribute.
             *                      - "waitForSync": -  Boolean, wait until document has been synced to disk.
             * @param callback
             * @returns {*}
             */
            "delete": function(graph, id, options, callback) {
                var headers;

                if (typeof options == 'function') {
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
             *
             * @param graph     - the graph handle
             * @param edgeData  - the vertex object as JSON. It is possible to set the vertex key by providing the _key attribute.
             * @param from      - the start vertex of this edge
             * @param to        - the end vertex of this edge
             * @param label     - the edges label
             * @param waitForSync - boolean , wait until document has been sync to disk.
             * @param callback
             * @returns {*}
             */
            "create": function(graph, edgeData, from, to, label, waitForSync, callback) {

                if (typeof label === 'function') {
                    callback = label;
                    label = null;
                }

                var data = utils.extend({
                    _from: from,
                    _to: to
                }, edgeData);
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
                return db.post(path + '/' + graph + '/edge' + optionsToUrl(this, options), data, callback);
            },
            /**
             * retrieves an edge  from a graph
             *
             * @param id        - the edge-handle
             * @param options   - an object with 2 possible attributes:
             *                      - "match": boolean defining if the given revision should match the found document or not.
             *                      - "rev":   String the revision, used by the "match" attribute.
             * @param callback
             * @returns {*}
             */
            "get": function(graph, id, options, callback) {
                var headers;

                if (typeof options == 'function') {
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
             * @param graph     - the graph-handle
             * @param id        - the vertex-handle
             * @param data      - a JSON Object containing the new attributes for the document handle
             * @param options   - an object with 4 possible attributes:
             *                      - "match": - boolean defining if the given revision should match the found vertex or not.
             *                      - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
             *                      - "rev":  - String the revision, used by the "match" attribute.
             *                      - "waitForSync": -  Boolean, wait until vertex has been synced to disk.
             * @param callback
             * @returns {*}
             */
            "put": function(graph, id, data, options, callback) {
                var headers;

                if (typeof options == 'function') {
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
             * @param graph     - the graph-handle
             * @param id        - the edge-handle
             * @param data      - a JSON Object containing the new attributes for the edge handle
             * @param options   - an object with 4 possible attributes:
             *                      - "match": - boolean defining if the given revision should match the found edge or not.
             *                      - "rev":  - String the revision, used by the "match" attribute.
             *                      - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
             *                      - "waitForSync": -  Boolean, wait until edge has been synced to disk.
             *                      - "keepNull": -  Boolean, default is true, if set to false a patch request will delete
             *                                          every null value attributes.
             * @param callback
             * @returns {*}
             */
            "patch": function(graph, id, data, options, callback) {
                var headers;

                if (typeof options == 'function') {
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
             * @param graph     - the graph-handle
             * @param id        - the edge-handle
             * @param options   - an object with 4 possible attributes:
             *                      - "match": - boolean defining if the given revision should match the found edge or not.
             *                      - "rev":  - String the revision, used by the "match" attribute.
             *                      - "forceUpdate": - Boolean, if set a deletion is performed even when the given revision
             *                                          does not match.
             *                      - "waitForSync": -  Boolean, wait until document has been synced to disk.
             * @param callback
             * @returns {*}
             */
            "delete": function(graph, id, options, callback) {
                var headers;

                if (typeof options == 'function') {
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
         * @param graph - the graph handle
         * @param vertex - the vertex
         * @param options   - the following optional parameters are allowed:
         *                  -batchSize:  the batch size of the returned cursor
         *                  -limit:      limit the result size
         *                  -count:      return the total number of results (default "false")
         *                  -filter:     a optional filter, The attributes of filter:
         *                      -direction:     filter for inbound (value "in") or outbound (value "out") neighbors. Default value is "any". -
         *                      -labels:        filter by an array of edge labels (empty array means no restriction)
         *                      -properties:    filter neighbors by an array of edge properties, The attributes of a property filter:
         *                              -key: filter the result vertices by a key value pair
         *                              -value: the value of the key
         *                              -compare: a compare operator
         * @param callback
         * @returns {*}
         */

        "getNeighbourVertices": function(graph, vertex, options, callback) {
            return db.post(path + "/" + graph + '/vertices/' + vertex, options, callback);
        },
        /**
         * returns all neighbouring edges of the given vertex .
         *
         * @param graph - the graph handle
         * @param vertex - the vertex
         * @param options   - the following optional parameters are allowed:
         *                  -batchSize:  the batch size of the returned cursor
         *                  -limit:      limit the result size
         *                  -count:      return the total number of results (default "false")
         *                  -filter:     a optional filter, The attributes of filter:
         *                      -direction:     filter for inbound (value "in") or outbound (value "out") neighbors. Default value is "any". -
         *                      -labels:        filter by an array of edge labels (empty array means no restriction)
         *                      -properties:    filter neighbors by an array of edge properties, The attributes of a property filter:
         *                              -key: filter the result vertices by a key value pair
         *                              -value: the value of the key
         *                              -compare: a compare operator
         * @param callback
         * @returns {*}
         */
        "getEdgesForVertex": function(graph, vertex, options, callback) {
            return db.post(path + "/" + graph + '/edges/' + vertex, options, callback);
        },
        /**
         * returns all vertices of a graph.
         *
         * @param graph - the graph handle
         * @param options   - the following optional parameters are allowed:
         *                  -batchSize:  the batch size of the returned cursor
         *                  -limit:      limit the result size
         *                  -count:      return the total number of results (default "false")
         *                  -filter:     a optional filter, The attributes of filter:
         *                      -properties:    filter neighbors by an array of edge properties, The attributes of a property filter:
         *                              -key: filter the result vertices by a key value pair
         *                              -value: the value of the key
         *                              -compare: a compare operator
         * @param callback
         * @returns {*}
         */

        "vertices": function(graph, options, callback) {
            return db.post(path + "/" + graph + '/vertices/', options, callback);
        },
        /**
         * returns all edges of a graph.
         *
         * @param graph - the graph handle
         * @param options   - the following optional parameters are allowed:
         *                  -batchSize:  the batch size of the returned cursor
         *                  -limit:      limit the result size
         *                  -count:      return the total number of results (default "false")
         *                  -filter:     a optional filter, The attributes of filter:
         *                      -labels:        filter by an array of edge labels (empty array means no restriction)
         *                      -properties:    filter neighbors by an array of edge properties, The attributes of a property filter:
         *                              -key: filter the result vertices by a key value pair
         *                              -value: the value of the key
         *                              -compare: a compare operator
         * @param callback
         * @returns {*}
         */
        "edges": function(graph, options, callback) {
            return db.post(path + "/" + graph + '/edges/', options, callback);
        },
        "keepNull": function(val) {
            this._keepNull = !! val;
            this.vertex._keepNull = !! val;
            this.edge._keepNull = !! val;


            return this;
        },
        "waitForSync": function(val) {
            this._waitForSync = !! val;
            this.vertex._waitForSync = !! val;
            this.edge._waitForSync = !! val;

            return this;
        }
    }
}

/* consider refactoring */
function optionsToUrl(o, data, useKeep) {
    if (typeof data !== 'object') return '';

    if (o._waitForSync && typeof data.waitForSync !== "boolean") data.waitForSync = o._waitForSync;
    if (useKeep && !o._keepNull && data.keepNull === undefined) data.keepNull = o._keepNull;

    return Object.keys(data).reduce(function(a, b, c) {
        c = b + '=' + data[b];
        return !a ? '?' + c : a + '&' + c;
    }, '');
}

module.exports = Arango.api('graph', GraphAPI);


});
require.register("arango/lib/api/batch.js", function(exports, require, module){
var Arango = require('../arango'),
    utils = require('../utils'),
    batchPart = "Content-Type: application/x-arango-batchpart",
    defaultBoundary = "batch{id}",
    batch_sequence = 0;

function BatchAPI(db) {
    var path = "/_api/batch",
        request = db.request,
        jobs = [],
        boundary;

    return {
        "start": function(user_boundary) {
            ++batch_sequence;

            boundary = user_boundary ? user_boundary + batch_sequence : defaultBoundary.replace(/{(.*)}/, batch_sequence);

            /* start capturing requests */
            db.request = function() {
                var args = Array.prototype.slice.call(arguments),
                    job = db.Promise();

                args.unshift(job);
                jobs.push(args);

                return job;
            };

            return db;
        },
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

                    ok = !! result && result.xhr.status < 400;

                    batch[job][ok ? 'fulfill' : 'reject'](result.message, result.xhr);
                    if (callbacks[job]) {
                        callbacks[job](ok ? 0 : -1, result.message, result.xhr);
                    }
                }
                if (callback) callback(0, results, xhr);

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
require.register("arango/lib/api/edge.js", function(exports, require, module){
var Arango = require('../arango'),
    url = require('../url');

function EdgeAPI(db) {
    var path = "/_api/edge",
        ypath = "/_api/edges/";

    return {
        /**
         * creates an edge in a given collection.
         *
         * @param collection - the collection
         * @param data - the data of the edge as JSON object
         * @param from - The document handle of the start point must be passed in from handle.
         * @param to - The document handle of the end point must be passed in from handle.
         * @param options - an object with the following optional parameters:
         *                  - createCollection : - Boolean, if set the collection given in "collection" is created as well.
         *                  - "waitForSync": -  Boolean, wait until document has been synced to disk.
         * @param callback
         * @returns {*}
         */
        "create": function(collection, from, to, data, options, callback) {
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
         * @param id -- the edge-handle
         * @param options  - an object with 2 possible attributes:
         *                  - "match": boolean defining if the given revision should match the found document or not.
         *                  - "rev":   String the revision, used by the "match" attribute.
         * @param callback
         * @returns {*}
         */
        "get": function(id, options, callback) {
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
         * @param id -- the edge-handle
         * @param data -- a JSON Object containing the new attributes for the edge handle
         * @param options  - an object with 4 possible attributes:
         *                  - "match": - boolean defining if the given revision should match the found document or not.
         *                  - "rev":  - String the revision, used by the "match" attribute.
         *                  - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
         *                  - "waitForSync": -  Boolean, wait until document has been synced to disk.
         * @param callback
         * @returns {*}
         */
        "put": function(id, data, options, callback) {
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
         * @param id -- the edge-handle
         * @param data -- a JSON Object containing the new attributes for the edge handle
         * @param options  - an object with 4 possible attributes:
         *                  - "match": - boolean defining if the given revision should match the found document or not.
         *                  - "rev":  - String the revision, used by the "match" attribute.
         *                  - "forceUpdate": - Boolean, if set an update is performed even when the given revision does not match.
         *                  - "waitForSync": -  Boolean, wait until document has been synced to disk.
         *                  - "keepNull": -  Boolean, default is true, if set to false a patch request will delete every null value attributes.
         * @param callback
         * @returns {*}
         */
        "patch": function(id, data, options, callback) {
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
         * @param id -- the edge-handle
         * @param data -- a JSON Object containing the new attributes for the document handle
         * @param options  - an object with 4 possible attributes:
         *                  - "match": - boolean defining if the given revision should match the found document or not.
         *                  - "rev":  - String the revision, used by the "match" attribute.
         *                  - "forceUpdate": - Boolean, if set a deletion is performed even when the given revision does not match.
         *                  - "waitForSync": -  Boolean, wait until document has been synced to disk.
         * @param callback
         * @returns {*}
         */
        "delete": function(id, options, callback) {
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
         * same as get but only returns the header
         *
         * @param id -- the edge-handle
         * @param options  - an object with 2 possible attributes:
         *                  - "match" boolean defining if the given revision should match the found document or not.
         *                  - "rev"   String the revision, used by the "match" attribute.
         * @param callback
         * @returns {*}
         */
        "head": function(id, options, callback) {
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
         * @param collection   the edge collection
         * @param vertex       The id of the start vertex.
         * @param direction    Selects in or out direction for edges. If not set, any edges are returned.
         * @param callback
         * @returns {*}
         */

        "list": function(collection, vertex, direction, callback) {
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
require.register("arango/lib/api/user.js", function(exports, require, module){
var Arango = require('../arango');

function UserAPI(db) {
    var path = "/_api/user/";
    
    return {

        /**
         *
         * @param username  - the username.
         * @param password  - the password.
         * @param active    - boolean is the user is active.
         * @param extra     - additional userdata as JSONObject
         * @param callback
         * @returns {*}
         */
        "create": function(username, password, active, extra, callback) {
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
         *
         * @param username  - the user to request data for.
         * @param callback
         * @returns {*}
         */
        "get": function(username, callback) {
            return db.get(path + username, callback);
        },
        /**
         * Replaces entry for user
         * @param username  - the user to be replaced
         * @param password  - new password
         * @param active    - boolean is the user is active.
         * @param extra     - additional userdata as JSONObject
         * @param callback
         * @returns {*}
         */
        "put": function(username, password, active, extra, callback) {
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
         * @param username  - the user to be replaced
         * @param password  - new password
         * @param active    - boolean is the user is active.
         * @param extra     - additional userdata as JSONObject
         * @param callback
         * @returns {*}
         */
        "patch": function(username, password, active, extra, callback) {
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
         * @param username  - the user to be deleted
         * @param callback
         * @returns {*}
         */
        "delete": function(username, callback) {
            return db.delete(path + username, callback);
        }
    }
}

module.exports = Arango.api('user', UserAPI);

});
require.register("arango/lib/api/job.js", function(exports, require, module){
var Arango = require('../arango');

function JobAPI(db) {
    var path = "/_api/job";
    
    return {
        /**
         *
         * Returns the result of an async job identified by job-id. If the async job result is present on the server, the
         * result will be removed from the list of result. That means this method can be called for each job-id once.
         *
         * @param jobId     -  The async job id.
         * @param callback
         * @returns {*}
         */
        "put": function(jobId, callback) {
            return db.put(path + "/" + jobId, null, callback);
        },
        /**
         * Returns the list of ids of async jobs with a specific status (either done or pending). The list can be used by
         * the client to get an overview of the job system status and to retrieve completed job results later.
         *
         * @param type      -  The type of jobs to return. The type can be either done or pending. Setting the type to done
         *                     will make the method return the ids of already completed async jobs for which results can be
         *                     fetched. Setting the type to pending will return the ids of not yet finished async jobs.
         * @param count     -  The maximum number of ids to return per call. If not specified, a server-defined maximum
         *                     value will be used.
         * @param callback
         * @returns {*}
         */
        "get": function(type, count, callback) {
            var param = "";
            if (typeof count === "function") {
                callback = count;
            } else {
                param = "?count=" + count;
            }
            return db.get(path + "/" + type + param, null, callback);
        },
        /**
         * Deletes either all job results, expired job results, or the result of a specific job. Clients can use this method
         * to perform an eventual garbage collection of job results.
         *
         * @param type      -  The type of jobs to delete. type can be:
         *                      - all:    deletes all jobs results. Currently executing or queued async jobs will not be stopped
         *                                by this call.
         *                     - expired: deletes expired results. To determine the expiration status of a result, pass the
         *                                stamp URL parameter. stamp needs to be a UNIX timestamp, and all async job results
         *                                created at a lower timestamp will be deleted.
         *                     - an actual job-id: in this case, the call will remove the result of the specified async job.
         *                                 If the job is currently executing or queued, it will not be aborted.
         * @param stamp     -  A UNIX timestamp specifying the expiration threshold when type is expired.
         * @param callback
         * @returns {*}
         */
        "delete": function(type, stamp, callback) {
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








require.alias("kaerus-component-up/index.js", "arango/deps/micropromise/index.js");
require.alias("kaerus-component-up/index.js", "micropromise/index.js");
require.alias("kaerus-component-microtask/index.js", "kaerus-component-up/deps/microtask/index.js");

require.alias("kaerus-component-ajax/index.js", "arango/deps/ajax/index.js");
require.alias("kaerus-component-ajax/index.js", "ajax/index.js");
require.alias("kaerus-component-urlparser/index.js", "kaerus-component-ajax/deps/urlparser/index.js");

require.alias("kaerus-component-urlparser/index.js", "arango/deps/urlparser/index.js");
require.alias("kaerus-component-urlparser/index.js", "urlparser/index.js");

require.alias("kaerus-component-base64/index.js", "arango/deps/base64/index.js");
require.alias("kaerus-component-base64/index.js", "base64/index.js");
if (typeof exports == "object") {
  module.exports = require("arango");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("arango"); });
} else {
  this["arango"] = require("arango");
}})();