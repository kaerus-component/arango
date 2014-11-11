var arango, db;

try {
    arango = Arango
} catch (e) {
    arango = require('..')
}

describe("user", function () {

    before(function (done) {
	
	db = new arango.Connection;
	
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
		"nachname": "grimm"
	    }
	}).then( function (ret) {
	    ret.error.should.equal(false);
	    ret.code.should.equal(201);
	}).callback(done);
    })

    it('create a user', function (done) {
	
	db.user.create("greta", {
	    passwd:"passwordGreta",
	    changePassword: true,
	    extra:{
		"vorname": "greta",
		"nachname": "grimm"
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
	
	db.user.get("achtung")
	    .catch(function (err) {
		err.error.should.equal(true);
		err.code.should.equal(404);
		done();
	    });
    })

    it('delete user', function (done) {
	
	db.user.delete("greta")
	    .then(function (ret) {
		
		ret.error.should.equal(false);
		ret.code.should.equal(202);
	    }).callback(done);
    })
    it('delete non existing user', function (done) {
	
	db.user.delete("achtung")
	    .catch(function (err) {
		err.error.should.equal(true);
		err.code.should.equal(404);
		done();
	    });
    })

    it('patch non existing user', function (done) {
	
	db.user.patch("greta", {passwd:"newPassword"})
	    .catch(function (err) {
		err.error.should.equal(true);
		err.code.should.equal(404);
		done();
	    });
    })
    
    it('patch user', function (done) {
	
	db.user.patch("hans",{
	    passwd: "newpassword",
	    changePassword: false,
	    extra:{
		"nachname": "otto-müller",
		"married": true
	    }
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
	
	db.user.put("greta", {passwd:"newpassword"})
	    .catch(function (err) {
		err.error.should.equal(true);
		err.code.should.equal(404);
		done();
	    });
    })
    
    it('put user', function (done) {
	var extra = {
	    "married": false,
	    "sad": true
	};
	
	db.user.put("hans", {
	    passwd:"newPassword",
	    changePassword:false,
	    extra: extra 
	}).then( function (ret) {
	    ret.error.should.equal(false);
	    ret.code.should.equal(200);
	    ret.extra.should.eql(extra);
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
