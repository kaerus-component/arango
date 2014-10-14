var arango;

try {
    arango = require('arango');
} catch (e) {
    arango = require('..');
}

describe("endpoint", function () {

    var db;
    
    before(function (done) {
	
	db = new arango.Connection();
	
	db.database.delete("newDatabase3").end(function () {
	    db.database.create("newDatabase3").then(function () {
		db.database.delete("newDatabase4").end(function() {
		    db.database.create("newDatabase4").then(function () {
			db.endpoint.delete("tcp://127.0.0.1:8888").end(function(){
			    done();
			});
		    });
		});
	    });
	});
    })
    
    describe("endpointFunctions", function () {
	
	it('create an endpoint', function (done) {
	    db.endpoint.create("tcp://127.0.0.1:8888", ["newDatabase3", "newDatabase4"])
	    .then(function (ret, message) {
		    ret.error.should.equal(false);
		    message.status.should.equal(200);
	    }).callback(done);
	})

	it('create an endpoint with malformed request', function (done) {
	    
	    db.endpoint.create(null, ["newDatabase3", "newDatabase4"])
	    .catch(function (err) {
		err.code.should.equal(400);
		done();
	    });
	})
	
	it('list endpoints', function (done) {
	    
	    db.endpoint.get()
		.then(function (ret, message) {
		    message.status.should.equal(200);
		}).callback(done);
	})
	
	it('delete endpoint', function (done) {
	    
	    db.endpoint.delete("tcp://127.0.0.1:8888")
	    .then(function (ret, message) {
		ret.error.should.equal(false);
		message.status.should.equal(200);
	    }).callback(done);
	})
	
	it('list endpoints', function (done) {
	    
	    db.endpoint.get()
		.then(function (ret, message) {
		    message.status.should.equal(200);
		}).callback(done);
	})
    })
})
