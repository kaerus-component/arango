var arango, db;

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


describe("traversal", function () {

    before(function (done) {
	
	db = arango.Connection("/_system");
	db.database.delete("newDatabase", function (err, ret) {
	    db.database.create("newDatabase", function (err, ret) {
		db = db.use('/newDatabase');
		db.graph.create("graph1", "verticescollection", "edgecollection", true, function (err, ret, message) {
		    db.document.create("verticescollection", {
			"_key": "Anton",
			"value1": 25,
			"value2": "test",
			"allowed": true
		    }, function (err, ret, message) {
			db.document.create("verticescollection", {
			    "_key": "Bert",
			    "value1": "baz"
			}, function (err, ret, message) {
			    db.document.create("verticescollection", {
				"_key": "Cindy",
				"value1": "baaaz"
			    }, function (err, ret, message) {
				db.document.create("verticescollection", {
				    "_key": "Emil",
				    "value1": "batz"
				}, function (err, ret, message) {
				    db.edge.create("edgecollection",
						   "verticescollection/Anton",
						   "verticescollection/Bert", {}
						   , function (err, ret, message) {
						       db.edge.create("edgecollection",
								      "verticescollection/Bert",
								      "verticescollection/Cindy", {}
								      , function (err, ret, message) {
									  db.edge.create("edgecollection",
											 "verticescollection/Cindy",
											 "verticescollection/Emil", {}
											 , function (err, ret, message) {
											     db.edge.create("edgecollection",
													    "verticescollection/Anton",
													    "verticescollection/Emil", {
														"name": "other name"
													    }, function (err, ret, message) {
														done();
													    })
											 });
								      });
						   });
				});
			    });
			});
		    });
		});
	    });
	});
    });


    it('lets get the list of all documents of verticescollection', function (done) {
	
	db.document.list("verticescollection", function (err, ret, message) {
	    check(done, function () {
		ret.documents.length.should.equal(4);
		message.status.should.equal(200);
	    });
	});
    })
    it('lets get the list of all documents of edgecollection', function (done) {
	
	db.document.list("edgecollection", function (err, ret, message) {
	    check(done, function () {
		ret.documents.length.should.equal(4);
		message.status.should.equal(200);
	    });
	});
    })

    it('startTraversal in plain form', function (done) {
	
	var options = {};
	options.direction = "outbound";

	db.traversal.startTraversal("verticescollection/Anton", "edgecollection", options, function (err, ret, message) {
	    check(done, function () {
		ret.error.should.equal(false);
		ret.result.visited.vertices.length.should.equal(5);
		message.status.should.equal(200);
	    });
	});
    })
    it('startTraversal in with min depth and filter Bert by an attribute', function (done) {
	
	var options = {};
	options.minDepth = 1;
	options.filter = 'if (vertex.value1 === "baz") {return "exclude";}return;';

	options.direction = "outbound";

	db.traversal.startTraversal("verticescollection/Anton", "edgecollection", options, function (err, ret, message) {
	    check(done, function () {
		ret.error.should.equal(false);
		ret.result.visited.vertices.length.should.equal(3);
		message.status.should.equal(200);
	    });
	});
    })

    it('startTraversal in with max depth, order  and strategy', function (done) {
	
	var options = {};
	options.maxDepth = 2;
	options.strategy = "depthfirst";
	options.order = "postorder";

	options.direction = "outbound";

	db.traversal.startTraversal("verticescollection/Anton", "edgecollection", options, function (err, ret, message) {
	    check(done, function () {
		ret.error.should.equal(false);
		ret.result.visited.vertices.length.should.equal(4);
		message.status.should.equal(200);
	    });
	});
    })

    it('startTraversal with visitor, init, itemOrder  and expander (only use outbound except for Emil)', function (done) {
	
	var options = {};
	options.itemOrder = "backward";
	options.visitor = "result.visited++; result.myVertices.push(vertex);"
	options.init = 'result.visited = 0; result.myVertices = [ ];'

	options.expander = 'var connections = [ ];' +
	    'if (vertex._key.indexOf("Anton") !== -1) {' +
	    'config.edgeCollection.outEdges(vertex).forEach(function (e) {' +
	    'connections.push({ vertex: require("internal").db._document(e._from), edge: e});' +
	    '})' +
	    '}' +
	    'if (vertex._key.indexOf("Bert") !== -1) {' +
	    'config.edgeCollection.outEdges(vertex).forEach(function (e) {' +
	    'connections.push({ vertex: require("internal").db._document(e._from), edge: e});' +
	    '})' +
	    '}' +
	    'if (vertex._key.indexOf("Cindy") !== -1) {' +
	    'config.edgeCollection.outEdges(vertex).forEach(function (e) {' +
	    'connections.push({ vertex: require("internal").db._document(e._from), edge: e});' +
	    '})' +
	    '}' +
	    'if (vertex._key.indexOf("Emil") !== -1) {' +
	    'config.edgeCollection.inEdges(vertex).forEach(function (e) {' +
	    'connections.push({ vertex: require("internal").db._document(e.to), edge: e});' +
	    '})' +
	    '}' +
	    'return connections;'

	db.traversal.startTraversal("verticescollection/Anton", "edgecollection", options, function (err, ret, message) {
	    check(done, function () {
		ret.error.should.equal(false);
		ret.result.visited.should.equal(5);
		ret.result.should.have.property('myVertices');
		message.status.should.equal(200);
	    });
	});
    })

})
