var arango, db;
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


describe("user", function() {


    before(function(done) {
        if (typeof window !== "undefined") {
            port = window.port;
        } else {
            port = require('./port.js');
            port = port.port;
        }

        this.timeout(20000);
        db = arango.Connection("http://127.0.0.1:"+port+"/_system");
        db.database.delete("newDatabase", function(err, ret) {
            db.database.create("newDatabase", function(err, ret) {
                db = db.use('/newDatabase');
                done();
            });
        });

    })

    it('create a user', function(done) {
        this.timeout(20000);
        db.user.create("hans", "passwordHans", true, {
            "vorname": "hans",
            "nachname": "otto"
        }, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                message.status.should.equal(201);
            });
        });
    })

    it('create a user', function(done) {

        db.user.create("hans2", "passwordHans2", true, {
            "vorname": "hans2",
            "nachname": "otto2"
        }, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                message.status.should.equal(201);
            });
        });
    })

    it('create an already existing user', function(done) {

        db.user.create("hans", "passwordHans", true, {
            "vorname": "hans",
            "nachname": "otto"
        }, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(true);
                message.status.should.equal(400);
            });
        });
    })

    it('get user', function(done) {

        db.user.get("hans", function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                message.status.should.equal(200);
            });
        });
    })
    it('get non existing user', function(done) {

        db.user.get("hansGibtsNicht", function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(true);
                message.status.should.equal(404);
            });
        });
    })

    it('delete user', function(done) {

        db.user.delete("hans2", function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                message.status.should.equal(202);
            });
        });
    })
    it('delete non existing user', function(done) {

        db.user.delete("hansGibtsNicht", function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(true);
                message.status.should.equal(404);
            });
        });
    })

    it('patch non existing user', function(done) {

        db.user.patch("hans2", "newPassword", function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(true);
                message.status.should.equal(404);
            });
        });
    })
    it('patch user', function(done) {

        db.user.patch("hans", "newPassword", false, {
            "nachname": "otto-müller",
            "married": true
        }, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                message.status.should.equal(200);
            });
        });
    })
    it('get user to verify last patch', function(done) {

        db.user.get("hans", function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.extra.should.have.property("nachname");
                ret.extra.should.have.property("married");
                ret.extra.should.have.property("vorname");
                message.status.should.equal(200);
            });
        });
    })

    it('put non existing user', function(done) {

        db.user.put("hans2", "newPassword", function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(true);
                message.status.should.equal(404);
            });
        });
    })
    it('put user', function(done) {

        db.user.put("hans", "newPassword", false, {
            "married": false,
            "sad": true
        }, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(false);
                message.status.should.equal(200);
            });
        });
    })
    it('get user to verify last put', function(done) {

        db.user.get("hans", function(err, ret, message) {
            check(done, function() {
                ret.extra.should.not.have.property("nachname");
                ret.extra.should.have.property("married");
                ret.extra.should.have.property("sad");
                ret.extra.should.not.have.property("vorname");
                ret.error.should.equal(false);
                message.status.should.equal(200);
            });
        });
    })
})
