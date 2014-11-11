var arango, db, jobs = [],
    storedJobs = {};

try {
    arango = Arango
} catch (e) {
    arango = require('..')
}

describe("async", function () {
    
    before(function (done) {
	db = arango.Connection();
	
	db.database.delete("newDatabase").end( function() {
	    db.database.create("newDatabase").then(function() {
		db = db.use('/newDatabase');
		done();
	    });
	});
    })

    it('lets create a collection in normal mode ....we expect a result', function (done) {

	db.collection.create("newCollection").then(function(ret){
	    ret.status.should.equal(3);
	    ret.error.should.equal(false);
	}).callback(done);
    })
    
    it('lets create a collection in async store mode ....we only expect a header with a job id', function (done) {

	db.setAsyncMode(true).collection.create("newCollection2")
	    .then( function (ret,message) {
		var keys = Object.keys(message.headers);
		var e = keys.indexOf("x-arango-async-id");
		message.status.should.equal(202);
		e.should.not.equal(-1);
	    }).callback(done);
    })
    it('lets create a collection in async fire and forget mode ....we only expect a header without a job id', function (done) {

	db.setAsyncMode(true, true).collection.create("newCollection3")
	    .then(function (ret,message) {
		var keys = Object.keys(message.headers);
		var e = keys.indexOf("x-arango-async-id");
		e.should.equal(-1);
		message.status.should.equal(202);
	    }).callback(done);
    })
    
    it('Ok, we switched to fire and forget, lets check if db is still configured that way.', function (done) {

	db.collection.create("newCollection")
	    .then(function (ret, message) {
		var keys = Object.keys(message.headers);
		var e = keys.indexOf("x-arango-async-id");
		e.should.equal(-1);
		message.status.should.equal(202);
	    }).callback(done);
    })
    
    it('lets switch back to normal mode ....we expect a result', function (done) {

	db.setAsyncMode(false).collection.create("newCollection6")
	    .then(function (ret, message) {
		ret.status.should.equal(3);
		ret.error.should.equal(false);
		message.status.should.equal(200);
	    }).callback(done);
    })
    
    it('lets create a collection in normal mode ....we expect a result', function (done) {

	db.collection.create("newCollection7")
	    .then(function (ret, message) {
		ret.status.should.equal(3);
		ret.error.should.equal(false);
		message.status.should.equal(200);
	    }).callback(done);
    })
    
    it('lets switch back to async store mode ....and create some jobs', function (done) {

	db.setAsyncMode(true).collection.create("newCollection10")
	    .then(function (ret, message) {
		var keys = Object.keys(message.headers);
		var e = keys.indexOf("x-arango-async-id");
		e.should.not.equal(-1);
		message.status.should.equal(202);
	    }).callback(done);
    })
    
    it('create a document', function (done) {

	db.document.create("newCollection10", {
	    "key1": "val1",
	    "key2": "val2",
	    "key3": null
	}).then( function (ret, message) {
	    var keys = Object.keys(message.headers);
	    var e = keys.indexOf("x-arango-async-id");
	    e.should.not.equal(-1);
	    message.status.should.equal(202);
	}).callback(done);
    })
    
    it('create a document', function (done) {

	db.document.create("newCollection10", {
	    "key1": "val1",
	    "key2": "val2",
	    "key3": null
	}).then( function (ret, message) {
	    var keys = Object.keys(message.headers);
	    var e = keys.indexOf("x-arango-async-id");
	    e.should.not.equal(-1);
	    message.status.should.equal(202);
	}).callback(done);
    })
    
    it('create a document', function (done) {

	db.document.create("newCollection100", {
	    "key1": "val1",
	    "key2": "val2",
	    "key3": null
	}).then( function (ret, message) {
	    var keys = Object.keys(message.headers);
	    var e = keys.indexOf("x-arango-async-id");
	    e.should.not.equal(-1);
	    message.status.should.equal(202);
	}).callback(done);
    })
    
    it('create a document', function (done) {

	db.document.create("newCollection10", {
	    "key1": "val1",
	    "key2": "val2",
	    "key3": null
	}).then( function (ret, message) {
	    var keys = Object.keys(message.headers);
	    var e = keys.indexOf("x-arango-async-id");
	    e.should.not.equal(-1);
	    message.status.should.equal(202);
	}).callback(done);
    })
    
    it('lets switch back to normal mode ....and get the list of jobs', function (done) {

	db.setAsyncMode(false).job.get("pending")
	    .then(function (ret, message) {
		message.status.should.equal(200);
	    }).callback(done);
    })
    
    it('lets delete the job queue', function (done) {
	
	db.job.delete("all")
	    .then(function (ret, message) {
		ret.result.should.equal(true);
		message.status.should.equal(200);
	    }).callback(done);
    })
    
    it('lets get the list of jobs', function (done) {

	db.job.get("done")
	    .then(function (ret, message) {
		ret.length.should.equal(0);
		message.status.should.equal(200);
	    }).callback(done);
    })
    
    it('lets switch back to async store mode ....and create failing jobs', function (done) {

	db.setAsyncMode(true).collection.create("newCollection10")
	    .then(function (ret, message) {
		storedJobs[message.headers["x-arango-async-id"]] = 409;
		var keys = Object.keys(message.headers);
		var e = keys.indexOf("x-arango-async-id");
		e.should.not.equal(-1);
		message.status.should.equal(202);
	    }).callback(done);
    })
    
    it('create a failing document', function (done) {

	db.document.create("newCollection100", {
	    "key1": "val1",
	    "key2": "val2",
	    "key3": null
	}).then( function (ret, message) {
	    storedJobs[message.headers["x-arango-async-id"]] = 404;
	    var keys = Object.keys(message.headers);
	    var e = keys.indexOf("x-arango-async-id");
	    e.should.not.equal(-1);
	    message.status.should.equal(202);
	}).callback(done);
    })
    
    it('create a document', function (done) {

	db.document.create("newCollection10", {
	    "key1": "val1",
	    "key2": "val2",
	    "key3": null
	}).then(function (ret, message) {
	    storedJobs[message.headers["x-arango-async-id"]] = 202;
	    var keys = Object.keys(message.headers);
	    var e = keys.indexOf("x-arango-async-id");
	    e.should.not.equal(-1);
	    message.status.should.equal(202);
	}).callback(done);
    })
    
    it('create a failing document', function (done) {

	db.document.create("newCollection100", {
	    "key1": "val1",
	    "key2": "val2",
	    "key3": null
	}).then( function (ret, message) {
	    storedJobs[message.headers["x-arango-async-id"]] = 404;
	    var keys = Object.keys(message.headers);
	    var e = keys.indexOf("x-arango-async-id");
	    e.should.not.equal(-1);
	    message.status.should.equal(202);
	}).callback(done);
    })
    
    it('lets switch back to normal mode ....and get the job result', function (done) {
	var done;
	
	function untilDone(){
	    db.setAsyncMode(false).job.get("done")
		.then(function (jobs) {
		    if(jobs.length == 4) done = true;
		}).catch(function(e){			
		    done(new Error(e));
		});
	    
	    if(!done){
		setTimeout(untilDone,300);
	    }
	    else done();
	}
	
	untilDone();
	
    })

    // this test fails and needs to be fixed
    /*
     it('lets get the job results', function (done) {
     var results = [], job;

     
	 Object.keys(storedJobs).forEach(function (key) {
	     job = db.job.put(key).then( function (ret) {
		 console.log("key",key);
		 console.log("storedJobs",storedJobs[key]);
		 ret._key.should.equal(storedJobs[key]);
	     }, function(error){
		 console.log("error",error);
	     });
	     
	     results.push(job);
	 });
	 
	 db.Promise().fulfill("when all jobs done").join(results).callback(done);
	 
     })
  */

})
