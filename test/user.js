var arango, db;

try {
    arango = Arango
} catch (e) {
    arango = require('..')
}

describe("user", function () {

    before(function (done) {
	
	db = arango.Connection("/_system");
	
	db.database.delete("newDatabase").end( function () {
	    db.database.create("newDatabase").then( function() {
		db = db.use('/newDatabase');
	    }).callback(done);
	});
	
    })

    it('create a user', function (done) {
	
	db.user.create("hans",{
	    passwd:"passwordHans",
	    changePassword: true,
	    extra:{
		"vorname": "hans",
		"nachname": "otto"
	    }
	}).then( function (ret) {
	    console.log("create",ret);
	    ret.error.should.equal(false);
	    ret.code.should.equal(201);
	}).callback(done);
    })

    it('create a user', function (done) {
	
	db.user.create("hans2", {
	    passwd:"passwordHans2",
	    changePassword: true,
	    extra:{
		"vorname": "hans2",
		"nachname": "otto2"
	    }
	}).then( function (ret) {
	    ret.error.should.equal(false);
	    ret.code.should.equal(201);
	}).callback(done);
    })

    it('create an already existing user', function (done) {
	
	db.user.create("hans", {
	    passwd: "passwordHans",
	    changePassword: true,
	    extra: {
		vorname: "hans",
		nachname: "otto"
	    }
	}).catch( function (err) {
	    err.error.should.equal(true);
	    err.code.should.equal(400);
	    done();
	});
    })

    it('get user', function (done) {
	
	db.user.get("hans")
	    .then( function (ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(200);
	    }).callback(done);
    })
    it('get non existing user', function (done) {
	
	db.user.get("hansGibtsNicht")
	    .catch(function (err) {
		err.error.should.equal(true);
		err.code.should.equal(404);
		done();
	    });
    })

    it('delete user', function (done) {
	
	db.user.delete("hans2")
	    .then(function (ret) {
		
		ret.error.should.equal(false);
		ret.code.should.equal(202);
	    }).callback(done);
    })
    it('delete non existing user', function (done) {
	
	db.user.delete("hansGibtsNicht")
	    .catch(function (err) {
		err.error.should.equal(true);
		err.code.should.equal(404);
		done();
	    });
    })

    it('patch non existing user', function (done) {
	
	db.user.patch("hans2", {passwd:"newPassword"})
	    .catch(function (err) {
		err.error.should.equal(true);
		err.code.should.equal(404);
		done();
	    });
    })
    
    it('patch user', function (done) {
	
	db.user.patch("hans",{
	    passwd: "newpassword",
	    extra:{
		"nachname": "otto-müller",
		"married": true
	    },
	    changePassword: false
	}).then( function (ret) {
	    ret.error.should.equal(false);
	    ret.code.should.equal(200);
	}).callback(done);
    })
    
    it('get user to verify last patch', function (done) {
	
	db.user.get("hans")
	    .then(function (ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(200);
		ret.extra.vorname.should.equal("hans");
		ret.extra.nachname.should.equal("otto-müller");
		ret.extra.married.should.equal(true);
	    }).callback(done);
    })

    it('put non existing user', function (done) {
	
	db.user.put("hans2", {passwd:"newpassword"})
	    .catch(function (err) {
		err.error.should.equal(true);
		err.code.should.equal(404);
		done();
	    });
    })
    
    it('put user', function (done) {
	
	db.user.put("hans", {
	    passwd:"newPassword",
	    changePassword:false,
	    extra: {
		"married": false,
		"sad": true
	    }
	}).then( function (ret) {
	    ret.error.should.equal(false);
	    ret.code.should.equal(200);
	    ret.extra.should.eql({married:false,sad:true});
	}).callback(done);
    })
    
    it('get user to verify last put', function (done) {
	
	db.user.get("hans")
	    .then(function (ret) {
		ret.error.should.equal(false);
		ret.code.should.equal(200);
		ret.extra.should.eql({married:false, sad:true});
	    }).callback(done);
    })
})
