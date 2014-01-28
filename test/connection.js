try{ arango = require('arango') } catch (e){ arango = require('..') }

describe("Connection",function(){
	it('should have a Connection method',function(){
		arango.should.have.ownProperty('Connection');
	})

	it('should have default connection to http://127.0.0.1:8529',function(){
		var db = new arango.Connection;
		
		db.should.have.property('_server');
		
		db._server.should.eql({protocol:"http",hostname:"127.0.0.1",port:8529});
	})

	it('should be able to parse a Connection string',function(){
		var db = new arango.Connection("https://user:pass@hostname:8529/database");
       	var headers = {authorization:'Basic ' + arango.base64.encode(db._server.username + ':' + db._server.password) };

		db._server.should.eql({
			protocol:'https',
			username:'user',
			password:'pass',
			hostname:'hostname',
			port:8529,
			headers: headers
		})

		db._name.should.eql('database');
		
	})


	it('should be able to parse a Connection object',function(){
		db = new arango.Connection({_name:"database",_server:{hostname:"test.host"}});
		db._server.should.eql({
			protocol:'http',
			hostname:'test.host',
			port:8529
		})
		db._name.should.eql("database");
	})

	it('should be able to parse a Connection string with object',function(){
		db = new arango.Connection("https://username:password@test.com",
			{_name:"database"}
		);

		var headers = {authorization:'Basic ' + arango.base64.encode('username' + ':' + 'password') };

		db._server.should.eql({
			protocol:'https',
			hostname:'test.com',
			username:'username',
			password:'password',
			headers: headers,
			port:8529
		})
		db._name.should.eql("database");
	})

	it('should be able to parse a Connection string with object containing username password',function(){
		db = new arango.Connection("https://test.com",
			{_server:{username:"username", password:"password"}}
		);

		var headers = {authorization:'Basic ' + arango.base64.encode('username' + ':' + 'password') };

		db._server.should.eql({
			protocol:'https',
			hostname:'test.com',
			username:'username',
			password:'password',
			headers: headers,
			port:8529
		})
	})
})
