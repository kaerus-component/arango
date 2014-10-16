var arango, db;

try {
    arango = require('arango')
} catch (e) {
    arango = require('..')
}


describe("transaction", function () {


    before(function (done) {
	
	db = arango.Connection("/_system");
	db.database.delete("newDatabase").end( function () {
	    db.database.create("newDatabase").then( function () {
		db = db.use('/newDatabase');

		db.batch.start();

		db.collection.create("collection");
		db.collection.create("collection2");

		return db.batch.exec();
	    }).callback(done);
	});	
    });
    
    it('submit transaction', function (done) {

	var collection = {
	    write: ["collection"]
	};
	var action = "function (params) { var db = require('internal').db; for (var i in params.param) {db.collection.save({'_key' : params.param[i]});} return db.collection.count(); }";

	var options = {
	    waitForSync: true,
	    lockTimeout: 0,
	    replicate: false
	};
	
	options.params = {
	    param: ["hans", "herbert", "harald"]
	};

	db.transaction.submit(collection, action, options)
	    .then(function (ret) {
		ret.error.should.equal(false);
		ret.result.should.equal(3);
		ret.code.should.equal(200);
	    }).callback(done);
    })

    it('submit transaction with malformed action', function (done) {

	var collection = {
	    write: ["collection"]
	};
	var action = "function (params) { var db = require('internal').db; for(var i in params.param){db.collection.save({'_key' : params.param[i]});} return db.collection.count(); }";

	var options = {
	    waitForSync: true,
	    lockTimeout: 0,
	    replicate: false
	};
	
	options.params = {
	    param: ["hans", "herbert", "harald"]
	};

	db.transaction.submit(collection, action, options)
	    .catch(function (err) {
		err.code.should.equal(400);
		done();
	    });
    })

    it('submit transaction with unknown collection', function (done) {

	var collection = {
	    write: ["unknown"]
	};
	var action = "function (params) { var db = require('internal').db; for (var i in params.param) {db.unknown.save({'_key' : params.param[i]});} return db.unknown.count(); }";

	var options = {
	    waitForSync: true,
	    lockTimeout: 0,
	    replicate: false
	};
	
	options.params = {
	    param: ["hans", "herbert", "harald"]
	};

	db.transaction.submit(collection, action, options)
	    .catch(function (err) {
		err.code.should.equal(404);
		done();
	    });
    })
    
})
