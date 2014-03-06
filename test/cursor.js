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
        //console.log(e);
        done(e)
    }
}

describe("cursor", function() {
    if (typeof window !== "undefined") {
        port = window.port;
    } else {
        port = require('./port.js');
        port = port.port;
    }

    before(function(done) {
		this.timeout(50000);
        db = arango.Connection("http://127.0.0.1:"+port);

        db.database.delete("newDatabase", function(err, ret) {
            db.database.create("newDatabase", function(err, ret) {
                db = db.use('/newDatabase');
                db.collection.create("newCollection", function(err, ret) {
                    var collection = ret;
                    db.document.create(collection.id, {
                        "key1": "val2",
                        "key2": "val3",
                        "key3": "val4"
                    }, null, function(err, ret, message) {
                        ret.error.should.equal(false);
                        db.document.create(collection.id, {
                            "key1": "val2",
                            "key5": "val3",
                            "key6": "val4"
                        }, null, function(err, ret, message) {
                            ret.error.should.equal(false);
                            db.document.create(collection.id, {
                                "key1": "val2",
                                "key5": "val3",
                                "key6": "val4"
                            }, null, function(err, ret, message) {
                                ret.error.should.equal(false);
                                done()
                            });
                        });
                    });
                });
            });
        });

    })

    it('should be able to validate a query', function(done) {
		this.timeout(50000);
        db.cursor.query({
            "query": "FOR p IN products FILTER p.name == @name LIMIT 2 RETURN p.n"
        }, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                message.status.should.equal(200);
            });
        });
    })
    it('should deny an invalid query', function(done) {
		this.timeout(50000);
        db.cursor.query({
            "query": "FOR p INE products FILTER p.name == @name LIMIT 2 RETURN p.n"
        }, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(true);
                message.status.should.equal(400);
            });
        });
    })
    it('should deny a valid query as the collection does not exists', function(done) {
		this.timeout(50000);
        db.cursor.explain({
            "query": "FOR p IN products FILTER p.name == 'ee' LIMIT 2 RETURN p.n"
        }, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(true);
                message.status.should.equal(404);
            });
        });
    })
    it('should deny an invalid query', function(done) {
		this.timeout(50000);
        db.cursor.explain({
            "query": "FOR p INE products FILTER p.name == @name LIMIT 2 RETURN p.n"
        }, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(true);
                message.status.should.equal(400);
            });
        });
    })
    it('should be able to validate a query', function(done) {
		this.timeout(50000);
        db.cursor.explain({
            "query": "FOR p IN newCollection FILTER LIKE(p.abcde , 'eee') RETURN p._id"
        }, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                message.status.should.equal(200);
            });
        });
    })


    it('creating a cursor with a bad query', function(done) {
		this.timeout(50000);
        var cursorData = {};
        cursorData.query = "FOR p IN products FILTER LIKE(p.abcde ,@name) RETURN p._id "
        cursorData.count = true;
        cursorData.bindVars = {};
        cursorData.bindVars.name = "%eee%";
        db.cursor.create(cursorData, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(true);
                message.status.should.equal(404);
            });
        });
    })
    it('creating a cursor with an empty query', function(done) {
		this.timeout(50000);
        var cursorData = {};
        cursorData.count = true;
        cursorData.bindVars = {};
        cursorData.bindVars.name = "%eee%";
        db.cursor.create(cursorData, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(true);
                message.status.should.equal(400);
            });
        });
    })
    it('creating a valid cursor using limit', function(done) {
		this.timeout(50000);
        var cursorData = {};
        cursorData.query = "FOR p IN newCollection FiLTER LIKE(p.key1 ,@name) LIMIT 1 RETURN p._id"
        cursorData.count = true;
        cursorData.options = {
            "fullCount": true
        };
        cursorData.bindVars = {};
        cursorData.bindVars.name = "%val2%";
        db.cursor.create(cursorData, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.hasMore.should.equal(false);
                ret.count.should.equal(1);
                ret.extra.fullCount.should.equal(3);
                message.status.should.equal(201);
            });
        });
    })

    it('creating a valid cursor with more results', function(done) {
		this.timeout(50000);
        var cursorData = {};
        cursorData.query = "FOR p IN newCollection FiLTER LIKE(p.key1 ,@name) RETURN p._id"
        cursorData.count = true;
        cursorData.bindVars = {};
        cursorData.batchSize = 1;
        cursorData.bindVars.name = "%val2%";
        db.cursor.create(cursorData, function(err, ret, message) {
            check(done, function() {
                cursor = ret;
                ret.error.should.equal(false);
                ret.hasMore.should.equal(true);
                message.status.should.equal(201);
            });
        });
    })

    it('using the current cursor we fetch more results', function(done) {
		this.timeout(50000);
        db.cursor.get(cursor.id, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.hasMore.should.equal(true);
                ret.count.should.equal(3);
                message.status.should.equal(200);
            });
        });
    })

    it('deleting the current cursor', function(done) {
		this.timeout(50000);
        db.cursor.delete(cursor.id, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                message.status.should.equal(202);
            });
        });
    })
    it('deleting the no longer existing cursor', function(done) {
		this.timeout(50000);
        db.cursor.delete(cursor.id, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(true);
                message.status.should.equal(404);
            });
        });
    })

    it('using the no longer existing cursor to fetch more results', function(done) {
		this.timeout(50000);
        db.cursor.get(cursor.id, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(true);
                message.status.should.equal(404);
            });
        });
    })

    it('using query module', function(done) {
		this.timeout(50000);
        var query = db.query.
        for ('u'). in ('@@collection').
        return ('u');
        query.exec({
            '@collection': 'newCollection'
        }, function(err, ret) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.code.should.equal(201);
            });
        });

    })

    it('using query module with plain query', function(done) {
		this.timeout(50000);
        db.query.exec("for u in newCollection return u", function(err, ret) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.code.should.equal(201);
            });
        });

    })

    it('using query module explain', function(done) {
		this.timeout(50000);
        var query = db.query.
        for ('u'). in ('@@collection').
        return ('u');
        query.explain({
            '@collection': 'newCollection'
        }, function(err, ret) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.code.should.equal(200);
            });
        });

    })

    it('using query module test', function(done) {
		this.timeout(50000);
        var query = db.query.
        for ('u'). in ('@@collection').
        return ('u');
        query.test({
            '@collection': 'newCollection'
        }, function(err, ret) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.code.should.equal(200);
            });
        });

    })



})
