/* 
 * Copyright (c) 2012 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function outer(modules, cache, entries) {
    var global = function() {
        return this;
    }();
    function require(name, jumped) {
        if (cache[name]) return cache[name].exports;
        if (modules[name]) return call(name, require);
        throw new Error('cannot find module "' + name + '"');
    }
    function call(id, require) {
        var m = cache[id] = {
            exports: {}
        };
        var mod = modules[id];
        var name = mod[2];
        var fn = mod[0];
        fn.call(m.exports, function(req) {
            var dep = modules[id][1][req];
            return require(dep ? dep : req);
        }, m, m.exports, outer, modules, cache, entries);
        if (name) cache[name] = cache[id];
        return cache[id].exports;
    }
    for (var id in entries) {
        if (entries[id]) {
            global[entries[id]] = require(id);
        } else {
            require(id);
        }
    }
    require.duo = true;
    require.cache = cache;
    require.modules = modules;
    return require;
})({
    1: [ function(require, module, exports) {
        module.exports = require("./lib/arango");
    }, {
        "./lib/arango": 2
    } ],
    2: [ function(require, module, exports) {
        "use strict";
        var uPromise, base64 = require("base64"), utils = require("./utils"), url = require("./url"), Xhr = require("./xhr"), api = require("./api/api");
        api.use([ require("./api/action"), require("./api/admin"), require("./api/aqlfunction"), require("./api/batch"), require("./api/collection"), require("./api/cursor"), require("./api/database"), require("./api/document"), require("./api/edge"), require("./api/endpoint"), require("./api/graph"), require("./api/import"), require("./api/index"), require("./api/job"), require("./api/query"), require("./api/simple"), require("./api/transaction"), require("./api/traversal"), require("./api/user") ]);
        try {
            uPromise = require("micropromise");
        } catch (e) {
            uPromise = require("uP");
        }
        function Arango(db, options) {
            if (!(this instanceof Arango)) {
                return new Arango(db, options);
            }
            if (db instanceof Arango) {
                this._name = db._name;
                this._collection = db._collection;
                this._server = utils.extend(true, {}, db._server);
            } else options = db;
            if (options) {
                if (typeof options === "string") {
                    utils.extend(true, this, url.path2db(options));
                } else if (typeof options === "object") {
                    if (options.api) api.load(this, options.api);
                    if (options._name) this._name = options._name;
                    if (options._server) this._server = options._server;
                    if (options._collection) this._collection = options._collection;
                }
            }
            if (typeof this._server !== "object") this._server = {};
            if (typeof this._server.protocol !== "string") this._server.protocol = "http";
            if (typeof this._server.hostname !== "string") this._server.hostname = "127.0.0.1";
            if (typeof this._server.port !== "number") this._server.port = parseInt(this._server.port || 8529, 10);
            if (typeof this._collection !== "string") this._collection = "";
            if (this._server.username) {
                if (typeof this._server.headers !== "object") this._server.headers = {};
                this._server.headers["authorization"] = "Basic " + base64.encode(this._server.username + ":" + (this._server.password || ""));
            }
            api.load(this);
        }
        Arango.Connection = function() {
            var options = {};
            for (var i = 0; arguments[i]; i++) {
                if (typeof arguments[i] === "object") utils.extend(true, options, arguments[i]); else if (typeof arguments[i] === "string") utils.extend(true, options, url.path2db(arguments[i]));
            }
            return new Arango(options);
        };
        Arango.api = function(ns, exp) {
            api.register(ns, exp);
        };
        Arango.base64 = base64;
        Arango.prototype = {
            use: function(options) {
                return new Arango(this, options);
            },
            useCollection: function(collection) {
                return this.use(":" + collection);
            },
            useDatabase: function(database) {
                return this.use("/" + database);
            },
            api: function(ns) {
                if (!ns) return api.list();
                api.load(this, ns);
                return new Arango(this);
            },
            request: function(method, path, data, headers, callback) {
                var promise, options;
                if ([ "GET", "HEAD", "DELETE", "OPTIONS" ].indexOf(method) >= 0) {
                    callback = headers;
                    headers = data;
                    data = undefined;
                }
                if (typeof callback !== "function") promise = new uPromise();
                if (data && typeof data !== "string") {
                    try {
                        data = JSON.stringify(data);
                    } catch (err) {
                        return promise ? promise.reject(err) : callback(err);
                    }
                }
                options = utils.extend(true, {}, this._server, {
                    headers: headers
                });
                if (this._name) {
                    path = "/_db/" + this._name + path;
                }
                Xhr(method, path, options, data, promise || callback);
                return promise;
            },
            setAsyncMode: function(active, fireAndForget) {
                if (!active) {
                    if (this._server.headers !== undefined) delete this._server.headers["x-arango-async"];
                    return this;
                }
                if (typeof this._server.headers !== "object") this._server.headers = {};
                this._server.headers["x-arango-async"] = fireAndForget ? "true" : "store";
                return this;
            },
            Promise: uPromise
        };
        [ "get", "put", "post", "patch", "delete", "head", "options" ].forEach(function(method) {
            Arango.prototype[method] = function(path, data, headers) {
                var urlopt, callback = this.__callback;
                if (this.__headers) {
                    headers = utils.extend(true, {}, headers, this.__headers);
                }
                if (this.__options) {
                    urlopt = url.options(this.__options);
                    if (path.indexOf("?") > 0) path += "&" + urlopt.substr(1); else path += urlopt;
                }
                return this.request(method.toUpperCase(), path, data, headers, callback);
            };
        });
        module.exports = Arango;
    }, {
        base64: 3,
        "./utils": 4,
        "./url": 5,
        "./xhr": 6,
        "./api/api": 7,
        "./api/action": 8,
        "./api/admin": 9,
        "./api/aqlfunction": 10,
        "./api/batch": 11,
        "./api/collection": 12,
        "./api/cursor": 13,
        "./api/database": 14,
        "./api/document": 15,
        "./api/edge": 16,
        "./api/endpoint": 17,
        "./api/graph": 18,
        "./api/import": 19,
        "./api/index": 20,
        "./api/job": 21,
        "./api/query": 22,
        "./api/simple": 23,
        "./api/transaction": 24,
        "./api/traversal": 25,
        "./api/user": 26,
        uP: 27
    } ],
    3: [ function(require, module, exports) {
        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var url = {
            "+": "-",
            "/": "_",
            "=": ""
        };
        var Base64 = {
            encode: function(buf) {
                var ret = [], x = 0, z, b1, b2;
                var len = buf.length;
                var code = buf.charCodeAt ? buf.charCodeAt.bind(buf) : function(i) {
                    return buf[i];
                };
                for (var i = 0; i < len; i += 3) {
                    z = code(i) << 16 | (b1 = code(i + 1)) << 8 | (b2 = code(i + 2));
                    ret[x++] = b64[z >> 18];
                    ret[x++] = b64[z >> 12 & 63];
                    ret[x++] = b64[z >> 6 & 63];
                    ret[x++] = b64[z & 63];
                }
                if (isNaN(b1)) {
                    ret[x - 2] = b64[64];
                    ret[x - 1] = b64[64];
                } else if (isNaN(b2)) {
                    ret[x - 1] = b64[64];
                }
                return ret.join("");
            },
            decode: function(buf) {
                var ret = [], z, x, i, b1, b2, w = [];
                var len = buf.length;
                var code = buf.indexOf.bind(b64);
                for (i = 0; i < len; i++) {
                    if (i % 4) {
                        b1 = code(buf[i - 1]);
                        b2 = code(buf[i]);
                        z = (b1 << i % 4 * 2) + (b2 >> 6 - i % 4 * 2);
                        w[i >>> 2] |= z << 24 - i % 4 * 8;
                    }
                }
                for (i = 0, x = 0, l = w.length; i < l; i++) {
                    ret[x++] = String.fromCharCode(w[i] >> 16);
                    ret[x++] = String.fromCharCode(w[i] >> 8 & 255);
                    ret[x++] = String.fromCharCode(w[i] & 255);
                }
                if (b1 === 64) {
                    ret.splice(-2, 2);
                } else if (b2 === 64) {
                    ret.pop();
                }
                return ret.join("");
            },
            encodeURL: function(buf) {
                var encoded = this.encode(buf);
                for (var enc in url) encoded = encoded.split(enc).join(url[enc]);
                return encoded;
            },
            decodeURL: function(buf) {
                var data, pad;
                for (var enc in url) {
                    if (url[enc]) data = buf.split(url[enc]).join(enc);
                }
                if (pad = data.length % 4) {
                    data = data.concat(Array(pad + 1).join(b64[64]));
                }
                return this.decode(data);
            }
        };
        module.exports = Base64;
    }, {} ],
    4: [ function(require, module, exports) {
        function extend() {
            var deep = false, source, target, key, i = 0, l = arguments.length;
            if (typeof arguments[i] === "boolean") deep = arguments[i++];
            target = arguments[i++];
            if (l <= i) return extend(deep, {}, target);
            while (i < l) {
                source = arguments[i++];
                for (key in source) {
                    if (typeof source[key] === "object" && source[key] != null) {
                        if (deep) {
                            if (target.hasOwnProperty(key)) extend(true, target[key], source[key]); else target[key] = extend(true, {}, source[key]);
                        }
                    } else if (source[key] !== undefined) {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        }
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
    }, {} ],
    5: [ function(require, module, exports) {
        var utils = require("./utils"), urlParser = require("urlparser");
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
        function options(o) {
            if (!o || typeof o !== "object") return "";
            return Object.keys(o).reduce(function(a, b, c) {
                c = b + "=" + o[b];
                return !a ? "?" + c : a + "&" + c;
            }, "");
        }
        function ifMatch(id, options) {
            var headers, rev;
            if (options.match !== undefined) {
                rev = JSON.stringify(options.rev || id);
                if (options.match) headers = {
                    "if-match": rev
                }; else headers = {
                    "if-none-match": rev
                };
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
    }, {
        "./utils": 4,
        urlparser: 28
    } ],
    28: [ function(require, module, exports) {
        var URL = /^(?:(?:([A-Za-z]+):?\/{2})?(?:(\w+)?:?([^\x00-\x1F^\x7F^:]*)@)?([\w\-\.]+)?(?::(\d+))?)\/?(([^\x00-\x1F^\x7F^\#^\?^:]+)?(?::([^\x00-\x1F^\x7F^\#^\?]+))?(?:#([^\x00-\x1F^\?]+))?)(?:\?(.*))?$/;
        function urlString(o) {
            var str = "";
            o = o ? o : this;
            str += hostString(o);
            str += pathString(o);
            str += queryString(o);
            return str;
        }
        module.exports.url = urlString;
        function hostString(o) {
            var str = "";
            o = o ? o.host : this.host;
            if (o) {
                if (o.protocol) str += o.protocol + "://";
                if (o.username) {
                    str += o.username + (o.password ? ":" + o.password : "") + "@";
                }
                if (o.hostname) str += o.hostname;
                if (o.port) str += ":" + o.port;
            }
            return str;
        }
        module.exports.host = hostString;
        function pathString(o) {
            var str = "";
            o = o ? o.path : this.path;
            if (o) {
                if (o.base) str += "/" + o.base;
                if (o.name) str += ":" + o.name;
                if (o.hash) str += "#" + o.hash;
            }
            return str;
        }
        module.exports.path = pathString;
        function queryString(o) {
            var str = "";
            o = o ? o.query : this.query;
            if (o) {
                str = "?";
                if (o.parts) str += o.parts.join("&");
            }
            return str;
        }
        module.exports.query = queryString;
        function urlParser(parse) {
            var param, ret = {};
            Object.defineProperty(ret, "toString", {
                enumerable: false,
                value: urlString
            });
            if (typeof parse === "string") {
                var q, p, u;
                u = URL.exec(parse);
                if (u[1] || u[4]) {
                    ret.host = {};
                    if (u[1]) ret.host.protocol = u[1];
                    if (u[2]) ret.host.username = u[2];
                    if (u[3]) ret.host.password = u[3];
                    if (u[4]) ret.host.hostname = u[4];
                    if (u[5]) ret.host.port = u[5];
                }
                if (u[6]) {
                    ret.path = {};
                    if (u[7]) ret.path.base = u[7];
                    if (u[8]) ret.path.name = u[8];
                    if (u[9]) ret.path.hash = u[9];
                }
                if (u[10]) {
                    ret.query = {};
                    ret.query.parts = u[10].split("&");
                    if (ret.query.parts.length) {
                        ret.query.params = {};
                        ret.query.parts.forEach(function(part) {
                            param = part.split("=");
                            ret.query.params[param[0]] = param[1];
                        });
                    }
                }
            }
            return ret;
        }
        module.exports.parse = urlParser;
    }, {} ],
    6: [ function(require, module, exports) {
        var urlParser = require("urlparser"), BROWSER, Xhr;
        try {
            BROWSER = !process.versions.node;
        } catch (e) {
            BROWSER = true;
        }
        if (!BROWSER) {
            Xhr = function(method, path, options, data, resolver) {
                "use strict";
                var url = urlParser.parse(path);
                var proto = url.host && url.host.protocol || options.protocol;
                var req = require(proto).request;
                delete options.protocol;
                if (options.timeout) {
                    req.socket.setTimeout(options.timeout);
                    delete options.timeout;
                }
                options.method = method;
                if (url.host) {
                    if (url.host.hostname) options.hostname = url.host.hostname;
                    url.host = null;
                }
                options.path = url.toString();
                if (!options.headers) options.headers = {};
                options.headers["content-length"] = data ? Buffer.byteLength(data) : 0;
                req(options, function(res) {
                    var buf = [];
                    res.on("data", function(chunk) {
                        buf[buf.length] = chunk;
                    }).on("end", function() {
                        buf = buf.join("");
                        reply(resolver, buf, res);
                    }).on("error", function(error) {
                        reply(resolver, error);
                    });
                }).on("error", function(error) {
                    reply(resolver, error);
                }).end(data, options.encoding);
            };
        } else {
            Xhr = function(method, path, options, data, resolver) {
                "use strict";
                var ajax = require("ajax"), buf;
                ajax(method, path, options, data).when(function(res) {
                    buf = res.responseText;
                    reply(resolver, buf, res);
                }, function(error) {
                    reply(resolver, error);
                });
            };
        }
        function reply(resolver, data, res) {
            var error;
            res = typeof res === "object" ? res : {
                status: res || -1
            };
            res.status = res.statusCode ? res.statusCode : res.status;
            if (typeof data === "string") {
                try {
                    data = JSON.parse(data);
                } catch (e) {}
            }
            if (!data) data = {
                code: res.status
            }; else if (typeof data === "object" && !data.code) data.code = res.status;
            if (0 < res.status && 399 > res.status) {
                if (typeof resolver === "function") {
                    return resolver(undefined, data, res);
                }
                return resolver.resolve(data, res);
            }
            error = data;
            if (typeof resolver === "function") {
                if (!(error instanceof Error)) {
                    if (typeof error === "object") {
                        error = new Error(JSON.stringify(data));
                        for (var k in data) error[k] = data[k];
                    } else {
                        error = new Error(data);
                    }
                }
                return resolver(error, res);
            }
            return resolver.reject(error, res);
        }
        module.exports = Xhr;
    }, {
        urlparser: 28,
        ajax: 29
    } ],
    29: [ function(require, module, exports) {
        var urlParser = require("urlparser");
        var DEFAULT_TIMEOUT = 5e3;
        var Xhr = function() {
            if (window.XDomainRequest) {
                return window.XDomainRequest;
            } else if (window.XMLHttpRequest) {
                return window["XMLHttpRequest"];
            } else if (window.ActiveXObject) {
                [ "Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Microsoft.XMLHTTP" ].forEach(function(x) {
                    try {
                        return window.ActiveXObject(x);
                    } catch (e) {}
                });
                throw new Error("XHR ActiveXObject failed");
            }
            throw new Error("XHR support not found");
        }();
        var XHR_CLOSED = 0, XHR_OPENED = 1, XHR_SENT = 2, XHR_RECEIVED = 3, XHR_DONE = 4;
        function Ajax(method, url, options, data, res) {
            var xhr = new Xhr(), headers;
            if (typeof options === "function") {
                res = options;
                options = null;
                data = null;
            } else if (typeof data === "function") {
                res = data;
                data = null;
            }
            options = options ? options : {};
            if (typeof res === "function") {
                var clb = res;
                res = {
                    resolve: function(x) {
                        clb(undefined, x);
                    },
                    reject: function(x, c) {
                        clb(c || -1, x);
                    },
                    progress: function(x) {
                        clb(0, x);
                    }
                };
            } else if (typeof res !== "object") {
                res = {
                    resolve: function(x) {
                        this.result = x;
                        if (this.onfulfill) this.onfulfill(x);
                    },
                    reject: function(x) {
                        this.error = x;
                        if (this.onreject) this.onreject(x);
                    },
                    progress: function(x) {
                        if (this.onprogress) this.onprogress(x);
                    },
                    when: function(f, r, p) {
                        this.onfulfill = f;
                        this.onreject = r;
                        this.onprogress = p;
                    }
                };
                options.async = true;
            }
            if (options.async === undefined) options.async = true;
            if (options.timeout === undefined) options.timeout = DEFAULT_TIMEOUT;
            if (!options.headers) options.headers = {};
            if (options.type || !options.headers["content-type"]) options.headers["content-type"] = options.type || "application/json";
            if (options.accept || !options.headers.accept) options.headers.accept = options.accept || "application/json";
            if (options.charset) options.headers["accept-charset"] = options.charset;
            if ("withCredentials" in xhr || typeof XDomainRequest != "undefined") {
                if (options.withCredentials === true) xhr.withCredentials = true;
                xhr.onload = function() {
                    res.resolve(xhr);
                };
                xhr.onerror = function() {
                    res.reject(xhr);
                };
            } else {
                xhr.onreadystatechange = function() {
                    switch (xhr.readyState) {
                      case XHR_DONE:
                        if (xhr.status) res.resolve(xhr); else res.reject(xhr);
                        break;
                    }
                };
            }
            Object.defineProperty(xhr, "headers", {
                get: function() {
                    if (!headers) headers = parseHeaders(xhr.getAllResponseHeaders());
                    return headers;
                }
            });
            if (options.timeout) {
                setTimeout(function() {
                    xhr.abort();
                }, options.timeout);
            }
            if (xhr.upload && res.progress) {
                xhr.upload.onprogress = function(e) {
                    e.percent = e.loaded / e.total * 100;
                    res.progress(e);
                };
            }
            url = urlParser.parse(url);
            if (!url.host) url.host = {};
            if (!url.host.protocol && options.protocol) url.host.protocol = options.protocol;
            if (!url.host.hostname && options.hostname) url.host.hostname = options.hostname;
            if (!url.host.port && options.port) url.host.port = options.port;
            url = url.toString();
            try {
                xhr.open(method, url, options.async);
            } catch (error) {
                res.reject(error);
            }
            Object.keys(options.headers).forEach(function(header) {
                xhr.setRequestHeader(header, options.headers[header]);
            });
            if (data && typeof data !== "string" && options.headers["content-type"].indexOf("json") >= 0) {
                try {
                    data = JSON.stringify(data);
                } catch (error) {
                    res.reject(error);
                }
            }
            try {
                xhr.send(data);
            } catch (error) {
                res.reject(error);
            }
            return res;
        }
        if (!Object.create) {
            Object.create = function() {
                function F() {}
                return function(o) {
                    F.prototype = o;
                    return new F();
                };
            }();
        }
        function parseHeaders(h) {
            var ret = Object.create(null), key, val, i;
            h.split("\n").forEach(function(header) {
                if ((i = header.indexOf(":")) > 0) {
                    key = header.slice(0, i).replace(/^[\s]+|[\s]+$/g, "").toLowerCase();
                    val = header.slice(i + 1, header.length).replace(/^[\s]+|[\s]+$/g, "");
                    if (key && key.length) ret[key] = val;
                }
            });
            return ret;
        }
        [ "head", "get", "put", "post", "delete", "patch", "trace", "connect", "options" ].forEach(function(method) {
            Ajax[method] = function(url, options, data, res) {
                return Ajax(method, url, options, data, res);
            };
        });
        module.exports = Ajax;
    }, {
        urlparser: 28
    } ],
    7: [ function(require, module, exports) {
        var API = {};
        function use(api) {
            if (Array.isArray(api)) {
                api.forEach(use);
            } else if (typeof api === "object") {
                for (var ns in api) {
                    register(ns, api[ns]);
                }
            } else if (typeof api === "string") {
                api = require(api);
                use(api);
            } else {
                throw new TypeError(typeof api);
            }
        }
        exports.use = use;
        function register(ns, api) {
            if (!Object.getOwnPropertyDescriptor(API, ns)) {
                API[ns] = api;
            } else {
                if (!API[ns]) API[ns] = api; else if (API[ns] !== api) throw new Error(ns + " api already registered");
            }
        }
        exports.register = register;
        function list() {
            var apis = [];
            for (var ns in API) apis.push(ns);
            return apis;
        }
        exports.list = list;
        function load(db, api) {
            if (!db) return;
            if (api && typeof api === "string") {
                if (!API[api]) throw new Error(api + " api not registered"); else db[api] = attach(db, api, API[api]);
            } else {
                for (var ns in API) db[ns] = attach(db, ns, API[ns]);
            }
        }
        exports.load = load;
        function attach(db, ns, api) {
            Object.defineProperty(db, ns, {
                enumerable: true,
                configurable: true,
                get: function() {
                    return context();
                }
            });
            function context() {
                var instance = api(db);
                proxyMethods(db, instance);
                context = function() {
                    return instance;
                };
                return instance;
            }
        }
        function proxyMethods(db, instance) {
            Object.keys(instance).forEach(function(method) {
                var api_method = instance[method];
                if (typeof api_method === "function") {
                    instance[method] = function() {
                        var args = [].slice.call(arguments), arg, i;
                        if (i = args.length) {
                            arg = args[i - 1];
                            if (arg && typeof arg === "function") {
                                db.__callback = arg;
                                args.splice(i - 1, 1);
                                arg = args[i - 2];
                            }
                            if (arg && typeof arg === "object") {
                                if (arg.hasOwnProperty("__headers")) {
                                    db.__headers = arg.__headers;
                                    delete arg.__headers;
                                }
                                if (arg.hasOwnProperty("__options")) {
                                    db.__options = arg.__options;
                                    delete arg.__options;
                                }
                            }
                        }
                        try {
                            return api_method.apply(instance, args);
                        } catch (e) {
                            throw e;
                        } finally {
                            db.__callback = undefined;
                            db.__headers = undefined;
                            db.__options = undefined;
                        }
                        throw new Error("unexpected return");
                    };
                } else if (typeof api_method === "object") {
                    proxyMethods(db, api_method);
                }
            });
        }
    }, {} ],
    8: [ function(require, module, exports) {
        var api = require("../api"), urlparser = require("urlparser"), utils = require("../../utils");
        api.use([ require("../document"), require("../admin") ]);
        function ActionAPI(db) {
            var submit = {};
            return {
                define: function(o, f, reload) {
                    var ret = db.Promise();
                    var inject = f && typeof f === "function";
                    if (typeof o !== "object") return ret.reject(Error("Action object unspecified"));
                    if (!o.name) return ret.reject(Error("Action name missing"));
                    if (!o.url) return ret.reject(Error("Action url missing"));
                    if (o.data && typeof o.data !== "object") return ret.reject(Error("Invalid action data type"));
                    var method = o.method ? o.method.toLowerCase() : "get";
                    submit[o.name] = action;
                    if (inject) {
                        var route = {
                            action: {
                                callback: f.toString()
                            }
                        };
                        route.url = {
                            match: o.match || "/" + urlparser.parse(o.url).path.base,
                            methods: [ method.toUpperCase() ]
                        };
                        db.use(":_routing").document.create(route, {
                            waitForSync: true
                        }).then(function(injected) {
                            submit[o.name].route = injected._id;
                            if (reload === true) {
                                db.admin.routesReload().then(function(reloaded) {
                                    ret.fulfill(reloaded);
                                }, ret.reject);
                            } else ret.fulfill(injected);
                        }, ret.reject);
                    } else {
                        ret.fulfill(o.name);
                    }
                    function action() {
                        var args = Array.prototype.slice.call(arguments);
                        if (o.data) {
                            if (args[0] && typeof args[0] !== "function") {
                                if (Array.isArray(args[0])) {
                                    args[0].concat(o.data);
                                } else if (typeof args[0] === "object") {
                                    args[0] = utils.extend(true, o.data, args[0]);
                                }
                            } else {
                                args.unshift(o.data);
                            }
                        }
                        args.unshift(o.url);
                        if (o.result || o.error) return db[method].apply(db, args).then(o.result, o.error);
                        return db[method].apply(db, args);
                    }
                    return ret;
                },
                submit: function() {
                    var args = Array.prototype.slice.call(arguments), name = args.shift();
                    return submit[name].apply(this, args);
                },
                undefine: function(name) {
                    var ret = db.Promise();
                    if (!submit[name]) ret.reject(Error("No such action: " + name));
                    if (submit[name].route) {
                        db.document.delete(submit[name].route, {
                            waitForSync: true
                        }).then(function() {
                            delete submit[name];
                            ret.fulfill(name);
                        }, ret.reject);
                    } else {
                        delete submit[name];
                        ret.fulfill(name);
                    }
                    return ret;
                },
                getActions: function() {
                    var result = {};
                    Object.keys(submit).forEach(function(key) {
                        result[key] = submit[key];
                    });
                    return result;
                }
            };
        }
        exports.action = ActionAPI;
    }, {
        "../api": 7,
        urlparser: 28,
        "../../utils": 4,
        "../document": 15,
        "../admin": 9
    } ],
    15: [ function(require, module, exports) {
        var url = require("../../url");
        function DocumentAPI(db) {
            var path = "/_api/document";
            return {
                create: function(collection, data, options) {
                    if (typeof collection !== "string") {
                        options = data;
                        data = collection;
                        collection = db._collection;
                    }
                    if (!options) options = {};
                    options.collection = collection;
                    return db.post(path + url.options(options), data);
                },
                get: function(id, options) {
                    var headers;
                    if (options) {
                        headers = url.ifMatch(id, options);
                    }
                    return db.get(path + "/" + id + url.options(options), headers);
                },
                put: function(id, data, options) {
                    var headers;
                    if (options) {
                        headers = url.ifMatch(id, options);
                    }
                    options = options ? options : {};
                    if (options.forceUpdate !== undefined) {
                        options.policy = options.forceUpdate === true ? "last" : "error";
                        delete options.forceUpdate;
                    }
                    return db.put(path + "/" + id + url.options(options), data, headers);
                },
                patch: function(id, data, options) {
                    var headers;
                    if (options) {
                        headers = url.ifMatch(id, options);
                    }
                    options = options ? options : {};
                    if (options.forceUpdate !== undefined) {
                        options.policy = options.forceUpdate === true ? "last" : "error";
                        delete options.forceUpdate;
                    }
                    return db.patch(path + "/" + id + url.options(options), data, headers);
                },
                "delete": function(id, options) {
                    var headers;
                    if (options) {
                        headers = url.ifMatch(id, options);
                    }
                    options = options ? options : {};
                    if (options.forceUpdate !== undefined) {
                        options.policy = options.forceUpdate === true ? "last" : "error";
                        delete options.forceUpdate;
                    }
                    return db.delete(path + "/" + id + url.options(options), headers);
                },
                head: function(id, options) {
                    var headers;
                    if (options) {
                        headers = url.ifMatch(id, options);
                    }
                    options = options ? options : {};
                    if (options.forceUpdate !== undefined) {
                        options.policy = options.forceUpdate === true ? "last" : "error";
                        delete options.forceUpdate;
                    }
                    return db.head(path + "/" + id + url.options(options), headers);
                },
                list: function(collection) {
                    if (typeof collection !== "string") {
                        collection = db._collection;
                    }
                    return db.get(path + "?collection=" + collection);
                }
            };
        }
        exports.document = DocumentAPI;
    }, {
        "../../url": 5
    } ],
    9: [ function(require, module, exports) {
        var url = require("../../url");
        function AdminAPI(db) {
            var path = "/_admin/";
            return {
                version: function(details) {
                    return db.get(path + "version?details=" + !!details);
                },
                statistics: function() {
                    return db.get(path + "statistics");
                },
                role: function() {
                    return db.get(path + "server/role");
                },
                statisticsDescription: function() {
                    return db.get(path + "statistics-description");
                },
                log: function(options) {
                    return db.get(path + "log" + url.options(options));
                },
                routes: function() {
                    return db.get(path + "routing/routes");
                },
                routesReload: function() {
                    return db.get(path + "routing/reload");
                },
                time: function() {
                    return db.get(path + "time");
                },
                echo: function(method, htmloptions, data) {
                    method = typeof method === "string" ? method.toUpperCase() : "GET";
                    htmloptions = htmloptions ? htmloptions : "";
                    return db.request(method, path + "echo" + htmloptions, data);
                },
                walFlush: function(waitForSync, waitForCollector, options) {
                    var pathSuffix = "wal/flush";
                    if (waitForSync) {
                        pathSuffix += "?waitForSync=" + waitForSync;
                    }
                    if (waitForCollector) {
                        pathSuffix += "?waitForCollector=" + waitForCollector;
                    }
                    return db.put(path + pathSuffix, undefined, options);
                }
            };
        }
        exports.admin = AdminAPI;
    }, {
        "../../url": 5
    } ],
    10: [ function(require, module, exports) {
        function AqlfunctionAPI(db) {
            var path = "/_api/aqlfunction/";
            return {
                create: function(name, code, isDeterministic) {
                    var data = {
                        name: name,
                        code: code.toString()
                    };
                    if (isDeterministic === true) data.isDeterministic = isDeterministic;
                    return db.post(path, data);
                },
                "delete": function(name, group) {
                    return db.delete(path + encodeURIComponent(name) + "/?group=" + group);
                },
                get: function(namespace) {
                    var params = "";
                    if (typeof namespace === "string") {
                        params += "?namespace=" + encodeURIComponent(namespace);
                    }
                    return db.get(path + params);
                }
            };
        }
        exports.aqlfunction = AqlfunctionAPI;
    }, {} ],
    11: [ function(require, module, exports) {
        var utils = require("../../utils"), batchPart = "Content-Type: application/x-arango-batchpart", defaultBoundary = "batch{id}", batch_sequence = 0;
        function BatchAPI(db) {
            var path = "/_api/batch", request = db.request, jobs = [], boundary;
            return {
                start: function(user_boundary) {
                    ++batch_sequence;
                    boundary = user_boundary ? user_boundary + batch_sequence : defaultBoundary.replace(/{(.*)}/, batch_sequence);
                    db.request = function() {
                        var args = Array.prototype.slice.call(arguments), job = new db.Promise();
                        args.unshift(job);
                        jobs.push(args);
                        return job;
                    };
                    return db;
                },
                exec: function() {
                    var options = {
                        headers: {
                            "content-type": "multipart/form-data; boundary=" + boundary
                        }
                    }, data = "", args, batch, i;
                    if (!jobs.length) throw new Error("No jobs");
                    for (i = 0; i < jobs.length; i++) {
                        args = jobs[i];
                        data += "--" + boundary + "\r\n";
                        data += batchPart + "\r\n\r\n";
                        data += args[1] + " " + args[2] + " HTTP/1.1\r\n\r\n";
                        if (args[3]) {
                            if (typeof args[3] === "string") data += args[3]; else data += JSON.stringify(args[3]);
                            data += "\r\n";
                        }
                        if (args[4]) {
                            utils.extend(true, options, args[4]);
                        }
                    }
                    data += "--" + boundary + "--\r\n";
                    batch = jobs.map(function(j) {
                        return j[0];
                    });
                    jobs = [];
                    db.request = request;
                    return db.post(path, data, options).then(function(data, xhr) {
                        var results, job, result, ok;
                        results = decode_multipart(data, boundary);
                        for (job in batch) {
                            result = results[job];
                            ok = result && result.xhr.status < 400;
                            batch[job][ok ? "fulfill" : "reject"](result.message, result.xhr);
                        }
                        return {
                            jobs: batch.length,
                            length: results.length
                        };
                    }, function(error) {
                        error = {
                            message: "job failed",
                            error: error
                        };
                        for (var job in batch) {
                            batch[job].reject(error);
                        }
                    }).join(batch);
                },
                cancel: function(reason) {
                    var batch = jobs.map(function(j) {
                        return j[0];
                    }), message = {
                        message: reason || "job cancelled"
                    };
                    db.request = request;
                    for (var job in batch) {
                        batch[job].reject(message);
                    }
                    return db;
                }
            };
        }
        function decode_multipart(data, boundary) {
            var x, i, j, results = [], segments, lines, status, message;
            data = data.split("--" + boundary).filter(function(f) {
                return f;
            }).map(function(m) {
                return m.split("\r\n");
            });
            for (i in data) {
                segments = [];
                x = data[i].indexOf(batchPart);
                if (x < 0) continue;
                lines = [];
                for (j = x + 1; j < data[i].length; j++) {
                    if (!data[i][j]) {
                        if (lines.length) segments.push(lines);
                        lines = [];
                    } else {
                        lines.push(data[i][j]);
                    }
                }
                if (segments.length) {
                    status = parseInt(segments[0][0].split(" ")[1], 10);
                    try {
                        message = JSON.parse(segments[1]);
                    } catch (e) {
                        message = segments[1];
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
        exports.batch = BatchAPI;
    }, {
        "../../utils": 4
    } ],
    12: [ function(require, module, exports) {
        var url = require("../../url");
        function CollectionAPI(db) {
            var path = "/_api/collection/";
            return {
                create: function(collection, data) {
                    collection = collection || db._collection;
                    data = data ? data : {};
                    if (!data.name) data.name = collection;
                    return db.post(path, data);
                },
                get: function(id) {
                    return db.get(path + id);
                },
                "delete": function(id) {
                    return db.delete(path + id);
                },
                truncate: function(id) {
                    return db.put(path + id + "/truncate");
                },
                count: function(id) {
                    return db.get(path + id + "/count");
                },
                figures: function(id) {
                    return db.get(path + id + "/figures");
                },
                list: function(excludeSystem) {
                    var url = path;
                    if (excludeSystem !== undefined) url += "?excludeSystem=" + !!excludeSystem;
                    return db.get(url);
                },
                load: function(id, count) {
                    var param = {};
                    param.count = count;
                    return db.put(path + id + "/load", param);
                },
                unload: function(id) {
                    return db.put(path + id + "/unload", null);
                },
                rename: function(id, name) {
                    var data = {
                        name: name
                    };
                    return db.put(path + id + "/rename", data);
                },
                getProperties: function(id) {
                    return db.get(path + id + "/properties");
                },
                setProperties: function(id, data) {
                    return db.put(path + id + "/properties", data);
                },
                revision: function(id) {
                    return db.get(path + id + "/revision");
                },
                checksum: function(id, options) {
                    options = options ? options : {};
                    return db.get(path + id + "/checksum" + url.options(options));
                },
                rotate: function(id) {
                    return db.put(path + id + "/rotate", null);
                }
            };
        }
        exports.collection = CollectionAPI;
    }, {
        "../../url": 5
    } ],
    13: [ function(require, module, exports) {
        function CursorAPI(db) {
            var path = "/_api/cursor/";
            return {
                get: function(id) {
                    return db.put(path + id);
                },
                create: function(data) {
                    return db.post(path, data);
                },
                query: function(data) {
                    return db.post("/_api/query", data);
                },
                explain: function(data) {
                    var queryData = {};
                    queryData.query = data;
                    return db.post("/_api/explain", data);
                },
                "delete": function(id) {
                    return db.delete(path + id);
                }
            };
        }
        exports.cursor = CursorAPI;
    }, {} ],
    14: [ function(require, module, exports) {
        function DatabaseAPI(db) {
            var path = "/_api/database/";
            return {
                create: function(name, users) {
                    var options = {
                        name: name
                    };
                    if (users) options.users = users;
                    return db.post(path, options);
                },
                current: function() {
                    return db.get(path + "current");
                },
                list: function() {
                    return db.get(path);
                },
                user: function() {
                    return db.get(path + "user");
                },
                "delete": function(name) {
                    return db.delete(path + name);
                }
            };
        }
        exports.database = DatabaseAPI;
    }, {} ],
    16: [ function(require, module, exports) {
        var api = require("../api"), url = require("../../url"), utils = require("../../utils");
        function EdgeAPI(db) {
            var path = "/_api/edge", ypath = "/_api/edges/";
            return {
                create: function(collection, from, to, data, options) {
                    if (typeof collection !== "string") {
                        options = options;
                        options = data;
                        data = to;
                        to = from;
                        from = collection;
                        collection = db._collection;
                    }
                    options = options || {};
                    options.collection = collection;
                    options.from = from;
                    options.to = to;
                    return db.post(path + url.options(options), data);
                },
                get: function(id, options) {
                    if (options) {
                        options = options ? options : {};
                        utils.extend(true, options, url.ifMatch(id, options));
                    }
                    return db.get(path + "/" + id + url.options(options));
                },
                put: function(id, data, options) {
                    if (options) {
                        options = options ? options : {};
                        utils.extend(true, options, url.ifMatch(id, options));
                    }
                    options = options || {};
                    if (options.forceUpdate !== undefined) {
                        options.policy = options.forceUpdate === true ? "last" : "error";
                        delete options.forceUpdate;
                    }
                    return db.put(path + "/" + id + url.options(options), data, options);
                },
                patch: function(id, data, options) {
                    if (options) {
                        options = options ? options : {};
                        utils.extend(true, options, url.ifMatch(id, options));
                    }
                    options = options ? options : {};
                    if (options.forceUpdate !== undefined) {
                        options.policy = options.forceUpdate === true ? "last" : "error";
                        delete options.forceUpdate;
                    }
                    return db.patch(path + "/" + id + url.options(options), data);
                },
                "delete": function(id, options) {
                    var headers;
                    if (options) {
                        headers = url.ifMatch(id, options);
                    }
                    options = options || {};
                    return db.delete(path + "/" + id + url.options(options), headers);
                },
                head: function(id, options) {
                    var headers;
                    if (options) {
                        headers = url.ifMatch(id, options);
                    }
                    options = options || {};
                    return db.head(path + "/" + id + url.options(options), headers);
                },
                list: function(collection, vertex, direction) {
                    var options;
                    if (!vertex) {
                        vertex = collection;
                        direction = "any";
                        collection = db._collection;
                    } else if ([ "in", "out", "any" ].indexOf(vertex) >= 0) {
                        direction = vertex;
                        vertex = collection;
                        collection = db._collection;
                    }
                    options = "?vertex=" + vertex + "&direction=" + direction;
                    return db.get(ypath + collection + options);
                }
            };
        }
        exports.edge = EdgeAPI;
    }, {
        "../api": 7,
        "../../url": 5,
        "../../utils": 4
    } ],
    17: [ function(require, module, exports) {
        function EndpointAPI(db) {
            var path = "/_api/endpoint";
            return {
                create: function(endpoint, databases) {
                    var description = {};
                    description.endpoint = endpoint;
                    description.databases = databases;
                    return db.post(path, description);
                },
                get: function() {
                    return db.get(path);
                },
                "delete": function(endpoint) {
                    return db.delete(path + "/" + encodeURIComponent(endpoint));
                }
            };
        }
        exports.endpoint = EndpointAPI;
    }, {} ],
    18: [ function(require, module, exports) {
        var api = require("../api"), url = require("../../url"), utils = require("../../utils");
        api.use(require("../cursor"));
        var compareOperators = [ "==", "!=", "<", ">", ">=", "<=" ];
        function propertyCompare(compare) {
            if (!compare) return "==";
            if (typeof compare !== "string") throw new Error("not a string");
            if (compareOperators.indexOf(compare) < 0) throw new Error("unknown operator " + compare);
            return compare;
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

              default:            }
        }
        function filterStatement(filter, statement) {
            if (!filter) {
                return " FILTER " + statement;
            }
            if (typeof filter !== "string") throw new Error("not a string");
            filter += " && " + statement;
            return filter;
        }
        function propertyFilter(bindVars, filter, num, property, collname) {
            var statement;
            if (property.key === undefined) {
                throw new Error("undefined property key");
            }
            if (property.compare === "HAS") {
                bindVars["key" + num] = property.key;
                statement = "HAS(" + collname + ", @key" + num + ") ";
            } else if (property.compare === "HAS_NOT") {
                bindVars["key" + num] = property.key;
                statement = "!HAS(" + collname + ", @key" + num + ") ";
            } else if (property.value !== undefined) {
                bindVars["key" + num] = property.key;
                bindVars["value" + num] = property.value;
                statement = collname + "[@key" + num + "] ";
                statement += propertyCompare(property.compare) + " @value" + num;
            } else throw new Error("unknown property filter");
            return filterStatement(filter, statement);
        }
        function filterProperties(data, properties, collname) {
            var filter;
            if (Array.isArray(properties)) {
                properties.forEach(function(p, i) {
                    filter = propertyFilter(data, filter, i, p, collname);
                });
            } else if (typeof properties === "object") {
                filter = propertyFilter(data, filter, 0, properties, collname);
            }
            return filter;
        }
        function filterLabels(bindVars, filter, labels, collname) {
            if (!Array.isArray(labels)) throw new Error("labels not an array");
            if (!labels.length) throw new Error("no labels");
            bindVars.labels = labels;
            return filterStatement(filter, collname + '["$label"] IN @labels');
        }
        function createFilterQuery(bindVars, filter, collname) {
            var filterQuery = "";
            if (filter.properties) {
                filterQuery += filterProperties(bindVars, filter.properties, collname);
            }
            if (filter.labels) {
                filterQuery += filterLabels(bindVars, filter.labels, collname);
            }
            return filterQuery;
        }
        function optionsToUrl(o, options, useKeep) {
            options = options || {};
            if (o._waitForSync && typeof options.waitForSync !== "boolean") {
                options.waitForSync = o._waitForSync;
            }
            if (useKeep && typeof options.keepNull !== "boolean" && o._keepNull) {
                options.keepNull = !!o._keepNull;
            }
            return url.options(options);
        }
        function GraphAPI(db) {
            var path = "/_api/gharial", graphObject = {
                create: function(graph, edgeDefinitions, vertexCollections, waitForSync) {
                    if (typeof graph !== "string") throw new Error("graph name is not a string");
                    var data = {
                        name: graph
                    };
                    var options = {};
                    if (edgeDefinitions && vertexCollections && typeof edgeDefinitions === "string" && typeof vertexCollections === "string") {
                        data.edgeDefinitions = [ {
                            collection: vertexCollections,
                            from: [ edgeDefinitions ],
                            to: [ edgeDefinitions ]
                        } ];
                        if (waitForSync !== undefined) options.waitForSync = !!waitForSync;
                    } else {
                        if (Array.isArray(edgeDefinitions)) {
                            data.edgeDefinitions = edgeDefinitions;
                            if (Array.isArray(vertexCollections)) data.orphanCollections = vertexCollections; else if (typeof vertexCollections === "boolean") waitForSync = vertexCollections;
                        } else if (typeof edgeDefinitions === "boolean") waitForSync = edgeDefinitions;
                        if (waitForSync !== undefined) options.waitForSync = !!waitForSync;
                    }
                    return db.post(path + optionsToUrl(this, options), data);
                },
                get: function(graph) {
                    return db.get(path + "/" + graph);
                },
                list: function() {
                    return db.get(path);
                },
                "delete": function(graph, waitForSync) {
                    var options = {};
                    if (typeof waitForSync === "boolean") {
                        options.waitForSync = waitForSync;
                    }
                    return db.delete(path + "/" + graph + optionsToUrl(this, options));
                },
                vertexCollections: {
                    list: function(graph) {
                        return db.get(path + "/" + graph + "/vertex");
                    },
                    add: function(graph, collectionName) {
                        var data = {
                            collection: collectionName
                        };
                        return db.post(path + "/" + graph + "/vertex", data);
                    },
                    "delete": function(graph, collectionName) {
                        return db.delete(path + "/" + graph + "/vertex/" + collectionName);
                    }
                },
                edgeCollections: {
                    list: function(graph) {
                        return db.get(path + "/" + graph + "/edge");
                    },
                    add: function(graph, collectionName, from, to) {
                        if (typeof from === "string") {
                            from = [ from ];
                        }
                        if (typeof to === "string") {
                            to = [ to ];
                        }
                        var data = {
                            collection: collectionName,
                            to: to,
                            from: from
                        };
                        return db.post(path + "/" + graph + "/edge", data);
                    },
                    replace: function(graph, collectionName, from, to) {
                        if (typeof from === "string") {
                            from = [ from ];
                        }
                        if (typeof to === "string") {
                            to = [ to ];
                        }
                        var data = {
                            collection: collectionName,
                            to: to,
                            from: from
                        };
                        return db.put(path + "/" + graph + "/edge/" + collectionName, data);
                    },
                    "delete": function(graph, collectionName) {
                        return db.delete(path + "/" + graph + "/edge/" + collectionName);
                    }
                },
                vertex: {
                    create: function(graph, vertexData, collection, waitForSync) {
                        var options = {}, collections, urlOptions, result;
                        if (typeof collection !== "string") {
                            waitForSync = collection;
                            collection = undefined;
                        }
                        if (waitForSync !== undefined) {
                            options.waitForSync = !!waitForSync;
                        }
                        urlOptions = optionsToUrl(this, options);
                        if (!collection) {
                            result = graphObject.vertexCollections.list(graph).then(function(ret) {
                                if (ret.collections.length !== 1) {
                                    throw "The vertex collection is not unambigiously defined. Please give it explicitly.";
                                }
                                return db.post(path + "/" + graph + "/vertex/" + ret.collections[0] + urlOptions, vertexData);
                            });
                        } else {
                            result = db.post(path + "/" + graph + "/vertex/" + collection + urlOptions, vertexData);
                        }
                        return result;
                    },
                    get: function(graph, id, options) {
                        var headers;
                        if (options) {
                            headers = url.ifMatch(id, options);
                        }
                        return db.get(path + "/" + graph + "/vertex/" + id + optionsToUrl(this, options), headers);
                    },
                    put: function(graph, id, data, options) {
                        var headers;
                        if (options) {
                            headers = url.ifMatch(id, options);
                            if (options.forceUpdate !== undefined) {
                                options.policy = options.forceUpdate === true ? "last" : "error";
                                delete options.forceUpdate;
                            }
                        }
                        return db.put(path + "/" + graph + "/vertex/" + id + optionsToUrl(this, options), data, headers);
                    },
                    patch: function(graph, id, data, options) {
                        var headers;
                        if (options) {
                            headers = url.ifMatch(id, options);
                            if (options.forceUpdate !== undefined) {
                                options.policy = options.forceUpdate === true ? "last" : "error";
                                delete options.forceUpdate;
                            }
                        }
                        return db.patch(path + "/" + graph + "/vertex/" + id + optionsToUrl(this, options, true), data, headers);
                    },
                    "delete": function(graph, id, options) {
                        var headers, urlOptions;
                        if (options) {
                            headers = url.ifMatch(id, options);
                        }
                        urlOptions = optionsToUrl(this, options);
                        return db.delete(path + "/" + graph + "/vertex/" + id + urlOptions, headers);
                    }
                },
                edge: {
                    create: function(graph, edgeData, from, to, label, collection, waitForSync) {
                        var options = {}, urlOptions, result;
                        var data = edgeData || {};
                        if (to) data._to = to;
                        if (from) data._from = from;
                        if (label) data.$label = label;
                        if (typeof collection !== "string") {
                            waitForSync = collection;
                            collection = undefined;
                        }
                        if (waitForSync !== undefined) {
                            options.waitForSync = !!waitForSync;
                        }
                        urlOptions = optionsToUrl(this, options);
                        if (!collection) {
                            result = graphObject.edgeCollections.list(graph).then(function(ret) {
                                if (ret.collections.length !== 1) {
                                    throw "The edge collection is not unambigiously defined. Please give it explicitly.";
                                }
                                return db.post(path + "/" + graph + "/edge/" + ret.collections[0] + urlOptions, data);
                            });
                        } else {
                            result = db.post(path + "/" + graph + "/edge/" + collection + urlOptions, data);
                        }
                        return result;
                    },
                    get: function(graph, id, options) {
                        var headers;
                        if (options) {
                            headers = url.ifMatch(id, options);
                        }
                        return db.get(path + "/" + graph + "/edge/" + id + optionsToUrl(this, options), headers);
                    },
                    put: function(graph, id, data, options) {
                        var headers;
                        if (options) {
                            headers = url.ifMatch(id, options);
                            if (options.forceUpdate !== undefined) {
                                options.policy = options.forceUpdate === true ? "last" : "error";
                                delete options.forceUpdate;
                            }
                        }
                        return db.put(path + "/" + graph + "/edge/" + id + optionsToUrl(this, options), data, headers);
                    },
                    patch: function(graph, id, data, options) {
                        var headers;
                        if (options) {
                            headers = url.ifMatch(id, options);
                            if (options.forceUpdate !== undefined) {
                                options.policy = options.forceUpdate === true ? "last" : "error";
                                delete options.forceUpdate;
                            }
                        }
                        return db.patch(path + "/" + graph + "/edge/" + id + optionsToUrl(this, options, true), data, headers);
                    },
                    "delete": function(graph, id, options) {
                        var headers;
                        if (options) {
                            headers = url.ifMatch(id, options);
                        }
                        return db.delete(path + "/" + graph + "/edge/" + id + optionsToUrl(this, options), headers);
                    }
                },
                getNeighbourVertices: function(graph, vertex, options) {
                    var bindVars = {
                        graphName: graph,
                        example: vertex,
                        options: {}
                    }, queryData = {
                        bindVars: bindVars
                    }, filter;
                    options = options || {};
                    filter = options.filter || {};
                    filterDirection(filter, bindVars.options);
                    queryData.query = "FOR u IN GRAPH_NEIGHBORS(@graphName,@example,@options) ";
                    queryData.query += createFilterQuery(bindVars, filter, "u.path.edges[0]");
                    if (options.limit) {
                        queryData.query += " LIMIT @limit";
                        bindVars.limit = options.limit;
                    }
                    queryData.query += " RETURN u.vertex";
                    if (options.count) queryData.count = options.count;
                    if (options.batchSize) queryData.batchSize = options.batchSize;
                    return db.cursor.create(queryData);
                },
                getEdgesForVertex: function(graph, vertex, options) {
                    var bindVars = {
                        graphName: graph,
                        example: vertex,
                        options: {}
                    }, queryData = {
                        bindVars: bindVars
                    }, filter;
                    options = options || {};
                    filter = options.filter || {};
                    filterDirection(filter, bindVars.options);
                    queryData.query = "FOR e IN GRAPH_EDGES(@graphName,@example,@options) ";
                    queryData.query += createFilterQuery(bindVars, filter, "e");
                    queryData.query += " RETURN e";
                    if (options.count) queryData.count = options.count;
                    if (options.batchSize) queryData.batchSize = options.batchSize;
                    return db.cursor.create(queryData);
                },
                vertices: function(graph, options) {
                    var bindVars = {
                        graphName: graph,
                        options: {}
                    }, queryData = {
                        bindVars: bindVars
                    }, filter;
                    options = options || {};
                    filter = options.filter || {};
                    filterDirection(filter, bindVars.options);
                    queryData.query = "FOR v IN GRAPH_VERTICES(@graphName,{},@options) ";
                    queryData.query += createFilterQuery(bindVars, filter, "v");
                    queryData.query += " RETURN v";
                    queryData.count = options.count;
                    queryData.batchSize = options.batchSize;
                    return db.cursor.create(queryData);
                },
                edges: function(graph, options) {
                    var bindVars = {
                        graphName: graph,
                        options: {}
                    }, queryData = {
                        bindVars: bindVars
                    }, filter;
                    options = options || {};
                    filter = options.filter || {};
                    filter.direction = filter.direction || "out";
                    filterDirection(filter, bindVars.options);
                    queryData.query = "FOR e IN GRAPH_EDGES(@graphName,{},@options) ";
                    queryData.query += createFilterQuery(bindVars, filter, "e");
                    queryData.query += " RETURN e";
                    queryData.count = options.count;
                    queryData.batchSize = options.batchSize;
                    return db.cursor.create(queryData);
                },
                keepNull: function(val) {
                    this._keepNull = !!val;
                    this.vertex._keepNull = !!val;
                    this.edge._keepNull = !!val;
                    return this;
                },
                waitForSync: function(val) {
                    this._waitForSync = !!val;
                    this.vertex._waitForSync = !!val;
                    this.edge._waitForSync = !!val;
                    return this;
                }
            };
            return graphObject;
        }
        exports.graph = GraphAPI;
    }, {
        "../api": 7,
        "../../url": 5,
        "../../utils": 4,
        "../cursor": 13
    } ],
    19: [ function(require, module, exports) {
        var url = require("../../url");
        function ImportAPI(db) {
            var path = "/_api/import";
            return {
                importJSONData: function(collection, documents, options) {
                    if (typeof collection !== "string") {
                        options = documents;
                        documents = collection;
                        collection = db._collection;
                    }
                    options = options || {};
                    options.type = options.type || "auto";
                    options.collection = collection;
                    return db.post(path + url.options(options), documents);
                },
                importValueList: function(collection, documents, options) {
                    if (typeof collection !== "string") {
                        options = documents;
                        documents = collection;
                        collection = db._collection;
                    }
                    options = options || {};
                    options.collection = collection;
                    return db.post(path + url.options(options), documents, {
                        NoStringify: true
                    });
                }
            };
        }
        exports.import = ImportAPI;
    }, {
        "../../url": 5
    } ],
    20: [ function(require, module, exports) {
        function IndexAPI(db) {
            var path = "/_api/index/", xpath = "/_api/index?collection=";
            return {
                createCapIndex: function(collection, data) {
                    if (typeof collection !== "string") {
                        data = collection;
                        collection = db._collection;
                    }
                    if (!data || data.byteSize === undefined) {
                        throw "data byteSize must be set";
                    }
                    data.type = "cap";
                    return db.post(xpath + collection, data);
                },
                createGeoSpatialIndex: function(collection, options) {
                    if (typeof collection !== "string") {
                        options = collection;
                        collection = db._collection;
                    }
                    options = options || {};
                    options.type = options.type || "geo";
                    return db.post(xpath + collection, options);
                },
                createHashIndex: function(collection, options) {
                    if (typeof collection !== "string") {
                        options = collection;
                        collection = db._collection;
                    }
                    options = options || {};
                    options.type = options.type || "hash";
                    options.unique = options.unique || false;
                    return db.post(xpath + collection, options);
                },
                createSkipListIndex: function(collection, options) {
                    if (typeof collection !== "string") {
                        options = collection;
                        collection = db._collection;
                    }
                    options = options || {};
                    options.type = options.type || "skiplist";
                    options.unique = options.unique || false;
                    return db.post(xpath + collection, options);
                },
                createFulltextIndex: function(collection, options) {
                    if (typeof collection !== "string") {
                        options = collection;
                        collection = db._collection;
                    }
                    options = options || {};
                    options.type = options.type || "fulltext";
                    options.minLength = options.minLength || false;
                    return db.post(xpath + collection, options);
                },
                get: function(id) {
                    return db.get(path + id);
                },
                "delete": function(id) {
                    return db.delete(path + id);
                },
                list: function(collection) {
                    if (typeof collection !== "string") {
                        collection = db._collection;
                    }
                    return db.get(xpath + collection);
                }
            };
        }
        exports.index = IndexAPI;
    }, {} ],
    21: [ function(require, module, exports) {
        function JobAPI(db) {
            var path = "/_api/job";
            return {
                put: function(jobId) {
                    return db.put(path + "/" + jobId);
                },
                get: function(type, count) {
                    var param = "";
                    param = "?count=" + count;
                    return db.get(path + "/" + type + param);
                },
                "delete": function(type, stamp) {
                    var param = "";
                    param = "?stamp=" + stamp;
                    return db.delete(path + "/" + type + param);
                }
            };
        }
        exports.job = JobAPI;
    }, {} ],
    22: [ function(require, module, exports) {
        var api = require("../api"), utils = require("../../utils");
        api.use(require("../cursor"));
        function Aql() {
            var keywords = [ "for", "in", "filter", "from", "include", "collect", "into", "sort", "limit", "let", "return" ], graphKeywords = [ "graph_vertices", "graph_edges", "graph_neighbors", "graph_common_neighbors", "graph_common_properties", "graph_paths", "graph_shortest_path", "graph_traversal", "graph_traversal_tree", "graph_distance_to", "graph_absolute_eccentricity", "graph_eccentricity", "graph_absolute_closeness", "graph_closeness", "graph_absolute_betweenness", "graph_betweenness", "graph_radius", "graph_diameter" ], aql = this;
            aql.struct = {};
            var bindGraphKeywords = function(bindee) {
                graphKeywords.forEach(function(key) {
                    Object.defineProperty(bindee, key, {
                        enumerable: false,
                        value: function() {
                            var aqlString = key.toUpperCase();
                            var args = [].slice.call(arguments);
                            aqlString += "(";
                            aqlString += args.map(function(arg) {
                                if (typeof arg === "object") {
                                    return JSON.stringify(arg);
                                }
                                return '"' + arg + '"';
                            }).join(",");
                            aqlString += ")";
                            bindee(aqlString);
                            return aql;
                        }
                    });
                });
            };
            keywords.forEach(function(key) {
                Object.defineProperty(aql, key, {
                    enumerable: false,
                    value: function() {
                        var args = [].slice.call(arguments);
                        if (!args.length) return aql.struct[key];
                        if (typeof args[0] === "function") {
                            aql.struct[key] = function(func) {
                                var faql = new Aql();
                                func.apply(faql);
                                return faql.struct;
                            }(args[0]);
                        } else if (args[0] instanceof Aql) {
                            aql.struct[key] = args[0].struct;
                        } else {
                            if (key === "filter" || key === "let") {
                                if (!aql.struct[key]) aql.struct[key] = [];
                                aql.struct[key].push(args.join(" "));
                            } else aql.struct[key] = args.join(" ");
                        }
                        return aql;
                    }
                });
            });
            Object.defineProperty(aql, "string", {
                enumerable: false,
                get: function() {
                    return aql.toString();
                },
                set: function(str) {
                    if (typeof str === "string") aql.struct = {
                        _string: str
                    };
                    return aql._string;
                }
            });
            bindGraphKeywords(aql.in);
            bindGraphKeywords(aql.return);
            function structToString(struct) {
                struct = struct || aql.struct;
                return struct._string || keywords.concat(graphKeywords).filter(function(key) {
                    return !!struct[key];
                }).map(function(q) {
                    var keyword = q.toUpperCase(), value = struct[q], str;
                    switch (keyword) {
                      case "FROM":
                        keyword = "IN";
                        break;

                      case "INCLUDE":
                        keyword = "";
                        break;

                      case "FILTER":
                        value = value.join(" && ");
                        break;

                      case "LET":
                        value = value.join(" LET ");
                        break;

                      default:
                        break;
                    }
                    if (typeof value === "object") {
                        var nested = structToString(value);
                        if (q === "in") str = keyword + " ( " + nested + " )"; else str = keyword + " " + nested;
                    } else str = keyword + " " + value;
                    return str;
                }).join(" ");
            }
            aql.toString = structToString;
        }
        function QueryAPI(db) {
            if (!(this instanceof QueryAPI)) return new QueryAPI(db);
            var query = this;
            Aql.call(this);
            query.options = {};
            Object.defineProperty(this, "db", {
                enumerable: false,
                writable: false,
                value: db
            });
            Object.defineProperty(this, "toQuery", {
                enumerable: false,
                writable: false,
                value: function(aql, bindVars) {
                    var q = {};
                    if (aql instanceof Aql) q.query = aql.toString(); else if (typeof aql === "string") q.query = aql; else {
                        q.query = this.toString();
                        bindVars = aql;
                    }
                    if (query.options) utils.extend(true, q, query.options);
                    if (bindVars) q.bindVars = bindVars;
                    return q;
                }
            });
        }
        utils.inherit(QueryAPI, Aql);
        QueryAPI.prototype = {
            test: function(query, bindVars, options) {
                return this.db.cursor.query(this.toQuery(query, bindVars), options);
            },
            explain: function(query, bindVars, options) {
                return this.db.cursor.explain(this.toQuery(query, bindVars), options);
            },
            exec: function(query, bindVars, options) {
                var db = this.db, self = this;
                function on_result(ret) {
                    if (ret.hasMore) {
                        self.hasNext = function() {
                            return true;
                        };
                        self.next = function() {
                            return db.cursor.get(ret.id).then(on_result);
                        };
                    } else {
                        delete self.next;
                        self.hasNext = function() {
                            return false;
                        };
                    }
                    return ret;
                }
                return this.db.cursor.create(this.toQuery(query, bindVars), options).then(on_result);
            },
            count: function(num) {
                this.options.count = num > 0 ? true : false;
                this.options.batchSize = num > 0 ? num : undefined;
                return this;
            },
            "new": function() {
                return new Aql();
            },
            Aql: Aql,
            hasNext: function() {
                return this.next !== QueryAPI.prototype.next;
            },
            next: function() {
                throw {
                    name: "StopIteration"
                };
            }
        };
        exports.query = QueryAPI;
    }, {
        "../api": 7,
        "../../utils": 4,
        "../cursor": 13
    } ],
    23: [ function(require, module, exports) {
        function SimpleAPI(db) {
            var path = "/_api/simple/";
            return {
                list: function(collection, options) {
                    if (typeof collection !== "string") {
                        options = collection;
                        collection = db._collection;
                    }
                    options = options || {};
                    var data = {
                        collection: collection
                    };
                    return db.put(path + "all", applyOptions(this, data, options));
                },
                any: function(collection) {
                    if (typeof collection !== "string") {
                        collection = db._collection;
                    }
                    var data = {
                        collection: collection
                    };
                    return db.put(path + "any", data);
                },
                example: function(collection, example, options) {
                    if (typeof collection !== "string") {
                        options = example;
                        example = collection;
                        collection = db._collection;
                    }
                    var data = {
                        collection: collection,
                        example: example
                    };
                    return db.put(path + "by-example", applyOptions(this, data, options));
                },
                removeByExample: function(collection, example, options) {
                    if (typeof collection !== "string") {
                        options = example;
                        example = collection;
                        collection = db._collection;
                    }
                    var data = {
                        collection: collection,
                        example: example
                    };
                    return db.put(path + "remove-by-example", applyOptions(this, data, options));
                },
                replaceByExample: function(collection, example, newValue, options) {
                    if (typeof collection !== "string") {
                        options = newValue;
                        newValue = example;
                        example = collection;
                        collection = db._collection;
                    }
                    var data = {
                        collection: collection,
                        example: example,
                        newValue: newValue
                    };
                    return db.put(path + "replace-by-example", applyOptions(this, data, options));
                },
                updateByExample: function(collection, example, newValue, options) {
                    if (typeof collection !== "string") {
                        options = newValue;
                        newValue = example;
                        example = collection;
                        collection = db._collection;
                    }
                    var data = {
                        collection: collection,
                        example: example,
                        newValue: newValue
                    };
                    return db.put(path + "update-by-example", applyOptions(this, data, options));
                },
                firstByExample: function(collection, example, options) {
                    if (typeof collection !== "string") {
                        options = example;
                        example = collection;
                        collection = db._collection;
                    }
                    var data = {
                        collection: collection,
                        example: example
                    };
                    return db.put(path + "first-example", applyOptions(this, data, options));
                },
                first: function(collection, count) {
                    if (typeof collection !== "string") {
                        count = collection;
                        collection = db._collection;
                    }
                    var data = {
                        collection: collection
                    };
                    if (count !== null) {
                        data.count = count;
                    }
                    return db.put(path + "first", data);
                },
                last: function(collection, count) {
                    if (typeof collection !== "string") {
                        count = collection;
                        collection = db._collection;
                    }
                    var data = {
                        collection: collection
                    };
                    if (count !== null) {
                        data.count = count;
                    }
                    return db.put(path + "last", data);
                },
                range: function(collection, attribute, left, right, options) {
                    if (typeof right === "object" || right == undefined) {
                        options = right;
                        right = left;
                        left = attribute;
                        attribute = collection;
                        collection = db._collection;
                    }
                    options = options || {};
                    var data = {
                        collection: collection,
                        attribute: attribute,
                        left: left,
                        right: right
                    };
                    return db.put(path + "range", applyOptions(this, data, options));
                },
                near: function(collection, latitude, longitude, options) {
                    if (typeof longitude === "object" || longitude === undefined) {
                        options = longitude;
                        longitude = latitude;
                        latitude = collection;
                        collection = db._collection;
                    }
                    options = options || {};
                    var data = {
                        collection: collection,
                        latitude: latitude,
                        longitude: longitude
                    };
                    return db.put(path + "near", applyOptions(this, data, options));
                },
                within: function(collection, latitude, longitude, radius, options) {
                    if (typeof radius === "object" || radius === undefined) {
                        options = radius;
                        radius = longitude;
                        longitude = latitude;
                        latitude = collection;
                        collection = db._collection;
                    }
                    options = options || {};
                    var data = {
                        collection: collection,
                        latitude: latitude,
                        longitude: longitude,
                        radius: radius
                    };
                    return db.put(path + "within", applyOptions(this, data, options));
                },
                fulltext: function(collection, attribute, query, options) {
                    if (typeof query === "object" || query === undefined) {
                        options = query;
                        query = attribute;
                        attribute = collection;
                        collection = db._collection;
                    }
                    options = options || {};
                    var data = {
                        collection: collection,
                        attribute: attribute,
                        query: query
                    };
                    return db.put(path + "fulltext", applyOptions(this, data, options));
                },
                skip: function(val) {
                    this._skip = val;
                    return this;
                },
                limit: function(val) {
                    this._limit = val;
                    return this;
                }
            };
        }
        function applyOptions(o, data, attributes) {
            if (typeof attributes === "object") {
                Object.keys(attributes).forEach(function(option) {
                    switch (option) {
                      case "from":
                        data.left = attributes[option];
                        data.closed = true;
                        break;

                      case "to":
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
        exports.simple = SimpleAPI;
    }, {} ],
    24: [ function(require, module, exports) {
        function TransactionAPI(db) {
            var path = "/_api/transaction/";
            return {
                submit: function(collections, action, options) {
                    options.collections = collections;
                    options.action = action.toString();
                    return db.post(path, options);
                }
            };
        }
        exports.transaction = TransactionAPI;
    }, {} ],
    25: [ function(require, module, exports) {
        function TraversalAPI(db) {
            var path = "/_api/traversal/";
            return {
                start: function(startVertex, edgeCollection, options) {
                    options = options || {};
                    options.startVertex = startVertex;
                    options.edgeCollection = edgeCollection;
                    return db.post(path, options);
                }
            };
        }
        exports.traversal = TraversalAPI;
    }, {} ],
    26: [ function(require, module, exports) {
        var utils = require("../../utils");
        function UserAPI(db) {
            var path = "/_api/user/";
            return {
                create: function(user, options) {
                    if (!user) throw new Error("no username");
                    var data = utils.extend(true, {
                        user: user
                    }, options);
                    return db.post(path, data);
                },
                get: function(user) {
                    return db.get(path + user);
                },
                put: function(user, options) {
                    if (!user) throw new Error("no username");
                    var data = utils.extend(true, {
                        user: user
                    }, options);
                    return db.put(path + user, data);
                },
                patch: function(user, options) {
                    if (!user) throw new Error("no username");
                    var data = utils.extend(true, {
                        user: user
                    }, options);
                    return db.patch(path + user, data);
                },
                "delete": function(user) {
                    return db.delete(path + user);
                }
            };
        }
        exports.user = UserAPI;
    }, {
        "../../utils": 4
    } ],
    27: [ function(require, module, exports) {
        var task = require("microtask");
        (function(root) {
            "use strict";
            try {
                root = window;
            } catch (e) {
                try {
                    root = global;
                } catch (f) {}
            }
            var slice = Array.prototype.slice, isArray = Array.isArray;
            var PENDING = 0, FULFILLED = 1, REJECTED = 2;
            function Promise(p) {
                var self = this;
                if (p && typeof p === "object") {
                    for (var k in Promise.prototype) p[k] = Promise.prototype[k];
                    p._promise = {
                        _chain: []
                    };
                    return p;
                }
                if (!(this instanceof Promise)) return new Promise(p);
                this._promise = {
                    _chain: []
                };
                if (typeof p === "function") {
                    task(function() {
                        var res = self.resolve.bind(self), rej = self.reject.bind(self), pro = self.progress.bind(self), tim = self.timeout.bind(self);
                        p(res, rej, pro, tim);
                    });
                }
            }
            Promise.resolver = function(p, r) {
                if (typeof r === "function") {
                    if (Promise.thenable(p)) {
                        return r(p.resolve, p.reject, p.progress, p.timeout);
                    } else if (p) {
                        return Promise.resolver(Promise(p), r);
                    } else return new Promise(r);
                }
                return new Promise(p);
            };
            Promise.thenable = function(p) {
                var then;
                if (p && (typeof p === "object" || typeof p === "function")) {
                    try {
                        then = p.then;
                    } catch (e) {
                        return false;
                    }
                }
                return typeof then === "function";
            };
            Promise.wrap = function(Klass, inst) {
                var p = new Promise();
                if (!Klass) throw Error("Nothing to wrap!");
                return function() {
                    var KC = Klass.prototype.constructor, args = slice.call(arguments), ret;
                    if (typeof KC === "function") {
                        try {
                            ret = KC.apply(inst, args);
                            if (!(ret instanceof Klass)) {
                                KC = function() {};
                                KC.prototype = Klass.prototype;
                                inst = new KC();
                                try {
                                    ret = Klass.apply(inst, args);
                                } catch (e) {
                                    p.reject(e);
                                    return;
                                }
                                ret = Object(ret) === ret ? ret : inst;
                            }
                            p.resolve(ret);
                        } catch (err) {
                            p.reject(err);
                        }
                    } else throw Error("not wrappable");
                    return p;
                };
            };
            Promise.defer = function() {
                var args = slice.call(arguments), f = args.shift(), p = new Promise();
                if (typeof f === "function") {
                    task(enclose, args);
                }
                function enclose() {
                    try {
                        p.resolve(f.apply(p, args));
                    } catch (err) {
                        p.reject(err);
                    }
                }
                return p;
            };
            Promise.async = function(func, cb) {
                var p = new Promise(), called;
                if (typeof func !== "function") throw new TypeError("func is not a function");
                var cb = typeof cb === "function" ? cb : function(err, ret) {
                    called = true;
                    if (err) p.reject(err); else if (err === 0) p.progress(ret); else p.fulfill(ret);
                };
                return function() {
                    var args = slice.call(arguments);
                    args.push(cb);
                    task(function() {
                        var ret;
                        try {
                            ret = func.apply(null, args);
                        } catch (err) {
                            cb(err);
                        }
                        if (ret !== undefined && !called) {
                            if (ret instanceof Error) cb(ret); else cb(undefined, ret);
                        }
                    });
                    return p;
                };
            };
            Promise.prototype.isPending = function() {
                return !this._promise._state;
            };
            Promise.prototype.isFulfilled = function() {
                return this._promise._state === FULFILLED;
            };
            Promise.prototype.isRejected = function() {
                return this._promise._state === REJECTED;
            };
            Promise.prototype.hasResolved = function() {
                return !!this._promise._state;
            };
            Promise.prototype.valueOf = function() {
                return this.isFulfilled() ? this._promise._value : undefined;
            };
            Promise.prototype.reason = function() {
                return this.isRejected() ? this._promise._value : undefined;
            };
            Promise.prototype.then = function(f, r, n) {
                var p = new Promise();
                this._promise._chain.push([ p, f, r, n ]);
                if (this._promise._state) task(traverse, [ this._promise ]);
                return p;
            };
            Promise.prototype.spread = function(f, r, n) {
                function s(v, a) {
                    if (!isArray(v)) v = [ v ];
                    return f.apply(f, v.concat(a));
                }
                return this.then(s, r, n);
            };
            Promise.prototype.done = function(f, r, n) {
                var self = this, p = this.then(f, catchError, n);
                function catchError(e) {
                    task(function() {
                        if (typeof r === "function") r(e); else if (typeof self.onerror === "function") {
                            self.onerror(e);
                        } else if (Promise.onerror === "function") {
                            Promise.onerror(e);
                        } else throw e;
                    });
                }
            };
            Promise.prototype.end = function(callback) {
                this.then(callback, function(e) {
                    if (!(e instanceof Error)) {
                        e = new Error(e);
                    }
                    if (typeof callback === "function") callback(e); else throw e;
                });
            };
            Promise.prototype.catch = function(errBack) {
                this.done(undefined, errBack);
            };
            Promise.prototype.fulfill = function(value, opaque) {
                if (!this._promise._state) {
                    this._promise._state = FULFILLED;
                    this._promise._value = value;
                    this._promise._opaque = opaque;
                    task(traverse, [ this._promise ]);
                }
                return this;
            };
            Promise.prototype.reject = function(reason, opaque) {
                if (!this._promise._state) {
                    this._promise._state = REJECTED;
                    this._promise._value = reason;
                    this._promise._opaque = opaque;
                    task(traverse, [ this._promise ]);
                }
                return this;
            };
            Promise.prototype.resolve = function(x, o) {
                var then, z, p = this;
                if (!this._promise._state) {
                    if (x === p) p.reject(new TypeError("Promise cannot resolve itself!"));
                    if (x && (typeof x === "object" || typeof x === "function")) {
                        try {
                            then = x.then;
                        } catch (e) {
                            p.reject(e);
                        }
                    }
                    if (typeof then !== "function") {
                        this.fulfill(x, o);
                    } else if (!z) {
                        try {
                            then.apply(x, [ function(y) {
                                if (!z) {
                                    p.resolve(y, o);
                                    z = true;
                                }
                            }, function(r) {
                                if (!z) {
                                    p.reject(r);
                                    z = true;
                                }
                            } ]);
                        } catch (e) {
                            if (!z) {
                                p.reject(e);
                                z = true;
                            }
                        }
                    }
                }
                return this;
            };
            Promise.prototype.progress = function() {
                var notify, chain = this._promise._chain;
                for (var i = 0, l = chain.length; i < l; i++) {
                    if (typeof (notify = chain[i][2]) === "function") notify.apply(this, arguments);
                }
            };
            Promise.prototype.timeout = function(msec, func) {
                var p = this;
                if (msec === null) {
                    if (this._promise._timeout) root.clearTimeout(this._promise._timeout);
                    this._promise._timeout = null;
                } else if (!this._promise._timeout) {
                    this._promise._timeout = root.setTimeout(onTimeout, msec);
                }
                function onTimeout() {
                    var e = new RangeError("exceeded timeout");
                    if (!this._promise._state) {
                        if (typeof func === "function") func(p); else if (typeof p.onerror === "function") p.onerror(e); else throw e;
                    }
                }
                return this;
            };
            Promise.prototype.callback = function(callback) {
                return this.then(function(value, opaque) {
                    return callback(undefined, value, opaque);
                }, function(reason, opaque) {
                    var error = reason;
                    if (!(error instanceof Error)) {
                        if (typeof reason === "object") {
                            error = new Error(JSON.stringify(reason));
                            for (var k in reason) error[k] = reason[k];
                        } else {
                            error = new Error(reason);
                        }
                    }
                    return callback(error, opaque);
                }, function(progress) {
                    return callback(0, progress);
                });
            };
            Promise.prototype.join = function(j) {
                var p = this, y = [], u = new Promise().resolve(p).then(function(v) {
                    y[0] = v;
                });
                if (arguments.length > 1) {
                    j = slice.call(arguments);
                }
                if (!isArray(j)) j = [ j ];
                function stop(error) {
                    u.reject(error);
                }
                function collect(i) {
                    j[i].then(function(v) {
                        y[i + 1] = v;
                    }).catch(stop);
                    return function() {
                        return j[i];
                    };
                }
                for (var i = 0; i < j.length; i++) {
                    u = u.then(collect(i));
                }
                return u.then(function() {
                    return y;
                });
            };
            function traverse(_promise) {
                var l, tuple = _promise._chain;
                if (!tuple.length) return;
                var t, p, h, v = _promise._value;
                while (t = tuple.shift()) {
                    p = t[0];
                    h = t[_promise._state];
                    if (typeof h === "function") {
                        try {
                            v = h(_promise._value, _promise._opaque);
                            p.resolve(v, _promise._opaque);
                        } catch (e) {
                            p.reject(e);
                        }
                    } else {
                        p._promise._state = _promise._state;
                        p._promise._value = v;
                        p._promise._opaque = _promise._opaque;
                        task(traverse, [ p._promise ]);
                    }
                }
            }
            if (module && module.exports) module.exports = Promise; else if (typeof define === "function" && define.amd) define(Promise); else root.Promise = Promise;
        })(this);
    }, {
        microtask: 30
    } ],
    30: [ function(require, module, exports) {
        (function(root) {
            "use strict";
            try {
                root = global;
            } catch (e) {
                try {
                    root = window;
                } catch (e) {}
            }
            var defer, deferred, observer, queue = [];
            if (root.process && typeof root.process.nextTick === "function") {
                if (root.setImmediate && root.process.versions.node.split(".")[1] > "10") defer = root.setImmediate; else defer = root.process.nextTick;
            } else if (root.vertx && typeof root.vertx.runOnLoop === "function") defer = root.vertx.RunOnLoop; else if (root.vertx && typeof root.vertx.runOnContext === "function") defer = root.vertx.runOnContext; else if (observer = root.MutationObserver || root.WebKitMutationObserver) {
                defer = function(document, observer, drain) {
                    var el = document.createElement("div");
                    new observer(drain).observe(el, {
                        attributes: true
                    });
                    return function() {
                        el.setAttribute("x", "y");
                    };
                }(document, observer, drain);
            } else if (typeof root.setTimeout === "function" && (root.ActiveXObject || !root.postMessage)) {
                defer = function(f) {
                    root.setTimeout(f, 0);
                };
            } else if (root.MessageChannel && typeof root.MessageChannel === "function") {
                var fifo = [], channel = new root.MessageChannel();
                channel.port1.onmessage = function() {
                    fifo.shift()();
                };
                defer = function(f) {
                    fifo[fifo.length] = f;
                    channel.port2.postMessage(0);
                };
            } else if (typeof root.setTimeout === "function") defer = function(f) {
                root.setTimeout(f, 0);
            }; else throw new Error("No candidate for microtask defer()");
            deferred = head;
            function microtask(func, args, context) {
                if (typeof func !== "function") throw new Error("microtask: func argument is not a function!");
                deferred(func, args, context);
            }
            function head(func, args, context) {
                queue[queue.length] = [ func, args, context ];
                deferred = tail;
                defer(drain);
            }
            function tail(func, args, context) {
                queue[queue.length] = [ func, args, context ];
            }
            function drain() {
                var q;
                for (var i = 0; i < queue.length; i++) {
                    q = queue[i];
                    try {
                        q[0].apply(q[2], q[1]);
                    } catch (e) {
                        defer(function() {
                            throw e;
                        });
                    }
                }
                deferred = head;
                queue = [];
            }
            if (module && module.exports) module.exports = microtask; else if (typeof define === "function" && define.amd) define(microtask); else root.microtask = microtask;
        })(this);
    }, {} ]
}, {}, {
    "1": "Arango"
});