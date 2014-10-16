/*jslint */
/*global describe, before, after, it, describe, window*/
var arango, db, indices = {};

try {
    arango = require('arango');
} catch (e) {
    arango = require('..');
}

describe("query", function() {

    before(function(done) {

	db = arango.Connection('/_system');
	
	db.database.delete("UnitTestDatabase").end(function() {
	    db.database.create("UnitTestDatabase").callback(done);
	});
    });

    after(function(done) {
	db.use('/_system').database.delete("UnitTestDatabase").callback(done);
	    
    });

    describe("graph queries", function() {
	
	var graphName = "routePlanner";
	var fHw = "frenchHighway";
	var gHw = "germanHighway";
	var iHw = "internationalHighway";
	var fC = "frenchCity";
	var gC = "germanCity";
	var V;

	function checkResultIds(result, expected) {
	    
	    expected = expected.sort();
	    
	    if (Array.isArray(result)) {
		result = result.map(function(r) {
		    return r._key;
		}).sort();
		
		result.length.should.equal(expected.length);

		result.forEach(function(res,i){
		    res.should.equal(expected[i]);
		});
		
	    } else {
		true.should.equal(false); // ?
 	    }
	};
	
	var edgeDefinition = [];
	
	before(function (done) {
	    
	    edgeDefinition.push({
		collection: gHw,
		from: [gC],
		to: [gC]
	    });
	    
	    edgeDefinition.push({
		collection: fHw,
		from: [fC],
		to: [fC]
	    });
	    
	    edgeDefinition.push({
		collection: iHw,
		from: [fC, gC],
		to: [fC, gC]
	    });

	    V = {
		berlin:{_key: "Berlin", _id: gC + "/Berlin", population : 3000000, isCapital : true},
		cologne:{_key: "Cologne", _id: gC + "/Cologne", population : 1000000, isCapital : false},
		hamburg:{_key: "Hamburg",  _id: gC + "/Hamburg", population : 1000000, isCapital : false},
		lyon:{_key: "Lyon",  _id: fC + "/Lyon", population : 80000, isCapital : false},
		paris:{_key: "Paris",  _id: fC + "/Paris", population : 4000000, isCapital : true},
		btoc:{_key: "btoc", distance: 850},
		btoh:{_key: "btoh", distance: 400},
		htoc:{_key: "htoc", distance: 500},
		ptol:{_key: "ptol", distance: 550},
		btol:{_key: "btol", distance: 1100},
		btop:{_key: "btop", distance: 1200},
		htop:{_key: "htop", distance: 900},
		htol:{_key: "htol", distance: 1300},
		ctol:{_key: "ctol", distance: 700},
		ctop:{_key: "ctop", distance: 550}
	    };
	    
	    db = db.use('/UnitTestDatabase');
	    db.batch.start();
	    db.graph.create(graphName, edgeDefinition, [], true);
	    db.graph.vertexCollections.add(graphName,gC);
	    db.graph.vertexCollections.add(graphName,fC);
	    db.batch.exec().then(function() {
		/* create edge collections */
		db.batch.start();
		/* germanHighWay from germanCity -> germanCity */
		db.graph.edgeCollections.add(graphName,gHw,gC,gC);
		/* frenchHighWay from frenchCity -> frenchCity */
		db.graph.edgeCollections.add(graphName,fHw,fC,fC);
		/* internationalHighWay from germanCity <-> frenchCity */
		db.graph.edgeCollections.add(graphName,iHw,[gC,fC],[fC,gC]);
		
		return db.batch.exec();
	    }).then(function(){
		db.batch.start();
		/* create vertices */
		db.graph.vertex.create(graphName, V.berlin, gC);
		db.graph.vertex.create(graphName, V.cologne, gC);
		db.graph.vertex.create(graphName, V.hamburg, gC);
		db.graph.vertex.create(graphName, V.lyon, fC);
		db.graph.vertex.create(graphName, V.paris, fC);
		/* create edges */
		db.graph.edge.create(graphName, V.btoc, V.berlin._id, V.cologne._id, "", gHw);
		db.graph.edge.create(graphName, V.btoh, V.berlin._id, V.hamburg._id, "", gHw);
		db.graph.edge.create(graphName, V.htoc, V.hamburg._id, V.cologne._id, "", gHw);
		db.graph.edge.create(graphName, V.ptol, V.paris._id, V.lyon._id, "", fHw);
		db.graph.edge.create(graphName, V.btol, V.berlin._id, V.lyon._id, "", iHw);
		db.graph.edge.create(graphName, V.btop, V.berlin._id, V.paris._id, "", iHw);
		db.graph.edge.create(graphName, V.htop, V.hamburg._id, V.paris._id, "", iHw);
		db.graph.edge.create(graphName, V.htol, V.hamburg._id, V.lyon._id, "", iHw);
		db.graph.edge.create(graphName, V.ctol, V.cologne._id, V.lyon._id, "", iHw);
		db.graph.edge.create(graphName, V.ctop, V.cologne._id, V.paris._id, "", iHw);
		
		return db.batch.exec();
	    }).callback(done);
	});

	it("should allow to query all vertices", function(done) {

	    var expected = [
		V.berlin._key,
		V.cologne._key, 
		V.hamburg._key, 
		V.lyon._key,
		V.paris._key
	    ];
	    db.query.for("x").in.graph_vertices(graphName, {}).return("x")
		.exec()
		.then(function(result) {
		    checkResultIds(result, expected);
		}).callback(done);
	});

	it("should allow to query all vertices filtered", function(done) {

	    var expected = [
		V.cologne._key,
		V.hamburg._key,
		V.lyon._key
	    ];
	    db.query.for("x").in.graph_vertices(graphName, {isCapital: false}).return("x")
		.exec()
		.then(function(result) {
		    checkResultIds(result, expected);
		}).callback(done);
	});

	it("should allow to query all edges", function(done) {

	    var expected = [
		V.btoc._key,
		V.btoh._key, 
		V.htoc._key, 
		V.ptol._key,
		V.btol._key,
		V.btop._key,
		V.htop._key,
		V.htol._key,
		V.ctol._key,
		V.ctop._key
	    ];
	    db.query.for("x").in.graph_edges(graphName, {}).return("x")
		.exec()
		.then(function(result) {
		    checkResultIds(result, expected);
		}).callback(done);
	});

	it("should allow to query all edges filtered", function(done) {

	    var expected = [
		V.btoc._key,
		V.htoc._key,
		V.ctol._key,
		V.ctop._key
	    ];
	    db.query.for("x").in.graph_edges(graphName, {_key: "Cologne"}).return("x")
		.exec()
		.then(function(result) {
		    checkResultIds(result, expected);
		}).callback(done);
	});

	it("should allow to query all neighbors with filtered edges", function(done) {

	    var expFirstEdges = [V.ctol._key];
	    var expFirstVertices = [V.cologne._key, V.lyon._key];
	    var expSecondEdges = [V.ctol._key];
	    var expSecondVertices = [V.lyon._key, V.cologne._key];
	    db.query.for("x").in.graph_neighbors(graphName, {}, {edgeExamples : [{distance: 600}, {distance: 700}]}).return("x")
		.exec()
		.then(function(result) {
		   
		    result.length.should.equal(2);
		    
		    var first = result[0];
		    var second;
		    if (first.startVertex !== V.cologne._id) {
			first = result[1];
			second = result[0];
		    } else {
			second = result[1];
		    }
		    checkResultIds(first.path.edges, expFirstEdges);
		    checkResultIds(first.path.vertices, expFirstVertices);
		    checkResultIds(second.path.edges, expSecondEdges);
		    checkResultIds(second.path.vertices, expSecondVertices);
		}).callback(done);
	});

	it("should allow to query common neighbors", function(done) {

	    var expected = [V.cologne._key, V.hamburg._key, V.lyon._key];
	    db.query.for("x").in.graph_common_neighbors(graphName, {isCapital : true}, {isCapital : true}).return("x")
		.exec()
		.then(function(result) {
		    result.length.should.equal(2);
		    var first = result[0];
		    var second;
		    if (first[V.berlin._id]) {
			second = result[1];
		    } else {
			first = result[1];
			second = result[0];
		    }
		    checkResultIds(first[V.berlin._id][V.paris._id], expected);
		    checkResultIds(second[V.paris._id][V.berlin._id], expected);
		}).callback(done);
	});

	it("should allow to find common properties of vertices", function(done) {

	    db.query.for("x").in.graph_common_properties(graphName, V.berlin._id, {}).return("x")
		.exec()
		.then(function(result) {
		    result.length.should.equal(1);
		    
		    var resBerlin = result[0][V.berlin._id];
		    resBerlin.length.should.equal(1);
		    resBerlin[0]._id.should.equal(V.paris._id);
		    resBerlin[0].isCapital.should.equal(true);
		    if (resBerlin[0].population) {
			resBerlin[0].population.should.equal(undefined);
		    }
		}).callback(done);
	});

	it("should allow to query shortest paths", function(done) {

	    db.query.for("x").in
		.graph_shortest_path(graphName, [{_id: V.cologne._id},{_id: V.berlin._id}], V.lyon._id,{weight: "distance"}).return("{start: x.startVertex, end: x.vertex._id, dist: x.distance, hops: LENGTH(x.paths)}")
		.exec()
		.then(function(result) {
		    result.length.should.equal(2);
		    var first = result[0];
		    var second;
		    
		    if (first.start !== V.cologne._id) {
			first = result[1];
			second = result[0];
		    } else {
			second = result[1];
		    }
		    first.start.should.equal(V.cologne._id);
		    first.end.should.equal(V.lyon._id);
		    first.dist.should.equal(700);
		    first.hops.should.equal(1);
		    
		    second.start.should.equal(V.berlin._id);
		    second.end.should.equal(V.lyon._id);
		    second.dist.should.equal(1100);
		    second.hops.should.equal(1);
		}).callback(done);
	});

	it("should allow to execute traversals", function(done) {

	    var expected = [
		V.cologne._key,
		V.paris._key,
		V.lyon._key
	    ];
	    db.query.for("x").in.graph_traversal(graphName, V.hamburg._id, "outbound", {minDepth: 1, maxDepth: 1}).return("x")
		.exec()
		.then(function(result) {
		    result.length.should.equal(1);
		    
		    checkResultIds(result[0].map(function(v) {
			return v.vertex;
		    }), expected);
		}).callback(done);
	});

	it("should allow to execute tree traversals", function(done) {

	    var expected = [
		V.cologne._key,
		V.paris._key,
		V.lyon._key
	    ];
	    db.query.for("x").in.graph_traversal_tree(graphName, V.hamburg._id, "outbound", "connection", {maxDepth: 1}).return("x")
		.exec()
		.then(function(result) {

		    result.length.should.equal(1);
		    result = result[0];
		    result.length.should.equal(1);
		    result = result[0];
		    result.length.should.equal(1);
		    result = result[0];
		    result._id.should.equal(V.hamburg._id);
		    
		    checkResultIds(result.connection, expected);
		}).callback(done);
	});

	it("should allow to query the distance of vertices", function(done) {

	    db.query.for("x").in.graph_distance_to(graphName, [{_id: V.cologne._id}, {_id: V.berlin._id}], V.lyon._id, {weight: "distance"}).return("{start: x.startVertex, end: x.vertex._id, dist: x.distance}")
		.exec()
		.then(function(result) {
		    result.length.should.equal(2);
		    var first = result[0];
		    var second;
		    if (first.start !== V.cologne._id) {
			first = result[1];
			second = result[0];
		    } else {
			second = result[1];
		    }
		    first.start.should.equal(V.cologne._id);
		    first.end.should.equal(V.lyon._id);
		    first.dist.should.equal(700);

		    second.start.should.equal(V.berlin._id);
		    second.end.should.equal(V.lyon._id);
		    second.dist.should.equal(1100);

		}).callback(done);
	});

	// Graph Meassurements

	it("should calculate the absolute eccentricity", function(done) {

	    db.query.return.graph_absolute_eccentricity(graphName, {}, {weight: "distance"})
		.exec()
		.then(function(result) {
		    result.length.should.equal(1);
		    result = result[0];
		    result[V.hamburg._id].should.equal(1200);
		    result[V.berlin._id].should.equal(1200);
		    result[V.paris._id].should.equal(1200);
		    result[V.lyon._id].should.equal(1200);
		    result[V.cologne._id].should.equal(850);
		}).callback(done);
	});
	
	it("should calculate the normalized eccentricity", function(done) {

	    db.query.return.graph_eccentricity(graphName, {weight: "distance"})
		.exec()
		.then(function(result) {

		    result.length.should.equal(1);

		    result = result[0];

		    result[V.hamburg._id].should.equal(0.7083333333333335);
		    result[V.berlin._id].should.equal(0.7083333333333335);
		    result[V.paris._id].should.equal(0.7083333333333335);
		    result[V.lyon._id].should.equal(0.7083333333333335);
		    result[V.cologne._id].should.equal(1);

		}).callback(done);
	});

	it("should calculate the absolute closeness", function(done) {

	    db.query.return.graph_absolute_closeness(graphName, {}, {weight: "distance"})
		.exec()
		.then(function(result) {

		    result.length.should.equal(1);

		    result = result[0];

		    result[V.hamburg._id].should.equal(3000);
		    result[V.berlin._id].should.equal(3550);
		    result[V.paris._id].should.equal(3200);
		    result[V.lyon._id].should.equal(3550);
		    result[V.cologne._id].should.equal(2600);

		}).callback(done);
	});
	
	it("should calculate the relative closeness", function(done) {

	    db.query.return.graph_closeness(graphName, {weight: "distance"})
		.exec()
		.then(function(result) {
		    result.length.should.equal(1);

		    result = result[0];

		    result[V.hamburg._id].should.equal(0.8666666666666666);
		    result[V.berlin._id].should.equal(0.7323943661971831);
		    result[V.paris._id].should.equal(0.8125);
		    result[V.lyon._id].should.equal(0.7323943661971831);
		    result[V.cologne._id].should.equal(1);
		}).callback(done);
	});
	
	it("should calculate the absolute betweenness", function(done) {

	    db.query.return.graph_absolute_betweenness(graphName, {weight: "distance"})
		.exec()
		.then(function(result) {
		    result.length.should.equal(1);

		    result = result[0];

		    result[V.hamburg._id].should.equal(0);
		    result[V.berlin._id].should.equal(0);
		    result[V.paris._id].should.equal(0);
		    result[V.lyon._id].should.equal(0);
		    result[V.cologne._id].should.equal(2);

		}).callback(done);
	});
	
	it("should calculate the relative betweenness", function(done) {

	    db.query.return.graph_betweenness(graphName, {weight: "distance"})
		.exec()
		.then(function(result) {
		    result.length.should.equal(1);

		    result = result[0];

		    result[V.hamburg._id].should.equal(0);
		    result[V.berlin._id].should.equal(0);
		    result[V.paris._id].should.equal(0);
		    result[V.lyon._id].should.equal(0);
		    result[V.cologne._id].should.equal(1);

		}).callback(done);
	});
	
	it("should calculate the radius", function(done) {

	    db.query.return.graph_radius(graphName, {weight: "distance"})
		.exec()
		.then(function(result) {
		    result.length.should.equal(1);
		    result[0].should.equal(850);
		}).callback(done);
	});

	it("should calculate the diameter", function(done) {

	    db.query.return.graph_diameter(graphName, {weight: "distance"})
		.exec()
		.then(function(result) {
		    result.length.should.equal(1);
		    result[0].should.equal(1200);
		}).callback(done);
	});

    });

});
