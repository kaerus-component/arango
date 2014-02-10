var arango, db, indices;
var port;
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


describe("indexWithDefaultCollection", function() {


    before(function(done) {
        if (typeof window !== "undefined") {
            port = window.port;
        } else {
            port = require('./port.js');
            port = port.port;
        }

        this.timeout(20000);
        db = arango.Connection("http://127.0.0.1:"+port+"/_system");
        db.database.delete("newDatabase", function(err, ret) {
            db.database.create("newDatabase", function(err, ret) {
                db = db.use('/newDatabase');
                db.collection.create("collection1", function(err, ret, message) {
                    var data = [{
                        "_key": "Anton",
                        "value1": 25,
                        "value2": "test",
                        "allowed": true
                    }, {
                        "_key": "Bert",
                        "value1": "baz"
                    }, {
                        "_key": "Cindy",
                        "value1": "baaaz"
                    }, {
                        "_key": "Emil",
                        "value1": "batz"
                    }];
                    db = db.use('/newDatabase:collection1');
                    done();
                });
            });
        });

    })

    describe("indexWithDefaultCollectionFunctions", function() {

        it('create a cap index', function(done) {
            db.index.createCapIndex({
                "size": 100,
                "byteSize": 1000000
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })
        it('create same cap index again and expect a 200', function(done) {
            db.index.createCapIndex({
                "size": 100,
                "byteSize": 1000000
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('create a geo spatial index', function(done) {
            db.index.createGeoSpatialIndex(["latitude", "longitude"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })
        it('create same geo spatial index again and expect a 200', function(done) {
            db.index.createGeoSpatialIndex(["latitude", "longitude"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })
        it('create a location based geo spatial index', function(done) {
            db.index.createGeoSpatialIndex(["location"], {
                "geoJson": true
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })

        it('create a hash index', function(done) {
            db.index.createHashIndex(["value1"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })
        it('create same hash again and expect a 200', function(done) {
            db.index.createHashIndex(["value1"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('create a skiplist index', function(done) {
            db.index.createSkipListIndex(["value1"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })
        it('create same skiplist again and expect a 200', function(done) {
            db.index.createSkipListIndex(["value1"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('create a fulltext index', function(done) {
            db.index.createFulltextIndex(["value1"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })
        it('create same fulltext again and expect a 200', function(done) {
            db.index.createFulltextIndex(["value1"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('create a bitarray index', function(done) {
            db.index.createBitarrayIndex(["x", [0, 1, []], "y", ["a", "b", []]], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })
        it('create same bitarray again and expect a 200', function(done) {
            db.index.createBitarrayIndex(["x", [0, 1, []], "y", ["a", "b", []]], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('list all we created so far', function(done) {
            db.index.list(function(err, ret, message) {
                check(done, function() {
                    indices = ret.indexes;
                    ret.error.should.equal(false);
                    ret.indexes.length.should.equal(8);
                    message.status.should.equal(200);
                });
            });
        })
        it('get an index ', function(done) {
            db.index.get(indices[1].id, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })
        it('get an index ', function(done) {
            db.index.get(indices[5].id, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })
        it('delete an index ', function(done) {
            db.index.delete(indices[5].id, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })
        it('list all we created so far', function(done) {
            db.index.list(function(err, ret, message) {
                check(done, function() {
                    indices = ret.indexes;
                    ret.error.should.equal(false);
                    ret.indexes.length.should.equal(7);
                    message.status.should.equal(200);
                });
            });
        })

    })
})
