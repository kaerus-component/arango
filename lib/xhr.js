var urlParser = require('urlparser'),
    BROWSER = (typeof window === 'object');

var xhr;

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
            var buf='';

            res.on('data',function(rdata){
                buf+=rdata;
            }).on('end',function(){
                try {  
                    buf = JSON.parse(buf);
                } catch(e) { }

                if(res.statusCode < 400) {
                    resolver.resolve(buf,res);
                } else {
                    resolver.resolve(buf, res);
                }
            }).on('error',function(error){
                resolver.reject(error);
            });
        }).on('error',function(error) { 
            resolver.reject(error)
        }).end(data,options.encoding);
    }
} else {
    xhr = function(method,path,options,data,resolver){
        var ajax = require('ajax'), buf;
        ajax(method,path,options,data).when(function(res){
            /* todo: refactor out */
            buf = res.responseText;
            try {  
                buf = JSON.parse(res.responseText);
            } catch(e) { }

            if(res.status < 400) {
                resolver.resolve(buf,res);
            } else {
                resolver.resolve(buf, res);
            }
        },function(error){
            resolver.reject(error);
        });
    }
}

module.exports = xhr;
