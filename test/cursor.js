var arango;

try {
    arango = require('arango');
} catch (e) {
    arango = require('..');
}

var documents = [
    {
	"key1": "val2",
	"key2": "val3",
	"key3": "val4"
    },
    ,{
	"key1": "val2",
	"key5": "val3",
	"key6": "val4"
    },
    {
	"key1": "val2",
	"key5": "val3",
	"key6": "val4"
    }
];

function newDocuments(db,collection){
    var results = [];
    
    documents.forEach(function(doc){
	results.push(db.document.create(collection.id,doc));
    });
    
    return results;
}


describe("cursor", function () {
    var db, cursor;

    before(function (done) {

	db = arango.Connection();

	db.database.delete("newDatabase").end(function(){
	    
	    db.database.create("newDatabase")
		.then(function () {
		    db = db.use('/newDatabase');
		    db.collection.create("newCollection")
			.then(function(collection){
			    db.Promise().fulfill("create documents")
				.join(newDocuments(db,collection))
				.callback(done);
			});
		});
	});
    });
    
    it('should be able to validate a query', function (done) {
	
	db.cursor.query({
	    "query": "FOR p IN products FILTER p.name == @name LIMIT 2 RETURN p.n"
	}).callback(done);
    })
    
    it('should deny an invalid query', function (done) {
	
	db.cursor.query({
	    "query": "FOR p INE products FILTER p.name == @name LIMIT 2 RETURN p.n"
	}).catch(function(err){
	    err.code.should.equal(400);
	    done();
	});
    })
    
    it('should deny a valid query as the collection does not exists', function (done) {
	
	db.cursor.explain({
	    "query": "FOR p IN products FILTER p.name == 'ee' LIMIT 2 RETURN p.n"
	}).catch( function (err) {
	    err.code.should.equal(404);
	    done();
	});
    })
    
    it('should deny an invalid query', function (done) {
	
	db.cursor.explain({
	    "query": "FOR p INE products FILTER p.name == @name LIMIT 2 RETURN p.n"
	}).catch(function(err) {
	    err.code.should.equal(400);
	    done();
	});
    })
    
    it('should be able to validate a query', function (done) {
	
	db.cursor.explain({
	    "query": "FOR p IN newCollection FILTER LIKE(p.abcde , 'eee') RETURN p._id"
	}).callback(done);
    })

    it('creating a cursor with a bad query', function (done) {
	
	var cursorData = {};
	cursorData.query = "FOR p IN products FILTER LIKE(p.abcde ,@name) RETURN p._id "
	cursorData.count = true;
	cursorData.bindVars = {};
	cursorData.bindVars.name = "%eee%";

	db.cursor.create(cursorData)
	    .catch(function (err) {
		err.code.should.equal(404);
		done();
	    });
    })
    
    it('creating a cursor with an empty query', function (done) {
	
	var cursorData = {};
	cursorData.count = true;
	cursorData.bindVars = {};
	cursorData.bindVars.name = "%eee%";
	
	db.cursor.create(cursorData)
	    .catch(function (err) {
		err.code.should.equal(400);
		done();
	    });
    })
    
    it('creating a valid cursor using limit', function (done) {
	
	var cursorData = {};
	cursorData.query = "FOR p IN newCollection FiLTER LIKE(p.key1 ,@name) LIMIT 1 RETURN p._id"
	cursorData.count = true;
	cursorData.options = {
	    "fullCount": true
	};
	cursorData.bindVars = {};
	cursorData.bindVars.name = "%val2%";
	
	db.cursor.create(cursorData).
	    then(function (ret, message) {
		ret.error.should.equal(false);
		ret.hasMore.should.equal(false);
		ret.count.should.equal(1);
		ret.extra.fullCount.should.equal(3);
		message.status.should.equal(201);
	    }).callback(done);
    })

    describe('creating cursor with more results', function () {
	var cursor;
	
	before(function(done){
	    var cursorData = {};
	    cursorData.query = "FOR p IN newCollection FiLTER LIKE(p.key1 ,@name) RETURN p._id"
	    cursorData.count = true;
	    cursorData.bindVars = {};
	    cursorData.batchSize = 1;
	    cursorData.bindVars.name = "%val2%";
	    
	    db.cursor.create(cursorData)
		.then(function (ret, message) {
		    cursor = ret;
		    
		    ret.error.should.equal(false);
		    ret.hasMore.should.equal(true);
		    message.status.should.equal(201);
		}).callback(done);
	});

	it('check cursor hasMore and result count', function (done) {
	    db.cursor.get(cursor.id)
		.then(function(ret,message){
		    ret.error.should.equal(false);
		    ret.hasMore.should.equal(true);
		    ret.count.should.equal(3);
		    message.status.should.equal(200);
		}).callback(done);
	})
	
	it('deleting the current cursor', function (done) {
	    
	    db.cursor.delete(cursor.id)
		.then(function (ret, message) {
		    ret.error.should.equal(false);
		    message.status.should.equal(202);
		}).callback(done);
	})
	
	it('deleting the no longer existing cursor', function (done) {
	    
	    db.cursor.delete(cursor.id)
		.catch(function (err) {
		    err.code.should.equal(404);
		    done();
		});
	})

	it('using the no longer existing cursor to fetch more results', function (done) {
	    
	    db.cursor.get(cursor.id)
		.catch(function (err) {
		    err.code.should.equal(404);
		    done();
		});
	})

	it('using query string', function (done) {
	    
	    var query = db.query.string("FOR u IN @@collection RETURN u");
	    query.exec({
		'@collection': 'newCollection'
	    }).callback(done);
	    
	})

	it('using query module', function (done) {
	    
	    var query = db.query.
		    for('u').in('@@collection').
		    return('u');
	    query.exec({
		'@collection': 'newCollection'
	    }).callback(done);

	})

	it('using query module with plain query', function (done) {
	    
	    db.query.exec("for u in newCollection return u")
		.callback(done);

	})

	it('using query module explain', function (done) {
	    
	    var query = db.query.
		    for('u').in('@@collection').
		    return('u');
	    query.explain({
		'@collection': 'newCollection'
	    }).callback(done);
	    
	})

	it('using query module test', function (done) {
	    
	    var query = db.query.
		    for('u').in('@@collection').
		    return('u');
	    query.test({
		'@collection': 'newCollection'
	    }).callback(done);

	})

    })
})
