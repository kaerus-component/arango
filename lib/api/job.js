/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
var Arango = require('../arango');

var path = "/_api/job";
/**
 * The api module to request information about async running jobs in ArangoDB.
 *
 * @class jobs
 * @module arango
 * @submodule jobs
 **/
function JobAPI(db) {

    return {
        /**
         *
         * Returns the result of an async job identified by job-id. If the async job result is present on the server, the
         * result will be removed from the list of result. That means this method can be called for each job-id once.
         *
         * @param {String} jobId     -  The async job id.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method put
         */
        "put": function(jobId, callback) {
            return db.put(path+"/"+jobId, null, callback);
        },
        /**
         * Returns the list of ids of async jobs with a specific status (either done or pending). The list can be used by
         * the client to get an overview of the job system status and to retrieve completed job results later.
         *
         * @param {String} type -  The type of jobs to return. The type can be either done or pending. Setting the type
         * to done will make the method return the ids of already completed async jobs for which results can be fetched.
         * Setting the type to pending will return the ids of not yet finished async jobs.
         * @param {Number} [count] -  The maximum number of ids to return per call. If not specified, a server-defined
         * maximum value will be used.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method get
         */
        "get": function(type, count,  callback) {
            var param = "";
            if (typeof count === "function") {
                callback = count;
            } else {
                param = "?count=" + count;
            }
            return db.get(path+"/"+type+param, null, callback);
        },
        /**
         * Deletes either all job results, expired job results, or the result of a specific job. Clients can use this
         * method to perform an eventual garbage collection of job results.
         *
         * @param {String} type -  The type of jobs to delete. type can be: <br>- all:    deletes all jobs results.
         * Currently executing or queued async jobs will not be stopped by this call.<br>- expired: deletes expired
         * results. To determine the expiration status of a result, pass the stamp URL parameter. stamp needs to be a
         * UNIX timestamp, and all async job results created at a lower timestamp will be deleted.<br>- an actual
         * job-id: in this case, the call will remove the result of the specified async job. If the job is currently
         * executing or queued, it will not be aborted.
         * @param {Number} [stamp]     -  A UNIX timestamp specifying the expiration threshold when type is expired.
         * @param {Function} callback   - The callback function.
         * @return{Promise}
         * @method delete
         */
        "delete": function(type, stamp,  callback) {
            var param = "";
            if (typeof stamp === "function") {
                callback = stamp;
            } else {
                param = "?stamp=" + stamp;
            }
            return db.delete(path+"/"+type+param, null, callback);
        }
    }
}


module.exports = Arango.api('job',JobAPI);
