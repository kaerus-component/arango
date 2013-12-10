/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
 
 var Arango = require('../arango');
 
 var jobs, request;

 var BatchAPI = {
   "start": function(){
        var db = this.db;

        request = this.db.request;
        jobs = [];

        /* enter batch-mode and start capturing requests */
        this.request = function(){
            var args = Array.prototype.slice.call(arguments);
            jobs.push(args);

            return db;
        };

        return this;
    },
    "exec": function(){
        /* todo: assemble http multipart message */
        jobs.forEach(function(job){
            console.log("Executing:", job);
        });
        /* todo: return promised batch request */  
    },
    "end": function(){
        /* restore normal request operation */
        this.db.request = request;

        return this;
    }
};

module.exports = Arango.api('batch',BatchAPI);