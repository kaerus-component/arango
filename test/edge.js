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

var verticescollection;
var edgecollection;
var edge;
var vertices = [];
var db;

describe("edge",function(){

    db = new arango.Connection("http://127.0.0.1:8529");

    before(function(done){
        this.timeout(20000);
        db.database.delete("newDatabase",function(err, ret){
            db.database.create("newDatabase",function(err, ret){
                db = new arango.Connection({_name:"newDatabase",_server:{hostname:"localhost"}});
                db.collection.create("edgeCollection", {"type" : 3}, function(err,ret){
                    edgecollection = ret;
                    db.collection.create("verticescollection", null, function(err,ret){
                        verticescollection = ret;
                        db.document.create(verticescollection.id, {"key1" : "val1", "key2" : "val2", "key3" : null}, null, function(err,ret, message){
                            ret.error.should.equal(false);
                            vertices.push(ret);
                            db.document.create(verticescollection.id, {"key1" : "val2", "key2" : "val3", "key3" : "val4"}, null, function(err,ret, message){
                                ret.error.should.equal(false);
                                vertices.push(ret);
                                db.document.create(verticescollection.id, {"key4" : "val2", "key5" : "val3", "key6" : "val4"}, null, function(err,ret, message){
                                    ret.error.should.equal(false);
                                    vertices.push(ret);
                                    done()
                                });
                            });
                        });
                    });
                });
            });
        });

    })

    describe("edgeFunctions",function(){

        it('create a edge',function(done){
            db.edge.create(edgecollection.id,vertices[0]._id, vertices[1]._id, {"key1" : "val1", "key2" : "val2", "key3" : null}, null, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(false);
                    edge = ret;
                    message.statusCode.should.equal(202);
                } );
            });
        })
        it('create another edge',function(done){
            db.edge.create(edgecollection.id, vertices[1]._id, vertices[2]._id, {"key1" : "val1", "key3" : "val3"}, null, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(false);
                    message.statusCode.should.equal(202);
                } );
            });
        })
        it('create another edge and the collection along with it', function(done){
            var options = {};
            options.createCollection = true;
            options.waitForSync = true;
            db.edge.create("anotherCollection", vertices[0]._id, vertices[1]._id, {"key1" : "val1", "key2" : "val2"}, options, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(false);
                    message.statusCode.should.equal(201);
                } );
            });
        })

        it('lets get a non existing edge"', function(done){
            db.edge.get(edge._id + 200, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(true);
                    message.statusCode.should.equal(404);
                } );
            });
        })
        it('lets get a edge with "match" header == false and correct revision"', function(done){
            var options = {};
            options.match = false;
            options.rev = edge._rev;
            db.edge.get(edge._id, options, function(err,ret, message){
                check( done, function () {
                    message.statusCode.should.equal(304);
                } );
            });
        })
        it('lets get a edge with "match" header == false and wrong revision"', function(done){
            var options = {};
            options.match = false;
            options.rev = edge._rev + 1;
            db.edge.get(edge._id, options, function(err,ret, message){
                check( done, function () {
                    message.statusCode.should.equal(200);
                } );
            });
        })
        it('lets get a edge with "match" header and correct revision"', function(done){
            var options = {};
            options.match = true;
            options.rev = edge._rev;
            db.edge.get(edge._id, options, function(err,ret, message){
                check( done, function () {
                    message.statusCode.should.equal(200);
                } );
            });
        })
        it('lets get a edge with "match" header and wrong revision', function(done){
            var options = {};
            options.match = true;
            options.rev = edge._rev + 1;
            db.edge.get(edge._id, options, function(err,ret, message){
                check( done, function () {
                    message.statusCode.should.equal(412);
                } );
            });
        })
        it('lets get a non existing edges head"', function(done){
            db.edge.head(edge._id + 200, function(err,ret, message){
                check( done, function () {
                    message.statusCode.should.equal(404);
                } );
            });
        })
        it('lets get a edges head with "match" header == false and correct revision"', function(done){
            var options = {};
            options.match = false;
            options.rev = edge._rev;
            db.edge.head(edge._id, options, function(err,ret, message){
                check( done, function () {
                    message.statusCode.should.equal(304);
                } );
            });
        })
        it('lets get a edges head with "match" header == false and wrong revision"', function(done){
            var options = {};
            options.match = false;
            options.rev = edge._rev + 1;
            db.edge.head(edge._id, options, function(err,ret, message){
                check( done, function () {
                    message.statusCode.should.equal(200);
                } );
            });
        })
        it('lets get a edges head with "match" header and correct revision"', function(done){
            var options = {};
            options.match = true;
            options.rev = edge._rev;
            db.edge.head(edge._id, options, function(err,ret, message){
                check( done, function () {
                    message.statusCode.should.equal(200);
                } );
            });
        })
        it('lets get a edges head with "match" header and wrong revision', function(done){
            var options = {};
            options.match = true;
            options.rev = edge._rev + 1;
            db.edge.head(edge._id, options, function(err,ret, message){
                check( done, function () {
                    message.statusCode.should.equal(412);
                } );
            });
        })
        it('lets get the list of all edges of collection ending in vertices[1], should be 1', function(done){
            db.edge.list(edgecollection.id, vertices[1]._id, "in", function(err,ret, message){
                check( done, function () {
                    ret.edges.length.should.equal(1);
                    message.statusCode.should.equal(200);
                } );
            });
        })

        it('lets get the list of all edges of collection starting in vertices[1], should be 1', function(done){
            db.edge.list(edgecollection.id, vertices[1]._id, "out", function(err,ret, message){
                check( done, function () {
                    ret.edges.length.should.equal(1);
                    message.statusCode.should.equal(200);
                } );
            });
        })

        it('lets get the list of all edges of collection, starting or ending in vertices[1] should be 2', function(done){
            db.edge.list(edgecollection.id, vertices[1]._id, "any" ,function(err,ret, message){
                check( done, function () {
                    ret.edges.length.should.equal(2);
                    message.statusCode.should.equal(200);
                } );
            });
        })


        it('lets patch a non existing edge"', function(done){
            var data = {"newKey" : "newValue"};
            db.edge.patch(edge._id + 200, data, null, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(true);
                    message.statusCode.should.equal(404);
                } );
            });
        })
        it('lets patch a edge with "match" header == false and wrong revision"', function(done){
            var data = {"newKey" : "newValue"};
            var options = {};
            options.match = false;
            options.rev = edge._rev + 1;
            db.edge.patch(edge._id, data , options, function(err,ret, message){
                check( done, function () {
                    edge._rev = ret._rev;
                    message.statusCode.should.equal(202);
                } );
            });
        })
       it('lets patch a edge with "match" header and correct revision and the waitForSync param"', function(done){
            var data = {"newKey" : "newValue"};
            var options = {};
            options.match = true;
            options.waitForSync = true;
            options.rev = edge._rev;
            db.edge.patch(edge._id, data, options, function(err,ret, message){
                check( done, function () {
                    edge._rev = ret._rev;
                    message.statusCode.should.equal(201);
                } );
            });
        })
        it('lets patch a edge with "match" header and wrong revision', function(done){
            var data = {"newKey" : "newValue"};
            var options = {};
            options.match = true;
            options.rev = edge._rev + 1;
            db.edge.patch(edge._id, data, options, function(err,ret, message){
                check( done, function () {
                    message.statusCode.should.equal(412);
                } );
            });
        })
        it('lets patch a edge with "match" header and wrong revision but forceUpdate flag. And we do not keep null values', function(done){
            this.timeout(20000)
            var data = {"newKey" : "newValue", "key3" : null};
            var options = {};
            options.match = true;
            options.rev = edge._rev + 1;
            options.forceUpdate = true;
            options.waitForSync = true;
            options.keepNull = "false";
            db.edge.patch(edge._id, data, options, function(err,ret, message){
                check( done, function () {

                    message.statusCode.should.equal(201);
                } );
            });
        })

        it('lets verify the last patch', function(done){
            db.edge.get(edge._id, null, function(err,ret, message){
                check( done, function () {
                    ret.should.not.have.property("key3");
                    ret.should.have.property("newKey");
                } );
            });
        })

        it('lets put a non existing edge"', function(done){
            var data = {"newKey" : "newValue"};
            db.edge.put(edge._id + 200, data, null, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(true);
                    message.statusCode.should.equal(404);
                } );
            });
        })
        it('lets put a edge with "match" header == false and wrong revision"', function(done){
            var data = {"newKey" : "newValue"};
            var options = {};
            options.match = false;
            options.rev = edge._rev + 1;
            db.edge.put(edge._id, data , options, function(err,ret, message){
                check( done, function () {
                    edge._rev = ret._rev;
                    message.statusCode.should.equal(202);
                } );
            });
        })
        it('lets put a edge with "match" header and correct revision and the waitForSync param"', function(done){
            var data = {"newKey" : "newValue"};
            var options = {};
            options.match = true;
            options.waitForSync = true;
            options.rev = edge._rev;
            db.edge.put(edge._id, data, options, function(err,ret, message){
                check( done, function () {
                    edge._rev = ret._rev;
                    message.statusCode.should.equal(201);
                } );
            });
        })
        it('lets put a edge with "match" header and wrong revision', function(done){
            var data = {"newKey" : "newValue"};
            var options = {};
            options.match = true;
            options.rev = edge._rev + 1;
            db.edge.put(edge._id, data, options, function(err,ret, message){
                check( done, function () {
                    message.statusCode.should.equal(412);
                } );
            });
        })
        it('lets put a edge with "match" header and wrong revision but forceUpdate flag.', function(done){
            var data = {"newKey" : "newValue"};
            var options = {};
            options.match = true;
            options.rev = edge._rev + 1;
            options.forceUpdate = true;
            db.edge.put(edge._id, data, options, function(err,ret, message){
                check( done, function () {
                    message.statusCode.should.equal(202);

                } );
            });
        })
        it('lets verify the last put', function(done){
            db.edge.get(edge._id, null, function(err,ret, message){
                check( done, function () {
                    ret.should.not.have.property("key3");
                    ret.should.not.have.property("key2");
                    ret.should.not.have.property("key1");
                    ret.should.have.property("newKey");
                } );
            });
        })

        it('lets delete a non existing edge"', function(done){
            db.edge.delete(edge._id + 200, null, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(true);
                    message.statusCode.should.equal(404);
                } );
            });
        })
        it('lets delete a edge with "match" header and wrong revision', function(done){
            var options = {};
            options.match = true;
            options.rev = edge._rev + 1;
            db.edge.delete(edge._id,  options, function(err,ret, message){
                check( done, function () {
                    message.statusCode.should.equal(412);
                } );
            });
        })

        it('lets delete a edge with "match" header == false and wrong revision"', function(done){
            var options = {};
            options.match = false;
            options.rev = edge._rev + 1;
            db.edge.delete(edge._id, options, function(err,ret, message){
                check( done, function () {
                    edge._rev = ret._rev;
                    message.statusCode.should.equal(202);
                } );
            });
        })
        it('create a edge',function(done){
            db.edge.create(edgecollection.id,vertices[0]._id, vertices[1]._id, {"key1" : "val1", "key2" : "val2", "key3" : null}, null, function(err,ret, message){
                check( done, function () {
                    ret.error.should.equal(false);
                    edge = ret;
                    message.statusCode.should.equal(202);
                } );
            });
        })
        it('lets delete a edge with "match" header and correct revision and the waitForSync param"', function(done){
            var options = {};
            options.match = true;
            options.waitForSync = true;
            options.rev = edge._rev;
            db.edge.delete(edge._id, options, function(err,ret, message){
                check( done, function () {
                    edge._rev = ret._rev;
                    message.statusCode.should.equal(200);
                } );
            });
        })
    })
})
