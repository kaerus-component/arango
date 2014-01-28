try{ arango = require('arango') } catch (e){ arango = require('..') }

function check( done, f ) {
    try {
        f()
        done()
    } catch( e ) {
        console.log(e);
        done( e )
    }
}

var db;

describe("collection",function(){

    db = new arango.Connection("http://127.0.0.1:8529");

    before(function(done){
        this.timeout(20000);
        db.database.delete("newDatabase",function(err, ret){
            db.database.create("newDatabase",function(err, ret){
                db = new arango.Connection({_name:"newDatabase",_server:{hostname:"localhost"}});
                done();
            });
        });

    })

    describe("collection Functions",function(){
	    /*describe("create",function(){
		var collection = "test1", 
			options = {
					journalSize: 12345678,
					waitForSync: true,
					keyOptions: { 
						type: "autoincrement",
						offset: 0, 
						increment: 5, 
						allowUserKeys: true 
					}
			};
*/

		it('should be able to create a collection by name',function(done){
			db.collection.create(collection,function(err,ret){
				ret.isSystem.should.eql(false);
				ret.status.should.eql(3);
				ret.type.should.eql(2);
				ret.isVolatile.should.eql(false);
				ret.error.should.eql(false);
				done(err?jerr(ret):err);
			});
		})


})


