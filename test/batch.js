var arango;
var port;
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

describe("batch", function () {

  // now we end bacth mode and execute
  it('should exec bacth mode', function (done) {
    this.timeout(50000);
    if (typeof window !== "undefined") {
      port = window.port;
    } else {
      port = require('./port.js');
      port = port.port;
    }

    var db = arango.Connection("http://127.0.0.1:" + port);
    var batch = db.batch.start();

    // 2 good calls
    batch.aqlfunction.create("myotherfunctions::temperature::celsiustofahrenheit2",
      "function (celsius) { return celsius * 2.8 + 32; }", null);
    batch.aqlfunction.get(null);
    // 1 bad call
    var options = {};
    options.upto = "badlevel";
    batch.admin.log(options);

    batch.batch.exec(function (err, ret, message) {
      var status = message.status;
      check(done, function () {
        status.should.equal(200);
      });
    });
  })
})
