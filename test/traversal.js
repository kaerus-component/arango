var arango;

try {
    arango = require('arango')
} catch (e) {
    arango = require('..')
}

describe("traversal", function () {

    var db;
    
    before(function (done) {
	
	db = arango.Connection("/_system");
	db.database.delete("newDatabase").end( function () {
	    db.database.create("newDatabase").then(function () {
		db = db.use('/newDatabase');

		db.batch.start();
		
		db.graph.create("graph1", "verticescollection", "edgecollection", true);

		db.document.create("verticescollection", {
		    "_key": "Anton",
		    "value1": 25,
		    "value2": "test",
		    "allowed": true
		});
		db.document.create("verticescollection", {
		    "_key": "Bert",
		    "value1": "baz"
		});
		db.document.create("verticescollection", {
		    "_key": "Cindy",
		    "value1": "baaaz"
		});
		db.document.create("verticescollection", {
		    "_key": "Emil",
		    "value1": "batz"
		});
		db.edge.create("edgecollection",
			       "verticescollection/Anton",
			       "verticescollection/Bert", {});
		
		db.edge.create("edgecollection",
			       "verticescollection/Bert",
			       "verticescollection/Cindy", {});
		
		db.edge.create("edgecollection",
			       "verticescollection/Cindy",
			       "verticescollection/Emil", {});
		
		db.edge.create("edgecollection",
			       "verticescollection/Anton",
			       "verticescollection/Emil", {
				   "name": "other name"});
		return db.batch.exec();
	    }).callback(done);
	});
    });


    it('lets get the list of all documents of verticescollection', function (done) {
	
	db.document.list("verticescollection")
	    .then(function (ret) {
		ret.documents.length.should.equal(4);
		ret.code.should.equal(200);
	    }).callback(done);
    })
    
    it('lets get the list of all documents of edgecollection', function (done) {
	
	db.document.list("edgecollection")
	    .then(function (ret) {
		ret.documents.length.should.equal(4);
		ret.code.should.equal(200);
	    }).callback(done);
    })

    it('startTraversal in plain form', function (done) {
	
	var options = {};
	options.direction = "outbound";

	db.traversal.startTraversal("verticescollection/Anton", "edgecollection", options)
	    .then(function (ret) {
		ret.error.should.equal(false);
		ret.result.visited.vertices.length.should.equal(5);
		ret.code.should.equal(200);
	    }).callback(done);
    })
    
    it('startTraversal in with min depth and filter Bert by an attribute', function (done) {
	
	var options = {};
	options.minDepth = 1;
	options.filter = 'if (vertex.value1 === "baz") {return "exclude";}return;';

	options.direction = "outbound";

	db.traversal.startTraversal("verticescollection/Anton", "edgecollection", options)
	    .then(function (ret) {
		ret.error.should.equal(false);
		ret.result.visited.vertices.length.should.equal(3);
		ret.code.should.equal(200);
	    }).callback(done);
    })

    it('startTraversal in with max depth, order  and strategy', function (done) {
	
	var options = {};
	options.maxDepth = 2;
	options.strategy = "depthfirst";
	options.order = "postorder";

	options.direction = "outbound";

	db.traversal.startTraversal("verticescollection/Anton", "edgecollection", options)
	    .then(function (ret) {
		ret.error.should.equal(false);
		ret.result.visited.vertices.length.should.equal(4);
		ret.code.should.equal(200);
	    }).callback(done);
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
	    'return connections;';

	db.traversal.startTraversal("verticescollection/Anton", "edgecollection", options)
	    .then(function (ret) {
		ret.error.should.equal(false);
		ret.result.visited.should.equal(5);
		ret.result.should.have.property('myVertices');
		ret.code.should.equal(200);
	    }).callback(done);
    })

})
