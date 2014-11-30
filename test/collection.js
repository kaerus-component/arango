var arango, db, checksum, role;

try {
    arango = Arango
} catch (e) {
    arango = require('..')
}

describe("collections", function () {
    
    var db = arango.Connection();

    describe("create", function () {
	var collection = "test1",
	    options = {
		journalSize: 12345678,
		waitForSync: true,
		keyOptions: {
		    type: 'autoincrement',
		    offset: 0,
		    increment: 5,
		    allowUserKeys: true
		}
	    };

	before(function (done) {
	    
	    db.admin.role().then(function (ret) {
		role = ret.role;
	    }).callback(done);
	})

	beforeEach(function (done) {
	    db.collection.delete(collection).end(function(){
		done();
	    });
	})

	it('should be able to create a collection by name', function (done) {
	    
	    db.collection.create(collection)
		.then(function (ret) {
		    ret.isSystem.should.eql(false);
		    ret.status.should.eql(3);
		    ret.type.should.eql(2);
		    ret.isVolatile.should.eql(false);
		    ret.error.should.eql(false);
		}).callback(done);
	})

	it('should be able to pass options and getProperties', function (done) {
	    
	    db.collection.create(collection, options)
		.then(function (ret) {
		    ret.waitForSync.should.eql(options.waitForSync);
		    
		    return ret.id;
		}).then(function(id){
		    return db.collection.getProperties(id)
			.then(function (ret) {
			    /* note: rounded to KB */
			    (ret.journalSize >> 10).should.equal(options.journalSize >> 10);
			    ret.keyOptions.should.eql(options.keyOptions);
			});
		}).callback(done);
	})
    })

    describe("collection Functions", function () {

	before(function (done) {
	    
	    db.database.delete("newDatabase").end(function() {
		db.database.create("newDatabase")
		    .then(function () {
			db = db.use('/newDatabase');
		    }).callback(done);
	    });
	})

	it('should be able to create a collection by name', function (done) {
	    
	    var options = {
		journalSize: 12345678,
		waitForSync: true,
		keyOptions: {
		    offset: 0,
		    increment: 5,
		    allowUserKeys: true
		}
	    };
	    
	    db.collection.create("newCollection", options)
		.then(function (ret, message) {
		    ret.isSystem.should.equal(false);
		    ret.status.should.equal(3);
		    ret.type.should.equal(2);
		    ret.isVolatile.should.equal(false);
		    ret.error.should.equal(false);
		    message.status.should.equal(200);
		}).callback(done);
	})
	
	it('should be able to create another collection by name', function (done) {
	    
	    db.collection.create("newCollection2")
		.then(function (ret, message) {
		    ret.isSystem.should.equal(false);
		    ret.status.should.equal(3);
		    ret.type.should.equal(2);
		    ret.isVolatile.should.equal(false);
		    ret.error.should.equal(false);
		    message.status.should.equal(200);
		}).callback(done);
	})

	it('list all collections including system', function (done) {		
	    db.collection.list().callback(done);
	})
	
	it('list all collections excluding system', function (done) {
	    
	    db.collection.list(true)
		.then(function (ret, message) {
		    ret.collections.length.should.equal(2);
		    message.status.should.equal(200);
		}).callback(done);
	})

	it('list all collections excluding system using options', function (done) {
	    
	    db.collection.list({excludeSystem: true})
		.then(function (ret, message) {
		    ret.collections.length.should.equal(2);
		    message.status.should.equal(200);
		}).callback(done);
	})

	it('get collection', function (done) {
	    
	    db.collection.get("newCollection2")
		.then(function (ret, message) {
		    ret.type.should.equal(2);
		    message.status.should.equal(200);
		}).callback(done);
	})
	
	it('get non existing collection', function (done) {
	    
	    db.collection.get("nonExistingCollection2")
		.catch(function (err) {
		    err.code.should.equal(404);
		    done();
		});
	})
	
	it('delete collection', function (done) {
	    
	    db.collection.delete("newCollection2").callback(done);
	    
	})
	
	it('delete non existing collection', function (done) {
	    
	    db.collection.delete("nonExistingCollection2")
		.catch(function (err) {
		    err.code.should.equal(404);
		    done();
		});
	})

	it('truncate collection', function (done) {
	    
	    db.collection.truncate("newCollection").callback(done);
	})
	
	it('truncate non existing collection', function (done) {
	    
	    db.collection.truncate("nonExistingCollection2")
		.catch(function (err) {
		    err.code.should.equal(404);
		    done();
		});
	})

	it('count documents in collection', function (done) {
	    
	    db.collection.count("newCollection")
		.then(function (ret, message) {
		    ret.error.should.equal(false);
		    ret.count.should.equal(0);
		    message.status.should.equal(200);
		}).callback(done);
	    
	})
	
	it('count documents in non existing collection', function (done) {
	    
	    db.collection.count("nonExistingCollection2")
		.catch(function (err) {
		    err.code.should.equal(404);
		    done();
		});
	})

	it('get figures of collection', function (done) {
	    
	    db.collection.figures("newCollection")
		.then(function (ret, message) {
		    ret.count.should.equal(0);
		    ret.should.have.property("figures");
		    ret.error.should.equal(false);
		    message.status.should.equal(200);
		}).callback(done);
	})
	
	it('get figures of non existing collection', function (done) {
	    
	    db.collection.figures("nonExistingCollection2")
		.catch(function (err) {
		    err.code.should.equal(404);
		    done();
		});
	    
	})
	
	it('load collection', function (done) {
	    
	    db.collection.load("newCollection")
		.then(function (ret, message) {
		    ret.should.have.property("count");
		    message.status.should.equal(200);
		}).callback(done);
	})
	
	it('load collection with count = false', function (done) {
	    
	    db.collection.load("newCollection", false)
		.then(function (ret, message) {
		    ret.should.not.have.property("count");
		    message.status.should.equal(200);
		}).callback(done);
	})
	
	it('load non existing collection', function (done) {
	    
	    db.collection.load("nonExistingCollection2")
		.catch(function (err) {
		    err.code.should.equal(404);
		    done();
		});
	})

	it('unload collection', function (done) {
	    
	    db.collection.unload("newCollection").callback(done);
	})
	
	it('unload non existing collection', function (done) {
	    
	    db.collection.unload("nonExistingCollection2")
		.catch(function (err) {
		    err.code.should.equal(404);
		    done();
		});
	})
	
	if (role === "UNDEFINED") {
	    it('rename of collection', function (done) {
		
		db.collection.rename("newCollection", "newCollectionName")
		    .callback(done);
	    })
	    
	    it('rename of non existing collection', function (done) {
		
		db.collection.rename("nonExistingCollection2", "newCollectionName")
		    .catch(function (err) {
			err.code.should.equal(404);
			done();
		    });
	    })
	    
	    it('getProperties of collection', function (done) {
		
		db.collection.getProperties("newCollectionName")
		    .then(function (ret, message) {
			ret.keyOptions.allowUserKeys.should.equal(true);
			message.status.should.equal(200);
		    }).callback(done);
	    })
	    
	    it('getProperties of non existing collection', function (done) {
		
		db.collection.getProperties("nonExistingCollection2")
		    .catch(function (err) {
			err.code.should.equal(404);
			done();
		    });
	    })
	    
	    it('setProperties of collection', function (done) {
		
		db.collection.setProperties("newCollectionName", {}).callback(done);
	    })
	    
	    it('setProperties of non existing collection', function (done) {
		
		db.collection.setProperties("nonExistingCollection2", {})
		    .catch(function (err) {
			err.code.should.equal(404);
			done();
		    });
	    })
	    
	    it('revision of collection', function (done) {
		
		db.collection.revision("newCollectionName")
		    .then(function (ret, message) {
			ret.should.have.property("revision");
			message.status.should.equal(200);
		    }).callback(done);
	    })
	    
	    it('revision of non existing collection', function (done) {
		
		db.collection.revision("nonExistingCollection2")
		    .catch(function (err) {
			err.code.should.equal(404);
			done();
		    });
	    })
	    
	    it('create a document so we have a proper checksum', function (done) {
		
		db.document.create("newCollectionName", {
		    "key1": "val1",
		    "key2": "val2",
		    "key3": null
		}).callback(done);
	    })

	    it('checksum of collection', function (done) {
		
		db.collection.checksum("newCollectionName")
		    .then(function (ret, message) {
			ret.should.have.property("checksum");
			checksum = ret.checksum;
			ret.error.should.equal(false);
			message.status.should.equal(200);
		    }).callback(done);
	    })
	    
	    it('checksum of collection with data and revision used for calculation', function (done) {
		
		db.collection.checksum("newCollectionName", {
		    withRevisions: true,
		    withData: true
		}).then(function (ret, message) {
		    ret.should.have.property("checksum");
		    ret.checksum.should.not.equal(checksum);
		    message.status.should.equal(200);
		}).callback(done);
	    })
	    
	    it('checksum of non existing collection', function (done) {
		
		db.collection.checksum("nonExistingCollection2")
		    .catch(function (err) {
			err.code.should.equal(404);
			done();
		    });
	    })
	}
    })

    if (role === "COORDINATOR") {
	describe("Cluster collection Functions", function () {

	    var options = {
		journalSize: 12345678,
		waitForSync: true,
		numberOfShards: 2,
		shardKeys: ["_key1", "_key2"],
		keyOptions: {
		    type: "autoincrement",
		    offset: 0,
		    increment: 5,
		    allowUserKeys: true
		}
	    };
	    
	    it('should be able to create a cluster collection by name', function (done) {
		
		db.collection.create("clusterCollection", options)
		    .then(function (ret) {
			return ret.id;
		    })
		    .then(db.collection.getProperties)
		    .then(function(prop) {
			/* note: rounded to KB */
			(prop.journalSize >> 10).should.equal(options.journalSize >> 10);
			prop.keyOptions.should.eql(options.keyOptions);
			prop.numberOfShards.shoudl.eql(options.numberOfShards);
			prop.shardKeys.shoudl.eql(options.shardKeys);
		    }).callback(done);
	    });
	});
    }

    /* (andelo) note: sometimes gets timed out, need to check why that happens
     it('lets check that rotation of WAL content is not possible', function (done) {
     
     db.collection.rotate(collection.id)
     .catch(function (err) {
     err.code.should.equal(400);
     done();
     });
     })
     */

    
});

