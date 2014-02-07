var arango, db;

try {
    arango = require('arango')
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
        this.timeout(20000);
        db = arango.Connection("http://127.0.0.1:8529/_system");
        db.database.delete("newDatabase3", function(err, ret) {
            db.database.create("newDatabase3", function(err, ret) {
                db.database.delete("newDatabase4", function(err, ret) {
                    db.database.create("newDatabase4", function(err, ret) {
                        done();
                    });
                });
            });
        });

    })

    describe("endpointFunctions", function() {

        it('create an endpoint', function(done) {
            db.endpoint.create("tcp://127.0.0.1:8530", ["newDatabase3", "newDatabase4"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })
        it('create an endpoint with malformed request', function(done) {
            db.endpoint.create(null, ["newDatabase3", "newDatabase4"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(true);
                    message.status.should.equal(400);
                });
            });
        })
        it('list endpoints', function(done) {
            db.endpoint.get(function(err, ret, message) {
                check(done, function() {
                    ret.length.should.equal(2);
                    message.status.should.equal(200);
                });
            });
        })
        it('delete endpoint', function(done) {
            db.endpoint.delete("tcp://127.0.0.1:8530", function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })
        it('list endpoints', function(done) {
            db.endpoint.get(function(err, ret, message) {
                check(done, function() {
                    ret.length.should.equal(1);
                    message.status.should.equal(200);
                });
            });
        })
    })
})
