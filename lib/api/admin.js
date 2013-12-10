/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

var Arango = require('../arango');

require('./query');

var path = "/_admin/";

var AdminAPI = {
    "version": function(details,callback){
        return this.db.get(path+"version?details="+!!details,callback);
    },
    "status": function(callback) {
        return this.db.get(path+"status",callback);  
    },
    "statistics": function(callback){
        return this.db.get(path+"statistics",callback);
    },
    "statisticsDescription": function(callback){
        return this.db.get(path+"statistics-description",callback);
    },
    "log": function(severity,options,callback) {
            serverity = severity ? "?level="+severity : "";

            Object.keys(options).forEach(function(param){
                severity += severity.length ? '&' : '?';
                severity += param+'='+options[param];
            });

            return this.db.get(path+"log"+severity,callback);   
    },
    "getConfig": function(callback) {
        return this.db.get(path+'config/configuration',callback);
    },
    "describeConfig": function(callback) {
        return this.db.get(path+'config/description',callback);
    },
    "getUser": function(user,callback) {
        return this.query
            .for('u')
            .in('_users')
            .filter('u.user == @username')
            .return('u')
            .exec({username:user}).then(function(u){
                u = u[0];
                if(!u) throw "user " + user + " not found";
                return u;
            });   
    },
    "routes": function(callback) {
        return this.db.get(path+"routing/routes", callback);
    },
    "routesReload": function(callback){
        return this.db.get(path+"routing/reload", callback);
    },
    "modulesFlush": function(callback){
        return this.db.get(path+"modules/flush", callback);
    },
    "time": function(callback){
        return this.db.get(path+"time",callback);
    },
    "echo": function(method,htmloptions,data,headers,callback){
        method = typeof method === 'string' ? method.toUpperCase() : 'GET';
        headers = {headers:headers};
        htmloptions = htmloptions ? htmloptions : '';

        return this.db.request(method,path+'echo'+htmloptions,data,headers,callback);
    }
};

module.exports = Arango.api('admin',AdminAPI);

