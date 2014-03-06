var arango, db;
var port;
try {
    arango = require('arangojs')
} catch (e) {
    arango = require('..')
}

function check(done, f) {
    try {
        f()
        done()
    } catch (e) {
        console.log(e);
        done(e)
    }
}

var db;

describe("endpoint", function() {


    before(function(done) {
        this.timeout(50000);
        if (typeof window !== "undefined") {
            port = window.port;
        } else {
            port = require('./port.js');
            port = port.port;
        }

        db = arango.Connection("http://127.0.0.1:"+port+"/_system");
        db.database.delete("newDatabase3", function(err, ret) {
            db.database.create("newDatabase3", function(err, ret) {
                db.database.delete("newDatabase4", function(err, ret) {
                    db.database.create("newDatabase4", function(err, ret) {
                        db.endpoint.delete("tcp://127.0.0.1:8888", function(err, ret) {
                            done();
                        });
                    });
                });
            });
        });
    })

    describe("endpointFunctions", function() {
        this.timeout(50000);
        it('create an endpoint', function(done) {
            db.endpoint.create("tcp://127.0.0.1:8888", ["newDatabase3", "newDatabase4"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('create an endpoint with malformed request', function(done) {
            this.timeout(50000);
            db.endpoint.create(null, ["newDatabase3", "newDatabase4"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(true);
                    message.status.should.equal(400);
                });
            });
        })
        it('list endpoints', function(done) {
            this.timeout(50000);
            db.endpoint.get(function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(200);
                });
            });
        })
        it('delete endpoint', function(done) {
            this.timeout(50000);
            db.endpoint.delete("tcp://127.0.0.1:8888", function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })
        it('list endpoints', function(done) {
            this.timeout(50000);
            db.endpoint.get(function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(200);
                });
            });
        })
    })
})
