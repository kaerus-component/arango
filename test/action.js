var arango, db, actions;
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

var db, actions;

describe("action", function() {

    before(function(done) {
        this.timeout(50000);
        if (typeof window !== "undefined") {
            port = window.port;
        } else {
            port = require('./port.js');
            port = port.port;
        }
        db = arango.Connection("http://127.0.0.1:" + port);
        db.use(":_routing").simple.removeByExample({
            "url": {
                "match": "/alreadyExistingRoute",
                "methods": ["POST"]
            }
        }, function(err, ret, message) {
            db.use(":_routing").simple.removeByExample({
                "url": {
                    "match": "/hello",
                    "methods": ["GET"]
                }
            }, function(err, ret, message) {
                // write a new route directly into arango
                var route = {
                    action: {
                        "callback": "function (req,res){\n \n res.status = 200;\n; res.contentType" +
                            " = \"text/html\";\n var data = JSON.parse(req.requestBody);\n res.body = data.firstname + ' ' + data.lastname;\n }"
                    }
                }
                route.url = {
                    "match": "/alreadyExistingRoute",
                    "methods": ["POST"]
                };
                db.use(":_routing").document.create(route, {
                    waitForSync: true
                })
                    .then(db.admin.routesReload)
                    .then(function(r) {
                        return db.action.define({
                            name: "hello",
                            url: "/hello"
                        }, function(req, res) {
                            /* Note: this code runs in the ArangoDB */
                            res.status = 200;
                            res.contentType = "text/html";
                            res.body = "Hello World!";
                        }, true);
                    }).done(done);
            });
        });
    })

    it('define an action for which no route exists', function(done) {
        this.timeout(50000);
        db.action.define({
            name: 'someAction',
            url: 'http://127.0.0.1:'+port+'/test',
            method: 'post',
            result: function(res) {
                return res;
            },
            error: function(err) {
                return err;
            }
        })
        check(done, function() {
            db.action.getActions().should.have.property('someAction');
        });
    })


    it('call this action and expect a route not found error', function(done) {
        this.timeout(50000);
        db.action.submit("someAction", function(err, ret) {
            check(done, function() {
                ret.code.should.eql(404);
                ret.error.should.eql(true);
            });
        });

    })

    it('delete this action', function(done) {
        this.timeout(50000);
        db.action.undefine("someAction");
        check(done, function() {
            db.action.getActions().should.not.have.property('someAction');
        });
    })

    it('define an action for which a route exists', function(done) {
        this.timeout(50000);
        db.action.define({
            name: 'someAction',
            url: 'http://127.0.0.1:'+port+'/alreadyExistingRoute',
            method: 'POST',
            result: function(res) {
                return res;
            },
            error: function(err) {
                return err;
            }
        })
        check(done, function() {
            db.action.getActions().should.have.property('someAction');
        });

    })

    it('lets get the list of all documents of collection', function(done) {
        this.timeout(50000);
        db.document.list("_routing", function(err, ret, message) {
            check(done, function() {
                message.status.should.equal(200);
            });
        });
    })


    it('lets wait until action is reachable', function(done) {
        this.timeout(50000);
        function callDb(done) {
            db.action.submit("someAction",{
                firstname: "heinz",
                lastname: "hoenig"
            },  function(err, ret, message) {
                if (message.status !== 200) {
                    callDb(done);
                    return;
                }
                done();

            });
        }
        callDb(done);
    })
    it('call this action and expect the route to be found', function(done) {
        this.timeout(50000);
        db.action.submit("someAction", {
            firstname: "heinz",
            lastname: "hoenig"
        }, function(err, ret, message) {
            check(done, function() {
                ret.should.eql("heinz hoenig");
                message.status.should.eql(200);
            });
        });

    })

    it('lets get the list of all documents of collection', function(done) {
        this.timeout(50000);
        db.document.list("_routing", function(err, ret, message) {
            check(done, function() {
                message.status.should.equal(200);
            });
        });
    })

    it('lets wait until action is reachable', function(done) {
        this.timeout(50000);
        function callDb(done) {
            db.action.submit("hello", function(err, ret, message) {
                if (message.status !== 200) {
                    callDb(done);
                    return;
                }
                done();

            });
        }
        callDb(done);

    })
    it('call the action defined in setup action and expect the route to be found', function(done) {
        this.timeout(50000);
        db.action.submit("hello", function(err, ret, message) {
            check(done, function() {
                ret.should.eql("Hello World!");
                message.status.should.eql(200);
                Object.keys(db.action.getActions()).length.should.eql(2);
                actions = db.action.getActions();
            });
        });

    })

    it('lets get the list of all documents of collection', function(done) {
        this.timeout(50000);
        db.document.list("_routing", function(err, ret, message) {
            check(done, function() {
                message.status.should.equal(200);
            });
        });
    })

    it('delete the action "hello".....', function(done) {
        this.timeout(50000);
        db.action.undefine("hello");
        check(done, function() {
            db.action.getActions().should.not.have.property('hello');
            Object.keys(db.action.getActions()).length.should.eql(1);
        });
    })

    it('lets get the list of all documents of collection', function(done) {
        this.timeout(50000);
        db.document.list("_routing", function(err, ret, message) {
            check(done, function() {
                message.status.should.equal(200);
            });
        });
    })

    it('lets get the list of all documents of collection', function(done) {
        this.timeout(50000);
        db.document.list("_routing", function(err, ret, message) {
            check(done, function() {
                message.status.should.equal(200);
            });
        });
    })

    it('...and check that route has been deleted to', function(done) {
        this.timeout(50000);
        db.document.get(actions.hello.route, function(err, ret, message) {
            check(done, function() {
                ret.error.should.equal(true);
                message.status.should.equal(404);
            });
        });
    })

})
