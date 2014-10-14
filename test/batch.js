var arango;

try {
    arango = require('arango')
} catch (e) {
    arango = require('..')
}

describe("batch", function () {
    var db;
    
    before(function(done){
	db = arango.Connection();
	done();
    });
    
    // now we end bacth mode and execute
    it('exec batch of 2 requests', function (done) {
	
	var batch = db.batch.start();
	
	// 2 good calls
	batch.aqlfunction.create("myotherfunctions::temperature::celsiustofahrenheit2",
				 "function (celsius) { return celsius * 2.8 + 32; }");
	batch.aqlfunction.get();
	
	batch.batch.exec().callback(done);
    })
})
