var arango, db;
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


describe("traversal", function() {


    before(function(done) {
        if (typeof window !== "undefined") {
            port = window.port;
        } else {
            port = require('./port.js');
            port = port.port;
        }

        this.timeout(20000);
        db = arango.Connection("http://127.0.0.1:"+port+"/_system");
        db.database.delete("newDatabase", function(err, ret) {
            db.database.create("newDatabase", function(err, ret) {
                db = db.use('/newDatabase');
                db.graph.create("graph1", "verticescollection", "edgecollection", true, function(err, ret, message) {
                    var data = [{
                        "_key": "Anton",
                        "value1": 25,
                        "value2": "test",
                        "allowed": true
                    }, {
                        "_key": "Bert",
                        "value1": "baz"
                    }, {
                        "_key": "Cindy",
                        "value1": "baaaz"
                    }, {
                        "_key": "Emil",
                        "value1": "batz"
                    }];
                    db.import.importJSONData("verticescollection", data, function(err, ret, message) {
                        var data = [{
                            "_from": "verticescollection/Anton",
                            "_to": "verticescollection/Bert"
                        }, {
                            "_from": "verticescollection/Bert",
                            "_to": "verticescollection/Cindy"
                        }, {
                            "_from": "verticescollection/Cindy",
                            "_to": "verticescollection/Emil"
                        }, {
                            "_from": "verticescollection/Anton",
                            "_to": "verticescollection/Emil",
                            "name": "other name"
                        }];
                        db.import.importJSONData("edgecollection", data, function(err, ret, message) {
                            done();
                        });
                    });
                });
            });
        });

    })

    it('lets get the list of all documents of verticescollection', function(done) {
        db.document.list("verticescollection", function(err, ret, message) {
            check(done, function() {
                ret.documents.length.should.equal(4);
                message.status.should.equal(200);
            });
        });
    })

    it('startTraversal in plain form', function(done) {

        var options = {};
        options.direction = "outbound";

        db.traversal.startTraversal("verticescollection/Anton", "edgecollection", options, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.result.visited.vertices.length.should.equal(5);
                message.status.should.equal(200);
            });
        });
    })
    it('startTraversal in with min depth and filter Bert by an attribute', function(done) {

        var options = {};
        options.minDepth = 1;
        options.filter = 'if (vertex.value1 === "baz") {return "exclude";}return;';

        options.direction = "outbound";

        db.traversal.startTraversal("verticescollection/Anton", "edgecollection", options, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.result.visited.vertices.length.should.equal(3);
                message.status.should.equal(200);
            });
        });
    })

    it('startTraversal in with max depth, order  and strategy', function(done) {

        var options = {};
        options.maxDepth = 2;
        options.strategy = "depthfirst";
        options.order = "postorder";

        options.direction = "outbound";

        db.traversal.startTraversal("verticescollection/Anton", "edgecollection", options, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.result.visited.vertices.length.should.equal(4);
                message.status.should.equal(200);
            });
        });
    })

    it('startTraversal with visitor, init, itemOrder  and expander (only use outbound except for Emil)', function(done) {

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

        db.traversal.startTraversal("verticescollection/Anton", "edgecollection", options, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.result.visited.should.equal(5);
                ret.result.should.have.property('myVertices');
                message.status.should.equal(200);
            });
        });
    })

})
