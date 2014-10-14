/*jslint */
/*global describe, before, after, it, describe, window*/
var arango, db, indices = {};
var port;
var timeoutConstant = 5000;
try {
  arango = require('arango');
} catch (e) {
  arango = require('..');
}

function checkOnly(done, f) {
  try {
    f();
  } catch (e) {
    console.log(e);
    done(e);
    throw e;
  }
}

function check(done, f) {
  checkOnly(done, f);
  done();
}

describe("query", function() {

  before(function(done) {
    if (typeof window !== "undefined") {
      port = window.port;
    } else {
      port = require('./port.js');
      port = port.port;
    }
    this.timeout(timeoutConstant);
    db = arango.Connection("http://127.0.0.1:" + port + "/_system");
    db.database.delete("UnitTestDatabase")
    .then(
      function() {
        return db.database.create("UnitTestDatabase");
      },
      function() {
        return db.database.create("UnitTestDatabase");
      }
      // db.database.create.apply(db.database, ["UnitTestDatabase"]),
      // db.database.create.apply(db.database, ["UnitTestDatabase"])
    )
    .then(function() {
      done();
    });
  });

  after(function(done) {
    this.timeout(timeoutConstant);
    db.database.delete("UnitTestDatabase")
    .then(function() {
      done();
    }, function() {
      console.log("Failed to delete Database");
      done();
    });
  });

  describe("graph queries", function() {
    
    var graphName = "routePlanner";
    var fHw = "frenchHighway";
    var gHw = "germanHighway";
    var iHw = "internationalHighway";
    var fC = "frenchCity";
    var gC = "germanCity";
    var berlin, hamburg, cologne, lyon, paris;
    var btoc, btoh, htoc, ptol, btol, btop, htop, htol, ctol, ctop;

    var checkResultIds = function(done, result, expected) {
      expected = expected.sort();
      checkOnly(done, function() {
        var i, res;
        if (Array.isArray(result)) {
          result = result.map(function(r) {
            return r._key;
          }).sort();
          result.length.should.equal(expected.length);
          for (i = 0; i < result.length; i++) {
            res = result[i];
            res.should.equal(expected[i]);
          }
        } else {
          true.should.equal(false);
        }
      });

    };

    before(function (done) {
      this.timeout(timeoutConstant);
      var edgeDefinition = [];
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
      berlin = {_key: "Berlin", _id: gC + "/Berlin", population : 3000000, isCapital : true};
      cologne = {_key: "Cologne", _id: gC + "/Cologne", population : 1000000, isCapital : false};
      hamburg = {_key: "Hamburg",  _id: gC + "/Hamburg", population : 1000000, isCapital : false};
      lyon = {_key: "Lyon",  _id: fC + "/Lyon", population : 80000, isCapital : false};
      paris = {_key: "Paris",  _id: fC + "/Paris", population : 4000000, isCapital : true};
      btoc = {_key: "btoc", distance: 850};
      btoh = {_key: "btoh", distance: 400};
      htoc = {_key: "htoc", distance: 500};
      ptol = {_key: "ptol", distance: 550};
      btol = {_key: "btol", distance: 1100};
      btop = {_key: "btop", distance: 1200};
      htop = {_key: "htop", distance: 900};
      htol = {_key: "htol", distance: 1300};
      ctol = {_key: "ctol", distance: 700};
      ctop = {_key: "ctop", distance: 550};


      db = db.use('/UnitTestDatabase');
      db.graph.create(graphName, edgeDefinition, [], true)
      .then(function() {
      //  db.graph.vertex.create.apply(this, [graphName, berlin, gC])
      return db.graph.vertex.create(graphName, berlin, gC)
      .join([
        db.graph.vertex.create.apply(this, [graphName, cologne, gC]),
        db.graph.vertex.create.apply(this, [graphName, hamburg, gC]),
        db.graph.vertex.create.apply(this, [graphName, lyon, fC]),
        db.graph.vertex.create.apply(this, [graphName, paris, fC])
      ]);
    }
      )
      .then(
        function() {
          return db.graph.edge.create(graphName, btoc, berlin._id, cologne._id, "", gHw)
            .join([
              db.graph.edge.create.apply(this, [graphName, btoh, berlin._id, hamburg._id, "", gHw]),
              db.graph.edge.create.apply(this, [graphName, htoc, hamburg._id, cologne._id, "", gHw]),
              db.graph.edge.create.apply(this, [graphName, ptol, paris._id, lyon._id, "", fHw]),
              db.graph.edge.create.apply(this, [graphName, btol, berlin._id, lyon._id, "", iHw]),
              db.graph.edge.create.apply(this, [graphName, btop, berlin._id, paris._id, "", iHw]),
              db.graph.edge.create.apply(this, [graphName, htop, hamburg._id, paris._id, "", iHw]),
              db.graph.edge.create.apply(this, [graphName, htol, hamburg._id, lyon._id, "", iHw]),
              db.graph.edge.create.apply(this, [graphName, ctol, cologne._id, lyon._id, "", iHw]),
              db.graph.edge.create.apply(this, [graphName, ctop, cologne._id, paris._id, "", iHw])
            ]);
        }
      )
      .then(function() {
        done();
      });
    });

    it("should allow to query all vertices", function(done) {
      this.timeout(timeoutConstant);
      var expected = [
        berlin._key,
        cologne._key, 
        hamburg._key, 
        lyon._key,
        paris._key
      ];
      db.query.for("x").in.graph_vertices(graphName, {}).return("x")
      .exec()
      .then(function(result) {
        checkResultIds(done, result, expected);
        done();
      });
    });

    it("should allow to query all vertices filtered", function(done) {
      this.timeout(timeoutConstant);
      var expected = [
        cologne._key,
        hamburg._key,
        lyon._key
      ];
      db.query.for("x").in.graph_vertices(graphName, {isCapital: false}).return("x")
      .exec()
      .then(function(result) {
        checkResultIds(done, result, expected);
        done();
      });
    });

    it("should allow to query all edges", function(done) {
      this.timeout(timeoutConstant);
      var expected = [
        btoc._key,
        btoh._key, 
        htoc._key, 
        ptol._key,
        btol._key,
        btop._key,
        htop._key,
        htol._key,
        ctol._key,
        ctop._key
      ];
      db.query.for("x").in.graph_edges(graphName, {}).return("x")
      .exec()
      .then(function(result) {
        checkResultIds(done, result, expected);
        done();
      });
    });

    it("should allow to query all edges filtered", function(done) {
      this.timeout(timeoutConstant);
      var expected = [
        btoc._key,
        htoc._key,
        ctol._key,
        ctop._key
      ];
      db.query.for("x").in.graph_edges(graphName, {_key: "Cologne"}).return("x")
      .exec()
      .then(function(result) {
        checkResultIds(done, result, expected);
        done();
      });
    });

    it("should allow to query all neighbors with filtered edges", function(done) {
      this.timeout(timeoutConstant);
      var expFirstEdges = [ctol._key];
      var expFirstVertices = [cologne._key, lyon._key];
      var expSecondEdges = [ctol._key];
      var expSecondVertices = [lyon._key, cologne._key];
      db.query.for("x").in.graph_neighbors(graphName, {}, {edgeExamples : [{distance: 600}, {distance: 700}]}).return("x")
      .exec()
      .then(function(result) {
        checkOnly(done, function() {
          result.length.should.equal(2);
        });
        var first = result[0];
        var second;
        if (first.startVertex !== cologne._id) {
          first = result[1];
          second = result[0];
        } else {
          second = result[1];
        }
        checkResultIds(done, first.path.edges, expFirstEdges);
        checkResultIds(done, first.path.vertices, expFirstVertices);
        checkResultIds(done, second.path.edges, expSecondEdges);
        checkResultIds(done, second.path.vertices, expSecondVertices);
        done();
      });
    });

    it("should allow to query common neighbors", function(done) {
      this.timeout(timeoutConstant);
      var expected = [cologne._key, hamburg._key, lyon._key];
      db.query.for("x").in.graph_common_neighbors(graphName, {isCapital : true}, {isCapital : true}).return("x")
      .exec()
      .then(function(result) {
        checkOnly(done, function() {
          result.length.should.equal(2);
        });
        var first = result[0];
        var second;
        if (first[berlin._id]) {
          second = result[1];
        } else {
          first = result[1];
          second = result[0];
        }
        checkResultIds(done, first[berlin._id][paris._id], expected);
        checkResultIds(done, second[paris._id][berlin._id], expected);
        done();
      });
    });

    it("should allow to find common properties of vertices", function(done) {
      this.timeout(timeoutConstant);
      db.query.for("x").in.graph_common_properties(graphName, berlin._id, {}).return("x")
      .exec()
      .then(function(result) {
        checkOnly(done, function() {
          result.length.should.equal(1);
        });
        var resBerlin = result[0][berlin._id];
        checkOnly(done, function() {
          resBerlin.length.should.equal(1);
          resBerlin[0]._id.should.equal(paris._id);
          resBerlin[0].isCapital.should.equal(true);
          if (resBerlin[0].population) {
            resBerlin[0].population.should.equal(undefined);
          }
        });
        done();
      });
    });

    it("should allow to query shortest paths", function(done) {
      this.timeout(timeoutConstant);
      db.query.for("x").in.graph_shortest_path(graphName, [{_id: cologne._id}, {_id: berlin._id}], lyon._id, {weight: "distance"}).return("{start: x.startVertex, end: x.vertex._id, dist: x.distance, hops: LENGTH(x.paths)}")
      .exec()
      .then(function(result) {
        checkOnly(done, function() {
          result.length.should.equal(2);
        });
        var first = result[0];
        var second;
        if (first.start !== cologne._id) {
          first = result[1];
          second = result[0];
        } else {
          second = result[1];
        }
        checkOnly(done, function() {
          first.start.should.equal(cologne._id);
          first.end.should.equal(lyon._id);
          first.dist.should.equal(700);
          first.hops.should.equal(1);

          second.start.should.equal(berlin._id);
          second.end.should.equal(lyon._id);
          second.dist.should.equal(1100);
          second.hops.should.equal(1);
        });
        done();
      });
    });

    it("should allow to execute traversals", function(done) {
      this.timeout(timeoutConstant);
      var expected = [
        cologne._key,
        paris._key,
        lyon._key
      ];
      db.query.for("x").in.graph_traversal(graphName, hamburg._id, "outbound", {minDepth: 1, maxDepth: 1}).return("x")
      .exec()
      .then(function(result) {
        checkOnly(done, function() {
          result.length.should.equal(1);
        });
        checkResultIds(done, result[0].map(function(v) {
          return v.vertex;
        }), expected);
        done();
      });
    });

    it("should allow to execute tree traversals", function(done) {
      this.timeout(timeoutConstant);
      var expected = [
        cologne._key,
        paris._key,
        lyon._key
      ];
      db.query.for("x").in.graph_traversal_tree(graphName, hamburg._id, "outbound", "connection", {maxDepth: 1}).return("x")
      .exec()
      .then(function(result) {
        checkOnly(done, function() {
          result.length.should.equal(1);
          result = result[0];
          result.length.should.equal(1);
          result = result[0];
          result.length.should.equal(1);
          result = result[0];
          result._id.should.equal(hamburg._id);
        });
        checkResultIds(done, result.connection, expected);
        done();
      });
    });

    it("should allow to query the distance of vertices", function(done) {
      this.timeout(timeoutConstant);
      db.query.for("x").in.graph_distance_to(graphName, [{_id: cologne._id}, {_id: berlin._id}], lyon._id, {weight: "distance"}).return("{start: x.startVertex, end: x.vertex._id, dist: x.distance}")
      .exec()
      .then(function(result) {
        checkOnly(done, function() {
          result.length.should.equal(2);
        });
        var first = result[0];
        var second;
        if (first.start !== cologne._id) {
          first = result[1];
          second = result[0];
        } else {
          second = result[1];
        }
        checkOnly(done, function() {
          first.start.should.equal(cologne._id);
          first.end.should.equal(lyon._id);
          first.dist.should.equal(700);

          second.start.should.equal(berlin._id);
          second.end.should.equal(lyon._id);
          second.dist.should.equal(1100);
        });
        done();
      });
    });

    // Graph Meassurements

    it("should calculate the absolute eccentricity", function(done) {
      this.timeout(timeoutConstant);
      db.query.return.graph_absolute_eccentricity(graphName, {}, {weight: "distance"})
      .exec()
      .then(function(result) {
        checkOnly(done, function() {
          result.length.should.equal(1);
        });
        result = result[0];
        checkOnly(done, function() {
          result[hamburg._id].should.equal(1200);
          result[berlin._id].should.equal(1200);
          result[paris._id].should.equal(1200);
          result[lyon._id].should.equal(1200);
          result[cologne._id].should.equal(850);
        });
        done();
      });
    });
 
    it("should calculate the normalized eccentricity", function(done) {
      this.timeout(timeoutConstant);
      db.query.return.graph_eccentricity(graphName, {weight: "distance"})
      .exec()
      .then(function(result) {
        checkOnly(done, function() {
          result.length.should.equal(1);
        });
        result = result[0];
        checkOnly(done, function() {
          result[hamburg._id].should.equal(0.7083333333333335);
          result[berlin._id].should.equal(0.7083333333333335);
          result[paris._id].should.equal(0.7083333333333335);
          result[lyon._id].should.equal(0.7083333333333335);
          result[cologne._id].should.equal(1);
        });
        done();
      });
    });

    it("should calculate the absolute closeness", function(done) {
      this.timeout(timeoutConstant);
      db.query.return.graph_absolute_closeness(graphName, {}, {weight: "distance"})
      .exec()
      .then(function(result) {
        checkOnly(done, function() {
          result.length.should.equal(1);
        });
        result = result[0];
        checkOnly(done, function() {
          result[hamburg._id].should.equal(3000);
          result[berlin._id].should.equal(3550);
          result[paris._id].should.equal(3200);
          result[lyon._id].should.equal(3550);
          result[cologne._id].should.equal(2600);
        });
        done();
      });
    });
 
    it("should calculate the relative closeness", function(done) {
      this.timeout(timeoutConstant);
      db.query.return.graph_closeness(graphName, {weight: "distance"})
      .exec()
      .then(function(result) {
        checkOnly(done, function() {
          result.length.should.equal(1);
        });
        result = result[0];
        checkOnly(done, function() {
          result[hamburg._id].should.equal(0.8666666666666666);
          result[berlin._id].should.equal(0.7323943661971831);
          result[paris._id].should.equal(0.8125);
          result[lyon._id].should.equal(0.7323943661971831);
          result[cologne._id].should.equal(1);
        });
        done();
      });
    });
 
    it("should calculate the absolute betweenness", function(done) {
      this.timeout(timeoutConstant);
      db.query.return.graph_absolute_betweenness(graphName, {weight: "distance"})
      .exec()
      .then(function(result) {
        checkOnly(done, function() {
          result.length.should.equal(1);
        });
        result = result[0];
        checkOnly(done, function() {
          result[hamburg._id].should.equal(0);
          result[berlin._id].should.equal(0);
          result[paris._id].should.equal(0);
          result[lyon._id].should.equal(0);
          result[cologne._id].should.equal(2);
        });
        done();
      });
    });
 
    it("should calculate the relative betweenness", function(done) {
      this.timeout(timeoutConstant);
      db.query.return.graph_betweenness(graphName, {weight: "distance"})
      .exec()
      .then(function(result) {
        checkOnly(done, function() {
          result.length.should.equal(1);
        });
        result = result[0];
        checkOnly(done, function() {
          result[hamburg._id].should.equal(0);
          result[berlin._id].should.equal(0);
          result[paris._id].should.equal(0);
          result[lyon._id].should.equal(0);
          result[cologne._id].should.equal(1);
        });
        done();
      });
    });
 
    it("should calculate the radius", function(done) {
      this.timeout(timeoutConstant);
      db.query.return.graph_radius(graphName, {weight: "distance"})
      .exec()
      .then(function(result) {
        check(done, function() {
          result.length.should.equal(1);
          result[0].should.equal(850);
        });
      });
    });

    it("should calculate the diameter", function(done) {
      this.timeout(timeoutConstant);
      db.query.return.graph_diameter(graphName, {weight: "distance"})
      .exec()
      .then(function(result) {
        check(done, function() {
          result.length.should.equal(1);
          result[0].should.equal(1200);
        });
      });
    });

  });

});
