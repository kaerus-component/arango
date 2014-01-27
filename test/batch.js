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


describe("batch",function(){
	var db = new arango.Connection("http://127.0.0.1:8529");
    this.timeout(5000);
    // init batch mode
    var batch = db.batch.start();

    // 2 good calls
    batch.db.aqlfunction.create("myotherfunctions::temperature::celsiustofahrenheit2",
            "function (celsius) { return celsius * 2.8 + 32; }" , null);
    batch.db.aqlfunction.get(null);

    // 1 bad call
    var options = {};
    options.upto = "badlevel";
    db.admin.log(options);

    // end batch mode
    batch.db.batch.end();

    // now we execute
    it('should exec bacth mode',function(done){
        db.batch.exec("boundary", function(err,ret, message){
            check( done, function () {
                message.statusCode.should.equal(200);
            } );
        });
    })



})