var arango;

try {
    arango = require('arango')
} catch (e) {
    arango = require('..')
}

describe("database", function () {
    
    var db;
    
    before(function (done) {
	db = arango.Connection();
	
	db.database.delete("newDatabase").end(function () {
	    db.database.delete("newDatabase2").end(function(){
		done();
	    });
	});
    });
    
    describe("create/delete", function () {

	it('create a database with some users', function (done) {

	    var databaseName = "newDatabase";
	    var users = [
		{
		    "username": "Heinz",
		    "passwd": "pjotr"
		},
		{
		    "username": "Herbert",
		    "active": false,
		    extra: {
			"age": 44
		    }
		},
		{
		    "username": "Harald",
		    "passwd": "pjotr"
		}
	    ];
	    db.database.create(databaseName, users)
	    .then(function (ret, message) {
		ret.error.should.equal(false);
		message.status.should.within(200, 201);
	    }).callback(done);
	})
	
	it('create another database with some users', function (done) {

	    var databaseName = "newDatabase2";
	    var users = [
		{
		    "username": "Heinz",
		    "passwd": "pjotr"
		}
	    ];
	    db.database.create(databaseName, users)
		.then(function (ret, message) {
		    ret.error.should.equal(false);
		    message.status.should.within(200, 201);
		}).callback(done);
	})
	
	it('list databases', function (done) {

	    db.database.list().callback(done);
	})
	
	it('get information about the current database', function (done) {

	    db.database.current().
		then(function (ret, message) {
		    ret.result.should.have.property("name");
		    //ret.result.should.have.property("id");
		    ret.result.should.have.property("path");
		    message.status.should.equal(200);
		}).callback(done);
	})
	
	it('get all databases the current user can access', function (done) {

	    db.database.user().callback(done);
		
	})
	
	it('delete a databases', function (done) {

	    db.database.delete("newDatabase2").callback(done);
	})
	
	it('delete a databases which does not exist and expect a 404', function (done) {

	    db.database.delete("newDatabase2").
		catch(function (err) {
		    err.code.should.equal(404);
		    done();
		});
	})
    })

})
