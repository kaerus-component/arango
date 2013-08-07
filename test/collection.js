try{ arango = require('arango') } catch (e){ arango = require('..') }

function jerr(o){return JSON.stringify(o,null,2)}

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
		var collection = "test1", 
			options = {
					journalSize: 10000000,
					waitForSync:true,
					keyOptions: { 
						type: "autoincrement", 
						increment: 5, 
						allowUserKeys: true 
					}
			};

		beforeEach(function(done){
			db.collection.delete(collection,function(){ done() });
		})

		it('should be able to create a collection by name',function(done){
			db.collection.create(collection,function(err,ret){
				done(err?jerr(ret):err);
			});
		})

		it('should be able to pass options',function(done){
			db.collection.create(collection,options,function(err,ret){
				done(err?jerr(ret):err);
			});
		})
	})

	describe("get",function(){
		var collection = "test2";

		beforeEach(function(done){
			db.collection.create(collection,{journalSize:10000000, waitForSync:true},function(err,ret){
				done(); // may fail if there is a collection.
			});
		})

		afterEach(function(done){
			db.collection.delete(collection,function(err,ret){
				done(); // may fail if there is a collection.
			});
		})

		describe('collection.get',function(done){

			it('should be able to get by name',function(done){
				db.collection.get(collection,function(err,ret){
					done(err);
				});
			})

			it('should be able to get by id',function(done){
				db.collection.get(collection,function(err,ret){
					if(err) done(err);

					db.collection.get(ret.id,function(err,ret){
						done(err);
					});
				});
			})
		})
	})

})
