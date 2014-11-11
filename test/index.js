var arango;

try {
    arango = Arango
} catch (e) {
    arango = require('..')
}

describe("index", function () {
    var db, indices;
    
    before(function (done) {

	db = arango.Connection("/_system");
	db.database.delete("newDatabase").end(function () {
	    db.database.create("newDatabase").then(function () {
		db = db.use('/newDatabase');
		db.collection.create("collection1").then(function () {
		    var data = [
			{
			    "_key": "Anton",
			    "value1": 25,
			    "value2": "test",
			    "allowed": true
			},
			{
			    "_key": "Bert",
			    "value1": "baz"
			},
			{
			    "_key": "Cindy",
			    "value1": "baaaz"
			},
			{
			    "_key": "Emil",
			    "value1": "batz"
			}
		    ];
		}).callback(done);
	    });
	});
	
    })

    describe("indexFunctions", function () {

	it('create a cap index', function (done) {

	    db.index.createCapIndex("collection1", {
		"size": 100,
		"byteSize": 1000000
	    }).then( function (ret, message) {
		ret.error.should.equal(false);
		ret.code.should.equal(201);
	    }).callback(done);
	})
	
	it('create same cap index again and expect a 200', function (done) {
	    
	    db.index.createCapIndex("collection1", {
		"size": 100,
		"byteSize": 1000000
	    }).then(function(ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(200);
	    }).callback(done);
	})

	it('create a geo spatial index', function (done) {

	    db.index.createGeoSpatialIndex("collection1", {
		fields:["latitude", "longitude"],
		constraint: true,
		ignoreNull: true
	    }).then(function(ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(201);
	    }).callback(done);
	})
	
	it('create same geo spatial index again and expect a 200', function (done) {

	    db.index.createGeoSpatialIndex("collection1", {
		fields:["latitude", "longitude"],
		constraint: true,
		ignoreNull: true
	    }).then(function(ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(200);
	    }).callback(done);
	})
	
	it('create a location based geo spatial index', function (done) {

	    db.index.createGeoSpatialIndex("collection1", {
		fields:["location"], 
		geoJson: true
	    }).then(function(ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(201);
	    }).callback(done);
	})

	it('create a hash index', function (done) {

	    db.index.createHashIndex("collection1", {
		fields:["value1"],
		unique:false
	    }).then(function(ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(201);
	    }).callback(done);
	})
	
	it('create same hash again and expect a 200', function (done) {

	    db.index.createHashIndex("collection1", {
		fields:["value1"]
	    }).then(function(ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(200);
	    }).callback(done);
	})

	it('create a skiplist index', function (done) {

	    db.index.createSkipListIndex("collection1", {
		fields:["value1"],
		unique:false
	    }).then(function(ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(201);
	    }).callback(done);
	})
	
	it('create same skiplist again and expect a 200', function (done) {

	    db.index.createSkipListIndex("collection1", {
		fields:["value1"]
	    }).then(function(ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(200);
	    }).callback(done);
	})

	it('create a fulltext index', function (done) {

	    db.index.createFulltextIndex("collection1", {
		fields:["value1"],
		minLength:3
	    }).then(function(ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(201);
	    }).callback(done);
	})
	
	it('create same fulltext again and expect a 200', function (done) {

	    db.index.createFulltextIndex("collection1", {
		fields:["value1"],
		minLength:3
	    }).then(function(ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(200);
	    }).callback(done);
	})

	it('list all we created so far', function (done) {

	    db.index.list("collection1")
		.then(function(ret) {
		    indices = ret.indexes;
		    ret.error.should.equal(false);
		    ret.indexes.length.should.equal(7);
		    ret.code.should.equal(200);
		}).callback(done);
	})
	
	it('get an index ', function (done) {

	    db.index.get(indices[1].id).callback(done);
	})
	
	it('get an index ', function (done) {

	    db.index.get(indices[5].id).callback(done);
	})
	
	it('delete an index ', function (done) {

	    db.index.delete(indices[5].id).callback(done);
	})
	
	it('list all we created so far', function (done) {

	    db.index.list("collection1")
		.then(function(ret) {
		    indices = ret.indexes;
		    ret.error.should.equal(false);
		    ret.indexes.length.should.equal(6);
		    ret.code.should.equal(200);
		}).callback(done);
	})

    })
})
