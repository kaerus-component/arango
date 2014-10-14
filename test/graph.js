var arango;


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

describe("graph", function () {
    var db, verticescollection, edgecollection, vertices = [], edges = [];

    before(function (done) {
	
	vertices = [];
	edges = [];
	db = arango.Connection("/_system");
	db.database.delete("newDatabase", function (err, ret) {
	    db.database.create("newDatabase", function (err, ret) {
		db = db.use('/newDatabase');
		db.collection.create("edgeCollection", {
		    "type": 3
		}, function (err, ret) {
		    edgecollection = ret;
		    db.collection.create("verticescollection", function (err, ret) {
			verticescollection = ret;
			db.document.create(verticescollection.id, {
			    "key1": "val1",
			    "key2": "val2",
			    "key3": null
			}, null, function (err, ret, message) {
			    ret.error.should.equal(false);
			    vertices.push(ret);
			    db.document.create(verticescollection.id, {
				"key1": "val2",
				"key2": "val3",
				"key3": "val4"
			    }, null, function (err, ret, message) {
				ret.error.should.equal(false);
				vertices.push(ret);
				db.document.create(verticescollection.id, {
				    "key4": "val2",
				    "key5": "val3",
				    "key6": "val4"
				}, null, function (err, ret, message) {
				    ret.error.should.equal(false);
				    vertices.push(ret);
				    db.edge.create(edgecollection.id, vertices[0]._id, vertices[1]._id, {
					"key1": "val1",
					"key2": "val2",
					"key3": null
				    }, null, function (err, ret, message) {
					edges.push(ret);
					db.edge.create(edgecollection.id, vertices[1]._id, vertices[2]._id, {
					    "key1": "val1",
					    "key3": "val3"
					}, null, function (err, ret, message) {
					    edges.push(ret);
					    done();
					});
				    });
				});
			    });
			});
		    });
		});
	    });
	});

    })

    describe("graphFunctions", function () {
	it('setProperties of graph collection', function (done) {
	
	    db.collection.setProperties("_graphs", {waitForSync: false}, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    message.status.should.equal(200);
		});
	    });
	})

	it('create a graph', function (done) {
	
	    db = db.use('/newDatabase');
	    db.graph.create("graph1", verticescollection.name, edgecollection.name, true, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})
	it('create another graph', function (done) {
	
	    db.graph.waitForSync(false).create("graph2", "hans", "dampf", function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})
	it('list graphs', function (done) {
	
	    db.graph.list(function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    message.status.should.equal(200);
		});
	    });
	})
	it('get graph', function (done) {
	
	    db.graph.get("graph1", function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    message.status.should.equal(200);
		});
	    });
	})
	it('create a graph without waitForSync', function (done) {
	
	    db.graph.create("graph3", "bla", "blub", false, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    //message.status.should.equal(202);
		});
	    });
	})
	it('delete graph  without waitForSync', function (done) {
	
	    db.graph.delete("graph3", false, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    //message.status.should.equal(202);
		});
	    });
	})
	it('request all neighbouring edges of a vertex', function (done) {
	
	    db.graph.getEdgesForVertex("graph1", vertices[1]._id, null, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(2);
		    ret.hasMore.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})

	it('request all neighbouring edges of a vertex with batchsize 1 and count', function (done) {
	
	    db.graph.getEdgesForVertex("graph1", vertices[1]._id, {
		"batchSize": 1,
		"count": true
	    }, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(1);
		    ret.hasMore.should.equal(true);
		    message.status.should.equal(201);
		});
	    });
	})
	it('request all neighbouring edges of a vertex using filter direction', function (done) {
	
	    db.graph.getEdgesForVertex("graph1", vertices[1]._id, {
		"filter": {
		    "direction": "in"
		}
	    }, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(1);
		    ret.hasMore.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})
	it('request all neighbouring edges of a vertex using filter properties', function (done) {
	
	    db.graph.getEdgesForVertex("graph1", vertices[1]._id, {
		"filter": {
		    "properties": {
			"key": "key3",
			"value": "val3",
			"key- compare": "="
		    }
		}
	    }, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(1);
		    ret.hasMore.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})

	it('request all neighbouring vertices of a vertex', function (done) {
	
	    db.graph.getNeighbourVertices("graph1", vertices[1]._id, null, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(2);
		    ret.hasMore.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})

	it('request all neighbouring vertices of a vertex with batchsize 1 and count', function (done) {
	
	    db.graph.getNeighbourVertices("graph1", vertices[1]._id, {
		"batchSize": 1,
		"count": true
	    }, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(1);
		    ret.hasMore.should.equal(true);
		    message.status.should.equal(201);
		});
	    });
	})
	it('request all neighbouring vertices of a vertex using filter direction', function (done) {
	
	    db.graph.getNeighbourVertices("graph1", vertices[1]._id, {
		"filter": {
		    "direction": "in"
		}
	    }, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(1);
		    ret.hasMore.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})
	it('request all neighbouring vertices of a vertex using filter properties', function (done) {
	
	    db.graph.getNeighbourVertices("graph1", vertices[1]._id, {
		"filter": {
		    "properties": {
			"key": "key3",
			"value": "val3",
			"key- compare": "="
		    }
		}
	    }, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(1);
		    ret.hasMore.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})

	it('request all edges of a graph', function (done) {
	
	    db.graph.edges("graph1", null, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(2);
		    ret.hasMore.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})

	it('request all edges of a graph with batchsize 1 and count', function (done) {
	
	    db.graph.edges("graph1", {
		"batchSize": 1,
		"count": true
	    }, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(1);
		    ret.hasMore.should.equal(true);
		    message.status.should.equal(201);
		});
	    });
	})
	it('request all edges of a graph using filter properties', function (done) {
	
	    db.graph.edges("graph1", {
		"filter": {
		    "properties": {
			"key": "key3",
			"value": "val3",
			"key- compare": "="
		    }
		}
	    }, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(1);
		    ret.hasMore.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})

	it('request all vertices of a graph', function (done) {
	
	    db.graph.vertices("graph1", null, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(3);
		    ret.hasMore.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})

	it('request all vertices of a graph with batchsize 1 and count', function (done) {
	
	    db.graph.vertices("graph1", {
		"batchSize": 1,
		"count": true
	    }, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(1);
		    ret.hasMore.should.equal(true);
		    message.status.should.equal(201);
		});
	    });
	})
	it('request all vertices of a graph using filter properties', function (done) {
	    
	    db.graph.vertices("graph1", {
		"filter": {
		    "properties": {
			"key": "key3",
			"value": "val4",
			"key- compare": "="
		    }
		}
	    }, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(1);
		    ret.hasMore.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})


	it('lets get a non existing vertex"', function (done) {
	    
	    db.graph.vertex.get("graph1", "verticescollection/nonExisting", function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(true);
		    ret.errorMessage.should.equal("document not found");
		    message.status.should.equal(404);
		});
	    });
	})
	it('lets get a vertex with "match" header == false and correct revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = vertices[1]._rev;
	    db.graph.vertex.get("graph1", vertices[1]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(304);
		});
	    });
	})
	it('lets get a vertex with "match" header == false and wrong revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.get("graph1", vertices[1]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(200);
		});
	    });
	})
	it('lets get a vertex with "match" header and correct revision"', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = vertices[1]._rev;
	    db.graph.vertex.get("graph1", vertices[1]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(200);
		});
	    });
	})
	it('lets get a vertex with "match" header and wrong revision', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.get("graph1", vertices[1]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(412);
		});
	    });
	})

	it('lets patch a non existing vertex"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    db.graph.vertex.patch("graph1", vertices[1]._id + 200, data, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(true);
		    ret.errorMessage.should.equal("document not found");
		    message.status.should.equal(404);
		});
	    });
	})
	it('lets patch a vertex with "match" header == false and wrong revision"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = false;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.patch("graph1", vertices[1]._id, data, options, function (err, ret, message) {
		check(done, function () {
		    vertices[1]._rev = ret.vertex._rev;
		    message.status.should.equal(202);
		});
	    });
	})
	it('lets patch a vertex with "match" header and correct revision and the waitForSync param"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = vertices[1]._rev;
	    db.graph.vertex.patch("graph1", vertices[1]._id, data, options, function (err, ret, message) {
		check(done, function () {
		    vertices[1]._rev = ret.vertex._rev;
		    message.status.should.equal(200);
		});
	    });
	})
	it('lets patch a vertex with "match" header and wrong revision', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.patch("graph1", vertices[1]._id, data, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(412);
		});
	    });
	})
	it('lets patch a vertex and not keep null values', function (done) {
	    
	    var data = {
		"newKey": "newValue",
		"key3": null
	    };
	    var options = {};
	    options.waitForSync = true;
	    options.keepNull = "false";
	    db.graph.vertex.patch("graph1", vertices[1]._id, data, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(200);
		});
	    });
	})

	it('lets patch a vertex and not keep null values with keepNUll and wailForSync functions', function (done) {
	    
	    var data = {
		"newKey": "newValue",
		"key3": null
	    };
	    db.graph.keepNull(false).waitForSync(true).vertex.patch("graph1", vertices[1]._id, data, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(200);
		});
	    });
	})

	it('lets verify the last patch', function (done) {
	    
	    db.graph.vertex.get("graph1", vertices[1]._id, function (err, ret, message) {
		check(done, function () {
		    ret.vertex.should.not.have.property("key3");
		    ret.vertex.should.have.property('newKey');
		});
	    });
	})

	it('lets put a non existing vertex"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    db.graph.vertex.put("graph1", vertices[1]._id + 200, data, function (err, ret, message) {
		check(done, function () {
		    ret.errorMessage.should.equal("document not found");
		    ret.error.should.equal(true);
		    message.status.should.equal(404);
		});
	    });
	})
	it('lets put a vertex with "match" header == false and wrong revision"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = false;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.waitForSync(false).vertex.put("graph1", vertices[1]._id, data, options, function (err, ret, message) {
		check(done, function () {
		    vertices[1]._rev = ret.vertex._rev;
		    message.status.should.equal(202);
		});
	    });
	})
	it('lets put a vertex with "match" header and correct revision and the waitForSync param"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = vertices[1]._rev;
	    db.graph.vertex.put("graph1", vertices[1]._id, data, options, function (err, ret, message) {
		check(done, function () {
		    vertices[1]._rev = ret.vertex._rev;
		    message.status.should.equal(200);
		});
	    });
	})
	it('lets put a vertex with "match" header and wrong revision', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.put("graph1", vertices[1]._id, data, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(412);
		});
	    });
	})
	it('lets put a vertex with "match" header', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    db.graph.vertex.put("graph1", vertices[1]._id, data, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(202);

		});
	    });
	})
	it('lets verify the last put', function (done) {
	    
	    db.graph.vertex.get("graph1", vertices[1]._id, function (err, ret, message) {
		check(done, function () {
		    ret.vertex.should.not.have.property("key3");
		    ret.vertex.should.not.have.property("key2");
		    ret.vertex.should.not.have.property("key1");
		    ret.vertex.should.have.property("newKey");
		});
	    });
	})

	it('lets delete a non existing vertex"', function (done) {
	    
	    db.graph.vertex.delete("graph1", vertices[1]._id + 200, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(true);
		    ret.errorMessage.should.equal("document not found");
		    message.status.should.equal(404);
		});
	    });
	})
	it('lets delete a vertex with "match" header and wrong revision', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.delete("graph1", vertices[1]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(412);
		});
	    });
	})

	it('lets delete a vertex with "match" header == false and wrong revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.delete("graph1", vertices[1]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(202);
		});
	    });
	})
	it('create a vertex', function (done) {
	    
	    db.graph.vertex.create("graph1", {
		"key1": "val1",
		"key2": "val2",
		"key3": null
	    }, false, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    vertices[1] = ret.vertex;
		    message.status.should.equal(202);
		});
	    });
	})
	it('lets delete a vertex with "match" header and correct revision and the waitForSync param"', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = vertices[1]._rev;
	    db.graph.vertex.delete("graph1", vertices[1]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(200);
		});
	    });
	})
	it('create a vertex', function (done) {
	    
	    db.graph.vertex.create("graph1", {
		"key1": "val1",
		"key2": "val2",
		"key3": null
	    }, false, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    vertices[1] = ret.vertex;
		    message.status.should.equal(202);
		});
	    });
	})


	it('create a edge', function (done) {
	    
	    db.graph.edge.create("graph1", {
		"key1": "val1",
		"key2": "val2",
		"key3": null
	    }, vertices[0]._id, vertices[1]._id, function (err, ret, message) {
		check(done, function () {
		    edges = [];
		    ret.error.should.equal(false);
		    edges.push(ret.edge);
		    message.status.should.equal(202);
		});
	    });
	})
	it('create another edge', function (done) {
	    
	    db.graph.edge.create("graph1", {
		"key1": "val1",
		"key3": "val3"
	    }, vertices[1]._id, vertices[2]._id, function (err, ret, message) {
		check(done, function () {
		    edges.push(ret.edge)
		    ret.error.should.equal(false);
		    message.status.should.equal(202);
		});
	    });
	})
	it('create another edge', function (done) {
	    
	    db.graph.edge.create("graph1", {
		"key1": "val1",
		"key2": "val2"
	    }, vertices[0]._id, vertices[1]._id, "a label", true, function (err, ret, message) {
		check(done, function () {
		    edges.push(ret.edge)
		    ret.error.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})

	it('lets get a non existing edge', function (done) {
	    
	    db.graph.edge.get("graph1", edges[0]._id + 200, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(true);
		    ret.errorMessage.should.equal("document not found");
		    message.status.should.equal(404);
		});
	    });
	})

	it('request all edges of a graph', function (done) {
	    
	    db.graph.edges("graph1", null, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(3);
		    ret.hasMore.should.equal(false);
		    message.status.should.equal(201);
		});
	    });
	})
	it('lets get a edge with "match" header == false and correct revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = edges[0]._rev;
	    db.graph.edge.get("graph1", edges[0]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(304);
		});
	    });
	})
	it('lets get a edge with "match" header == false and wrong revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.get("graph1", edges[0]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(200);
		});
	    });
	})
	it('lets get a edge with "match" header and correct revision"', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = edges[0]._rev;
	    db.graph.edge.get("graph1", edges[0]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(200);
		});
	    });
	})
	it('lets get a edge with "match" header and wrong revision', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.get("graph1", edges[0]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(412);
		});
	    });
	})

	it('lets patch a non existing edge"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    db.graph.edge.patch("graph1", edges[0]._id + 200, data, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(true);
		    ret.errorMessage.should.equal("document not found");
		    message.status.should.equal(404);
		});
	    });
	})
	it('lets patch a edge with "match" header == false and wrong revision"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = false;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.patch("graph1", edges[0]._id, data, options, function (err, ret, message) {
		check(done, function () {
		    edges[0]._rev = ret.edge._rev;
		    message.status.should.equal(202);
		});
	    });
	})
	it('lets patch a edge with "match" header and correct revision and the waitForSync param"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = edges[0]._rev;
	    db.graph.edge.patch("graph1", edges[0]._id, data, options, function (err, ret, message) {
		check(done, function () {
		    edges[0]._rev = ret.edge._rev;
		    message.status.should.equal(200);
		});
	    });
	})
	it('lets patch a edge with "match" header and wrong revision', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.patch("graph1", edges[0]._id, data, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(412);
		});
	    });
	})
	it('lets patch a edge  keep null values', function (done) {
	    
	    this.timeout(20000)
	    var data = {
		"newKey": "newValue",
		"key3": null
	    };
	    var options = {};
	    options.waitForSync = true;
	    options.keepNull = "false";
	    db.graph.edge.patch("graph1", edges[0]._id, data, options, function (err, ret, message) {
		check(done, function () {

		    message.status.should.equal(200);
		});
	    });
	})

	it('lets verify the last patch', function (done) {
	    
	    db.graph.edge.get("graph1", edges[0]._id, function (err, ret, message) {
		check(done, function () {
		    ret.edge.should.not.have.property("key3");
		    ret.edge.should.have.property("newKey");
		});
	    });
	})

	it('lets put a non existing edge"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    db.graph.edge.put("graph1", edges[0]._id + 200, data, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(true);
		    ret.errorMessage.should.equal("document not found");
		    message.status.should.equal(404);
		});
	    });
	})
	it('lets put a edge with "match" header == false and wrong revision"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = false;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.put("graph1", edges[0]._id, data, options, function (err, ret, message) {
		check(done, function () {
		    edges[0]._rev = ret.edge._rev;
		    message.status.should.equal(202);
		});
	    });
	})
	it('lets put a edge with "match" header and correct revision and the waitForSync param"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = edges[0]._rev;
	    db.graph.edge.put("graph1", edges[0]._id, data, options, function (err, ret, message) {
		check(done, function () {
		    edges[0]._rev = ret.edge._rev;
		    message.status.should.equal(200);
		});
	    });
	})
	it('lets put a edge with "match" header and wrong revision', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.put("graph1", edges[0]._id, data, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(412);
		});
	    });
	})
	it('lets verify the last put', function (done) {
	    
	    db.graph.edge.get("graph1", edges[0]._id, function (err, ret, message) {
		check(done, function () {
		    ret.edge.should.not.have.property("key3");
		    ret.edge.should.not.have.property("key2");
		    ret.edge.should.not.have.property("key1");
		    ret.edge.should.have.property("newKey");
		});
	    });
	})

	it('lets delete a non existing edge"', function (done) {
	    
	    db.graph.edge.delete("graph1", edges[0]._id + 200, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(true);
		    ret.errorMessage.should.equal("document not found");
		    message.status.should.equal(404);
		});
	    });
	})
	it('lets delete a edge with "match" header and wrong revision', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.delete("graph1", edges[0]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(412);
		});
	    });
	})

	it('lets delete a edge with "match" header == false and wrong revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.delete("graph1", edges[0]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(202);
		});
	    });
	})
	it('create a edge', function (done) {
	    
	    db.graph.edge.create("graph1", edgecollection.id, vertices[0]._id, vertices[1]._id, {
		"key1": "val1",
		"key2": "val2",
		"key3": null
	    }, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    edges[0] = ret.edge;
		    message.status.should.equal(202);
		});
	    });
	})
	it('lets delete a edge with "match" header and correct revision and the waitForSync param"', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = edges[0]._rev;
	    db.graph.edge.delete("graph1", edges[0]._id, options, function (err, ret, message) {
		check(done, function () {
		    message.status.should.equal(200);
		});
	    });
	})

	// New graph functionality

	it("should offer all vertex collections", function(done) {
	    
	    db.graph.vertexCollections.list("graph1", function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.collections.length.should.equal(1);
		    ret.collections[0].should.equal(verticescollection.name);
		    message.status.should.equal(200);
		});
	    });
	});

	it("should offer all edge collections", function(done) {
	    
	    db.graph.edgeCollections.list("graph1", function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    ret.collections.length.should.equal(1);
		    ret.collections[0].should.equal(edgecollection.name);
		    message.status.should.equal(200);
		});
	    });
	});

	it('delete graph', function (done) {
	    
	    db.graph.delete("graph1", true, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    message.status.should.equal(200);
		});
	    });
	})
    })
    
});

