try{ arango = require('arango') } catch (e){ arango = require('..') }

describe("Connection",function(){
	it('should have a Connection method',function(){
		arango.should.have.ownProperty('Connection');
	})

	it('should have default server settings',function(){
		var db = new arango.Connection;
		db.should.have.property('server');
		db.server.should.eql({protocol:"http",hostname:"127.0.0.1",port:8529});
	})

	it('should be able to parse a Connection string',function(){
		var db = new arango.Connection("https://user:pass@hostname:8529/collection");

		var headers = {authorization:'Basic ' + arango.base64.encode(db.server.username + ':' + db.server.password) };

		db.server.should.eql({
			protocol:'https',
			username:'user',
			password:'pass',
			hostname:'hostname',
			port:8529,
			headers: headers
		})	
	})
})
