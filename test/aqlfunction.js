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

function filter(data) {
  var result = [ ];
  for (i = 0; i < data.length; ++i) {
    if (data[i].name.match(/^javascripttest/)) {
      result.push(data[i]);
    }
  }
  return result;
}

describe("aqlfunction", function() {
    if (typeof window !== "undefined") {
        port = window.port;
    } else {
        port = require('./port.js');
        port = port.port;
    }

    db = arango.Connection("http://127.0.0.1:" + port);

    it('should be able to create an aql function', function(done) {
        db.aqlfunction.create("javascripttest::temperature::celsiustofahrenheit",
            "function (celsius) { return celsius * 1.8 + 32; }", null, function(err, ret) {
                check(done, function() {
                    ret.error.should.equal(false);
                });
            });
    })
    it('should be able to create another aql function', function(done) {
        db.aqlfunction.create("javascripttest::temperature::celsiustofahrenheit2",
            "function (celsius) { return celsius * 2.8 + 32; }", null, function(err, ret) {
                check(done, function() {
                    ret.error.should.equal(false);
                });
            });
    })
    it('should be able to create another aql function, different namespace', function(done) {
        db.aqlfunction.create("javascripttest2::temperature::celsiustofahrenheit2",
            "function (celsius) { return celsius * 2.8 + 32; }", null, function(err, ret) {
                check(done, function() {
                    ret.error.should.equal(false);
                });
            });
    })
    it('should be able to get all aql function', function(done) {
        db.aqlfunction.get(null, function(err, ret) {
            check(done, function() {
                filter(ret).length.should.equal(3);
            });
        });
    })
    it('should be able to get all aql functions in one namespace', function(done) {
        db.aqlfunction.get("javascripttest", function(err, ret) {
            check(done, function() {
                filter(ret).length.should.equal(2);
            });
        });
    })
    it('should delete all aql functions in one namespace', function(done) {
        db.aqlfunction.delete("javascripttest", true, function(err, ret) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.code.should.equal(200);
            });
        });
    })
    it('should be able to get all aql function, one should be left', function(done) {
        db.aqlfunction.get(null, function(err, ret) {
            check(done, function() {
                filter(ret).length.should.equal(1);
            });
        });
    })
    it('should delete a aql function by its name', function(done) {
        db.aqlfunction.delete("javascripttest2", true, function(err, ret) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.code.should.equal(200);
            });
        });
    })
    it('should be able to get all aql function, none should be left', function(done) {
        db.aqlfunction.get(null, function(err, ret) {
            check(done, function() {
                filter(ret).length.should.equal(0);
            });
        });
    })
})
