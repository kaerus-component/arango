var Arango = require('../arango'),
    utils = require('../utils'),
    path = "/_api/batch",
    contentType = "Content-Type: multipart/form-data;";
    defaultBoundary = "ArangoBatch{id}",
    id = 0;
 
function BatchAPI(db){
    var request = db.request, jobs = [];

    return {
       "begin": function(boundary){
            this.setBoundary(boundary||defaultBoundary);

            /* start capturing requests */
            db.request = function(){
                var args = Array.prototype.slice.call(arguments);
                jobs.push(args);

                return db;
            };

            return db;
        },
        "end": function(callback){
            var options = {headers:{'content-type':"multipart/form-data; boundary=" + this.boundary}},
                part = "Content-Type: application/x-arango-batchpart\r\n\r\n",
                data = '', job;

            /* stop capturing requests */
            db.request = request;

            if(!jobs.length) throw new Error("No jobs");

            while(job = jobs.shift()) {
                data+= '--' + this.boundary + '\r\n' + part;
                data+= job[0] + ' ' + job[1] + " HTTP/1.1\r\n\r\n";
                
                if(job[2]) {
                    if(typeof job[2] === 'string') data+= job[2];
                    else data+= JSON.stringify(job[2]); 
                }

                if(job[3]){
                    utils.extend(true,options,job[3]);
                }

            }
            
            data+= '--' + this.boundary + '--\r\n';

            /* todo: decode response */
            return db.post(path,data,options,callback);
        },
        "setBoundary": function(b){
            this.boundary = b.replace(/{(.*)}/,++id);

            return db;
        }
    };
}

module.exports = Arango.api('batch',BatchAPI);