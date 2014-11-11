var arango;

try {
    arango = Arango
} catch (e) {
    arango = require('..')
}

var verticeDocs = [
    {
	"key1": "val2",
	"key2": "val3",
	"key3": null
    },
    ,{
	"key1": "val2",
	"key2": "val3",
	"key3": "val4"
    },
    {
	"key4": "val2",
	"key5": "val3",
	"key6": "val4"
    }
];

function newVertices(db,collection){
    var results = [];
    
    verticeDocs.forEach(function(doc){
	results.push(db.document.create(collection.id,doc));
    });
    
    return results;
}


describe("edge", function () {
    var db, verticescollection, edgecollection, role, vertices = [];
    
    before(function (done) {
	db = new arango.Connection();
	
	db.database.delete("newDatabase").end(function() {

	    db.database.create("newDatabase")
		.then(function () {
		    db = db.use('/newDatabase');
		    db.collection.create("edgeCollection", {
			"type": 3
		    }).then(function(ret) {
			edgecollection = ret;
			db.collection.create("verticescollection")
			    .then(function (col) {
				db.Promise().fulfill("create vertices")
				    .join(newVertices(db,col))
				    .then(function(v){
					v.shift();
					vertices = v;
				    }).callback(done);
			    });
		    });
		});
	});
	
	describe('edges',function(){
	    var edge;
	    
	    before(function (done) {
		
		db.edge.create(edgecollection.id, vertices[0]._id, vertices[1]._id, {
		    "key1": "val1",
		    "key2": "val2",
		    "key3": null
		}).then(function (ret, message) {
		    ret.error.should.equal(false);
		    edge = ret;
		    message.status.should.equal(202);
		}).callback(done);
	    })
	    
	    it('create another edge', function (done) {

		db.edge.create(edgecollection.id, vertices[1]._id, vertices[2]._id, {
		    "key1": "val1",
		    "key3": "val3"
		}).then( function (ret, message) {
		    ret.error.should.equal(false);
		    message.status.should.equal(202);
		}).callback(done);
	    })
	    
	    // these tests are convoluted
	    it('create another edge', function (done) {
		db.admin.role()
		    .then(function (ret, message) {
			role = ret.role;
			if (role === "UNDEFINED") {
			    it('create another edge and the collection along with it', function (done) {
				
				var options = {};
				options.createCollection = true;
				options.waitForSync = true;
				db.edge.create("anotherCollection", vertices[0]._id, vertices[1]._id, {
				    "key1": "val1",
				    "key2": "val2"
				}, options)
				    .then(function (ret, message) {
					ret.error.should.equal(false);
					message.status.should.equal(201);
				    }).callback(done);
			    });
			}
		    })
	    })

	    it('lets get a non existing edge"', function (done) {

		db.edge.get(edge._id + 200)
		    .catch(function (err) {
			err.code.should.equal(404);
		    });
	    })

	    it('lets get a edge with "match" header == false and correct revision"', function (done) {

		var options = {};
		options.match = false;
		options.rev = edge._rev;
		db.edge.get(edge._id, options)
		    .then(function (ret, message) {
			message.status.should.equal(304);
		    }).callback(done);
	    })

	    it('lets get a edge with "match" header == false and wrong revision"', function (done) {

		var options = {};
		options.match = false;
		options.rev = edge._rev + 1;
		db.edge.get(edge._id, options).callback(done);
	    })

	    it('lets get a edge with "match" header and correct revision"', function (done) {

		var options = {};
		options.match = true;
		options.rev = edge._rev;
		db.edge.get(edge._id, options).callback(done);
		
	    })
	    it('lets get a edge with "match" header and wrong revision', function (done) {

		var options = {};
		options.match = true;
		options.rev = edge._rev + 1;
		db.edge.get(edge._id, options)
		    .catch(function (err) {
			done();
		    });
	    })

	    it('lets get a non existing edges head"', function (done) {

		db.edge.head(edge._id + 200)
		    .catch(function (err) {
			done();
		    });
	    })

	    it('lets get a edges head with "match" header == false and correct revision"', function (done) {

		var options = {};
		options.match = false;
		options.rev = edge._rev;
		db.edge.head(edge._id, options).callback(done);
	    })

	    it('lets get a edges head with "match" header == false and wrong revision"', function (done) {

		var options = {};
		options.match = false;
		options.rev = edge._rev + 1;
		db.edge.head(edge._id, options).callback(done);
	    })

	    it('lets get a edges head with "match" header and correct revision"', function (done) {

		var options = {};
		options.match = true;
		options.rev = edge._rev;
		db.edge.head(edge._id, options).callback(done);
	    })

	    it('lets get a edges head with "match" header and wrong revision', function (done) {

		var options = {};
		options.match = true;
		options.rev = edge._rev + 1;
		db.edge.head(edge._id, options)
		    .catch(function(err){
			done();
		    })
	    })

	    it('lets get the list of all edges of collection ending in vertices[1], should be 1', function (done) {

		db.edge.list(edgecollection.id, vertices[1]._id, "in")
		    .then(function (ret, message) {
			ret.edges.length.should.equal(1);
			message.status.should.equal(200);
		    }).callback(done);
	    })

	    it('lets get the list of all edges of collection starting in vertices[1], should be 1', function (done) {

		db.edge.list(edgecollection.id, vertices[1]._id, "out")
		    .then(function (ret, message) {
			ret.edges.length.should.equal(1);
			message.status.should.equal(200);
		    }).callback(done);
	    })

	    it('lets get the list of all edges of collection, starting or ending in vertices[1] should be 2', function (done) {

		db.edge.list(edgecollection.id, vertices[1]._id, "any")
		    .then(function (ret, message) {
			ret.edges.length.should.equal(2);
			message.status.should.equal(200);
		    }).callback(done);
	    })


	    it('lets get the list again with default direction', function (done) {

		db.edge.list(edgecollection.id, vertices[1]._id)
		    .then(function (ret, message) {
			ret.edges.length.should.equal(2);
			message.status.should.equal(200);
		    });
	    })

	    it('lets get the list again with default collection', function (done) {
		
		db = db.use('/newDatabase:' + edgecollection.id);
		db.edge.list(vertices[1]._id, "any")
		    .then(function (ret, message) {
			ret.edges.length.should.equal(2);
			message.status.should.equal(200);
		    });
	    })

	    it('lets get the list again with default collection and direction', function (done) {

		db.edge.list(vertices[1]._id)
		    .then(function (ret, message) {
			ret.edges.length.should.equal(2);
			message.status.should.equal(200);
		    }).callback(done);
	    })


	    it('lets patch a non existing edge"', function (done) {
		
		db = db.use('/newDatabase');
		var data = {
		    "newKey": "newValue"
		};
		db.edge.patch(edge._id + 200, data)
		    .then(function (ret, message) {
			ret.error.should.equal(true);
			message.status.should.equal(404);
		    }).callback(done);
	    })

	    it('lets patch a edge with "match" header == false and wrong revision"', function (done) {

		var data = {
		    "newKey": "newValue"
		};
		var options = {};
		options.match = false;
		options.rev = edge._rev + 1;
		db.edge.patch(edge._id, data, options)
		    .then(function (ret, message) {
			edge._rev = ret._rev;
			message.status.should.equal(202);
		    }).callback(done);
	    })

	    it('lets patch a edge with "match" header and correct revision and the waitForSync param"', function (done) {

		var data = {
		    "newKey": "newValue"
		};
		var options = {};
		options.match = true;
		options.waitForSync = true;
		options.rev = edge._rev;
		db.edge.patch(edge._id, data, options)
		    .then(function (ret, message) {
			edge._rev = ret._rev;
			message.status.should.equal(201);
		    }).callback(done);
	    })

	    it('lets patch a edge with "match" header and wrong revision', function (done) {

		var data = {
		    "newKey": "newValue"
		};
		var options = {};
		options.match = true;
		options.rev = edge._rev + 1;
		db.edge.patch(edge._id, data, options)
		    .catch(function (err) {
			done();
		    });
	    })

	    it('lets patch a edge with "match" header and wrong revision but forceUpdate flag. And we do not keep null values', function (done) {

		var data = {
		    "newKey": "newValue",
		    "key3": null
		};
		var options = {};
		options.match = true;
		options.rev = edge._rev + 1;
		options.forceUpdate = true;
		options.waitForSync = true;
		options.keepNull = "false";
		db.edge.patch(edge._id, data, options)
		    .then(function (ret, message) {
			message.status.should.equal(201);
		    }).callback(done);
	    })

	    it('lets verify the last patch', function (done) {

		db.edge.get(edge._id)
		    .then(function (ret, message) {
			ret.should.not.have.property("key3");
			ret.should.have.property("newKey");
		    }).callback(done);
	    })

	    it('lets put a non existing edge"', function (done) {

		var data = {
		    "newKey": "newValue"
		};
		db.edge.put(edge._id + 200, data)
		    .catch(function (err) {
			err.code.should.equal(404);
			done();
		    });
	    })

	    it('lets put a edge with "match" header == false and wrong revision"', function (done) {

		var data = {
		    "newKey": "newValue"
		};
		var options = {};
		options.match = false;
		options.rev = edge._rev + 1;
		db.edge.put(edge._id, data, options)
		    .then(function (ret, message) {
			edge._rev = ret._rev;
			message.status.should.equal(202);
		    }).callback(done);
	    })

	    it('lets put a edge with "match" header and correct revision and the waitForSync param"', function (done) {

		var data = {
		    "newKey": "newValue"
		};
		var options = {};
		options.match = true;
		options.waitForSync = true;
		options.rev = edge._rev;
		db.edge.put(edge._id, data, options)
		    .then(function (ret, message) {
			edge._rev = ret._rev;
			message.status.should.equal(201);
		    }).callback(done);
	    })

	    it('lets put a edge with "match" header and wrong revision', function (done) {

		var data = {
		    "newKey": "newValue"
		};
		var options = {};
		options.match = true;
		options.rev = edge._rev + 1;
		db.edge.put(edge._id, data, options)
		    .catch(function (err) {
			err.code.should.equal(412);
			done();
		    });
	    })

	    it('lets put a edge with "match" header and wrong revision but forceUpdate flag.', function (done) {

		var data = {
		    "newKey": "newValue"
		};
		var options = {};
		options.match = true;
		options.rev = edge._rev + 1;
		options.forceUpdate = true;
		db.edge.put(edge._id, data, options)
		    .then(function (ret, message) {
			message.status.should.equal(202);

		    }).callback(done);

	    })

	    it('lets verify the last put', function (done) {

		db.edge.get(edge._id)
		    .then(function (ret, message) {
			ret.should.not.have.property("key3");
			ret.should.not.have.property("key2");
			ret.should.not.have.property("key1");
			ret.should.have.property("newKey");
		    }).callback(done);
	    })

	    it('lets delete a non existing edge"', function (done) {

		db.edge.delete(edge._id + 200)
		    .catch(function (err) {
			err.code.should.equal(404);
			done();
		    });
	    })

	    it('lets delete a edge with "match" header and wrong revision', function (done) {

		var options = {};
		options.match = true;
		options.rev = edge._rev + 1;
		db.edge.delete(edge._id, options)
		    .then(function (err) {
			err.code.should.equal(412);
			done();
		    });
	    })

	    it('lets delete a edge with "match" header == false and wrong revision"', function (done) {

		var options = {};
		options.match = false;
		options.rev = edge._rev + 1;
		db.edge.delete(edge._id, options)
		    .then(function (ret, message) {
			edge._rev = ret._rev;
			message.status.should.equal(202);
		    }).callback(done);
	    })

	    it('create a edge', function (done) {

		db.edge.create(edgecollection.id, vertices[0]._id, vertices[1]._id, {
		    "key1": "val1",
		    "key2": "val2",
		    "key3": null
		}).then( function (ret, message) {
		    ret.error.should.equal(false);
		    edge = ret;
		    message.status.should.equal(202);
		}).callback(done);
	    })

	    it('lets delete a edge with "match" header and correct revision and the waitForSync param"', function (done) {

		var options = {};
		options.match = true;
		options.waitForSync = true;
		options.rev = edge._rev;
		db.edge.delete(edge._id, options)
		    .then(function (ret, message) {
			edge._rev = ret._rev;
			message.status.should.equal(200);	    
		    }).callback(done);
	    })
	})

    });
});
