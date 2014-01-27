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


describe("aqlfunction",function(){
	var db = new arango.Connection("http://127.0.0.1:8529");

    it('should be able to create an aql function',function(done){
        db.aqlfunction.create("myfunctions::temperature::celsiustofahrenheit",
            "function (celsius) { return celsius * 1.8 + 32; }" , null,function(err,ret){
            check( done, function () {
                ret.error.should.equal(false);
            } );
        });
    })
    it('should be able to create another aql function',function(done){
        db.aqlfunction.create("myfunctions::temperature::celsiustofahrenheit2",
            "function (celsius) { return celsius * 2.8 + 32; }" , null,function(err,ret){
                check( done, function () {
                    ret.error.should.equal(false);
                } );
        });
    })
    it('should be able to create another aql function, different namespace',function(done){
        db.aqlfunction.create("myotherfunctions::temperature::celsiustofahrenheit2",
            "function (celsius) { return celsius * 2.8 + 32; }" , null,function(err,ret){
                check( done, function () {
                    ret.error.should.equal(false);
                } );
            });
    })
    it('should be able to get all aql function',function(done){
        db.aqlfunction.get(null,function(err,ret){
                check( done, function () {
                    ret.length.should.equal(3);
                } );
            });
    })
    it('should be able to get all aql functions in one namespace',function(done){
        db.aqlfunction.get("myfunctions",function(err,ret){
            check( done, function () {
                ret.length.should.equal(2);
            } );
        });
    })
    it('should delete all aql functions in one namespace',function(done){
        db.aqlfunction.delete("myfunctions", true ,function(err,ret){
            check( done, function () {
                ret.error.should.equal(false);
                ret.code.should.equal(200);
            } );
        });
    })
    it('should be able to get all aql function, one should be left',function(done){
        db.aqlfunction.get(null,function(err,ret){
            check( done, function () {
                ret.length.should.equal(1);
            } );
        });
    })
    it('should delete a aql function ny its name',function(done){
        db.aqlfunction.delete("myotherfunctions", true ,function(err,ret){
            check( done, function () {
                ret.error.should.equal(false);
                ret.code.should.equal(200);
            } );
        });
    })
    it('should be able to get all aql function, none should be left',function(done){
        db.aqlfunction.get(null,function(err,ret){
            check( done, function () {
                ret.length.should.equal(0);
            } );
        });
    })
})
