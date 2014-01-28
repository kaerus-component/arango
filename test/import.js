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

describe("import",function(){


    before(function(done){
        this.timeout(20000);
        db = new arango.Connection("http://127.0.0.1:8529");
        db.database.delete("newDatabase",function(err, ret){
            db.database.create("newDatabase",function(err, ret){
                db = new arango.Connection({_name:"newDatabase",_server:{hostname:"localhost"}});
                db.collection.create("collection", null, function(err,ret){
                    done();
                });
            });
        });

    })

    describe("importFunctions",function(){

        beforeEach(function(done){
            db.collection.create("collection", function(err,ret){done();});
        })

        afterEach(function(done){
            db.collection.delete("collection", function(err,ret){
                db.collection.delete("newCollection", function(err,ret){
                    done();
                });
            })
        })


        it('importJSONData with single JSON Object and waitForSync',function(done){

            var options = {"waitForSync" : true, "details" : true};

            var data = [{"_key":"abc","value1":25,"value2":"test","allowed":true},{"_key":"foo","name":"baz"},
                {"name":{"detailed":"detailed name","short":"short name"}}];


            db.import.importJSONData("collection", data, options, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(false);
                    ret.created.should.equal(3);
                    message.statusCode.should.equal(201);
                } );
            });
        })
        it('importJSONData with single JSON Object into unknown collection',function(done){

            var options = {"waitForSync" : true, "details" : true};

            var data = [{"_key":"abc","value1":25,"value2":"test","allowed":true},{"_key":"abcd","name":"baz"},
                {"name":{"detailed":"detailed name","short":"short name"}}];


            db.import.importJSONData("newCollection", data, options, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(true);
                    message.statusCode.should.equal(404);
                } );
            });
        })
        it('importJSONData with single JSON Object, with one error, we create the collection as well',function(done){

            var options = {"waitForSync" : true, "details" : true, "createCollection" : true};

            var data = [{"_key":"abc","value1":25,"value2":"test","allowed":true},{"_key":"abc","name":"baz"},
                {"name":{"detailed":"detailed name","short":"short name"}}];


            db.import.importJSONData("newCollection", data, options, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(false);
                    ret.errors.should.equal(1);
                    ret.created.should.equal(2);
                    message.statusCode.should.equal(201);
                } );
            });
        })
        it('importJSONData with single JSON Object and complete. Provoke a unique constraint violation and expect a 409',function(done){

            var options = {"waitForSync" : true, "details" : true, "complete" : true};

            var data = [{"_key":"abc","value1":25,"value2":"test","allowed":true},{"_key":"abc","name":"baz"},
                {"name":{"detailed":"detailed name","short":"short name"}}];


            db.import.importJSONData("collection", data, options, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(true);
                    message.statusCode.should.equal(409);
                } );
            });
        })


        it('importValueList with single JSON Object and waitForSync',function(done){

            var options = {"waitForSync" : true, "details" : true};

            var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abc", 25, "test" ]\n[ "abcd", 253, "stest" ]';


            db.import.importValueList("collection", data, options, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(false);
                    ret.created.should.equal(2);
                    ret.empty.should.equal(2);
                    message.statusCode.should.equal(201);
                } );
            });
        })
        it('importValueList with single JSON Object into unknown collection',function(done){

            var options = {"waitForSync" : true, "details" : true};

            var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abc", 25, "test" ]\n[ "aabcd", 253, "stest" ]';



            db.import.importValueList("newCollection", data, options, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(true);
                    message.statusCode.should.equal(404);
                } );
            });
        })
        it('importValueList with single JSON Object, with one error, we create the collection as well',function(done){

            var options = {"waitForSync" : true, "details" : true, "createCollection" : true};

            var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abcd", 25, "test" ]\n[ "abcd", 253, "stest" ]';


            db.import.importValueList("newCollection", data, options, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(false);
                    ret.errors.should.equal(1);
                    ret.created.should.equal(1);
                    message.statusCode.should.equal(201);
                } );
            });
        })
        it('importValueList with single JSON Object and complete. Provoke a unique constraint violation and expect a 409',function(done){

            var options = {"waitForSync" : true, "details" : true, "complete" : true};

            var data = '[ "_key", "value1", "value2" ]\n\n\n[ "abc", 25, "test" ]\n[ "abc", 253, "stest" ]';

            db.import.importValueList("collection", data, options, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(true);
                    message.statusCode.should.equal(409);
                } );
            });
        })


    })
})
