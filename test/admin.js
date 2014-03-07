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
        //console.log(e);
        done(e)
    }
}


describe("admin", function() {
    if (typeof window !== "undefined") {
        port = window.port;
    } else {
        port = require('./port.js');
        port = port.port;
    }

    var db = arango.Connection("http://127.0.0.1:"+port);

    it('should be able to get the arango version', function(done) {
        this.timeout(50000);
        db.admin.version(true, function(err, ret) {
            check(done, function() {
                ret.should.have.property('server');
                ret.should.have.property('version');
                ret.should.have.property('details');
            });
        });
    })
    it('should be able to get the server role', function(done) {
        this.timeout(50000);
        db.admin.role(function(err, ret, message) {
            check(done, function() {
                ret.should.have.property('role');
            });
        });
    })
    it('should be able to get the arango dbs statistics', function(done) {
        this.timeout(50000);
        db.admin.statistics(function(err, ret) {
            check(done, function() {
                ret.should.have.property('system');
                ret.should.have.property('client');
                ret.should.have.property('http');
                ret.error.should.equal(false);
                ret.code.should.equal(200);
            });
        });
    })
    it('should be able to get the arango dbs statistics description', function(done) {
        this.timeout(50000);
        db.admin.statisticsDescription(function(err, ret) {
            check(done, function() {
                ret.should.have.property('groups');
                ret.should.have.property('figures');
                ret.error.should.equal(false);
                ret.code.should.equal(200);
            });
        });
    })

    it('should be able to get the arango dbs routesReload', function(done) {
        this.timeout(50000);
        db.admin.routesReload(function(err, ret) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.code.should.equal(200);
            });
        });
    })
    it('should be able to flush the arango dbs modules', function(done) {
        this.timeout(50000);
        db.admin.modulesFlush(function(err, ret) {
            check(done, function() {
                ret.error.should.equal(false);
                ret.code.should.equal(200);
            });
        });
    });
    it('should be able to get the arango dbs time', function(done) {
        this.timeout(50000);
        db.admin.time(function(err, ret) {
            check(done, function() {
                ret.should.have.property('time');
                ret.error.should.equal(false);
                ret.code.should.equal(200);
            });
        });
    })
    it('should be able to get an echo from the arango db', function(done) {
        this.timeout(50000);
        db.admin.echo('GET', null, null, null, function(err, ret) {
            check(done, function() {
                ret.should.have.property('user');
                ret.should.have.property('database');
                ret.should.have.property('protocol');
            });
        });
    })
    it('should be able to get logs from the arango db without options', function(done) {
        this.timeout(50000);
        db.admin.log(null, function(err, ret) {
            check(done, function() {
                ret.should.have.property('totalAmount');
                ret.should.have.property('timestamp');
                ret.should.have.property('text');
                ret.should.have.property('lid');
                ret.should.have.property('level');
            });
        });
    })
    it('should be able to get logs from the arango db with full option set', function(done) {
        this.timeout(50000);
        var options = {};
        options.upto = "debug";
        options.size = 15;
        options.offset = 10;
        options.sort = "desc";
        db.admin.log(options, function(err, ret) {
            check(done, function() {
                ret.should.have.property('totalAmount');
                ret.should.have.property('timestamp');
                ret.should.have.property('text');
                ret.should.have.property('lid');
                ret.should.have.property('level');
            });
        });
    })
    it('should return a 400 as we pass a bad log level to logs', function(done) {

        this.timeout(50000);
        var options = {};
        options.upto = "badlevel";
        options.size = 15;
        options.offset = 10;
        options.sort = "desc";
        db.admin.log(options, function(err, ret) {
            check(done, function() {
                ret.error.should.equal(true);
                ret.code.should.equal(400);
            });
        });
    })
})
