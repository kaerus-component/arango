var arango, db;
var port;
try {
  arango = require('arangojs')
} catch (e) {
  arango = require('..')
}

function check(done, f) {
  try {
    if (f) f()
    done()
  } catch (e) {
    console.log(e);
    done(e)
  }
}

describe("import", function () {

  before(function (done) {
    if (typeof window !== "undefined") {
      port = window.port;
    } else {
      port = require('./port.js');
      port = port.port;
    }

    this.timeout(50000);
    db = arango.Connection("http://127.0.0.1:" + port + "/_system");
    db.database.delete("newDatabase", function (err, ret) {
      db.database.create("newDatabase", function (err, ret) {
        db = db.use('/newDatabase');
        db.collection.create("collection", function (err, ret) {
          done();
        });
      });
    });
  })

  describe("importFunctions", function () {

    beforeEach(function (done) {
      this.timeout(50000);
      db.collection.create("collection", function (err, ret) {
        done();
      });
    })

    afterEach(function (done) {
      this.timeout(50000);
      db.collection.delete("collection", function (err, ret) {
        db.collection.delete("newCollection", function (err, ret) {
          done();
        });
      })
    })
    it('importJSONData with single JSON Object and waitForSync', function (done) {

      this.timeout(50000);

      var options = {
        "waitForSync": true,
        "details": true
      };

      var data = [
        {
          "_key": "abc",
          "value1": 25,
          "value2": "test",
          "allowed": true
        },
        {
          "_key": "foo",
          "name": "baz"
        },
        {
          "name": {
            "detailed": "detailed name",
            "short": "short name"
          }
        }
      ];


      db.import.importJSONData("collection", data, options, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          ret.created.should.equal(3);
          message.status.should.equal(201);
        });
      });
    })
    it('importJSONData with single JSON Object into unknown collection', function (done) {


      this.timeout(50000);

      var options = {
        "waitForSync": true,
        "details": true
      };

      var data = [
        {
          "_key": "abc",
          "value1": 25,
          "value2": "test",
          "allowed": true
        },
        {
          "_key": "abcd",
          "name": "baz"
        },
        {
          "name": {
            "detailed": "detailed name",
            "short": "short name"
          }
        }
      ];


      db.import.importJSONData("newCollection", data, options, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(true);
          message.status.should.equal(404);
        });
      });
    })
    it('importJSONData with single JSON Object, with one error, we create the collection as well', function (done) {

      this.timeout(50000);

      var options = {
        "waitForSync": true,
        "details": true,
        "createCollection": true
      };

      var data = [
        {
          "_key": "abc",
          "value1": 25,
          "value2": "test",
          "allowed": true
        },
        {
          "_key": "abc",
          "name": "baz"
        },
        {
          "name": {
            "detailed": "detailed name",
            "short": "short name"
          }
        }
      ];


      db.import.importJSONData("newCollection", data, options, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          ret.errors.should.equal(1);
          ret.created.should.equal(2);
          message.status.should.equal(201);
        });
      });
    })
    it('importJSONData with single JSON Object, without options', function (done) {

      this.timeout(50000);
      var data = [
        {
          "_key": "abcuu",
          "value1": 25,
          "value2": "test",
          "allowed": true
        },
        {
          "_key": "abcuu",
          "name": "baz"
        },
        {
          "name": {
            "detailed": "detailed name",
            "short": "short name"
          }
        }
      ];


      db.import.importJSONData("collection", data, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          ret.errors.should.equal(1);
          ret.created.should.equal(2);
          message.status.should.equal(201);
        });
      });
    })
    it('importJSONData with single JSON Object, without options and with default collection', function (done) {

      this.timeout(50000);
      var data = [
        {
          "_key": "abcww",
          "value1": 25,
          "value2": "test",
          "allowed": true
        },
        {
          "_key": "abcww",
          "name": "baz"
        },
        {
          "name": {
            "detailed": "detailed name",
            "short": "short name"
          }
        }
      ];
      db = db.use('/newDatabase:collection');
      db.import.importJSONData(data, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          ret.errors.should.equal(1);
          ret.created.should.equal(2);
          message.status.should.equal(201);
        });
      });
    })
    it('importJSONData with single JSON Object, with options and with default collection', function (done) {

      this.timeout(50000);

      var options = {
        "waitForSync": true
      };

      var data = [
        {
          "_key": "abcoo",
          "value1": 25,
          "value2": "test",
          "allowed": true
        },
        {
          "_key": "abcoo",
          "name": "baz"
        },
        {
          "name": {
            "detailed": "detailed name",
            "short": "short name"
          }
        }
      ];


      db.import.importJSONData(data, options, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          ret.errors.should.equal(1);
          ret.created.should.equal(2);
          message.status.should.equal(201);
        });
      });
    })
    it('importJSONData with single JSON Object and complete. Provoke a unique constraint violation and expect a 409', function (done) {

      this.timeout(50000);

      var options = {
        "waitForSync": true,
        "details": true,
        "complete": true
      };

      var data = [
        {
          "_key": "abc",
          "value1": 25,
          "value2": "test",
          "allowed": true
        },
        {
          "_key": "abc",
          "name": "baz"
        },
        {
          "name": {
            "detailed": "detailed name",
            "short": "short name"
          }
        }
      ];
      db = db.use('/newDatabase');

      db.import.importJSONData("collection", data, options, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(true);
          message.status.should.equal(409);
        });
      });
    })
    it('importValueList with single JSON Object and waitForSync', function (done) {

      this.timeout(50000);

      var options = {
        "waitForSync": true,
        "details": true
      };

      var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abc", 25, "test" ]\n[ "abcd", 253, "stest" ]';


      db.import.importValueList("collection", data, options, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          ret.created.should.equal(2);
          ret.empty.should.equal(2);
          message.status.should.equal(201);
        });
      });
    })
    it('importValueList with single JSON Object into unknown collection', function (done) {

      this.timeout(50000);

      var options = {
        "waitForSync": true,
        "details": true
      };

      var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abc", 25, "test" ]\n[ "aabcd", 253, "stest" ]';


      db.import.importValueList("newCollection", data, options, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(true);
          message.status.should.equal(404);
        });
      });
    })
    it('importValueList with single JSON Object, with one error, we create the collection as well', function (done) {

      this.timeout(50000);

      var options = {
        "waitForSync": true,
        "details": true,
        "createCollection": true
      };

      var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abcd", 25, "test" ]\n[ "abcd", 253, "stest" ]';


      db.import.importValueList("newCollection", data, options, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          ret.errors.should.equal(1);
          ret.created.should.equal(1);
          message.status.should.equal(201);
        });
      });
    })
    it('importValueList with single JSON Object and complete. Provoke a unique constraint violation and expect a 409', function (done) {

      this.timeout(50000);

      var options = {
        "waitForSync": true,
        "details": true,
        "complete": true
      };

      var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abc", 25, "test" ]\n[ "abc", 253, "stest" ]';

      db.import.importValueList("collection", data, options, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(true);
          message.status.should.equal(409);
        });
      });
    })
    it('importValueList with single JSON Object, without options', function (done) {

      this.timeout(50000);
      var options = {
        "waitForSync": true,
        "details": true
      };

      var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abcuu", 25, "test" ]\n[ "aabcdee", 253, "stest" ]';


      db.import.importValueList("collection", data, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          ret.created.should.equal(2);
          message.status.should.equal(201);
        });
      });
    })
    it('importValueList with single JSON Object, without options and with default collection', function (done) {

      this.timeout(50000);
      var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abczz", 25, "test" ]\n[ "aabcdww", 253, "stest" ]'
      db = db.use('/newDatabase:collection');
      db.import.importValueList(data, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          ret.created.should.equal(2);
          message.status.should.equal(201);
        });
      });
    })
    it('importValueList with single JSON Object, with options and with default collection', function (done) {

      this.timeout(50000);

      var options = {
        "waitForSync": true,
        "details": true
      };

      var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abctt", 25, "test" ]\n[ "aabcdqq", 253, "stest" ]'


      db.import.importValueList(data, options, function (err, ret, message) {
        check(done, function () {
          ret.error.should.equal(false);
          ret.created.should.equal(2);
          message.status.should.equal(201);
        });
      });
    })
  })
})
