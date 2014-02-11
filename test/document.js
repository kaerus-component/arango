var arango, db, collection, doc;
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

describe("document", function() {
    if (typeof window !== "undefined") {
        port = window.port;
    } else {
        port = require('./port.js');
        port = port.port;
    }


    db = arango.Connection("http://127.0.0.1:"+port);

    before(function(done) {
        this.timeout(30000);
        db.database.delete("newDatabase", function(err, ret) {
            db.database.create("newDatabase", function(err, ret) {
                db = db.use('/newDatabase');
                db.collection.create("newCollection", function(err, ret) {
                    collection = ret;
                    done()
                });
            });
        });

    })

    describe("documentFunctions", function() {

        it('create a document', function(done) {
            db.document.create(collection.id, {
                "key1": "val1",
                "key2": "val2",
                "key3": null
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    doc = ret;
                    message.status.should.equal(202);
                });
            });
        })
        it('create another document', function(done) {
            db.document.create(collection.id, {
                "key1": "val1",
                "key3": "val3"
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(202);
                });
            });
        })
        it('create another document and the collection along with it', function(done) {
            var options = {};
            options.createCollection = true;
            options.waitForSync = true;
            db.document.create("anotherCollection", {
                "key1": "val1",
                "key2": "val2"
            }, options, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(201);
                });
            });
        })
        it('lets rotate the journal of "newCollection"', function(done) {
            db.collection.rotate(collection.id, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('lets get a non existing document"', function(done) {
            db.document.get(doc._id + 200, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(true);
                    message.status.should.equal(404);
                });
            });
        })
        it('lets get a document with "match" header == false and correct revision"', function(done) {
            var options = {};
            options.match = false;
            options.rev = doc._rev;
            db.document.get(doc._id, options, function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(304);
                });
            });
        })
        it('lets get a document with "match" header == false and wrong revision"', function(done) {
            var options = {};
            options.match = false;
            options.rev = doc._rev + 1;
            db.document.get(doc._id, options, function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(200);
                });
            });
        })
        it('lets get a document with "match" header and correct revision"', function(done) {
            var options = {};
            options.match = true;
            options.rev = doc._rev;
            db.document.get(doc._id, options, function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(200);
                });
            });
        })
        it('lets get a document with "match" header and wrong revision', function(done) {
            var options = {};
            options.match = true;
            options.rev = doc._rev + 1;
            db.document.get(doc._id, options, function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(412);
                });
            });
        })
        it('lets get a non existing documents head"', function(done) {
            db.document.head(doc._id + 200, function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(404);
                });
            });
        })
        it('lets get a documents head with "match" header == false and correct revision"', function(done) {
            var options = {};
            options.match = false;
            options.rev = doc._rev;
            db.document.head(doc._id, options, function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(304);
                });
            });
        })
        it('lets get a documents head with "match" header == false and wrong revision"', function(done) {
            var options = {};
            options.match = false;
            options.rev = doc._rev + 1;
            db.document.head(doc._id, options, function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(200);
                });
            });
        })
        it('lets get a documents head with "match" header and correct revision"', function(done) {
            var options = {};
            options.match = true;
            options.rev = doc._rev;
            db.document.head(doc._id, options, function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(200);
                });
            });
        })
        it('lets get a documents head with "match" header and wrong revision', function(done) {
            var options = {};
            options.match = true;
            options.rev = doc._rev + 1;
            db.document.head(doc._id, options, function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(412);
                });
            });
        })
        it('lets get the list of all documents of collection', function(done) {
            db.document.list(collection.id, function(err, ret, message) {
                check(done, function() {
                    ret.documents.length.should.equal(2);
                    message.status.should.equal(200);
                });
            });
        })

        it('lets patch a non existing document"', function(done) {
            var data = {
                "newKey": "newValue"
            };
            db.document.patch(doc._id + 200, data, null, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(true);
                    message.status.should.equal(404);
                });
            });
        })
        it('lets patch a document with "match" header == false and wrong revision"', function(done) {
            var data = {
                "newKey": "newValue"
            };
            var options = {};
            options.match = false;
            options.rev = doc._rev + 1;
            db.document.patch(doc._id, data, options, function(err, ret, message) {
                check(done, function() {
                    doc._rev = ret._rev;
                    message.status.should.equal(202);
                });
            });
        })
        it('lets patch a document with "match" header and correct revision and the waitForSync param"', function(done) {
            var data = {
                "newKey": "newValue"
            };
            var options = {};
            options.match = true;
            options.waitForSync = true;
            options.rev = doc._rev;
            db.document.patch(doc._id, data, options, function(err, ret, message) {
                check(done, function() {
                    doc._rev = ret._rev;
                    message.status.should.equal(201);
                });
            });
        })
        it('lets patch a document with "match" header and wrong revision', function(done) {
            var data = {
                "newKey": "newValue"
            };
            var options = {};
            options.match = true;
            options.rev = doc._rev + 1;
            db.document.patch(doc._id, data, options, function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(412);
                });
            });
        })
        it('lets patch a document with "match" header and wrong revision but forceUpdate flag. And we do not keep null values', function(done) {
            this.timeout(20000)
            var data = {
                "newKey": "newValue",
                "key3": null
            };
            var options = {};
            options.match = true;
            options.rev = doc._rev + 1;
            options.forceUpdate = true;

            options.waitForSync = true;
            options.keepNull = "false";
            db.document.patch(doc._id, data, options, function(err, ret, message) {
                check(done, function() {

                    message.status.should.equal(201);
                });
            });
        })

        it('lets verify the last patch', function(done) {
            db.document.get(doc._id, function(err, ret, message) {
                check(done, function() {
                    ret.should.not.have.property("key3");
                    ret.should.have.property("newKey");
                });
            });
        })

        it('lets put a non existing document"', function(done) {
            var data = {
                "newKey": "newValue"
            };
            db.document.put(doc._id + 200, data, null, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(true);
                    message.status.should.equal(404);
                });
            });
        })
        it('lets put a document with "match" header == false and wrong revision"', function(done) {
            var data = {
                "newKey": "newValue"
            };
            var options = {};
            options.match = false;
            options.rev = doc._rev + 1;
            db.document.put(doc._id, data, options, function(err, ret, message) {
                check(done, function() {
                    doc._rev = ret._rev;
                    message.status.should.equal(202);
                });
            });
        })
        it('lets put a document with "match" header and correct revision and the waitForSync param"', function(done) {
            var data = {
                "newKey": "newValue"
            };
            var options = {};
            options.match = true;
            options.waitForSync = true;
            options.rev = doc._rev;
            db.document.put(doc._id, data, options, function(err, ret, message) {
                check(done, function() {
                    doc._rev = ret._rev;
                    message.status.should.equal(201);
                });
            });
        })
        it('lets put a document with "match" header and wrong revision', function(done) {
            var data = {
                "newKey": "newValue"
            };
            var options = {};
            options.match = true;
            options.rev = doc._rev + 1;
            db.document.put(doc._id, data, options, function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(412);
                });
            });
        })
        it('lets put a document with "match" header and wrong revision but forceUpdate flag.', function(done) {
            var data = {
                "newKey": "newValue"
            };
            var options = {};
            options.match = true;
            options.rev = doc._rev + 1;
            options.forceUpdate = true;
            db.document.put(doc._id, data, options, function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(202);

                });
            });
        })
        it('lets verify the last put', function(done) {
            db.document.get(doc._id, function(err, ret, message) {
                check(done, function() {
                    ret.should.not.have.property("key3");
                    ret.should.not.have.property("key2");
                    ret.should.not.have.property("key1");
                    ret.should.have.property("newKey");
                });
            });
        })

        it('lets delete a non existing document"', function(done) {
            db.document.delete(doc._id + 200, null, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(true);
                    message.status.should.equal(404);
                });
            });
        })
        it('lets delete a document with "match" header and wrong revision', function(done) {
            var options = {};
            options.match = true;
            options.rev = doc._rev + 1;
            db.document.delete(doc._id, options, function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(412);
                });
            });
        })

        it('lets delete a document with "match" header == false and wrong revision"', function(done) {
            var options = {};
            options.match = false;
            options.rev = doc._rev + 1;
            db.document.delete(doc._id, options, function(err, ret, message) {
                check(done, function() {
                    doc._rev = ret._rev;
                    message.status.should.equal(202);
                });
            });
        })
        it('create a document', function(done) {
            db.document.create(collection.id, {
                "key1": "val1",
                "key2": "val2",
                "key3": null
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    doc = ret;
                    message.status.should.equal(202);
                });
            });
        })
        it('lets delete a document with "match" header and correct revision and the waitForSync param"', function(done) {
            var options = {};
            options.match = true;
            options.waitForSync = true;
            options.rev = doc._rev;
            db.document.delete(doc._id, options, function(err, ret, message) {
                check(done, function() {
                    doc._rev = ret._rev;
                    message.status.should.equal(200);
                });
            });
        })

    })

})
