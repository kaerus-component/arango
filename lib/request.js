/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

var BROWSER = (typeof window === 'object'), xhr;

/* Bring in Xhr support for nodejs or browser */
if(!BROWSER) {
    xhr = function(method,path,options,data) {

        var promise = new (require('promise')),
            request = (require)(options.protocol).request;

        delete options.protocol;

        if(options.timeout) {
            request.socket.setTimeout(options.timeout);
            delete options.timeout;
        }

        options.method = method;
        options.path = path;

        /* convert to Buffer to workaround issue with wrong json length */
        data = data && !data.length ? new Buffer(data) : data;

        if(!options.headers) options.headers = {};

        options.headers["content-length"] = data ? data.length : 0;
        
        request(options,function(res) {
            var response='';

            res.on('data',function(data){
                response+=data;
            });   

            res.on('end',function(){
                try {  
                    response = JSON.parse(response);
                } catch(e) { }

                promise.attach(res);

                if(res.statusCode < 400) {
                    promise.fulfill(response);
                } else {
                    promise.reject(response);
                }
            });
        }).on('error',function(error) { 
            promise.reject(error)
        }).end(data,options.encoding);
           
        return promise;
    }
} else xhr = require('ajax');

function closure(db) {    
    "use strict"

    var utils = require('./utils');

    function request(method,path,data,options,callback) { 

        if(typeof options === 'function') {
            callback = options;
            options = undefined;
        }

        options = options ? options : {};

        options = utils.extend(true,{},db.server,options);       

        if(data) {
            try {
                data = JSON.stringify(data);
            } catch(err) {
                throw "failed to json stringify data";
            }
        }    

        var res = xhr(method,path,options,data); 

        if(callback) {
            res.then(function(response) {
                return callback(0,response,this.attached);
            },function(error) {
                return callback(-1,error,this.attached);
            });
        }

        return res;    
    }

    var Methods = {
        "get": function(path,options,callback){
            return request('GET',path,null,options,callback);
        },
        "post": function(path,data,options,callback){
            return request('POST',path,data,options,callback);
        },
        "put": function(path,data,options,callback){
            return request('PUT',path,data,options,callback);
        },
        "delete": function(path,options,callback){
            return request('DELETE',path,null,options,callback);
        },
        "head": function(path,options,callback){
            return request('HEAD',path,null,options,callback);
        },
        "patch": function(path,data,options,callback){
            return request('PATCH',path,data,options,callback);
        },
        "options": function(path,options,callback){
            return request("OPTIONS",path,null,options,callback);
        }
    };

    return Methods;
}

module.exports = closure;        
