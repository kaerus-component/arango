var arango;

try {
    arango = Arango
} catch (e) {
    arango = require('..')
}


describe("simpleWithDefaultCollection", function () {
    var db, indices = {};

    function getIndexByType(collection, type) {
	var result;

	indices[collection].forEach(function (index) {
	    if (index.type === type) {
		result = index.id;
	    }
	});
	
	return result;
    }

    before(function (done) {
	
	db = arango.Connection("/_system");
	db.database.delete("newDatabase").end( function () {
	    db.database.create("newDatabase").then(function(){

		db = db.use('/newDatabase');

		db.batch.start();
		
		db.collection.create("GeoCollection");
		
		db.document.create("GeoCollection", {
		    "_key": "Ort1",
		    "longitude": 20.00,
		    latitude: 22.00,
		    location: [20.00, 12.00]
		});
		db.document.create("GeoCollection", {
		    "_key": "Ort2",
		    "longitude": 21.00,
		    latitude: 19.00,
		    location: [28.00, 12.00]
		});
		db.document.create("GeoCollection", {
		    "_key": "Ort3",
		    "longitude": 22.00,
		    latitude: 15.00,
		    location: [16.00, 18.00]
		});
		db.document.create("GeoCollection", {
		    "_key": "Ort4",
		    "longitude": 23.00,
		    latitude: 24.00,
		    location: [21.00, 19.00]
		});
		db.index.createGeoSpatialIndex("GeoCollection", {fields:["latitude", "longitude"], constraint: true,ignoreNull: true});
		db.index.createGeoSpatialIndex("GeoCollection", {fields:["location"], geoJson: true});
		
		db.collection.create("SkiptListcollection");
		
		db.document.create("SkiptListcollection", {
		    "_key": "Anton",
		    "age": 23,
		    "income": 2000,
		    "birthplace": "munich"
		});
		db.document.create("SkiptListcollection", {
		    "_key": "Bert",
		    "age": 22,
		    "income": 2100,
		    "birthplace": "munich-passing"
		});
		db.document.create("SkiptListcollection", {
		    "_key": "Bernd",
		    "age": 24,
		    "income": 2100,
		    "birthplace": "berlin"
		});
		db.document.create("SkiptListcollection", {
		    "_key": "Cindy",
		    "age": 31,
		    "income": 2000,
		    "birthplace": "cologne"
		});
		db.document.create("SkiptListcollection", {
		    "_key": "Cinderella",
		    "age": 30,
		    "income": 2000,
		    "birthplace": "munich"
		});
		db.document.create("SkiptListcollection", {
		    "_key": "Emil",
		    "age": 29,
		    "income": 2100,
		    "birthplace": "munich"
		});
		db.document.create("SkiptListcollection", {
		    "_key": "Kurt",
		    "age": 29,
		    "income": 2900,
		    "birthplace": "cologne"
		});
		db.index.createSkipListIndex("SkiptListcollection", {fields:["age"], unique:false});
		db.index.createFulltextIndex("SkiptListcollection", {fields:["birthplace"]});
		
		return db.batch.exec();
	    }).callback(function(ret){
		db = db.use('/newDatabase:SkiptListcollection');
		done();
	    });
	});
	
    })

    describe("simple Queries", function () {

	it('list all documents', function (done) {
	    
	    db.simple.skip(1).limit(2).list()
		.then(function (ret) {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(2);
		    ret.code.should.equal(201);
		}).callback(done);
	})
	
	it('list all documents, we tests that passing skip and limit in the function beats the global setting', function (done) {
	    
	    var opt = {
		"skip": 0,
		"limit": 4
	    }
	    db.simple.list(opt)
		.then(function (ret) {
		    ret.error.should.equal(false);
		    ret.result.length.should.equal(4);
		    ret.code.should.equal(201);
		}).callback(done);
	})

	it('get random document', function (done) {
	    
	    db.simple.any()
		.then(function (ret) {
		    ret.should.have.property("document");
		    ret.error.should.equal(false);
		    ret.code.should.equal(200);
		}).callback(done);
	})

	it('list all documents matching an example, we tests that passing skip and limit in the function beats the global setting', function (done) {
	    
	    var opt = {
		"skip": 0,
		"limit": 4
	    }
	    db.simple.skip(1).limit(2).example({
		"income": 2100
	    }, opt).then( function (ret) {
		ret.error.should.equal(false);
		ret.result.length.should.equal(3);
		ret.code.should.equal(201);
	    }).callback(done);
	})
	
	it('list all documents matching an example, without options', function (done) {
	    
	    db.simple.skip(1).limit(2).example({
		"income": 2100
	    }).then( function (ret) {
		ret.error.should.equal(false);
		ret.result.length.should.equal(2);
		ret.code.should.equal(201);
	    }).callback(done);
	})
	
	it('remove all documents matching an example.', function (done) {
	    
	    var opt = {
		"waitForSync": true,
		"limit": 1
	    }
	    db.simple.removeByExample({
		"income": 2900
	    }, opt).then( function (ret) {
		ret.error.should.equal(false);
		ret.deleted.should.equal(1);
		ret.code.should.equal(200);
	    }).callback(done);
	})
	
	it('remove all documents matching an example.', function (done) {
	    
	    db.simple.removeByExample({
		"income": 2900
	    }).then( function (ret) {
		ret.error.should.equal(false);
		ret.deleted.should.equal(0);
		ret.code.should.equal(200);
	    }).callback(done);
	})
	
	it('replace all documents matching an example.', function (done) {
	    
	    var opt = {
		"waitForSync": true,
		"limit": 1
	    }
	    db.simple.replaceByExample({
		"age": 30
	    }, {
		"age": 31,
		"married": true
	    }, opt).then( function (ret) {
		ret.error.should.equal(false);
		ret.replaced.should.equal(1);
		ret.code.should.equal(200);
	    }).callback(done);
	})
	
	it('replace all documents matching an example, without options', function (done) {
	    
	    db.simple.replaceByExample({
		"age": 30
	    }, {
		"age": 31,
		"married": true
	    }).then( function (ret) {
		ret.error.should.equal(false);
		ret.replaced.should.equal(0);
		ret.code.should.equal(200);
	    }).callback(done);

	})

	it('update all documents matching an example.', function (done) {
	    
	    var opt = {
		"waitForSync": true
	    }
	    db.simple.updateByExample({
		"age": 31
	    }, {
		"married": false
	    }, opt).then(function(ret){
		
		ret.error.should.equal(false);
		ret.updated.should.equal(2);
		ret.code.should.equal(200);
	    }).callback(done);
	})
	it('update all documents matching an example, without options', function (done) {
	    
	    db.simple.updateByExample({
		"age": 31
	    }, {
		"married": false
	    }).then(function(ret){
		
		ret.error.should.equal(false);
		ret.updated.should.equal(2);
		ret.code.should.equal(200);
	    }).callback(done);

	})


	it('return the first documents matching a given example.', function (done) {
	    
	    var opt = {
		"skip": 0,
		"limit": 4
	    }
	    db.simple.firstByExample({
		"income": 2100
	    }, opt).then(function(ret){
		
		ret.error.should.equal(false);
		ret.should.have.property("document");
		ret.code.should.equal(200);

	    }).callback(done);
	})
	it('return the first documents matching a given example, without options', function (done) {
	    
	    db.simple.firstByExample({
		"income": 2100
	    }).then(function(ret){
		
		ret.error.should.equal(false);
		ret.should.have.property("document");
		ret.code.should.equal(200);
	    }).callback(done);

	})


	it('return the first documents from the collection', function (done) {
	    
	    db.simple.first(3).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(3);
		ret.code.should.equal(200);

	    }).callback(done);
	})
	it('return the last documents from the collection', function (done) {
	    
	    db.simple.last(3).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(3);
		ret.code.should.equal(200);

	    }).callback(done);
	})
	it('return the first documents from the collection, without count', function (done) {
	    
	    db.simple.first().then(function (ret) {
		
		ret.error.should.equal(false);
		ret.code.should.equal(200);

	    }).callback(done);
	})
	it('return the last documents from the collection, without count', function (done) {
	    
	    db.simple.last().then(function (ret) {
		
		ret.error.should.equal(false);
		ret.code.should.equal(200);

	    }).callback(done);
	})


	it('use the skip list index for a range query', function (done) {
	    
	    db.simple.range("SkiptListcollection", "age", 23, 29, {
		closed: true
	    }).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(2);
		ret.code.should.equal(201);

	    }).callback(done);
	})
	it('use the skip list index for an open range query', function (done) {
	    
	    db.simple.range("SkiptListcollection", "age", 23, 29).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(1);
		ret.code.should.equal(201);

	    }).callback(done);
	})

	it('use the skip list index for a range query', function (done) {
	    
	    db.simple.range("age", 23, 29, {
		closed: true
	    }).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(2);
		ret.code.should.equal(201);

	    }).callback(done);
	})
	it('use the skip list index for an open range query, without options', function (done) {
	    
	    db.simple.range("age", 23, 29).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(1);
		ret.code.should.equal(201);

	    }).callback(done);
	})


	it('list all we created so far', function (done) {
	    
	    db.index.list().then(function (ret) {
		
		indices.SkiptListcollection = ret.indexes;
		ret.error.should.equal(false);
		ret.code.should.equal(200);

	    }).callback(done);
	})
	it('use the fulltext index for a fulltext query', function (done) {
	    
	    db.simple.limit(4).skip(0).fulltext("birthplace", "munich").then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(3);
		ret.code.should.equal(201);

	    }).callback(done);
	})

	it('use the fulltext index for a fulltext query with options', function (done) {
	    
	    db.simple.fulltext("birthplace", "munich", {
		"limit": 2
	    }).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(2);
		ret.code.should.equal(201);
	    }).callback(done);

	})


	it('list all we created so far', function (done) {
	    
	    db = db.use('/newDatabase:GeoCollection');
	    db.index.list().then(function (ret) {
		
		indices.GeoCollection = ret.indexes;
		ret.error.should.equal(false);
		ret.code.should.equal(200);

	    }).callback(done);
	})

	it('use the geo index for a near query on location', function (done) {
	    
	    var index = getIndexByType("GeoCollection", "geo1");
	    db.simple.skip(undefined).limit(undefined).near(15, 15, {
		geo: index,
		distance: "distance"
	    }).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(4);
		ret.code.should.equal(201);

	    }).callback(done);
	})
	it('use the geo index for a near query on longitude and latitude', function (done) {
	    
	    var index = getIndexByType("GeoCollection", "geo2");
	    db.simple.skip(undefined).limit(undefined).near(15, 15, {
		geo: index,
		distance: "distance"
	    }).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(4);
		ret.code.should.equal(201);

	    }).callback(done);
	})
	it('use the geo index for a within query on location', function (done) {
	    
	    var index = getIndexByType("GeoCollection", "geo1");
	    db.simple.within(15, 15, 787593, {
		geo: index,
		distance: "distance"
	    }).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(3);
		ret.code.should.equal(201);

	    }).callback(done);
	})
	it('use the geo index for a within query on longitude and latitude', function (done) {
	    
	    var index = getIndexByType("GeoCollection", "geo2");
	    db.simple.within(15, 15, 787593, {
		geo: index,
		distance: "distance"
	    }).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(2);
		ret.code.should.equal(201);
	    }).callback(done);

	})

	it('use the geo index for a within query on location', function (done) {
	    
	    var index = getIndexByType("GeoCollection", "geo1");
	    db.simple.within(15, 15, 787593, {
		geo: index,
		distance: "distance"
	    }).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(3);
		ret.code.should.equal(201);
	    }).callback(done);

	})


	it('delete an index ', function (done) {
	    
	    db.index.delete(getIndexByType("GeoCollection", "geo1")).then(function(ret){
		
		ret.error.should.equal(false);
		ret.code.should.equal(200);
	    }).callback(done);

	})

	it('use the geo index for a near query on longitude and latitude, without options', function (done) {
	    
	    db.simple.skip(undefined).limit(undefined).near(15, 15).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(4);
		ret.code.should.equal(201);
	    }).callback(done);

	})
	it('use the geo index for a within query on longitude and latitude, without options', function (done) {
	    
	    db.simple.within(15, 15, 787593).then(function(ret){
		
		ret.error.should.equal(false);
		ret.result.length.should.equal(2);
		ret.code.should.equal(201);
	    }).callback(done);

	})

    })
})
