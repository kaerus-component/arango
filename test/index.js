var arango, db, indices;

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


describe("index", function() {


    before(function(done) {
        this.timeout(20000);
        db = arango.Connection("http://127.0.0.1:8529/_system");
        db.database.delete("newDatabase", function(err, ret) {
            db.database.create("newDatabase", function(err, ret) {
                db = arango.Connection({
                    _name: "newDatabase",
                    _server: {
                        hostname: "127.0.0.1"
                    }
                });
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
                    done();
                });
            });
        });

    })

    describe("indexFunctions", function() {

        it('create a cap index', function(done) {
            db.index.createCapIndex("collection1", {
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
            db.index.createCapIndex("collection1", {
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
            db.index.createGeoSpatialIndex("collection1", ["latitude", "longitude"], {
                "constraint": true,
                "ignoreNull": true
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })
        it('create same geo spatial index again and expect a 200', function(done) {
            db.index.createGeoSpatialIndex("collection1", ["latitude", "longitude"], {
                "constraint": true,
                "ignoreNull": true
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })
        it('create a location based geo spatial index', function(done) {
            db.index.createGeoSpatialIndex("collection1", ["location"], {
                "geoJson": true
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })

        it('create a hash index', function(done) {
            db.index.createHashIndex("collection1", ["value1"], false, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })
        it('create same hash again and expect a 200', function(done) {
            db.index.createHashIndex("collection1", ["value1"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('create a skiplist index', function(done) {
            db.index.createSkipListIndex("collection1", ["value1"], false, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })
        it('create same skiplist again and expect a 200', function(done) {
            db.index.createSkipListIndex("collection1", ["value1"], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('create a fulltext index', function(done) {
            db.index.createFulltextIndex("collection1", ["value1"], 3, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })
        it('create same fulltext again and expect a 200', function(done) {
            db.index.createFulltextIndex("collection1", ["value1"], 3, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('create a bitarray index', function(done) {
            db.index.createBitarrayIndex("collection1", ["x", [0, 1, []], "y", ["a", "b", []]], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })
        it('create same bitarray again and expect a 200', function(done) {
            db.index.createBitarrayIndex("collection1", ["x", [0, 1, []], "y", ["a", "b", []]], function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('list all we created so far', function(done) {
            db.index.list("collection1", function(err, ret, message) {
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
            db.index.list("collection1", function(err, ret, message) {
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
