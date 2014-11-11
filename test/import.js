var arango, db, role;

try {
    arango = Arango
} catch (e) {
    arango = require('..')
}


describe("import", function () {

    before(function (done) {
	
	db = arango.Connection("/_system");
	
	db.database.delete("newDatabase").end(function () {
	    db.database.create("newDatabase")
		.then(function (ret) {
		    db = db.use('/newDatabase');
		    db.collection.create("collection")
			.then(function (ret) {
			    db.admin.role().then(function (ret) {
				role = ret.role;
			    }).callback(done);
			});
		});
	});
    });

    describe("importFunctions", function () {

	beforeEach(function (done) {
	    db.collection.create("collection").end(function(){
		done();
	    });
	})

	afterEach(function (done) {
	    
	    db.collection.delete("collection").end( function () {
		db.collection.delete("newCollection").end(function () {
		    done();
		});
	    })
	})
	
	it('importJSONData with single JSON Object and waitForSync', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }
	    
	    var options = {
		"waitForSync": true,
		"details": true
	    };

	    var data = [
		{
		    "_key": "abc",
		    "value1": 25,
		    "value2": "test",
		    "allowed": true
		},
		{
		    "_key": "foo",
		    "name": "baz"
		},
		{
		    "name": {
			"detailed": "detailed name",
			"short": "short name"
		    }
		}
	    ];


	    db.import.importJSONData("collection", data, options)
		.then(function (ret, message) {
		    ret.error.should.equal(false);
		    ret.created.should.equal(3);
		    message.status.should.equal(201);
		}).callback(done);
	})
	
	it('importJSONData with single JSON Object into unknown collection', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }
	    

	    var options = {
		"waitForSync": true,
		"details": true
	    };

	    var data = [
		{
		    "_key": "abc",
		    "value1": 25,
		    "value2": "test",
		    "allowed": true
		},
		{
		    "_key": "abcd",
		    "name": "baz"
		},
		{
		    "name": {
			"detailed": "detailed name",
			"short": "short name"
		    }
		}
	    ];


	    db.import.importJSONData("newCollection", data, options)
	    .catch(function (err) {
		err.code.should.equal(404);
		done();
	    });
	})
	
	it('importJSONData with single JSON Object, with one error, we create the collection as well', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }

	    var options = {
		"waitForSync": true,
		"details": true,
		"createCollection": true
	    };

	    var data = [
		{
		    "_key": "abc",
		    "value1": 25,
		    "value2": "test",
		    "allowed": true
		},
		{
		    "_key": "abc",
		    "name": "baz"
		},
		{
		    "name": {
			"detailed": "detailed name",
			"short": "short name"
		    }
		}
	    ];


	    db.import.importJSONData("newCollection", data, options)
	    .then(function (ret, message) {
		ret.error.should.equal(false);
		ret.errors.should.equal(1);
		ret.created.should.equal(2);
		message.status.should.equal(201);
	    }).callback(done);
	})
	
	it('importJSONData with single JSON Object, without options', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }

	    
	    var data = [
		{
		    "_key": "abcuu",
		    "value1": 25,
		    "value2": "test",
		    "allowed": true
		},
		{
		    "_key": "abcuu",
		    "name": "baz"
		},
		{
		    "name": {
			"detailed": "detailed name",
			"short": "short name"
		    }
		}
	    ];


	    db.import.importJSONData("collection", data)
		.then(function (ret, message) {
		    ret.errors.should.equal(1);
		    ret.created.should.equal(2);
		    message.status.should.equal(201);
		}).callback(done);
	})
	
	it('importJSONData with single JSON Object, without options and with default collection', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }

	    
	    var data = [
		{
		    "_key": "abcww",
		    "value1": 25,
		    "value2": "test",
		    "allowed": true
		},
		{
		    "_key": "abcww",
		    "name": "baz"
		},
		{
		    "name": {
			"detailed": "detailed name",
			"short": "short name"
		    }
		}
	    ];
	    db = db.use('/newDatabase:collection');
	    db.import.importJSONData(data)
	    .then(function (ret, message) {
		ret.error.should.equal(false);
		ret.errors.should.equal(1);
		ret.created.should.equal(2);
		message.status.should.equal(201);
	    }).callback(done);
	})
	
	it('importJSONData with single JSON Object, with options and with default collection', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }

	    var options = {
		"waitForSync": true
	    };

	    var data = [
		{
		    "_key": "abcoo",
		    "value1": 25,
		    "value2": "test",
		    "allowed": true
		},
		{
		    "_key": "abcoo",
		    "name": "baz"
		},
		{
		    "name": {
			"detailed": "detailed name",
			"short": "short name"
		    }
		}
	    ];


	    db.import.importJSONData(data, options)
		.then(function (ret, message) {
		    ret.error.should.equal(false);
		    ret.errors.should.equal(1);
		    ret.created.should.equal(2);
		    message.status.should.equal(201);
		}).callback(done);
	})
	
	it('importJSONData with single JSON Object and complete. Provoke a unique constraint violation and expect a 409', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }

	    

	    var options = {
		"waitForSync": true,
		"details": true,
		"complete": true
	    };

	    var data = [
		{
		    "_key": "abc",
		    "value1": 25,
		    "value2": "test",
		    "allowed": true
		},
		{
		    "_key": "abc",
		    "name": "baz"
		},
		{
		    "name": {
			"detailed": "detailed name",
			"short": "short name"
		    }
		}
	    ];
	    db = db.use('/newDatabase');

	    db.import.importJSONData("collection", data, options)
		.catch(function (err) {
		    err.code.should.equal(409);
		    done();
		});
	})
	
	it('importValueList with single JSON Object and waitForSync', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }

	    

	    var options = {
		"waitForSync": true,
		"details": true
	    };

	    var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abc", 25, "test" ]\n[ "abcd", 253, "stest" ]';


	    db.import.importValueList("collection", data, options)
		.then(function (ret, message) {
		    ret.error.should.equal(false);
		    ret.created.should.equal(2);
		    ret.empty.should.equal(2);
		    message.status.should.equal(201);
		}).callback(done);
	})
	
	it('importValueList with single JSON Object into unknown collection', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }

	    

	    var options = {
		"waitForSync": true,
		"details": true
	    };

	    var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abc", 25, "test" ]\n[ "aabcd", 253, "stest" ]';


	    db.import.importValueList("newCollection", data, options)
	    .catch(function (err) {
		err.code.should.equal(404);
		done();
	    });
	})
	
	it('importValueList with single JSON Object, with one error, we create the collection as well', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }

	    

	    var options = {
		"waitForSync": true,
		"details": true,
		"createCollection": true
	    };

	    var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abcd", 25, "test" ]\n[ "abcd", 253, "stest" ]';


	    db.import.importValueList("newCollection", data, options)
	    .then(function (ret, message) {
		    ret.error.should.equal(false);
		    ret.errors.should.equal(1);
		    ret.created.should.equal(1);
		    message.status.should.equal(201);
	    }).callback(done);
	})
	
	it('importValueList with single JSON Object and complete. Provoke a unique constraint violation and expect a 409', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }

	    

	    var options = {
		"waitForSync": true,
		"details": true,
		"complete": true
	    };

	    var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abc", 25, "test" ]\n[ "abc", 253, "stest" ]';

	    db.import.importValueList("collection", data, options)
		.catch(function (err) {
		    err.code.should.equal(409);
		    done();
		});
	})
	
	it('importValueList with single JSON Object, without options', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }

	    
	    var options = {
		"waitForSync": true,
		"details": true
	    };

	    var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abcuu", 25, "test" ]\n[ "aabcdee", 253, "stest" ]';


	    db.import.importValueList("collection", data)
	    .then(function (ret, message) {
		ret.error.should.equal(false);
		ret.created.should.equal(2);
		message.status.should.equal(201);
	    }).callback(done);
	})

	/* FUBAR
	it('importValueList with single JSON Object, without options and with default collection', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }

	    
	    var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abczz", 25, "test" ]\n[ "aabcdww", 253, "stest" ]'
	    db = db.use('/newDatabase:collection');
	    db.import.importValueList(data)
	    .then(function (ret, message) {
		ret.error.should.equal(false);
		ret.created.should.equal(2);
		message.status.should.equal(201);
	    }).callback(done);
	})
	
	it('importValueList with single JSON Object, with options and with default collection', function (done) {
	    if (role !== "UNDEFINED") {
		done();
		return;
	    }

	    var options = {
		"waitForSync": true,
		"details": true
	    };

	    var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abctt", 25, "test" ]\n[ "aabcdqq", 253, "stest" ]'


	    db.import.importValueList(data, options)
		.then(function (ret, message) {
		    ret.error.should.equal(false);
		    ret.created.should.equal(2);
		    message.status.should.equal(201);
		}).callback(done);
	})
	 */
    })
})
