var arango;

try {
    arango = Arango
} catch (e) {
    arango = require('..')
}

describe("document", function () {
    
    var db = arango.Connection();
    var collection;
    var role;

    before(function (done) {
	
	db.database.delete("newDatabase").end(function () {
	    db.database.create("newDatabase").end(function () {
		db = db.use('/newDatabase');
		db.collection.create("newCollection").then(function (ret) {
		    collection = ret;
		}).callback(done);
	    });
	});
	
    });

    describe("documentFunctions", function () {
	var doc, doc_ids = [], doc_keys = [];
	
	before('create a document', function (done) {
	    
	    db.document.create(collection.id, {
		"key1": "val1",
		"key2": "val2",
		"key3": null
	    }).then( function(ret) {
		ret.error.should.equal(false);
		doc = ret;
		doc_ids.push(ret._id);
		doc_keys.push(ret._key);
		ret.code.should.equal(202);
	    }).callback(done);
	})
	
	it('create another document', function (done) {
	    
	    db.document.create(collection.id, {
		"key1": "val1",
		"key3": "val3"
	    }).then( function(ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(202);
		doc_ids.push(ret._id);
		doc_keys.push(ret._key);
	    }).callback(done);
	})
	
	it('create another document and the collection along with it', function (done) {
	    
	    var options = {};
	    options.createCollection = true;
	    options.waitForSync = true;
	    db.document.create("anotherCollection", {
		"key1": "val1",
		"key2": "val2"
	    }, options)
		.then(function (ret) {
		    ret.error.should.equal(false);
		    ret.code.should.equal(201);
		}).callback(done);
	})

	
	it('lets get a non existing document"', function (done) {
	    
	    db.document.get(doc._id + 200)
		.catch(function (err) {
		    err.code.should.equal(404);
		    done();
		});
	})
	
	it('lets get a document with "match" header == false and correct revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = doc._rev;
	    db.document.get(doc._id, options)
		.then(function (ret) {
		    ret.code.should.equal(304);
		}).callback(done);
	})
	
	it('lets get a document with "match" header == false and wrong revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = doc._rev + 1;
	    db.document.get(doc._id, options)
		.then(function (ret) {
		    ret.code.should.equal(200);
		}).callback(done);
	})
	
	it('lets get a document with "match" header and correct revision"', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = doc._rev;
	    db.document.get(doc._id, options)
		.then(function (ret) {
		    ret.code.should.equal(200);
		}).callback(done);
	})
	
	it('lets get a document with "match" header and wrong revision', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = doc._rev + 1;
	    db.document.get(doc._id, options)
		.catch(function(err){
		    err.code.should.equal(412);
		    done();
		});
	})
	
	it('lets get a non existing documents head"', function (done) {
	    
	    db.document.head(doc._id + 200)
		.then(undefined,function(err){
		    err.code.should.equal(404);
		}).callback(done);
	})
	
	it('lets get a documents head with "match" header == false and correct revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = doc._rev;
	    db.document.head(doc._id, options)
		.then(function(ret){
		    ret.code.should.equal(304);
		}).callback(done);
	})
	
	it('lets get a documents head with "match" header == false and wrong revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = doc._rev + 1;
	    db.document.head(doc._id, options)
		.then(function (ret) {
		    ret.code.should.equal(200);
		}).callback(done);
	})
	
	it('lets get a documents head with "match" header and correct revision"', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = doc._rev;
	    db.document.head(doc._id, options)
		.then(function(ret){
		    ret.code.should.equal(200);
		}).callback(done);
	})
	
	it('lets get a documents head with "match" header and wrong revision', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = doc._rev + 1;
	    db.document.head(doc._id, options)
		.catch(function (err) {
		    done();
		});
	})
	
	it('lets get the list of all documents of collection', function (done) {
	    
	    db.document.list(collection.id)
		.then(function (ret) {
		    ret.documents.length.should.equal(2);
		    ret.code.should.equal(200);
		}).callback(done);
	})

	it('get list of documents and specify return type of id',function (done) {

	    db.document.list(collection.id,{type:'id'})
		.then(function (ret) {
		    var ids = ret.documents.sort();
		    ids.should.eql(doc_ids.sort());
		}).callback(done);
	})

	it('get list of documents and specify return type of key',function (done) {

	    db.document.list(collection.id,{type:'key'})
		.then(function (ret) {
		    var keys = ret.documents.sort();
		    keys.should.eql(doc_keys.sort());
		}).callback(done);
	})
	
	it('lets patch a non existing document"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    db.document.patch(doc._id + 200, data)
		.catch(function (err) {
		    done();
		});
	})
	
	it('lets patch a document with "match" header == false and wrong revision"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = false;
	    options.rev = doc._rev + 1;
	    db.document.patch(doc._id, data, options)
		.then(function (ret) {
		    doc._rev = ret._rev;
		    ret.code.should.equal(202);
		}).callback(done);
	})
	
	it('lets patch a document with "match" header and correct revision using waitForSync param', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = doc._rev;
	    db.document.patch(doc._id, data, options)
		.then(function (ret) {
		    doc._rev = ret._rev;
		    ret.code.should.equal(201);
		}).callback(done);
	})
	
	it('lets patch a document with "match" header and wrong revision', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.rev = doc._rev + 1;
	    db.document.patch(doc._id, data, options)
		.catch(function (err) {
		    err.code.should.equal(412);
		    done();
		});
	})
	
	it('lets patch a document with "match" header and wrong revision but forceUpdate flag. And we do not keep null values', function (done) {
	    
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
	    db.document.patch(doc._id, data, options)
		.then(function (ret) {
		    ret.code.should.equal(201);
		}).callback(done);
	})
	
	it('lets verify the last patch', function (done) {
	    
	    db.document.get(doc._id)
		.then(function (ret) {
		    ret.should.not.have.property("key3");
		    ret.should.have.property("newKey");
		}).callback(done);
	})

	it('lets put a non existing document"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    db.document.put(doc._id + 200, data)
		.catch(function (err) {
		    err.code.should.equal(404);
		    done();
		});
	});
	
	it('lets put a document with "match" header == false and wrong revision"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = false;
	    options.rev = doc._rev + 1;
	    db.document.put(doc._id, data, options).then(function(ret){
		ret._id.should.equal(doc._id);
		ret._rev.should.not.equal(doc._rev);
		doc._rev = ret._rev;
	    }).callback(done);
	})

	it('lets put a document with "match" header and correct revision and the waitForSync param', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = doc._rev;
	    db.document.put(doc._id, data, options).callback(done);
	})
	
	it('lets put a document with "match" header and wrong revision', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.rev = doc._rev + 1;
	    db.document.put(doc._id, data, options)
		.catch(function (err) {
		    done();
		});
	})
	
	it('lets put a document with "match" header and wrong revision but forceUpdate flag.', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.rev = doc._rev + 1;
	    options.forceUpdate = true;
	    db.document.put(doc._id, data, options)
		.then(function (ret) {
		    ret.code.should.equal(202);
		}).callback(done);
	})
	
	it('lets verify the last put', function (done) {
	    
	    db.document.get(doc._id)
		.then(function (ret) {
		    ret.should.not.have.property("key3");
		    ret.should.not.have.property("key2");
		    ret.should.not.have.property("key1");
		    ret.should.have.property("newKey");
		}).callback(done);
	})

	it('lets delete a non existing document"', function (done) {
	    
	    db.document.delete(doc._id + 200)
		.catch(function (err) {
		    err.code.should.equal(404);
		    done();
		});
	})
	
	it('lets delete a document with "match" header and wrong revision', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = doc._rev + 1;
	    db.document.delete(doc._id, options)
		.catch(function (err) {
		    err.code.should.equal(412);
		    done();
		});
	})
	
	it('lets delete a document with "match" header == false and wrong revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = doc._rev + 1;
	    db.document.delete(doc._id, options)
		.then(function (ret) {
		    doc._rev = ret._rev;
		    ret.code.should.equal(202);
		}).callback(done);
	})
	
	it('create a document', function (done) {
	    
	    db.document.create(collection.id, {
		"key1": "val1",
		"key2": "val2",
		"key3": null
	    }).then(function (ret) {
		ret.error.should.equal(false);
		doc = ret;
		ret.code.should.equal(202);
	    }).callback(done);
	})
	
	it('lets delete a document with "match" header and correct revision and setting the waitForSync param', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = doc._rev;
	    db.document.delete(doc._id, options)
		.then(function (ret) {
		    doc._rev = ret._rev;
		    ret.code.should.equal(200);
		}).callback(done);
	})

    })

})
