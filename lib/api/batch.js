var Arango = require('../arango'),
    utils = require('../utils'),
    path = "/_api/batch",
    batchPart = "Content-Type: application/x-arango-batchpart",
    defaultBoundary = "batch{id}",
    id = 0;

function BatchAPI(db) {
    var request = db.request,
        jobs = [],
        boundary;

    return {
        "start": function() {
            boundary = defaultBoundary.replace(/{(.*)}/, ++id);

            /* start capturing requests */
            db.request = function() {
                var args = Array.prototype.slice.call(arguments),
                    job = db.Promise();

                args.unshift(job);
                jobs.push(args);

                return job;
            };

            return db;
        },
        "exec": function(callback) {
            var options = {
                headers: {
                    'content-type': "multipart/form-data; boundary=" + boundary
                }
            },
                data = '',
                args, batch, callbacks, i;

            if (!jobs.length) throw new Error("No jobs");

            for (i = 0; i < jobs.length; i++) {
                args = jobs[i];

                data += '--' + boundary + '\r\n';
                data += batchPart + '\r\n\r\n';
                data += args[1] + ' ' + args[2] + " HTTP/1.1\r\n\r\n";

                if (args[3]) {
                    if (typeof args[3] === 'string') data += args[3];
                    else data += JSON.stringify(args[3]);
                }

                if (args[4]) {
                    utils.extend(true, options, args[4]);
                }

            }

            data += '--' + boundary + '--\r\n';

            batch = jobs.map(function(j) {
                return j[0]
            });

            callbacks = jobs.map(function(j) {
                return j[4]
            });

            jobs = [];

            db.request = request;
            // note: joins result of batch operation and individual jobs
            return db.post(path, data, options).then(function(data, xhr) {
                var results, job, result, ok;

                results = decode_multipart(data, boundary);

                for (job in batch) {
                    result = results[job];

                    ok = !! result && result.xhr.status < 400;

                    batch[job][ok ? 'fulfill' : 'reject'](result.message, result.xhr);
                    if (callbacks[job]) {
                        callbacks[job](ok ? 0 : -1, result.message, result.xhr);
                    }
                }
                if (callback) callback(0, results, xhr);

                return {
                    jobs: batch.length,
                    length: results.length
                };
            }, function(error) {
                error = {
                    message: 'job failed',
                    error: error
                };

                if (callback) callback(-1, error);

                for (var job in batch) {
                    batch[job].reject(error);
                    if (callbacks[job]) callbacks(-1, error);
                }

            }).join(batch);
        },
        "cancel": function(reason) {
            var batch = jobs.map(function(j) {
                return j[0]
            }),
                callbacks = jobs.map(function(j) {
                    return j[4]
                }),
                message = {
                    message: reason || "job cancelled"
                };

            db.request = request;

            for (var job in batch) {
                batch[job].reject(message);
                if (callbacks[job]) callbacks[job](-1, message);
            }

            return db;
        }
    };
}

function decode_multipart(data, boundary) {
    var x, i, j, results = [],
        segments, lines, status, message;

    // splits results into chunks
    data = data.split('--' + boundary).filter(function(f) {
        return f
    }).map(function(m) {
        return m.split('\r\n')
    });

    for (i in data) {
        segments = [];

        // check for valid batchPart in chunk
        x = data[i].indexOf(batchPart);

        if (x < 0) continue;

        lines = [];

        // iterate through each chunk
        for (j = x + 1; j < data[i].length; j++) {
            // collect lines to segments
            if (!data[i][j]) {
                if (lines.length) segments.push(lines);
                lines = [];
            } else {
                lines.push(data[i][j]);
            }
        }

        if (segments.length) {
            // get http status code
            status = parseInt(segments[0][0].split(' ')[1], 10);
            // parse message
            try {
                message = JSON.parse(segments[1]);
            } catch (e) {
                message = segments[1]
            }

            results.push({
                xhr: {
                    status: status,
                    headers: segments[0]
                },
                message: message
            });
        }
    }

    return results;
}


module.exports = Arango.api('batch', BatchAPI);
