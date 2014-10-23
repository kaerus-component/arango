var arango;

try {
    arango = require('arango')
} catch (e) {
    arango = require('..')
}

function filter(data) {
    var result = [];
    
    for (i = 0; i < data.length; ++i) {
	if (data[i].name.match(/^javascripttest/)) {
	    result.push(data[i]);
	}
    }
    return result;
}

describe("aqlfunction", function () {
    var db;
    
    before(function(done){
	db = arango.Connection();
	done();
    });
    
    it('should be able to create an aql function', function (done) {
	
	db.aqlfunction.create("javascripttest::temperature::celsiustofahrenheit",
			      function (celsius) { return celsius * 1.8 + 32; },false)
	    .callback(done);
    })
    
    it('should be able to create another aql function', function (done) {
	
	db.aqlfunction.create("javascripttest::temperature::celsiustofahrenheit2",
			      "function (celsius) { return celsius * 2.8 + 32; }",false)
	    .callback(done);
    })
    
    it('should be able to create another aql function, different namespace', function (done) {
	
	db.aqlfunction.create("javascripttest2::temperature::celsiustofahrenheit2",
			      function (celsius) { return celsius * 2.8 + 32; }, true)
	    .callback(done);
    })
    
    it('should be able to get all aql function', function (done) {
	
	db.aqlfunction.get().then(function(ret) {
	    filter(ret).length.should.equal(3);
	}).callback(done);
    })
    
    it('should be able to get all aql functions in one namespace', function (done) {
	
	db.aqlfunction.get("javascripttest").
	    then(function (ret) {
		filter(ret).length.should.equal(2);
	    }).callback(done);
    })
    
    it('should delete all aql functions in one namespace', function (done) {
	
	db.aqlfunction.delete("javascripttest", true).callback(done);
	
    })
    
    it('should be able to get all aql function, one should be left', function (done) {
	
	db.aqlfunction.get()
	    .then(function (ret) {
		filter(ret).length.should.equal(1);
	    }).callback(done);
    })
    
    it('should delete a aql function by its name', function (done) {
	
	db.aqlfunction.delete("javascripttest2", true).callback(done);
    })
    
    it('should be able to get all aql function, none should be left', function (done) {
	
	db.aqlfunction.get()
	    .then(function (ret) {
		filter(ret).length.should.equal(0);
	    }).callback(done);
    })
})