describe("multi collection graph", function () {
    var orphan1 = "UnitTestO1";
    var orphan2 = "UnitTestO2";
    var from1 = "UnitTestV1";
    var to1 = "UnitTestV2";
    var e1 = "UnitTestE1";
    var e2 = "UnitTestE2";

    var graphName = "UnitTestMultiGraph";
    var edgeDefinitions = [
	{
	    collection: e1,
	    from: [from1],
	    to: [to1]
	},
	{
	    collection: e2,
	    from: [from1],
	    to: [from1]
	}
    ];
    var orphans = [orphan1, orphan2];

    var db = new arango.Connection();
    
    before(function() {
	db = db.use('/newDatabase');
    });

    beforeEach(function(done) {
	db.graph.delete(graphName, true, function (err, ret, message){
	    done();
	}); 
    });

    it("should create an empty graph", function (done) {
	
	db.graph.create(graphName, function (err, ret, message) {
	    check(done, function() {
		ret.error.should.equal(false);
		ret.graph.name.should.equal(graphName);
		ret.graph.edgeDefinitions.length.should.equal(0);
		ret.graph.orphanCollections.length.should.equal(0);
		message.status.should.equal(201);
	    });
	});
    });

    it("should create a graph with multiple edge definitions", function (done) {
	
	db.graph.create(graphName, edgeDefinitions, function (err, ret, message) {
	    check(done, function() {
		ret.error.should.equal(false);
		ret.graph.name.should.equal(graphName);
		ret.graph.edgeDefinitions.length.should.equal(2);
		ret.graph.orphanCollections.length.should.equal(0);
		message.status.should.equal(201);
	    });
	});
    });

    it("should create a graph with multiple edge definitions and orphans", function (done) {
	
	db.graph.create(graphName, edgeDefinitions, orphans, function (err, ret, message) {
	    check(done, function() {
		ret.error.should.equal(false);
		ret.graph.name.should.equal(graphName);
		ret.graph.edgeDefinitions.length.should.equal(2);
		ret.graph.orphanCollections.length.should.equal(2);
		message.status.should.equal(201);
	    });
	});
    });

    describe("management", function() {
	
	beforeEach(function(done) {
	    db.graph.create(graphName, edgeDefinitions, orphans, function () {
		done();
	    });
	});

	it("should add a new vertex collection", function(done) {
	    
	    var toAdd = "UnitTestNewCollection";
	    db.graph.vertexCollections.add(graphName, toAdd, function(err, ret, message) {
		check(done, function() {
		    ret.error.should.equal(false);
		    message.status.should.equal(201);
		    ret.graph.name.should.equal(graphName);
		    ret.graph.edgeDefinitions.length.should.equal(2);
		    ret.graph.orphanCollections.length.should.equal(3);
		});
	    });
	});

	it("should drop a vertex collection", function(done) {
	    
	    db.graph.vertexCollections.delete(graphName, orphan1, function(err, ret, message) {
		check(done, function() {
		    ret.error.should.equal(false);
		    message.status.should.equal(200);
		    ret.graph.name.should.equal(graphName);
		    ret.graph.edgeDefinitions.length.should.equal(2);
		    ret.graph.orphanCollections.length.should.equal(1);
		    ret.graph.orphanCollections[0].should.equal(orphan2);
		});
	    });
	});

	it("should not drop a vertex collection used in an edge definition", function(done) {
	    
	    db.graph.vertexCollections.delete(graphName, from1, function(err, ret, message) {
		check(done, function() {
		    message.status.should.equal(400);
		});
	    });
	});

	it("should add a new edge definition using single orphan collections", function(done) {
	    
	    var edge = "UnitTestAddEdge";
	    var from = orphan1;
	    var to = orphan2;
	    db.graph.edgeCollections.add(graphName, edge, from, to, function(err, ret, message) {
		check(done, function() {
		    ret.error.should.equal(false);
		    message.status.should.equal(201);
		    ret.graph.name.should.equal(graphName);
		    ret.graph.edgeDefinitions.length.should.equal(3);
		    ret.graph.orphanCollections.length.should.equal(0);
		});
	    });
	});

	it("should add a new edge definition using collection arrays", function(done) {
	    
	    var edge = "UnitTestAddEdge";
	    var from = [orphan1, orphan2];
	    var to = orphan2;
	    db.graph.edgeCollections.add(graphName, edge, from, to, function(err, ret, message) {
		check(done, function() {
		    ret.error.should.equal(false);
		    message.status.should.equal(201);
		    ret.graph.name.should.equal(graphName);
		    ret.graph.edgeDefinitions.length.should.equal(3);
		    ret.graph.orphanCollections.length.should.equal(0);
		});
	    });
	});

	it("should add a new edge definition using only one collection array", function(done) {
	    
	    var edge = "UnitTestAddEdge";
	    var from = orphan1;
	    db.graph.edgeCollections.add(graphName, edge, from, function(err, ret, message) {
		check(done, function() {
		    ret.error.should.equal(false);
		    message.status.should.equal(201);
		    ret.graph.name.should.equal(graphName);
		    ret.graph.edgeDefinitions.length.should.equal(3);
		    ret.graph.orphanCollections.length.should.equal(1);
		});
	    });
	});

	it("should replace an existing edge definition", function(done) {
	    
	    var from = orphan1;
	    var to = orphan2;
	    db.graph.edgeCollections.replace(graphName, e1, from, to, function(err, ret, message) {
		check(done, function() {
		    ret.error.should.equal(false);
		    message.status.should.equal(200);
		    ret.graph.name.should.equal(graphName);
		    ret.graph.edgeDefinitions.length.should.equal(2);
		    ret.graph.orphanCollections.length.should.equal(1);
		    ret.graph.orphanCollections[0].should.equal(to1);
		});
	    });
	});

	it("should drop an edge definition", function(done) {
	    
	    db.graph.edgeCollections.delete(graphName, e1, function(err, ret, message) {
		check(done, function() {
		    ret.error.should.equal(false);
		    message.status.should.equal(200);
		    ret.graph.name.should.equal(graphName);
		    ret.graph.edgeDefinitions.length.should.equal(1);
		    ret.graph.orphanCollections.length.should.equal(3);
		});
	    });
	});
    });

    describe("creation of", function() {

	var fromVertex;
	var toVertex;

	beforeEach(function(done) {
	    db.graph.create(graphName, edgeDefinitions, orphans, function (err, ret) {
		done();
	    });
	});

	it("a vertex", function(done) {
	    
	    db.graph.vertex.create(graphName, {
		"key1": "val1",
		"key2": "val2"
	    }, from1, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    message.status.should.equal(202);
		    ret.vertex._id.split("/")[0].should.equal(from1);
		    ret.vertex.should.not.have.property('key1');
		    ret.vertex.should.not.have.property('key2');
		    //ret.vertex.key1.should.equal("val1");
		    //ret.vertex.key2.should.equal("val2");
		    fromVertex = ret.vertex._id;
		});
	    });
	});

	it("another vertex", function(done) {
	    
	    db.graph.vertex.create(graphName, {
		"key1": "val1",
		"key2": "val2"
	    }, to1, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    message.status.should.equal(202);
		    ret.vertex._id.split("/")[0].should.equal(to1);
		    ret.vertex.should.not.have.property('key1');
		    ret.vertex.should.not.have.property('key2');
		    //ret.vertex.key1.should.equal("val1");
		    //ret.vertex.key2.should.equal("val2");
		    toVertex = ret.vertex._id;
		});
	    });
	});

	it("an orphan", function(done) {
	    
	    db.graph.vertex.create(graphName, {
		"key1": "val1",
		"key2": "val2"
	    }, orphan1, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    message.status.should.equal(202);
		    ret.vertex._id.split("/")[0].should.equal(orphan1);
		    ret.vertex.should.not.have.property('key1');
		    ret.vertex.should.not.have.property('key2');
		    //ret.vertex.key1.should.equal("val1");
		    //ret.vertex.key2.should.equal("val2");
		});
	    });
	});

	it("an edge", function(done) {
	    
	    db.graph.edge.create(graphName, {
		"key1": "val1",
		"key2": "val2"
	    }, fromVertex, toVertex, "", e1, function (err, ret, message) {
		check(done, function () {
		    ret.error.should.equal(false);
		    message.status.should.equal(202);
		    ret.edge._id.split("/")[0].should.equal(e1);
		    ret.edge.should.not.have.property('key1');
		    ret.edge.should.not.have.property('key2');
		    //ret.edge.key1.should.equal("val1");
		    //ret.edge.key2.should.equal("val2");
		});
	    });
	});

    });
});
