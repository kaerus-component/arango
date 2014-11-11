var arango;

try {
    arango = Arango
} catch (e) {
    arango = require('..')
}

describe("action", function () {
    var db, actions;

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

    
    before(function (done) {
	
	db = arango.Connection(":_routing");

	db.batch.start();
	
	db.simple.removeByExample({
	    "url": {
		"match": "/alreadyExistingRoute",
		"methods": ["POST"]
	    }
	});
	
	db.simple.removeByExample({
	    "url": {
		"match": "/hello",
		"methods": ["GET"]
	    }
	});
	
	db.batch.exec().end(function(){
	    // write a new route directly into arango
	    db.document.create(route, {
		waitForSync: true
	    }).then(db.admin.routesReload)
		.then(function (r) {
		    return db.action.define({
			name: "hello",
			url: "/hello"
		    }, function (req, res) {
			/* Note: this code runs in the ArangoDB */
			res.status = 200;
			res.contentType = "text/html";
			res.body = "Hello World!";
		    }, true);
		}).callback(done);
	});
    });


    it('define an action for which no route exists', function (done) {
	
	db.action.define({
	    name: 'someAction',
	    url: 'http://127.0.0.1:8529/test',
	    method: 'post'
	}).then(function(ret){
	    db.action.getActions().should.have.property('someAction');
	}).callback(done);
    })


    it('call this action and expect a route not found error', function (done) {
	
	db.action.submit("someAction").catch( function(ret) {
	    ret.code.should.eql(404);
	    ret.error.should.eql(true);
	    done();
	});

    })

    it('delete this action', function (done) {
	
	db.action.undefine("someAction")
	    .then(function(ret){
		db.action.getActions().should.not.have.property('someAction');
	    }).callback(done);
    })

    // Expected result ?
    it('define an action for which a route exists', function (done) {
	
	db.action.define({
	    name: 'someAction',
	    url: 'http://127.0.0.1:8529/alreadyExistingRoute',
	    method: 'POST'
	}).then(function(ret){
	    db.action.getActions().should.have.property('someAction');    
	}).callback(done);

    })

    it('call this action and expect the route to be found', function (done) {
	
	db.action.submit("someAction", {
	    firstname: "heinz",
	    lastname: "hoenig"
	}).then(function (ret) {
	    ret.should.eql("heinz hoenig");
	}).callback(done);

    })

    it('call the action defined in setup action and expect the route to be found', function (done) {
	
	db.action.submit("hello").then(function (ret) {
	    ret.should.eql("Hello World!");
	    Object.keys(db.action.getActions()).length.should.eql(2);
	    actions = db.action.getActions();
	}).callback(done);

    })

    it('delete the action "hello".....', function (done) {
	
	db.action.undefine("hello")
	    .then(function(ret){
		db.action.getActions().should.not.have.property('hello');
		Object.keys(db.action.getActions()).length.should.eql(1);
	    }).callback(done);
    })

    it('...and check that route has been deleted to', function (done) {
	
	db.document.get(actions.hello.route).catch(function(error){
	    error.code.should.equal(404);
	    done();
	});
    })

})
