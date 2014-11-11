/*global require exports */
var utils = require('../../utils'),
    batchPart = "Content-Type: application/x-arango-batchpart",
    defaultBoundary = "batch{id}",
    batch_sequence = 0;

/**
 * The api module "batch" to perform batch requests. Calling "start" sets the connection into batch mode and collects
 * every request. Calling "Exec" switches back to normal mode and executes the batch.
 *
 * @module Arango
 * @submodule batch
 * @class batch
 * @extends Arango
 **/

function BatchAPI(db) {
    var path = "/_api/batch",
        request = db.request,
        jobs = [],
        boundary;

    return {
        /**
         * Enables the batch mode for the current connection.
         *
         * @method start
         * @return {Object} The modified arango connection.
         */
        "start": function(user_boundary) {
            ++batch_sequence;

            boundary = user_boundary ? user_boundary + batch_sequence : defaultBoundary.replace(/{(.*)}/, batch_sequence);

            /* start capturing requests */
            db.request = function() {
                var args = Array.prototype.slice.call(arguments),
                    job = new db.Promise();

                args.unshift(job);
                jobs.push(args);

                return job;
            };

            return db;
        },
        /**
         * Executes the batch request.
         *
         * @method exec
         * @return{Promise}
         */
        "exec": function() {
            var options = {
                headers: {
                    'content-type': "multipart/form-data; boundary=" + boundary
                }
            },
                data = '',
                args, batch, i;
	    
            if (!jobs.length) throw new Error("No jobs");
	    
            for (i = 0; i < jobs.length; i++) {
                args = jobs[i];

                data += '--' + boundary + '\r\n';
                data += batchPart + '\r\n\r\n';
                data += args[1] + ' ' + args[2] + " HTTP/1.1\r\n\r\n";

                if (args[3]) {
                    if (typeof args[3] === 'string') data += args[3];
                    else data += JSON.stringify(args[3]);
		    data += '\r\n';
                }

                if (args[4]) {
                    utils.extend(true, options, args[4]);
                }

            }

            data += '--' + boundary + '--\r\n';

            batch = jobs.map(function(j) {
                return j[0];
            });

            jobs = [];

            db.request = request;
            // note: joins result of batch operation and individual jobs
            return db.post(path, data, options).then(function(data, xhr) {
                var results, job, result, ok;

                results = decode_multipart(data, boundary);

                for (job in batch) {
                    result = results[job];

                    ok = result && result.xhr.status < 400;

                    batch[job][ok ? 'fulfill' : 'reject'](result.message, result.xhr);

                }

                return {
                    jobs: batch.length,
                    length: results.length
                };
            }, function(error) {

                error = {
                    message: 'job failed',
                    error: error
                };

                for (var job in batch) {
                    batch[job].reject(error);
                }

            }).join(batch);
        },
        /**
         * Disables the batch mode and rejects all requests in the current batch.
         *
         * @param {String} [reason] - reason for cancellation.
         * @method cancel
         * @return {Object}    The original arango collection;
         */
        "cancel": function(reason) {
            var batch = jobs.map(function(j) {
                return j[0]
            }),
                message = {
                    message: reason || "job cancelled"
                };
	    
            db.request = request;

            for (var job in batch) {
                batch[job].reject(message);
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
        return f;
    }).map(function(m) {
        return m.split('\r\n');
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
                message = segments[1];
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


exports.batch = BatchAPI;
