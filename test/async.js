var arango;

try{ arango = require('arango') } catch (e){ arango = require('..') }

function check( done, f ) {
    try {
        f()
        done()
    } catch( e ) {
        console.log(e);
        done( e )
    }
}

function setJobs() {

}
var db;
var jobs = [];
var storedJobs = {};




describe("async",function(){

    db = arango.Connection("http://127.0.0.1:8529");

    before(function(done){
        this.timeout(20000);
        db.database.delete("newDatabase",function(err, ret){
            db.database.create("newDatabase",function(err, ret){
                db = arango.Connection({_name:"newDatabase",_server:{hostname:"localhost"}});
                done();
            });
        });

    })

    describe("async Functions",function(){

		it('lets create a collection in normal mode ....we expect a result',function(done){
            db.collection.create("newCollection", function(err,ret,message){
				check( done, function () {
                    ret.status.should.equal(3);
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                } );
			});
        })
        it('lets create a collection in async store mode ....we only expect a header with a job id',function(done){
            db.setAsyncMode(true).collection.create("newCollection2", function(err,ret,message){
                check( done, function () {
                    ret.should.equal("");
                    message.headers.should.have.property("x-arango-async-id");
                    message.status.should.equal(202);
                } );
            });
        })
        it('lets create a collection in async fire and forget mode ....we only expect a header without a job id',function(done){
            db.setAsyncMode(true, true).collection.create("newCollection3", function(err,ret,message){
                check( done, function () {
                    ret.should.equal("");
                    message.headers.should.not.have.property("x-arango-async-id");
                    message.status.should.equal(202);
                } );
            });
        })

        it('Ok, we switched to fire and forget, lets check if db is still configuredthat way.',function(done){
            db.collection.create("newCollection", function(err,ret,message){
                check( done, function () {
                    ret.should.equal("");
                    message.headers.should.not.have.property("x-arango-async-id");
                    message.status.should.equal(202);
                } );
            });
        })
        it('lets switch back to normal mode ....we expect a result',function(done){
            db.setAsyncMode(false).collection.create("newCollection6", function(err,ret,message){
                check( done, function () {
                    ret.status.should.equal(3);
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                } );
            });
        })
        it('lets create a collection in normal mode ....we expect a result',function(done){
            db.collection.create("newCollection7", function(err,ret,message){
                check( done, function () {
                    ret.status.should.equal(3);
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                } );
            });
        })
        it('lets switch back to async store mode ....and create some jobs',function(done){
            db.setAsyncMode(true).collection.create("newCollection10", function(err,ret,message){
                check( done, function () {
                    ret.should.equal("");
                    message.headers.should.have.property("x-arango-async-id");
                    message.status.should.equal(202);
                } );
            });
        })
        it('create a document',function(done){
            db.document.create("newCollection10", {"key1" : "val1", "key2" : "val2", "key3" : null}, null, function(err,ret, message){
                check( done, function () {
                    ret.should.equal("");
                    message.headers.should.have.property("x-arango-async-id");
                    message.status.should.equal(202);
                } );
            });
        })
        it('create a document',function(done){
            db.document.create("newCollection10", {"key1" : "val1", "key2" : "val2", "key3" : null}, null, function(err,ret, message){
                check( done, function () {
                    ret.should.equal("");
                    message.headers.should.have.property("x-arango-async-id");
                    message.status.should.equal(202);
                } );
            });
        })
        it('create a document',function(done){
            db.document.create("newCollection100", {"key1" : "val1", "key2" : "val2", "key3" : null}, null, function(err,ret, message){
                check( done, function () {
                    ret.should.equal("");
                    message.headers.should.have.property("x-arango-async-id");
                    message.status.should.equal(202);
                } );
            });
        })
        it('create a document',function(done){
            db.document.create("newCollection10", {"key1" : "val1", "key2" : "val2", "key3" : null}, null, function(err,ret, message){
                check( done, function () {
                    ret.should.equal("");
                    message.headers.should.have.property("x-arango-async-id");
                    message.status.should.equal(202);
                } );
            });
        })
        it('lets switch back to normal mode ....and get the list of jobs',function(done){
            db.setAsyncMode(false).job.get("pending", function(err,ret,message){
                check( done, function () {
                    ret.length.should.be.above(4);
                    message.status.should.equal(200);
                } );
            });
        })
        it('lets delete the job queue',function(done){
            db.job.delete("all", function(err,ret,message){
                check( done, function () {
                    ret.result.should.equal(true);
                    message.status.should.equal(200);
                } );
            });
        })
        it('lets get the list of jobs',function(done){
            db.job.get("done", function(err,ret,message){
                check( done, function () {
                    ret.length.should.equal(0);
                    message.status.should.equal(200);
                } );
            });
        })
        it('lets switch back to async store mode ....and create failing jobs',function(done){
            db.setAsyncMode(true).collection.create("newCollection10", function(err,ret,message){
                check( done, function () {
                    storedJobs[message.headers["x-arango-async-id"]] = 409;
                    ret.should.equal("");
                    message.headers.should.have.property("x-arango-async-id");
                    message.status.should.equal(202);
                } );
            });
        })
        it('create a failing document',function(done){
            db.document.create("newCollection100", {"key1" : "val1", "key2" : "val2", "key3" : null}, null, function(err,ret, message){
                check( done, function () {
                    storedJobs[message.headers["x-arango-async-id"]] = 404;
                    ret.should.equal("");
                    message.headers.should.have.property("x-arango-async-id");
                    message.status.should.equal(202);
                } );
            });
        })
        it('create a document',function(done){
            db.document.create("newCollection10", {"key1" : "val1", "key2" : "val2", "key3" : null}, null, function(err,ret, message){
                check( done, function () {
                    ret.should.equal("");
                    storedJobs[message.headers["x-arango-async-id"]] = 200;
                    message.headers.should.have.property("x-arango-async-id");
                    message.status.should.equal(202);
                } );
            });
        })
        it('create a failing document',function(done){
            db.document.create("newCollection100", {"key1" : "val1", "key2" : "val2", "key3" : null}, null, function(err,ret, message){
                check( done, function () {
                    ret.should.equal("");
                    storedJobs[message.headers["x-arango-async-id"]] = 404;
                    message.headers.should.have.property("x-arango-async-id");
                    message.status.should.equal(202);
                } );
            });
        })
        it('lets switch back to normal mode ....and get the job result',function(done){

            function callDb(done) {
                db.setAsyncMode(false).job.get("done", function(err,ret,message){
                    var jobs = ret;
                    if (jobs.length != 4) {
                        callDb(done);
                        return;
                    }
                    done();
                })
            }
            callDb(done);

        })
        it('lets get the job results',function(done){
            Object.keys(storedJobs).forEach(function(key) {
                db.job.put(key, function(err,ret,message){
                    ret.code.should.equal(storedJobs[key]);
                });
            } )
            done();

        })

    })

})


