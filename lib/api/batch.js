/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */
 
function closure(db) {
    "use strict"

    var jobs, request;

    var BatchAPI = {
		"start": function(){
			request = db.request;
        	jobs = [];

        	/* enter batch-mode and start capturing requests */
	        db.request = function(){
	            var args = Array.prototype.slice.call(arguments);
	            jobs.push(args);

	            return db;
	        }

	        return db;
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
	        db.request = request;

	        return db;
	    }
	}

	return BatchAPI;
}

module.exports = closure; 