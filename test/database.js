var arango;
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

//var db;

/*
beforeEach(function(done){
    db.database.delete("newDatabase",function(){ done() });
    db.database.delete("newDatabase2",function(){ done() });
})
*/

describe("database", function() {
    if (typeof window !== "undefined") {
        port = window.port;
    } else {
        port = require('./port.js');
        port = port.port;
    }

    var db = arango.Connection("http://127.0.0.1:"+port);
    before(function(done) {
		this.timeout(50000);
        db.database.delete("newDatabase", function() {
            done()
        });
        db.database.delete("newDatabase2", function() {
            done()
        });
    })
    describe("create/delete", function() {

        it('create a database with some users', function(done) {
		    this.timeout(50000);
            var databaseName = "newDatabase";
            var users = [{
                "username": "Heinz",
                "passwd": "pjotr"
            }, {
                "username": "Herbert",
                "active": false,
                extra: {
                    "age": 44
                }
            }, {
                "username": "Harald",
                "passwd": "pjotr"
            }];
            db.database.create(databaseName, users, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.within(200, 201);
                });
            });
        })
        it('create another database with some users', function(done) {
		    this.timeout(50000);
            var databaseName = "newDatabase2";
            var users = [{
                "username": "Heinz",
                "passwd": "pjotr"
            }];
            db.database.create(databaseName, users, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.within(200, 201);
                });
            });
        })
        it('list databases', function(done) {
		    this.timeout(50000);
            db.database.list(function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(200);
                });
            });
        })
        it('get information about the current database', function(done) {
		    this.timeout(50000);
            db.database.current(function(err, ret, message) {
                check(done, function() {
                    ret.result.should.have.property("name");
                    ret.result.should.have.property("id");
                    ret.result.should.have.property("path");
                    message.status.should.equal(200);
                });
            });
        })
        it('get all databases the current user can access', function(done) {
		    this.timeout(50000);
            db.database.user(function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(200);
                });
            });
        })
        it('delete a databases', function(done) {
		    this.timeout(50000);
            db.database.delete("newDatabase2", function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(200);
                });
            });
        })
        it('delete a databases which does not exist and expect a 404', function(done) {
		    this.timeout(50000);
            db.database.delete("newDatabase2", function(err, ret, message) {
                check(done, function() {
                    message.status.should.equal(404);
                });
            });
        })
    })

})
