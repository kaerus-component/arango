/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

"use strict"

var Ajax = require('ajax'),
    url = require('url'),
    utils = require('./utils');

function request(method,path,data,options,callback) { 

    var uri = url.parse(path);

    if(!uri.host) uri.host = this.server;

    if(data) {
        try {
            data = JSON.stringify(data);
        } catch(err) {
            throw "failed to json stringify data";
        }
    }    

    var xhr = Ajax.request(method,uri.toString(),data,options); 
    console.log("Ajax %s %s", method, uri.toString());

    if(callback) {
        xhr.then(function(response) {
            return callback(0,response,this.attached);
        },function(error) {
            return callback(-1,error,this.attached);
        });
    }

    return xhr;    
}

module.exports = request;        
