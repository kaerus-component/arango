var arango;

try {
    arango = require('arango')
} catch (e) {
    arango = require('..')
}

describe("admin", function () {
    var db;
    
    before(function(done){
	db = arango.Connection();
	done();
    });
    
    it('should be able to get the arango version', function (done) {
	db.admin.version(true).then(function (ret) {
            ret.should.have.property('server');
            ret.should.have.property('version');
            ret.should.have.property('details');
	}).callback(done);
    })
    it('should be able to get the server role', function (done) {

	db.admin.role().then(function(ret){
	    ret.should.have.property('role');
	}).callback(done);
    })
    it('should be able to get the arango dbs statistics', function (done) {

	db.admin.statistics().then(function(ret){
	    ret.should.have.property('system');
	    ret.should.have.property('client');
	    ret.should.have.property('http');
	    ret.error.should.equal(false);
	    ret.code.should.equal(200);
	}).callback(done);
    })
    it('should be able to get the arango dbs statistics description', function (done) {

	db.admin.statisticsDescription().then(function (ret) {
	    ret.should.have.property('groups');
	    ret.should.have.property('figures');
	    ret.error.should.equal(false);
	    ret.code.should.equal(200);
	}).callback(done);
    })

    it('should be able to get the arango dbs routesReload', function (done) {

	db.admin.routesReload().then(function (ret) {
	    ret.error.should.equal(false);
	    ret.code.should.equal(200);
	}).callback(done);
    })
    it('should be able to flush the arango dbs modules', function (done) {

	db.admin.modulesFlush().then(function (ret) {
	    ret.error.should.equal(false);
	    ret.code.should.equal(200);
	}).callback(done);
    });
    it('should be able to get the arango dbs time', function (done) {

	db.admin.time(function (ret) {
	    ret.should.have.property('time');
	    ret.error.should.equal(false);
	    ret.code.should.equal(200);
	}).callback(done);
    })
    it('should be able to get an echo from the arango db', function (done) {

	db.admin.echo('GET', null, null, null).then( function (ret) {
	    ret.should.have.property('user');
	    ret.should.have.property('database');
	    ret.should.have.property('protocol');
	}).callback(done);
    })
    it('should be able to get logs from the arango db without options', function (done) {

	db.admin.log(null).then(function (ret) {
	    ret.should.have.property('totalAmount');
	    ret.should.have.property('timestamp');
	    ret.should.have.property('text');
	    ret.should.have.property('lid');
	    ret.should.have.property('level');
	}).callback(done);
    })
    it('should be able to get logs from the arango db with full option set', function (done) {

	var options = {};
	options.upto = "debug";
	options.size = 15;
	options.offset = 10;
	options.sort = "desc";
	db.admin.log(options).then( function (ret) {
	    ret.should.have.property('totalAmount');
	    ret.should.have.property('timestamp');
	    ret.should.have.property('text');
	    ret.should.have.property('lid');
	    ret.should.have.property('level');
	}).callback(done);
    })
    it('should return a 400 as we pass a bad log level to logs', function (done) {

	var options = {};
	options.upto = "badlevel";
	options.size = 15;
	options.offset = 10;
	options.sort = "desc";
	db.admin.log(options).catch( function (e) {
	    
	    e.error.should.equal(true);
	    e.code.should.equal(400);
	    e.errorNum.should.equal(400);
	    done();
	});
    })
})
