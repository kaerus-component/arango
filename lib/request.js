/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

var utils = require('./utils'),
    xhr = require('./xhr');

function request(method,path,data,options,callback) {
    var result;

    if(typeof options === 'function') {
        callback = options;
        options = undefined;
    }

    options = options ? options : {};

    options = utils.extend(true,{},this._server,options);       

    if(data && typeof data !== 'string') {
        try {
            data = JSON.stringify(data);
        } catch(err) {
            throw "failed to json stringify data";
        }
    }    

    if(this._name) {
        path = '/_db/' + this._name + path;
    }

    result = new this.Promise();

    xhr(method,path,options,data,result);

    if(typeof callback === 'function') {
        result.then(function(value,opaque){
            callback(undefined,value,opaque);    
        },function(reason,opaque){
            callback(-1,reason,opaque);    
        },function(progress){
            callback(0,progress);
        });         
    }

    result.and = this;

    return result;  
}

module.exports = request;
