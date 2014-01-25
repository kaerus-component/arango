var arango;

try{ arango = require('arango') } catch (e){ arango = require('..') }

function jerr(o){return JSON.stringify(o,null,2)}

describe("collections",function(){
    var db = arango.Connection("http://127.0.0.1:8529");

    describe("create",function(){
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

        beforeEach(function(done){
            db.collection.delete(collection,function(){ done() });
        })

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

        it('should be able to pass options and getProperties',function(done){
            db.collection.create(collection,options,function(err,ret){
                ret.waitForSync.should.eql(options.waitForSync);
                db.collection.getProperties(ret.id,function(err,prop){
                    /* note: rounded to KB */ 
                    (prop.journalSize >> 10).should.equal(options.journalSize >> 10); 
                    prop.keyOptions.should.eql(options.keyOptions);
                    done(err?jerr(ret):err);
                })
            });
        })
    })

describe("collection",function(){
    var collection = "test2";

    beforeEach(function(done){
        db.collection.create(collection,{journalSize:10000000, waitForSync:true},function(err,ret){
            done(err?jerr(ret):err); 
        });
    })

    afterEach(function(done){
        db.collection.delete(collection,function(err,ret){
            done(err?jerr(ret):err); 
        });
    })

    describe('get',function(done){
        it('list',function(done){
            db.collection.list().then(function(res){
                done();
            },function(e){ throw e });
        })

        it('by name',function(done){
            db.collection.get(collection,function(err,ret){
                done(err);
            });
        })

        it('by id',function(done){
            db.collection.get(collection,function(err,ret){
                if(err) done(err);

                db.collection.get(ret.id,function(err,ret){
                    done(err);
                });
            });
        })

        it('revision',function(done){
            db.collection.get(collection,function(err,ret){
                if(err) done(err);

                db.collection.revision(ret.id,function(err,ret){
                    done(err);
                });
            });
        })

        it('count',function(done){
            db.collection.get(collection,function(err,ret){
                if(err) done(err);

                db.collection.count(ret.id,function(err,ret){
                    done(err);
                });
            });
        })

        it('figures',function(done){
            db.collection.get(collection,function(err,ret){
                if(err) done(err);

                db.collection.figures(ret.id,function(err,ret){
                    done(err);
                });
            });
        })

        it('properties',function(done){
            db.collection.get(collection,function(err,ret){
                if(err) done(err);

                db.collection.getProperties(ret.id,function(err,ret){
                    done(err);
                });
            });
        })
    })
})

})
