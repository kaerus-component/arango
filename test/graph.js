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
	db.database.delete("newDatabase").end( function () {
	    db.database.create("newDatabase").end( function () {
		db = db.use('/newDatabase');
		
		db.collection.create("edgeCollection", {
		    "type": 3
		}).then(function (ret) {
		    edgecollection = ret;
		    return db.collection.create("verticescollection");
		}).then(function (ret) {
		    verticescollection = ret;

		    db.batch.start();

		    db.document.create(verticescollection.id, {
			"key1": "val1",
			"key2": "val2",
			"key3": null
		    });
		    
		    db.document.create(verticescollection.id, {
			"key1": "val2",
			"key2": "val3",
			"key3": "val4"
		    });
		    
		    db.document.create(verticescollection.id, {
			"key4": "val2",
			"key5": "val3",
			"key6": "val4"
		    });
		    return db.batch.exec();
		}).then(function(v){
		    v.shift();
		    
		    vertices = v;

		    db.batch.start();
		    
		    db.edge.create(edgecollection.id, vertices[0]._id, vertices[1]._id, {
			"key1": "val1",
			"key2": "val2",
			"key3": null
		    });
		    db.edge.create(edgecollection.id, vertices[1]._id, vertices[2]._id, {
			"key1": "val1",
			"key3": "val3"
		    });
		    
		    return db.batch.exec();
		    
		}).then(function(e){
		    e.shift();
		    edges = e;
		}).callback(done);
	    });
	});
    })

    describe("graphFunctions", function () {
	it('setProperties of graph collection', function (done) {
	    
	    db.collection.setProperties("_graphs", {waitForSync: false})
		.then(function (ret) {
		    ret.error.should.equal(false);
		    ret.code.should.equal(200);
		}).callback(done);
	});

	it('create a graph', function (done) {
	    
	    db = db.use('/newDatabase');
	    db.graph.create("graph1", verticescollection.name, edgecollection.name, true)
		.then(function (ret) {
		    ret.code.should.equal(201);
		}).callback(done);
	})
	
	it('create another graph', function (done) {
	    
	    db.graph.waitForSync(false).create("graph2", "hans", "dampf")
		.then(function (ret) {
		    ret.code.should.equal(201);
		}).callback(done);
	})
	
	it('list graphs', function (done) {
	    
	    db.graph.list()
		.then(function (ret) {
		    ret.code.should.equal(202);
		}).callback(done);
	})
	
	it('get graph', function (done) {
	    
	    db.graph.get("graph1")
		.then(function (ret) {
		    ret.code.should.equal(200);
		}).callback(done);
	})
	
	it('create a graph without waitForSync', function (done) {    

	    db.graph.create("graph3", "bla", "blub", false)
		.then(function (ret) {
		    ret.code.should.equal(201);
		}).callback(done);
	})
	
	it('delete graph  without waitForSync', function (done) {
	    
	    db.graph.delete("graph3", false)
		.then(function (ret) {
		    ret.code.should.equal(200);
		}).callback(done);
	});
	
	it('request all neighbouring edges of a vertex', function (done) {
	    
	    db.graph.getEdgesForVertex("graph1", vertices[1]._id, null)
		.then(function (ret) {
		    ret.result.length.should.equal(2);
		    ret.hasMore.should.equal(false);
		    ret.code.should.equal(201);
		}).callback(done);
	})

	it('request all neighbouring edges of a vertex with batchsize 1 and count', function (done) {
	    
	    db.graph.getEdgesForVertex("graph1", vertices[1]._id, {
		"batchSize": 1,
		"count": true
	    }).then( function (ret) {
		ret.result.length.should.equal(1);
		ret.hasMore.should.equal(true);
		ret.code.should.equal(201);
	    }).callback(done);
	})
	
	it('request all neighbouring edges of a vertex using filter direction', function (done) {
	    
	    db.graph.getEdgesForVertex("graph1", vertices[1]._id, {
		"filter": {
		    "direction": "in"
		}
	    }).then(function (ret) {
		ret.result.length.should.equal(1);
		ret.hasMore.should.equal(false);
		ret.code.should.equal(201);
	    }).callback(done);
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
	    }).then( function (ret) {
		ret.result.length.should.equal(1);
		ret.hasMore.should.equal(false);
		ret.code.should.equal(201);
	    }).callback(done);
	})

	it('request all neighbouring vertices of a vertex', function (done) {
	    
	    db.graph.getNeighbourVertices("graph1", vertices[1]._id)
		.then(function (ret) {
		    ret.result.length.should.equal(2);
		    ret.hasMore.should.equal(false);
		    ret.code.should.equal(201);
		}).callback(done);
	})
	
	it('request all neighbouring vertices of a vertex with batchsize 1 and count', function (done) {
	    
	    db.graph.getNeighbourVertices("graph1", vertices[1]._id, {
		"batchSize": 1,
		"count": true
	    }).then( function (ret) {
		ret.result.length.should.equal(1);
		ret.hasMore.should.equal(true);
		ret.code.should.equal(201);
	    }).callback(done);
	})
	
	it('request all neighbouring vertices of a vertex using filter direction', function (done) {
	    
	    db.graph.getNeighbourVertices("graph1", vertices[1]._id, {
		"filter": {
		    "direction": "in"
		}
	    }).then( function (ret) {
		ret.result.length.should.equal(1);
		ret.hasMore.should.equal(false);
		ret.code.should.equal(201);
	    }).callback(done);
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
	    }).then( function (ret) {
		ret.result.length.should.equal(1);
		ret.hasMore.should.equal(false);
		ret.code.should.equal(201);
	    }).callback(done);
	})

	it('request all edges of a graph', function (done) {
	    
	    db.graph.edges("graph1", null)
		.then(function (ret) {
		    ret.result.length.should.equal(2);
		    ret.hasMore.should.equal(false);
		    ret.code.should.equal(201);
		}).callback(done);
	})
	
	it('request all edges of a graph with batchsize 1 and count', function (done) {
	    
	    db.graph.edges("graph1", {
		"batchSize": 1,
		"count": true
	    }).then( function (ret) {
		ret.result.length.should.equal(1);
		ret.hasMore.should.equal(true);
		ret.code.should.equal(201);
	    }).callback(done);
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
	    }).then( function (ret) {

		ret.result.length.should.equal(1);
		ret.hasMore.should.equal(false);
		ret.code.should.equal(201);
	    }).callback(done);
	})

	it('request all vertices of a graph', function (done) {
	    
	    db.graph.vertices("graph1", null)
		.then(function (ret) {
		    ret.result.length.should.equal(3);
		    ret.hasMore.should.equal(false);
		    ret.code.should.equal(201);
		}).callback(done);
	})

	it('request all vertices of a graph with batchsize 1 and count', function (done) {
	    
	    db.graph.vertices("graph1", {
		"batchSize": 1,
		"count": true
	    }).then( function (ret) {
		ret.result.length.should.equal(1);
		ret.hasMore.should.equal(true);
		ret.code.should.equal(201);
	    }).callback(done);
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
	    }).then( function (ret) {
		ret.result.length.should.equal(1);
		ret.hasMore.should.equal(false);
		ret.code.should.equal(201);
	    }).callback(done);
	})
	
	it('lets get a non existing vertex"', function (done) {
	    
	    db.graph.vertex.get("graph1", "verticescollection/nonExisting")
		.catch(function (err) {
		    err.errorMessage.should.equal("document not found");
		    err.code.should.equal(404);
		    done();
		});
	})
	
	it('lets get a vertex with "match" header == false and correct revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = vertices[1]._rev;
	    db.graph.vertex.get("graph1", vertices[1]._id, options)
		.then(function (ret) {
		    ret.code.should.equal(304);

		}).callback(done);
	})
	it('lets get a vertex with "match" header == false and wrong revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.get("graph1", vertices[1]._id, options)
		.then(function (ret) {
		    ret.code.should.equal(200);
		}).callback(done);
	})
	it('lets get a vertex with "match" header and correct revision"', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = vertices[1]._rev;
	    db.graph.vertex.get("graph1", vertices[1]._id, options)
		.then(function (ret) {
		    ret.code.should.equal(200);
		}).callback(done);
	})
	
	it('lets get a vertex with "match" header and wrong revision', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.get("graph1", vertices[1]._id, options)
		.catch(function (err) {
		    err.code.should.equal(412);
		    done();
		});
	})

	it('lets patch a non existing vertex"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    db.graph.vertex.patch("graph1", vertices[1]._id + 200, data)
		.catch(function (err) {
		    err.errorMessage.should.equal("document not found");
		    err.code.should.equal(404);
		    done();
		});
	})
	
	it('lets patch a vertex with "match" header == false and wrong revision"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = false;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.patch("graph1", vertices[1]._id, data, options)
		.then(function (ret) {
		    vertices[1]._rev = ret.vertex._rev;
		    ret.code.should.equal(202);
		}).callback(done);
	})
	it('lets patch a vertex with "match" header and correct revision and the waitForSync param"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = vertices[1]._rev;
	    db.graph.vertex.patch("graph1", vertices[1]._id, data, options)
		.then(function (ret) {
		    vertices[1]._rev = ret.vertex._rev;
		    ret.code.should.equal(200);
		}).callback(done);
	})
	
	it('lets patch a vertex with "match" header and wrong revision', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.patch("graph1", vertices[1]._id, data, options)
		.catch(function (err) {
		    err.code.should.equal(412);
		    done();
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
	    db.graph.vertex.patch("graph1", vertices[1]._id, data, options)
		.then(function (ret) {
		    check(done, function () {
			ret.code.should.equal(200);
		    }).callback(done);
		})
	})

	it('lets patch a vertex and not keep null values with keepNUll and wailForSync functions', function (done) {
	    
	    var data = {
		"newKey": "newValue",
		"key3": null
	    };
	    db.graph.keepNull(false).waitForSync(true).vertex.patch("graph1", vertices[1]._id, data)
		.then(function (ret) {
		    ret.code.should.equal(200);
		}).callback(done);
	})

	it('lets verify the last patch', function (done) {
	    
	    db.graph.vertex.get("graph1", vertices[1]._id)
		.then(function (ret) {
		    ret.vertex.should.not.have.property("key3");
		    ret.vertex.should.have.property('newKey');
		}).callback(done);
	})

	it('lets put a non existing vertex"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    db.graph.vertex.put("graph1", vertices[1]._id + 200, data)
		.catch(function (err) {
		    err.errorMessage.should.equal("document not found");
		    err.error.should.equal(true);
		    err.code.should.equal(404);
		    done();
		});
	})
	
	it('lets put a vertex with "match" header == false and wrong revision"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = false;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.waitForSync(false).vertex.put("graph1", vertices[1]._id, data, options)
		.then(function (ret) {
		    vertices[1]._rev = ret.vertex._rev;
		    ret.code.should.equal(202);
		}).callback(done);
	})
	it('lets put a vertex with "match" header and correct revision and the waitForSync param"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = vertices[1]._rev;
	    db.graph.vertex.put("graph1", vertices[1]._id, data, options)
		.then(function (ret) {
		    vertices[1]._rev = ret.vertex._rev;
		    ret.code.should.equal(200);
		}).callback(done);
	})


	it('lets put a vertex with "match" header and wrong revision', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.put("graph1", vertices[1]._id, data, options)
		.catch(function (err) {
		    err.code.should.equal(412);
		    done();
		});
	})
	
	it('lets put a vertex with "match" header', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    db.graph.vertex.put("graph1", vertices[1]._id, data)
		.then(function (ret) {
		    ret.code.should.equal(202);
		}).callback(done);
	})
	
	it('lets verify the last put', function (done) {
	    
	    db.graph.vertex.get("graph1", vertices[1]._id)
		.then(function (ret) {
		    ret.vertex.should.not.have.property("key3");
		    ret.vertex.should.not.have.property("key2");
		    ret.vertex.should.not.have.property("key1");
		    ret.vertex.should.have.property("newKey");
		}).callback(done);
	})

	it('lets delete a non existing vertex"', function (done) {
	    
	    db.graph.vertex.delete("graph1", vertices[1]._id + 200)
		.catch(function (err) {
		    err.error.should.equal(true);
		    err.errorMessage.should.equal("document not found");
		    err.code.should.equal(404);
		    done();
		});
	})
	
	it('lets delete a vertex with "match" header and wrong revision', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.delete("graph1", vertices[1]._id, options)
		.catch(function (err) {
		    err.code.should.equal(412);
		    done();
		});
	})

	it('lets delete a vertex with "match" header == false and wrong revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = vertices[1]._rev + 1;
	    db.graph.vertex.delete("graph1", vertices[1]._id, options)
		.then(function (ret) {
		    ret.code.should.equal(202);
		}).callback(done);
	})
	
	it('create a vertex', function (done) {
	    
	    db.graph.vertex.create("graph1", {
		"key1": "val1",
		"key2": "val2",
		"key3": null
	    }, false)
		.then(function (ret) {
		    vertices[1] = ret.vertex;
		    ret.code.should.equal(202);
		}).callback(done);
	})
	
	it('lets delete a vertex with "match" header and correct revision and the waitForSync param"', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = vertices[1]._rev;
	    db.graph.vertex.delete("graph1", vertices[1]._id, options)
		.then(function (ret) {
		    ret.code.should.equal(200);
		}).callback(done);
	})
	
	it('create a vertex', function (done) {
	    
	    db.graph.vertex.create("graph1", {
		"key1": "val1",
		"key2": "val2",
		"key3": null
	    }, false)
		.then(function (ret) {
		    ret.error.should.equal(false);
		    vertices[1] = ret.vertex;
		    ret.code.should.equal(202);
		}).callback(done);
	})

	it('create a edge', function (done) {
	    
	    db.graph.edge.create("graph1", {
		"key1": "val1",
		"key2": "val2",
		"key3": null
	    }, vertices[0]._id, vertices[1]._id)
		.then(function (ret) {
		    edges = [];
		    ret.error.should.equal(false);
		    edges.push(ret.edge);
		    ret.code.should.equal(202);
		}).callback(done);
	})
	
	it('create another edge', function (done) {
	    
	    db.graph.edge.create("graph1", {
		"key1": "val1",
		"key3": "val3"
	    }, vertices[1]._id, vertices[2]._id)
		.then(function (ret) {
		    edges.push(ret.edge)
		    ret.error.should.equal(false);
		    ret.code.should.equal(202);
		}).callback(done);
	})
	
	it('create another edge', function (done) {
	    
	    db.graph.edge.create("graph1", {
		"key1": "val1",
		"key2": "val2"
	    }, vertices[0]._id, vertices[1]._id, "a label", true)
		.then(function (ret) {
		    edges.push(ret.edge)
		    ret.error.should.equal(false);
		    ret.code.should.equal(201);
		}).callback(done);
	})

	it('lets get a non existing edge', function (done) {
	    
	    db.graph.edge.get("graph1", edges[0]._id + 200)
		.catch(function (err) {
		    err.error.should.equal(true);
		    err.errorMessage.should.equal("document not found");
		    err.code.should.equal(404);
		    done();
		});
	})

	it('request all edges of a graph', function (done) {
	    
	    db.graph.edges("graph1", null)
		.then(function (ret) {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(3);
		    ret.hasMore.should.equal(false);
		    ret.code.should.equal(201);
		}).callback(done);
	})
	
	it('lets get a edge with "match" header == false and correct revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = edges[0]._rev;
	    db.graph.edge.get("graph1", edges[0]._id, options)
		.then(function (ret) {
		    ret.code.should.equal(304);
		}).callback(done);
	})
	
	it('lets get a edge with "match" header == false and wrong revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.get("graph1", edges[0]._id, options)
		.then(function (ret) {
		    ret.code.should.equal(200);
		}).callback(done);
	})
	
	it('lets get a edge with "match" header and correct revision"', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = edges[0]._rev;
	    db.graph.edge.get("graph1", edges[0]._id, options)
		.then(function (ret) {
		    ret.code.should.equal(200);
		}).callback(done);
	})
	
	it('lets get a edge with "match" header and wrong revision', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.get("graph1", edges[0]._id, options)
		.catch(function (err) {
		    err.code.should.equal(412);
		    done();
		});
	})

	it('lets patch a non existing edge"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    db.graph.edge.patch("graph1", edges[0]._id + 200, data)
		.catch(function (err) {
		    err.error.should.equal(true);
		    err.errorMessage.should.equal("document not found");
		    err.code.should.equal(404);
		    done();
		});
	})
	
	it('lets patch a edge with "match" header == false and wrong revision"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = false;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.patch("graph1", edges[0]._id, data, options)
		.then(function (ret) {
		    edges[0]._rev = ret.edge._rev;
		    ret.code.should.equal(202);
		}).callback(done);
	})
	
	it('lets patch a edge with "match" header and correct revision and the waitForSync param"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = edges[0]._rev;
	    db.graph.edge.patch("graph1", edges[0]._id, data, options)
		.then(function (ret) {
		    ret.code.should.equal(200);
		    edges[0]._rev = ret.edge._rev;
		}).callback(done);
	})
	
	it('lets patch a edge with "match" header and wrong revision', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.patch("graph1", edges[0]._id, data, options)
		.catch(function (err) {
		    err.code.should.equal(412);
		    done();
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
	    db.graph.edge.patch("graph1", edges[0]._id, data, options)
		.then(function (ret) {
		    ret.code.should.equal(200);
		}).callback(done);
	})

	it('lets verify the last patch', function (done) {
	    
	    db.graph.edge.get("graph1", edges[0]._id)
		.then(function (ret) {
		    ret.edge.should.not.have.property("key3");
		    ret.edge.should.have.property("newKey");
		}).callback(done);
	})

	it('lets put a non existing edge"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    db.graph.edge.put("graph1", edges[0]._id + 200, data)
		.catch(function (err) {
		    err.error.should.equal(true);
		    err.errorMessage.should.equal("document not found");
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
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.put("graph1", edges[0]._id, data, options)
		.then(function (ret) {
		    edges[0]._rev = ret.edge._rev;
		    ret.code.should.equal(202);
		}).callback(done);
	})


	it('lets put a edge with "match" header and correct revision and the waitForSync param"', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.waitForSync = true;
	    options.rev = edges[0]._rev;
	    db.graph.edge.put("graph1", edges[0]._id, data, options)
		.then(function (ret) {
		    edges[0]._rev = ret.edge._rev;
		    ret.code.should.equal(200);
		}).callback(done);
	})
	
	it('lets put a edge with "match" header and wrong revision', function (done) {
	    
	    var data = {
		"newKey": "newValue"
	    };
	    var options = {};
	    options.match = true;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.put("graph1", edges[0]._id, data, options)
		.catch(function (err) {
		    err.code.should.equal(412);
		    done();
		});
	})
	
	it('lets verify the last put', function (done) {
	    
	    db.graph.edge.get("graph1", edges[0]._id)
		.then(function (ret) {
		    ret.edge.should.not.have.property("key3");
		    ret.edge.should.not.have.property("key2");
		    ret.edge.should.not.have.property("key1");
		    ret.edge.should.have.property("newKey");
		}).callback(done);
	})

	it('lets delete a non existing edge"', function (done) {
	    
	    db.graph.edge.delete("graph1", edges[0]._id + 200)
		.catch(function (err) {
		    err.error.should.equal(true);
		    err.errorMessage.should.equal("document not found");
		    err.code.should.equal(404);
		    done();
		});
	})
	
	it('lets delete a edge with "match" header and wrong revision', function (done) {
	    
	    var options = {};
	    options.match = true;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.delete("graph1", edges[0]._id, options)
		.catch(function (err) {
		    err.code.should.equal(412);
		    done();
		});
	})

	it('lets delete a edge with "match" header == false and wrong revision"', function (done) {
	    
	    var options = {};
	    options.match = false;
	    options.rev = edges[0]._rev + 1;
	    db.graph.edge.delete("graph1", edges[0]._id, options)
		.then(function (ret) {
		    ret.code.should.equal(202);
		}).callback(done);
	})

	/* AE: Found no documentation on how to use with edgecollection.id
	 it('create a edge', function (done) {
	 
	 db.graph.edge.create("graph1", edgecollection.id, vertices[0]._id, vertices[1]._id, {
	 "key1": "val1",
	 "key2": "val2",
	 "key3": null
	 }).then( function (ret) {
	 ret.error.should.equal(false);
	 edges[0] = ret.edge;
	 ret.code.should.equal(202);
	 }).callback(done);
	 })
	 
	 
	 it('lets delete a edge with "match" header and correct revision and the waitForSync param"', function (done) {
	 
	 var options = {};
	 options.match = true;
	 options.waitForSync = true;
	 options.rev = edges[0]._rev;
	 db.graph.edge.delete("graph1", edges[0]._id, options)
	 .then(function (ret) {
	 ret.code.should.equal(200);
	 }).callback(done);
	 })
	 */
	
	// New graph functionality

	it("should offer all vertex collections", function(done) {
	    
	    db.graph.vertexCollections.list("graph1")
		.then(function (ret) {
		    ret.error.should.equal(false);
		    ret.collections.length.should.equal(1);
		    ret.collections[0].should.equal(verticescollection.name);
		    ret.code.should.equal(200);
		}).callback(done);
	});

	it("should offer all edge collections", function(done) {
	    
	    db.graph.edgeCollections.list("graph1")
		.then(function(ret) {

		    ret.error.should.equal(false);
		    ret.collections.length.should.equal(1);
		    ret.collections[0].should.equal(edgecollection.name);
		    ret.code.should.equal(200);
		}).callback(done);
	});
	it('delete graph', function (done) {
	    
	    db.graph.delete("graph1", true)
		.then(function (ret) {
		    ret.error.should.equal(false);
		    ret.code.should.equal(200);
		}).callback(done);
	})

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
		db.graph.delete(graphName, true).end(function(){
		    done();
		});
	    });

	    it("should create an empty graph", function (done) {
		
		db.graph.create(graphName)
		    .then(function (ret) {
			ret.error.should.equal(false);
			ret.graph.name.should.equal(graphName);
			ret.graph.edgeDefinitions.length.should.equal(0);
			ret.graph.orphanCollections.length.should.equal(0);
			ret.code.should.equal(201);
		    }).callback(done);
	    });

	    it("should create a graph with multiple edge definitions", function (done) {
		
		db.graph.create(graphName, edgeDefinitions)
		    .then(function (ret) {
			ret.error.should.equal(false);
			ret.graph.name.should.equal(graphName);
			ret.graph.edgeDefinitions.length.should.equal(2);
			ret.graph.orphanCollections.length.should.equal(0);
			ret.code.should.equal(201);
		    }).callback(done);
	    });

	    it("should create a graph with multiple edge definitions and orphans", function (done) {
		
		db.graph.create(graphName, edgeDefinitions, orphans)
		    .then(function (ret) {
			ret.error.should.equal(false);
			ret.graph.name.should.equal(graphName);
			ret.graph.edgeDefinitions.length.should.equal(2);
			ret.graph.orphanCollections.length.should.equal(2);
			ret.code.should.equal(201);
		    }).callback(done);
	    });

	    describe("management", function() {
		
		beforeEach(function(done) {
		    db.graph.create(graphName, edgeDefinitions, orphans).callback(done);
		});

		it("should add a new vertex collection", function(done) {
		    
		    var toAdd = "UnitTestNewCollection";
		    db.graph.vertexCollections.add(graphName, toAdd)
			.then(function(ret) {
			    ret.error.should.equal(false);
			    ret.code.should.equal(201);
			    ret.graph.name.should.equal(graphName);
			    ret.graph.edgeDefinitions.length.should.equal(2);
			    ret.graph.orphanCollections.length.should.equal(3);
			}).callback(done);
		});

		it("should drop a vertex collection", function(done) {
		    
		    db.graph.vertexCollections.delete(graphName, orphan1)
			.then(function(ret) {
			    ret.error.should.equal(false);
			    ret.code.should.equal(200);
			    ret.graph.name.should.equal(graphName);
			    ret.graph.edgeDefinitions.length.should.equal(2);
			    ret.graph.orphanCollections.length.should.equal(1);
			    ret.graph.orphanCollections[0].should.equal(orphan2);
			}).callback(done);
		});

		it("should not drop a vertex collection used in an edge definition", function(done) {
		    
		    db.graph.vertexCollections.delete(graphName, from1)
			.catch(function(err) {
			    err.code.should.equal(404);
			    done();
			});
		});

		it("should add a new edge definition using single orphan collections", function(done) {
		    
		    var edge = "UnitTestAddEdge";
		    var from = orphan1;
		    var to = orphan2;
		    db.graph.edgeCollections.add(graphName, edge, from, to)
			.then(function(ret) {
			    ret.error.should.equal(false);
			    ret.code.should.equal(201);
			    ret.graph.name.should.equal(graphName);
			    ret.graph.edgeDefinitions.length.should.equal(3);
			    ret.graph.orphanCollections.length.should.equal(0);
			}).callback(done);
		});

		it("should add a new edge definition using collection arrays", function(done) {
		    
		    var edge = "UnitTestAddEdge";
		    var from = [orphan1, orphan2];
		    var to = orphan2;
		    db.graph.edgeCollections.add(graphName, edge, from, to)
			.then(function(ret) {
			    ret.error.should.equal(false);
			    ret.code.should.equal(201);
			    ret.graph.name.should.equal(graphName);
			    ret.graph.edgeDefinitions.length.should.equal(3);
			    ret.graph.orphanCollections.length.should.equal(0);
			}).callback(done);
		});

		it("should add a new edge definition using only one collection array", function(done) {
		    
		    var edge = "UnitTestAddEdge";
		    var from = orphan1;
		    db.graph.edgeCollections.add(graphName, edge, from)
			.then(function(ret) {
			    ret.error.should.equal(false);
			    ret.code.should.equal(201);
			    ret.graph.name.should.equal(graphName);
			    ret.graph.edgeDefinitions.length.should.equal(3);
			    ret.graph.orphanCollections.length.should.equal(1);
			}).callback(done);
		});

		it("should replace an existing edge definition", function(done) {
		    
		    var from = orphan1;
		    var to = orphan2;
		    db.graph.edgeCollections.replace(graphName, e1, from, to)
			.then(function(ret) {
			    ret.error.should.equal(false);
			    ret.code.should.equal(200);
			    ret.graph.name.should.equal(graphName);
			    ret.graph.edgeDefinitions.length.should.equal(2);
			    ret.graph.orphanCollections.length.should.equal(1);
			    ret.graph.orphanCollections[0].should.equal(to1);
			}).callback(done);
		});

		it("should drop an edge definition", function(done) {
		    
		    db.graph.edgeCollections.delete(graphName, e1)
			.then(function(ret) {
			    ret.error.should.equal(false);
			    ret.code.should.equal(200);
			    ret.graph.name.should.equal(graphName);
			    ret.graph.edgeDefinitions.length.should.equal(1);
			    ret.graph.orphanCollections.length.should.equal(3);
			}).callback(done);
		});
	    });

	    describe("creation of", function() {

		var fromVertex;
		var toVertex;

		beforeEach(function(done) {
		    db.graph.create(graphName, edgeDefinitions, orphans).callback(done);
		});

		it("a vertex", function(done) {
		    
		    db.graph.vertex.create(graphName, {
			"key1": "val1",
			"key2": "val2"
		    }, from1).then( function (ret) {
			ret.error.should.equal(false);
			ret.code.should.equal(202);
			ret.vertex._id.split("/")[0].should.equal(from1);
			ret.vertex.should.not.have.property('key1');
			ret.vertex.should.not.have.property('key2');
			//ret.vertex.key1.should.equal("val1");
			//ret.vertex.key2.should.equal("val2");
			fromVertex = ret.vertex._id;
		    }).callback(done);
		});

		it("another vertex", function(done) {
		    
		    db.graph.vertex.create(graphName, {
			"key1": "val1",
			"key2": "val2"
		    }, to1).then( function (ret) {
			ret.error.should.equal(false);
			ret.code.should.equal(202);
			ret.vertex._id.split("/")[0].should.equal(to1);
			ret.vertex.should.not.have.property('key1');
			ret.vertex.should.not.have.property('key2');
			//ret.vertex.key1.should.equal("val1");
			//ret.vertex.key2.should.equal("val2");
			toVertex = ret.vertex._id;
		    }).callback(done);
		});

		it("an orphan", function(done) {
		    
		    db.graph.vertex.create(graphName, {
			"key1": "val1",
			"key2": "val2"
		    }, orphan1).then( function (ret) {
			ret.error.should.equal(false);
			ret.code.should.equal(202);
			ret.vertex._id.split("/")[0].should.equal(orphan1);
			ret.vertex.should.not.have.property('key1');
			ret.vertex.should.not.have.property('key2');
			//ret.vertex.key1.should.equal("val1");
			//ret.vertex.key2.should.equal("val2");
		    }).callback(done);
		});
	    });

	    /* AE: fromVertex, toVertex not defined 
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
	     */
	    
	});
    });
})
