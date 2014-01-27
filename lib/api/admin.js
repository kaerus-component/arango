/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

var Arango = require('../arango');

var path = "/_admin/";

var AdminAPI = {
    "version": function(details,callback){
        return this.db.get(path+"version?details="+!!details,callback);
    },
    "statistics": function(callback){
        return this.db.get(path+"statistics",callback);
    },
    "statisticsDescription": function(callback){
        return this.db.get(path+"statistics-description",callback);
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
    "log": function(options,callback) {

        params="";
        if (options) {
            Object.keys(options).forEach(function(param){
                params += param+'='+options[param]+"&";
            });
        }
        return this.db.get(path+"log?"+params,callback);
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

