try{ arango = require('arango') } catch (e){ arango = require('..') }


describe("collection",function(){
	var db = new arango.Connection("http://127.0.0.1:8529");
	
	describe("list",function(){	
		it('should be able to list collections',function(done){
			db.collection.list().then(function(res){
				done();
			},function(e){ throw e });
		})
	})

	describe("create",function(){
		var collection = "test1";

		afterEach(function(done){
			db.collection.delete(collection).then(function(res){
				done();
			},function(e){ throw e });
		})

		it('should be able to create collection',function(done){
			db.collection.create(collection).then(function(res){
				done();
			},function(e){ throw e });
		})
	})

	describe("delete",function(){
		var collection = "test2";

		beforeEach(function(done){
			db.collection.create(collection).then(function(res){
				done();
			},function(e){ throw e });
		})

		it('should be able to delete collection',function(done){
			db.collection.delete(collection).then(function(res){
				done();
			},function(e){ throw e });
		})
	})	
})
