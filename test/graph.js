var arango, db, verticescollection, edgecollection, vertices = [],
  edges = [];
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

describe("graph", function () {


  before(function (done) {
    if (typeof window !== "undefined") {
      port = window.port;
    } else {
      port = require('./port.js');
      port = port.port;
    }

    this.timeout(50000);
    vertices = [];
    edges = [];
    db = arango.Connection("http://127.0.0.1:" + port + "/_system");
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
      this.timeout(50000);
      db.collection.setProperties("_graphs", {waitForSync: false}, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          message.status.should.equal(200);
        });
      });
    })

    it('create a graph', function (done) {
      this.timeout(50000);
      db = db.use('/newDatabase');
      db.graph.create("graph1", verticescollection.name, edgecollection.name, true, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          message.status.should.equal(201);
        });
      });
    })
    it('create another graph', function (done) {
      this.timeout(50000);
      db.graph.waitForSync(false).create("graph2", "hans", "dampf", function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          message.status.should.equal(201);
        });
      });
    })
    it('list graphs', function (done) {
      this.timeout(50000);
      db.graph.list(function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          message.status.should.equal(200);
        });
      });
    })
    it('get graph', function (done) {
      this.timeout(50000);
      db.graph.get("graph1", function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          message.status.should.equal(200);
        });
      });
    })
    it('create a graph without waitForSync', function (done) {
      this.timeout(50000);
      db.graph.create("graph3", "bla", "blub", false, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          //message.status.should.equal(202);
        });
      });
    })
    it('delete graph  without waitForSync', function (done) {
      this.timeout(50000);
      db.graph.delete("graph3", false, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          //message.status.should.equal(202);
        });
      });
    })
    it('request all neighbouring edges of a vertex', function (done) {
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
      db.graph.vertex.get("graph1", "verticescollection/nonExisting", function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal("document not found");
          message.status.should.equal(404);
        });
      });
    })
    it('lets get a vertex with "match" header == false and correct revision"', function (done) {
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
      var data = {
        "newKey": "newValue"
      };
      db.graph.vertex.patch("graph1", vertices[1]._id + 200, data, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal("document not found");
          message.status.should.equal(404);
        });
      });
    })
    it('lets patch a vertex with "match" header == false and wrong revision"', function (done) {
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
      db.graph.vertex.get("graph1", vertices[1]._id, function (err, ret, message) {
        check(done, function () {
          ret.vertex.should.not.have.property("key3");
          ret.vertex.should.have.property('newKey');
        });
      });
    })

    it('lets put a non existing vertex"', function (done) {
      this.timeout(50000);
      var data = {
        "newKey": "newValue"
      };
      db.graph.vertex.put("graph1", vertices[1]._id + 200, data, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal("document not found");
          message.status.should.equal(404);
        });
      });
    })
    it('lets put a vertex with "match" header == false and wrong revision"', function (done) {
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
      db.graph.vertex.delete("graph1", vertices[1]._id + 200, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal("document not found");
          message.status.should.equal(404);
        });
      });
    })
    it('lets delete a vertex with "match" header and wrong revision', function (done) {
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
      db.graph.vertex.create("graph1", {
        "key1": "val1",
        "key2": "val2",
        "key3": null
      }, false, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          vertices[1] = ret.vertex;
          //Assertion currently not working , bug in Arango DB
          //message.status.should.equal(202);
        });
      });
    })
    it('lets delete a vertex with "match" header and correct revision and the waitForSync param"', function (done) {
      this.timeout(50000);
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
      this.timeout(50000);
      db.graph.vertex.create("graph1", {
        "key1": "val1",
        "key2": "val2",
        "key3": null
      }, false, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          vertices[1] = ret.vertex;
          //Assertion currently not working , bug in Arango DB
          //message.status.should.equal(202);
        });
      });
    })


    it('create a edge', function (done) {
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
      db.graph.edge.get("graph1", edges[0]._id + 200, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal("document not found");
          message.status.should.equal(404);
        });
      });
    })

    it('request all edges of a graph', function (done) {
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
      var data = {
        "newKey": "newValue"
      };
      db.graph.edge.patch("graph1", edges[0]._id + 200, data, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal("document not found");
          message.status.should.equal(404);
        });
      });
    })
    it('lets patch a edge with "match" header == false and wrong revision"', function (done) {
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
      db.graph.edge.get("graph1", edges[0]._id, function (err, ret, message) {
        check(done, function () {
          ret.edge.should.not.have.property("key3");
          ret.edge.should.have.property("newKey");
        });
      });
    })

    it('lets put a non existing edge"', function (done) {
      this.timeout(50000);
      var data = {
        "newKey": "newValue"
      };
      db.graph.edge.put("graph1", edges[0]._id + 200, data, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal("document not found");
          message.status.should.equal(404);
        });
      });
    })
    it('lets put a edge with "match" header == false and wrong revision"', function (done) {
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
      db.graph.edge.delete("graph1", edges[0]._id + 200, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal("document not found");
          message.status.should.equal(404);
        });
      });
    })
    it('lets delete a edge with "match" header and wrong revision', function (done) {
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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
      this.timeout(50000);
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

  var graphName = "UnitTestMultiGraph";
  var edgeDefinitions = [
    {
      collection: "UnitTestE1",
      from: ["UnitTestV1"],
      to: ["UnitTestV2"]
    },
    {
      collection: "UnitTestE2",
      from: ["UnitTestV1"],
      to: ["UnitTestV1"]
    }
  ];
  var orphans = ["UnitTestO1", "UnitTest02"];

  before(function() {
    db = db.use('/newDatabase');
  });

  beforeEach(function(done) {
    db.graph.delete(graphName, true, function (err, ret, message){
      done();
    }); 
  });

  it("should create an empty graph", function (done) {
    this.timeout(50000);
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
    this.timeout(50000);
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
    this.timeout(50000);
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

});
