var Arango = require('../arango'),
    utils = require('../utils'),
    path = "/_api/batch",
    contentType = "Content-Type: multipart/form-data;",
    batchPart = "Content-Type: application/x-arango-batchpart",
    defaultBoundary = "batch{id}",
    id = 0;
 
function BatchAPI(db){
    var request = db.request, jobs = [], boundary;

    return {
       "start": function(){
            boundary = defaultBoundary.replace(/{(.*)}/,++id);

            /* start capturing requests */
            db.request = function(){
                var args = Array.prototype.slice.call(arguments),
                    job = db.Promise();

                args.unshift(job);
                jobs.push(args);

                return job;
            };

            return db;
        },
        "exec": function(callback){
            var options = {headers:{'content-type':"multipart/form-data; boundary=" + boundary}},
                data = '', args, batch, i;

            if(!jobs.length) throw new Error("No jobs");

            for(i = 0; i < jobs.length; i++) {
                args = jobs[i];

                data+= '--' + boundary + '\r\n';
                data+= batchPart + '\r\n\r\n';
                data+= args[1] + ' ' + args[2] + " HTTP/1.1\r\n\r\n";
                
                if(args[3]) {
                    if(typeof args[3] === 'string') data+= args[3];
                    else data+= JSON.stringify(args[3]); 
                }

                if(args[4]){
                    utils.extend(true,options,args[4]);
                }

            }

            data+= '--' + boundary + '--\r\n';

            batch = jobs.map(function(b){return b[0]});

            jobs = [];
            
            db.request = request;

            // note: joins result of batch operation and individual jobs
            return db.post(path,data,options,callback).then(function(data){
                var results, job;

                results = decode_multipart(data,boundary);

                for(job in batch){
                    if(!results[job]){
                        batch[job].reject("job %s missing in batch results!", job);
                    } else {
                        if(results[job].xhr.status < 400)
                            batch[job].fulfill(results[job].message,results[job].xhr);
                        else
                            batch[job].reject(results[job].message,results[job].xhr);
                    }
                }

                if(callback) {
                    callback(0,results);
                }
            }).join(batch);
        },
        "cancel": function(){
            db.request = request;

            for(var job in jobs) job[0].reject("job cancelled");
            
            jobs = [];

            return db;
        }
    };
}

function decode_multipart(data,boundary){
    var x, i, j, results = [], segments, lines, status;

    // splits results into chunks
    data = data.split('--' + boundary).filter(function(f){return f}).map(function(m){return m.split('\r\n')});
 
    for(i in data){
        segments = [];

        // check for valid batchPart in chunk
        x = data[i].indexOf(batchPart);

        if(x < 0) continue;

        lines = [];

        // iterate through each chunk
        for(j = x + 1; j < data[i].length; j++){
            // collect lines to segments
            if(!data[i][j]){
                if(lines.length) segments.push(lines);
                lines = [];
            } else { 
                lines.push(data[i][j]);
            }
        }   

        if(segments.length){
            // get http status code
            status = parseInt(segments[0][0].split(' ')[1],10);
            results.push({xhr:{status:status,headers:segments[0]},message:segments[1]});
        }
    }

    return results;
}


module.exports = Arango.api('batch',BatchAPI);