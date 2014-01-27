/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
 
 var Arango = require('../arango');
 
 var jobs, request;

 var path = "/_api/batch/";

 var BatchAPI = {
   "start": function(){
        var db = this.db;

        request = this.db.request;
        jobs = [];

        /* enter batch-mode and start capturing requests */
       this.db.request = function(){
           var args = Array.prototype.slice.call(arguments);
           var job = {};
           job.method = args[0];
           job.path = args[1];
           job.data = args[2];
           job.options = args[3];
           jobs.push(job);
           return db;
        };
       return this;
    },
    "exec": function(boundary, callback){
        var headers = {};
        headers["Content-Type"] = "multipart/form-data; boundary=" + boundary;
        var body = "";
        for (var i in jobs) {
            body += "--"+boundary+"\r\nContent-Type: application/x-arango-batchpart\r\n";
            if (jobs[i].options && jobs[i].options.id) {
                body += "Content-Id: " + jobs[i].options.id +"\r\n";
            }
            body += "\r\n";
            body += jobs[i].method + " " + jobs[i].path + " HTTP/1.1\r\n\r\n";
            if (jobs[i].data) {
                body += JSON.stringify(jobs[i].data) + "\r\n";
            }
        }
        if (body != "") {
            body += "--" + boundary + "--\r\n";
        }

        return this.db.post(path,body,{headers:headers, NoStringify: true},callback);
    },
    "end": function(){
        /* restore normal request operation */
        this.db.request = request;

        return this;
    }
};

module.exports = Arango.api('batch',BatchAPI);