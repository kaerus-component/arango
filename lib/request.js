/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

var utils = require('./utils'),
    xhr = require('./xhr');

function request(method,path,data,options,callback) {
    var res;

    if(typeof options === 'function') {
        callback = options;
        options = undefined;
    }

    options = options ? options : {};

    options = utils.extend(true,{},this._server,options);       

    if(data && !options.NoStringify) {
        try {
            data = JSON.stringify(data);
        } catch(err) {
            throw "failed to json stringify data";
        }
    }

    if(this._name) {
        path = '/_db/' + this._name + path;
    }
    res = this.Promise();
    xhr(method,path,options,data,res);




    if(typeof callback === 'function') {
        res.then(function(value,opaque){
            callback(undefined,value,opaque);
        },function(reason){
            callback(-1,reason);    
        },function(progress){
            callback(0,progress);
        });         
    }

    return res;    
}

module.exports = request;
