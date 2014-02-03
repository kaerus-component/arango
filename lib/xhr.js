var urlParser = require('urlparser'),
    BROWSER,
    xhr;

/* detects if in nodejs or else assume we are in a browser */
try { BROWSER = !process.versions.node } catch (e) { BROWSER = true }

/* Bring in Xhr support for nodejs or browser */
if(!BROWSER) {
    xhr = function(method,path,options,data,resolver) {
        "use strict";

        var url = urlParser.parse(path);
        var proto = (url.host && url.host.protocol) || options.protocol;
        var req = require(proto).request;

        delete options.protocol;

        if(options.timeout) {
            request.socket.setTimeout(options.timeout);
            delete options.timeout;
        }

        options.method = method;

        if(url.host){
            if(url.host.hostname) options.hostname = url.host.hostname;
            /* todo: add authentication headers if defined in url */

            url.host = null;
        }

        options.path = url.toString();

        if(!options.headers) options.headers = {};
        options.headers["content-length"] = data ? Buffer.byteLength(data) : 0;
        req(options,function(res) {
            var buf = [];

            res.on('data',function(chunk){
                buf[buf.length] = chunk;
            }).on('end',function(){
                buf = buf.join('');
                reply(resolver,buf,res);
            }).on('error',function(error){
                resolver.reject(error);
            });
        }).on('error',function(error) {
            resolver.reject(error)
        }).end(data,options.encoding);
    }
} else {
    xhr = function(method,path,options,data,resolver){
        "use strict";

        var ajax = require('ajax'), buf;

        ajax(method,path,options,data).when(function(res){
            buf = res.responseText;
            reply(resolver,buf,res);
        },function(error){
            resolver.reject(error);
        });
    }
}

function reply(resolver,data,xhr){
    var status = xhr.statusCode || xhr.status;

    try { data = JSON.parse(data) } catch(e) { }

    if(status < 400) {
        resolver.resolve(data,xhr);
    } else {
        resolver.resolve(data,xhr);
    }
}

module.exports = xhr;
