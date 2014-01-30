var Arango = require('../arango'),
    path = "/_admin/";

function AdminAPI(db) {
    return {
        "version": function(details,callback){
            return db.get(path+"version?details="+!!details,callback);
        },
        "statistics": function(callback){
            return db.get(path+"statistics",callback);
        },
        "statisticsDescription": function(callback){
            return db.get(path+"statistics-description",callback);
        },
        "log": function(severity,options,callback) {
            severity = severity ? "?level=" + severity : "";
            
            if(typeof options === 'object'){
                Object.keys(options).forEach(function(param){
                    severity += severity.length ? '&' : '?';
                    severity += param+'='+options[param];
                });
            } else callback = options;

            return db.get(path+"log"+severity,callback);   
        },
        "getConfig": function(callback) {
            return db.get(path+'config/configuration',callback);
        },
        "describeConfig": function(callback) {
            return db.get(path+'config/description',callback);
        },
        "routes": function(callback) {
            return db.get(path+"routing/routes", callback);
        },
        "routesReload": function(callback){
            return db.get(path+"routing/reload", callback);
        },
        "modulesFlush": function(callback){
            return db.get(path+"modules/flush", callback);
        },
        "time": function(callback){
            return db.get(path+"time",callback);
        },
        "echo": function(method,htmloptions,data,headers,callback){
            method = typeof method === 'string' ? method.toUpperCase() : 'GET';
            headers = {headers:headers};
            htmloptions = htmloptions ? htmloptions : '';

            return db.request(method,path+'echo'+htmloptions,data,headers,callback);
        }
    };
}

module.exports = Arango.api('admin',AdminAPI);

